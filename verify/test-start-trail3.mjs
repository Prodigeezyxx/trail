import { chromium } from '@playwright/test';
import path from 'path';
const LOCAL = process.env.LOCALAPPDATA;
const EXE = path.join(LOCAL, 'ms-playwright', 'chromium_headless_shell-1234', 'chrome-headless-shell-win64', 'chrome-headless-shell.exe');
const browser = await chromium.launch({ executablePath: EXE });
const page = await browser.newPage({ viewport: { width: 1600, height: 1000 } });
await page.goto('http://127.0.0.1:3000/', { waitUntil: 'networkidle', timeout: 45000 });
await page.waitForTimeout(3500);

// Get initial Trails count
await page.click('button:has-text("Trails")');
await page.waitForTimeout(2000);
const initial = await page.$$eval('.trail-row', els => els.length).catch(() => []);
console.log('Initial Trails rows:', initial);

// Go back to Explore
await page.click('button:has-text("Explore")');
await page.waitForTimeout(1000);

// Click a data-layer marker
const clicked = await page.evaluate(() => {
  const markers = [...document.querySelectorAll('.globe-svg .marker')];
  const dp = markers.find(m => m.querySelector('use'));
  if (dp) {
    dp.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
    return true;
  }
  return false;
});
console.log('Marker clicked:', clicked);
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
const after = await page.$$eval('.trail-row', els => els.length).catch(() => []);
console.log('After starting trail - Trails rows:', after);
const tracked = await page.$$eval('.trail-row.tracked', els => els.length).catch(() => []);
console.log('Tracked trails:', tracked);

const rows = await page.$$eval('.trail-row', els => 
  els.map(e => ({ text: e.textContent.trim().slice(0, 60), tracked: e.classList.contains('tracked') }))
).catch(() => []);
console.log('First 3 rows:', rows.slice(0, 3));

await browser.close();