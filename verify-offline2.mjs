import { chromium } from '@playwright/test';

const EXE = process.env.LOCALAPPDATA + '\\ms-playwright\\chromium_headless_shell-1234\\chrome-headless-shell-win64\\chrome-headless-shell.exe';
const PROFILE = process.env.LOCALAPPDATA + '\\Temp\\trail-profile';
const phase = process.argv[2] || 'warm';

const ctx = await chromium.launchPersistentContext(PROFILE, { executablePath: EXE, viewport: { width: 1280, height: 900 } });
const page = ctx.pages()[0] || await ctx.newPage();

let err = '';
try {
  await page.goto('http://127.0.0.1:3000/', { waitUntil: phase === 'warm' ? 'networkidle' : 'load', timeout: 30000 });
  await page.waitForTimeout(2500);
} catch (e) { err = e.message.split('\n')[0]; }

const text = (await page.locator('body').innerText().catch(() => '')).replace(/\s+/g, ' ').trim();
const sw = await page.evaluate(async () => {
  if (!('serviceWorker' in navigator)) return 'no-sw';
  const regs = await navigator.serviceWorker.getRegistrations();
  const keys = await caches.keys();
  let n = 0;
  for (const k of keys) { const c = await caches.open(k); n += (await c.keys()).length; }
  return { controllers: !!navigator.serviceWorker.controller, regs: regs.length, caches: keys, cached: n };
}).catch(e => 'eval-failed: ' + e.message);

console.log(JSON.stringify({
  phase,
  rendered: text.length > 500,
  textLength: text.length,
  textHead: text.slice(0, 220),
  serviceWorker: sw,
  navError: err,
}, null, 2));

if (phase === 'cold') await page.screenshot({ path: process.env.LOCALAPPDATA + '\\Temp\\trail-offline-real.png', fullPage: false }).catch(() => {});
await ctx.close();
