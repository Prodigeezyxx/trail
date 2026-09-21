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

// The detail panel for a data point should show "Start a trail from here"
const detailH3 = await page.$eval('.detail-panel h3', el => el.textContent).catch(() => 'none');
console.log('Detail h3:', detailH3);

// Click "Start a trail from here"
await page.click('.detail-cta');
await page.waitForTimeout(3000);

// Close the modal that opens (File modal)
await page.keyboard.press('Escape');
await page.waitForTimeout(1500);

// Go to Trails tab
await page.click('button:has-text("Trails")');
await page.waitForTimeout(2000);

const rows = await page.$$eval('.trail-row', els => 
  els.map(e => ({ 
    text: e.textContent.trim().slice(0, 70), 
    tracked: e.classList.contains('tracked'),
    hasPacket: e.querySelector('svg') !== null
  }))
).catch(() => []);
console.log('Total rows:', rows.length);
console.log('Tracked:', rows.filter(r => r.tracked).length);
rows.forEach((r, i) => console.log(`  ${i+1}. [${r.tracked ? 'T' : 'U'}] ${r.text}`));

await browser.close();