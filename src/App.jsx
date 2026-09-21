import React, { useState, useEffect, useMemo, useRef } from "react";
import { geoMercator, geoOrthographic, geoPath, geoDistance, geoGraticule10 } from "d3-geo";
import {
  Search, Globe2, Map, Layers, Route, Files, BookOpen, ShieldCheck,
  Settings2, HelpCircle, X, Check, CalendarDays, MapPin, Link2,
  FileText, Download, Printer, Radio, Smartphone, Wifi, ExternalLink,
  Leaf, Landmark, Users, Compass, Crosshair, Menu, Copy, CircleCheck,
  ChevronDown, ChevronRight, Plus, Minus, ArrowUpRight, ArrowRight,
  PanelLeftClose, PanelLeft, TrendingUp, Activity, Eye,
} from "lucide-react";
import {
  LAYERS as layers, RECORDS, SEED_FILES as seeds, dateLabel as short,
  placeLabel, stateAt as state, loadFiles, packetText as packet,
  addDays, STORAGE_KEY, validFile, recordById,
} from "./data";
import "@fontsource-variable/dm-sans/wght.css";
import "@fontsource-variable/manrope/wght.css";

const records = RECORDS.map((r) => ({
  ...r,
  place: placeLabel(r),
  date: r.listed,
}));
const find = (id) => records.find((r) => r.id === id);
const date = (day) => addDays("2026-09-01", day - 1);
const load = () => {
  try {
    return loadFiles(localStorage);
  } catch {
    return structuredClone(seeds);
  }
};
const layerColor = (id) => layers.find((l) => l.id === id)?.color ?? "#888";

const GLOBE_W = 1060, GLOBE_H = 675, GLOBE_CX = GLOBE_W / 2, GLOBE_CY = GLOBE_H / 2;
const GLOBE_HOME = [-17, -2];

