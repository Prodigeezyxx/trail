import { chromium } from '@playwright/test';
import path from 'path';
import fs from 'fs';

(async () => {
  const browser = await chromium.launch({ headless: true, chromiumSandbox: false });
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  const filePath = 'file:///' + path.resolve('docs/pitch-deck.html').replace(/\\/g, '/');
  await page.goto(filePath, { waitUntil: 'networkidle' });
  await page.waitForTimeout(500);

  // Count slides
  const slideCount = await page.evaluate(() => document.querySelectorAll('.slide').length);
  console.log('Slides in HTML: ' + slideCount);

  const out = path.resolve('docs/pitch-deck.pdf');
  // 16:9 pages match the fixed slide geometry in pitch-deck.html exactly,
  // so every slide fills precisely one page with no breaks or bands.
  await page.pdf({
    path: out,
    width: '13.33in',
    height: '7.5in',
    printBackground: true,
    margin: { top: '0', right: '0', bottom: '0', left: '0' },
    preferCSSPageSize: true
  });

  const stats = fs.statSync(out);
  console.log('PDF saved: ' + (stats.size / 1024).toFixed(0) + 'KB to ' + out);
  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
