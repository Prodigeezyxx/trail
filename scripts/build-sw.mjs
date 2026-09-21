import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
const assets = readdirSync("dist/assets").map((file) => "/assets/" + file);
const version = createHash("sha256")
  .update(readFileSync("dist/index.html"))
  .digest("hex")
  .slice(0, 12);
const files = ["/", "/index.html", "/africa.json", "/favicon.svg", ...assets];
writeFileSync(
  "dist/sw.js",
  `
const CACHE = 'trail-${version}';
const FILES = ${JSON.stringify(files)};
const ENTRY = '/index.html';

// Precache by URL, stripping Vary. The origin sends 'Vary: Origin' and the
// emitted assets carry the crossorigin attribute, so the browser adds an
// Origin header to those requests. A response stored with Vary: Origin and no
// Origin on the stored request can never be matched by the real request — the
// cache silently misses and the asset falls through to a dead network.
// Removing Vary at store time makes the entry matchable by URL alone.
async function precache() {
  const cache = await caches.open(CACHE);
  await Promise.all(FILES.map(async (path) => {
    try {
      const res = await fetch(path, { cache: 'reload' });
      if (!res.ok) return;
      const headers = new Headers(res.headers);
      headers.delete('Vary');
      const body = await res.blob();
      await cache.put(new Request(path), new Response(body, { status: res.status, statusText: res.statusText, headers }));
    } catch {
      // A single unreachable file must not fail the whole install.
    }
  }));
}

self.addEventListener('install', event => {
  event.waitUntil(precache().then(() => self.skipWaiting()));
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k.startsWith('trail-') && k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Match by URL string, never by the live Request: the synthesised request has
// no Origin header, so Vary-style mismatch cannot occur.
function fromCache(path) {
  return caches.open(CACHE).then(cache => cache.match(path));
}

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === 'navigate') {
    // Network first so a fresh deploy wins; cache second so offline still works.
    event.respondWith(
      fetch(request)
        .then(res => {
          const copy = res.clone();
          caches.open(CACHE).then(cache => cache.put(new Request(url.pathname), copy)).catch(() => {});
          return res;
        })
        .catch(() => fromCache(url.pathname).then(hit => hit || fromCache(ENTRY)))
    );
    return;
  }

  if (FILES.includes(url.pathname)) {
    event.respondWith(
      fromCache(url.pathname).then(hit => hit || fetch(request))
    );
  }
});
`,
);
console.log(`Offline cache: ${files.length} local files, version ${version}`);
