import { chromium } from '@playwright/test';
import path from 'path';
const LOCAL = process.env.LOCALAPPDATA;
const EXE = path.join(LOCAL, 'ms-playwright', 'chromium_headless_shell-1234', 'chrome-headless-shell-win64', 'chrome-headless-shell.exe');

const browser = await chromium.launch({ executablePath: EXE });
const page = await browser.newPage({ viewport: { width: 1600, height: 1000 } });
await page.goto('http://127.0.0.1:3000/', { waitUntil: 'networkidle', timeout: 45000 });
await page.waitForTimeout(3500);

// Go to Trails tab
await page.click('button:has-text("Trails")');
await page.waitForTimeout(2000);

// Get full HTML of the Trails tab section
const trailsHTML = await page.$eval('[aria-label="YOUR TRAILS"]', el => el ? el.outerHTML.slice(0, 3000) : 'selector no match').catch(() => 'no match');
// Try broader selector
const trailsHTML2 = await page.$eval('main div', el => el.outerHTML.slice(0, 3000)).catch(() => 'no match');
// Look for any list/table/rows
const rows = await page.$$eval('main .record-row, main .record, main li, main .file, main .trail', els => els.map(e => ({ tag: e.tagName, cls: e.className, text: e.textContent.slice(0, 80) }))).catch(() => []);

console.log('Trails tab DOM snapshot:');
console.log('aria-label match:', trailsHTML ? trailsHTML.slice(0, 500) : 'none');
console.log('rows found:', rows);
console.log('total .record-row in whole page:', await page.$$eval('.record-row', els => els.length).catch(() => 0));

// Check the main section content
const mainHTML = await page.$eval('main', el => el.textContent.slice(0, 2000)).catch(() => 'no match');
console.log('main text:', mainHTML);

await browser.close();