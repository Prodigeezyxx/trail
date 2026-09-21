# Public source research — verification record

Researched and **fetched** on 21 September 2026, from this machine, with each
response's HTTP status recorded. Four parallel research passes covered
transparency and accountability, stability and social cohesion, safety and
protection, and open geospatial data.

The rule applied throughout: **a URL was opened, and its status recorded.** Where
a host answered with a bot challenge, a login wall, an empty JavaScript shell or
an error, the entry is marked unverified and says which. Nothing in the app's
source registry is described from memory.

**Result: 92 of 98 sources verified.** Six could not be, and they are listed with
reasons rather than quietly dropped.

---

## Method

1. Search for candidate sources per track.
2. Request each URL directly (`curl`, Chrome user-agent, redirects followed) and
   record the HTTP status and the byte size.
3. Extract the readable text of each response so licence and cadence statements
   are quoted from the live page, not recalled.
4. For JavaScript-only pages, drive a real browser before concluding anything.
5. Cross-check every licence claim against the fetched page. Where the licence
   statement could not be read, record "not stated" — never a guess.

---

## Headline findings

### 1. A squatted domain in the civic space

`cohesion.or.ke` — the domain a person might reasonably guess for Kenya's
National Cohesion and Integration Commission — is squatted and now serves a
**betting site**. The real commission is at `cohesion.go.ke`.

This matters more than a broken link. Someone looking for the body that handles
hate-speech complaints would land on a gambling site. The app cites only
`cohesion.go.ke`, and the warning is printed in the Sources tab so the mistake is
hard to repeat.

### 2. No state complaint mechanism could be confirmed anonymous

Across every ombudsman, anti-corruption commission, police oversight body and
human rights institution researched, **not one** could be confirmed to accept a
genuinely anonymous submission.

That finding reshaped the reporting screen. It does not say "report anonymously".
It says the app cannot send anything, cannot hide a record from someone holding
the device, cannot protect the reporter, and that anonymity is not guaranteed by
any official route — then points to digital-security and defender-protection
organisations for anyone at risk.

### 3. Two verified phone numbers, total

Only two could be confirmed: South Africa's **0800 428 428** GBV Command Centre
line, and Kenya's **116** child helpline. No other number, short code or email is
published anywhere in the app. An unverified crisis number in a safety tool is
worse than no number, because someone will call it.

### 4. Verifiable sources that vanished

- `info.worldbank.org/governance/wgi/` — the DNS name no longer resolves.
- `globalforestwatch.org` — redirects to `globalnaturewatch.org` after a rebrand.
- `africacheck.org` and `pesacheck.org` — HTTP 403 on every route, no usable
  archive snapshot. These are well-known fact-checkers; they are absent from the
  registry rather than described from memory.
- `open.africa` — HTTP 403 on every route including its CKAN API.

---

## What was verified, by track

### Transparency & accountability — 25 of 26

Working: OpenStreetMap/Geofabrik, geoBoundaries, Natural Earth, OCHA HDX, World
Bank Open Data, d-portal (IATI), EITI, Municipal Money (South Africa), the Open
Contracting Data Standard, Open Ownership, ICIJ Offshore Leaks, OpenSanctions,
V-Dem, CPI, Afrobarometer, ENERGYDATA.INFO, Climate TRACE, WPDx, Land Matrix,
Laws.Africa, the Parliamentary Monitoring Group, the Open Election Data
Initiative, Africa Freedom of Information Centre.

Not verified: **openAFRICA** (403 everywhere), **Kenya Open Data** (resolves but
returns ten characters of readable text), **OCCRP Aleph** (resolves, but the
licence is unreadable without a browser), **EITI** licence (unstated on the
pages fetched).

Licence traps worth naming: **OpenSanctions is CC BY-NC 4.0** — non-commercial
only. **CPI is CC BY-ND 4.0** — no derivatives, so scores cannot be republished
in modified form. **Afrobarometer is copyrighted**, not openly licensed.

### Stability & social cohesion — 60+ entries

Water: WPDx, mWater, WHO/UNICEF JMP, HDX water datasets, WASREB complaints
(Kenya — a real complaint route with a reference number), Nigeria's Federal
Ministry of Water Resources.

Land: Land Matrix, ACLED, International Land Coalition, PRINDEX, Namati (paralegal
networks), Landesa, FAO's Voluntary Guidelines on tenure, Kenya's National Land
Commission, Ghana's Lands Commission.

Pastoralism: ICPALD, SPARC, the IGAD Protocol on Transhumance, CELEP, ILRI.

Displacement: UNHCR Operational Data Portal, IDMC, Mixed Migration Centre, HDX.

Broadcast: the regulators for Kenya, Uganda, Tanzania, Ghana and South Africa —
how a radio alert trail actually reaches a licensed station.

