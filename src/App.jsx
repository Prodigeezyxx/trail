import React, { useState, useEffect, useMemo, useRef } from "react";
import { geoMercator, geoOrthographic, geoPath, geoDistance, geoGraticule10, geoCentroid } from "d3-geo";
import {
  Search, Globe2, Map, Layers, Route, Files, BookOpen, ShieldCheck,
  HelpCircle, X, Check, CalendarDays, MapPin, Link2, FileText,
  Download, Copy, ExternalLink, Leaf, Users, Compass, Crosshair, Menu, Printer,
  ChevronDown, Plus, Minus, ArrowUpRight, ArrowRight, ThumbsUp, Flag,
  Lock, Trash2, Share2, MessageCircle, Send, AlertTriangle, Eye,
  ListChecks, Gavel, Droplets, Signal, RefreshCw, CircleCheck, Info,
} from "lucide-react";
import {
  TRACKS, LAYERS as layers, RECORDS, SEED_FILES as seeds, ISSUE_SEEDS, dateLabel as short,
  placeLabel, stateAt as state, loadFiles, loadIssues, validIssue,
  packetText as packet, addDays, daysBetween, freshnessOf,
  STORAGE_KEY, ISSUE_KEY, REPORT_KEY, BUNDLE_DATE, VOTE_THRESHOLD,
  PROMOTE_THRESHOLD, trackById, layerById, COUNTRIES, geoNameOf,
} from "./data";
import africaGeo from "./data/africa.json";
import { IconSymbols } from "./Icons.jsx";
import { layerToRecords, useManifest, getLayer } from "./layers.js";

/* Which bundled data file backs which logical layer. Only files that exist in
   src/data/layers/ are listed — earlier revisions referenced water-points.json
   and grid-lines.json, which were never bundled, so those layers silently
   rendered nothing while the UI implied coverage. */
const LAYER_FILES = {
  "health": "health-facilities.json",
  "education": "education-facilities.json",
  "power-plants": "power-plants.json",
  "markets": "markets.json",
};

import {
  DATA_SOURCES, PATHWAYS_BY_CATEGORY, SAFETY_GUIDES, SOURCE_WARNINGS,
  sourceById, verifiedCount,
} from "./sources";
import "@fontsource-variable/dm-sans/wght.css";
import "@fontsource-variable/manrope/wght.css";

/* ---------------------------------------------------------------- helpers */

const date = (day) => addDays("2026-09-01", day - 1);
const layerColor = (id) => layerById(id)?.color ?? "#8b9298";
const trackColor = (id) => trackById(id)?.color ?? "#8b9298";
const clamp = (n, a, b) => Math.max(a, Math.min(b, n));

function load() {
  try { return loadFiles(localStorage); } catch { return structuredClone(seeds); }
}
function loadStored(key, fallback) {
  try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) : fallback; } catch { return fallback; }
}
function save(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); return true; } catch { return false; }
}
function refCode() {
  const a = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let s = "";
  for (let i = 0; i < 4; i++) s += a[Math.floor(Math.random() * a.length)];
  return `TR-${new Date().getUTCFullYear()}-${s}`;
}

/** Trail shapes by track — the "trail options" a user picks from. */
const TRAIL_TEMPLATES = [
  { id: "budget", track: "transparency", label: "Ask where a budget line was spent", ask: "Where is the published allocation for this service, and how can residents submit feedback?" },
  { id: "tender", track: "transparency", label: "Ask for a tender or contract record", ask: "Please provide the award notice, contract value, contractor name and the date of award." },
  { id: "audit", track: "transparency", label: "Follow up an audit finding", ask: "Which audit finding covers this office, and what is the published management response and date?" },
  { id: "service", track: "transparency", label: "Attach a service request to a desk", ask: "Which desk holds this request, what documents are required, and by when will we receive a written answer?" },
  { id: "water", track: "stability", label: "Find who maintains a shared water point", ask: "Who is responsible for this water point, and when can the community expect a maintenance date?" },
  { id: "land", track: "stability", label: "Put a land question on the public record", ask: "Which public consultation record covers this area, and who will answer residents in writing?" },
  { id: "mediation", track: "stability", label: "Bring a shared-resource dispute to mediation", ask: "Which local mediation or peace committee covers this area, and how do residents ask it to hear the matter?" },
  { id: "warning", track: "stability", label: "Ask for the hazard plan and lead time", ask: "Where is the current warning for this area published, and what is the lead time residents should expect?" },
  { id: "oversight", track: "safety", label: "File a complaint with an oversight body", ask: "Which oversight body can receive this complaint, and what is the acknowledgement and reference procedure?" },
  { id: "legalaid", track: "safety", label: "Reach free legal aid", ask: "Which legal aid provider covers this district, what does it need from us, and is there a waiting list?" },
  { id: "gbv", track: "safety", label: "Reach a survivor support service", ask: "Which service can a survivor contact, what hours does it operate, and what happens on first contact?" },
  { id: "health", track: "safety", label: "Ask for a facility supply record", ask: "Where can residents view the staffing and medicine stock record for this facility?" },
];

const REPORT_CATEGORIES = [
  { id: "corruption", label: "Corruption or abuse of office", track: "transparency" },
  { id: "service", label: "Denied a public service", track: "transparency" },
  { id: "violence", label: "Violence or threat of violence", track: "safety" },
  { id: "gbv", label: "Gender-based violence or abuse", track: "safety" },
  { id: "child", label: "Harm to a child", track: "safety" },
  { id: "rights", label: "A rights violation", track: "safety" },
  { id: "resource", label: "A shared-resource dispute", track: "stability" },
];

/* ------------------------------------------------------------------ globe */

const GW = 1060, GH = 675, GCX = GW / 2, GCY = GH / 2;

const COVERED = africaGeo.features.filter((f) =>
  COUNTRIES.some((c) => geoNameOf(c) === f.properties.name));
const CONTEXT = africaGeo.features.filter((f) =>
  !COUNTRIES.some((c) => geoNameOf(c) === f.properties.name));
const FOOTPRINT = { type: "FeatureCollection", features: COVERED };
const FOOTPRINT_CENTRE = geoCentroid(FOOTPRINT);
const HOME = [-FOOTPRINT_CENTRE[0], -FOOTPRINT_CENTRE[1]];

function GodsEye({ records, selected, onPick, onSelect, issues = [] }) {
  const [rot, setRot] = useState(HOME);
  const [zoom, setZoom] = useState(1.15);
  const [dragging, setDragging] = useState(false);
  const drag = useRef(null);

  const { projection, path, centre } = useMemo(() => {
    const p = geoOrthographic().rotate(rot).scale(330 * zoom).translate([GCX, GCY]);
    return { projection: p, path: geoPath(p), centre: p.invert([GCX, GCY]) };
  }, [rot, zoom]);

  const near = (coords) => !centre || geoDistance(coords, centre) < Math.PI / 2 - 0.05;

  // Capture lazily: grabbing pointer capture on pointerdown retargets the
  // follow-up click to the background, so marker clicks would never arrive
  // and the detail panel would sit stuck on the default record. Capture only
  // once the pointer has actually moved into a drag.
  const down = (e) => { drag.current = { x: e.clientX, y: e.clientY, rot, captured: false, el: e.currentTarget }; setDragging(true); };
  const move = (e) => {
    const d = drag.current; if (!d) return;
    if (!d.captured && Math.abs(e.clientX - d.x) + Math.abs(e.clientY - d.y) > 5) {
      d.captured = true;
      d.el?.setPointerCapture?.(e.pointerId);
    }
    const k = 0.32 / zoom;
    setRot([d.rot[0] + (e.clientX - d.x) * k, clamp(d.rot[1] - (e.clientY - d.y) * k, -70, 70)]);
  };
  const up = (e) => { drag.current = null; setDragging(false); e.currentTarget.releasePointerCapture?.(e.pointerId); };

  const lon = ((rot[0] + 540) % 360) - 180;

  return (
    <div className={"globe " + (dragging ? "dragging" : "")}>
      <svg className="globe-svg" viewBox={`0 0 ${GW} ${GH}`} role="img"
           aria-label="Africa on a globe. Drag to turn."
           onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up}>
        <defs>
          <radialGradient id="gsea" cx="34%" cy="26%" r="80%">
            <stop offset="0%" stopColor="#12301f" /><stop offset="60%" stopColor="#0b2016" /><stop offset="100%" stopColor="#061109" />
          </radialGradient>
          <radialGradient id="gshade" cx="32%" cy="24%" r="84%">
            <stop offset="0%" stopColor="#3d8f5b" stopOpacity="0.28" /><stop offset="55%" stopColor="#000" stopOpacity="0.05" /><stop offset="100%" stopColor="#000" stopOpacity="0.42" />
          </radialGradient>
          <clipPath id="gclip"><path d={path({ type: "Sphere" }) || ""} /></clipPath>
        </defs>
        <path className="globe-sphere" d={path({ type: "Sphere" }) || ""} fill="url(#gsea)" />
        <g clipPath="url(#gclip)">
          <path className="globe-graticule" d={path(geoGraticule10()) || ""} />
          {CONTEXT.map((f) => <path key={f.id} className="country context" d={path(f) || ""} />)}
          {COVERED.map((f) => <path key={f.id} className="country covered" d={path(f) || ""} />)}
        </g>
        <path d={path({ type: "Sphere" }) || ""} fill="url(#gshade)" pointerEvents="none" />
        <path className="globe-limb" d={path({ type: "Sphere" }) || ""} pointerEvents="none" />

        {issues.filter((i) => near(i.coords)).map((i) => {
          const p = projection(i.coords); if (!p) return null;
          return (
            <g key={i.id} className="issue-pin" transform={`translate(${p[0]},${p[1]})`}
               onClick={() => onSelect?.(i)} role="button" tabIndex="0"
               aria-label={`Community issue: ${i.title}`}
               onKeyDown={(e) => { if (e.key === "Enter") onSelect?.(i); }}>
              <circle r="7" />
            </g>
          );
        })}

        {records.filter((x) => near(x.coords)).map((x) => {
          const p = projection(x.coords); if (!p) return null;
          const isSel = selected === x.id;
          const layerMeta = layerById(x.layer);
          const iconName = layerMeta?.icon;
          const isDataPoint = x.kind === "Point" && x.layer !== "issue";
          return (
            <g className={"marker " + (isSel ? "selected" : "")} key={x.id}
               style={{ "--pin": layerMeta?.color || trackColor(x.track) }}
               transform={`translate(${p[0]},${p[1]})`}
               role="button" tabIndex="0" aria-label={`${x.title}, ${x.place}`}
               onClick={() => onPick(x.id)}
               onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onPick(x.id); } }}>
              {isDataPoint ? (
                <>
                  <circle className="halo" r={isSel ? 18 : 13} opacity="0.25" />
                  {iconName && <use href={`#li-${iconName}`} x="-7" y="-7" width="14" height="14" stroke="var(--pin)" fill="var(--pin)" />}
                </>
              ) : (
                <>
                  <circle className="halo" r={isSel ? 26 : 16} />
                  <circle className="ring" r={isSel ? 12 : 8} />
                  <circle className="core" r={isSel ? 5 : 3} />
                  <rect className="pin-label-bg" x="17" y="-11" width={isSel ? 92 : 78} height="22" rx="4" />
                  <text className="pin-label" x="25" y="3">{x.place.split(",")[0].replace(" County", "")}</text>
                </>
              )}
            </g>
          );
        })}
      </svg>

      <div className="globe-controls">
        <button onClick={() => { setRot(HOME); setZoom(1.15); }} aria-label="reset view">Reset</button>
        <span className="globe-readout">{Math.round(lon)}° · {Math.round(-rot[1])}°</span>
        <button aria-label="zoom in" onClick={() => setZoom((z) => clamp(+(z + 0.2).toFixed(2), 1, 2.6))}><Plus size={13} /></button>
        <button aria-label="zoom out" onClick={() => setZoom((z) => clamp(+(z - 0.2).toFixed(2), 1, 2.6))}><Minus size={13} /></button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------- components */

