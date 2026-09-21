import React, { useState, useEffect, useMemo, useRef } from "react";
import { geoMercator, geoPath } from "d3-geo";
import {
  ArrowUpRight,
  ArrowRight,
  Plus,
  Minus,
  Search,
  ChevronDown,
  ChevronRight,
  Map,
  Layers,
  Route,
  Files,
  BookOpen,
  ShieldCheck,
  Settings2,
  HelpCircle,
  X,
  Check,
  CheckCheck,
  CalendarDays,
  MapPin,
  Link2,
  FileText,
  Download,
  Printer,
  Radio,
  Smartphone,
  Wifi,
  MoreHorizontal,
  ExternalLink,
  Leaf,
  Landmark,
  Users,
  Compass,
  Crosshair,
  Menu,
  Copy,
  CircleCheck,
  Globe2,
  Info,
} from "lucide-react";
import {
  LAYERS as layers,
  RECORDS,
  SEED_FILES as seeds,
  dateLabel as short,
  placeLabel,
  stateAt as state,
  loadFiles,
  packetText as packet,
  addDays,
  STORAGE_KEY,
  validFile,
} from "./data";
import GodsEye from "./GodsEye";
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
const icons = { services: Landmark, resources: Leaf, participation: Users };
const Icon = ({ name: C, ...p }) => <C size={18} strokeWidth={1.6} {...p} />;
const Badge = ({ value }) => (
  <span className={"badge " + value.toLowerCase().replaceAll(" ", "-")}>
    <i />
    {value}
  </span>
);
function Logo() {
  return (
    <div className="brand">
      <svg viewBox="0 0 38 38">
        <path d="M8 30V19a9 9 0 0 1 9-9h13M17 30V20h13" />
        <circle cx="30" cy="10" r="2.8" />
      </svg>
      <span>
        trail<b>.</b>
      </span>
    </div>
  );
}
function Modal({ title, tag, children, close, wide }) {
  const ref = useRef(),
    fn = useRef(close);
  fn.current = close;
  useEffect(() => {
    const before = document.activeElement,
      el = ref.current;
    el.focus();
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const handler = (e) => {
      if (e.key === "Escape") fn.current();
      if (e.key === "Tab") {
        const a = [
            ...el.querySelectorAll("button,input,select,textarea,a"),
          ].filter((x) => !x.disabled),
          first = a[0],
          last = a.at(-1);
        if (
          e.shiftKey &&
          (document.activeElement === first || document.activeElement === el)
        ) {
          e.preventDefault();
          last?.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    };
    document.addEventListener("keydown", handler);
    return () => {
      document.removeEventListener("keydown", handler);
      document.body.style.overflow = overflow;
      before?.focus();
    };
  }, []);
  return (
    <div
      className="overlay"
      onMouseDown={(e) => e.target === e.currentTarget && close()}
    >
      <section
        className={"modal " + (wide ? "wide" : "")}
        ref={ref}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <div className="modal-head">
          <div>
            <div className="eyebrow">{tag || "TRAIL WORKSPACE"}</div>
            <h2>{title}</h2>
          </div>
          <button
            className="icon-btn"
            aria-label="Close dialog"
            onClick={close}
          >
            <X />
          </button>
        </div>
        {children}
      </section>
    </div>
  );
}
export default function App() {
  const [tab, T] = useState("Explore"),
    [selected, S] = useState("mak"),
    [enabled, E] = useState(layers.map((l) => l.id)),
    [country, C] = useState("All Africa"),
    [view, V] = useState("Map"),
    [geo, G] = useState(null),
    [mapError, ME] = useState(false),
    [zoom, Z] = useState(1),
    [day, D] = useState(21),
    [files, F] = useState(load),
    [modal, M] = useState(null),
    [active, A] = useState(null),
    [format, PF] = useState("print"),
    [query, Q] = useState(""),
    [toast, Toast] = useState(""),
    [connect, Connect] = useState(false),
    [links, Links] = useState([]),
    [showLayers, SL] = useState(true),
    [nav, N] = useState(false),
    [lang, L] = useState("EN"),
    [langMenu, LM] = useState(false),
    [online, ON] = useState(navigator.onLine),
    [ready, R] = useState(false);
  const r = find(selected),
    today = date(day),
    file = files.find((f) => f.id === active),
    visible = records.filter(
      (x) =>
        enabled.includes(x.layer) &&
        (country === "All Africa" || x.place.endsWith(country)) &&
        x.date <= today,
    );
  const projection = useMemo(
      () => geoMercator().center([17, 2]).scale(350).translate([418, 315]),
      [],
    ),
    path = useMemo(() => geoPath(projection), [projection]);
  useEffect(() => {
    fetch("/africa.json")
      .then((x) => {
        if (!x.ok) throw Error();
        return x.json();
      })
      .then(G)
      .catch(() => ME(true));
    const on = () => ON(true),
      off = () => ON(false);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    if (import.meta.env.PROD && "serviceWorker" in navigator)
      navigator.serviceWorker
        .register("/sw.js")
        .then(() => navigator.serviceWorker.ready)
        .then(() => R(true))
        .catch(() => {});
    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
    };
  }, []);
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(files));
    } catch {
      Toast("Device storage unavailable. Download your packet before leaving.");
    }
  }, [files]);
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => Toast(""), 4500);
      return () => clearTimeout(timer);
    }
  }, [toast]);
  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        Q("");
        M("search");
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);
  const changeTab = (t) => {
    T(t);
    N(false);
    Q("");
  };
  const pick = (id) => {
    if (connect && id !== selected)
      Links((p) => (p.includes(id) ? p.filter((i) => i !== id) : [...p, id]));
    else {
      S(id);
      Links([]);
    }
  };
  const open = (f) => {
    A(f.id);
    M("file");
  };
  const start = () => {
    Connect(false);
    M("create");
  };
  const copy = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      Toast("Copied to clipboard.");
    } catch {
      Toast("Select and copy the text manually. Clipboard is unavailable.");
    }
  };
  const create = (e) => {
    e.preventDefault();
    const v = Object.fromEntries(new FormData(e.currentTarget));
    if (["title", "holder", "witness"].some((k) => !v[k].trim()))
      return Toast("Please enter a title, holder, and witness.");
    const f = {
      id: `TRL-2609${day}-${crypto.randomUUID().slice(0, 6).toUpperCase()}`,
      recordId: selected,
      title: v.title.trim(),
      holder: v.holder.trim(),
      witness: v.witness.trim(),
      created: today,
      due: v.due,
      expires: addDays(v.due, 7),
      answered: null,
      links: [...links],
    };
    if (!validFile(f)) return Toast("Please check the file fields and dates.");
    F((p) => [f, ...p]);
    A(f.id);
    M("receipt");
    Links([]);
  };
  const download = () => {
    const url = URL.createObjectURL(
      new Blob([packet(file, format, today)], {
        type: "text/plain;charset=utf-8",
      }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = file.id + "-" + format + ".txt";
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    Toast("Packet downloaded. Take the next step offline.");
  };
  const labels = {
    EN: [
      "Explore",
      "My trails",
      "Source library",
      "Good information.",
      "Real-world change.",
      "Start a trail",
    ],
    FR: [
      "Explorer",
      "Mes parcours",
      "Sources",
      "Une information fiable.",
      "Un changement réel.",
      "Créer un parcours",
    ],
    PT: [
      "Explorar",
      "Meus percursos",
      "Fontes",
      "Informação de confiança.",
      "Mudança real.",
      "Criar um percurso",
    ],
    AR: [
      "استكشف",
      "ملفاتي",
      "المصادر",
      "معلومات موثوقة.",
      "تغيير حقيقي.",
      "ابدأ مسارًا",
    ],
  }[lang];
  const preview = (f) => (
    <button className="trail-card" key={f.id} onClick={() => open(f)}>
      <span className={"record-icon " + find(f.recordId).layer}>
        <Route size={21} />
      </span>
      <span className="trail-text">
        <small>{find(f.recordId).place}</small>
        <strong>{f.title}</strong>
        <em>{f.holder}</em>
      </span>
      <span className="trail-end">
        <Badge value={state(f, today)} />
        <small>
          {state(f, today) === "Answered"
            ? "Response recorded"
            : "Due " + short(f.due)}
          <ArrowUpRight size={13} />
        </small>
      </span>
    </button>
  );
  return (
    <div className="app">
      {nav && <div className="nav-scrim" onClick={() => N(false)} />}
      <aside className={"sidebar " + (nav ? "open" : "")} inert={!!modal}>
        <a
          href="#explore"
          aria-label="Trail home"
          onClick={() => changeTab("Explore")}
        >
          <Logo />
        </a>
        <div className="workspace-tag">
          <i />
          THE CIVIC WORKSPACE
        </div>
        <div className="side-label">YOUR WORKSPACE</div>
        <nav>
          {[
            ["Explore", Compass],
            ["My trails", Route],
            ["Source library", BookOpen],
          ].map(([name, I], i) => (
            <button
              className={tab === name ? "active" : ""}
              key={name}
              onClick={() => changeTab(name)}
            >
              <I size={18} strokeWidth={1.6} />
              {labels[i]}
              {i === 1 ? (
                <span className="count">
                  {String(files.length).padStart(2, "0")}
                </span>
              ) : i === 0 ? (
                <i />
              ) : null}
            </button>
          ))}
        </nav>
        <hr />
        <div className="side-label">A SHARED HORIZON</div>
        <div className="africa-focus">
          <Globe2 size={17} />
          Africa, in focus
          <i />
        </div>
        <p className="side-copy">
          Local knowledge.
          <br />
          Collective possibility.
        </p>
        <div className="side-bottom">
          <div className="purpose">
            <div className="purpose-art">
              <Route size={28} />
            </div>
            <h3>
              A fact should
              <br />
              lead somewhere.
            </h3>
            <p>
              Not just a point on a map.
              <br />A next step in your hands.
            </p>
            <button onClick={() => M("about")}>
              Meet Trail <ArrowUpRight size={15} />
            </button>
          </div>
          <button className="help" onClick={() => M("about")}>
            <HelpCircle size={17} />A little guidance
            <ArrowUpRight size={14} />
          </button>
          <div className="profile">
            <span className="avatar">CW</span>
            <div>
              <strong>Community workspace</strong>
              <small>Individual demo</small>
            </div>
            <button
              className="icon-btn"
              aria-label="Workspace settings"
              onClick={() => M("settings")}
            >
              <Settings2 size={17} />
            </button>
          </div>
        </div>
      </aside>
      <div className="main-shell" inert={!!modal}>
        <header>
          <div className="breadcrumb">
            <button
              className="icon-btn mobile-menu"
              aria-label="Open navigation"
              onClick={() => N(true)}
            >
              <Menu />
            </button>
            <span>Workspace</span>
            <ChevronRight size={13} />
            <b>
              {labels[["Explore", "My trails", "Source library"].indexOf(tab)]}
            </b>
          </div>
          <div className="header-actions">
            <span className="prototype">
              <i />
              PROTOTYPE
            </span>
            <button
              className="search-button"
              aria-label="Search workspace"
              onClick={() => {
                Q("");
                M("search");
              }}
            >
              <Search size={16} />
              <span>Find a place, fact, or trail</span>
              <kbd>⌘ K</kbd>
            </button>
            <div className="language">
              <button
                aria-label="Choose language"
                onClick={() => LM(!langMenu)}
              >
                <Globe2 size={15} />
                {lang}
                <ChevronDown size={12} />
              </button>
              {langMenu && (
                <div className="language-menu">
                  {[
                    ["EN", "English"],
                    ["FR", "Français"],
                    ["PT", "Português"],
                    ["AR", "العربية"],
                  ].map(([v, n]) => (
                    <button
                      key={v}
                      onClick={() => {
                        L(v);
                        LM(false);
                        if (v !== "EN")
                          Toast(
                            "Navigation translated. Sample records and packets remain in English.",
                          );
                      }}
                    >
                      {n}
                      {lang === v && <Check size={14} />}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <span className="avatar header-avatar">CW</span>
          </div>
        </header>
        <main>
          <section className="intro">
            <div>
              <div className="eyebrow">
                <i />
                {tab === "Explore"
                  ? "FROM INFORMATION TO ACTION"
                  : tab === "My trails"
                    ? "SMALL STEPS. SHARED ACCOUNTABILITY."
                    : "KNOW WHAT YOU KNOW."}
              </div>
              <h1 dir={lang === "AR" ? "rtl" : undefined}>
                {tab === "Explore" ? (
                  <>
                    {labels[3]} <span>{labels[4]}</span>
                  </>
                ) : tab === "My trails" ? (
                  <>
                    Every file. <span>A way forward.</span>
                  </>
                ) : (
                  <>
                    Trust starts <span>at the source.</span>
                  </>
                )}
              </h1>
              <p>
                {tab === "Explore"
                  ? "Connect the facts. Find who holds the next step. Follow it through."
                  : tab === "My trails"
                    ? "A holder, a witness, and a next step. Nothing left as just a pin."
                    : "See where information comes from, what it tells us, and what it doesn’t."}
              </p>
            </div>
            <button className="primary intro-cta" onClick={start}>
              <Plus size={17} />
              {labels[5]}
            </button>
          </section>
          {tab === "Explore" ? (
            <>
              <div className="toolbar">
                <div className="country-select">
                  <Globe2 size={17} />
                  <select
                    aria-label="Filter by country"
                    value={country}
                    onChange={(e) => C(e.target.value)}
                  >
                    {[
                      "All Africa",
                      "Kenya",
                      "Ghana",
                      "Senegal",
                      "Nigeria",
                      "DR Congo",
                      "Mozambique",
                      "South Africa",
                    ].map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                  <ChevronDown size={13} />
                </div>
                <i className="divider" />
                <span className="record-count">
                  <b>{visible.length}</b> civic records{" "}
                  <span>
                    across{" "}
                    {
                      new Set(visible.map((x) => x.place.split(", ").at(-1)))
                        .size
                    }{" "}
                    countries
                  </span>
                </span>
                <div className="toolbar-right">
                  <small>
                    <i />
                    Illustrative dataset
                  </small>
                  <div className="segmented">
                    {[
                      ["Map", Map],
                      ["God's Eye", Globe2],
                      ["List", Files],
                    ].map(([name, I]) => (
                      <button
                        className={view === name ? "selected" : ""}
                        key={name}
                        onClick={() => V(name)}
                      >
                        <I size={15} />
                        {name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <section
                className={"atlas " + (view === "List" ? "list-view" : "")}
              >
                <div className="map-dots" />
                {view !== "List" ? (
                  <>
                    <div className="atlas-heading">
                      <div className="eyebrow">
                        {view === "God's Eye"
                          ? "AFRICA FROM ABOVE"
                          : "THE CONNECTED CONTINENT"}
                      </div>
                      <p>
                        {view === "God's Eye"
                          ? "One continent. Whole, and turning."
                          : "Many places. Shared possibilities."}
                      </p>
                    </div>
                    {view === "God's Eye" ? (
                      <GodsEye
                        geo={geo}
                        records={visible}
                        selected={selected}
                        onPick={pick}
                        layerColor={(id) =>
                          layers.find((l) => l.id === id).color
                        }
                      />
                    ) : (
                    <svg
                      className="africa-map"
                      viewBox="0 0 1060 675"
                      role="group"
                      aria-label="Africa-only civic map"
                    >
                      <defs>
                        <pattern
                          id="grain"
                          width="5"
                          height="5"
                          patternUnits="userSpaceOnUse"
                        >
                          <circle
                            cx="2"
                            cy="2"
                            r=".4"
                            fill="#789074"
                            opacity=".2"
                          />
                        </pattern>
                      </defs>
                      <g
                        style={{ transition: "transform .3s" }}
                        transform={`translate(${418 * (1 - zoom)} ${315 * (1 - zoom)}) scale(${zoom})`}
                      >
                        {geo?.features.map((f) => (
                          <g key={f.id}>
                            <path className={"country c" + f.id} d={path(f)} />
                            <path
                              d={path(f)}
                              fill="url(#grain)"
                              pointerEvents="none"
                            />
                          </g>
                        ))}
                        {[
                          [[2, 27], "ALGERIA"],
                          [[18, 27], "LIBYA"],
                          [[30, 27], "EGYPT"],
                          [[9, 17], "NIGER"],
                          [[19, 15], "CHAD"],
                          [[30, 15], "SUDAN"],
                          [[39, 8], "ETHIOPIA"],
                          [[23, -2], "DR CONGO"],
                          [[17, -12], "ANGOLA"],
                          [[24, -22], "BOTSWANA"],
                          [[46, -20], "MADAGASCAR"],
                        ].map(([c, n]) => {
                          const p = projection(c);
                          return (
                            <text
                              className="country-label"
                              key={n}
                              x={p[0]}
                              y={p[1]}
                            >
                              {n}
                            </text>
                          );
                        })}
                        <text className="ocean" x="130" y="320">
                          ATLANTIC
                        </text>
                        <text className="ocean" x="140" y="338">
                          OCEAN
                        </text>
                        <text className="ocean" x="676" y="420">
                          INDIAN
                        </text>
                        <text className="ocean" x="682" y="438">
                          OCEAN
                        </text>
                        {links.map((id) => {
                          const a = projection(r.coords),
                            b = projection(find(id).coords);
                          return (
                            <path
                              key={id}
                              className="drawn-link"
                              d={`M${a} Q${(a[0] + b[0]) / 2} ${Math.min(a[1], b[1]) - 65} ${b}`}
                            />
                          );
                        })}
                        {visible.map((x) => {
                          let [a, b] = projection(x.coords);
                          if (x.id === "ken") {
                            a -= 8;
                            b -= 18;
                          }
                          return (
                            <g
                              className={
                                "marker " +
                                (selected === x.id ? "selected" : "")
                              }
                              key={x.id}
                              style={{
                                "--pin": layers.find((l) => l.id === x.layer)
                                  .color,
                              }}
                              transform={`translate(${a},${b})`}
                              role="button"
                              tabIndex="0"
                              aria-label={x.title + ", " + x.place}
                              onClick={() => pick(x.id)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter" || e.key === " ") {
                                  e.preventDefault();
                                  pick(x.id);
                                }
                              }}
                            >
                              <circle
                                className="halo"
                                r={selected === x.id ? 25 : 15}
                              />
                              <circle
                                className="ring"
                                r={selected === x.id ? 13 : 9}
                              />
                              <circle
                                className="core"
                                r={selected === x.id ? 5 : 3}
                              />
                              {x.id !== "ken" && (
                                <>
                                  <rect
                                    className="pin-label-bg"
                                    x={x.id === "sen" ? -73 : 17}
                                    y="-12"
                                    width={x.id === "zaf" ? 106 : 75}
                                    height="25"
                                    rx="5"
                                  />
                                  <text
                                    className="pin-label"
                                    x={x.id === "sen" ? -64 : 26}
                                    y="4"
                                  >
                                    {x.place
                                      .split(",")[0]
                                      .replace(" County", "")}
                                  </text>
                                </>
                              )}
                            </g>
                          );
                        })}
                      </g>
                    </svg>
                    )}
                    {!geo && (
                      <div className="map-loading">
                        {mapError
                          ? "Map unavailable. Use List view."
                          : "Opening the continent…"}
                      </div>
                    )}
                    <div className="map-tools">
                      <button
                        aria-label="Toggle map layers"
                        onClick={() => SL(!showLayers)}
                        className={showLayers ? "active" : ""}
                      >
                        <Layers size={18} />
                      </button>
                      <button
                        aria-label="Connect records"
                        className={connect ? "active" : ""}
                        onClick={() => {
                          Connect(!connect);
                          Toast(
                            "Select another map record to connect it to this one.",
                          );
                        }}
                      >
                        <Link2 size={18} />
                      </button>
                      <button
                        aria-label="Reset map view"
                        onClick={() => {
                          Z(1);
                          C("All Africa");
                          E(layers.map((x) => x.id));
                          D(21);
                        }}
                      >
                        <Crosshair size={18} />
                      </button>
                    </div>
                    {showLayers && (
                      <div className="layers-panel">
                        <div>
                          A few layers. A clearer picture.
                          <button
                            className="icon-btn"
                            aria-label="Hide layers"
                            onClick={() => SL(false)}
                          >
                            <Minus size={14} />
                          </button>
                        </div>
                        {layers.map((l) => (
                          <button
                            key={l.id}
                            aria-pressed={enabled.includes(l.id)}
                            onClick={() =>
                              E((p) =>
                                p.includes(l.id)
                                  ? p.filter((x) => x !== l.id)
                                  : [...p, l.id],
                              )
                            }
                          >
                            <i style={{ background: l.color }} />
                            {l.name}
                            <span
                              className={
                                "checkbox " +
                                (enabled.includes(l.id) ? "checked" : "")
                              }
                            >
                              {enabled.includes(l.id) && <Check size={11} />}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                    {view === "Map" && (
                    <div className="zoom">
                      <button
                        aria-label="Zoom in"
                        onClick={() => Z((z) => Math.min(1.6, z + 0.15))}
                        disabled={zoom >= 1.6}
                      >
                        <Plus size={17} />
                      </button>
                      <span>{Math.round(zoom * 100)}%</span>
                      <button
                        aria-label="Zoom out"
                        onClick={() => Z((z) => Math.max(0.7, z - 0.15))}
                        disabled={zoom <= 0.7}
                      >
                        <Minus size={17} />
                      </button>
                    </div>
                    )}
                    <div className="attribution">
                      Natural Earth <span>·</span> Approximate civic places,
                      never people
                    </div>
                    {view === "Map" && (
                      <div className="north">
                        N<Compass size={25} strokeWidth={1} />
                      </div>
                    )}
                    {connect && (
                      <div className="connect-banner">
                        <Link2 size={15} />
                        Connect mode <small>{links.length} linked</small>
                        <button onClick={() => Connect(false)}>
                          Done <Check size={13} />
                        </button>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="record-list">
                    {visible.map((x) => (
                      <button
                        key={x.id}
                        className={
                          "record-row " + (selected === x.id ? "chosen" : "")
                        }
                        onClick={() => pick(x.id)}
                      >
                        <span className={"record-icon " + x.layer}>
                          <Icon name={icons[x.layer]} />
                        </span>
                        <span>
                          <small>{x.place}</small>
                          <strong>{x.title}</strong>
                          <em>{x.theme} · Illustrative record</em>
                        </span>
                        <ChevronRight size={17} />
                      </button>
                    ))}
                    {!visible.length && (
                      <div className="empty">
                        <Search />
                        <h3>No records in this view</h3>
                        <button
                          onClick={() => {
                            C("All Africa");
                            E(layers.map((x) => x.id));
                            D(21);
                          }}
                          className="secondary"
                        >
                          Reset filters
                        </button>
                      </div>
                    )}
                  </div>
                )}
                <aside className="record-detail" key={r.id}>
                  <div className="detail-top">
                    <span className="topic">
                      <i />
                      {r.theme}
                    </span>
                    <button
                      className="icon-btn"
                      aria-label="View source details"
                      onClick={() => M("source")}
                    >
                      <MoreHorizontal size={20} />
                    </button>
                  </div>
                  <div className="location">
                    <MapPin size={13} />
                    {r.place}
                  </div>
                  <h2>{r.title}</h2>
                  <p className="description">{r.description}</p>
                  <div className="source-mini">
                    <span>
                      <ShieldCheck size={19} />
                    </span>
                    <div>
                      <b>Every fact has a starting point</b>
                      <small>{r.source}</small>
                    </div>
                    <button
                      className="icon-btn"
                      aria-label="Inspect provenance"
                      onClick={() => M("source")}
                    >
                      <ArrowUpRight size={17} />
                    </button>
                  </div>
                  <div className="verification">
                    <span>
                      <i />
                      Source attached
                    </span>
                    <span>Listed {short(r.date)}</span>
                  </div>
                  <div className="demo-note">
                    <Info size={12} />
                    Illustrative case · Not independently verified
                  </div>
                  <hr />
                  <div className="eyebrow next-label">A POSSIBLE NEXT STEP</div>
                  <div className="next-step">
                    <span>01</span>
                    <div>
                      <strong>Put the question in the right hands.</strong>
                      <p>
                        A named office. A community witness.
                        <br />A date to come back to.
                      </p>
                    </div>
                  </div>
                  <button className="primary full" onClick={start}>
                    Start a trail from here
                    <ArrowRight size={16} />
                  </button>
                  <button
                    className="connect-link"
                    onClick={() => {
                      Connect(!connect);
                      V("Map");
                      Toast(
                        "Select a second record on the map to draw a connection.",
                      );
                    }}
                  >
                    <Link2 size={14} />
                    {links.length
                      ? links.length + " record(s) connected"
                      : connect
                        ? "Choose a record on the map"
                        : "Connect to another record"}
                  </button>
                  <div className="detail-foot">
                    <ShieldCheck size={12} />
                    Public places. No personal locations.
                  </div>
                </aside>
              </section>
              <div className="timeline">
                <div className="time-title">
                  <CalendarDays size={19} />
                  <div>
                    <b>Time tells the rest.</b>
                    <small>Follow a file, not just a moment.</small>
                  </div>
                </div>
                <div className="time-slider">
                  <div>
                    <span>15 SEP</span>
                    <span>20 SEP</span>
                    <b>DEMO · {short(today).toUpperCase()}</b>
                    <span>10 OCT</span>
                  </div>
                  <input
                    aria-label="Demo date in September 2026"
                    type="range"
                    min="15"
                    max="40"
                    value={day}
                    onChange={(e) => D(+e.target.value)}
                  />
                  <div className="ticks">
                    {Array.from({ length: 30 }, (_, i) => (
                      <i key={i} />
                    ))}
                  </div>
                </div>
                <div className="time-key">
                  <span>
                    <i />
                    Answered
                  </span>
                  <span>
                    <i />
                    Due
                  </span>
                  <span>
                    <i />
                    Overdue
                  </span>
                </div>
                <button
                  className="date-button"
                  onClick={() => D(21)}
                  title="Reset demo date"
                >
                  <CalendarDays size={14} />
                  {short(today)} 2026
                  <ChevronDown size={13} />
                </button>
              </div>
              <section className="below-map">
                <div className="section-head">
                  <div>
                    <h2>Small trails. Tangible change.</h2>
                    <span>Follow-through starts with a first step.</span>
                  </div>
                  <button onClick={() => changeTab("My trails")}>
                    View my trails <ArrowUpRight size={16} />
                  </button>
                </div>
                <div className="trail-grid">
                  {files.slice(0, 2).map(preview)}
                  <button className="packet-promo" onClick={() => M("about")}>
                    <Files size={26} />
                    <span>
                      <strong>The packet is the product.</strong>
                      <small>Print it. Share it. Take it offline.</small>
                    </span>
                    <ArrowUpRight size={17} />
                  </button>
                </div>
              </section>
            </>
          ) : tab === "My trails" ? (
            <section className="files-page">
              <div className="stats">
                {[
                  [
                    "OPEN FILES",
                    files.filter((f) =>
                      ["Awaiting response", "Overdue"].includes(
                        state(f, today),
                      ),
                    ).length,
                    "Held, witnessed, and in motion",
                  ],
                  [
                    "ANSWERS RECORDED",
                    files.filter((f) => state(f, today) === "Answered").length,
                    "A response is a step, not a conclusion",
                  ],
                  [
                    "NEED A FOLLOW-UP",
                    files.filter((f) =>
                      ["Overdue", "Expired unanswered"].includes(
                        state(f, today),
                      ),
                    ).length,
                    "Silence never means resolved",
                  ],
                ].map(([n, v, d]) => (
                  <div key={n}>
                    <small>{n}</small>
                    <strong>{String(v).padStart(2, "0")}</strong>
                    <p>{d}</p>
                  </div>
                ))}
              </div>
              <div className="section-head">
                <h2>
                  Your civic files <span>{files.length}</span>
                </h2>
                <label className="date-button">
                  Demo clock
                  <select
                    aria-label="Trail demo date"
                    value={day}
                    onChange={(e) => D(+e.target.value)}
                  >
                    {Array.from({ length: 26 }, (_, i) => (
                      <option value={i + 15} key={i}>
                        {i + 15} Sep
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <div className="file-table">
                {files.map((f) => (
                  <button
                    className="file-row"
                    key={f.id}
                    onClick={() => open(f)}
                  >
                    <span className="record-icon">
                      <FileText size={23} />
                    </span>
                    <span className="file-main">
                      <small>
                        {f.id} · {find(f.recordId).place}
                      </small>
                      <strong>{f.title}</strong>
                      <em>Holder: {f.holder}</em>
                    </span>
                    <Badge value={state(f, today)} />
                    <small className="file-due">Due {short(f.due)}</small>
                    <ArrowUpRight size={18} />
                  </button>
                ))}
              </div>
              <div className="notice">
                <ShieldCheck size={21} />
                <div>
                  <strong>Two hands on every civic file.</strong>
                  <p>
                    Office roles and witnesses are proposed, not confirmed
                    commitments. Files stay in this browser. Never enter
                    sensitive or personal information. All state changes are a
                    demonstration.
                  </p>
                </div>
              </div>
            </section>
          ) : (
            <section className="sources-page">
              <div className="notice source-notice">
                <ShieldCheck size={29} />
                <div>
                  <h2>Attached isn’t the same as verified.</h2>
                  <p>
                    These public portals are starting points for research, not
                    evidence for the illustrative cases. No live records have
                    been fetched or independently corroborated.
                  </p>
                </div>
              </div>
              <div className="search-input">
                <Search size={18} />
                <input
                  aria-label="Filter sources"
                  placeholder="Filter by source, country, or topic…"
                  value={query}
                  onChange={(e) => Q(e.target.value)}
                />
              </div>
              <div className="source-grid">
                {records
                  .filter((x) =>
                    (x.source + " " + x.place + " " + x.theme)
                      .toLowerCase()
                      .includes(query.toLowerCase()),
                  )
                  .map((x) => (
                    <button
                      className="source-card"
                      key={x.id}
                      onClick={() => {
                        S(x.id);
                        M("source");
                      }}
                    >
                      <div>
                        <span className="record-icon">
                          <Landmark size={22} />
                        </span>
                        <ArrowUpRight size={19} />
                      </div>
                      <small className="eyebrow">
                        PUBLIC INSTITUTIONAL PORTAL
                      </small>
                      <h3>{x.source}</h3>
                      <p>{x.place}</p>
                      <footer>
                        <span>Portal listed</span>
                        <span>Verification pending</span>
                      </footer>
                    </button>
                  ))}
              </div>
            </section>
          )}
          <footer className="workspace-footer">
            <span>Built around people. Grounded in place.</span>
            <span>
              <i />
              {online
                ? "Low-bandwidth by design"
                : "Offline · device files available"}
              <b />
              OSF × Andela <em>2026</em>
            </span>
          </footer>
        </main>
      </div>
      {toast && (
        <div className="toast" role="status">
          <CircleCheck size={18} />
          {toast}
          <button aria-label="Dismiss notification" onClick={() => Toast("")}>
            <X size={14} />
          </button>
        </div>
      )}
      {modal === "create" && (
        <Modal
          title="Give the next step a home."
          tag="START A CIVIC FILE"
          close={() => M(null)}
        >
          <p className="modal-intro">
            A short trail, with a holder, a witness, and a date to return to.
            Saved on this device only.
          </p>
          <label className="record-selector">
            Starting point
            <select
              aria-label="Starting record"
              value={selected}
              onChange={(e) => {
                S(e.target.value);
                Links([]);
              }}
            >
              {records.map((x) => (
                <option key={x.id} value={x.id}>
                  {x.place} · {x.theme}
                </option>
              ))}
            </select>
          </label>
          <form key={selected} onSubmit={create}>
            <label>
              File title
              <input
                name="title"
                defaultValue={r.title}
                required
                maxLength={100}
              />
            </label>
            <div className="two-col">
              <label>
                Proposed holder<small>Office or role, not a person</small>
                <input
                  name="holder"
                  defaultValue={r.holder}
                  required
                  maxLength={120}
                />
              </label>
              <label>
                Proposed witness<small>A community role or group</small>
                <input
                  name="witness"
                  defaultValue={r.witness}
                  required
                  maxLength={120}
                />
              </label>
            </div>
            <label>
              Ask for a response by
              <input
                type="date"
                name="due"
                min={today}
                defaultValue={addDays(today, 4)}
                max="2026-12-24"
                required
              />
            </label>
            <div className="question">
              <small>YOUR QUESTION FOR THE HOLDER</small>
              <p>{r.ask}</p>
            </div>
            {links.length > 0 && (
              <p className="modal-intro">
                {links.length} linked record(s) will travel with your packet.
              </p>
            )}
            <label className="consent">
              <input type="checkbox" required />
              <span>
                I understand this is a demo file, not a submitted report. I will
                not include sensitive or personal information.
              </span>
            </label>
            <button className="primary full" type="submit">
              Create my trail
              <ArrowRight size={17} />
            </button>
          </form>
        </Modal>
      )}
      {["receipt", "file"].includes(modal) && file && (
        <Modal
          title={
            modal === "receipt" ? "A next step. Not a dead end." : file.title
          }
          tag="YOUR CIVIC FILE · DEMO"
          close={() => M(null)}
        >
          <div className="receipt">
            <span>
              <CheckCheck size={26} />
            </span>
            <div>
              <small>YOUR RECEIPT</small>
              <strong>{file.id}</strong>
            </div>
            <button
              className="icon-btn"
              aria-label="Copy receipt"
              onClick={() => copy(file.id)}
            >
              <Copy size={17} />
            </button>
          </div>
          <p className="modal-intro">
            Saved in this browser. Your proposed holder has <b>not</b> been
            contacted. Use the packet to make the first approach.
          </p>
          <div className="receipt-details">
            {[
              ["PROPOSED HOLDER", file.holder],
              ["COMMUNITY WITNESS", file.witness],
              ["RESPONSE REQUESTED BY", short(file.due) + " 2026"],
              ["STATE ON " + short(today).toUpperCase(), state(file, today)],
            ].map(([n, v]) => (
              <div key={n}>
                <small>{n}</small>
                <strong>{v}</strong>
              </div>
            ))}
          </div>
          <div className="steps">
            {[
              [
                "1",
                "File created",
                short(file.created) + " · saved on this device",
              ],
              [
                "2",
                "Take the question to the holder",
                "Ask for acknowledgement. Bring your witness.",
              ],
              [
                "3",
                "Return on " + short(file.due),
                "Record a response, or follow up if unanswered.",
              ],
            ].map(([n, t, d]) => (
              <div key={n}>
                <span>{n}</span>
                <div>
                  <b>{t}</b>
                  <small>{d}</small>
                </div>
              </div>
            ))}
          </div>
          <button
            className="primary full"
            onClick={() => {
              PF("print");
              M("packet");
            }}
          >
            <Files size={17} />
            Open your offline packet
            <ArrowRight size={16} />
          </button>
          {!["Answered", "Not yet opened"].includes(state(file, today)) && (
            <button
              className="secondary full mt"
              onClick={() => {
                F((p) =>
                  p.map((f) =>
                    f.id === file.id ? { ...f, answered: today } : f,
                  ),
                );
                Toast(
                  "Simulated acknowledgement recorded. No institution has responded.",
                );
              }}
            >
              <CheckCheck size={16} />
              Simulate a holder response
            </button>
          )}
          <p className="footnote">
            No public personal data. No live institutional delivery, SMS or
            USSD.
          </p>
        </Modal>
      )}
      {modal === "packet" && file && (
        <Modal
          title="One file. Wherever you go."
          tag="YOUR OFFLINE PACKET"
          close={() => M(null)}
          wide
        >
          <p className="modal-intro">
            The same question, holder and due date — in the format your
            community can use.
          </p>
          <div className="packet-tabs">
            {[
              ["print", "Print / paper", Printer],
              ["sms", "SMS / USSD", Smartphone],
              ["radio", "Radio / meeting", Radio],
            ].map(([id, n, I]) => (
              <button
                className={format === id ? "active" : ""}
                key={id}
                onClick={() => PF(id)}
              >
                <I size={16} />
                {n}
              </button>
            ))}
          </div>
          <pre className="packet-document">{packet(file, format, today)}</pre>
          <div className="packet-actions">
            <button
              className="secondary"
              onClick={() => copy(packet(file, format, today))}
            >
              <Copy size={16} />
              Copy text
            </button>
            <button className="secondary" onClick={() => window.print()}>
              <Printer size={16} />
              Print / PDF
            </button>
            <button className="primary" onClick={download}>
              <Download size={16} />
              Download packet
            </button>
          </div>
        </Modal>
      )}
      {modal === "source" && (
        <Modal
          title="Look behind the record."
          tag="PROVENANCE, NOT A CONFIDENCE SCORE"
          close={() => M(null)}
        >
          <div className="source-modal-title">
            <span className="record-icon">
              <Landmark size={22} />
            </span>
            <div>
              <h3>{r.source}</h3>
              <p>Public institutional portal · {r.place}</p>
            </div>
          </div>
          <dl>
            {[
              [
                "Record status",
                "Illustrative scenario — not an observed or reported event",
              ],
              ["Source attached", short(r.date) + " 2026 (demo timeline)"],
              [
                "Content fetched at",
                "Not fetched. Portal URL manually listed.",
              ],
              [
                "Last independently verified",
                "Unknown — no verification performed",
              ],
              ["Corroboration", "None. No independent evidence attached."],
            ].map(([n, v]) => (
              <div key={n}>
                <dt>{n}</dt>
                <dd>{v}</dd>
              </div>
            ))}
          </dl>
          <div className="limitation">
            <Info size={19} />
            <div>
              <strong>What this source cannot tell you</strong>
              <p>
                A public portal is a research starting point, not proof of this
                case. It does not confirm an office’s acceptance, a legal
                deadline, an available benefit, or community consent.
              </p>
            </div>
          </div>
          <a
            href={r.url}
            target="_blank"
            rel="noreferrer"
            className="primary full"
          >
            Visit the original source <ExternalLink size={16} />
          </a>
        </Modal>
      )}
      {modal === "search" && (
        <Modal
          title="A place to start."
          tag="FIND A PLACE, FACT, OR TRAIL"
          close={() => M(null)}
        >
          <div className="search-input mt">
            <Search size={19} />
            <input
              aria-label="Search civic workspace"
              placeholder="Try Kenya, water, land, or a receipt code…"
              value={query}
              onChange={(e) => Q(e.target.value)}
            />
          </div>
          <div className="search-results">
            {records
              .filter((x) =>
                (x.title + " " + x.place + " " + x.theme)
                  .toLowerCase()
                  .includes(query.toLowerCase()),
              )
              .map((x) => (
                <button
                  key={x.id}
                  onClick={() => {
                    S(x.id);
                    T("Explore");
                    C("All Africa");
                    E(layers.map((l) => l.id));
                    D(21);
                    Links([]);
                    M(null);
                  }}
                >
                  <MapPin size={17} />
                  <span>
                    <b>{x.title}</b>
                    <small>{x.place}</small>
                  </span>
                  <ArrowUpRight size={16} />
                </button>
              ))}
            {files
              .filter((f) =>
                (f.id + " " + f.title)
                  .toLowerCase()
                  .includes(query.toLowerCase()),
              )
              .map((f) => (
                <button key={f.id} onClick={() => open(f)}>
                  <FileText size={17} />
                  <span>
                    <b>{f.title}</b>
                    <small>{f.id}</small>
                  </span>
                  <ArrowUpRight size={16} />
                </button>
              ))}
          </div>
        </Modal>
      )}
      {modal === "about" && (
        <Modal
          title="A fact should lead somewhere."
          tag="THIS IS TRAIL"
          close={() => M(null)}
        >
          <p className="modal-intro">
            The map is the index. The packet is the product. Trail turns civic
            information into a short, human campaign that can continue without a
            connection.
          </p>
          <div className="guide">
            {[
              [
                Map,
                "Find a place, inspect a fact",
                "Explore eight illustrative civic records across seven African countries. Every source exposes its limits.",
              ],
              [
                Link2,
                "Draw a useful connection",
                "Choose Connect, then a second map marker. Your context stays with every packet.",
              ],
              [
                Route,
                "Put two hands on a file",
                "Propose a holder and witness. Set a response date. Keep your receipt.",
              ],
              [
                Files,
                "Take the next step offline",
                "Print or download the packet. Move the demo clock to see due, overdue, answered and expired states.",
              ],
            ].map(([I, n, d], i) => (
              <div key={n}>
                <span>
                  <I size={21} />
                </span>
                <div>
                  <small>0{i + 1}</small>
                  <h3>{n}</h3>
                  <p>{d}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="limitation">
            <ShieldCheck size={20} />
            <p>
              No protection reports, people locations, sensitive cases, legal
              advice, live verification, or telecom service. Geographic
              boundaries are illustrative and do not imply a position on
              disputed territories.
            </p>
          </div>
        </Modal>
      )}
      {modal === "settings" && (
        <Modal
          title="Your workspace, lightly held."
          tag="DEVICE & CONNECTIVITY"
          close={() => M(null)}
        >
          {[
            [
              Wifi,
              online ? "You’re connected" : "You’re offline",
              ready
                ? "App and map are cached for offline use. Download packets for a portable copy."
                : "Download packets for reliable offline access. Production builds support offline caching.",
            ],
            [
              ShieldCheck,
              "Device-only storage",
              `${files.length} files are stored in this browser. No account sync or institutional delivery. Never enter sensitive information on a shared device.`,
            ],
            [
              Globe2,
              "Language support, honestly",
              "Navigation is available in English, French, Portuguese and Arabic. Records and packets are English-only; local-language review is needed before community use.",
            ],
          ].map(([I, n, d]) => (
            <div className="setting" key={n}>
              <I size={21} />
              <div>
                <h3>{n}</h3>
                <p>{d}</p>
              </div>
            </div>
          ))}
          <button
            className="secondary full mt"
            onClick={() => {
              if (
                confirm(
                  "Remove locally created files and restore the two sample files? Download your packets first.",
                )
              ) {
                F(seeds);
                D(21);
                M(null);
                Toast("Workspace reset.");
              }
            }}
          >
            Reset demo workspace
          </button>
        </Modal>
      )}
    </div>
  );
}
