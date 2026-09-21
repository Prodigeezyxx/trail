import { chromium } from '@playwright/test';
import path from 'path';

const LOCAL = process.env.LOCALAPPDATA;
const EXE = path.join(LOCAL, 'ms-playwright', 'chromium_headless_shell-1234', 'chrome-headless-shell-win64', 'chrome-headless-shell.exe');

const browser = await chromium.launch({ executablePath: EXE });
const page = await browser.newPage({ viewport: { width: 1600, height: 1000 } });

await page.goto('http://127.0.0.1:3000/', { waitUntil: 'networkidle', timeout: 45000 });
await page.waitForTimeout(5000);

const header = await page.$eval('.workspace-tag', el => el.textContent);
const counts = await page.$$eval('.record-count b', els => els.map(e => e.textContent));
const useCount = await page.$$eval('use[href*="li-"]', els => els.length);
const uniqueIcons = await page.$$eval('use[href*="li-"]', els => [...new Set(els.map(e => e.getAttribute('href')))]);

console.log('workspace-tag:', header);
console.log('record counts:', counts);
console.log('use icons count:', useCount);
console.log('unique icons:', uniqueIcons.length, uniqueIcons);

await page.screenshot({ path: path.join(LOCAL, 'Temp', 'trail-fresh.png') });
console.log('screenshot: ' + path.join(LOCAL, 'Temp', 'trail-fresh.png'));
await browser.close();