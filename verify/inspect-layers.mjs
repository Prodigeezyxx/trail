import { chromium } from '@playwright/test';
const EXE = process.env.LOCALAPPDATA + '\\ms-playwright\\chromium_headless_shell-1234\\chrome-headless-shell-win64\\chrome-headless-shell.exe';
const OUT = process.env.LOCALAPPDATA + '\\Temp\\';
const browser = await chromium.launch({ executablePath: EXE });
const page = await browser.newPage({ viewport: { width: 1600, height: 1000 } });
await page.goto('http://127.0.0.1:3000/', { waitUntil: 'networkidle', timeout: 45000 });
await page.waitForTimeout(3500);

const R = await page.evaluate(() => {
  const result = {};
  // find all elements with "layer" related class or role
  const layerPanels = [...document.querySelectorAll('.layers-panel, .side-layers, [class*="layer"]')];
  result.layerElements = layerPanels.map(el => ({
    className: el.className,
    tagName: el.tagName,
    innerText: el.innerText.slice(0, 80),
    parentClass: el.parentElement?.className?.slice(0, 30) || 'none',
  }));
  // specifically look for the word "LAYERS" anywhere
  const allText = document.body.innerText;
  const layerTexts = allText.split('\n').map(l => l.trim()).filter(l => l.toLowerCase().includes('layer'));
  result.layerTexts = layerTexts.slice(0, 10);
  return result;
});
console.log(JSON.stringify(R, null, 2));
await page.screenshot({ path: OUT + 'trail-inspect-layers.png' });
await browser.close();