Mediation and peacebuilding: ACCORD, Interpeace, Life and Peace Institute,
Conciliation Resources, Peace Direct, GPPAC, KAIPTC, Search for Common Ground,
Kujenga Amani, Kenya's NCIC, Ghana's National Peace Council, Nigeria's IPCR, and
the AU Peace and Security Council including FemWise-Africa.

Early warning: IGAD CEWARN, ECOWARN, the AU Continental Early Warning System,
FEWS NET, ICPAC, East Africa Hazards Watch, FAO GIEWS, GDACS, GloFAS, ReliefWeb.

Bot-protected but alive (archived snapshots used): Land Portal, UNHCR Refugee
Data Finder, IOM DTM, Farm Radio International, Internews, IPC.

Dead or unverifiable: FAO SWALIM (HTTP 500), AU-IBAR (host unreachable).

**AMARC is deliberately excluded**: `amarc.org` resolves to an unrelated
commercial blog, and no verifiable AMARC Africa community-radio directory exists.

### Safety, reporting & protection — 25+ verified routes

Verified country mechanisms: Public Protector South Africa; GBV Command Centre
(South Africa); Kenya's EACC, Commission on Administrative Justice, IPOA,
Childline 116, FIDA Kenya, Kituo Cha Sheria; Nigeria's Public Complaints
Commission and EFCC; Ghana's CHRAJ and Office of the Special Prosecutor;
Rwanda's Ombudsman; Zambia's ACC; Malawi's ACB.

Regional and international: the African Commission on Human and Peoples' Rights,
the ECOWAS Community Court of Justice, the UN Human Rights Council Complaint
Procedure, the World Bank Inspection Panel, the ICRC.

For anyone at risk: Access Now Digital Security Helpline, Front Line Defenders
emergency line, ProtectDefenders.eu, Security in a Box, Tactical Tech Data Detox,
EFF Surveillance Self-Defense, CPJ, Media Defence, Child Helpline International.

Unverified, and therefore labelled as such in the app: SAHRC, Nigeria's ICPC and
NAPTIP. Unverified with **no official URL confirmed at all** — so not listed:
Uganda's Inspectorate of Government and Human Rights Commission, Tanzania's PCCB
and CHRAGG, Sierra Leone's ACC, Liberia's LACC, Zimbabwe's ZACC.

### Geospatial — 15 datasets, all downloads verified

| Need | Dataset | Licence | Coverage |
|---|---|---|---|
| ADM1 boundaries | geoBoundaries gbOpen | Mixed open per country | 54/54 countries, 106/106 URLs 200 |
| ADM2 boundaries | geoBoundaries gbOpen | Mixed open per country | 52/54 (missing Libya, Mauritius) |
| P-coded boundaries | OCHA COD-AB | CC BY 3.0 IGO | 54/54, 47/54 with GeoJSON |
| Health facilities | HOT OSM extracts | ODbL 1.0 | 50/54 countries |
| Health facilities | GRID3 COD v9.0 / NGA v3.0 | CC BY 4.0 | COD, NGA |
| Schools | HOT OSM extracts | ODbL 1.0 | 50/54 countries |
| Water points | WPdx on HDX | CC BY-SA 4.0 | 15 countries, 198 MB |
| Power plants | WRI Global Power Plant Database | CC BY 4.0 | 48 countries, 34,936 rows |
| Grid lines | World Bank / ESMAP Africa grid map | CC BY 4.0 | Continental |
| Markets | HOT OSM POI (`amenity=marketplace`) | ODbL 1.0 | 50/54 countries |
| Markets | Ethiopia Market Centers | CC0 1.0 | Ethiopia |
| Mobile coverage | 1 km raster 1999–2030 (Zenodo) | CC BY 4.0 | All 54 countries, 22.46 GB |

Not verified: OpenCelliD (token-gated, no direct URL), GSMA/Collins Bartholomew
(commercial, no open licence), GRID3 Data Hub direct endpoints (HDX mirrors were
verified instead), WPdx custom-subset export (client-side only).

**Caveat carried into the app:** 15 datasets have verified download URLs but their
record-level completeness was never opened and inspected. Resolving is not the
same as being complete, and the app says so.

---

## How this is surfaced in the product

- **`src/sources.js`** holds the registry: 98 entries with licence, cadence and an
  explicit `verified` flag, plus category-to-pathway routing and the warnings above.
- **Sources tab** lists every dataset by track with its verification state. The
  unverified ones are visible, dimmed, and explained — not hidden.
- **Report tab** routes by category to verified pathways, and prints the anonymity
  caveat before the user sends anything anywhere.
- **Layer colours and trail templates** were shaped by what the research found
  actionable, rather than the research being bolted on afterwards.
