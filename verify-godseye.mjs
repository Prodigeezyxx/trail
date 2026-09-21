import { chromium } from '@playwright/test';
const EXE = process.env.LOCALAPPDATA + '\\ms-playwright\\chromium_headless_shell-1234\\chrome-headless-shell-win64\\chrome-headless-shell.exe';
const browser = await chromium.launch({ executablePath: EXE });
const page = await browser.newPage({ viewport: { width: 1440, height: 980 } });
const errs = [];
page.on('pageerror', e => errs.push('pageerror: ' + e.message.slice(0, 300)));
page.on('console', m => { if (m.type() === 'error') errs.push('console: ' + m.text().slice(0, 300)); });

await page.goto('http://127.0.0.1:3000/', { waitUntil: 'networkidle', timeout: 45000 });
await page.waitForTimeout(1500);

// switch to the God's Eye renderer
await page.getByRole('button', { name: "God's Eye" }).click();
await page.waitForTimeout(2500);

const probe = await page.evaluate(() => {
  const svg = document.querySelector('.globe-svg');
  const sphere = svg?.querySelector('.globe-sphere');
  const bb = sphere?.getBBox?.();
  return {
    globePresent: !!svg,
    spherePathLength: (sphere?.getAttribute('d') || '').length,
    sphereBBox: bb ? { x: Math.round(bb.x), y: Math.round(bb.y), w: Math.round(bb.width), h: Math.round(bb.height) } : null,
    countriesDrawn: svg ? svg.querySelectorAll('path.country').length : 0,
    graticulePresent: !!svg?.querySelector('.globe-graticule'),
    limbPresent: !!svg?.querySelector('.globe-limb'),
    markers: svg ? svg.querySelectorAll('g.marker').length : 0,
    markerLabels: svg ? [...svg.querySelectorAll('g.marker text.pin-label')].map(t => t.textContent) : [],
    controls: [...document.querySelectorAll('.globe-controls button')].map(b => b.textContent.trim()),
    heading: document.querySelector('.atlas-heading')?.innerText.replace(/\s+/g, ' ').trim(),
    flatZoomVisible: !!document.querySelector('.zoom'),
    flatMapVisible: !!document.querySelector('.africa-map'),
    compassVisible: !!document.querySelector('.north'),
    selectedTitle: document.querySelector('.detail-panel h3, .record-panel h3, .atlas h3')?.textContent || null,
  };
});
console.log(JSON.stringify(probe, null, 2));
await page.screenshot({ path: process.env.LOCALAPPDATA + '\\Temp\\trail-godseye.png' });

// let it spin, then confirm rotation actually advances
const before = await page.evaluate(() => document.querySelectorAll('.globe-svg g.marker').length);
await page.waitForTimeout(2500);
const readout = await page.evaluate(() => document.querySelector('.globe-readout')?.textContent?.trim());
console.log('readout after spin:', readout, '| markers stable:', before);

// drag to rotate
const box = await page.locator('.globe-svg').boundingBox();
await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
await page.mouse.down();
await page.mouse.move(box.x + box.width / 2 + 220, box.y + box.height / 2, { steps: 12 });
await page.mouse.up();
await page.waitForTimeout(600);
console.log('readout after drag:', await page.evaluate(() => document.querySelector('.globe-readout')?.textContent?.trim()));
await page.screenshot({ path: process.env.LOCALAPPDATA + '\\Temp\\trail-godseye-dragged.png' });

console.log('ERRORS:', errs.length ? errs : '(none)');
await browser.close();