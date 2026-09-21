/**
 * Trail data model.
 *
 * Two rules govern this file:
 *
 * 1. Nothing here is presented as verified unless it is. Every record carries a
 *    `source` object with an explicit `verified` flag and a `checked` date. The
 *    UI renders that state honestly, including when it is "not checked".
 *
 * 2. Tracks mirror the hackathon's three challenge areas, because a trail is
 *    only useful if it is pointed at a real accountability route:
 *      stability      — reduce everyday friction before it escalates
 *      transparency   — make institutional decisions visible and checkable
 *      safety         — report harm, protect the person reporting
 */

export const TRACKS = [
  {
    id: "transparency",
    name: "Transparency & Accountability",
    short: "Transparency",
    blurb: "Make decisions by governments and institutions visible, understandable and open to scrutiny.",
    color: "#4ade80",
  },
  {
    id: "stability",
    name: "Stability & Social Cohesion",
    short: "Stability",
    blurb: "Reduce everyday friction around shared resources before it escalates.",
    color: "#38bdf8",
  },
  {
    id: "safety",
    name: "Safety, Reporting & Protection",
    short: "Safety",
    blurb: "Report threats, violence or abuse safely, and reach a real pathway to protection.",
    color: "#f472b6",
  },
];

export const trackById = (id) => TRACKS.find((t) => t.id === id);

/**
 * Layers. `track` is the primary challenge area the layer serves; `evidence`
 * names what a citizen can actually obtain from it, which is what makes it a
 * trail rather than a pin.
 */
export const LAYERS = [
  { id: "services", name: "Public services", track: "transparency", color: "#4ade80", evidence: "Service charters, office hours, complaint routes", icon: "home" },
  { id: "budget", name: "Budgets & spending", track: "transparency", color: "#22c55e", evidence: "Published allocations, county budget documents", icon: "coins" },
  { id: "procurement", name: "Procurement & contracts", track: "transparency", color: "#a3e635", evidence: "Tender awards, contract registers, beneficial owners", icon: "clipboard" },
  { id: "audit", name: "Audit & oversight", track: "transparency", color: "#84cc16", evidence: "Auditor-general reports, oversight findings", icon: "scale" },
  { id: "elections", name: "Representation", track: "transparency", color: "#14b8a6", evidence: "Ward boundaries, representative contacts, sitting calendars", icon: "megaphone" },
  { id: "water", name: "Water & sanitation", track: "stability", color: "#38bdf8", evidence: "Water point status, maintenance contacts, borehole data", icon: "droplets" },
  { id: "land", name: "Land & tenure", track: "stability", color: "#0ea5e9", evidence: "Registry status, consultation records, dispute routes", icon: "landmark" },
  { id: "displacement", name: "Displacement", track: "stability", color: "#6366f1", evidence: "Movement figures, registration points, return support", icon: "route" },
  { id: "warning", name: "Early warning", track: "stability", color: "#8b5cf6", evidence: "Drought, flood and hazard alerts with lead times", icon: "alert" },
  { id: "mediation", name: "Local mediation", track: "stability", color: "#a78bfa", evidence: "Peace committees, customary and formal dispute routes", icon: "users" },
  { id: "rights", name: "Rights & legal aid", track: "safety", color: "#f472b6", evidence: "Free legal aid, paralegal networks, complaint mechanisms", icon: "scale" },
  { id: "protection", name: "Reporting & protection", track: "safety", color: "#ec4899", evidence: "Ombudsman, anti-corruption, police oversight, helplines", icon: "shield-alert" },
  { id: "gbv", name: "GBV & child protection", track: "safety", color: "#f43f5e", evidence: "Referral pathways, survivor services, safe reporting", icon: "heart" },
  { id: "health", name: "Health access", track: "safety", color: "#fb7185", evidence: "Facility staffing, medicine availability, referral routes", icon: "heart-pulse" },
  { id: "education", name: "Schools", track: "transparency", color: "#3b82f6", evidence: "HOT OSM education facilities (ODbL)", icon: "graduation-cap" },
  { id: "water-points", name: "Water points", track: "stability", color: "#38bdf8", evidence: "WPDx water point status, maintenance contacts", icon: "droplets" },
  { id: "power-plants", name: "Power plants", track: "transparency", color: "#fbbf24", evidence: "WRI Global Power Plant Database (CC BY 4.0)", icon: "zap" },
  { id: "markets", name: "Market centres", track: "stability", color: "#fbbf24", evidence: "Ethiopia Market Centers (CC0)", icon: "shopping-cart" },
  { id: "grid-lines", name: "Grid network", track: "transparency", color: "#fbbf24", evidence: "ESMAP Africa transmission grid (CC BY 4.0)", icon: "grid" },
  { id: "food", name: "Food & market prices", track: "stability", color: "#fbbf24", evidence: "Staple price series, market data, shortage reporting", icon: "leaf" },
];

