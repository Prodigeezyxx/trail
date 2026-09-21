# Trail Africa — Pitch Deck

> **A fact should lead somewhere.**

## 1. The problem (one line)

Access to rights, services and opportunity depends on finding information you
understand and trust. Across African communities that information is
fragmented, out of date, hard to verify, and locked behind systems that are
hard to navigate. The last mile is missing: **information rarely turns into a
next step.**

## 2. The product

Trail Africa is a **civic-information workspace**, not a news feed. A person:

1. **Finds** a fact about a public service (14 seeded records, 13 countries).
2. **Checks** exactly where it comes from, when it was checked, and what it
   does *not* tell them.
3. **Connects** it to the office that holds the next step — a named holder, a
   witness, a response date.
4. **Leaves with a packet** they can send, print, broadcast or carry on a USB
   stick: full brief, WhatsApp, one-line SMS, or radio/meeting script.

Two directions of travel:

| Direction | How it works |
|---|---|
| **Top-down — trails** | Seeded records with source, check date, cadence, limitations, separate confidence/importance scores, holder, witness, exact question to ask. |
| **Bottom-up — issues** | Residents raise what is not working. Neighbours back it. 3 votes → community-verified. 5 votes → promotable into an official trail. |

## 3. Why now / why this team

- Built for the **OSF × Andela hackathon (Sep 2026)** against the three
  challenge tracks: **Transparency & Accountability**, **Stability & Social
  Cohesion**, **Safety, Reporting & Protection**.
- Every record belongs to a track, so a trail is always pointed at a real
  accountability route (budget desk, mediation committee, oversight body,
  legal aid, survivor support).
- A **fetch-verified source registry** (~100 public sources, HTTP status
  recorded Sep 2026) sits behind every layer — including stores of what could
  *not* be verified and why (squatted domains, login walls, bot challenges).

## 4. What makes it different

1. **Provenance is enforced in code, not promised in copy.** Unchecked sources
   read as unchecked. Stale ≠ unchecked. Limitations are a required field.
   Confidence and importance are never collapsed into one score. Gaps never
   become claims.
2. **Runs with no internet, from a USB stick.** A ~0.65 MB single file
   double-clicks on a decade-old laptop with no admin rights; a servable
   folder adds facility layers + offline app cache. No server, no account, no
   tracking — data lives in the browser's local storage.
3. **Safety is honest, not theatrical.** The report screen states the app
   cannot send, hide, or protect anything — and routes the user to real
   oversight bodies, legal aid, and digital-security helplines instead.
4. **Scoped footprint, honestly drawn.** 13 countries derived from the data so
   coverage can never drift; the rest of the continent is quiet context so the
   map reads as focused, not broken.

## 5. Traction / proof (this build)

- 14 records · 4 community seeds · 12 trail templates · 7 report categories ·
  ~14k bundled facility/market/power points across 4 layers.
- Offline verified: single-file boots over `file://` with one network request;
  service worker precaches the shell and lazily caches layer chunks.
- Fresh production audit (Sep 2026): fixed silent data-loss on reload, wrong
  trail targets, broken language menu, phantom layer files, and 5 MB of dead
  bundle weight.

## 6. Who it serves / channels

- **Residents & community groups** — the packet (WhatsApp/SMS/radio/print/USB).
- **Radio stations & meetings** — read-out scripts with do-no-harm warnings.
- **Paralegals, clinics, ward offices** — the named-holder workflow.
- **Funders & governments** — the verified source registry as a public good.

## 7. Business / sustainability

- Grant-funded public-interest core (offline-first, open licences respected:
  ODbL, CC BY 4.0, CC0 where stated).
- Paid deployments: country data refreshes, verified referral directories,
  relay/sync for community votes, training for newsroom & NGO partners.
- What we will **not** sell: user data (there is none — no server, no
  analytics), placement in trails, or unverified safety claims.

## 8. Roadmap

1. **Relay (opt-in):** sync votes/issues between devices without breaking the
   offline-first promise.
2. **Verified referral database:** country-specific, phone-number-verified
   support routes (only 2 numbers met the bar in this build).
3. **Live-data adapters** per declared cadence, keeping the freshness engine.
4. **Full i18n:** records/packets beyond English with translator review — never
   machine-translated safety text.

## 9. The ask

Seed support to ship the relay + one verified country deployment (Kenya:
county water + cohesion reporting routes already mapped), and to run the next
source-verification pass across all 13 countries.

**Trail Africa — leave with a packet, come back on the date you set. Silence
is not an answer.**
