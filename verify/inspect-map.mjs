import { chromium } from '@playwright/test';
import path from 'path';

const LOCAL = process.env.LOCALAPPDATA;
const EXE = path.join(LOCAL, 'ms-playwright', 'chromium_headless_shell-1234', 'chrome-headless-shell-win64', 'chrome-headless-shell.exe');

const browser = await chromium.launch({ executablePath: EXE });
const page = await browser.newPage({ viewport: { width: 1600, height: 1000 } });

await page.goto('http://127.0.0.1:3000/', { waitUntil: 'networkidle', timeout: 45000 });
await page.waitForTimeout(2000);

// Switch to Map view
await page.click('.segmented button', { timeout: 5000 }).catch(() => {});
const mapBtn = await page.locator('.segmented button').filter({ hasText: /^Map$/ });
await mapBtn.click({ timeout: 5000 });
await page.waitForTimeout(3000);

// Count icons on map view
const mapIcons = await page.$$eval('.africa-map use[href*="li-"]', els => els.length);
const mapUnique = await page.$$eval('.africa-map use[href*="li-"]', els => [...new Set(els.map(e => e.getAttribute('href')))]);
console.log('Map view icons:', mapIcons, '| unique:', mapUnique);

// Check for duplicate layers panels
const allLayerTexts = await page.$$eval('*', els => {
  const results = [];
  for (const el of els) {
    const t = el.textContent;
    if (t && t.trim().toLowerCase().includes('layers') && el.children.length > 3) {
      results.push({ tag: el.tagName, class: el.className, text: t.slice(0, 60) });
    }
  }
  return results;
});
console.log('Layer panels found:', JSON.stringify(allLayerTexts, null, 2));

// Check for the inner map-canvas layer tab (popup)
const popups = await page.$$eval('.popup, .layers-popup, .map-panel', els => els.length);
const mapTools = await page.$$eval('.map-tools button', els => els.map(e => e.getAttribute('aria-label')));
console.log('Map tools buttons:', mapTools);

await page.screenshot({ path: path.join(LOCAL, 'Temp', 'trail-map-view.png') });
console.log('screenshot: ' + path.join(LOCAL, 'Temp', 'trail-map-view.png'));
await browser.close();