import { chromium } from '@playwright/test';
import path from 'path';
const LOCAL = process.env.LOCALAPPDATA;
const EXE = path.join(LOCAL, 'ms-playwright', 'chromium_headless_shell-1234', 'chrome-headless-shell-win64', 'chrome-headless-shell.exe');

const browser = await chromium.launch({ executablePath: EXE });
const page = await browser.newPage({ viewport: { width: 1600, height: 1000 } });
await page.goto('http://127.0.0.1:3000/', { waitUntil: 'networkidle', timeout: 45000 });
await page.waitForTimeout(3500);

// Switch to List view to see all records
await page.click('button:has-text("List")');
await page.waitForTimeout(2000);

// Count all records in list view
const allRecords = await page.$$eval('.record-row', els => 
  els.map(e => ({ 
    title: e.querySelector('strong')?.textContent || 'no title',
    sub: e.querySelector('small')?.textContent || 'no sub',
    dot: e.querySelector('.record-dot')?.style.background || 'no color'
  }))
).catch(() => []);
console.log('Explore List records:', allRecords.length);
allRecords.forEach((r, i) => console.log(`  ${i+1}. ${r.title} | ${r.sub} | ${r.dot}`));

// Count trails in Trails tab
await page.click('button:has-text("Trails")');
await page.waitForTimeout(2000);
const trailFiles = await page.$$eval('.trail-row', els => 
  els.map(e => ({
    title: e.querySelector('strong')?.textContent || 'no title',
    sub: e.querySelector('small')?.textContent || 'no sub'
  }))
).catch(() => []);
console.log('Trails tab files:', trailFiles.length);
trailFiles.forEach((r, i) => console.log(`  ${i+1}. ${r.title} | ${r.sub}`));

console.log('\\n=== SUMMARY ===');
console.log('Map+Explore records:', allRecords.length);
console.log('Trails tab files:', trailFiles.length);
console.log('Match:', allRecords.length === trailFiles.length + (allRecords.length - trailFiles.length) >= 0 ? 'Trails tab shows YOUR files (subset)' : 'check');

await browser.close();