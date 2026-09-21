import { chromium } from '@playwright/test';
const EXE = process.env.LOCALAPPDATA + '\\ms-playwright\\chromium_headless_shell-1234\\chrome-headless-shell-win64\\chrome-headless-shell.exe';
const browser = await chromium.launch({ executablePath: EXE });
const page = await browser.newPage({ viewport: { width: 1500, height: 950 } });
const log = [];
page.on('pageerror', e => log.push('PAGEERROR: ' + e.message));
page.on('console', m => log.push('[' + m.type() + '] ' + m.text().slice(0, 400)));
page.on('requestfailed', r => log.push('FAILED ' + r.url() + ' :: ' + (r.failure()?.errorText || '')));
await page.goto('http://127.0.0.1:3000/', { waitUntil: 'networkidle', timeout: 40000 });
await page.waitForTimeout(2500);
const info = await page.evaluate(() => ({
  rootHTML: document.getElementById('root')?.innerHTML?.slice(0, 600),
  rootChildren: document.getElementById('root')?.children.length,
  bodyText: document.body.innerText.replace(/\s+/g, ' ').trim().slice(0, 400),
  h1s: [...document.querySelectorAll('h1')].map(h => h.textContent),
  hasSidebar: !!document.querySelector('.sidebar'),
  hasApp: !!document.querySelector('.app'),
}));
console.log(JSON.stringify({ info, log }, null, 2));
await browser.close();