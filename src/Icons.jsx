import React from "react";

/**
 * SVG icon symbols rendered once and referenced by markers via <use>.
 * Using <foreignObject> for 1500+ markers would choke a low-end device; plain
 * SVG <use> is handled by the GPU and stays smooth.
 */
const LAYER_ICON_PATHS = {
  home: "M3 12 12 3l9 9M5 10v10h14V10",
  coins: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8V6m0 12v2M6 8h12M6 16h12",
  clipboard: "M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2",
  scale: "M16 3h5v5M4 20 16 8M21 3 8 16M7 17h10M12 17v4M9 21h6",
  megaphone: "M3 11l18-5v12L3 13M11.6 16.8a3 3 0 1 1-5.8-1.6",
  droplets: "M12 2s7 8 7 13a7 7 0 1 1-14 0c0-5 7-13 7-13z",
  landmark: "M3 21h18M5 21V7l7-4 7 4v14M9 21V11h6v10M9 9h.01M15 9h.01",
  route: "M3 17l6-6 4 4 8-8M3 17h6m4 0h8",
  alert: "M12 9v4m0 4h.01M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z",
  users: "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75",
  "shield-alert": "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10zM12 8v4M12 16h.01",
  heart: "M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z",
  "heart-pulse": "M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7zM3.22 12H9.5l.5-1 2 4 2-7 1.5 4h5.27",
  "graduation-cap": "M22 10v6M2 10l10-5 10 5-10 5zM6 12v5c0 1.66 2.69 3 6 3s6-1.34 6-3v-5",
  zap: "M13 2 3 14h9l-1 8 10-12h-9z",
  "shopping-cart": "M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4zM3 6h18M16 10a4 4 0 0 1-8 0",
  grid: "M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z",
  leaf: "M11 20A7 7 0 0 1 9.8 6.9C15.5 4.9 20 2 20 2s-1.2 5.4-4.5 9.5M5 20l5-5",
};

export function IconSymbols() {
  return (
    <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true">
      <defs>
        {Object.entries(LAYER_ICON_PATHS).map(([name, path]) => (
          <symbol key={name} id={`li-${name}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d={path} />
          </symbol>
        ))}
      </defs>
    </svg>
  );
}
