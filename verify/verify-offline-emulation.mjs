import { chromium } from '@playwright/test';

const EXE = process.env.LOCALAPPDATA + '\\ms-playwright\\chromium_headless_shell-1234\\chrome-headless-shell-win64\\chrome-headless-shell.exe';
const browser = await chromium.launch({ executablePath: EXE });
const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });

const origins = new Set();
const requests = [];
ctx.on('request', r => { const u = new URL(r.url()); if (u.origin !== 'http://127.0.0.1:3000') { origins.add(u.origin); } requests.push(r.method() + ' ' + r.url()); });

const page = await ctx.newPage();
await page.goto('http://127.0.0.1:3000/', { waitUntil: 'networkidle', timeout: 45000 });
await page.waitForTimeout(2500);

const before = (await page.locator('body').innerText()).replace(/\s+/g, ' ').trim().length;
const sw = await page.evaluate(async () => {
  if (!('serviceWorker' in navigator)) return 'no-sw-api';
  const regs = await navigator.serviceWorker.getRegistrations();
  const keys = await caches.keys();
  let cached = 0;
  for (const k of keys) { const c = await caches.open(k); cached += (await c.keys()).length; }
  return { registrations: regs.length, scope: regs.map(r => r.scope), cacheKeys: keys, cachedEntries: cached };
});

console.log('--- external origins contacted ---');
console.log(origins.size ? [...origins].join('\n') : '(none - fully self-contained)');
console.log('--- total requests ---', requests.length);
console.log('--- local requests ---');
console.log(requests.filter(r => r.includes('127.0.0.1')).join('\n'));

console.log('--- service worker ---');
console.log(JSON.stringify(sw, null, 2));

// offline test
await ctx.setOffline(true);
const page2 = await ctx.newPage();
let offlineOk = null, offlineText = 0, offlineErr = '';
try {
  await page2.goto('http://127.0.0.1:3000/', { waitUntil: 'load', timeout: 30000 });
  await page2.waitForTimeout(2500);
  offlineText = (await page2.locator('body').innerText()).replace(/\s+/g, ' ').trim().length;
  offlineOk = offlineText > 500;
} catch (e) { offlineErr = e.message.split('\n')[0]; }

console.log('--- OFFLINE (network disabled) ---');
console.log(JSON.stringify({ rendered: offlineOk, textLengthOn: offlineText, textLengthOnline: before, error: offlineErr }, null, 2));
if (offlineOk) await page2.screenshot({ path: process.env.LOCALAPPDATA + '\\Temp\\trail-offline.png', fullPage: false });

await browser.close();
