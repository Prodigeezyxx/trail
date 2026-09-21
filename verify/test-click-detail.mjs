import { chromium } from '@playwright/test';
import path from 'path';
const LOCAL = process.env.LOCALAPPDATA;
const EXE = path.join(LOCAL, 'ms-playwright', 'chromium_headless_shell-1234', 'chrome-headless-shell-win64', 'chrome-headless-shell.exe');

const browser = await chromium.launch({ executablePath: EXE });
const page = await browser.newPage({ viewport: { width: 1600, height: 1000 } });
page.on('pageerror', e => console.log('JS ERROR:', e.message));
page.on('console', m => { if (m.type() === 'error') console.log('LOG ERROR:', m.text()); });

await page.goto('http://127.0.0.1:3000/', { waitUntil: 'networkidle', timeout: 45000 });
await page.waitForTimeout(3500);

// Click a data-layer marker
const clickResult = await page.evaluate(() => {
  const markers = [...document.querySelectorAll('.globe-svg .marker')];
  const dp = markers.find(m => m.querySelector('use'));
  if (dp) {
    const evt = new MouseEvent('click', { bubbles: true, cancelable: true });
    dp.dispatchEvent(evt);
    return { clicked: true, label: dp.getAttribute('aria-label'), layer: dp.querySelector('use')?.getAttribute('href') };
  }
  return { clicked: false };
});
console.log('Data marker clicked:', clickResult);
await page.waitForTimeout(2000);

const detailH3 = await page.$eval('.detail-panel h3', el => el.textContent).catch(() => 'no h3');
console.log('Detail panel h3:', detailH3);
const detailEyebrow = await page.$eval('.detail-panel .eyebrow', el => el.textContent).catch(() => 'no eyebrow');
console.log('Detail eyebrow:', detailEyebrow);
const detailSource = await page.$eval('.detail-panel .detail-meta div:first-child', el => el.textContent).catch(() => 'no source');
console.log('Detail source:', detailSource);
const hasDataDetail = await page.$('.detail-panel').then(el => !!el);
console.log('Detail panel present:', hasDataDetail);

// Now click a trail marker
const trailResult = await page.evaluate(() => {
  const markers = [...document.querySelectorAll('.globe-svg .marker')];
  const tm = markers.find(m => !m.querySelector('use'));
  if (tm) {
    const evt = new MouseEvent('click', { bubbles: true, cancelable: true });
    tm.dispatchEvent(evt);
    return { clicked: true, label: tm.getAttribute('aria-label') };
  }
  return { clicked: false };
});
console.log('Trail clicked:', trailResult);
await page.waitForTimeout(1000);
const trailH3 = await page.$eval('.detail-panel h3', el => el.textContent).catch(() => 'no h3');
console.log('Trail detail h3:', trailH3);
const trailEyebrow = await page.$eval('.detail-panel .eyebrow', el => el.textContent).catch(() => 'no eyebrow');
console.log('Trail detail eyebrow:', trailEyebrow);

await page.screenshot({ path: path.join(LOCAL, 'Temp', 'trail-click-verify.png') });
console.log('screenshot saved');
await browser.close();