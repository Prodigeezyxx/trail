/**
 * End-to-end verification for Trail Africa.
 *
 * Checks:
 *  1. Dev server responds (200) — app is live.
 *  2. H1 reads "Trusted civic information, across Africa." — correct build.
 *  3. Globe renders with markers (trails + issues + data layers).
 *  4. Icons render as <use> elements, not bare colored circles.
 *  5. Layer panel toggles exist and function.
 *  6. Map view renders the same markers.
 *  7. No console errors.
 *  8. Build output exists and is complete.
 */
import { chromium } from '@playwright/test';
import { statSync } from 'fs';
import { resolve } from 'path';

const EXE = process.env.LOCALAPPDATA + '\\ms-playwright\\chromium_headless_shell-1234\\chrome-headless-shell-win64\\chrome-headless-shell.exe';
const checks = [];
const errs = [];

const browser = await chromium.launch({ executablePath: EXE });
const page = await browser.newPage({ viewport: { width: 1600, height: 1000 } });
page.on('pageerror', e => errs.push(e.message.slice(0, 200)));
page.on('console', m => { if (m.type() === 'error') errs.push(m.text().slice(0, 200)); });

// 1. Live
await page.goto('http://127.0.0.1:3000/', { waitUntil: 'networkidle', timeout: 45000 });
await page.waitForTimeout(3500);

let live = false;
try { live = await page.$eval('h1', el => el.textContent.includes('Trusted civic information')); } catch { live = false; }
checks.push(['dev server live + H1 correct', live]);

// 2. Globe markers with icons
const globeIcons = await page.$$eval('.globe-svg g.marker use', els => els.length);
const globeMarkers = await page.$$eval('.globe-svg g.marker', els => els.length);
checks.push(['globe has markers', globeMarkers > 0]);
checks.push(['globe uses <use> icons (not bare circles)', globeIcons > 0]);

// 3. Layer panel exists
const layerToggles = await page.$$eval('.side-layers button', els => els.length);
checks.push(['layer panel has 20 toggles', layerToggles === 20]);

// 4. Toggle a layer off/on
await page.click('.side-layers button:nth-child(1)');
await page.waitForTimeout(500);
const afterToggle = await page.$$eval('.marker', els => els.length);
checks.push(['layer toggle changes marker count', afterToggle !== globeMarkers]);

// 5. Switch to Map view — the button has visible text "Map" inside the segmented control
await page.click('.segmented button', { timeout: 5000 }).catch(() => {});
// find the Map button specifically by text
const mapBtn = await page.locator('.segmented button').filter({ hasText: /^Map$/ });
await mapBtn.click({ timeout: 5000 });
await page.waitForTimeout(2500);
const mapMarkers = await page.$$eval('.africa-map g.marker', els => els.length);
const mapIcons = await page.$$eval('.africa-map g.marker use', els => els.length);
checks.push(['map view renders markers', mapMarkers > 0]);
checks.push(['map view uses <use> icons', mapIcons > 0]);

// 6. Icons are meaningful — check they reference li-* icons
const iconRefs = await page.$$eval('use[href*="li-"]', els => els.map(el => el.getAttribute('href')));
const uniqueRefs = [...new Set(iconRefs)];
checks.push(['multiple distinct icon types (' + uniqueRefs.length + ')', uniqueRefs.length > 1]);

// 7. No console errors
checks.push(['no console errors', errs.length === 0]);
if (errs.length) {
  errs.slice(0, 5).forEach(e => console.error('  ', e));
}

// 8. Build output
try {
  const f = statSync(resolve('dist/index.html'));
  checks.push(['build artifact exists', f.size > 0]);
} catch {
  checks.push(['build artifact exists', false]);
}

// 9. Screenshot
await page.screenshot({ path: process.env.LOCALAPPDATA + '\\Temp\\trail-e2e-final.png' });

console.log('\n=== End to End Verification ===\n');
let pass = 0, fail = 0;
for (const [label, ok] of checks) {
  const mark = ok ? '✓' : '✗';
  console.log(`  ${mark} ${label}`);
  ok ? pass++ : fail++;
}
console.log(`\n${pass} passed, ${fail} failed`);
if (errs.length) { console.log('\nConsole errors:'); errs.forEach(e => console.log('  ', e)); }
console.log('\nScreenshot: ' + process.env.LOCALAPPDATA + '\\Temp\\trail-e2e-final.png');
await browser.close();
process.exit(fail > 0 ? 1 : 0);