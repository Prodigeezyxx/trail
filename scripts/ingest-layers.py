"""Ingest the geospatial layers Traill Africa covers, for the 13 countries in scope.

Downloads at full fidelity into data-raw/ (gitignored), then writes render-ready
files into src/data/layers/ and a manifest the app reads. Nothing here is
fetched at runtime by the app: this is a build-time pipeline.

Every source is the one recorded in src/sources.js and verified on 21 Sep 2026.

  python scripts/ingest-layers.py                # everything
  python scripts/ingest-layers.py boundaries     # one stage
"""
import io
import json
import sys
import time
import urllib.error
import urllib.request
import zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
RAW = ROOT / "data-raw"
OUT = ROOT / "src" / "data" / "layers"
UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) TrailAfricaBuild/1.0"

# The 13 countries in scope, with the ISO3 codes the APIs expect.
COUNTRIES = [
    ("Cameroon", "CMR"), ("DR Congo", "COD"), ("Ethiopia", "ETH"),
    ("Ghana", "GHA"), ("Kenya", "KEN"), ("Mozambique", "MOZ"),
    ("Nigeria", "NGA"), ("Rwanda", "RWA"), ("Senegal", "SEN"),
    ("South Africa", "ZAF"), ("Tanzania", "TZA"), ("Uganda", "UGA"),
    ("Zambia", "ZMB"),
]
NAME_BY_ISO = {iso: name for name, iso in COUNTRIES}

REPORT = []


def log(stage, name, ok, detail=""):
    REPORT.append({"stage": stage, "name": name, "ok": ok, "detail": detail})
    print(f"  [{'ok ' if ok else 'FAIL'}] {name:52s} {detail}", flush=True)


def fetch(url, timeout=180):
    req = urllib.request.Request(url, headers={
        "User-Agent": UA,
        "Accept": "application/json, */*",
    })
    with urllib.request.urlopen(req, timeout=timeout) as r:
        return r.read()


def save_raw(name, data):
    RAW.mkdir(parents=True, exist_ok=True)
    p = RAW / name
    p.write_bytes(data)
    return p


def write_layer(name, fc, meta):
    OUT.mkdir(parents=True, exist_ok=True)
    p = OUT / f"{name}.json"
    p.write_text(json.dumps(fc, separators=(",", ":")), encoding="utf-8")
    kb = p.stat().st_size / 1024
    log("write", name, True, f"{len(fc['features'])} features, {kb:,.1f} KB")
    return {"file": f"{name}.json", "features": len(fc["features"]), "kb": round(kb, 1), **meta}


def zip_geojson(blob):
    """Pull the first GeoJSON out of a zip, whatever it is called."""
    zf = zipfile.ZipFile(io.BytesIO(blob))
    names = [n for n in zf.namelist() if n.lower().endswith((".geojson", ".json"))]
    if not names:
        raise ValueError("no geojson inside zip")
    # Prefer the largest: some bundles ship a tiny metadata file alongside.
    names.sort(key=lambda n: zf.getinfo(n).file_size, reverse=True)
    return json.loads(zf.read(names[0]).decode("utf-8", errors="replace"))


# ----------------------------------------------------------------- stages

def stage_boundaries():
    """geoBoundaries gbOpen ADM1 and ADM2 - the districts every other layer hangs off."""
    got = []
    for adm in ("ADM1", "ADM2"):
        feats = []
        for country, iso in COUNTRIES:
            try:
                meta = json.loads(fetch(f"https://www.geoboundaries.org/api/current/gbOpen/{iso}/{adm}/"))
                entry = meta[0] if isinstance(meta, list) else meta
                url = entry.get("simplifiedGeometryGeoJSON") or entry.get("gjDownloadURL")
                if not url:
                    log("boundaries", f"{iso} {adm}", False, "no download url in API response")
                    continue
                save_raw(f"geoboundaries_{iso}_{adm}.geojson", fetch(url))
                geo = json.loads((RAW / f"geoboundaries_{iso}_{adm}.geojson").read_text(encoding="utf-8"))
                for f in geo.get("features", []):
                    p = f.setdefault("properties", {})
                    p["country"] = country
                    p["iso3"] = iso
                    feats.append(f)
                log("boundaries", f"{iso} {adm}", True, f"{len(geo.get('features', []))} units")
            except Exception as e:
                log("boundaries", f"{iso} {adm}", False, str(e)[:80])
            time.sleep(0.2)
        if feats:
            got.append(write_layer(
                f"admin-{adm.lower()}",
                {"type": "FeatureCollection", "features": feats},
                {"label": f"Administrative {adm} boundaries", "source": "geoBoundaries gbOpen",
                 "licence": "Mixed open per country", "geometry": "Polygon",
                 "layers": ["services", "budget", "water", "health", "food", "land", "elections"]},
            ))
    return got


