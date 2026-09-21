import { chromium } from '@playwright/test';
const EXE = process.env.LOCALAPPDATA + '\\ms-playwright\\chromium_headless_shell-1234\\chrome-headless-shell-win64\\chrome-headless-shell.exe';
const browser = await chromium.launch({ executablePath: EXE });
const page = await browser.newPage({ viewport: { width: 1600, height: 1000 } });
const errs = [];
page.on('pageerror', e => errs.push('PAGEERROR: ' + e.message.slice(0, 200)));
page.on('console', m => { if (m.type() === 'error') errs.push('console: ' + m.text().slice(0, 200)); });
const tab = (n) => page.locator('.sidebar nav button', { hasText: n }).first().click();

await page.goto('http://127.0.0.1:3000/', { waitUntil: 'networkidle', timeout: 45000 });
await page.waitForTimeout(2000);

// Sources tab: the verified dataset registry
await tab('Sources');
await page.waitForTimeout(900);
const sources = await page.evaluate(() => ({
  heading: [...document.querySelectorAll('.eyebrow')].map(e => e.textContent).find(t => /PUBLIC DATA SOURCES/.test(t)),
  groups: document.querySelectorAll('.dataset-group').length,
  rows: document.querySelectorAll('.dataset-row').length,
  unverifiedRows: document.querySelectorAll('.dataset-row.unverified').length,
  warnings: document.querySelectorAll('.datasets .notice.warn p').length,
  hasSquatWarning: document.body.innerText.includes('cohesion.or.ke'),
  hasPhoneCaveat: document.body.innerText.includes('0800 428 428'),
  records: document.querySelectorAll('.source-row').length,
}));

// Report tab: the pathway routing
await tab('Report');
await page.waitForTimeout(900);
const report = await page.evaluate(() => ({
  pathways: document.querySelectorAll('.pathway').length,
  unverifiedPathways: document.querySelectorAll('.pathway.unverified').length,
  hasAnonymityCaveat: document.body.innerText.includes('Anonymity is not guaranteed'),
  categories: [...document.querySelectorAll('select[name="category"] option')].map(o => o.value).length,
}));
await page.screenshot({ path: process.env.LOCALAPPDATA + '\\Temp\\trail-report-pathways.png', fullPage: false });

// switch category -> routes must change
await page.selectOption('select[name="category"]', 'Gender-based violence or abuse');
await page.waitForTimeout(700);
report.gbvPathways = await page.locator('.pathway').count();
report.gbvHasHelpline = (await page.locator('.pathways').innerText()).includes('Gender-Based Violence Command Centre');
report.gbvHasFida = (await page.locator('.pathways').innerText()).includes('FIDA Kenya');
report.gbvHasChildline = (await page.locator('.pathways').innerText()).includes('Childline Kenya');

// Sources tab screenshot
await tab('Sources');
await page.waitForTimeout(700);
await page.screenshot({ path: process.env.LOCALAPPDATA + '\\Temp\\trail-sources.png', fullPage: false });

console.log(JSON.stringify({ sources, report }, null, 2));
console.log('ERRORS:', errs.length ? errs : '(none)');
await browser.close();