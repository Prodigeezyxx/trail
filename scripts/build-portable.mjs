import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

/**
 * Two portable outputs, because they are genuinely different things:
 *
 * 1. portable/trail-offline/        — a folder to SERVE (python -m http.server, a
 *    USB-stick web server, Vercel, nginx). Service worker works here.
 *
 * 2. portable/trail-offline.html    — ONE file, double-clickable, no server.
 *
 * Verified the hard way: a folder build opened with file:// does NOT work.
 * Chromium blocks module scripts and stylesheets loaded from file:// because
 * the page origin is `null` and the request is treated as cross-origin. The
 * only honest way to make a double-clickable build is to inline the JavaScript,
 * the CSS and the fonts into the HTML so nothing is requested at all.
 */

const SRC = "dist";
const OUT = "portable";
const DIRNAME = "trail-offline";
const SINGLE = "trail-offline.html";

if (!existsSync(SRC)) {
  console.error("dist/ not found — run `npm run build` first.");
  process.exit(1);
}

mkdirSync(OUT, { recursive: true });

/* ---------------------------------------------- 1. the servable folder */

const target = join(OUT, DIRNAME);
rmSync(target, { recursive: true, force: true });
mkdirSync(target, { recursive: true });

const copyDir = (from, to, skip = () => false) => {
  for (const e of readdirSync(from, { withFileTypes: true })) {
    const f = join(from, e.name), t = join(to, e.name);
    if (skip(e.name)) continue;
    if (e.isDirectory()) { mkdirSync(t, { recursive: true }); copyDir(f, t, skip); }
    else writeFileSync(t, readFileSync(f));
  }
};
copyDir(SRC, target, (name) => name === "sw.js");

/* -------------------------------------------- 2. the single-file build */

const distHtml = readFileSync(join(SRC, "index.html"), "utf8");
const assetsDir = join(SRC, "assets");
const assetFiles = readdirSync(assetsDir);

const findAsset = (ext) => assetFiles.find((f) => f.endsWith(ext));
const jsFile = findAsset(".js");
const cssFile = findAsset(".css");

if (!jsFile || !cssFile) {
  console.error("dist/assets must contain exactly one .js and one .css for the single-file build.");
  process.exit(1);
}

const js = readFileSync(join(assetsDir, jsFile), "utf8");
let css = readFileSync(join(assetsDir, cssFile), "utf8");

