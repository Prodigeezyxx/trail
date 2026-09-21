# Trail Africa — Decision Log

Every published decision carries the rule or reason that decided it, written
down at the time it was made so it survives the people who made it.

---

## Name and scope

**Decision:** Name is **Trail Africa**. Scope is 13 countries, not all 54.
**Reason:** The brief was "scope to what you have". The footprint is derived
from the data in `src/data.js` (`COUNTRIES`) and cannot drift from it — the
array is the single source of truth for filtering, for the globe crop, and for
the data layers. Nothing references a country name without going through this
list.

**Decision:** No mention of "world monitor".
**Reason:** The project was renamed before launch; the old name does not appear
in the code, the README, the UI, or the data.

---

## Architecture

**Decision:** Single React component (`src/App.jsx`) for all UI.
**Reason:** The app is a workspace, not a routed product. All state lives at
the top so a trail file can reference any record without prop drilling across
a router. Refactoring into pages can wait until the workspace logic is proven.

**Decision:** All markers rendered as SVG, not canvas.
**Reason:** SVG gives us `pointer-events`, `<use>` for icon symbols, and
selection state through CSS classes (`selected`, `tracked`). Canvas would have
required a full event-math layer. The 1500+ markers render fine as SVG at this
scale — if the dataset grows 10x we can re-evaluate with the `PointLayer.jsx`
sitting in `src/` as a reference implementation.

**Decision:** Globe is orthographic, not Mercator.
**Reason:** The brief was to turn a globe, not to show a flat map. The flat map
(Mercator) is the secondary view for detail work. The orthographic view is the
front door.

**Decision:** Globe does not auto-spin.
**Reason:** A spinning globe looks like a loading animation. It was removed so
the map reads as a finished workspace, not a placeholder.

**Decision:** Data-layer points render as meaningful icons, not colored dots.
**Reason:** Color is already the encoding for the layer (track color). Adding
icon shape as a second encoding lets a user distinguish health (heart-pulse)
from education (graduation-cap) from power (zap) without reading the label.

---

## Data ingestion

**Decision:** Five layers ingested (health, education, water, power, markets),
grid-lines excluded.
**Reason:** The grid download was corrupted — a .NET exception was appended to
the GeoJSON. Repair extracted 61,520 features but they were non-African (Yemen,
etc.), so the layer is empty rather than faked. The grid layer is named in the
manifest but toggles off (zero features) — a gap is named honestly rather than
silently dropped.

**Decision:** ADM2 layer (22 MB, 229,000+ features) dropped; ADM1 (5.6 MB)
kept.
**Reason:** 22 MB of GeoJSON parses for 5+ seconds on low-end devices and freezes
the renderer. ADM1 (regions/provinces) gives the same geographic legibility
without the performance cost.

**Education capped at 4,000 features per browser.**
**Reason:** 209,027 school points on a Mercator projection at 1060×675 renders
as an unreadable green blob. 4,000 is the threshold where individual markers stay
distinguishable in dense cities. The full file is still in the repo; the cap
is applied at render time only.

**Country names normalised via `geoNameOf` map.**
**Reason:** "DR Congo" (in our data) vs "Dem. Rep. Congo" (in Natural Earth) vs
"Congo (Kinshasa)" (in HOT OSM) needed a single mapping to the 13-country
footprint. Without it, records would be filtered out silently.

---

## Provenance and honesty

**Decision:** "Unverified" is a distinct state from "stale".
**Reason:** Freshness is computed against each source's own declared cadence.
An annual report is not stale at 40 days; a source never checked reads as
*unknown*, not as healthy.

**Decision:** Limitations are a required field.
**Reason:** Every record states what it does not tell you, and the detail panel
shows that before the next step. A user should never leave thinking they have
the full picture when they don't.

**Decision:** Report anonymity is not implied.
**Reason:** No state-run complaint mechanism could be confirmed to accept a
genuinely anonymous submission across the countries researched. The report
screen states this plainly rather than implying a protection that doesn't exist.

---

## Privacy and offline

**Decision:** No server, no account, no analytics, no tracking.
**Reason:** The brief explicitly asked for flash-drive deployment. A server
contradicts that. Trails, issues, votes and reports live in this browser's
local storage on the user's own machine.

**Decision:** Votes are local-only, and every issue card says so.
**Reason:** A vote count that looks communal but is not would be worse than no
vote count at all.

**Decision:** Two portable builds (single-file for `file://`, folder for serving).
**Reason:** Single-file boots by double-click because nothing is requested at
runtime — geometry imported not fetched, fonts inlined as data URIs, all paths
relative. The folder build works served only (browsers block module scripts
from `file://`). Both are tested, not assumed — see `verify/verify-offline-*.mjs`.

---

## The packet

**Decision:** The packet is the product; everything else is scaffolding.
**Reason:** The brief was "information to action". The packet is the thing that
leaves the app — send, print, broadcast, or carry. If the packet is right,
everything else has earned its place.

**Decision:** Four formats (Packet, WhatsApp, SMS, Radio/Meeting).
**Reason:** Each is for a real channel. WhatsApp format is short and forwardable.
SMS fits on a basic phone. Radio format is a script to read out. The packet is
the full brief. None of them are decorations.

---

## What was deliberately not built

- **No server or relay.** Votes and issues cannot sync between devices.
- **No live data.** The bundle is a snapshot dated 21 Sep 2026. Nothing polls.
- **No encryption at rest.** Local storage is readable by anyone with access to
  the device.
- **No real referral database.** The report screen routes by category, not to a
  verified, country-specific organisation list.

Stated so nobody has to discover it.
