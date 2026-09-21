import { chromium } from '@playwright/test';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';

const EXE = process.env.LOCALAPPDATA + '\\ms-playwright\\chromium_headless_shell-1234\\chrome-headless-shell-win64\\chrome-headless-shell.exe';
const file = resolve("portable/trail-offline.html");
const url = pathToFileURL(file).href;
console.log("opening:", url);

const browser = await chromium.launch({ executablePath: EXE });
const ctx = await browser.newContext({ viewport: { width: 1500, height: 960 } });
const page = await ctx.newPage();

const requests = [];
const errs = [];
page.on('request', r => requests.push(r.url()));
page.on('pageerror', e => errs.push('PAGEERROR: ' + e.message.slice(0, 200)));
page.on('console', m => { if (m.type() === 'error') errs.push('console: ' + m.text().slice(0, 200)); });

await page.goto(url, { waitUntil: 'load', timeout: 40000 });
await page.waitForTimeout(3000);

const probe = await page.evaluate(() => ({
  appRendered: !!document.querySelector('.app'),
  h1: document.querySelector('h1')?.textContent,
  globe: !!document.querySelector('.globe-svg'),
  globeCountries: document.querySelectorAll('.globe-svg path.country').length,
  markers: document.querySelectorAll('.marker').length,
  layers: document.querySelectorAll('.side-layers > button').length,
  tracks: document.querySelectorAll('.side-tracks > button').length,
  tabs: document.querySelectorAll('.sidebar nav button').length,
  bodyText: document.body.innerText.replace(/\s+/g, ' ').trim().slice(0, 200),
  fontsLoaded: [...document.fonts].filter(f => f.status === 'loaded').map(f => f.family).slice(0, 4),
  proto: location.protocol,
}));

console.log("PROBE:", JSON.stringify({ ...probe, requests: requests.slice(0, 12), errors: errs }, null, 2));

// interact: community tab + a vote, proving JS is fully alive offline
let cards = 0, voteAfter = "n/a", reportReady = 0;
try {
  await page.locator('.sidebar nav button', { hasText: 'Community' }).first().click({ timeout: 8000 });
  await page.waitForTimeout(800);
  cards = await page.locator('.issue-card').count();
  await page.locator('.issue-card').first().locator('.vote').click();
  await page.waitForTimeout(600);
  voteAfter = (await page.locator('.issue-card').first().locator('.vote').textContent()).trim();

  await page.locator('.sidebar nav button', { hasText: 'Report' }).first().click({ timeout: 8000 });
  await page.waitForTimeout(700);
  reportReady = await page.locator('textarea[name="detail"]').count();
} catch (e) {
  console.log("INTERACTION FAILED:", e.message.split("\n")[0]);
}

const external = requests.filter(u => !u.startsWith('file:') && !u.startsWith('data:') && !u.startsWith('blob:'));

await page.screenshot({ path: process.env.LOCALAPPDATA + '\\Temp\\trail-portable-file.png' });

console.log(JSON.stringify({
  protocol: probe.proto,
  rendered: probe.appRendered,
  h1: probe.h1,
  globeCountries: probe.globeCountries,
  markers: probe.markers,
  layers: probe.layers,
  tracks: probe.tracks,
  tabs: probe.tabs,
  fontsLoaded: probe.fontsLoaded,
  communityCards: cards,
  voteAfter,
  reportFormPresent: reportReady > 0,
  totalRequests: requests.length,
  externalRequests: external,
  errors: errs,
}, null, 2));

await browser.close();