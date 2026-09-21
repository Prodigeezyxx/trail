import { chromium } from '@playwright/test';
const EXE = process.env.LOCALAPPDATA + '\\ms-playwright\\chromium_headless_shell-1234\\chrome-headless-shell-win64\\chrome-headless-shell.exe';
const ctx = await chromium.launchPersistentContext(process.env.LOCALAPPDATA + '\\Temp\\trail-profile3', { executablePath: EXE });
const page = ctx.pages()[0] || await ctx.newPage();
try { await page.goto('http://127.0.0.1:3100/', { waitUntil: 'load', timeout: 20000 }); } catch {}
await page.waitForTimeout(1500);

const probe = await page.evaluate(async () => {
  const keys = await caches.keys();
  const cache = await caches.open(keys[0]);
  const paths = ['/', '/index.html', '/assets/index-cLv5PsEy.js', '/assets/index-RwQgvhQ3.css'];
  const out = [];
  for (const p of paths) {
    const asString = await cache.match(p);
    const asReq = await cache.match(new Request(location.origin + p));
    const corsReq = await cache.match(new Request(location.origin + p, { mode: 'cors', credentials: 'same-origin' }));
    out.push({
      path: p,
      matchByString: !!asString,
      matchByRequest: !!asReq,
      matchByCorsRequest: !!corsReq,
      vary: asString ? asString.headers.get('vary') : null,
      cacheControl: asString ? asString.headers.get('cache-control') : null,
      type: asString ? asString.type : null,
    });
  }
  return out;
});
console.log(JSON.stringify(probe, null, 2));
await ctx.close();
