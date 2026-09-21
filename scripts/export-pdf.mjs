import { chromium } from '@playwright/test';
import path from 'path';

const LOCAL = process.env.LOCALAPPDATA;
const EXE = path.join(LOCAL, 'ms-playwright', 'chromium_headless_shell-1234', 'chrome-headless-shell.exe');

(async () => {
  const browser = await chromium.executablePath()
    ? await chromium.launch({ headless: true })
    : await chromium.launch({ channel: 'chrome', headless: true });
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  await page.goto('file:///' + path.resolve('docs/pitch-deck.html').replace(/\\/g, '/'), { waitUntil: 'networkidle' });
  await page.waitForTimeout(500);
  const out = path.resolve('docs/pitch-deck.pdf');
  await page.pdf({ path: out, format: 'A4', printBackground: true, displayMode: 'pages' });
  console.log('PDF saved to: ' + out);
  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