// Inline every font as a data URI. 7 woff2 files is ~150 KB, ~200 KB base64 —
// cheap next to the alternative of not running at all.
const inlined = [];
css = css.replace(/url\((["']?)([^"')]+\.woff2?)\1\)/g, (match, quote, ref) => {
  const name = ref.split("/").pop();
  const full = join(assetsDir, name);
  if (!existsSync(full)) return match;
  const b64 = readFileSync(full).toString("base64");
  inlined.push(name);
  return `url(data:font/woff2;base64,${b64})`;
});

const faviconSvg = existsSync(join(SRC, "favicon.svg")) ? readFileSync(join(SRC, "favicon.svg"), "utf8") : null;

// NOTE: replacements are FUNCTIONS, not strings. A minified bundle contains
// sequences like $& and $' which, in a string replacement, are treated as
// special patterns — `$'` would splice the rest of the document into the
// script and produce an unparseable file. Function form disables that.
let html = distHtml
  .replace(/<script[^>]*src="[^"]*"[^>]*><\/script>/g, () => "")
  .replace(/<link[^>]*rel="stylesheet"[^>]*>/g, () => "")
  .replace(/<link[^>]*rel="icon"[^>]*>/g, () => (faviconSvg ? `<link rel="icon" href="data:image/svg+xml;base64,${Buffer.from(faviconSvg).toString("base64")}" />` : ""))
  .replace("</head>", () => `<style>\n${css}\n</style>\n</head>`)
  .replace("</body>", () => `<script type="module">\n${js}\n</script>\n</body>`);

const singlePath = join(OUT, SINGLE);
writeFileSync(singlePath, html, "utf8");

/* ------------------------------------------------------- 3. verify */

const problems = [];
const check = readFileSync(singlePath, "utf8");
if (/(src|href)="\.?\/?assets\//.test(check)) problems.push("single file still references an external asset");
if (/<script[^>]*\ssrc=/.test(check)) problems.push("single file still has a script src attribute");
if (/<link[^>]*rel="stylesheet"/.test(check)) problems.push("single file still has an external stylesheet link");
if (!/FeatureCollection/.test(check)) problems.push("Africa geometry is not inside the single file");
if (/url\((?!data:)["']?[^)]*\.woff2/.test(check)) problems.push("a font is still referenced as a file, not a data URI");

const dirHtml = readFileSync(join(target, "index.html"), "utf8");
if (!/src="\.\/assets\//.test(dirHtml) && !/src="assets\//.test(dirHtml)) problems.push("folder build has no relative asset path");
if (/(src|href)="\/(?!\/)/.test(dirHtml)) problems.push("folder build contains an absolute-root path");

const sizeOf = (p) => statSync(p).size;
const { size: singleSize } = statSync(singlePath);
const { size: dirSize } = statSync(join(target, "index.html"));

const readme = `TRAIL — offline copies
${"=".repeat(46)}

TWO DIFFERENT THINGS SIT IN THIS FOLDER. PICK THE RIGHT ONE.

1) trail-offline.html        <- START HERE to put it on a USB stick
   ONE file, ${(singleSize / 1024 / 1024).toFixed(2)} MB. Double-click it. That is the whole procedure.
   JavaScript, CSS, both fonts and the Africa map geometry are all
   inside that one file, so nothing is requested while it runs.
   No install, no server, no internet, no admin rights.

2) trail-offline/            <- a FOLDER, for serving
   index.html plus an assets/ folder. This one does NOT work by
   double-clicking: browsers block module scripts and stylesheets
   loaded from file:// (the page origin is null, so the request counts
   as cross-origin). Serve it instead:

       cd trail-offline
       python -m http.server 8000
       open http://localhost:8000

   Use this form for a web deployment, or when you want the offline
   app cache (service workers only run over http/https).

WHAT WORKS OFFLINE
------------------
Everything: the map, the layers, the community issues and votes, the
trail files, the packet export, and the report form.

WHAT NEEDS A CONNECTION
-----------------------
Only the three share buttons that hand text to another app (WhatsApp,
Telegram) and the external links in the Sources tab. The app shows an
OFFLINE badge in the header when you are not connected.

PRIVACY
-------
There is no server and no account. Nothing you type is transmitted.
Trails, issues, votes and reports are stored in this browser's local
storage on this machine only. "Clear this device" in the Report tab
erases them.

On a shared or public computer, anything you enter stays on that machine
until you clear it. Use a device you control for anything sensitive, and
for a report that could put you at risk use a trusted organisation's
secure channel instead of this app.

DATA
----
Data bundle: 21 Sep 2026. Each record shows its own source, the date that
source was last checked, and what the record does not tell you. A source
that has not been checked is shown as unchecked, not as verified.

Built ${new Date().toISOString().slice(0, 10)}.
`;

writeFileSync(join(OUT, "README.txt"), readme, "utf8");

console.log("PORTABLE BUILDS");
console.log(`  folder   portable/${DIRNAME}/            (serve it, or put it on a stick with a local server)`);
console.log(`  single   portable/${SINGLE}   ${(singleSize / 1024 / 1024).toFixed(2)} MB, double-click, no server`);
console.log(`  fonts inlined:  ${inlined.length}`);
console.log(`  bundle inlined: ${(js.length / 1024).toFixed(0)} KB js, ${(css.length / 1024).toFixed(0)} KB css`);

if (problems.length) {
  console.error("\nPORTABILITY PROBLEMS:");
  problems.forEach((p) => console.error(`  - ${p}`));
  process.exit(1);
}
console.log("  verified: no external references, geometry embedded, fonts embedded");
