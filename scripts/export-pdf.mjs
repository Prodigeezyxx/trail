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
  await page.pdf({
    path: out,
    format: 'A4',
    landscape: false,
    printBackground: true,
    margin: { top: '0.3in', right: '0.3in', bottom: '0.3in', left: '0.3in' }
  });

  const stats = fs.statSync(out);
  console.log('PDF saved: ' + (stats.size / 1024).toFixed(0) + 'KB to ' + out);
  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