function GodsEye({ geo, records, selected, onPick }) {
  const [rot, setRot] = useState(GLOBE_HOME);
  const [zoom, setZoom] = useState(1);
  const [dragging, setDragging] = useState(false);
  const drag = useRef(null);
  const reduce = typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

  useEffect(() => {
    if (dragging || reduce) return;
    let raf = 0, last = 0;
    const step = (t) => {
      if (t - last >= 48 && !document.hidden) { last = t; setRot(([l, p]) => [l - 0.28, p]); }
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [dragging, reduce]);

  const { projection, path, centre } = useMemo(() => {
    const p = geoOrthographic().rotate(rot).scale(252 * zoom).translate([GLOBE_CX, GLOBE_CY]);
    return { projection: p, path: geoPath(p), centre: p.invert([GLOBE_CX, GLOBE_CY]) };
  }, [rot, zoom]);

  const onNearSide = (coords) => !centre || geoDistance(coords, centre) < Math.PI / 2 - 0.06;

  const startDrag = (e) => { drag.current = { x: e.clientX, y: e.clientY, rot }; setDragging(true); e.currentTarget.setPointerCapture?.(e.pointerId); };
  const moveDrag = (e) => {
    const d = drag.current; if (!d) return;
    const k = 0.3 / zoom;
    setRot([d.rot[0] + (e.clientX - d.x) * k, Math.max(-72, Math.min(72, d.rot[1] - (e.clientY - d.y) * k))]);
  };
  const endDrag = (e) => { drag.current = null; setDragging(false); e.currentTarget.releasePointerCapture?.(e.pointerId); };

  const lon = ((rot[0] + 540) % 360) - 180;

  return (
    <div className={"globe " + (dragging ? "dragging" : "")}>
      <svg className="globe-svg" viewBox={`0 0 ${GLOBE_W} ${GLOBE_H}`} onPointerDown={startDrag} onPointerMove={moveDrag} onPointerUp={endDrag} onPointerCancel={endDrag}>
        <defs>
          <radialGradient id="globe-sea" cx="36%" cy="28%" r="82%">
            <stop offset="0%" stopColor="#1a3a2a" /><stop offset="55%" stopColor="#0f2a1a" /><stop offset="100%" stopColor="#071410" />
          </radialGradient>
          <radialGradient id="globe-shade" cx="34%" cy="26%" r="86%">
            <stop offset="0%" stopColor="#2a5a3a" stopOpacity="0.4" /><stop offset="52%" stopColor="#1a3a2a" stopOpacity="0.05" /><stop offset="100%" stopColor="#000" stopOpacity="0.2" />
          </radialGradient>
          <clipPath id="globe-clip"><path d={path({ type: "Sphere" }) || ""} /></clipPath>
        </defs>
        <path className="globe-sphere" d={path({ type: "Sphere" }) || ""} fill="url(#globe-sea)" />
        <g clipPath="url(#globe-clip)">
          <path className="globe-graticule" d={path(geoGraticule10()) || ""} />
          {geo?.features.map((f) => <path key={f.id} className="country" d={path(f) || ""} />)}
        </g>
        <path className="globe-shade" d={path({ type: "Sphere" }) || ""} fill="url(#globe-shade)" pointerEvents="none" />
        <path className="globe-limb" d={path({ type: "Sphere" }) || ""} pointerEvents="none" />
        {records.filter((x) => onNearSide(x.coords)).map((x) => {
          const p = projection(x.coords); if (!p) return null;
          const isSel = selected === x.id;
          return (
            <g className={"marker " + (isSel ? "selected" : "")} key={x.id} style={{ "--pin": layerColor(x.layer) }}
               transform={`translate(${p[0]},${p[1]})`} role="button" tabIndex="0" aria-label={x.title + ", " + x.place}
               onClick={() => onPick(x.id)} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onPick(x.id); } }}>
              <circle className="halo" r={isSel ? 22 : 14} />
              <circle className="ring" r={isSel ? 11 : 8} />
              <circle className="core" r={isSel ? 4 : 3} />
              <rect className="pin-label-bg" x="16" y="-11" width={isSel ? 86 : 74} height="22" rx="4" />
              <text className="pin-label" x="24" y="3">{x.place.split(",")[0].replace(" County", "")}</text>
            </g>
          );
        })}
      </svg>
      <div className="globe-controls">
        <button onClick={() => { setRot(GLOBE_HOME); setZoom(1); }}>Reset</button>
        <span className="globe-readout">{Math.round(lon)}° · {Math.round(rot[1] * -1)}°</span>
        <button aria-label="Zoom in" onClick={() => setZoom((z) => Math.min(2.4, +(z + 0.2).toFixed(2)))}>+</button>
        <button aria-label="Zoom out" onClick={() => setZoom((z) => Math.max(0.85, +(z - 0.2).toFixed(2)))}>−</button>
      </div>
      {!geo && <div className="map-loading">Opening…</div>}
    </div>
  );
}

