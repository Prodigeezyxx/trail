import { chromium } from '@playwright/test';
import path from 'path';
const LOCAL = process.env.LOCALAPPDATA;
const EXE = path.join(LOCAL, 'ms-playwright', 'chromium_headless_shell-1234', 'chrome-headless-shell-win64', 'chrome-headless-shell.exe');

const browser = await chromium.launch({ executablePath: EXE });
const page = await browser.newPage({ viewport: { width: 1600, height: 1000 } });
await page.goto('http://127.0.0.1:3000/', { waitUntil: 'networkidle', timeout: 45000 });
await page.waitForTimeout(2000);

function byName(name) {
  return page.evaluate((n) => {
    const btns = [...document.querySelectorAll('nav button')];
    const match = btns.find(b => b.textContent.replace(/\s+/g, ' ').trim() === n);
    if (match) { match.click(); return true; }
    return false;
  }, name);
}

// Sources tab
const clickedSource = await byName('Sources');
console.log('Clicked Sources:', clickedSource);
await page.waitForTimeout(2000);
const sourcesH1 = await page.$eval('h1', el => el.textContent);
console.log('Sources H1:', sourcesH1);
const dsRows = await page.$$eval('.dataset-row', els => els.length);
console.log('Data source rows:', dsRows);
const allH1s = await page.$$eval('h1', els => els.map(e => e.textContent));
console.log('All h1s:', allH1s);

// Report tab
const clickedReport = await byName('Report');
console.log('Clicked Report:', clickedReport);
await page.waitForTimeout(2000);
const reportH1 = await page.$eval('h1', el => el.textContent);
console.log('Report H1:', reportH1);
const pathways = await page.$$eval('.pathway', els => els.length);
console.log('Report pathways:', pathways);

// Community tab
const clickedComm = await byName('Community');
console.log('Clicked Community:', clickedComm);
await page.waitForTimeout(1000);
const communityH1 = await page.$eval('h1', el => el.textContent);
console.log('Community H1:', communityH1);

// Trails tab
const clickedTrails = await byName('Trails');
console.log('Clicked Trails:', clickedTrails);
await page.waitForTimeout(1000);
const trailsH1 = await page.$eval('h1', el => el.textContent);
console.log('Trails H1:', trailsH1);

// Explore tab (back)
const clickedExplore = await byName('Explore');
await page.waitForTimeout(1000);
const exploreH1 = await page.$eval('h1', el => el.textContent);
console.log('Explore H1:', exploreH1);

await browser.close();