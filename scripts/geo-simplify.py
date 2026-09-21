"""Normalise a GeoJSON file down to what the map actually needs.

Rendered geometry only needs to survive one zoom level, so this:
  - rounds coordinates to a fixed precision (4 dp is ~11 m, far below one pixel
    at the scales we draw),
  - keeps only the properties the UI reads,
  - drops slivers below a minimum area so ADM2 sets do not carry thousands of
    invisible fragments,
  - optionally decimates rings, which is where most of the win is for polygons.

Points are left alone: they are already minimal and precision loss there moves
facilities off their real position.

Usage:  python scripts/geo-simplify.py <in.geojson> <out.json> [precision] [min_area_deg2]
"""
import json
import sys
from pathlib import Path

# Properties the Trail UI actually reads off a feature.
KEEP_PROPS = {
    "name", "name_1", "name_2", "shapeName", "shapeISO", "adm1_name",
    "amenity", "healthcare", "health_facility_type", "education_level",
    "type", "facility_type", "country", "iso3", "capacity", "status",
    "primary_fuel", "power_plant", "gppd_idnr", "market_name", "water_point",
    "water_source_type", "status_clean", "install_year", "management",
    "district", "county", "province", "region", "ward",
}

def round_coords(coords, p):
    if isinstance(coords[0], (int, float)):
        return [round(coords[0], p), round(coords[1], p)]
    return [round_coords(c, p) for c in coords]

def ring_area(ring):
    """Shoelace area in degrees squared - enough to spot slivers."""
    a = 0.0
    for i in range(len(ring) - 1):
        x1, y1 = ring[i][0], ring[i][1]
        x2, y2 = ring[i + 1][0], ring[i + 1][1]
        a += x1 * y2 - x2 * y1
    return abs(a) / 2.0

def simplify_polygon(rings, min_area):
    kept = []
    for ring in rings:
        if len(ring) < 4:
            continue
        # A ring made of few, far-apart vertices covers little ground; drop it.
        if ring_area(ring) < min_area and len(rings) > 1:
            continue
        # Decimate: keep every other vertex on very dense rings, always keeping
        # the closing vertex so the ring stays valid.
        if len(ring) > 400:
            step = 3
            thin = ring[::step]
            if thin[-1] != ring[-1]:
                thin.append(ring[-1])
            kept.append(thin)
        else:
            kept.append(ring)
    return kept

def clean_props(props, country):
    out = {}
    for k, v in (props or {}).items():
        if k in KEEP_PROPS and v not in (None, "", "Unknown"):
            out[k] = v if not isinstance(v, str) else v[:80]
    if country:
        out.setdefault("country", country)
    return out

def main():
    src, dst = sys.argv[1], sys.argv[2]
    precision = int(sys.argv[3]) if len(sys.argv) > 3 else 4
    min_area = float(sys.argv[4]) if len(sys.argv) > 4 else 0.0
    country = sys.argv[5] if len(sys.argv) > 5 else ""

    geo = json.loads(Path(src).read_text(encoding="utf-8"))
    feats = geo.get("features", [])
    out = []
    for f in feats:
        geom = f.get("geometry")
        if not geom:
            continue
        t, c = geom.get("type"), geom.get("coordinates")
        if t == "Point":
            nc = round_coords(c, precision)
        elif t in ("Polygon",):
            rings = simplify_polygon(c, min_area)
            if not rings:
                continue
            nc = round_coords(rings, precision)
        elif t == "MultiPolygon":
            polys = []
            for poly in c:
                rings = simplify_polygon(poly, min_area)
                if rings:
                    polys.append(rings)
            if not polys:
                continue
            nc = round_coords(polys, precision)
        elif t in ("LineString", "MultiLineString"):
            nc = round_coords(c, precision)
        else:
            continue
        out.append({
            "type": "Feature",
            "properties": clean_props(f.get("properties"), country),
            "geometry": {"type": t, "coordinates": nc},
        })

    dst_p = Path(dst)
    dst_p.parent.mkdir(parents=True, exist_ok=True)
    dst_p.write_text(json.dumps({"type": "FeatureCollection", "features": out},
                                separators=(",", ":")), encoding="utf-8")
    kb = dst_p.stat().st_size / 1024
    print(f"{dst_p.name:44s} {len(feats):>7} in -> {len(out):>7} out  {kb:>9.1f} KB")

if __name__ == "__main__":
    main()
