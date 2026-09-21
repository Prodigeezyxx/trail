# Trail Africa

**A fact should lead somewhere.**

Trail Africa is a civic-information workspace for African communities. It does not try to
be a news feed. A person finds a fact about a public service, sees exactly where
that fact comes from and what it does *not* tell them, connects it to the office
that holds the next step — and leaves with a packet they can send, print, broadcast
or carry on a USB stick.

Built for the **OSF × Andela hackathon**, September 2026.

## Scope

The build covers a defined footprint rather than the whole continent: **13
countries**, derived in code from the records and community issues so the
footprint can never drift from the data.

| | |
|---|---|
| In scope | Cameroon, DR Congo, Ethiopia, Ghana, Kenya, Mozambique, Nigeria, Rwanda, Senegal, South Africa, Tanzania, Uganda, Zambia |
| Out of scope | everything else |

Other African countries are still drawn on the map, deliberately, as quiet
context — a map showing thirteen disconnected outlines reads as broken rather
than as focused. Covered countries carry the visual weight and the labels; the
rest are dimmed. All data, sources and layer work is scoped to the thirteen.


---

## The problem in one line

Access to rights, services and opportunity depends on being able to find
information you understand and trust. In many communities that information is
fragmented, out of date, hard to verify, and locked behind systems that are hard
to navigate. Trail closes the last part: it turns information into a next step.

## Tracks

The workspace is organised around the three challenge areas, and every record
belongs to one:

| Track | What it does here |
|---|---|
| **Transparency & Accountability** | Turn a published budget, tender, audit finding or service standard into a written question with a named recipient and a response date. |
| **Stability & Social Cohesion** | Route everyday friction — a broken water point, a land question, a shared-resource dispute — to the body that can actually resolve it, before it escalates. |
| **Safety, Reporting & Protection** | Write a report that carries no identifiers, get a reference for it, and reach a real pathway: oversight body, legal aid, or survivor support. |

Cross-track use is expected: a water dispute is a stability problem *and* an
accountability one.

## Two directions of travel

**Top-down — trails.** 14 seeded records across 13 countries. Each carries a
source, a last-checked date, a declared update cadence, an explicit list of
limitations, separate **confidence** and **importance** scores, a named holder, a
witness, and the exact question to ask.

**Bottom-up — community issues.** Residents raise what is not working. Neighbours
back it. At 3 votes an issue is community-verified; at 5 it can be promoted into
an official trail with a holder, a witness and a date. Supported issues graduate
into the same structure as seeded ones.

**Data foundations.** 5 ingested geospatial layers — health facilities, schools,
water points, power plants, markets — across the 13 countries. Each renders as a
distinct SVG icon on the globe and flat map. Every data-layer point is listed in
the Trails tab and can be tracked as a trail, just like seeded records.

## The packet is the product

Everything else is scaffolding for the thing the user leaves with. Four formats,
each for a real channel:

- **Packet** — the full brief with a next-step sequence and acknowledgement lines
- **WhatsApp** — short, forwardable, keeps the source and the check date
- **SMS** — one line for a basic phone
- **Radio / meeting** — a script to read out, with a warning not to name individuals