function Modal({ title, tag, children, close, wide }) {
  const ref = useRef(), fn = useRef(close);
  fn.current = close;
  useEffect(() => {
    const before = document.activeElement, el = ref.current; el?.focus();
    const overflow = document.body.style.overflow; document.body.style.overflow = "hidden";
    const handler = (e) => { if (e.key === "Escape") fn.current(); };
    document.addEventListener("keydown", handler);
    return () => { document.removeEventListener("keydown", handler); document.body.style.overflow = overflow; before?.focus(); };
  }, []);
  return (
    <div className="overlay" onMouseDown={(e) => e.target === e.currentTarget && close()}>
      <section className={"modal " + (wide ? "wide" : "")} ref={ref} tabIndex={-1} role="dialog" aria-modal="true" aria-label={title}>
        <div className="modal-head">
          <div><div className="eyebrow">{tag || "TRAIL WORKSPACE"}</div><h2>{title}</h2></div>
          <button className="icon-btn" aria-label="Close" onClick={close}><X size={17} /></button>
        </div>
        {children}
      </section>
    </div>
  );
}

function Badge({ value }) { return <span className={"badge " + String(value).toLowerCase().replaceAll(" ", "-")}><i />{value}</span>; }

function Freshness({ source }) {
  if (!source) return <span className="fresh unknown"><i />No source</span>;
  const f = freshnessOf(source, BUNDLE_DATE);
  return <span className={"fresh " + f.state}><i />{f.label}</span>;
}

function PacketActions({ text, filename, onToast, onPdf }) {
  const copy = async () => {
    try { await navigator.clipboard.writeText(text); onToast("Packet copied. Paste it into any app."); }
    catch { onToast("Clipboard blocked. Select the text and copy manually."); }
  };
  const download = () => {
    const url = URL.createObjectURL(new Blob([text], { type: "text/plain;charset=utf-8" }));
    const a = document.createElement("a"); a.href = url; a.download = filename; a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    onToast("Packet downloaded. Take the next step offline.");
  };
  const wa = () => { window.open("https://wa.me/?text=" + encodeURIComponent(text), "_blank", "noopener"); };
  const tg = () => { window.open("https://t.me/share/url?text=" + encodeURIComponent(text), "_blank", "noopener"); };
  return (
    <div className="packet-actions">
      {onPdf && <button className="primary" onClick={onPdf}><Printer size={14} />PDF</button>}
      <button className="ghost" onClick={download}><Download size={14} />TXT</button>
      <button className="ghost" onClick={wa}><MessageCircle size={14} />WhatsApp</button>
      <button className="ghost" onClick={tg}><Send size={14} />Telegram</button>
      <button className="ghost" onClick={copy}><Copy size={14} />Copy</button>
    </div>
  );
}

/* -------------------------------------------------------------------- app */

/** Detail panel for an ingested data-layer point. */
function DataPointDetail({ point, onStartTrail }) {
  if (!point) return null;
  const layerMeta = layerById(point.layer);
  return (
    <>
      <div className="detail-head">
        <div>
          <div className="eyebrow" style={{ color: layerMeta?.color || trackColor(point.track) }}>{layerMeta?.name || point.layer}</div>
          <h3>{point.title}</h3>
          <div className="detail-place"><MapPin size={13} />{point.place}</div>
        </div>
      </div>
      {point.description && <p className="detail-desc">{point.description}</p>}
      <div className="detail-meta">
        <div><ShieldCheck size={13} />{point.source?.name || "Open data"}</div>
        <div><CalendarDays size={13} />{point.source?.checked ? `Checked ${short(point.source.checked)}` : "Source not independently verified"}</div>
        {point.source?.url && (
          <a href={point.source.url} target="_blank" rel="noopener noreferrer"><Link2 size={13} />Open source<ExternalLink size={11} /></a>
        )}
      </div>
      <div className="detail-next">
        <div className="eyebrow">THE NEXT STEP</div>
        <p>{layerMeta?.evidence || "Use this location as evidence for a community trail — start one below."}</p>
      </div>
      <button className="primary detail-cta" onClick={() => onStartTrail({ label: point.title, track: point.track || layerById(point.layer)?.track || "transparency", ask: layerById(point.layer)?.evidence || "Use this location as evidence for a community trail — start one below." }, point)}><Route size={15} />Start a trail from here</button>
    </>
  );
}

