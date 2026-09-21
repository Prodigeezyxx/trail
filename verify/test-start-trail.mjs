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
    return { clicked: true, label: dp.getAttribute('aria-label'), icon: dp.querySelector('use')?.getAttribute('href') };
  }
  return { clicked: false };
});
console.log('Clicked data marker:', clickResult);
await page.waitForTimeout(2000);

const h3 = await page.$eval('.detail-panel h3', el => el.textContent).catch(() => 'none');
console.log('Detail h3:', h3);
const ctaText = await page.$eval('.detail-cta', el => el.textContent).catch(() => 'none');
console.log('Detail CTA text:', ctaText);

// Click 'Start a trail from here'
await page.click('.detail-cta');
await page.waitForTimeout(2000);

const modalH2 = await page.$eval('.modal h2', el => el.textContent).catch(() => 'no modal');
console.log('Modal opened:', modalH2);

// Switch to Trails tab
await page.click('button:has-text("Trails")');
await page.waitForTimeout(2000);
const trailRows = await page.$$eval('.trail-row', els => els.map(e => e.textContent.trim())).catch(() => []);
console.log('Trails tab rows:', trailRows.length);
const tracked = trailRows.filter(r => r.includes('Packet'));
console.log('Tracked trails:', tracked.length);

await browser.close();