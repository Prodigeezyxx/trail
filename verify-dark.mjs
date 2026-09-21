import { chromium } from '@playwright/test';
const EXE = process.env.LOCALAPPDATA + '\\ms-playwright\\chromium_headless_shell-1234\\chrome-headless-shell-win64\\chrome-headless-shell.exe';
const OUT = process.env.LOCALAPPDATA + '\\Temp\\';
const browser = await chromium.launch({ executablePath: EXE });
const page = await browser.newPage({ viewport: { width: 1600, height: 1000 } });
const errs = [];
page.on('pageerror', e => errs.push('pageerror: ' + e.message.slice(0, 250)));
page.on('console', m => { if (m.type() === 'error') errs.push('console: ' + m.text().slice(0, 250)); });

await page.goto('http://127.0.0.1:3000/', { waitUntil: 'networkidle', timeout: 45000 });
await page.waitForTimeout(2500);

const snap = async () => page.evaluate(() => ({
  globe: !!document.querySelector('.globe-svg'),
  flat: !!document.querySelector('.africa-map'),
  list: !!document.querySelector('.record-list'),
  globeCountries: document.querySelectorAll('.globe-svg path.country').length,
  flatCountries: document.querySelectorAll('.africa-map path.country').length,
  markers: document.querySelectorAll('.marker').length,
  listRows: document.querySelectorAll('.record-row').length,
  layersPanel: document.querySelectorAll('.layers-panel > button').length,
  detailTitle: document.querySelector('.detail-head h3')?.textContent,
  scores: [...document.querySelectorAll('.score')].map(s => s.textContent.trim()),
  statNums: [...document.querySelectorAll('.stat-num')].map(s => s.textContent),
  clock: document.querySelector('.now-time')?.textContent?.trim(),
  defcon: document.querySelector('.defcon')?.textContent?.trim(),
  sideLayers: document.querySelectorAll('.side-layers > button').length,
  bg: getComputedStyle(document.body).backgroundColor,
  fontH1: getComputedStyle(document.querySelector('h1')).fontFamily,
}));

const out = { default: await snap() };
await page.screenshot({ path: OUT + 'trail-dark-globe.png' });

await page.getByRole('button', { name: 'Map', exact: true }).click();
await page.waitForTimeout(1200);
out.Map = await snap();
await page.screenshot({ path: OUT + 'trail-dark-map.png' });

await page.getByRole('button', { name: 'List' }).click();
await page.waitForTimeout(900);
out.List = await snap();

// interactions
await page.getByRole('button', { name: 'Map', exact: true }).click();
await page.waitForTimeout(800);
await page.locator('.marker').nth(3).click();
await page.waitForTimeout(700);
out.afterMarkerClick = await page.evaluate(() => ({
  detailTitle: document.querySelector('.detail-head h3')?.textContent,
  place: document.querySelector('.detail-place')?.textContent,
}));

const mobile = await browser.newPage({ viewport: { width: 390, height: 844 } });
await mobile.goto('http://127.0.0.1:3000/', { waitUntil: 'networkidle', timeout: 45000 });
await mobile.waitForTimeout(2000);
await mobile.screenshot({ path: OUT + 'trail-dark-mobile.png' });
out.mobile = await mobile.evaluate(() => ({
  globe: !!document.querySelector('.globe-svg'),
  sidebarHidden: getComputedStyle(document.querySelector('.sidebar')).transform !== 'none',
  overflowX: document.documentElement.scrollWidth > window.innerWidth + 2,
}));

console.log(JSON.stringify(out, null, 2));
console.log('ERRORS:', errs.length ? errs : '(none)');
await browser.close();