function Modal({ title, tag, children, close, wide }) {
  const ref = useRef(), fn = useRef(close);
  fn.current = close;
  useEffect(() => {
    const before = document.activeElement, el = ref.current; el.focus();
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
          <button className="icon-btn" aria-label="Close dialog" onClick={close}><X /></button>
        </div>
        {children}
      </section>
    </div>
  );
}

export default function App() {
  const [tab, T] = useState("Explore"), [selected, S] = useState("mak"), [enabled, E] = useState(layers.map((l) => l.id)),
    [country, C] = useState("All Africa"), [view, V] = useState("Globe"), [geo, G] = useState(null),
    [mapError, ME] = useState(false), [day, D] = useState(21), [files, F] = useState(load),
    [modal, M] = useState(null), [active, A] = useState(null), [format, PF] = useState("print"),
    [query, Q] = useState(""), [toast, Toast] = useState(""), [connect, Connect] = useState(false),
    [links, Links] = useState([]),
    [showLayers, SL] = useState(() => (typeof window === "undefined" ? true : window.innerWidth > 900)), [nav, N] = useState(false),
    [lang, L] = useState("EN"), [langMenu, LM] = useState(false), [online, ON] = useState(navigator.onLine),
    [ready, R] = useState(false), [now, setNow] = useState(new Date());

  const r = find(selected), today = date(day), file = files.find((f) => f.id === active),
    visible = records.filter((x) => enabled.includes(x.layer) && (country === "All Africa" || x.place.endsWith(country)) && x.date <= today);

  const projection = useMemo(() => geoMercator().center([17, 2]).scale(350).translate([418, 315]), []);
  const flatPath = useMemo(() => geoPath(projection), [projection]);

  useEffect(() => {
    fetch("/africa.json").then((x) => { if (!x.ok) throw Error(); return x.json(); }).then(G).catch(() => ME(true));
    const on = () => ON(true), off = () => ON(false);
    window.addEventListener("online", on); window.addEventListener("offline", off);
    if (import.meta.env.PROD && "serviceWorker" in navigator)
      navigator.serviceWorker.register("/sw.js").then(() => navigator.serviceWorker.ready).then(() => R(true)).catch(() => {});
    return () => { window.removeEventListener("online", on); window.removeEventListener("offline", off); };
  }, []);

  useEffect(() => { const t = setInterval(() => setNow(new Date()), 1000); return () => clearInterval(t); }, []);

  useEffect(() => { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(files)); } catch { Toast("Storage unavailable."); } }, [files]);
  useEffect(() => { if (toast) { const timer = setTimeout(() => Toast(""), 4500); return () => clearTimeout(timer); } }, [toast]);

  const changeTab = (t) => { T(t); N(false); Q(""); };
  const pick = (id) => { if (connect && id !== selected) Links((p) => (p.includes(id) ? p.filter((i) => i !== id) : [...p, id])); else { S(id); Links([]); } };
  const open = (f) => { A(f.id); M("file"); };
  const start = () => { Connect(false); M("create"); };
  const copy = async (text) => { try { await navigator.clipboard.writeText(text); Toast("Copied."); } catch { Toast("Copy manually."); } };
  const create = (e) => {
    e.preventDefault(); const v = Object.fromEntries(new FormData(e.currentTarget));
    if (["title", "holder", "witness"].some((k) => !v[k].trim())) return Toast("Title, holder, and witness required.");
    const f = { id: `TRL-2609${day}-${crypto.randomUUID().slice(0, 6).toUpperCase()}`, recordId: selected, title: v.title.trim(), holder: v.holder.trim(), witness: v.witness.trim(), created: today, due: v.due, expires: addDays(v.due, 7), answered: null, links: [...links] };
    if (!validFile(f)) return Toast("Check fields and dates."); F((p) => [f, ...p]); A(f.id); M("receipt"); Links([]);
  };
  const download = () => {
    const url = URL.createObjectURL(new Blob([packet(file, format, today)], { type: "text/plain;charset=utf-8" }));
    const a = document.createElement("a"); a.href = url; a.download = file.id + "-" + format + ".txt"; a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000); Toast("Packet downloaded.");
  };

  const labels = { EN: ["Explore", "My trails", "Source library"], FR: ["Explorer", "Mes parcours", "Sources"], PT: ["Explorar", "Meus percursos", "Fontes"], AR: ["استكشف", "ملفاتي", "المصادر"] }[lang];
  const layerDot = (id) => layers.find((l) => l.id === id)?.color ?? "#888";

  const totalRecords = visible.length;
  const totalCountries = new Set(visible.map((x) => x.place.split(", ").at(-1))).size;
  const answeredCount = files.filter((f) => f.answered).length;
  const pendingCount = files.filter((f) => !f.answered && f.due >= today).length;

  const layerStats = layers.map((l) => ({ ...l, count: records.filter((r) => r.layer === l.id).length })).filter((l) => l.count > 0);

  return (
    <div className="app">
      {nav && <div className="nav-scrim" onClick={() => N(false)} />}
      <aside className={"sidebar " + (nav ? "open" : "")} inert={!!modal}>
        <a href="#explore" aria-label="Trail home" onClick={() => changeTab("Explore")}>
          <div className="brand"><span>TRAIL</span><b>.</b></div>
        </a>
        <div className="workspace-tag"><i />AFRICAN CIVIC WORKSPACE</div>
        <div className="side-label">WORKSPACE</div>
        <nav>
          {[["Explore", Compass], ["My trails", Route], ["Source library", BookOpen]].map(([name, Icon], i) => (
            <button className={tab === name ? "active" : ""} key={name} onClick={() => changeTab(name)}>
              <Icon size={17} strokeWidth={1.6} />{labels[i]}
              {i === 1 && <span className="count">{String(files.length).padStart(2, "0")}</span>}
              {i === 0 && <i />}
            </button>
          ))}
        </nav>
        <hr />
        <div className="side-label">DASHBOARD</div>
        <div className="side-stats">
          <div className="stat"><span className="stat-num">{totalRecords}</span><span className="stat-label">Records</span></div>
          <div className="stat"><span className="stat-num">{totalCountries}</span><span className="stat-label">Countries</span></div>
          <div className="stat"><span className="stat-num">{answeredCount}</span><span className="stat-label">Answered</span></div>
          <div className="stat"><span className="stat-num">{pendingCount}</span><span className="stat-label">Pending</span></div>
        </div>
        <hr />
        <div className="side-label">LAYERS</div>
        <div className="side-layers">
          {layers.map((l) => (
            <button key={l.id} className={enabled.includes(l.id) ? "active" : ""} onClick={() => E((p) => (p.includes(l.id) ? p.filter((x) => x !== l.id) : [...p, l.id]))}>
              <i style={{ background: l.color }} />{l.name}<span className="checkbox">{enabled.includes(l.id) && <Check size={10} />}</span>
            </button>
          ))}
        </div>
        <div className="side-bottom">
          <div className="purpose">
            <h3>A fact should lead somewhere.</h3>
            <p>Not just a point on a map. A next step in your hands.</p>
            <button onClick={() => M("about")}>Meet Trail <ArrowUpRight size={14} /></button>
          </div>
          <button className="help" onClick={() => M("about")}><HelpCircle size={15} />A little guidance</button>
        </div>
      </aside>

      <div className="main-shell" inert={!!modal}>
        <header>
          <div className="header-left">
            <button className="icon-btn mobile-menu" aria-label="Menu" onClick={() => N(true)}><Menu /></button>
            <span className="prototype"><i />PROTOTYPE</span>
            <div className="country-select">
              <Globe2 size={15} />
              <select aria-label="Region" value={country} onChange={(e) => C(e.target.value)}>
                {["All Africa", ...new Set(records.map((r) => r.place.split(", ").at(-1)))].map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div className="header-center">
            <div className="live-indicator"><i />LIVE</div>
            <div className="now">
              <div className="now-time">{now.toUTCString().slice(17, 25)}<span> UTC</span></div>
              <div className="now-date">{now.toUTCString().slice(0, 16)}</div>
            </div>
            <div className="defcon">DEFCON <span>5</span></div>
          </div>
          <div className="header-right">
            <button className="search-button" onClick={() => { Q(""); M("search"); }}>
              <Search size={15} /><span>Find a place, fact, or trail</span><kbd>⌘ K</kbd>
            </button>
            <div className="language">
              <button aria-label="Language" onClick={() => LM(!langMenu)}><Globe2 size={14} />{lang}<ChevronDown size={12} /></button>
              {langMenu && <div className="language-menu">{["EN", "FR", "PT", "AR"].map((v) => <button key={v} onClick={() => { L(v); LM(false); }}>{v}{lang === v && <Check size={12} />}</button>)}</div>}
            </div>
            <span className="avatar">CW</span>
          </div>
        </header>

        <main>
          {tab === "Explore" ? (
            <>
              <section className="intro">
                <div>
                  <div className="eyebrow">— FROM INFORMATION TO ACTION</div>
                  <h1>Trusted civic information, across Africa.</h1>
                  <p>Find a fact. Connect it to the office that holds the next step. Follow it through.</p>
                </div>
                <button className="primary intro-cta" onClick={start}><Plus size={16} />Start a trail</button>
              </section>

              <div className="toolbar">
                <div className="toolbar-left">
                  <span className="record-count"><b>{totalRecords}</b> civic records across {totalCountries} countries</span>
                  <small><i />Illustrative dataset</small>
                </div>
                <div className="toolbar-right">
                  <div className="segmented">
                    {[["Globe", Globe2], ["Map", Map], ["List", Files]].map(([name, Icon]) => (
                      <button className={view === name ? "selected" : ""} key={name} onClick={() => V(name)}>
                        <Icon size={14} strokeWidth={1.6} />{name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="stage">
              <section className={"atlas " + (view === "List" ? "list-view" : "")}>
                <div className="map-dots" />
                {view !== "List" ? (
                  <>
                    <div className="atlas-heading">
                      <div className="eyebrow">{view === "Globe" ? "AFRICA, WHOLE" : "THE CONNECTED CONTINENT"}</div>
                      <p>{view === "Globe" ? "One continent. Drag to turn." : "Tap a place to see its records."}</p>
                    </div>
                    {view === "Globe" ? (
                      <GodsEye geo={geo} records={visible} selected={selected} onPick={pick} />
                    ) : (
                      <svg className="africa-map" viewBox="0 0 1060 675" role="group" aria-label="Africa civic map">
                        <g>
                          {geo?.features.map((f) => (
                            <path key={f.id} className={"country c" + f.id} d={flatPath(f) || ""} />
                          ))}
                          {[
                            [[2, 27], "ALGERIA"], [[18, 27], "LIBYA"], [[30, 27], "EGYPT"],
                            [[9, 17], "NIGER"], [[19, 15], "CHAD"], [[30, 15], "SUDAN"],
                            [[39, 8], "ETHIOPIA"], [[23, -2], "DR CONGO"], [[17, -12], "ANGOLA"],
                            [[24, -22], "BOTSWANA"], [[46, -20], "MADAGASCAR"],
                          ].map(([c, n]) => {
                            const p = projection(c);
                            return <text className="country-label" key={n} x={p[0]} y={p[1]}>{n}</text>;
                          })}
                          <text className="ocean" x="130" y="320">ATLANTIC</text>
                          <text className="ocean" x="140" y="338">OCEAN</text>
                          <text className="ocean" x="676" y="420">INDIAN</text>
                          <text className="ocean" x="682" y="438">OCEAN</text>
                          {links.map((id) => {
                            const a = projection(r.coords), b = projection(find(id).coords);
                            return <path key={id} className="drawn-link" d={`M${a} Q${(a[0] + b[0]) / 2} ${Math.min(a[1], b[1]) - 65} ${b}`} />;
                          })}
                          {visible.map((x) => {
                            let [a, b] = projection(x.coords);
                            const isSel = selected === x.id;
                            return (
                              <g className={"marker " + (isSel ? "selected" : "")} key={x.id}
                                 style={{ "--pin": layerColor(x.layer) }} transform={`translate(${a},${b})`}
                                 role="button" tabIndex="0" aria-label={x.title + ", " + x.place}
                                 onClick={() => pick(x.id)}
                                 onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); pick(x.id); } }}>
                                <circle className="halo" r={isSel ? 24 : 15} />
                                <circle className="ring" r={isSel ? 12 : 8} />
                                <circle className="core" r={isSel ? 5 : 3} />
                                <rect className="pin-label-bg" x="16" y="-11" width={isSel ? 86 : 74} height="22" rx="4" />
                                <text className="pin-label" x="24" y="3">{x.place.split(",")[0].replace(" County", "")}</text>
                              </g>
                            );
                          })}
                        </g>
                      </svg>
                    )}
                    {!geo && <div className="map-loading">{mapError ? "Map unavailable. Use List view." : "Opening the continent…"}</div>}
                    {view !== "List" && (
                      <div className="map-tools">
                        <button aria-label="Layers" onClick={() => SL(!showLayers)} className={showLayers ? "active" : ""}><Layers size={16} /></button>
                        <button aria-label="Connect" className={connect ? "active" : ""} onClick={() => { Connect(!connect); Toast("Select another record to connect."); }}><Link2 size={16} /></button>
                        <button aria-label="Reset view" onClick={() => { C("All Africa"); E(layers.map((x) => x.id)); }}><Crosshair size={16} /></button>
                      </div>
                    )}
                    {showLayers && (
                      <div className="layers-panel">
                        <div>Layers<button className="icon-btn" aria-label="Hide" onClick={() => SL(false)}><Minus size={13} /></button></div>
                        {layerStats.map((l) => (
                          <button key={l.id} aria-pressed={enabled.includes(l.id)} onClick={() => E((p) => (p.includes(l.id) ? p.filter((x) => x !== l.id) : [...p, l.id]))}>
                            <i style={{ background: l.color }} />{l.name}<small>{l.count}</small>
                            <span className={"checkbox " + (enabled.includes(l.id) ? "checked" : "")}>{enabled.includes(l.id) && <Check size={10} />}</span>
                          </button>
                        ))}
                      </div>
                    )}
                    {connect && (
                      <div className="connect-banner"><Link2 size={14} />Connect mode<small>{links.length} linked</small><button onClick={() => Connect(false)}>Done<Check size={12} /></button></div>
                    )}
                  </>
                ) : (
                  <div className="record-list">
                    {visible.map((x) => (
                      <button className="record-row" key={x.id} onClick={() => pick(x.id)}>
                        <span className={"record-dot " + x.layer} style={{ background: layerColor(x.layer) }} />
                        <span className="record-text"><small>{x.place}</small><strong>{x.title}</strong></span>
                        <span className="record-layer" style={{ color: layerColor(x.layer) }}>{layers.find((l) => l.id === x.layer)?.name}</span>
                        <ArrowUpRight size={14} />
                      </button>
                    ))}
                  </div>
                )}
              </section>

              {r && (
                <section className="detail-panel" onClick={() => pick(selected)}>
                  <div className="detail-head">
                    <div>
                      <div className="eyebrow">{r.theme.toUpperCase()}</div>
                      <h3>{r.title}</h3>
                      <div className="detail-place"><MapPin size={13} />{r.place}</div>
                    </div>
                    <button className="icon-btn" onClick={(e) => { e.stopPropagation(); S(null); }}><X /></button>
                  </div>
                  <p className="detail-desc">{r.description}</p>
                  <div className="detail-scores">
                    <div className="score"><span>Confidence</span><b>{Math.round(r.confidence * 100)}%</b></div>
                    <div className="score"><span>Importance</span><b>{Math.round(r.importance * 100)}%</b></div>
                  </div>
                  <div className="detail-meta">
                    <div><ShieldCheck size={13} />Source: {r.source}</div>
                    <div><CalendarDays size={13} />Listed {short(r.listed)}</div>
                    <div><span className="tag">Illustrative · Not verified</span></div>
                  </div>
                  <div className="detail-next">
                    <div className="eyebrow">A POSSIBLE NEXT STEP</div>
                    <p>{r.ask}</p>
                  </div>
                  <button className="primary detail-cta" onClick={(e) => { e.stopPropagation(); start(); }}><ArrowRight size={15} />Start a trail from here</button>
                </section>
              )}
              </div>

              <section className="timeline-section">
                <div className="timeline-head">
                  <div className="eyebrow">TIME TELLS THE REST</div>
                  <h3>Follow a file, not just a moment.</h3>
                  <div className="timeline-controls">
                    <CalendarDays size={14} />
                    <select value={day} onChange={(e) => D(Number(e.target.value))}>
                      {Array.from({ length: 30 }, (_, i) => i + 1).map((d) => <option key={d} value={d}>{short(date(d))}</option>)}
                    </select>
                  </div>
                </div>
                <div className="timeline-bar">
                  {[15, 16, 17, 18, 19, 20, 21].map((d) => (
                    <button key={d} className={"tl-day " + (d === day ? "active" : "") + (d < day ? " past" : "")} onClick={() => D(d)}>
                      <span>{d}</span><i>SEP</i>
                    </button>
                  ))}
                </div>
                <div className="timeline-legend"><span className="legend-dot answered" />Answered<span className="legend-dot due" />Due<span className="legend-dot overdue" />Overdue</div>
                <div className="trail-cards">
                  {files.map((f) => {
                    const rec = find(f.recordId);
                    return (
                      <button className="trail-card" key={f.id} onClick={() => open(f)}>
                        <span className="trail-card-top"><Route size={15} style={{ color: layerColor(rec.layer) }} /><small>{rec.place}</small></span>
                        <strong>{f.title}</strong>
                        <small>{f.holder}</small>
                        <Badge value={state(f, today)} />
                      </button>
                    );
                  })}
                  <div className="packet-card">
                    <FileText size={26} />
                    <strong>The packet is the product.</strong>
                    <p>Print it. Share it. Take it offline.</p>
                  </div>
                </div>
              </section>
            </>
          ) : tab === "My trails" ? (
            <section className="my-trails">
              <div className="eyebrow">YOUR TRAILS</div>
              <h1>Every file. <span>A way forward.</span></h1>
              <div className="trails-list">
                {files.map((f) => {
                  const rec = find(f.recordId);
                  return (
                    <div className="trail-row" key={f.id}>
                      <span className={"record-dot " + rec.layer} style={{ background: layerColor(rec.layer) }} />
                      <div className="trail-row-mid">
                        <strong>{f.title}</strong>
                        <small>{rec.place} · {f.holder}</small>
                      </div>
                      <Badge value={state(f, today)} />
                      <button className="icon-btn" onClick={() => open(f)}><ArrowRight size={15} /></button>
                    </div>
                  );
                })}
              </div>
            </section>
          ) : (
            <section className="source-library">
              <div className="eyebrow">SOURCE LIBRARY</div>
              <h1>Trust starts <span>at the source.</span></h1>
              <div className="source-list">
                {records.map((rec) => (
                  <div className="source-row" key={rec.id}>
                    <span className={"record-dot " + rec.layer} style={{ background: layerColor(rec.layer) }} />
                    <div><strong>{rec.source}</strong><small>{rec.sourceClass}</small></div>
                    <a href={rec.url} target="_blank" rel="noopener noreferrer">Visit<ExternalLink size={12} /></a>
                  </div>
                ))}
              </div>
            </section>
          )}
        </main>
      </div>

      {modal === "create" && (
        <Modal title="Start a trail" tag="NEW FILE" close={() => M(null)} wide>
          <form onSubmit={create}>
            <div className="form-grid">
              <label>Title<input name="title" placeholder="e.g. Follow the community benefit" /></label>
              <label>Proposed holder<input name="holder" placeholder="Named office or desk" /></label>
              <label>Proposed witness<input name="witness" placeholder="Community contact" /></label>
              <label>Response due<input name="due" type="date" /></label>
            </div>
            {links.length > 0 && <div className="linked-records">Linked: {links.map((id) => find(id).title).join(", ")}</div>}
            <div className="modal-actions">
              <button type="button" className="ghost" onClick={() => M(null)}>Cancel</button>
              <button type="submit" className="primary">Create file</button>
            </div>
          </form>
        </Modal>
      )}

      {modal === "file" && file && (
        <Modal title={file.title} tag={file.id} close={() => M(null)} wide>
          <div className="file-detail">
            <div className="file-meta">
              <div><ShieldCheck size={13} />Holder: {file.holder}</div>
              <div><Users size={13} />Witness: {file.witness}</div>
              <div><CalendarDays size={13} />Due: {file.due}</div>
              <Badge value={state(file, today)} />
            </div>
            <pre className="packet-preview">{packet(file, "print", today)}</pre>
            <div className="format-toggle">
              {["print", "sms", "radio"].map((f) => <button key={f} className={format === f ? "selected" : ""} onClick={() => PF(f)}>{f}</button>)}
            </div>
            <div className="modal-actions">
              <button className="ghost" onClick={() => copy(packet(file, format, today))}><Copy size={14} />Copy</button>
              <button className="primary" onClick={download}><Download size={14} />Download packet</button>
            </div>
          </div>
        </Modal>
      )}

      {modal === "about" && (
        <Modal title="About Trail" tag="THE WORKSPACE" close={() => M(null)}>
          <div className="about-body">
            <p>Trail connects trusted civic facts to practical next steps. An Africa-first workspace for facts, files, and follow-through.</p>
            <p>Every record carries source, freshness, confidence, limitations, and evidence. No record is presented as verified unless it is.</p>
            <div className="about-layers">
              {layers.map((l) => <div key={l.id} className="about-layer"><i style={{ background: l.color }} />{l.name}</div>)}
            </div>
            <div className="modal-actions"><button className="primary" onClick={() => M(null)}>Close</button></div>
          </div>
        </Modal>
      )}

      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}

function Badge({ value }) { return <span className={"badge " + value.toLowerCase().replaceAll(" ", "-")}><i />{value}</span>; }