export const layerById = (id) => LAYERS.find((l) => l.id === id);

export const RECORDS = [
  {
    id: "mak",
    title: "A clearer route to water access",
    place: "Makueni County", country: "Kenya", coords: [37.62, -1.8],
    layer: "water", track: "stability",
    description: "A community water point needs a clear maintenance contact. Connect the service question to the county water office and ask for a dated response.",
    source: { name: "Makueni County Government", url: "https://makueni.go.ke/", type: "Government portal", verified: false, checked: "2026-09-19", cadence: "Ad hoc" },
    listed: "2026-09-19", holder: "County water services office", witness: "Community water committee",
    ask: "Who is responsible for this water point, and when can the community expect a maintenance update?",
    theme: "Water & sanitation", confidence: 0.72, importance: 0.85,
    limitations: ["County portal publishes annual reports, not live water-point status", "No independent verification of this specific point"],
  },
  {
    id: "gha",
    title: "Follow the community benefit",
    place: "Tarkwa", country: "Ghana", coords: [-1.99, 5.3],
    layer: "land", track: "stability",
    description: "Follow a community benefit question from a mining-affected locality to the district assembly. Ask where the allocation is published and when residents can take part.",
    source: { name: "Ghana Minerals Commission", url: "https://www.mincom.gov.gh/", type: "Public regulator", verified: false, checked: "2026-09-17", cadence: "Ad hoc" },
    listed: "2026-09-17", holder: "District assembly information desk", witness: "Community association",
    ask: "Where can residents view the community benefit allocation and the next public consultation date?",
    theme: "Community benefit", confidence: 0.65, importance: 0.78,
    limitations: ["Mining benefit allocations are often published at district level only", "Consultation dates are not consistently published in advance"],
  },
  {
    id: "sen",
    title: "Make the next meeting accessible",
    place: "Dakar", country: "Senegal", coords: [-17.45, 14.69],
    layer: "elections", track: "transparency",
    description: "Ask for the date, venue and accessible participation arrangements for a local public meeting. Make room for questions before the meeting begins.",
    source: { name: "Senegal public services portal", url: "https://www.servicepublic.gouv.sn/", type: "Government portal", verified: false, checked: "2026-09-18", cadence: "Ad hoc" },
    listed: "2026-09-18", holder: "Municipal information desk", witness: "Local youth association",
    ask: "When is the next public meeting, and how can residents submit a question in advance?",
    theme: "Citizen participation", confidence: 0.7, importance: 0.74,
    limitations: ["Accessibility arrangements are rarely published", "Meeting notices may be posted physically only"],
  },
  {
    id: "nga",
    title: "Find the right service desk",
    place: "Abuja", country: "Nigeria", coords: [7.49, 9.06],
    layer: "services", track: "transparency",
    description: "Turn a confusing public-service route into a written request for the right office, required documents and a response date.",
    source: { name: "SERVICOM", url: "https://servicom.gov.ng/", type: "Government service office", verified: false, checked: "2026-09-20", cadence: "Ad hoc" },
    listed: "2026-09-20", holder: "Service improvement desk", witness: "Residents association",
    ask: "Which desk holds this service request, what documents are required, and what is the expected response time?",
    theme: "Service accountability", confidence: 0.68, importance: 0.8,
    limitations: ["Service charters exist on paper; response times are not independently monitored"],
  },
  {
    id: "drc",
    title: "Put a land question on record",
    place: "Kolwezi", country: "DR Congo", coords: [25.47, -10.72],
    layer: "land", track: "stability",
    description: "Request a public consultation record and a named office for a community land question. No household or personal locations are collected.",
    source: { name: "DRC Ministry of Mines", url: "https://mines.gouv.cd/", type: "Government portal", verified: false, checked: "2026-09-15", cadence: "Ad hoc" },
    listed: "2026-09-15", holder: "Provincial information office", witness: "Community liaison group",
    ask: "Which public consultation record covers this area, and who can provide a written response to residents?",
    theme: "Land & resources", confidence: 0.62, importance: 0.76,
    limitations: ["Consultation records are frequently unpublished", "Provincial offices vary widely in responsiveness"],
  },
  {
    id: "moz",
    title: "A place in the local conversation",
    place: "Maputo", country: "Mozambique", coords: [32.57, -25.97],
    layer: "elections", track: "transparency",
    description: "Ask for an inclusive way to join a local civic meeting, including an offline option for residents without internet access.",
    source: { name: "Mozambique Government portal", url: "https://www.portaldogoverno.gov.mz/", type: "Government portal", verified: false, checked: "2026-09-16", cadence: "Ad hoc" },
    listed: "2026-09-16", holder: "Municipal citizen service office", witness: "Women-led community group",
    ask: "How can residents contribute to the next civic meeting by paper or through a community representative?",
    theme: "Inclusive participation", confidence: 0.66, importance: 0.72,
    limitations: ["Online consultation excludes residents without connectivity", "Portuguese-language only"],
  },
  {
    id: "zaf",
    title: "Know the next step for a request",
    place: "Johannesburg", country: "South Africa", coords: [28.05, -26.2],
    layer: "services", track: "transparency",
    description: "Attach a service query to a named municipal desk. Ask for an acknowledgement, a reference number and a clear next step.",
    source: { name: "City of Johannesburg", url: "https://www.joburg.org.za/", type: "Municipal portal", verified: false, checked: "2026-09-20", cadence: "Ad hoc" },
    listed: "2026-09-20", holder: "Municipal service centre", witness: "Ward community forum",
    ask: "Please acknowledge this service query, provide a reference number and confirm the next response date.",
    theme: "Public services", confidence: 0.74, importance: 0.82,
    limitations: ["Reference numbers are issued by the municipality, not by a neutral party"],
  },
  {
    id: "ken",
    title: "Connect a budget to a service",
    place: "Nairobi", country: "Kenya", coords: [36.82, -1.29],
    layer: "budget", track: "transparency",
    description: "Locate the public-budget information desk and ask where residents can inspect a service allocation and give feedback.",
    source: { name: "Kenya National Treasury", url: "https://www.treasury.go.ke/", type: "Government portal", verified: false, checked: "2026-09-18", cadence: "Annual" },
    listed: "2026-09-18", holder: "Public participation information desk", witness: "Budget accountability group",
    ask: "Where is the published allocation for this service, and how can residents submit feedback?",
    theme: "Budget participation", confidence: 0.7, importance: 0.79,
    limitations: ["National budget documents do not resolve to a specific local service", "County-level detail is published separately"],
  },
  {
    id: "rwa",
    title: "Track a school materials commitment",
    place: "Kigali", country: "Rwanda", coords: [30.05, -1.95],
    layer: "services", track: "transparency",
    description: "Find the district education office and ask where the public can view the procurement and delivery status for school materials.",
    source: { name: "Rwanda Education Board", url: "https://www.reb.gov.rw/", type: "Government agency", verified: false, checked: "2026-09-17", cadence: "Ad hoc" },
    listed: "2026-09-17", holder: "District education office", witness: "Parent-teacher association",
    ask: "Where can residents inspect the procurement and delivery schedule for school materials in this district?",
    theme: "Education access", confidence: 0.71, importance: 0.77,
    limitations: ["Delivery schedules are not routinely published by district"],
  },
  {
    id: "tza",
    title: "Inspect a rural clinic schedule",
    place: "Dodoma", country: "Tanzania", coords: [35.75, -6.17],
    layer: "health", track: "safety",
    description: "Find the regional health office and ask where residents can view the staffing and medicine availability schedule for a rural clinic.",
    source: { name: "Tanzania Ministry of Health", url: "https://www.moh.go.tz/", type: "Government ministry", verified: false, checked: "2026-09-19", cadence: "Ad hoc" },
    listed: "2026-09-19", holder: "Regional health management office", witness: "Community health workers",
    ask: "Where can residents view the staffing and medicine availability schedule for this clinic?",
    theme: "Health access", confidence: 0.67, importance: 0.81,
    limitations: ["Facility-level stock data is not published openly", "No open data on staffing levels"],
  },
  {
    id: "eth",
    title: "Locate a power restoration timeline",
    place: "Addis Ababa", country: "Ethiopia", coords: [38.75, 9.03],
    layer: "services", track: "transparency",
    description: "Find the utility office and ask where the public can view the expected restoration timeline after an outage.",
    source: { name: "Ethiopian Electric Utility", url: "https://www.eep.gov.et/", type: "State utility", verified: false, checked: "2026-09-16", cadence: "Ad hoc" },
    listed: "2026-09-16", holder: "Customer service office", witness: "Residents association",
    ask: "Where can residents view the expected power restoration timeline and report ongoing outages?",
    theme: "Energy & grids", confidence: 0.64, importance: 0.83,
    limitations: ["Outage timelines are announced informally, often by radio"],
  },
  {
    id: "cmr",
    title: "Trace a market price signal",
    place: "Douala", country: "Cameroon", coords: [9.7, 4.05],
    layer: "food", track: "stability",
    description: "Find the trade and consumer office and ask where residents can view a staple-goods price series and report discrepancies.",
    source: { name: "Cameroon Ministry of Trade", url: "https://www.mincommerce.gov.cm/", type: "Government ministry", verified: false, checked: "2026-09-20", cadence: "Ad hoc" },
    listed: "2026-09-20", holder: "Regional trade office", witness: "Market vendors association",
    ask: "Where can residents view the published staple-goods price series and report discrepancies?",
    theme: "Food & market prices", confidence: 0.63, importance: 0.75,
    limitations: ["Published price series lag actual market prices", "Informal market prices are largely untracked"],
  },
  {
    id: "uga",
    title: "Follow a land registry query",
    place: "Kampala", country: "Uganda", coords: [32.58, 0.35],
    layer: "land", track: "stability",
    description: "Find the land registry office and ask where residents can inspect the status of a community land title query.",
    source: { name: "Uganda Land Commission", url: "https://www.ulc.go.ug/", type: "Government commission", verified: false, checked: "2026-09-18", cadence: "Ad hoc" },
    listed: "2026-09-18", holder: "District land registry", witness: "Community land committee",
    ask: "Where can residents inspect the status of a land title query and the expected response date?",
    theme: "Land & resources", confidence: 0.66, importance: 0.73,
    limitations: ["Registry status is not published online", "Physical attendance is usually required"],
  },
  {
    id: "cod",
    title: "Attach a complaint to an oversight body",
    place: "Kinshasa", country: "DR Congo", coords: [15.31, -4.32],
    layer: "protection", track: "safety",
    description: "Identify the oversight body that can receive a written complaint about a public office, and ask for a receipt and case reference.",
    source: { name: "DRC public services oversight", url: "", type: "Oversight body", verified: false, checked: "2026-09-21", cadence: "Ad hoc" },
    listed: "2026-09-21", holder: "Oversight office intake desk", witness: "Community paralegal group",
    ask: "Which body can receive this complaint, what is the acknowledgement procedure, and what is the case reference format?",
    theme: "Rights & protection", confidence: 0.55, importance: 0.86,
    limitations: ["Source URL not yet confirmed — do not treat as a working link", "Complaint routes vary by province"],
  },
];