Every format can be downloaded as TXT, copied, or handed to WhatsApp or Telegram — and the full brief exports as a formatted **PDF** (via the browser's print-to-PDF, so it works offline from the USB file too), with holder/witness acknowledgement lines and a follow-up section.

## It runs with no internet, from a USB stick

Two builds, and they are genuinely different:

```bash
npm install
npm run build:portable
```

| Output | Use |
|---|---|
| `portable/trail-offline.html` | **~0.65 MB, one file.** Double-click it. No server, no install, no network. Carries the app, Africa geometry and fonts; official trails, issues, packets and reports all work. |
| `portable/trail-offline/` | A folder to *serve* — `python -m http.server`. Adds the facility layers (health, schools, power, markets) plus the offline app cache. |

The single file boots because nothing it needs is requested at runtime: the Africa
geometry is imported into the bundle rather than fetched, both fonts are inlined
as data URIs, and every asset path is relative. That claim is tested, not assumed
— the verification opens the file over `file://` and asserts a single network
request (the document itself). The facility point-layers are separate lazy
chunks (up to ~8 MB) that browsers cannot load from `file://`, so they are a
folder-build feature; the single file honestly omits the pins rather than
pretending to include them. The service worker precaches the app shell and
caches layer chunks on first use, so install stays fast on old hardware.

The folder build **does not** work by double-clicking: browsers block module
scripts and stylesheets loaded from `file://` because the page origin is `null`.
The README shipped with the build says so rather than letting someone discover it
on the day.

## Provenance rules the code enforces

1. **A source is never shown as verified unless it is.** Every record carries an
   explicit `verified` flag. In this bundle 0 of 14 are marked independently
   checked; that is stated in the UI and in the Sources tab.
2. **"Unchecked" is a distinct state from "stale".** Freshness is computed
   against each source's own declared cadence — an annual report is not stale at
   40 days, and a source never checked reads as *unknown*, not as healthy.
3. **Limitations are a required field.** Every record states what it does not
   tell you, and the detail panel shows that before the next step.
4. **Confidence and importance are separate numbers.** How much a thing matters
   and how much it can be trusted are different questions and are never collapsed
   into one ranking.
5. **A gap never becomes a claim.** Where a value is unknown the UI says unknown.
   Where there is no URL it says "No URL" rather than showing a dead link.

## Privacy

No server, no account, no analytics, no tracking. Trails, issues, votes and
reports live in this browser's local storage on the user's own machine.
"Clear this device" in the Report tab erases them.

**Votes are local.** Without a relay, nobody else sees them, and every issue card
says so. A vote count that looks communal but is not would be worse than no vote
count at all.

**Report is not a promise of protection.** The report screen states plainly that
the app has no network, cannot send anything, cannot hide a record from someone
holding the device, and cannot keep the reporter safe — and points to trusted
organisations' secure channels for anything high-risk.

## Accessibility and language

The interface is available in English, French, Portuguese and Arabic, with RTL
handling for Arabic. Sample records and packets remain in English in this build
and the UI says so when a user switches — a half-translated packet would be worse
than an honest one. The single-file build has no external dependencies, so it
works on a decade-old laptop with no admin rights.

## Data layers ingested

5 geospatial layers across the 13 countries, all from verified public sources:

| Layer | Source | Records | Capped at render |
|---|---|---|---|
| Health facilities | HOT OSM (Humanitarian OpenStreetMap) via HDX | 42,999 | All rendered |
| Education facilities | HOT OSM via HDX | 209,267 | 4,000 per browser (would freeze low-end devices) |
| Water points | HOT OSM via HDX | 8,741 | All rendered |
| Power plants | Global Power Plant Platform (GPPP) | 228 | All rendered |
| Markets | Ethiopia market centers (Shapefile) | 2,060 | All rendered |
| Grid lines | Africa Infracstructures Grid (failed — corrupted download) | 0 | Layer named honestly, renders nothing |

Provenance: every data-layer point carries its source name, URL, last-checked date,
and the layer metadata (licence, cadence, evidence claim) is shown in the detail
panel. A gap (like the failed grid download) is named honestly rather than faked.

## What is NOT built

Stated so nobody has to discover it:

- **No server or relay.** Votes and issues cannot sync between devices.
- **No live data.** The bundle is a snapshot dated 21 Sep 2026. Nothing polls.
- **No verified source URLs for every record.** Several are recorded with a URL
  that has not been independently checked; one has none at all.
- **The three share buttons need a connection** (they hand text to an app).
- **No encryption at rest.** Local storage is readable by anyone with access to
  the device.
- **No real referral database.** The report screen routes by category, not to a
  verified, country-specific organisation list.

## Running it

```bash
npm install
npm run dev            # http://localhost:3000
npm run build          # dist/ with the offline service worker
npm run build:portable # the two portable builds above
```

## Project layout

```
src/App.jsx                  the workspace: tracks, views, issues, packet, report
src/data.js                  the data model, tracks, layers, provenance rules
src/data/africa.json         Africa-only Natural Earth extract, bundled not fetched
src/data/layers/             6 render-ready layer files (manifest + 5 layers)
src/data/layers-simplified/  simplified GeoJSON for lighter rendering
src/Icons.jsx                SVG icon symbols (heart, graduation-cap, zap, cart)
src/layers.js                layer manifest loader + record conversion
src/sources.js               98 fetch-verified public sources + pathways
src/styles.css               dark theme, layer hues driven by data
scripts/build-sw.mjs         generates the offline service worker
scripts/build-portable.mjs   single-file + servable builds, with portability checks
scripts/ingest-layers.py     ingests 5 geospatial layers for 13 countries
scripts/geo-simplify.py     normalises GeoJSON to render-ready precision
scripts/repair-grid.py       repairs corrupted africagrid.geojson
verify/                      30+ Playwright-based verification harnesses
```

## Compliance

Architecture is our own. Geometry is Natural Earth (public domain). Fonts are
DM Sans and Manrope via Fontsource (SIL Open Font License). All code in this
repository was written for this project.
