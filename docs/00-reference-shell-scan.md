# Reference shell — deep scan findings

Scan date: 21 Sep 2026. Source: one public reference codebase, cloned shallow and
read in full at 7,231 files / 149 MB. Referred to below only as "the shell".
No name is recorded anywhere in this repo. The clone lives outside the repo, at
`$LOCALAPPDATA/Temp/shell-scan`.

Purpose: know exactly which primitives are worth carrying into Trail, what they
cost, and what must never be copied.

---

## 1. Scale and shape

| Metric | Value |
|---|---|
| Files (excl. `.git`) | 7,231 |
| Size on disk | 149 MB |
| TypeScript `.ts` | 1,970 |
| ESM `.mjs` | 1,798 |
| ESM typed `.mts` | 1,030 |
| Markdown / MDX | 492 / 276 |
| JSON | 397 |
| Protobuf | 316 |
| Test + spec files | 2,167 |
| CI workflows | 46 |
| `docs/` markdown | 616 |
| Panel classes | 109 (of 207 files under `src/components`) |
| Version / licence | 2.10.0, AGPL-3.0-only |

Largest single files: flat map renderer 8,360 lines · data loader 5,104 ·
panel layout 4,566 · app shell 4,260 · billing 4,304 · a country deep-dive panel
4,031 · a 3D globe renderer 4,099.

Top-level surface: `src` `api` `server` `shared` `proto` `convex` `scripts`
`workers` `tests` `e2e` `cli` `sdk/{go,python,ruby}` `public` `docs` `skills`
`blog-site` `pro-test` `src-tauri` `docker` `deploy` + 12 Dockerfiles.

Read that as: this is a company, not a project. Nothing about it is
7-day-shaped, which is precisely why the honest move is to take primitives and
write our own implementation.

---

## 2. Architecture — the eight parts that actually matter

### 2.1 Config-driven layer registry
`src/config/map-layer-definitions.ts` is the whole map inventory as data.

```
type RendererKind = 'svg' | 'deck' | 'globe'
interface LayerDefinition {
  key, icon, i18nSuffix, fallbackLabel,
  renderers: RendererKind[],      // every renderer with a real paint path
  premium?: 'locked' | 'enhanced'
}
```

The load-bearing idea: `renderers` is a **gate**, not a hint. A layer executes
under a renderer only if that renderer is listed. A cheap raster/SVG layer can
therefore ship on low-end devices and be absent from the heavier renderer,
declaratively, with no special-casing in the UI.

That single field is the low-bandwidth story, expressed as data.

### 2.2 Per-item provenance schema (the trust core)
```
interface LayerExplanation {
  key
  coverage: 'curated' | 'fallback'
  category, purpose
  source        // where it came from
  freshness     // how current
  confidence    // how much to trust
  limitations[] // what it does NOT tell you
  related[]
  evidence[]    // grounding links
}
```
Rendered by `src/utils/layer-explanation-card.ts` as a card with a coverage
chip ("Curated v1" / "Fallback"), a Source / Freshness / Confidence grid, a
Limitations list, and a "Grounded in" evidence strip.

Two details worth stealing outright:
- `coverage` admits that a fallback exists and says so in the UI.
- **`limitations[]` is a first-class field.** The schema forces every claim to
  state what it cannot tell you.

### 2.3 Fail-closed source registry
`shared/source-provenance.ts` — a hand-curated registry mapping every publisher
to a `SourceType` (`wire | gov | intel | mainstream | market | tech | other |
unknown`) plus a propaganda-risk state, in a module deliberately kept
runtime-neutral so browser and agent surfaces import the same copy.

The comment that defines the culture: *"'unknown' = not yet reviewed (default
for unlisted sources — never invent a type)."*

A consuming envelope carries a `registryReference` snapshot; validation **fails**
if the source is undeclared or the snapshot has drifted from the registry.
Unlisted is not a guess, it is an explicit `unknown`.

### 2.4 Tri-state claims contract
`shared/decision-signal-provenance*.ts` + `docs/decision-signal-provenance.mdx`.

Every normalized observation carries `contractVersion`, a stable `signalId`, a
`familyId`, and a full `claims` object. **Every claim is one of exactly three
states:**

| Status | Meaning |
|---|---|
| `known` | validated value |
| `unknown` | applies, but value unavailable — non-empty reason required |
| `not_applicable` | does not apply — non-empty reason required |

`unknown` and `not_applicable` **cannot carry a value**. Stated purpose: *"This
prevents an absent field from turning into a current, official, independent,
verified, normal, or zero-valued presentation claim."*

