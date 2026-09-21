import { chromium } from '@playwright/test';
const EXE = process.env.LOCALAPPDATA + '\\ms-playwright\\chromium_headless_shell-1234\\chrome-headless-shell-win64\\chrome-headless-shell.exe';
const browser = await chromium.launch({ executablePath: EXE });
const page = await browser.newPage({ viewport: { width: 1440, height: 980 } });
const errs = [];
page.on('pageerror', e => errs.push('pageerror: ' + e.message.slice(0, 200)));
page.on('console', m => { if (m.type() === 'error') errs.push('console: ' + m.text().slice(0, 200)); });
await page.goto('http://127.0.0.1:3000/', { waitUntil: 'networkidle', timeout: 45000 });
await page.waitForTimeout(1200);

const probe = async () => page.evaluate(() => ({
  flatMap: !!document.querySelector('.africa-map'),
  globe: !!document.querySelector('.globe-svg'),
  list: !!document.querySelector('.record-list'),
  listItems: document.querySelectorAll('.record-list button').length,
  flatZoom: !!document.querySelector('.zoom'),
  globeControls: !!document.querySelector('.globe-controls'),
  compass: !!document.querySelector('.north'),
  heading: document.querySelector('.atlas-heading')?.innerText.replace(/\s+/g, ' ').trim(),
}));

const out = {};
out.Map = await probe();
await page.getByRole('button', { name: "God's Eye" }).click();
await page.waitForTimeout(1200);
out["God's Eye"] = await probe();
await page.getByRole('button', { name: 'List' }).click();
await page.waitForTimeout(900);
out.List = await probe();
await page.getByRole('button', { name: 'Map', exact: true }).click();
await page.waitForTimeout(900);
out["back to Map"] = await probe();

console.log(JSON.stringify(out, null, 2));
console.log('ERRORS:', errs.length ? errs : '(none)');
await browser.close();