def hot_osm(kind, layer_id, label, layers, stage):
    """HOT OSM facility extracts, one zip per country on the HOT S3 bucket."""
    feats = []
    for country, iso in COUNTRIES:
        low = iso.lower()
        url = (f"https://production-raw-data-api.s3.amazonaws.com/ISO3/{iso}/{kind}/"
               f"hotosm_{low}_{kind}_osm_geojson.zip")
        try:
            blob = fetch(url)
            save_raw(f"hotosm_{low}_{kind}.zip", blob)
            geo = zip_geojson(blob)
            for f in geo.get("features", []):
                p = f.setdefault("properties", {})
                p["country"] = country
                feats.append(f)
            log(stage, f"{iso} {kind}", True, f"{len(geo.get('features', []))}")
        except urllib.error.HTTPError as e:
            log(stage, f"{iso} {kind}", False, f"HTTP {e.code}")
        except Exception as e:
            log(stage, f"{iso} {kind}", False, str(e)[:70])
        time.sleep(0.2)
    if not feats:
        return None
    return write_layer(layer_id, {"type": "FeatureCollection", "features": feats},
                       {"label": label, "source": "HOT OSM (OpenStreetMap extract on HDX)",
                        "licence": "ODbL 1.0", "geometry": "Point", "layers": layers})


def stage_facilities():
    return [
        hot_osm("health_facilities", "health-facilities", "Health facilities",
                ["health"], "facilities"),
        hot_osm("education_facilities", "education-facilities", "Schools",
                ["education"], "facilities"),
    ]


def stage_power():
    """WRI Global Power Plant Database - a CSV with lat/lon, filtered to our countries."""
    try:
        url = ("https://raw.githubusercontent.com/wri/global-power-plant-database/master/"
               "output_database/global_power_plant_database.csv")
        blob = fetch(url)
        save_raw("global_power_plant_database.csv", blob)
        import csv
        text = blob.decode("utf-8", errors="replace")
        rows = list(csv.DictReader(io.StringIO(text)))
        want = {name for name, _ in COUNTRIES}
        feats = []
        for r in rows:
            if r.get("country_long") not in want:
                continue
            try:
                lon, lat = float(r["longitude"]), float(r["latitude"])
            except (TypeError, ValueError):
                continue
            feats.append({
                "type": "Feature",
                "properties": {
                    "name": r.get("name"), "country": r.get("country_long"),
                    "primary_fuel": r.get("primary_fuel"), "capacity_mw": r.get("capacity_mw"),
                    "gppd_idnr": r.get("gppd_idnr"),
                },
                "geometry": {"type": "Point", "coordinates": [round(lon, 4), round(lat, 4)]},
            })
        log("power", "WRI GPPD", True, f"{len(rows)} rows global -> {len(feats)} in scope")
        return write_layer("power-plants", {"type": "FeatureCollection", "features": feats},
                           {"label": "Power plants", "source": "WRI Global Power Plant Database v1.3.0",
                            "licence": "CC BY 4.0", "geometry": "Point", "layers": ["energy"]})
    except Exception as e:
        log("power", "WRI GPPD", False, str(e)[:90])
        return None


