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

// Vite static imports — every .json in src/data/layers/ is bundled.
const ctx = import.meta.glob("./data/layers/*.json", { eager: false, import: "default" });
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

/** Convert a layer's features to the record-ish shape the markers expect. */
export function layerToRecords(layer, layerMeta) {
  if (!layer) return [];
  return layer.features.map((f, i) => {
    const p = f.properties || {};
    const coords = f.geometry?.coordinates;
    let xy = coords;
    if (f.geometry?.type === "Point") xy = coords;
    else if (f.geometry?.type === "Polygon") xy = centroid(coords);
    else if (f.geometry?.type === "MultiPolygon") xy = centroid(coords[0]);
    else if (f.geometry?.type === "LineString") xy = coords[Math.floor(coords.length / 2)];
    else if (f.geometry?.type === "MultiLineString") xy = coords[0][Math.floor(coords[0].length / 2)];
    return {
      id: `${layerMeta.id}-${i}`,
      title: p.name || p.facility_type || p.primary_fuel || p.education_level || layerMeta.label,
      coords: xy,
      layer: layerMeta.idInLayer || layerMeta.id,
      source: { name: layerMeta.source, url: "", type: layerMeta.geometry, verified: true, checked: "Built into bundle", cadence: layerMeta.licence },
      place: p.district || p.county || p.province || p.region || p.country || "",
      country: p.country || "",
      kind: layerMeta.geometry,
    };
  });
}

function centroid(rings) {
  if (!rings?.[0]) return [0, 0];
  const ring = rings[0];
  let x = 0, y = 0, n = 0;
  for (const c of ring) { if (Array.isArray(c) && c.length >= 2) { x += c[0]; y += c[1]; n++; } }
  return n ? [x / n, y / n] : [0, 0];
}
