import { chromium } from '@playwright/test';

const EXE = process.env.LOCALAPPDATA + '\\ms-playwright\\chromium_headless_shell-1234\\chrome-headless-shell-win64\\chrome-headless-shell.exe';
const PROFILE = process.env.LOCALAPPDATA + '\\Temp\\' + (process.argv[4] || 'trail-profile3');
const phase = process.argv[2] || 'warm';
const BASE = process.argv[3] || 'http://127.0.0.1:3100/';

const ctx = await chromium.launchPersistentContext(PROFILE, { executablePath: EXE, viewport: { width: 1280, height: 900 } });
const page = ctx.pages()[0] || await ctx.newPage();

const log = [];
page.on('console', m => log.push('[' + m.type() + '] ' + m.text().slice(0, 200)));
page.on('pageerror', e => log.push('[pageerror] ' + e.message.slice(0, 200)));
page.on('requestfailed', r => log.push('[FAILED] ' + r.url() + ' :: ' + (r.failure()?.errorText || '')));
const seen = [];
page.on('response', r => seen.push(r.status() + ' ' + r.url()));

let err = '';
try {
  await page.goto(BASE, { waitUntil: phase === 'warm' ? 'networkidle' : 'load', timeout: 30000 });
  await page.waitForTimeout(3000);
} catch (e) { err = e.message.split('\n')[0]; }

const html = await page.content().catch(() => '');
const text = (await page.locator('body').innerText().catch(() => '')).replace(/\s+/g, ' ').trim();
const sw = await page.evaluate(async () => {
  if (!('serviceWorker' in navigator)) return 'no-sw';
  const regs = await navigator.serviceWorker.getRegistrations();
  const keys = await caches.keys();
  let n = 0; const names = [];
  for (const k of keys) { const c = await caches.open(k); const reqs = await c.keys(); n += reqs.length; names.push(k + ':' + reqs.map(r => new URL(r.url).pathname).join(',')); }
  return { controlled: !!navigator.serviceWorker.controller, regs: regs.length, total: n, entries: names };
}).catch(e => 'eval-failed: ' + e.message);

console.log(JSON.stringify({
  phase, base: BASE,
  rendered: text.length > 500, textLength: text.length,
  htmlLength: html.length,
  htmlHead: html.slice(0, 300),
  sw, navError: err,
  responses: seen.slice(0, 30),
  log: log.slice(0, 30),
}, null, 2));

if (phase === 'cold') await page.screenshot({ path: process.env.LOCALAPPDATA + '\\Temp\\trail-cold.png' }).catch(() => {});
await ctx.close();
