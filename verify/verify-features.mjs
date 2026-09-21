import { chromium } from '@playwright/test';
const EXE = process.env.LOCALAPPDATA + '\\ms-playwright\\chromium_headless_shell-1234\\chrome-headless-shell-win64\\chrome-headless-shell.exe';
const OUT = process.env.LOCALAPPDATA + '\\Temp\\';
const browser = await chromium.launch({ executablePath: EXE });
const ctx = await browser.newContext({ viewport: { width: 1600, height: 1000 } });
const page = await ctx.newPage();
const errs = [];
page.on('pageerror', e => errs.push('PAGEERROR: ' + e.message.slice(0, 200)));
page.on('console', m => { if (m.type() === 'error') errs.push('console: ' + m.text().slice(0, 200)); });

const R = {};
const tab = (name) => page.locator('.sidebar nav button', { hasText: name }).first().click();
const trackBtn = (name) => page.locator('.side-tracks button', { hasText: name }).first().click();
await page.goto('http://127.0.0.1:3000/', { waitUntil: 'networkidle', timeout: 45000 });
await page.waitForTimeout(2200);

// 1. globe must NOT self-rotate
const rot1 = await page.locator('.globe-readout').textContent();
await page.waitForTimeout(4000);
const rot2 = await page.locator('.globe-readout').textContent();
R.globeStillWhileIdle = { rot1: rot1.trim(), rot2: rot2.trim(), identical: rot1.trim() === rot2.trim() };

// globe cropped to Africa: sphere diameter vs panel
R.globeCrop = await page.evaluate(() => {
  const svg = document.querySelector('.globe-svg');
  const sphere = svg?.querySelector('.globe-sphere');
  const bbox = sphere?.getBBox?.();
  const panel = svg?.getBoundingClientRect();
  return { sphereW: Math.round(bbox?.width || 0), sphereH: Math.round(bbox?.height || 0), panelH: Math.round(panel?.height || 0), fillsPanel: (bbox?.height || 0) >= (panel ? panel.height * 0.98 : 1e9) };
});

// 2. layers count
R.layerCounts = await page.evaluate(() => ({
  sidebar: document.querySelectorAll('.side-layers > button').length,
  overlay: document.querySelectorAll('.layers-panel > button').length,
  tracks: document.querySelectorAll('.side-tracks > button').length,
}));

// 3. track filter actually filters
const countNow = async () => (await page.locator('.record-count b').first().textContent()).trim();
R.trackFilter = { all: await countNow() };
await trackBtn('Transparency');
await page.waitForTimeout(700);
R.trackFilter.transparency = await countNow();
await trackBtn('Safety');
await page.waitForTimeout(700);
R.trackFilter.safety = await countNow();
await trackBtn('All tracks');
await page.waitForTimeout(600);

// 4. freshness indicators present
R.freshness = await page.evaluate(() => ({
  inList: document.querySelectorAll('.fresh').length,
  unknownLabel: document.querySelector('.fresh.unknown')?.textContent?.trim() || null,
}));

// 5. community issues + vote + promote
await tab('Community');
await page.waitForTimeout(900);
R.issues = { cards: await page.locator('.issue-card').count() };
const before = await page.locator('.issue-card').nth(1).locator('.vote').textContent();
await page.locator('.issue-card').nth(1).locator('.vote').click();
await page.waitForTimeout(700);
const after = await page.locator('.issue-card').nth(1).locator('.vote').textContent();
R.issues.voteChange = { before: before.trim(), after: after.trim() };
R.issues.statusAfterVote = (await page.locator('.issue-card').nth(1).locator('.issue-status').textContent()).trim();
const promoteVisible = await page.locator('.issue-card').nth(1).getByRole('button', { name: /Promote/ }).count();
R.issues.promoteButtonShown = promoteVisible > 0;
if (promoteVisible > 0) {
  await page.locator('.issue-card').nth(1).getByRole('button', { name: /Promote/ }).click();
  await page.waitForTimeout(1200);
  R.issues.afterPromote = {
    tab: await page.locator('h1').first().textContent(),
    trailRows: await page.locator('.trail-row').count(),
    hasPromoted: (await page.locator('.trail-row').allTextContents()).some(t => /Borehole|Tender|Clinic|entrance|Kumasi/i.test(t)),
  };
}

// 6. packet formats + share actions
await tab('Explore');
await page.waitForTimeout(800);
await page.locator('.trail-card').first().click();
await page.waitForTimeout(900);
R.packet = { formats: await page.locator('.format-toggle button').count() };
const texts = {};
for (const f of ['packet', 'whatsapp', 'sms', 'radio']) {
  await page.locator('.format-toggle button', { hasText: f }).click();
  await page.waitForTimeout(350);
  texts[f] = (await page.locator('.packet-preview').textContent()).slice(0, 90).replace(/\s+/g, ' ');
}
R.packet.samples = texts;
R.packet.actions = await page.locator('.packet-actions button').allTextContents();
await page.screenshot({ path: OUT + 'trail-v2-packet.png' });
await page.locator('.modal-head button').click();
await page.waitForTimeout(400);

// 7. whistleblower report
await tab('Report');
await page.waitForTimeout(800);
R.report = { warningShown: await page.locator('.notice.warn').count() > 0 };
await page.locator('input[name="place"]').fill('Lira');
await page.locator('input[name="when"]').fill('last week');
await page.locator('textarea[name="detail"]').fill('Clinic has had no test kits for six days and sends patients to a private pharmacy.');
await page.locator('input[name="outcome"]').fill('an inspection');
await page.getByRole('button', { name: /Create the record/ }).click();
await page.waitForTimeout(900);
R.report.ref = (await page.locator('.report-ref b').textContent()).trim();
R.report.packetHead = (await page.locator('.packet-preview').textContent()).slice(0, 120).replace(/\s+/g, ' ');
R.report.savedRows = await page.locator('.report-row').count();
await page.screenshot({ path: OUT + 'trail-v2-report.png' });

// 8. persistence across reload (localStorage)
await page.reload({ waitUntil: 'networkidle' });
await page.waitForTimeout(1800);
await tab('Report');
await page.waitForTimeout(800);
R.report.survivesReload = await page.locator('.report-row').count();

// 9. mobile
const m = await ctx.newPage();
await m.setViewportSize({ width: 390, height: 844 });
await m.goto('http://127.0.0.1:3000/', { waitUntil: 'networkidle', timeout: 40000 });
await m.waitForTimeout(1800);
R.mobile = await m.evaluate(() => ({ scrollW: document.documentElement.scrollWidth, vw: window.innerWidth, globe: !!document.querySelector('.globe-svg') }));
await m.screenshot({ path: OUT + 'trail-v2-mobile.png' });

console.log(JSON.stringify(R, null, 2));
console.log('ERRORS:', errs.length ? errs : '(none)');
await browser.close();