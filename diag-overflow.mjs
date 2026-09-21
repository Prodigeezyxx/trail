import { chromium } from '@playwright/test';
const EXE = process.env.LOCALAPPDATA + '\\ms-playwright\\chromium_headless_shell-1234\\chrome-headless-shell-win64\\chrome-headless-shell.exe';
const browser = await chromium.launch({ executablePath: EXE });
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
await page.goto('http://127.0.0.1:3000/', { waitUntil: 'networkidle', timeout: 40000 });
await page.waitForTimeout(2200);
const out = await page.evaluate(() => {
  const vw = window.innerWidth;
  const offenders = [];
  document.querySelectorAll('*').forEach((el) => {
    const r = el.getBoundingClientRect();
    if (r.width > 0 && (r.right > vw + 1 || r.left < -1)) {
      offenders.push({
        tag: el.tagName.toLowerCase(),
        cls: (el.className || '').toString().slice(0, 60),
        left: Math.round(r.left), right: Math.round(r.right), width: Math.round(r.width),
        text: (el.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 40),
      });
    }
  });
  const atlas = document.querySelector('.atlas')?.getBoundingClientRect();
  const lp = document.querySelector('.layers-panel')?.getBoundingClientRect();
  return {
    viewport: vw,
    docScrollWidth: document.documentElement.scrollWidth,
    bodyScrollWidth: document.body.scrollWidth,
    atlas: atlas ? { top: Math.round(atlas.top), h: Math.round(atlas.height), bottom: Math.round(atlas.bottom) } : null,
    layersPanel: lp ? { top: Math.round(lp.top), h: Math.round(lp.height), bottom: Math.round(lp.bottom) } : null,
    offenders: offenders.slice(0, 25),
  };
});
console.log(JSON.stringify(out, null, 2));
await browser.close();