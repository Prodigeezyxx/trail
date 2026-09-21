import { chromium } from '@playwright/test';

const out = process.env.LOCALAPPDATA + '\\Temp\\';
const browser = await chromium.launch({
  executablePath: process.env.LOCALAPPDATA + '\\ms-playwright\\chromium_headless_shell-1234\\chrome-headless-shell-win64\\chrome-headless-shell.exe',
});
const errors = [];
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
page.on('console', m => { if (m.type() === 'error') errors.push('console: ' + m.text()); });
page.on('pageerror', e => errors.push('pageerror: ' + e.message));
page.on('requestfailed', r => errors.push('requestfailed: ' + r.url() + ' :: ' + (r.failure()?.errorText || '')));

await page.goto('http://127.0.0.1:3000/', { waitUntil: 'networkidle', timeout: 45000 });
await page.waitForTimeout(1500);

const title = await page.title();
const bodyText = (await page.locator('body').innerText()).replace(/\s+/g, ' ').trim();
const svgCount = await page.locator('svg').count();
const canvasCount = await page.locator('canvas').count();
const pathCount = await page.locator('path').count();
const btnCount = await page.locator('button').count();
const bg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
const rootChildren = await page.evaluate(() => document.getElementById('root')?.children.length ?? -1);

await page.screenshot({ path: out + 'trail-desktop.png', fullPage: false });
await page.screenshot({ path: out + 'trail-full.png', fullPage: true });

const mobile = await browser.newPage({ viewport: { width: 390, height: 844 } });
await mobile.goto('http://127.0.0.1:3000/', { waitUntil: 'networkidle', timeout: 45000 });
await mobile.waitForTimeout(1200);
await mobile.screenshot({ path: out + 'trail-mobile.png', fullPage: false });
const mobileText = (await mobile.locator('body').innerText()).replace(/\s+/g, ' ').trim();

console.log(JSON.stringify({
  title,
  rootChildren,
  svgCount, canvasCount, pathCount, btnCount,
  bodyBackground: bg,
  bodyTextLength: bodyText.length,
  bodyText: bodyText.slice(0, 1200),
  mobileTextLength: mobileText.length,
  mobileText: mobileText.slice(0, 400),
  errors: errors.slice(0, 15),
  screenshots: ['trail-desktop.png', 'trail-full.png', 'trail-mobile.png'],
}, null, 2));

await browser.close();
