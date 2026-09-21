import { chromium } from '@playwright/test';
import path from 'path';
const LOCAL = process.env.LOCALAPPDATA;
const EXE = path.join(LOCAL, 'ms-playwright', 'chromium_headless_shell-1234', 'chrome-headless-shell-win64', 'chrome-headless-shell.exe');
const browser = await chromium.launch({ executablePath: EXE });
const page = await browser.newPage({ viewport: { width: 1600, height: 1000 } });
await page.goto('http://127.0.0.1:3000/', { waitUntil: 'networkidle', timeout: 45000 });
await page.waitForTimeout(3500);

// Click a data-layer marker
await page.evaluate(() => {
  const markers = [...document.querySelectorAll('.globe-svg .marker')];
  const dp = markers.find(m => m.querySelector('use'));
  if (dp) dp.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
});
await page.waitForTimeout(2000);

// Click 'Start a trail from here'
await page.click('.detail-cta');
await page.waitForTimeout(2000);

const modalH2 = await page.$eval('.modal h2', el => el.textContent).catch(() => 'no modal');
console.log('Modal opened:', modalH2);

// Close modal
await page.keyboard.press('Escape');
await page.waitForTimeout(1000);

// Switch to Trails tab
await page.click('button:has-text("Trails")');
await page.waitForTimeout(2000);
const trailRows = await page.$$eval('.trail-row', els => els.map(e => e.textContent.trim())).catch(() => []);
console.log('Trails tab rows:', trailRows.length);
const tracked = trailRows.filter(r => r.includes('Packet'));
console.log('Tracked trails (with Packet):', tracked.length);
console.log('Sample tracked:', tracked.slice(0, 2));

await browser.close();