export default function App() {
  const [tab, setTab] = useState("Explore");
  const [selected, setSelected] = useState("mak");
  const [enabled, setEnabled] = useState(layers.map((l) => l.id));
  const [country, setCountry] = useState("All Africa");
  const [trackFilter, setTrackFilter] = useState("all");
  const [view, setView] = useState("Map");
  // Flat-map viewport: zoom + pan. The globe keeps its own rotate/zoom state.
  const [mapZoom, setMapZoom] = useState(1);
  const [mapPan, setMapPan] = useState([0, 0]);
  const mapDrag = useRef(null);
  const mapMoved = useRef(false);
  const mapSvgRef = useRef(null);
  const zoomMap = (d) => setMapZoom((z) => clamp(+(z + d).toFixed(2), 1, 6));
  const resetMapView = () => { setMapZoom(1); setMapPan([0, 0]); };
  const [day, setDay] = useState(21);
  const [files, setFiles] = useState(load);
  const [issues, setIssues] = useState(() => { try { return loadIssues(localStorage); } catch { return structuredClone([]); } });
  const [voted, setVoted] = useState(() => loadStored("trail-voted-v4", []));
  const [promoted, setPromoted] = useState(() => loadStored("trail-promoted-v4", []));
  const [reports, setReports] = useState(() => loadStored(REPORT_KEY, []));
  const [modal, setModal] = useState(null);
  const [active, setActive] = useState(null);
  const [format, setFormat] = useState("packet");
  const [toast, setToast] = useState("");
  const [connect, setConnect] = useState(false);
  const [links, setLinks] = useState([]);
  const [showLayers, setShowLayers] = useState(() => (typeof window === "undefined" ? true : window.innerWidth > 900));
  const [mapOpen, setMapOpen] = useState(true);
  const [nav, setNav] = useState(false);
  const [lang, setLang] = useState("EN");
  const [langMenu, setLangMenu] = useState(false);
  const [online, setOnline] = useState(typeof navigator === "undefined" ? true : navigator.onLine);
  const [now, setNow] = useState(new Date());
  const [issueFocus, setIssueFocus] = useState(null);
  const [report, setReport] = useState(null);
  const [reportCat, setReportCat] = useState("corruption");
  // Rich print document for PDF export via the browser's print-to-PDF. Kept
  // separate from the app DOM so @media print can hide the workspace.
  const [printDoc, setPrintDoc] = useState(null);

  const today = date(day);
  const allTrails = useMemo(() => [
    ...RECORDS.map((r) => ({ ...r, place: placeLabel(r), official: true })),
    ...promoted.map((p) => ({ ...p, place: `${p.place}, ${p.country}`, official: true, promotedFrom: p.issueId })),
  ], [promoted]);

  const [dataPoint, setDataPoint] = useState(null);

  const find = (id) => allTrails.find((r) => r.id === id);
  const visible = allTrails.filter((x) =>
    enabled.includes(x.layer) &&
    (country === "All Africa" || x.country === country) &&
    (trackFilter === "all" || x.track === trackFilter)
  );
  const visibleIssues = issues.filter((i) =>
    enabled.includes(i.layer) &&
    (country === "All Africa" || i.country === country) &&
    (trackFilter === "all" || i.track === trackFilter)
  );

  const manifest = useManifest();
  const [layerData, setLayerData] = useState({});

  useEffect(() => {
    if (!manifest) return;
    let live = true;
    const jobs = Object.entries(LAYER_FILES).filter(([id]) => enabled.includes(id));
    Promise.all(jobs.map(([id, file]) => getLayer(file).then(d => [id, d])))
      .then(entries => {
        if (!live) return;
        const out = {};
        for (const [id, d] of entries) if (d) out[id] = d;
        setLayerData(out);
      });
    return () => { live = false; };
  }, [manifest, enabled]);

  const layerRecords = useMemo(() => {
    const acc = [];
    const occupied = new Set(); // "lon,lat" cells already filled, to prevent stacking
    const CELL = 0.04;    // ~4.5 km — dense-city spread, keeps icons readable
    for (const [id, data] of Object.entries(layerData)) {
      if (!data) continue;
      const meta = manifest?.layers?.find((l) => l.file === LAYER_FILES[id]);
      const recs = layerToRecords(data, { ...meta, id, track: layerById(id)?.track });
      // Normalise both sides through the geo-name mapping: bundled OSM/WRI
      // files use full names ("Cameroon") while the geometry abbreviates two
      // ("Dem. Rep. Congo"). Comparing raw strings dropped DRC points.
      const norm = (c) => geoNameOf(c);
      const wanted = country === "All Africa" ? null : norm(country);
      const shown = recs.filter((r) => {
        if (!wanted) return true;
        if (norm(r.country) === wanted) return true;
        // Records whose file carries no country inherit the layer's footprint:
        // keep them only in the unfiltered view rather than hiding them all.
        return false;
      });
      // Decimate to ~80 total across all layers — dense enough for a global
      // picture, sparse enough that individual icons stay distinct. Each pick
      // claims a 1-cell square so two layers never stack on one another.
      const step = Math.max(1, Math.floor(shown.length / 80));
      for (let i = 0; i < shown.length; i += step) {
        const r = shown[i];
        if (!r.coords) continue;
        const key = `${Math.round(r.coords[0] / CELL)},${Math.round(r.coords[1] / CELL)}`;
        if (occupied.has(key)) continue;
        occupied.add(key);
        acc.push(r);
      }
    }
    return acc;
  }, [layerData, manifest, enabled, country]);

  const allMarkers = useMemo(() => [...visible, ...visibleIssues, ...layerRecords], [visible, visibleIssues, layerRecords]);

  const r = find(selected) || (dataPoint ? null : allTrails[0]);
  const file = files.find((f) => f.id === active);

  useEffect(() => {
    const on = () => setOnline(true), off = () => setOnline(false);
    window.addEventListener("online", on); window.addEventListener("offline", off);
    if (import.meta.env.PROD && "serviceWorker" in navigator && location.protocol.startsWith("http"))
      navigator.serviceWorker.register("./sw.js").catch(() => {});
    return () => { window.removeEventListener("online", on); window.removeEventListener("offline", off); };
  }, []);
  useEffect(() => { const t = setInterval(() => setNow(new Date()), 1000); return () => clearInterval(t); }, []);
  useEffect(() => { save(STORAGE_KEY, files); }, [files]);
  useEffect(() => { save(ISSUE_KEY, issues); }, [issues]);
  useEffect(() => { save("trail-voted-v4", voted); }, [voted]);
  useEffect(() => { save("trail-promoted-v4", promoted); }, [promoted]);
  useEffect(() => { save(REPORT_KEY, reports); }, [reports]);
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 4500);
    return () => clearTimeout(t);
  }, [toast]);
  useEffect(() => {
    const h = (e) => { if ((e.metaKey || e.ctrlKey) && e.key === "k") { e.preventDefault(); setModal("search"); } };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, []);
  useEffect(() => {
    const clear = () => setPrintDoc(null);
    window.addEventListener("afterprint", clear);
    return () => window.removeEventListener("afterprint", clear);
  }, []);
  useEffect(() => {
    // Wheel-zoom on the flat map (native listener so we can preventDefault
    // the page scroll while zooming; React's synthetic wheel is passive).
    const el = mapSvgRef.current;
    if (!el || view !== "Map") return;
    const onWheel = (e) => {
      e.preventDefault();
      setMapZoom((z) => clamp(+(z - Math.sign(e.deltaY) * 0.25).toFixed(2), 1, 6));
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [view]);
  useEffect(() => {
    if (!printDoc) return;
    // Let the sheet render before opening the dialog, so print preview has content.
    const t = setTimeout(() => window.print(), 60);
    return () => clearTimeout(t);
  }, [printDoc]);
  useEffect(() => {
    // Arabic ships RTL layout; everything else stays LTR. Sample records and
    // packets remain English in this build (see the notice in Explore) — a
    // half-translated packet would be worse than an honest one.
    try {
      document.documentElement.dir = lang === "AR" ? "rtl" : "ltr";
      document.documentElement.lang = lang.toLowerCase();
    } catch { /* non-DOM environment */ }
  }, [lang]);

  const projection = useMemo(
    () => geoMercator().fitExtent([[70, 58], [GW - 70, GH - 58]], FOOTPRINT),
    []
  );
  const flatPath = useMemo(() => geoPath(projection), [projection]);

  // Flat-map pan gestures: screen px → viewBox units via the svg's bounding rect.
  const mapDown = (e) => {
    // No capture here — see the globe note above. A plain click must reach
    // the marker untouched; capture engages only once this becomes a drag.
    mapDrag.current = { x: e.clientX, y: e.clientY, pan: mapPan, captured: false, el: e.currentTarget };
    mapMoved.current = false;
  };
  const mapMove = (e) => {
    const d = mapDrag.current; if (!d) return;
    if (Math.abs(e.clientX - d.x) + Math.abs(e.clientY - d.y) > 5) {
      mapMoved.current = true;
      if (!d.captured) { d.captured = true; d.el?.setPointerCapture?.(e.pointerId); }
    }
    const rect = mapSvgRef.current?.getBoundingClientRect();
    const k = rect && rect.width ? GW / rect.width : 1;
    setMapPan([d.pan[0] + (e.clientX - d.x) * k, d.pan[1] + (e.clientY - d.y) * k]);
  };
  const mapUp = (e) => { mapDrag.current = null; e.currentTarget.releasePointerCapture?.(e.pointerId); };

  const pick = (id) => {
    // A map drag ending on a marker must pan, not select.
    if (mapMoved.current) { mapMoved.current = false; return; }
    if (connect && id !== selected) { setLinks((p) => (p.includes(id) ? p.filter((i) => i !== id) : [...p, id])); return; }
    setSelected(id); setIssueFocus(null); setLinks([]);
    // data-layer points have ids like "health-0" — show their detail in the panel
    const dp = layerRecords.find((x) => x.id === id);
    setDataPoint(dp || null);
  };

  const vote = (id) => {
    if (voted.includes(id)) {
      setVoted((p) => p.filter((v) => v !== id));
      setIssues((p) => p.map((i) => {
        if (i.id !== id) return i;
        const votes = Math.max(0, i.votes - 1);
        const status = i.status === "official" ? "official" : votes >= VOTE_THRESHOLD ? "community-verified" : "open";
        return { ...i, votes, status };
      }));
      return;
    }
    setVoted((p) => [...p, id]);
    setIssues((p) => p.map((i) => {
      if (i.id !== id) return i;
      const votes = i.votes + 1;
      const status = i.status === "official" ? "official" : votes >= VOTE_THRESHOLD ? "community-verified" : "open";
      return { ...i, votes, status };
    }));
  };

  const canPromote = (issue) => issue && issue.status !== "official" && issue.votes >= PROMOTE_THRESHOLD;

  const promote = (issue) => {
    if (!canPromote(issue)) { setToast(`An issue needs ${PROMOTE_THRESHOLD} votes before it can become an official trail.`); return; }
    const id = `TRL-${issue.id.replace("ISS-", "P")}`;
    setPromoted((p) => p.some((x) => x.id === id) ? p : [...p, {
      id, title: issue.title, place: issue.place, country: issue.country, coords: issue.coords,
      layer: issue.layer, track: issue.track, description: issue.detail,
      source: { name: "Community submission", url: "", type: "Resident report", verified: false, checked: issue.created, cadence: "Ad hoc" },
      listed: issue.created, holder: "To be identified", witness: "Community reporter",
      ask: "Please acknowledge this issue in writing, name the responsible desk, and give a reference number and a response date.",
      theme: layerById(issue.layer)?.name ?? "Community issue",
      confidence: 0.45, importance: 0.8,
      limitations: ["Raised by a resident, not an institution", `Community support on this device: ${issue.votes} (no server — votes are local)`],
      issueId: issue.id,
    }]);
    setIssues((p) => p.map((i) => (i.id === issue.id ? { ...i, status: "official" } : i)));
    setToast(`${issue.id} promoted to an official trail.`);
    setTab("Trails");
  };

  const startTrail = (template, baseOverride) => {
    // baseOverride is the record the user explicitly acted on (a Trails-tab
    // row, a map marker). Without it every "Track" button silently filed the
    // currently-selected map item instead — the wrong place, wrong ask.
    const rec = (selected && find(selected)) || null;
    const dp = dataPoint; // may be a data-layer point selected on the map
    const dpById = baseOverride?.id ? layerRecords.find((x) => x.id === baseOverride.id) : null;
    const base = baseOverride && (find(baseOverride.id) || dpById || baseOverride)
      || dp || rec
      || (baseOverride?.id ? layerRecords.find((x) => x.id === baseOverride.id) : null)
      || allTrails[0];
    if (!base) { setToast("Nothing to track yet — pick a record first."); return; }
    const f = {
      id: `${refCode().replace("TR-", "TRL-")}`,
      recordId: base.id, title: template?.label && template.label !== "Track this" && template.label !== "Track this location" ? template.label : base.title,
      holder: base.holder || "To be identified", witness: base.witness || "Community reporter",
      created: today, due: addDays(today, 7), expires: addDays(today, 14),
      answered: null, links: [...links],
      ask: template?.ask || base.ask, track: template?.track || base.track || "transparency",
      // Snapshot so the packet survives decimation/filter changes that drop
      // the live layer record from view.
      snapshot: { title: base.title, place: base.place, country: base.country, ask: base.ask, theme: base.theme, source: base.source },
    };
    setFiles((p) => [f, ...p]);
    setActive(f.id);
    setModal("file");
    setLinks([]);
  };

  const recordFor = (f) => find(f.recordId) || layerRecords.find((x) => x.id === f.recordId)
    // Fall back to the snapshot stored at creation: layer decimation means
    // the live record is frequently not in view when the packet is opened.
    || (f.snapshot ? { id: f.recordId, title: f.snapshot.title, place: f.snapshot.place, country: f.snapshot.country, ask: f.snapshot.ask, theme: f.snapshot.theme, source: f.snapshot.source, layer: f.track } : undefined);

  const packetFor = (f) => packet(f, format === "packet" ? "print" : format, today, { record: recordFor(f) });

  /** Rich PDF payload: the full brief as structured sections for print-to-PDF. */
  const printTrail = (f) => {
    const rec = recordFor(f);
    const src = rec?.source;
    setPrintDoc({
      kind: "trail",
      ref: f.id,
      title: rec?.title || f.title,
      place: rec?.place || f.snapshot?.place || "",
      theme: rec?.theme || "",
      track: trackById(f.track)?.name || "",
      holder: f.holder, witness: f.witness,
      due: f.due, expires: f.expires, created: f.created,
      state: state(f, today),
      ask: rec?.ask || f.ask,
      source: src ? { name: src.name, url: src.url, type: src.type, checked: src.checked, verified: src.verified, cadence: src.cadence } : null,
      limitations: rec?.limitations || [],
    });
    setToast("Choose “Save as PDF” in the print dialog.");
  };

  const printReport = (rep) => {
    if (!rep) return;
    setPrintDoc({
      kind: "report",
      ref: rep.ref,
      title: `Safe report · ${rep.category}`,
      place: [rep.place, rep.country].filter(Boolean).join(", "),
      created: rep.created, when: rep.when,
      detail: rep.detail, outcome: rep.outcome,
    });
    setToast("Choose “Save as PDF” in the print dialog.");
  };

  const labels = { EN: ["Explore", "Trails", "Community", "Sources", "Report"], FR: ["Explorer", "Parcours", "Communauté", "Sources", "Signaler"], PT: ["Explorar", "Percursos", "Comunidade", "Fontes", "Denunciar"], AR: ["استكشف", "المسارات", "المجتمع", "المصادر", "الإبلاغ"] }[lang];

  const TABS = [["Explore", Compass], ["Trails", Route], ["Community", Users], ["Sources", BookOpen], ["Report", Lock]];

  const countries = [...new Set([...COUNTRIES, ...allTrails.map((x) => x.country), ...issues.map((i) => i.country)])].sort();
  const checkedCount = allTrails.filter((x) => x.source?.verified).length;

  const reportPacket = (rep) => {
    if (!rep) return "";
    return [
      `TRAIL · SAFE REPORT · ${rep.ref}`,
      `Category: ${rep.category}`,
      `Where: ${rep.place}${rep.country ? `, ${rep.country}` : ""}`,
      `When: ${rep.when}`,
      "",
      "WHAT HAPPENED (as written by the reporter)",
      rep.detail,
      "",
      "WHAT THE REPORTER WANTS TO HAPPEN",
      rep.outcome || "Not stated.",
      "",
      "SAFETY",
      "This record was created on the reporter's own device. It has not been sent anywhere.",
      "It contains no name, phone number or identifier. Do not add any before forwarding.",
      "If you are forwarding this, send it through a channel you trust and delete it afterwards.",
      "",
      `Recorded: ${rep.created}`,
    ].join("\n");
  };

  return (
    <>
    <div className="app">
      <IconSymbols />
      {nav && <div className="nav-scrim" onClick={() => setNav(false)} />}
      <aside className={"sidebar " + (nav ? "open" : "")} inert={modal ? true : undefined}>
        <a href="#explore" aria-label="Trail home" onClick={() => setTab("Explore")}>
          <div className="brand"><span>TRAIL</span><b>AFRICA</b></div>
        </a>
        <div className="workspace-tag"><i />{online ? `${COUNTRIES.length} COUNTRIES · ${layers.length} LAYERS` : "OFFLINE · WORKING FROM CACHE"}</div>

        <nav>
          {TABS.map(([name, Icon]) => (
            <button className={tab === name ? "active" : ""} key={name} onClick={() => { setTab(name); setNav(false); }}>
              <Icon size={17} strokeWidth={1.6} />
              {labels[TABS.findIndex(([n]) => n === name)]}
              {name === "Trails" && <span className="count">{String(files.length).padStart(2, "0")}</span>}
              {name === "Community" && <span className="count">{String(issues.length).padStart(2, "0")}</span>}
              {name === "Explore" && <i />}
            </button>
          ))}
        </nav>

        <hr />
        <div className="side-label">TRACK</div>
        <div className="side-tracks">
          <button className={trackFilter === "all" ? "active" : ""} onClick={() => setTrackFilter("all")}>
            <i style={{ background: "#8b9298" }} />All tracks
          </button>
          {TRACKS.map((t) => (
            <button key={t.id} className={trackFilter === t.id ? "active" : ""} onClick={() => setTrackFilter(t.id)}>
              <i style={{ background: t.color }} />{t.short}
              <span className="tcount">{allTrails.filter((x) => x.track === t.id).length}</span>
            </button>
          ))}
        </div>

        <hr />
        <div className="side-label">LAYERS <span className="dim">{enabled.length}/{layers.length}</span></div>
        <div className="side-layers">
          {layers.map((l) => (
            <button key={l.id} className={enabled.includes(l.id) ? "active" : ""}
                    onClick={() => setEnabled((p) => (p.includes(l.id) ? p.filter((x) => x !== l.id) : [...p, l.id]))}>
              <i style={{ background: l.color }} />{l.name}
              <span className={"checkbox " + (enabled.includes(l.id) ? "checked" : "")}>{enabled.includes(l.id) && <Check size={10} />}</span>
            </button>
          ))}
        </div>

        <div className="side-bottom">
          <div className="purpose">
            <h3>A fact should lead somewhere.</h3>
            <p>Leave with a packet you can send, print, or read out.</p>
            <button onClick={() => setModal("about")}>How Trail works <ArrowUpRight size={14} /></button>
          </div>
        </div>
      </aside>

      <div className="main-shell" inert={modal ? true : undefined}>
        <header>
          <div className="header-left">
            <button className="icon-btn mobile-menu" aria-label="Menu" onClick={() => setNav(true)}><Menu size={18} /></button>
            <span className="prototype"><i />PROTOTYPE</span>
            <div className="country-select">
              <Globe2 size={15} />
              <select aria-label="Country filter" value={country} onChange={(e) => setCountry(e.target.value)}>
                {["All Africa", ...countries].map((c) => <option key={c}>{c}</option>)}
              </select>
              <ChevronDown size={12} />
            </div>
          </div>
          <div className="header-center">
            <div className={"live-indicator " + (online ? "" : "offline")}><i />{online ? "ONLINE" : "OFFLINE"}</div>
            <div className="now">
              <div className="now-time">{now.toUTCString().slice(17, 25)}<span> UTC</span></div>
              <div className="now-date">{now.toUTCString().slice(0, 16).toUpperCase()}</div>
            </div>
            <div className="bundle" title="Date this data bundle was built">
              <RefreshCw size={11} />DATA {short(BUNDLE_DATE)}
            </div>
          </div>
          <div className="header-right">
            <button className="search-button" onClick={() => setModal("search")}>
              <Search size={15} /><span>Find a place, fact or trail</span><kbd>⌘K</kbd>
            </button>
            <div className="language">
              <button aria-label="Language" onClick={() => setLangMenu(!langMenu)}><Globe2 size={14} />{lang}<ChevronDown size={11} /></button>
              {langMenu && (
                <div className="language-menu">
                  {[["EN", "English"], ["FR", "Français"], ["PT", "Português"], ["AR", "العربية"]].map(([v, n]) => (
                    <button key={v} onClick={() => { setLang(v); setLangMenu(false); }}>{n}{lang === v && <Check size={12} />}</button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </header>

        <main>
          {/* ---------------------------------------------------- EXPLORE */}
          {tab === "Explore" && (
            <>
              <section className="intro">
                <div>
                  <div className="eyebrow">— FROM INFORMATION TO ACTION</div>
                  <h1>Trusted civic information, across Africa.</h1>
                  <p>Find a fact, connect it to the office that holds the next step, and leave with a packet you can send.</p>
                  {lang !== "EN" && (
                    <p className="lang-note">Interface shown in {lang}. Sample records and packets remain in English in this build — a half-translated packet would be worse than an honest one.</p>
                  )}
                </div>
                <div className="intro-cta-wrap">
                  <button className="primary" onClick={() => setModal("template")}><Plus size={16} />Start a trail</button>
                  <button className="ghost" onClick={() => setModal("issue")}><Flag size={15} />Raise an issue</button>
                </div>
              </section>

              <div className="toolbar">
                <div className="toolbar-left">
                  <span className="record-count">
                    <b>{visible.length}</b> trails · <b>{visibleIssues.length}</b> {visibleIssues.length === 1 ? "community issue" : "community issues"}{" "}
                    <span>across {new Set([...visible.map((x) => x.country), ...visibleIssues.map((i) => i.country)]).size} countries in scope</span>
                  </span>
                  <small><i />Illustrative dataset · {verifiedCount()} public data sources fetch-verified</small>
                </div>
                <div className="toolbar-right">
                  <div className="segmented">
                    {[["Globe", Globe2], ["Map", Map], ["List", Files]].map(([name, Icon]) => (
                      <button className={view === name ? "selected" : ""} key={name} onClick={() => setView(name)}>
                        <Icon size={14} strokeWidth={1.6} />{name}
                      </button>
                    ))}
                  </div>
                  <button className="ghost sm" onClick={() => setMapOpen((m) => !m)}>
                    <Eye size={14} />{mapOpen ? "Hide map" : "Show map"}
                  </button>
                </div>
              </div>

              {mapOpen && (
                <div className={"stage " + (view === "List" ? "wide" : "")}>
                  <section className={"atlas " + (view === "List" ? "list-view" : "")}>
                    <div className="map-dots" />
                    {view !== "List" ? (
                      <>
                        <div className="atlas-heading">
                          <div className="eyebrow">TRAIL AFRICA · {COUNTRIES.length} COUNTRIES IN SCOPE</div>
                            <p>
                              {view === "Globe"
                                ? "Drag to turn. Brighter countries are the ones this build covers."
                                : "Tap a marker for its trail. Drag to pan, scroll or use + to zoom."}
                            </p>
                        </div>
                        {view === "Globe" ? (
                          <GodsEye records={allMarkers} issues={visibleIssues} selected={selected} onPick={pick} onSelect={(i) => { setIssueFocus(i); setModal("issueView"); }} />
                        ) : (
                          <svg className="africa-map pannable" ref={mapSvgRef} viewBox={`0 0 ${GW} ${GH}`} role="group" aria-label="Africa civic map. Drag to pan, scroll to zoom."
                               onPointerDown={mapDown} onPointerMove={mapMove} onPointerUp={mapUp} onPointerCancel={mapUp}>
                            <g transform={`translate(${GCX + mapPan[0]} ${GCY + mapPan[1]}) scale(${mapZoom}) translate(${-GCX} ${-GCY})`}>
                              {CONTEXT.map((f) => <path key={f.id} className="country context" d={flatPath(f) || ""} />)}
                              {COVERED.map((f) => <path key={f.id} className="country covered" d={flatPath(f) || ""} />)}
                              {COVERED.map((f) => {
                                const p = projection(geoCentroid(f));
                                return p ? (
                                  <g key={"lb" + f.id} transform={`translate(${p[0]},${p[1]}) scale(${1 / mapZoom})`}>
                                    <text className="country-label" x="0" y="0">
                                      {f.properties.name.toUpperCase()}
                                    </text>
                                  </g>
                                ) : null;
                              })}
                              {visibleIssues.map((i) => {
                                const p = projection(i.coords); if (!p) return null;
                                return (
                                  <g key={i.id} className="issue-pin" transform={`translate(${p[0]},${p[1]})`}
                                     onClick={() => { if (mapMoved.current) { mapMoved.current = false; return; } setIssueFocus(i); setModal("issueView"); }} role="button" tabIndex="0"
                                     aria-label={`Community issue: ${i.title}`}>
                                    <g transform={`scale(${1 / mapZoom})`}>
                                      <circle r="7" /><circle className="pulse" r="12" />
                                    </g>
                                  </g>
                                );
                              })}
                              {allMarkers.map((x) => {
                                const p = projection(x.coords); if (!p) return null;
                                const isSel = selected === x.id;
                                const layerMeta = layerById(x.layer);
                                const iconName = layerMeta?.icon;
                                const isDataPoint = x.kind === "Point" && x.layer !== "issue";
                                return (
                                  <g className={"marker " + (isSel ? "selected" : "")} key={x.id}
                                     style={{ "--pin": layerMeta?.color || trackColor(x.track) }}
                                     transform={`translate(${p[0]},${p[1]})`} role="button" tabIndex="0"
                                     aria-label={`${x.title}, ${x.place}`} onClick={() => pick(x.id)}>
                                    {/* Counter-scale so the artwork holds a constant screen size:
                                        without this the halos/rings/icons/labels grow with the
                                        map and swallow their neighbours at 3–6×. */}
                                    <g transform={`scale(${1 / mapZoom})`}>
                                      {isDataPoint ? (
                                        <>
                                          <circle className="halo" r={isSel ? 18 : 13} opacity="0.25" />
                                          {iconName && <use href={`#li-${iconName}`} x="-7" y="-7" width="14" height="14" stroke="var(--pin)" fill="var(--pin)" />}
                                        </>
                                      ) : (
                                        <>
                                          <circle className="halo" r={isSel ? 24 : 15} />
                                          <circle className="ring" r={isSel ? 11 : 8} />
                                          <circle className="core" r={isSel ? 4 : 3} />
                                          <rect className="pin-label-bg" x="16" y="-11" width={isSel ? 92 : 78} height="22" rx="4" />
                                          <text className="pin-label" x="24" y="3">{x.place.split(",")[0].replace(" County", "")}</text>
                                        </>
                                      )}
                                    </g>
                                  </g>
                                );
                              })}
                            </g>
                          </svg>
                        )}
                        {view !== "List" && (
                          <div className="map-tools">
                            {view === "Map" && (
                              <>
                                <button aria-label="Zoom in" onClick={() => zoomMap(0.5)}><Plus size={16} /></button>
                                <button aria-label="Zoom out" onClick={() => zoomMap(-0.5)}><Minus size={16} /></button>
                                {(mapZoom !== 1 || mapPan[0] !== 0 || mapPan[1] !== 0) && (
                                  <button aria-label="Reset map view" onClick={resetMapView}><RefreshCw size={14} /></button>
                                )}
                              </>
                            )}
                            <button aria-label="Connect" className={connect ? "active" : ""} onClick={() => { setConnect(!connect); setToast("Select another trail to link it."); }}><Link2 size={16} /></button>
                            <button aria-label="Reset" onClick={() => { setCountry("All Africa"); setEnabled(layers.map((l) => l.id)); setTrackFilter("all"); }}><Crosshair size={16} /></button>
                          </div>
                        )}
                        <div className="atlas-legend">
                          <span className="lg"><CircleCheck size={11} />Official trail</span>
                          <span className="lg"><Flag size={10} />Community issue</span>
                        </div>
                      </>
                    ) : (
                      <div className="record-list">
                        {visible.map((x) => (
                          <button className="record-row" key={x.id} onClick={() => pick(x.id)}>
                            <span className="record-dot" style={{ background: layerColor(x.layer) }} />
                            <span className="record-text"><small>{x.place} · {trackById(x.track)?.short}</small><strong>{x.title}</strong></span>
                            <Freshness source={x.source} />
                            <ArrowUpRight size={14} />
                          </button>
                        ))}
                      </div>
                    )}
                  </section>

                  {view !== "List" && (dataPoint || r) && (
                    <section className="detail-panel">
                      {dataPoint ? (
                        <DataPointDetail point={dataPoint} onStartTrail={startTrail} />
                      ) : (
                        <>
                          <div className="detail-head">
                            <div>
                              <div className="eyebrow" style={{ color: trackColor(r.track) }}>{trackById(r.track)?.name.toUpperCase()}</div>
                              <h3>{r.title}</h3>
                              <div className="detail-place"><MapPin size={13} />{r.place}</div>
                            </div>
                          </div>
                          <p className="detail-desc">{r.description}</p>
                          <div className="detail-scores">
                            <div className="score"><span>Confidence</span><b>{Math.round(r.confidence * 100)}%</b></div>
                            <div className="score"><span>Importance</span><b>{Math.round(r.importance * 100)}%</b></div>
                          </div>
                          <div className="detail-meta">
                            <div><ShieldCheck size={13} />{r.source?.name || "No source recorded"}</div>
                            <div><CalendarDays size={13} />Listed {short(r.listed)}</div>
                            <Freshness source={r.source} />
                            <div className="tag"><AlertTriangle size={11} />Illustrative · not independently verified</div>
                          </div>
                          {r.limitations?.length > 0 && (
                            <details className="limits">
                              <summary>What this does not tell you</summary>
                              <ul>{r.limitations.map((l) => <li key={l}>{l}</li>)}</ul>
                            </details>
                          )}
                          <div className="detail-next">
                            <div className="eyebrow">THE NEXT STEP</div>
                            <p>{r.ask}</p>
                          </div>
                          <button className="primary detail-cta" onClick={() => startTrail({ label: r.title, track: r.track, ask: r.ask }, r)}><Route size={15} />Start a trail from here</button>
                        </>
                      )}
                    </section>
                  )}
                </div>
              )}

              <section className="timeline-section">
                <div className="timeline-head">
                  <div>
                    <div className="eyebrow">TIME TELLS THE REST</div>
                    <h3>Follow a file, not just a moment.</h3>
                  </div>
                  <div className="timeline-controls">
                    <CalendarDays size={14} />
                    <select value={day} onChange={(e) => setDay(Number(e.target.value))}>
                      {Array.from({ length: 40 }, (_, i) => i + 1).map((d) => <option key={d} value={d}>{short(date(d))}</option>)}
                    </select>
                  </div>
                </div>
                <div className="timeline-bar">
                  {[15, 16, 17, 18, 19, 20, 21, 22].map((d) => (
                    <button key={d} className={"tl-day " + (d === day ? "active" : "") + (d < day ? " past" : "")} onClick={() => setDay(d)}>
                      <span>{d}</span><i>SEP</i>
                    </button>
                  ))}
                </div>
                <div className="timeline-legend"><span className="legend-dot answered" />Answered<span className="legend-dot due" />Due<span className="legend-dot overdue" />Overdue</div>
                <div className="trail-cards">
                  {files.slice(0, 6).map((f) => {
                    const rec = find(f.recordId);
                    return (
                      <button className="trail-card" key={f.id} onClick={() => { setActive(f.id); setModal("file"); }}>
                        <span className="trail-card-top"><Route size={15} style={{ color: layerColor(rec?.layer) }} /><small>{rec?.place}</small></span>
                        <strong>{f.title}</strong>
                        <small>{f.holder}</small>
                        <Badge value={state(f, today)} />
                      </button>
                    );
                  })}
                  <div className="packet-card">
                    <FileText size={24} />
                    <strong>The packet is the product.</strong>
                    <p>Send it on WhatsApp, read it on the radio, print it, or carry it on a stick.</p>
                  </div>
                </div>
              </section>
            </>
          )}

          {/* ----------------------------------------------------- TRAILS */}
          {tab === "Trails" && (
            <section className="page">
              <div className="eyebrow">TRAILS</div>
              <h1>Every file. <span>A way forward.</span></h1>
              <p className="page-sub">All trails and data-layer records on the map. Click any row to open it.</p>
              <div className="trails-list">
                {visible.map((x) => {
                  const isUserFile = files.some((f) => f.recordId === x.id);
                  const f = files.find((f) => f.recordId === x.id);
                  return (
                    <div className={"trail-row " + (isUserFile ? "tracked" : "untracked")} key={x.id}>
                      <span className="record-dot" style={{ background: layerColor(x.layer) }} />
                      <div className="trail-row-mid">
                        <strong>{x.title}</strong>
                        <small>{x.place} · {trackById(x.track)?.short}</small>
                      </div>
                      {isUserFile && f ? (
                        <>
                          <Badge value={state(f, today)} />
                          <button className="ghost sm" onClick={() => { setActive(f.id); setModal("file"); }}><FileText size={13} />Packet</button>
                        </>
                      ) : (
                        <button className="ghost sm" onClick={() => startTrail({ label: x.title, track: x.track || "transparency", ask: x.ask || "What is the next step for this location?" }, x)}><Plus size={13} />Track</button>
                      )}
                    </div>
                  );
                })}
                {files.filter((f) => !allTrails.some((x) => x.id === f.recordId)).map((f) => {
                  const rec = find(f.recordId) || layerRecords.find((x) => x.id === f.recordId);
                  const place = rec?.place || f.snapshot?.place || "Unknown location";
                  return (
                    <div className="trail-row tracked" key={f.id}>
                      <span className="record-dot" style={{ background: layerColor(f.track) }} />
                      <div className="trail-row-mid">
                        <strong>{f.title}</strong>
                        <small>{place} · {trackById(f.track)?.short}</small>
                      </div>
                      <Badge value={state(f, today)} />
                      <button className="ghost sm" onClick={() => { setActive(f.id); setModal("file"); }}><FileText size={13} />Packet</button>
                    </div>
                  );
                })}
                {layerRecords.length > 0 && (
                  <>
                    <div className="trails-section-label">DATA FOUNDATIONS</div>
                    {layerRecords.map((x) => {
                      const isUserFile = files.some((f) => f.recordId === x.id);
                      return (
                        <div className={"trail-row " + (isUserFile ? "tracked" : "untracked")} key={x.id} onClick={() => pick(x.id)}>
                          <span className="record-dot" style={{ background: layerColor(x.layer) }} />
                          <div className="trail-row-mid">
                            <strong>{x.title}</strong>
                            <small>{x.place} · {layerById(x.layer)?.name}</small>
                          </div>
                          {isUserFile ? (
                            <Badge value={state(files.find((f) => f.recordId === x.id), today)} />
                          ) : (
                            <button className="ghost sm" onClick={(e) => { e.stopPropagation(); startTrail({ label: x.title, track: x.track || layerById(x.layer)?.track || "transparency", ask: layerById(x.layer)?.evidence || "Use this location as evidence for a community trail." }, x) }}><Plus size={13} />Track</button>
                          )}
                        </div>
                      );
                    })}
                  </>
                )}
                {visible.length === 0 && layerRecords.length === 0 && files.filter((f) => !allTrails.some((x) => x.id === f.recordId)).length === 0 && <p className="empty">No trails in the current filters.</p>}
              </div>
            </section>
          )}

          {/* -------------------------------------------------- COMMUNITY */}
          {tab === "Community" && (
            <section className="page">
              <div className="eyebrow">RAISED BY RESIDENTS</div>
              <h1>Issues people are <span>already carrying.</span></h1>
              <p className="page-sub">
                Raise something that is not working. Neighbours back it. At {VOTE_THRESHOLD} votes an issue is community-verified;
                at {PROMOTE_THRESHOLD} it can become an official trail with a named holder and a date.
              </p>
              <div className="notice">
                <Info size={14} />
                <span>This build has no server. Votes are stored on this device only and are not shared with anyone. Say so before trusting a number.</span>
              </div>
              <div className="issue-grid">
                {issues.map((i) => (
                  <article className={"issue-card " + i.status} key={i.id}>
                    <div className="issue-top">
                      <span className="issue-id">{i.id}</span>
                      <span className="issue-track" style={{ color: trackColor(i.track) }}>{trackById(i.track)?.short}</span>
                      <span className={"issue-status " + i.status}>{i.status.replace("-", " ")}</span>
                    </div>
                    <h3>{i.title}</h3>
                    <div className="issue-place"><MapPin size={12} />{i.place}, {i.country}</div>
                    <p>{i.detail}</p>
                    {i.evidence && <div className="issue-evidence"><FileText size={12} />{i.evidence}</div>}
                    <div className="issue-foot">
                      <button className={"vote " + (voted.includes(i.id) ? "voted" : "")} onClick={() => vote(i.id)}>
                        <ThumbsUp size={14} />{i.votes}
                      </button>
                      <span className="issue-when">{short(i.created)} · {i.reporter}</span>
                      {canPromote(i) && (
                        <button className="ghost sm" onClick={() => promote(i)}><ArrowUpRight size={13} />Promote to trail</button>
                      )}
                      {i.status === "community-verified" && !canPromote(i) && (
                        <span className="issue-when">{PROMOTE_THRESHOLD - i.votes} more {PROMOTE_THRESHOLD - i.votes === 1 ? "vote" : "votes"} to promote</span>
                      )}
                      {i.status === "official" && <span className="official-tag"><CircleCheck size={12} />Official trail</span>}
                    </div>
                  </article>
                ))}
              </div>
              <button className="primary" onClick={() => setModal("issue")}><Flag size={15} />Raise an issue</button>
            </section>
          )}

          {/* ---------------------------------------------------- SOURCES */}
          {tab === "Sources" && (
            <section className="page">
              <div className="eyebrow">SOURCE LIBRARY</div>
              <h1>Trust starts <span>at the source.</span></h1>
              <p className="page-sub">Where each record comes from, what was checked, and when. Blank means it has not been checked — that is shown, not hidden.</p>
              <div className="source-list">
                {allTrails.map((x) => (
                  <div className="source-row" key={x.id}>
                    <span className="record-dot" style={{ background: layerColor(x.layer) }} />
                    <div className="source-mid">
                      <strong>{x.source?.name || "No source recorded"}</strong>
                      <small>{x.source?.type} · {x.source?.cadence || "cadence unknown"} · {x.place}</small>
                    </div>
                    <Freshness source={x.source} />
                    {x.source?.url
                      ? <a href={x.source.url} target="_blank" rel="noopener noreferrer">Open<ExternalLink size={12} /></a>
                      : <span className="no-link">No URL</span>}
                  </div>
                ))}
              </div>
              <div className="footnote">
                <div className="eyebrow">ABOUT THIS BUNDLE</div>
                <p>Data bundled {short(BUNDLE_DATE)}. {checkedCount} of {allTrails.length} record sources independently checked; the rest are recorded with their URL and marked unverified. A record is never shown as verified unless it is.</p>
              </div>

              <div className="datasets">
                <div className="eyebrow">PUBLIC DATA SOURCES · {verifiedCount()} OF {DATA_SOURCES.length} FETCH-VERIFIED ON 21 SEP 2026</div>
                <p className="page-sub">
                  The open datasets behind each layer. Every URL here was requested and its HTTP status recorded;
                  anything that answered with a bot challenge, a login wall, an empty JavaScript shell or an error
                  is marked unverified and says why.
                </p>
                {TRACKS.map((t) => {
                  const list = DATA_SOURCES.filter((s) => s.track === t.id);
                  if (!list.length) return null;
                  return (
                    <div className="dataset-group" key={t.id}>
                      <div className="dataset-track" style={{ color: t.color }}>{t.name}</div>
                      {list.map((s) => (
                        <div className={"dataset-row " + (s.verified ? "" : "unverified")} key={s.id}>
                          <span className="dataset-flag">
                            {s.verified ? <CircleCheck size={13} /> : <AlertTriangle size={13} />}
                          </span>
                          <div className="dataset-mid">
                            <strong>{s.name}</strong>
                            <small>{s.licence} · {s.cadence}</small>
                            {s.note && <em>{s.note}</em>}
                          </div>
                          <a href={s.url} target="_blank" rel="noopener noreferrer">Open<ExternalLink size={11} /></a>
                        </div>
                      ))}
                    </div>
                  );
                })}
                <div className="notice warn">
                  <AlertTriangle size={15} />
                  <div>
                    <strong>What we could not verify</strong>
                    {SOURCE_WARNINGS.map((w) => <p key={w}>— {w}</p>)}
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* ----------------------------------------------------- REPORT */}
          {tab === "Report" && (
            <section className="page narrow">
              <div className="eyebrow">SAFETY, REPORTING & PROTECTION</div>
              <h1>Report something <span>safely.</span></h1>
              <p className="page-sub">Nothing here is sent anywhere. Trail writes a record on this device and gives you a reference so you can carry it to a real recipient yourself.</p>

              <div className="notice warn">
                <AlertTriangle size={15} />
                <div>
                  <strong>Read this before you type.</strong>
                  <p>This build has no network and no server. It cannot send a report, cannot hide it from someone holding this device, and cannot promise you protection. For a report that could put you at risk, use a trusted organisation's secure channel — a legal aid provider, an oversight body, or a digital-security helpline — not this app.</p>
                </div>
              </div>

              <form className="report-form" onSubmit={(e) => {
                e.preventDefault();
                const v = Object.fromEntries(new FormData(e.currentTarget));
                const detail = String(v.detail || "").trim(), place = String(v.place || "").trim();
                if (!detail || !place) { setToast("A place and a description are needed."); return; }
                if (detail.length > 4000 || place.length > 200) { setToast("That is too long — shorten it and try again."); return; }
                const catId = String(v.category || reportCat);
                const catLabel = REPORT_CATEGORIES.find((c) => c.id === catId)?.label || catId;
                const rep = {
                  ref: refCode(), category: catLabel, categoryId: catId,
                  place,
                  country: String(v.country || "").trim() || (country !== "All Africa" ? country : ""),
                  when: String(v.when || "").trim() || "Not stated", detail,
                  outcome: String(v.outcome || "").trim() || "", created: today,
                };
                setReports((p) => [rep, ...p]);
                setReport(rep);
                e.currentTarget.reset();
              }}>
                <div className="form-grid">
                  <label>What is this about?
                    <select name="category" value={reportCat}
                            onChange={(e) => setReportCat(e.target.value)}>
                      {REPORT_CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
                    </select>
                  </label>
                  <label>Where (area or town, not an address)
                    <input name="place" placeholder="e.g. Lira" />
                  </label>
                  <label>Country
                    <input name="country" placeholder="e.g. Uganda" />
                  </label>
                  <label>When did it happen?
                    <input name="when" placeholder="e.g. last week" />
                  </label>
                </div>
                <label className="full">What happened?
                  <textarea name="detail" rows="5" placeholder="Describe what happened. Do not include names, ID numbers, phone numbers or addresses." />
                </label>
                <label className="full">What would you want to happen?
                  <input name="outcome" placeholder="e.g. an inspection, a written answer, a referral" />
                </label>
                <div className="report-actions">
                  <button type="submit" className="primary"><Lock size={15} />Create the record</button>
                  <button type="button" className="ghost" onClick={() => { setReports([]); setReport(null); localStorage.removeItem(REPORT_KEY); setToast("Everything on this device has been cleared."); }}>
                    <Trash2 size={14} />Clear this device
                  </button>
                </div>
              </form>

              <div className="pathways">
                <div className="eyebrow">WHERE THIS CAN GO</div>
                <p className="page-sub">
                  Verified routes for this kind of report. Each was fetched and its status recorded on 21 Sep 2026.
                  You carry the record there yourself — Trail cannot send it.
                </p>
                <div className="pathway-list">
                  {(PATHWAYS_BY_CATEGORY[reportCat] || []).map((id) => {
                    const s = sourceById(id);
                    if (!s) return null;
                    return (
                      <div className={"pathway " + (s.verified ? "" : "unverified")} key={id}>
                        <span className="dataset-flag">
                          {s.verified ? <CircleCheck size={13} /> : <AlertTriangle size={13} />}
                        </span>
                        <div className="dataset-mid">
                          <strong>{s.name}</strong>
                          <small>{s.verified ? "Verified route" : "Unverified — do not rely on this yet"}</small>
                          {s.note && <em>{s.note}</em>}
                        </div>
                        <a href={s.url} target="_blank" rel="noopener noreferrer">Open<ExternalLink size={11} /></a>
                      </div>
                    );
                  })}
                </div>

                <div className="eyebrow" style={{ marginTop: "18px" }}>BEFORE YOU SEND ANYTHING</div>
                <div className="pathway-list">
                  {SAFETY_GUIDES.map((id) => {
                    const s = sourceById(id);
                    if (!s) return null;
                    return (
                      <div className="pathway" key={id}>
                        <span className="dataset-flag"><ShieldCheck size={13} /></span>
                        <div className="dataset-mid">
                          <strong>{s.name}</strong>
                          <small>{s.note || "Device and metadata guidance"}</small>
                        </div>
                        <a href={s.url} target="_blank" rel="noopener noreferrer">Open<ExternalLink size={11} /></a>
                      </div>
                    );
                  })}
                </div>

                <div className="notice warn">
                  <AlertTriangle size={15} />
                  <div>
                    <strong>Anonymity is not guaranteed anywhere in this list</strong>
                    <p>No state-run complaint mechanism could be confirmed to accept a genuinely anonymous submission — not one, across the countries researched. If being identified would put you at risk, contact a digital-security helpline or a defender-protection organisation before you contact anyone else. That is what they exist for.</p>
                  </div>
                </div>
              </div>

              {report && (
                <div className="report-result">
                  <div className="report-ref">
                    <span>Your reference</span>
                    <b>{report.ref}</b>
                    <small>Write this down. It is the only link to this record.</small>
                  </div>
                  <pre className="packet-preview">{reportPacket(report)}</pre>
                  <PacketActions text={reportPacket(report)} filename={`${report.ref}.txt`} onToast={setToast} onPdf={() => printReport(report)} />
                </div>
              )}

              {reports.length > 0 && (
                <div className="report-list">
                  <div className="eyebrow">ON THIS DEVICE ({reports.length})</div>
                  {reports.map((rep) => (
                    <button key={rep.ref} className="report-row" onClick={() => setReport(rep)}>
                      <span>{rep.ref}</span><small>{rep.category} · {rep.place}</small><ArrowRight size={13} />
                    </button>
                  ))}
                </div>
              )}
            </section>
          )}
        </main>
      </div>

      {/* ------------------------------------------------------- MODALS */}

      {modal === "template" && (
        <Modal title="Start a trail" tag="CHOOSE A TRAIL" close={() => setModal(null)} wide>
          <p className="modal-sub">Trails are shaped by what you are trying to change. Pick the one that matches the situation.</p>
          {TRACKS.map((t) => (
            <div className="template-group" key={t.id}>
              <div className="eyebrow" style={{ color: t.color }}>{t.name.toUpperCase()}</div>
              <p className="template-blurb">{t.blurb}</p>
              <div className="template-list">
                {TRAIL_TEMPLATES.filter((x) => x.track === t.id).map((x) => (
                  <button key={x.id} className="template" onClick={() => startTrail(x)}>
                    <Route size={15} style={{ color: t.color }} />
                    <span>{x.label}</span>
                    <ArrowRight size={14} />
                  </button>
                ))}
              </div>
            </div>
          ))}
          <div className="modal-actions"><button className="ghost" onClick={() => setModal(null)}>Cancel</button></div>
        </Modal>
      )}

      {modal === "issue" && (
        <Modal title="Raise an issue" tag="COMMUNITY" close={() => setModal(null)} wide>
          <p className="modal-sub">Describe something that is not working. Others can back it. Enough backing makes it an official trail.</p>
          <form onSubmit={(e) => {
            e.preventDefault();
            const v = Object.fromEntries(new FormData(e.currentTarget));
            const title = String(v.title || "").trim(), detail = String(v.detail || "").trim(), place = String(v.place || "").trim();
            if (!title || !detail || !place) { setToast("Title, place and description are needed."); return; }
            const layer = String(v.layer || "services");
            const tmpl = TRAIL_TEMPLATES.find((t) => t.track === (layerById(layer)?.track)) ;
            // Parse coordinates explicitly: `Number("") || fallback` would also
            // swallow a legitimate 0. Validate ranges so bad input cannot park
            // a marker off the globe where it renders as nothing.
            const rawLon = String(v.lon ?? "").trim(), rawLat = String(v.lat ?? "").trim();
            const lon = rawLon === "" ? 37.9 : Number(rawLon);
            const lat = rawLat === "" ? -1.3 : Number(rawLat);
            if (!Number.isFinite(lon) || !Number.isFinite(lat) || lon < -180 || lon > 180 || lat < -90 || lat > 90) {
              setToast("Coordinates look wrong — longitude −180…180, latitude −90…90.");
              return;
            }
            const existing = new Set([...issues.map((i) => i.id), ...ISSUE_SEEDS.map((i) => i.id)]);
            let id = "";
            for (let attempt = 0; attempt < 20; attempt++) {
              const cand = `ISS-${String(Math.floor(Math.random() * 900) + 100)}`;
              if (!existing.has(cand)) { id = cand; break; }
            }
            if (!id) id = `ISS-${Date.now().toString(36).toUpperCase()}`;
            const item = {
              id,
              title, place, country: String(v.country || country !== "All Africa" ? (v.country || country) : "Kenya"),
              coords: [lon, lat],
              track: layerById(layer)?.track ?? "transparency", layer,
              detail, evidence: String(v.evidence || "").trim() || "",
              created: today, votes: 0, status: "open", reporter: "Anonymous",
              ask: tmpl?.ask,
            };
            if (!validIssue(item)) { setToast("Check the fields — this did not validate."); return; }
            setIssues((p) => [item, ...p]);
            setModal(null);
            setTab("Community");
            setToast("Issue raised. It starts with no votes — that is honest, not a failure.");
          }}>
            <div className="form-grid">
              <label>What is the issue?<input name="title" placeholder="e.g. Water point at the market is dry" /></label>
              <label>Layer
                <select name="layer" defaultValue="water">
                  {layers.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
                </select>
              </label>
              <label>Place<input name="place" placeholder="e.g. Kathiani" /></label>
              <label>Country
                <select name="country" defaultValue="Kenya">{countries.map((c) => <option key={c}>{c}</option>)}</select>
              </label>
              <label>Longitude<input name="lon" placeholder="37.35" /></label>
              <label>Latitude<input name="lat" placeholder="-1.55" /></label>
            </div>
            <label className="full">Describe it<textarea name="detail" rows="4" placeholder="What is happening, who it affects, what you have already tried." /></label>
            <label className="full">What evidence do you have?<input name="evidence" placeholder="e.g. photo of the notice, date you called" /></label>
            <div className="modal-actions">
              <button type="button" className="ghost" onClick={() => setModal(null)}>Cancel</button>
              <button type="submit" className="primary"><Flag size={14} />Raise it</button>
            </div>
          </form>
        </Modal>
      )}

      {modal === "issueView" && issueFocus && (() => {
        // Derive live state so the vote count updates inside the open modal.
        const live = issues.find((x) => x.id === issueFocus.id) || issueFocus;
        return (
        <Modal title={live.title} tag={`${live.id} · COMMUNITY ISSUE`} close={() => setModal(null)} wide>
          <div className="issue-detail">
            <div className="detail-meta">
              <div><MapPin size={13} />{live.place}, {live.country}</div>
              <div><CalendarDays size={13} />Raised {short(live.created)} by {live.reporter}</div>
              <div className="tag"><AlertTriangle size={11} />{live.status.replace("-", " ")}</div>
            </div>
            <p>{live.detail}</p>
            {live.evidence && <div className="issue-evidence"><FileText size={12} />{live.evidence}</div>}
            <div className="issue-foot">
              <button className={"vote " + (voted.includes(live.id) ? "voted" : "")} onClick={() => vote(live.id)}>
                <ThumbsUp size={14} />{live.votes} {voted.includes(live.id) ? "backed" : "back this"}
              </button>
              {canPromote(live) && (
                <button className="primary sm" onClick={() => { promote(live); setModal(null); }}><ArrowUpRight size={13} />Promote to official trail</button>
              )}
            </div>
            <div className="notice"><Info size={14} /><span>Votes are counted on this device only. Without a relay, nobody else sees them.</span></div>
          </div>
        </Modal>
        );
      })()}

      {modal === "file" && file && (
        <Modal title={file.title} tag={file.id} close={() => setModal(null)} wide>
          <div className="file-detail">
            <div className="file-meta">
              <div><ShieldCheck size={13} />Holder: {file.holder}</div>
              <div><Users size={13} />Witness: {file.witness}</div>
              <div><CalendarDays size={13} />Due {short(file.due)}</div>
              <Badge value={state(file, today)} />
            </div>
            <div className="format-toggle">
              {["packet", "whatsapp", "sms", "radio"].map((f) => (
                <button key={f} className={format === f ? "selected" : ""} onClick={() => setFormat(f)}>{f}</button>
              ))}
            </div>
            <pre className="packet-preview">{packetFor(file)}</pre>
            <PacketActions text={packetFor(file)} filename={`${file.id}-${format}.txt`} onToast={setToast} onPdf={() => printTrail(file)} />
          </div>
        </Modal>
      )}

      {modal === "search" && (
        <Modal title="Find a place, fact or trail" tag="SEARCH" close={() => setModal(null)} wide>
          <form className="search-form" onSubmit={(e) => { e.preventDefault();
            const v = Object.fromEntries(new FormData(e.currentTarget));
            const q = String(v.q || "").toLowerCase().trim(); if (!q) return;
            const hay = (x) => `${x.title || ""} ${x.place || ""} ${x.country || ""} ${x.theme || ""}`.toLowerCase();
            const hit = allTrails.find((x) => hay(x).includes(q));
            const lay = !hit && layerRecords.find((x) => hay(x).includes(q));
            const iss = !hit && !lay && issues.find((i) => `${i.title || ""} ${i.place || ""} ${i.detail || ""}`.toLowerCase().includes(q));
            if (hit) { pick(hit.id); setTab("Explore"); setModal(null); setToast(`Showing ${hit.title}`); }
            else if (lay) { pick(lay.id); setTab("Explore"); setModal(null); setToast(`Showing ${lay.title}`); }
            else if (iss) { setIssueFocus(iss); setModal("issueView"); }
            else setToast("Nothing matched. Try a place name or a word from the issue.");
          }}>
            <input name="q" placeholder="Search trails, places, data points, issues" autoFocus />
          </form>
          <div className="search-hint">Searches titles, places, data-layer points and community issues. Nothing leaves this device.</div>
        </Modal>
      )}

      {modal === "about" && (
        <Modal title="How Trail works" tag="THE WORKSPACE" close={() => setModal(null)} wide>
          <div className="about-body">
            <p><strong>Trail is a workspace for civic questions, not a news feed.</strong> Each record names a source, its limits, a responsible office, and the exact question to ask.</p>
            <ol className="about-steps">
              <li><strong>Find</strong> a record in one of three tracks.</li>
              <li><strong>Check</strong> the source and what it does not tell you.</li>
              <li><strong>Start a trail</strong>, naming a holder and a witness.</li>
              <li><strong>Leave with a packet</strong> — send it, print it, broadcast it, carry it.</li>
              <li><strong>Come back</strong> on the date you set. Silence is not an answer.</li>
            </ol>
            <p><strong>Community issues</strong> run the other way: residents raise problems, neighbours back them, and well-supported issues become official trails.</p>
            <div className="notice"><Info size={14} /><span>No server, no tracking, no account. Everything you create stays on this device until you delete it.</span></div>
            <div className="modal-actions"><button className="primary" onClick={() => setModal(null)}>Close</button></div>
          </div>
        </Modal>
      )}

      {toast && <div className="toast">{toast}</div>}
    </div>

    {/* Rich print sheet for PDF export — hidden on screen, the only thing
        printed. Works offline with zero dependencies: the browser's own
        print-to-PDF, so it runs from the USB single file too. */}
    {printDoc && (
      <div className="print-sheet" aria-hidden="true">
        <div className="ps-mast">
          <div className="ps-brand">TRAIL <b>AFRICA</b></div>
          <div className="ps-ref">{printDoc.kind === "trail" ? "NEXT-STEP PACKET" : "SAFE REPORT"} · {printDoc.ref}</div>
        </div>
        <h1>{printDoc.title}</h1>
        <div className="ps-place">{printDoc.place}</div>
        {printDoc.kind === "trail" ? (
          <>
            {(printDoc.theme || printDoc.track) && <div className="ps-sub">{[printDoc.theme, printDoc.track].filter(Boolean).join(" · ")}</div>}
            <div className="ps-grid">
              <div><span>Proposed holder</span><b>{printDoc.holder}</b></div>
              <div><span>Proposed witness</span><b>{printDoc.witness}</b></div>
              <div><span>Response requested by</span><b>{printDoc.due}</b></div>
              <div><span>Review closes</span><b>{printDoc.expires}</b></div>
              <div><span>Opened</span><b>{printDoc.created}</b></div>
              <div><span>State</span><b>{printDoc.state}</b></div>
            </div>
            <h2>What to do next</h2>
            <p className="ps-ask">Ask exactly this: {printDoc.ask}</p>
            <ol>
              <li>Take the name and role of the person who receives it.</li>
              <li>Ask for the answer in writing, with a reference number and a date.</li>
              <li>If they cannot answer, ask who can — name, office, and when they sit.</li>
              <li>Come back on the date you set. Silence is not an answer.</li>
            </ol>
            <h2>Source &amp; limits</h2>
            {printDoc.source ? (
              <>
                <p>{printDoc.source.name}{printDoc.source.url ? ` — ${printDoc.source.url}` : " — no URL recorded"}</p>
                <p>Class: {printDoc.source.type} · Checked: {printDoc.source.checked || "never"}{printDoc.source.verified ? " (checked by this project)" : " (NOT independently verified)"} · Cadence: {printDoc.source.cadence || "unknown"}</p>
                {printDoc.limitations.length > 0 && (
                  <ul>{printDoc.limitations.map((l) => <li key={l}>{l}</li>)}</ul>
                )}
                <p className="ps-dim">This packet records a question, not an established fact.</p>
              </>
            ) : <p>No source recorded for this item. Treat it as unverified.</p>}
            <h2>Privacy</h2>
            <p>No names, ID numbers, phone numbers or household locations should be written into this packet. You are sharing a question about a public service, not information about a person.</p>
            <h2>Acknowledgement — fill in by hand</h2>
            <div className="ps-lines">
              <div>Received by: ______________________&nbsp;&nbsp; Role: ______________________&nbsp;&nbsp; Date: __________</div>
              <div>Witness: ______________________&nbsp;&nbsp; Signature: ______________________&nbsp;&nbsp; Date: __________</div>
            </div>
            <h2>Follow-up</h2>
            <p>At the next visit or meeting, quote {printDoc.ref} and ask: has a written answer been issued?{printDoc.due ? ` Response requested by ${printDoc.due}.` : ""}</p>
          </>
        ) : (
          <>
            <div className="ps-grid">
              <div><span>Recorded</span><b>{printDoc.created}</b></div>
              <div><span>When it happened</span><b>{printDoc.when}</b></div>
            </div>
            <h2>What happened (as written by the reporter)</h2>
            <p>{printDoc.detail}</p>
            <h2>What the reporter wants to happen</h2>
            <p>{printDoc.outcome || "Not stated."}</p>
            <h2>Safety</h2>
            <p>This record was created on the reporter's own device. It has not been sent anywhere. It contains no name, phone number or identifier. Do not add any before forwarding. If you are forwarding this, send it through a channel you trust and delete it afterwards.</p>
          </>
        )}
        <div className="ps-foot">Trail Africa · Data bundle {BUNDLE_DATE} · A fact should lead somewhere.</div>
      </div>
    )}
    </>
  );
}
