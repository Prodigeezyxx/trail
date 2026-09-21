import { chromium } from '@playwright/test';
import path from 'path';
const LOCAL = process.env.LOCALAPPDATA;
const EXE = path.join(LOCAL, 'ms-playwright', 'chromium_headless_shell-1234', 'chrome-headless-shell-win64', 'chrome-headless-shell.exe');

const browser = await chromium.launch({ executablePath: EXE });
const page = await browser.newPage({ viewport: { width: 1600, height: 1000 } });
await page.goto('http://127.0.0.1:3000/', { waitUntil: 'networkidle', timeout: 45000 });
await page.waitForTimeout(3500);

// On Explore tab, get the record count
const exploreCount = await page.$eval('.record-count', el => el.textContent).catch(() => 'not found');
console.log('Explore record-count:', exploreCount);

// Count markers by type on the globe
const markerCounts = await page.evaluate(() => {
  const markers = document.querySelectorAll('.globe-svg .marker');
  const byClass = {};
  const byUse = {};
  markers.forEach(m => {
    const cls = m.className;
    byClass[cls] = (byClass[cls] || 0) + 1;
    const useEl = m.querySelector('use');
    if (useEl) {
      const href = useEl.getAttribute('href');
      byUse[href] = (byUse[href] || 0) + 1;
    }
  });
  return { total: markers.length, byClass, byUse };
});
console.log('Globe marker counts:', JSON.stringify(markerCounts));

// Switch to Community tab
await page.click('button:has-text("Community")');
await page.waitForTimeout(2000);
const communityText = await page.$eval('main', el => el.textContent.slice(0, 1000)).catch(() => 'no match');
console.log('Community tab text:', communityText);

// Switch to Trails tab
await page.click('button:has-text("Trails")');
await page.waitForTimeout(2000);
const trailsText = await page.$eval('main', el => el.textContent.slice(0, 2000)).catch(() => 'no match');
console.log('Trails tab text:', trailsText);

console.log('Explore:', exploreCount, 'Globe markers:', markerCounts.total);
await browser.close();