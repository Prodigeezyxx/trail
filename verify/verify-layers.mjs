import { chromium } from '@playwright/test';
const EXE = process.env.LOCALAPPDATA + '\\ms-playwright\\chromium_headless_shell-1234\\chrome-headless-shell-win64\\chrome-headless-shell.exe';
const OUT = process.env.LOCALAPPDATA + '\\Temp\\';
const browser = await chromium.launch({ executablePath: EXE });
const page = await browser.newPage({ viewport: { width: 1600, height: 1000 } });
const errs = [];
page.on('pageerror', e => errs.push(e.message.slice(0, 200)));
page.on('console', m => { if (m.type() === 'error') errs.push(m.text().slice(0, 200)); });

await page.goto('http://127.0.0.1:3000/', { waitUntil: 'networkidle', timeout: 45000 });
await page.waitForTimeout(3500); // give layer data time to load

const R = await page.evaluate(() => {
  const markers = document.querySelectorAll('.marker').length;
  const issuePins = document.querySelectorAll('.issue-pin').length;
  const covered = document.querySelectorAll('.globe-svg path.country.covered').length;
  const context = document.querySelectorAll('.globe-svg path.country.context').length;
  const labels = document.querySelectorAll('.country-label').length;
  const layerButtons = [...document.querySelectorAll('.layers-panel button')].map(b => b.textContent.replace(/Layer|\n/g, '').trim());
  // count the total data markers via a different route: check how many records
  // match a known data-layer id prefix
  const canvas = document.querySelector('canvas');
  return { markers, issuePins, covered, context, labels, hasCanvas: !!canvas, layerButtons };
});
await page.screenshot({ path: OUT + 'trail-layers-globe.png' });

// Map view
await page.getByRole('button', { name: 'Map', exact: true }).click();
await page.waitForTimeout(1500);
const mapView = await page.evaluate(() => ({
  markers: document.querySelectorAll('.marker').length,
  issuePins: document.querySelectorAll('.issue-pin').length,
  covered: document.querySelectorAll('.africa-map path.country.covered').length,
  labels: [...document.querySelectorAll('.africa-map text.country-label')].map(t => t.textContent).slice(0, 5),
}));
await page.screenshot({ path: OUT + 'trail-layers-map.png' });

// count layer files available
console.log(JSON.stringify({ ...R, mapView }, null, 2));
console.log('ERRORS:', errs.length ? errs.slice(0, 6) : '(none)');
await browser.close();