/**
 * Community-submitted issues. This is the bottom-up half of the product: a
 * resident raises something, neighbours back it, and a well-supported issue can
 * be promoted into an official trail.
 *
 * IMPORTANT AND HONEST: there is no server in this build. Votes are recorded on
 * this device only. The UI says so on every issue. `VOTE_THRESHOLD` and
 * `VERIFY_THRESHOLD` are product rules, not cryptography — they make the
 * workflow legible, and a real deployment would need a relay to aggregate.
 */
export const ISSUE_SEEDS = [
  {
    id: "ISS-014",
    title: "Borehole at Kathiani market has been dry three weeks",
    place: "Kathiani", country: "Kenya", coords: [37.35, -1.55],
    track: "stability", layer: "water",
    detail: "The market borehole stopped working in early September. Vendors are buying water. The county says a pump part is on order but no date has been given.",
    evidence: "Photo of the dry tap stand and the county works notice pinned at the market.",
    created: "2026-09-18", votes: 7, status: "community-verified", reporter: "Anonymous",
  },
  {
    id: "ISS-021",
    title: "Tender award for the feeder road not published",
    place: "Kumasi", country: "Ghana", coords: [-1.62, 6.69],
    track: "transparency", layer: "procurement",
    detail: "Work started on the feeder road but no award notice is on the assembly noticeboard or the procurement portal. Residents want to know the contract value and contractor.",
    evidence: "Photograph of the construction sign, which does not name the contractor.",
    created: "2026-09-19", votes: 4, status: "open", reporter: "Anonymous",
  },
  {
    id: "ISS-027",
    title: "Clinic has had no malaria test kits for six days",
    place: "Lira", country: "Uganda", coords: [32.25, 2.24],
    track: "safety", layer: "health",
    detail: "Patients are being sent to a private pharmacy for tests. Staff say the district order has not arrived. Asking for the published stock and order record.",
    evidence: "Handwritten notice on the clinic door referring patients elsewhere.",
    created: "2026-09-20", votes: 2, status: "open", reporter: "Anonymous",
  },
  {
    id: "ISS-031",
    title: "No accessible entrance at the ward office",
    place: "Lusaka", country: "Zambia", coords: [28.32, -15.42],
    track: "transparency", layer: "services",
    detail: "The ward office has steps at the only entrance. Residents using wheelchairs are served in the car park. Asking who is responsible for the retrofit and when.",
    evidence: "Photograph of the entrance steps with no ramp.",
    created: "2026-09-21", votes: 1, status: "open", reporter: "Anonymous",
  },
];

