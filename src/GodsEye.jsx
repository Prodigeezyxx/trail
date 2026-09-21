import React, { useEffect, useMemo, useRef, useState } from "react";
import { geoDistance, geoGraticule10, geoOrthographic, geoPath } from "d3-geo";

/**
 * God's Eye view — the continent seen whole, on a globe.
 *
 * Africa only: the geometry is the local africa.json Natural Earth extract, so
 * the sphere carries one continent and no external tile server. Built on
 * d3-geo's orthographic projection, which clips at the horizon by default, so
 * the far side of the globe is genuinely not drawn rather than faked.
 *
 * Deliberately dependency-free: the reference implementation of this view
 * leans on a heavy WebGL globe stack, which would double the bundle and break
 * the offline claim the workspace makes in its own footer. SVG + d3-geo costs
 * nothing and works from cache on a bad connection.
 *
 * Truthfulness: this is the same illustrative dataset as the flat map. It adds
 * no new claims — it is a second way of looking at the same eight records.
 */

const W = 1060;
const H = 675;
const CX = W / 2;
const CY = H / 2;
const BASE_SCALE = 252;

// Africa, centred. d3 rotation is the inverse of the centre point.
const HOME = [-17, -2];
const MIN_ZOOM = 0.85;
const MAX_ZOOM = 2.4;

export default function GodsEye({ geo, records, selected, onPick, layerColor }) {
  const [rot, setRot] = useState(HOME);
  const [zoom, setZoom] = useState(1);
  const [spin, setSpin] = useState(true);
  const [dragging, setDragging] = useState(false);
  const drag = useRef(null);
  const frame = useRef(0);
  const reduce =
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

  // Auto-spin: slow, paused while dragging or when the tab is hidden, and off
  // entirely for anyone who asked for reduced motion.
  useEffect(() => {
    if (!spin || dragging || reduce) return;
    let raf = 0;
    let last = 0;
    const step = (t) => {
      if (t - last >= 48 && !document.hidden) {
        last = t;
        setRot(([l, p]) => [l - 0.32, p]);
      }
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [spin, dragging, reduce]);

  useEffect(() => () => cancelAnimationFrame(frame.current), []);

  const { projection, path } = useMemo(() => {
    const p = geoOrthographic()
      .rotate(rot)
      .scale(BASE_SCALE * zoom)
      .translate([CX, CY]);
    return { projection: p, path: geoPath(p) };
  }, [rot, zoom]);

  const centre = useMemo(() => projection.invert([CX, CY]), [projection]);
  const graticule = useMemo(() => geoGraticule10(), []);

  // A point is on the near side when it is less than a quarter turn from the
  // centre of the visible hemisphere. Markers on the far side are dropped, not
  // drawn through the planet.
  const onNearSide = (coords) =>
    !centre || geoDistance(coords, centre) < Math.PI / 2 - 0.06;

  const startDrag = (e) => {
    drag.current = { x: e.clientX, y: e.clientY, rot };
    setDragging(true);
    e.currentTarget.setPointerCapture?.(e.pointerId);
  };

  const moveDrag = (e) => {
    const d = drag.current;
    if (!d) return;
    const k = 0.32 / zoom;
    setRot([
      d.rot[0] + (e.clientX - d.x) * k,
      Math.max(-72, Math.min(72, d.rot[1] - (e.clientY - d.y) * k)),
    ]);
  };

  const endDrag = (e) => {
    if (!drag.current) return;
    drag.current = null;
    setDragging(false);
    e.currentTarget.releasePointerCapture?.(e.pointerId);
  };

  const reset = () => {
    setRot(HOME);
    setZoom(1);
  };

  const lon = ((rot[0] + 540) % 360) - 180;

  return (
    <div className={"globe " + (dragging ? "dragging" : "")}>
      <svg
        className="globe-svg"
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label="Africa on a globe. Drag to turn, or use the controls to zoom."
        onPointerDown={startDrag}
        onPointerMove={moveDrag}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
      >
        <defs>
          <radialGradient id="globe-sea" cx="38%" cy="30%" r="82%">
            <stop offset="0%" stopColor="#f8fbf4" />
            <stop offset="58%" stopColor="#eef4e8" />
            <stop offset="100%" stopColor="#dee9d3" />
          </radialGradient>
          <radialGradient id="globe-shade" cx="34%" cy="26%" r="86%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.46" />
            <stop offset="52%" stopColor="#ffffff" stopOpacity="0.04" />
            <stop offset="100%" stopColor="#435c3a" stopOpacity="0.16" />
          </radialGradient>
          <clipPath id="globe-clip">
            <path d={path({ type: "Sphere" }) || ""} />
          </clipPath>
        </defs>

        {/* the planet */}
        <path
          className="globe-sphere"
          d={path({ type: "Sphere" }) || ""}
          fill="url(#globe-sea)"
        />

        <g clipPath="url(#globe-clip)">
          <path
            className="globe-graticule"
            d={path(graticule) || ""}
            pointerEvents="none"
          />
          {geo?.features.map((f) => (
            <path
              key={f.id}
              className={"country c" + f.id}
              d={path(f) || ""}
            />
          ))}
        </g>

        {/* limb and shading, drawn over the geometry */}
        <path
          className="globe-shade"
          d={path({ type: "Sphere" }) || ""}
          fill="url(#globe-shade)"
          pointerEvents="none"
        />
        <path
          className="globe-limb"
          d={path({ type: "Sphere" }) || ""}
          pointerEvents="none"
        />

        {/* records on the near side only */}
        {records
          .filter((x) => onNearSide(x.coords))
          .map((x) => {
            const p = projection(x.coords);
            if (!p) return null;
            const isSel = selected === x.id;
            return (
              <g
                className={"marker " + (isSel ? "selected" : "")}
                key={x.id}
                style={{ "--pin": layerColor(x.layer) }}
                transform={`translate(${p[0]},${p[1]})`}
                role="button"
                tabIndex="0"
                aria-label={x.title + ", " + x.place}
                onClick={() => onPick(x.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onPick(x.id);
                  }
                }}
              >
                <circle className="halo" r={isSel ? 25 : 15} />
                <circle className="ring" r={isSel ? 13 : 9} />
                <circle className="core" r={isSel ? 5 : 3} />
                <rect
                  className="pin-label-bg"
                  x="17"
                  y="-12"
                  width={isSel ? 92 : 78}
                  height="25"
                  rx="5"
                />
                <text className="pin-label" x="26" y="4">
                  {x.place.split(",")[0].replace(" County", "")}
                </text>
              </g>
            );
          })}
      </svg>

      <div className="globe-controls">
        <button
          aria-pressed={spin}
          onClick={() => setSpin((s) => !s)}
          disabled={reduce}
          title={reduce ? "Motion is reduced on this device" : undefined}
        >
          {spin ? "Pause spin" : "Spin"}
        </button>
        <button onClick={reset}>Reset view</button>
        <span className="globe-readout">
          {Math.round(lon)}° · {Math.round(rot[1] * -1)}°
        </span>
        <button
          aria-label="Zoom in"
          onClick={() => setZoom((z) => Math.min(MAX_ZOOM, +(z + 0.2).toFixed(2)))}
          disabled={zoom >= MAX_ZOOM}
        >
          +
        </button>
        <button
          aria-label="Zoom out"
          onClick={() => setZoom((z) => Math.max(MIN_ZOOM, +(z - 0.2).toFixed(2)))}
          disabled={zoom <= MIN_ZOOM}
        >
          −
        </button>
      </div>

      {!geo && <div className="map-loading">Opening the continent…</div>}
    </div>
  );
}