Families declare each dimension as `required` / `unknown_allowed` /
`not_applicable`; omitting a dimension is invalid under every policy. Dimensions
cover publisher identity, source URL, original evidence, language, translation,
**four distinct time roles**, revision and supersession, two independent
confidence claims, corroboration, transport freshness, content freshness,
derivation.

This is the single most valuable artifact in the scan. It is a written
specification for "never let a gap become a claim", and it is domain-agnostic.

### 2.5 Two numbers, never one
`docs/methodology/news-credibility.mdx`.

Importance and credibility are scored separately and both shown. Credibility is
built from exactly three ingredients:

| Ingredient | Weight |
|---|---:|
| Propaganda risk (does this publisher answer to a government or interested party?) | 0.50 |
| Source tier (track record) | 0.30 |
| Independent corroboration (is anyone unconnected reporting it?) | 0.20 |

Severity, recency and drama carry **zero** weight here — they belong to
importance. State-controlled outlets are **capped, not banned**: repetition
inside a controlled media environment is not corroboration, so they stay visible
and readable with an honest label. No human sits in the loop; third-party bias
rating tables are deliberately not applied.

The design principle: keep "how much does this matter" and "how much should I
trust this" as two numbers, because collapsing them forces a bad choice between
missing the story and trusting the source.

### 2.6 Freshness tracker that refuses false all-clears
`src/services/data-freshness.ts`. Opening comment: *"Tracks when each data source
was last updated to prevent showing misleading 'all clear' when we actually have
no data."*

```
type FreshnessStatus = 'fresh' | 'stale' | 'very_stale'
                     | 'no_data' | 'disabled' | 'error'
summary.overallStatus: 'sufficient' | 'limited' | 'insufficient'  (+ coveragePercent)
```

Carries `lastError`, `itemCount`, `enabled`, `maxStaleMin`, and
`freshnessEvidence: 'session' | 'seed-health' | null` — i.e. it records *how it
knows* it is fresh. Also a `requiredForRisk` flag driving a hard
insufficient-data gate on the risk panel.

`no_data` is a distinct state from `stale`. That distinction is the whole point.

### 2.7 Read-model publishing with pointer flip
Several domains do not fetch upstream at request time. A scheduled publisher
scores every entity and builds its indexes in one pass, writes country and
chokepoint shards into the **inactive** Redis slot, and switches the shared
cohort pointer **only after every shard validates**. The manifest and every
shard carry an explicit redistribution-policy version, and readers **reject**
an older unmarked cohort until a matching publisher activates one. Handlers
revalidate the stored contract and re-age every input clock before serving.

Fail-closed applies to legal terms too: routes fail closed on provider inputs
whose programmatic redistribution is restricted, *including* requests carrying
freely mintable browser-session tokens.

### 2.8 Shared-rule imports to stop surface drift
When an agent-facing surface must agree event-for-event with what the UI renders,
the rules are moved into `shared/` and **both sides import them** rather than
each reimplementing. Modules like country-headline-match, threat-keyword
classifier and timeline clustering are single-copy by construction, and the
ordering between them is documented as load-bearing (cluster first, then filter
by country, because a cluster is represented by its earliest member).

Their words for the alternative: *"A second copy of any of these is the defect
this arrangement exists to prevent."*

---

## 3. Transferable primitives, ranked

| # | Primitive | Why it transfers | Cost to carry |
|---|---|---|---|
| 1 | Tri-state claim schema (`known`/`unknown`/`not_applicable` + mandatory reason) | Domain-agnostic. Directly serves "traceable, easy to verify, know when last updated" | ~1 day, pure spec + validator |
| 2 | Per-item provenance card (source · freshness · confidence · limitations · evidence) | It is the visible product, not decoration | ~1 day |
| 3 | Freshness tracker with `no_data` distinct from `stale` | Stops the demo lying; cheap and impressive | ~0.5 day |
| 4 | Renderer fallback ladder as a registry field (`svg` → `deck` → `globe`) | Low-bandwidth tier becomes configuration, not a fork | ~1 day |
| 5 | Fail-closed source registry, unlisted = `unknown` | Integrity posture a judge can check | ~0.5 day |
| 6 | Separate importance vs credibility scoring with published weights | Shows methodology, not vibes | ~0.5 day |
| 7 | Config packs per country/community (their variant system, reduced) | Scalability criterion, demonstrable in one line of config | ~0.5 day |
| 8 | Cache tiers + cache-miss coalescing (concurrent same-key = one fetch) | Keeps a free-tier demo alive under load | ~0.5 day |
| 9 | Read-model + atomic pointer flip for any scored layer | Makes scores reproducible and auditable | ~1 day |
| 10 | Agent surface: versioned `SKILL.md` per capability + discovery files | Cheap, unusual, reads as 2026-standard | ~0.5 day |
| 11 | Known-limitations doc format (dimension · root cause · observable signature · fix path or why it is NOT being fixed) | Turning limits into a document is a trust signal | ~0.25 day |
| 12 | Edge gateway pipeline order (origin → CORS → preflight → key → rate limit → route → handler → ETag → cache headers) | Correct-by-default API skeleton | ~0.5 day |