export const VOTE_THRESHOLD = 3;   // votes needed before an issue is "community-verified"
export const PROMOTE_THRESHOLD = 5; // votes needed before it can become an official trail

export const SEED_FILES = [
  {
    id: "TRL-104", recordId: "gha", title: "Follow the community benefit",
    holder: "District assembly information desk", witness: "Community association",
    created: "2026-09-18", due: "2026-09-25", expires: "2026-10-02", answered: null, links: [],
  },
  {
    id: "TRL-108", recordId: "sen", title: "Make the next meeting accessible",
    holder: "Municipal information desk", witness: "Local youth association",
    created: "2026-09-16", due: "2026-09-20", expires: "2026-09-27", answered: "2026-09-20", links: [],
  },
  {
    id: "TRL-112", recordId: "eth", title: "Locate a power restoration timeline",
    holder: "Customer service office", witness: "Residents association",
    created: "2026-09-19", due: "2026-09-24", expires: "2026-10-01", answered: null, links: ["nga"],
  },
  {
    id: "TRL-115", recordId: "tza", title: "Inspect a rural clinic schedule",
    holder: "Regional health management office", witness: "Community health workers",
    created: "2026-09-20", due: "2026-09-26", expires: "2026-10-03", answered: null, links: [],
  },
];

export const STORAGE_KEY = "trail-files-v4";
export const ISSUE_KEY = "trail-issues-v4";
export const REPORT_KEY = "trail-reports-v4";
export const BUNDLE_DATE = "2026-09-21";

