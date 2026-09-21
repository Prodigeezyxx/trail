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

// Count all markers on the globe
const globeCount = await page.$eval('.globe-svg', svg => svg.querySelectorAll('.marker').length).catch(() => 0);
console.log('Globe markers:', globeCount);

// Count all trails in the Trails tab
await page.click('button:has-text("Trails")');
await page.waitForTimeout(2000);
const trailCount = await page.$$eval('.record-row', els => els.length).catch(() => 0);
console.log('Trails tab rows:', trailCount);

// Count visible records on globe view
const visibleCount = await page.$eval('.record-count', el => el.textContent).catch(() => 'not found');
console.log('Record count text:', visibleCount);

// Count sidebar layer toggles
const layerToggles = await page.$$eval('.side-layers button', els => els.length).catch(() => 0);
console.log('Layer toggles:', layerToggles);

// Check if data layer markers are in the trails list
const trailTitles = await page.$$eval('.record-row strong', els => els.map(e => e.textContent)).catch(() => []);
console.log('Trail titles (first 5):', trailTitles.slice(0, 5));

// Switch to Community tab
await page.click('button:has-text("Community")');
await page.waitForTimeout(1500);
const communityCount = await page.$$eval('.record-row', els => els.length).catch(() => 0);
console.log('Community issues:', communityCount);

console.log('TRAILS_IN_MAP:', globeCount, 'TRAILS_IN_TAB:', trailCount);
await browser.close();