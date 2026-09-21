import { useEffect, useState } from "react";

/**
 * Load a bundled layer by name. The manifest lists every available layer; the
 * UI picks from what's enabled. Layers are bundled, not fetched — this import
 * happens at build time via Vite's static analysis.
 *
 * We keep the manifest and the layer files in src/data/layers/ so they are part
 * of the repository and the offline build. Adding a layer is: download it, run
 * geo-simplify.py, drop the result in src/data/layers/, add it to the manifest.
 */

// Explicit file map — only point datasets the UI actually renders are bundled.
// (A broad glob would also emit the 5.5 MB admin-adm1 boundary chunk that no
// view requests, bloating dist/ and the offline precache for zero benefit.)
const ctx = import.meta.glob(
  ["./data/layers/health-facilities.json", "./data/layers/education-facilities.json", "./data/layers/power-plants.json", "./data/layers/markets.json"],
  { eager: false, import: "default" }
);
const MANIFEST = import("./data/layers/manifest.json");

let _manifest = null;
let _layers = {}; // name -> Promise<FeatureCollection>

export async function getManifest() {
  if (_manifest) return _manifest;
  _manifest = await MANIFEST;
  // layer files are the manifest entries
  for (const layer of _manifest.layers || []) {
    const key = `./data/layers/${layer.file}`;
    if (ctx[key] && !_layers[layer.file]) {
      _layers[layer.file] = ctx[key]();
    }
  }
  return _manifest;
}

export async function getLayer(file) {
  if (_layers[file]) return _layers[file];
  const key = `./data/layers/${file}`;
  if (!ctx[key]) return null;
  const p = ctx[key]();
  _layers[file] = p;
  return p;
}

export function useLayer(file) {
  const [data, setData] = useState(null);
  useEffect(() => {
    if (!file) return;
    let live = true;
    getLayer(file).then((d) => live && setData(d));
    return () => { live = false; };
  }, [file]);
  return data;
}

export function useManifest() {
  const [data, setData] = useState(null);
  useEffect(() => {
    getManifest().then(setData);
  }, []);
  return data;
}

const validLonLat = (xy) =>
  Array.isArray(xy) && xy.length === 2 &&
  typeof xy[0] === "number" && typeof xy[1] === "number" &&
  Number.isFinite(xy[0]) && Number.isFinite(xy[1]) &&
  xy[0] >= -180 && xy[0] <= 180 && xy[1] >= -90 && xy[1] <= 90;

/** Convert a layer's features to the record-ish shape the markers expect. */
export function layerToRecords(layer, layerMeta) {
  if (!layer || !Array.isArray(layer.features)) return [];
  const out = [];
  layer.features.forEach((f, i) => {
    const p = f.properties || {};
    const coords = f.geometry?.coordinates;
    let xy = null;
    if (f.geometry?.type === "Point") xy = coords;
    else if (f.geometry?.type === "Polygon") xy = centroid(coords);
    else if (f.geometry?.type === "MultiPolygon") xy = centroid(coords[0]);
    else if (f.geometry?.type === "LineString" && Array.isArray(coords) && coords.length) xy = coords[Math.floor(coords.length / 2)];
    else if (f.geometry?.type === "MultiLineString" && Array.isArray(coords[0]) && coords[0].length) xy = coords[0][Math.floor(coords[0].length / 2)];
    if (!validLonLat(xy)) return;
    // OSM extracts use adm0/adm1/adm2 names; WRI uses `country`; markets only
    // carry a country. Markets additionally have NO names at all (2060/2060
    // null), so fall back to an indexed, place-qualified title rather than
    // rendering two thousand identical "Markets" pins.
    const country = p.country || p.adm0_name || "";
    const area = p.district || p.county || p.province || p.region ||
      p.adm2_name || p.adm1_name || p.addr_city || "";
    const rawName = p.name || p.facility_type || p.education_level || null;
    const fuel = p.primary_fuel ? ` (${p.primary_fuel})` : "";
    const title = rawName ? `${rawName}${layerMeta.id === "power-plants" ? fuel : ""}`
      : layerMeta.id === "markets" ? `Market centre ${i + 1} · ${country || "Ethiopia"}`
      : layerMeta.label || `Location ${i + 1}`;
    out.push({
      id: `${layerMeta.id}-${i}`,
      title,
      coords: xy,
      layer: layerMeta.idInLayer || layerMeta.id,
      // Honest provenance: bundled open data, built on a known date — never
      // presented as independently field-checked.
      source: { name: layerMeta.source || "Bundled open data", url: "", type: layerMeta.geometry || f.geometry?.type || "Point", verified: false, checked: "2026-09-21", cadence: "Versioned" },
      place: [area, country].filter(Boolean).join(", ") || country || layerMeta.label || "",
      country,
      kind: layerMeta.geometry || f.geometry?.type || "Point",
      track: layerMeta.track,
    });
  });
  return out;
}

function centroid(rings) {
  if (!rings?.[0]) return [0, 0];
  const ring = rings[0];
  let x = 0, y = 0, n = 0;
  for (const c of ring) { if (Array.isArray(c) && c.length >= 2) { x += c[0]; y += c[1]; n++; } }
  return n ? [x / n, y / n] : [0, 0];
}
