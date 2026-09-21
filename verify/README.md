# Verification harness

These are the scripts used to check Trail while building it. They exist because
several claims in this project are easy to make and hard to prove — "it works
offline", "it runs from a flash drive", "the map renders" — and each of those
turned out to be false at least once before it was fixed.

Run them from the repository root against a dev server on port 3000:

```bash
npm run dev                 # in one terminal
node verify/verify-features.mjs
```

| Script | What it proves |
|---|---|
| `verify-render.mjs` | The app renders with no console errors; captures desktop, full-page and mobile screenshots. |
| `verify-views.mjs` | Globe, Map and List each render what they claim and toggle back without regression. |
| `verify-dashboard.mjs` | The dark dashboard: background colour, fonts actually loaded, layer and stat counts, marker click driving the detail panel. |
| `verify-features.mjs` | Tracks filter, community issues, voting flipping status at threshold, promotion creating a real trail, all four packet formats producing distinct text, the report issuing a reference and surviving a reload. |
| `verify-godseye.mjs` | The globe draws 50 countries on a sphere, markers land in the right places, and drag rotates it. |
| `verify-offline-cold.mjs` | **The important one.** Warms the cache, kills the server, confirms the connection is refused, then loads cold and asserts the app still renders with every asset served from cache. |
| `verify-offline-emulation.mjs` | Older offline check using Playwright's `setOffline`. Kept because it is a useful negative control: it reported a false failure, which is why the cold-load test exists. |
| `verify-offline-persistent.mjs` | Two-phase offline test against a persistent browser profile. |
| `verify-portable.mjs` | **The other important one.** Opens the single-file build over `file://` with no server and asserts it renders, that fonts are inlined, and that exactly one network request is made — the document itself. |
| `diag-runtime.mjs` | Dumps the root element, console log and page errors. Use this first when a page renders blank. |
| `diag-overflow.mjs` | Finds elements overflowing the viewport, and reports document scroll width. This is how the 491px-vs-390px mobile overflow was found. |
| `diag-cache.mjs` | Probes the service-worker cache entries and their `Vary` headers. This is how the `Vary: Origin` cache-miss was found. |

## A note on what these caught

Three claims that were false when first made, and the script that caught each:

1. **"Offline works."** It did not. The navigation shell came from cache while the
   JS and CSS missed and died with `ERR_FAILED`, so React never mounted. Cause:
   `Vary: Origin` on the origin's responses plus the `crossorigin` attribute on
   Vite's emitted assets. Found by `verify-offline-cold.mjs`.
2. **"It runs from a USB stick."** Opening the folder build over `file://` fails —
   browsers block module scripts and stylesheets when the page origin is `null`.
   Found by `verify-portable.mjs`, which is why the single-file build exists.
3. **"Mobile is fine."** A 390px viewport scrolled horizontally by 101px and the
   layers panel covered the entire globe. Found by `diag-overflow.mjs`.

`diag-cache.mjs` exists because a first attempt at the cache bug used a probe that
built its own `Request`, which carries no `Origin` header — so it matched the
cache and reported everything healthy while the real page was broken. The lesson
is in the file: probe with the real request, not a synthetic one.
