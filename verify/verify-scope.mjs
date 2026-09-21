import { chromium } from '@playwright/test';
const EXE = process.env.LOCALAPPDATA + '\\ms-playwright\\chromium_headless_shell-1234\\chrome-headless-shell-win64\\chrome-headless-shell.exe';
const OUT = process.env.LOCALAPPDATA + '\\Temp\\';
const browser = await chromium.launch({ executablePath: EXE });
const page = await browser.newPage({ viewport: { width: 1600, height: 1000 } });
const errs = [];
page.on('pageerror', e => errs.push('PAGEERROR: ' + e.message.slice(0, 200)));
page.on('console', m => { if (m.type() === 'error') errs.push('console: ' + m.text().slice(0, 200)); });

await page.goto('http://127.0.0.1:3000/', { waitUntil: 'networkidle', timeout: 45000 });
await page.waitForTimeout(2500);

const R = await page.evaluate(() => ({
  title: document.title,
  brand: document.querySelector('.brand')?.innerText.replace(/\s+/g, ' ').trim(),
  workspaceTag: document.querySelector('.workspace-tag')?.innerText.trim(),
  heading: document.querySelector('.atlas-heading')?.innerText.replace(/\s+/g, ' ').trim(),
  countryOptions: [...document.querySelectorAll('.country-select option')].map(o => o.textContent),
  globeCovered: document.querySelectorAll('.globe-svg path.country.covered').length,
  globeContext: document.querySelectorAll('.globe-svg path.country.context').length,
  globeReadout: document.querySelector('.globe-readout')?.textContent?.trim(),
}));
await page.screenshot({ path: OUT + 'trail-africa-globe.png' });

// globe must still not rotate
const r1 = await page.locator('.globe-readout').textContent();
await page.waitForTimeout(4000);
const r2 = await page.locator('.globe-readout').textContent();
R.globeIdleStill = r1.trim() === r2.trim();

// flat map: does it fit our footprint?
await page.getByRole('button', { name: 'Map', exact: true }).click();
await page.waitForTimeout(1200);
R.map = await page.evaluate(() => {
  const paths = [...document.querySelectorAll('.africa-map path.country.covered')];
  const boxes = paths.map(p => p.getBBox());
  const minX = Math.min(...boxes.map(b => b.x)), maxX = Math.max(...boxes.map(b => b.x + b.width));
  const minY = Math.min(...boxes.map(b => b.y)), maxY = Math.max(...boxes.map(b => b.y + b.height));
  return {
    covered: paths.length,
    context: document.querySelectorAll('.africa-map path.country.context').length,
    labels: [...document.querySelectorAll('.africa-map text.country-label')].map(t => t.textContent),
    bounds: { x: Math.round(minX), y: Math.round(minY), w: Math.round(maxX - minX), h: Math.round(maxY - minY) },
    viewport: { w: 1060, h: 675 },
  };
});
await page.screenshot({ path: OUT + 'trail-africa-map.png' });

// country filter actually narrows to our data
await page.locator('.country-select select').selectOption('Kenya');
await page.waitForTimeout(800);
R.kenyaFilter = (await page.locator('.record-count').first().innerText()).replace(/\s+/g, ' ').trim();
await page.locator('.country-select select').selectOption('All Africa');
await page.waitForTimeout(600);

console.log(JSON.stringify(R, null, 2));
console.log('ERRORS:', errs.length ? errs : '(none)');
await browser.close();