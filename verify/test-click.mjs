import { chromium } from '@playwright/test';
import path from 'path';
const LOCAL = process.env.LOCALAPPDATA;
const EXE = path.join(LOCAL, 'ms-playwright', 'chromium_headless_shell-1234', 'chrome-headless-shell-win64', 'chrome-headless-shell.exe');

const browser = await chromium.launch({ executablePath: EXE });
const page = await browser.newPage({ viewport: { width: 1600, height: 1000 } });
page.on('pageerror', e => console.log('JS ERROR:', e.message));
page.on('console', m => { if (m.type() === 'error') console.log('CONSOLE ERROR:', m.text()); });

await page.goto('http://127.0.0.1:3000/', { waitUntil: 'networkidle', timeout: 45000 });
await page.waitForTimeout(3000);

// Count markers on globe
const globeMarkers = await page.$$eval('.globe-svg .marker', els => els.length);
console.log('Globe markers:', globeMarkers);

// Try clicking the first visible marker
const firstMarker = await page.$('.globe-svg .marker');
if (firstMarker) {
  const ariaLabel = await firstMarker.getAttribute('aria-label');
  console.log('First marker label:', ariaLabel);
  
  // Try scroll/click
  await firstMarker.scrollIntoViewIfNeeded();
  await page.waitForTimeout(500);
  
  // Click and check if modal appears
  await firstMarker.click({ timeout: 5000 });
  await page.waitForTimeout(2000);
  
  const modal = await page.$('.modal');
  const overlay = await page.$('.overlay');
  console.log('Modal present:', !!modal, '| Overlay present:', !!overlay);
  
  if (mod) {
    const modalTitle = await page.$eval('.modal h2', el => el.textContent);
    console.log('Modal title:', modalTitle);
  }
} else {
  console.log('No markers found on globe');
}

// Also check the flat map
await page.click('.segmented button', { timeout: 5000 }).catch(() => {});
await page.evaluate(() => {
  const btns = [...document.querySelectorAll('.segmented button')];
  const mapBtn = btns.find(b => b.textContent.trim() === 'Map');
  mapBtn?.click();
});
await page.waitForTimeout(2000);

const mapMarkers = await page.$$eval('.africa-map .marker', els => els.length);
console.log('Map markers:', mapMarkers);

const firstMapMarker = await page.$('.africa-map .marker');
if (firstMapMarker) {
  const label = await firstMapMarker.getAttribute('aria-label');
  console.log('First map marker label:', label);
  await firstMapMarker.click({ timeout: 5000 });
  await page.waitForTimeout(2000);
  const modal = await page.$('.modal');
  console.log('Modal after map click:', !!modal);
}

console.log('Screenshot...');
await page.screenshot({ path: path.join(LOCAL, 'Temp', 'trail-click-test.png') });
console.log('Saved');
await browser.close();