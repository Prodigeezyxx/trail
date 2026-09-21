import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// `base: './'` is load-bearing, not cosmetic. Trail has to run from a flash drive
// with no server and no network, so every asset URL must be relative. With the
// default absolute base, opening index.html from a local folder resolves
// /assets/... against the filesystem root and the app loads blank.
export default defineConfig({
  base: "./",
  plugins: [react()],
  build: {
    outDir: "dist",
    assetsDir: "assets",
    // A single chunk keeps the portable folder simple: one JS, one CSS, fonts.
    chunkSizeWarningLimit: 900,
  },
});
