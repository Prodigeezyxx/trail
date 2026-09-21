import { chromium } from '@playwright/test';
import path from 'path';

(async () => {
  const browser = await chromium.launch({ headless: true, chromiumSandbox: false });
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  const filePath = 'file:///' + path.resolve('docs/pitch-deck.html').replace(/\\/g, '/');
  await page.goto(filePath, { waitUntil: 'networkidle' });
  await page.waitForTimeout(500);

  // Take screenshot of each slide to verify content
  const slides = await page.$$('.slide');
  console.log('Total slides: ' + slides.length);

  // For each slide, check the eyebrow text
  for (let i = 0; i < slides.length; i++) {
    const content = await slides[i].textContent();
    const firstLine = content.trim().split('\n').slice(0, 2).join(' ').substring(0, 80);
    console.log('Slide ' + (i+1) + ': ' + firstLine);
  }

  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
