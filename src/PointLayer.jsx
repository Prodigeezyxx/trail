import React, { useEffect, useMemo, useRef } from "react";

/**
 * Canvas-based point renderer for large layers.
 *
 * Rendering 200k+ points as SVG circles kills the browser on a low-end device,
 * which is exactly who this is for. Canvas draws them in one pass. We keep a
 * max per layer and re-project on every frame while dragging rather than
 * storing projected coordinates.
 *
 * Props:
 *   projection   (lon, lat) => [x, y] in viewBox coordinates
 *   viewBox      { w, h } of the projection space
 *   records      array of { coords: [lon, lat], ... }
 *   color        fill
 *   r            radius in px (in viewBox units)
 *   onPick       (record) => void
 *   selectedId   id of the selected record
 */
export default function PointLayer({ projection, viewBox = { w: 1060, h: 675 }, records, color = "#4ade80", r = 2.4, onPick = () => {}, selectedId = null }) {
  const ref = useRef();
  const last = useRef({ w: 0, h: 0 });
  const scale = useRef({ sx: 1, sy: 1 });

  const drawn = useMemo(() => {
    const cap = 8000;
    if (records.length <= cap) return records;
    const step = Math.ceil(records.length / cap);
    const out = [];
    for (let i = 0; i < records.length; i += step) out.push(records[i]);
    return out;
  }, [records]);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    const draw = () => {
      const w = canvas.clientWidth, h = canvas.clientHeight;
      if (w === 0 || h === 0) return;
      if (last.current.w !== w || last.current.h !== h) {
        canvas.width = w * dpr;
        canvas.height = h * dpr;
        last.current = { w, h };
        scale.current = { sx: w / viewBox.w, sy: h / viewBox.h };
      }
      const { sx, sy } = scale.current;
      const ctx = canvas.getContext("2d");
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      for (const rec of drawn) {
        const p = projection(rec.coords);
        if (!p) continue;
        const x = p[0] * sx, y = p[1] * sy;
        if (x < -50 || x > w + 50 || y < -50 || y > h + 50) continue;
        const sel = selectedId && rec.id === selectedId;
        const rr = sel ? r * 2.4 : r;
        ctx.beginPath();
        ctx.arc(x, y, rr * Math.max(sx, sy), 0, Math.PI * 2);
        if (sel) {
          ctx.fillStyle = "#fff"; ctx.fill();
          ctx.strokeStyle = color; ctx.lineWidth = 2 * Math.max(sx, sy); ctx.stroke();
        } else {
          ctx.fillStyle = color; ctx.globalAlpha = 0.85; ctx.fill(); ctx.globalAlpha = 1;
        }
      }
    };
    draw();
    const ro = new ResizeObserver(draw);
    ro.observe(canvas);
    canvas._redraw = draw;
    window.addEventListener("resize", draw);
    return () => { ro.disconnect(); window.removeEventListener("resize", draw); };
  }, [drawn, projection, viewBox, color, r, selectedId]);

  const handleClick = (e) => {
    const rect = ref.current.getBoundingClientRect();
    const x = (e.clientX - rect.left), y = (e.clientY - rect.top);
    const { sx, sy } = scale.current;
    let best = null, bestD = 144;
    for (const rec of drawn) {
      const p = projection(rec.coords);
      if (!p) continue;
      const rx = p[0] * sx, ry = p[1] * sy;
      const d = (rx - x) ** 2 + (ry - y) ** 2;
      if (d < bestD) { bestD = d; best = rec; }
    }
    if (best) onPick(best);
  };

  return <canvas ref={ref} onClick={handleClick} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "auto", zIndex: 5 }} />;
}