Non-goals to note and refuse: 3D globe as centrepiece, 44-panel breadth,
military/OSINT scope, billing, desktop binary, multi-language SDKs, blog site,
container deployment, Mintlify docs proxy.

---

## 4. Their enforcement culture (worth imitating, at 1% of the size)

- ~30 `lint:*` and `enforce-*.mjs` scripts asserting architecture rules
  mechanically: module boundaries, API-contract coverage, safe-HTML, panel
  content writes, rate-limit policy coverage, premium fetch paths, unicode
  safety, secret leakage in env dumps, doc/plan references.
- An explicit **ownership rule**: deployment topology, API surface, desktop
  runtime or bootstrap keys changing means the architecture doc is updated in
  the same PR.
- 2,167 test/spec files, 46 workflows, golden screenshot tests per layer and
  zoom, accessibility axe scan, LCP attribution, marker budget tests.
- `docs/methodology/known-limitations.md` names, for each known weakness, the
  dimension affected, the root cause, the observable signature, and either the
  fix path or the reason it will **not** be fixed.

For Trail: copy the *shape* — a short list of mechanically enforced rules, a
handful of real tests, and one honest limitations document. Do not copy the
volume.

---

## 5. Costs, blockers and traps

**Build weight.** Full build requires Tauri (Rust) + 12 Dockerfiles + a Node
sidecar + Convex + Redis + Playwright + proto codegen. On the local machine
(VivoBook X513IA, Ryzen 7 4700U, 7.6 GB RAM, AMD iGPU, no NVIDIA, no Docker, no
WSL) a full clone-and-build is out of reach. A front-end-only slice (`npm i` +
Vite dev, deck.gl / globe.gl on the AMD iGPU) is plausible; the back end is not.

**Dependency surface is a trap.** deck.gl + globe.gl + three + maplibre-gl +
pmtiles + h3-js + supercluster + satellite.js + onnxruntime-web + transformers.js
+ youtubei.js + telegram + convex + clerk + sentry. Each is a real commitment.
Trail should pick two or three, not inherit the list.

**Licence — read this before writing a line.** The shell is **AGPL-3.0-only**.
That is viral: incorporating its code into Trail obligates releasing the whole
derivative under AGPL with source available to network users. Patterns,
interfaces and architecture are not code and carry no such obligation; a clean
reimplementation does not. Default position: **take patterns, write our own
implementation, copy zero lines.** If any code is ever borrowed, it must be
labelled and the licence obligations accepted deliberately, with the AGPL
attribution added to this repo's README.

**Credit tension to resolve (needs your call, not mine).** The earlier planning
note said the README should carry a References section naming the reference
project and its licence, on the reasoning that judges recognise it and silent
inspiration reads worse than credited inspiration. The instruction now is that
the name appears nowhere in this repo. Both cannot hold. I have followed the
newer instruction — there is no name in this repo — and I am flagging the
consequence rather than deciding it: if Trail visibly refits this architecture,
an unattributed resemblance is a risk in a judged setting. Options: (a) keep the
name out entirely, (b) a generic acknowledgement ("architecture inspired by
open-source situational-awareness dashboards, AGPL-3.0"), or (c) full named
credit. Your call, and it can wait until the idea exists.

---

## 6. Capability inventory available to Trail

These are slots the shell proves are buildable, listed without any commitment
about what Trail actually is. The idea is yours; this is inventory, not a
premise.

- Layered geographic view with a declarative layer registry and per-renderer gates
- Per-item provenance card: source, freshness, confidence, limitations, evidence
- Tri-state claim validation that refuses absent-to-affirmative drift
- Two-axis scoring (importance vs credibility) with published weights
- Freshness/coverage summary that can say `insufficient` and `no_data`
- Map-free text-first tier for constrained devices/bandwidth
- Per-country or per-community config packs from one codebase
- Scheduled publisher → atomic pointer flip → auditable read model
- Cache tiers and stampede coalescing on a free-tier backend
- Agent-discoverable surface: versioned capability files, discovery endpoints
- Mechanically enforced architecture rules + one published limitations doc

---

## 7. Open questions

1. What is the idea? Nothing above should be wired until you state it.
2. Licence path: clean reimplementation (default) or a deliberate AGPL borrow?
3. Credit path: (a) none, (b) generic, (c) named — see §5.
4. Track for the submission, and the target country/community for the first pack.
5. Is Trail the submission repo itself, or does it live alongside the planning repo?