def stage_markets():
    """Ethiopia market centres - a small HDX CSV/SHP pair, Ethiopia only."""
    try:
        meta = json.loads(fetch("https://data.humdata.org/api/3/action/package_show?id=ethiopia-market-centers"))
        res = meta["result"]["resources"]
        cand = [r for r in res if r["url"].lower().endswith((".csv", ".zip"))]
        if not cand:
            log("markets", "ethiopia-market-centers", False, "no csv/zip resource")
            return None
        target = next((r for r in cand if r["format"].lower() == "csv"), cand[0])
        blob = fetch(target["url"])
        save_raw("ethiopia-market-centers." + target["url"].rsplit(".", 1)[-1], blob)
        feats = []
        if target["url"].lower().endswith(".zip"):
            geo = zip_geojson(blob)
            feats = geo.get("features", [])
        else:
            import csv
            for r in csv.DictReader(io.StringIO(blob.decode("utf-8", errors="replace"))):
                lon = r.get("longitude") or r.get("lon") or r.get("x")
                lat = r.get("latitude") or r.get("lat") or r.get("y")
                if not lon or not lat:
                    continue
                feats.append({"type": "Feature",
                              "properties": {"name": r.get("name") or r.get("market_name"),
                                             "country": "Ethiopia"},
                              "geometry": {"type": "Point",
                                           "coordinates": [round(float(lon), 4), round(float(lat), 4)]}})
        for f in feats:
            f.setdefault("properties", {})["country"] = "Ethiopia"
        log("markets", "ethiopia-market-centers", True, f"{len(feats)} markets")
        return write_layer("markets", {"type": "FeatureCollection", "features": feats},
                           {"label": "Markets", "source": "Ethiopia Market Centers (HDX)",
                            "licence": "CC0 1.0", "geometry": "Point", "layers": ["food"]})
    except Exception as e:
        log("markets", "ethiopia-market-centers", False, str(e)[:90])
        return None


def stage_grid():
    """World Bank / ESMAP Africa transmission grid - clip to the footprint bbox."""
    try:
        url = ("https://datacatalogfiles.worldbank.org/ddh-published/0040465/DR0050466/"
               "africagrid20170906final.geojson")
        blob = fetch(url, timeout=600)
        save_raw("africagrid.geojson", blob)
        geo = json.loads(blob)
        feats = []
        for f in geo.get("features", []):
            coords = f.get("geometry", {}).get("coordinates") or []
            flat = json.dumps(coords)
            # Keep a segment if ANY vertex falls inside our footprint.
            keep = False
            for lon, lat in _iter_points(coords):
                if -18 <= lon <= 41 and -35 <= lat <= 15:
                    keep = True
                    break
            if keep:
                feats.append(f)
        log("grid", "ESMAP Africa grid", True, f"{len(geo['features'])} global -> {len(feats)} in footprint")
        return write_layer("grid-lines", {"type": "FeatureCollection", "features": feats},
                           {"label": "Transmission grid", "source": "World Bank / ESMAP Africa grid map",
                            "licence": "CC BY 4.0", "geometry": "LineString", "layers": ["energy"]})
    except Exception as e:
        log("grid", "ESMAP Africa grid", False, str(e)[:90])
        return None


def _iter_points(coords):
    if not coords:
        return
    if isinstance(coords[0], (int, float)):
        yield coords[0], coords[1]
        return
    for c in coords:
        yield from _iter_points(c)


STAGES = {
    "boundaries": stage_boundaries,
    "facilities": stage_facilities,
    "power": stage_power,
    "markets": stage_markets,
    "grid": stage_grid,
}


def main():
    want = sys.argv[1:] or list(STAGES)
    manifest = {"built": time.strftime("%Y-%m-%d"), "countries": [c for c, _ in COUNTRIES],
                "layers": []}
    for name in want:
        fn = STAGES.get(name)
        if not fn:
            print(f"unknown stage: {name}")
            continue
        print(f"\n=== {name} ===")
        res = fn()
        for item in (res if isinstance(res, list) else [res]):
            if item:
                manifest["layers"].append(item)

    OUT.mkdir(parents=True, exist_ok=True)
    (OUT / "manifest.json").write_text(json.dumps(manifest, indent=2), encoding="utf-8")
    (RAW / "build-report.json").write_text(json.dumps(REPORT, indent=2), encoding="utf-8")

    total_f = sum(l["features"] for l in manifest["layers"])
    total_kb = sum(l["kb"] for l in manifest["layers"])
    print(f"\n=== manifest: {len(manifest['layers'])} layers, {total_f:,} features, {total_kb/1024:.1f} MB rendered ===")
    fails = [r for r in REPORT if not r["ok"]]
    print(f"failures: {len(fails)}")
    for f in fails[:20]:
        print(f"  {f['stage']:12s} {f['name']:46s} {f['detail']}")


if __name__ == "__main__":
    main()