export const recordById = (id) => RECORDS.find((r) => r.id === id);
export const placeLabel = (r) => `${r.place}, ${r.country}`;

/**
 * The countries this build actually covers — derived from the records and the
 * community issues, so the footprint can never drift from the data.
 *
 * Everything is scoped to these: records, issues, layer features and the view
 * itself. The other African countries in the geometry are drawn as quiet
 * context only, because a map showing thirteen disconnected outlines reads as
 * broken rather than as focused.
 */
export const COUNTRIES = [...new Set([
  ...RECORDS.map((r) => r.country),
  ...ISSUE_SEEDS.map((i) => i.country),
])].sort();

/** The bundled Natural Earth extract abbreviates two names we use in full. */
const GEO_NAME = { "DR Congo": "Dem. Rep. Congo", Congo: "Congo" };
export const geoNameOf = (country) => GEO_NAME[country] ?? country;
export const isCovered = (country) => COUNTRIES.includes(country);
export const coveredFeatures = (geo) =>
  geo.features.filter((f) => COUNTRIES.some((c) => geoNameOf(c) === f.properties.name));

export function dateLabel(date) {
  return new Date(`${date}T12:00:00Z`).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}
export function addDays(date, days) {
  const d = new Date(`${date}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}
export function daysBetween(a, b) {
  return Math.round((new Date(`${b}T12:00:00Z`) - new Date(`${a}T12:00:00Z`)) / 86400000);
}

/**
 * Freshness is computed against the record's own declared cadence, not a single
 * global number. A record on an annual cadence is not stale at 40 days; one on
 * a daily cadence is. Where the cadence is unknown the state is "unknown",
 * which is deliberately distinct from "stale" — the whole point is that an
 * unread source must never read as healthy.
 */
const CADENCE_DAYS = { Daily: 2, Weekly: 10, Monthly: 45, Quarterly: 120, Annual: 400, "Ad hoc": 120 };
export function freshnessOf(source, today) {
  if (!source || !source.checked) return { state: "unknown", days: null, label: "Never checked" };
  const days = daysBetween(source.checked, today);
  const limit = CADENCE_DAYS[source.cadence] ?? 120;
  if (days <= limit) return { state: "fresh", days, label: `Checked ${dateLabel(source.checked)}` };
  if (days <= limit * 2) return { state: "stale", days, label: `Checked ${dateLabel(source.checked)} · past its ${source.cadence} cadence` };
  return { state: "very-stale", days, label: `Checked ${dateLabel(source.checked)} · overdue` };
}

export function stateAt(file, date) {
  if (date < file.created) return "Not yet opened";
  if (file.answered && date >= file.answered) return "Answered";
  if (date > file.expires) return "Expired unanswered";
  if (date > file.due) return "Overdue";
  return "Awaiting response";
}

export function validFile(f) {
  const iso = (value) => typeof value === "string" && /^20[2-9][0-9]-\d{2}-\d{2}$/.test(value) && !isNaN(new Date(value).valueOf());
  return (
    f && recordById(f.recordId) &&
    ["id", "title", "holder", "witness"].every((k) => typeof f[k] === "string" && f[k].trim().length > 0 && f[k].length <= 200) &&
    iso(f.created) && iso(f.due) && iso(f.expires) &&
    f.created <= f.due && f.due < f.expires &&
    (f.answered === null || (iso(f.answered) && f.answered >= f.created)) &&
    Array.isArray(f.links) && f.links.every((id) => (recordById(id) || String(id).startsWith("ISS-")) && id !== f.recordId)
  );
}

export function loadFiles(storage) {
  try {
    const raw = storage.getItem(STORAGE_KEY);
    if (!raw) return structuredClone(SEED_FILES);
    const files = JSON.parse(raw);
    return Array.isArray(files) && files.every(validFile) ? files : structuredClone(SEED_FILES);
  } catch {
    return structuredClone(SEED_FILES);
  }
}

export function loadIssues(storage) {
  try {
    const raw = storage.getItem(ISSUE_KEY);
    if (!raw) return structuredClone(ISSUE_SEEDS);
    const list = JSON.parse(raw);
    if (!Array.isArray(list)) return structuredClone(ISSUE_SEEDS);
    // Merge: keep any seeds the user has not seen, plus everything they voted on.
    const byId = new Map(ISSUE_SEEDS.map((i) => [i.id, i]));
    list.forEach((i) => { if (i && typeof i.id === "string") byId.set(i.id, { ...byId.get(i.id), ...i }); });
    return [...byId.values()];
  } catch {
    return structuredClone(ISSUE_SEEDS);
  }
}

export function validIssue(i) {
  return (
    i && typeof i.id === "string" &&
    ["title", "place", "country", "detail"].every((k) => typeof i[k] === "string" && i[k].trim().length > 0 && i[k].length <= 400) &&
    Array.isArray(i.coords) && i.coords.length === 2 && i.coords.every((n) => typeof n === "number") &&
    typeof i.votes === "number" && i.votes >= 0 &&
    ["open", "community-verified", "official"].includes(i.status)
  );
}

/**
 * The packet is the deliverable. Everything else is scaffolding for it: a
 * person closes the app holding a document they can send, print, or read out.
 */
export function packetText(file, format, date, extras = {}) {
  const { record, issue, includeReporterHint } = extras;
  const subject = record || issue;
  const title = subject?.title ?? file?.title ?? "";
  // `place` on a record already carries the country in the app's view model, so
  // only append it when it is genuinely absent.
  const place = record
    ? (record.place && record.country && record.place.includes(record.country) ? record.place : placeLabel(record))
    : issue
      ? [issue.place, issue.country].filter(Boolean).join(", ")
      : "";
  const theme = record?.theme ?? (issue ? layerById(issue.layer)?.name : "");
  const src = record?.source;
  const lines = [
    "TRAIL · NEXT-STEP PACKET",
    `${file?.id ?? "—"} · ${title}`,
    `Place: ${place}`,
    theme ? `Subject: ${theme}` : null,
    file?.holder ? `Proposed holder: ${file.holder}` : null,
    file?.witness ? `Proposed witness: ${file.witness}` : null,
    file?.due ? `Response requested by: ${file.due}` : null,
    file?.expires ? `Review closes: ${file.expires}` : null,
    file?.id ? `State at ${date}: ${stateAt(file, date)}` : null,
    "",
    "WHAT TO DO NEXT",
    record?.ask ? `Ask exactly this: ${record.ask}` : "Ask the named office for a written acknowledgement, a reference number, and a date to come back.",
    "Take the name and role of the person who receives it. Ask for their answer in writing.",
    "",
  ];
  const provenance = src
    ? [
        "SOURCE & LIMITS",
        `${src.name}${src.url ? ` — ${src.url}` : " — no URL recorded"}`,
        `Class: ${src.type}`,
        `Source last checked: ${src.checked || "never"} (${src.verified ? "checked by this project" : "NOT independently verified"})`,
        `Declared update cadence: ${src.cadence || "unknown"}`,
        ...(record.limitations || []).map((l) => `Limitation: ${l}`),
        "This packet records a question, not an established fact. The portal or office named is a research starting point.",
        "",
      ]
    : ["SOURCE & LIMITS", "No source recorded for this item. Treat it as unverified.", ""];
  const safety = [
    "PRIVACY",
    "No names, ID numbers, phone numbers or household locations should be written into this packet.",
    "You are sharing a question about a public service, not information about a person.",
    includeReporterHint ? "If you are reporting harm, do not keep this copy on a shared or monitored device." : null,
    "",
  ].filter(Boolean);

  const body = [...lines, ...provenance, ...safety].filter((l) => l !== null).join("\n");

  if (format === "whatsapp" || format === "short")
    return `*TRAIL · ${file?.id ?? ""}* ${title}\n${place}\n\n${record?.ask ?? "Please acknowledge this request in writing and give a reference number and a response date."}\n\nSource: ${src?.name ?? "not recorded"}${src?.url ? ` (${src.url})` : ""}\nChecked: ${src?.checked ?? "never"}${src?.verified ? "" : " · not independently verified"}\n\nKeep this message. A reply date matters more than a reply.`;
  if (format === "sms")
    return `TRAIL ${file?.id ?? ""} ${place}: ${record?.ask ?? "request acknowledgement, a reference number and a date"} Reply by ${file?.due ?? "the date agreed"}, quoting ${file?.id ?? "the reference"}.`;
  if (format === "radio")
    return `RADIO / MEETING SCRIPT\n\n"Residents of ${place}: we have a question about ${(theme || "a public service").toLowerCase()}. ${record?.ask ?? ""} The proposed holder is ${file?.holder ?? "the responsible office"}. We ask for a written response by ${dateLabel(file?.due ?? date)}. At the next community meeting, quote ${file?.id ?? "this reference"} to follow up."\n\nAdapt with a local-language speaker before broadcast. Do not name affected individuals.\n\n${body}`;
  return body;
}
