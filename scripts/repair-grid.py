"""Repair the corrupted Africa grid file: extract valid features by scanning for balanced braces."""
import json
from pathlib import Path

RAW = Path("data-raw/africagrid.geojson")
OUT = Path("src/data/layers/grid-lines.json")
AFRICAN_LONS = (-18, 41)
AFRICAN_LATS = (-35, 15)

text = RAW.read_text(encoding="utf-8", errors="replace")


def _iter(coords):
    if isinstance(coords[0], (int, float)):
        yield coords[0], coords[1]
    else:
        for c in coords:
            yield from _iter(c)


def in_africa(coords):
    for lon, lat in _iter(coords):
        if AFRICAN_LONS[0] <= lon <= AFRICAN_LONS[1] and AFRICAN_LATS[0] <= lat <= AFRICAN_LATS[1]:
            return True
    return False


# Scan feature objects by balancing braces.
feats = []
i = 0
while True:
    i = text.find('"type": "Feature"', i)
    if i < 0:
        break
    start = text.rfind("{", 0, i)
    if start < 0:
        i += 1
        continue
    depth = 0
    in_str = False
    esc = False
    end = start
    for j in range(start, min(start + 200000, len(text))):
        ch = text[j]
        if in_str:
            if esc:
                esc = False
            elif ch == "\\":
                esc = True
            elif ch == '"':
                in_str = False
        else:
            if ch == '"':
                in_str = True
            elif ch == "{":
                depth += 1
            elif ch == "}":
                depth -= 1
                if depth == 0:
                    end = j + 1
                    break
    if end <= start:
        i += 1
        continue
    chunk = text[start:end]
    try:
        obj = json.loads(chunk)
        feats.append(obj)
    except json.JSONDecodeError:
        pass
    i = end

kept = [f for f in feats if in_africa(f.get("geometry", {}).get("coordinates", []))]

clean = []
for f in kept:
    g = f.get("geometry", {})
    if g.get("type") == "LineString":
        coords = [[round(x, 4), round(y, 4)] for x, y in g.get("coordinates", []) if isinstance(x, (int, float))]
    else:
        coords = g.get("coordinates")
    p = f.get("properties", {})
    clean.append({"type": "Feature", "properties": {
        "country": p.get("country"), "voltage_kV": p.get("voltage_kV"),
        "length_km": p.get("length_km"), "status": p.get("status"),
        "from": p.get("from"), "to": p.get("to"),
    }, "geometry": {"type": "LineString", "coordinates": coords}})

OUT.parent.mkdir(parents=True, exist_ok=True)
OUT.write_text(json.dumps({"type": "FeatureCollection", "features": clean}, separators=(",", ":")), encoding="utf-8")
print(f"scanned {len(feats)} features, kept {len(clean)} African, written {OUT.stat().st_size/1024:.1f} KB")
