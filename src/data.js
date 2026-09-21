export const LAYERS = [
  { id: "services", name: "Public services", color: "#4ade80" },
  { id: "water", name: "Water & sanitation", color: "#38bdf8" },
  { id: "health", name: "Health access", color: "#f472b6" },
  { id: "education", name: "Education", color: "#a78bfa" },
  { id: "resources", name: "Land & resources", color: "#fbbf24" },
  { id: "participation", name: "Civic participation", color: "#fb923c" },
  { id: "markets", name: "Market prices", color: "#2dd4bf" },
  { id: "energy", name: "Energy & grids", color: "#f87171" },
];

export const RECORDS = [
  {
    id: "mak",
    title: "A clearer route to water access",
    place: "Makueni County",
    country: "Kenya",
    coords: [37.62, -1.8],
    layer: "water",
    description: "A community water point needs a clear maintenance contact. Connect the service question to the county water office and ask for a dated response.",
    source: "Makueni County Government",
    url: "https://makueni.go.ke/",
    sourceClass: "Government portal",
    listed: "2026-09-19",
    holder: "County water services office",
    witness: "Community water committee",
    ask: "Who is responsible for this water point, and when can the community expect a maintenance update?",
    theme: "Water & sanitation",
    confidence: 0.72,
    importance: 0.85,
  },
  {
    id: "gha",
    title: "Follow the community benefit",
    place: "Tarkwa",
    country: "Ghana",
    coords: [-1.99, 5.3],
    layer: "resources",
    description: "Follow a community benefit question from a mining-affected locality to the district assembly. Ask where the allocation is published and when residents can take part.",
    source: "Ghana Minerals Commission",
    url: "https://www.mincom.gov.gh/",
    sourceClass: "Public regulator",
    listed: "2026-09-17",
    holder: "District assembly information desk",
    witness: "Community association",
    ask: "Where can residents view the community benefit allocation and the next public consultation date?",
    theme: "Community benefit",
    confidence: 0.65,
    importance: 0.78,
  },
  {
    id: "sen",
    title: "Make the next meeting accessible",
    place: "Dakar",
    country: "Senegal",
    coords: [-17.45, 14.69],
    layer: "participation",
    description: "Ask for the date, venue and accessible participation arrangements for a local public meeting. Make room for questions before the meeting begins.",
    source: "Senegal public services portal",
    url: "https://www.servicepublic.gouv.sn/",
    sourceClass: "Government portal",
    listed: "2026-09-18",
    holder: "Municipal information desk",
    witness: "Local youth association",
    ask: "When is the next public meeting, and how can residents submit a question in advance?",
    theme: "Citizen participation",
    confidence: 0.7,
    importance: 0.74,
  },
  {
    id: "nga",
    title: "Find the right service desk",
    place: "Abuja",
    country: "Nigeria",
    coords: [7.49, 9.06],
    layer: "services",
    description: "Turn a confusing public-service route into a written request for the right office, required documents and a response date.",
    source: "SERVICOM",
    url: "https://servicom.gov.ng/",
    sourceClass: "Government service office",
    listed: "2026-09-20",
    holder: "Service improvement desk",
    witness: "Residents association",
    ask: "Which desk holds this service request, what documents are required, and what is the expected response time?",
    theme: "Service accountability",
    confidence: 0.68,
    importance: 0.8,
  },
  {
    id: "drc",
    title: "Put a land question on record",
    place: "Kolwezi",
    country: "DR Congo",
    coords: [25.47, -10.72],
    layer: "resources",
    description: "Request a public consultation record and a named office for a community land question. No household or personal locations are collected.",
    source: "DRC Ministry of Mines",
    url: "https://mines.gouv.cd/",
    sourceClass: "Government portal",
    listed: "2026-09-15",
    holder: "Provincial information office",
    witness: "Community liaison group",
    ask: "Which public consultation record covers this area, and who can provide a written response to residents?",
    theme: "Land & resources",
    confidence: 0.62,
    importance: 0.76,
  },
  {
    id: "moz",
    title: "A place in the local conversation",
    place: "Maputo",
    country: "Mozambique",
    coords: [32.57, -25.97],
    layer: "participation",
    description: "Ask for an inclusive way to join a local civic meeting, including an offline option for residents without internet access.",
    source: "Mozambique Government",
    url: "https://www.portaldogoverno.gov.mz/",
    sourceClass: "Government portal",
    listed: "2026-09-16",
    holder: "Municipal citizen service office",
    witness: "Women-led community group",
    ask: "How can residents contribute to the next civic meeting by paper or through a community representative?",
    theme: "Inclusive participation",
    confidence: 0.66,
    importance: 0.72,
  },
  {
    id: "zaf",
    title: "Know the next step for a request",
    place: "Johannesburg",
    country: "South Africa",
    coords: [28.05, -26.2],
    layer: "services",
    description: "Attach a service query to a named municipal desk. Ask for an acknowledgement, a reference number and a clear next step.",
    source: "City of Johannesburg",
    url: "https://www.joburg.org.za/",
    sourceClass: "Municipal portal",
    listed: "2026-09-20",
    holder: "Municipal service centre",
    witness: "Ward community forum",
    ask: "Please acknowledge this service query, provide a reference number and confirm the next response date.",
    theme: "Public services",
    confidence: 0.74,
    importance: 0.82,
  },
  {
    id: "ken",
    title: "Connect a budget to a service",
    place: "Nairobi",
    country: "Kenya",
    coords: [36.82, -1.29],
    layer: "participation",
    description: "Locate the public-budget information desk and ask where residents can inspect a service allocation and give feedback.",
    source: "Kenya National Treasury",
    url: "https://www.treasury.go.ke/",
    sourceClass: "Government portal",
    listed: "2026-09-18",
    holder: "Public participation information desk",
    witness: "Budget accountability group",
    ask: "Where is the published allocation for this service, and how can residents submit feedback?",
    theme: "Budget participation",
    confidence: 0.7,
    importance: 0.79,
  },
  {
    id: "rwa",
    title: "Track a school materials commitment",
    place: "Kigali",
    country: "Rwanda",
    coords: [30.05, -1.95],
    layer: "education",
    description: "Find the district education office and ask where the public can view the procurement and delivery status for school materials.",
    source: "Rwanda Education Board",
    url: "https://www.reb.gov.rw/",
    sourceClass: "Government agency",
    listed: "2026-09-17",
    holder: "District education office",
    witness: "Parent-teacher association",
    ask: "Where can residents inspect the procurement and delivery schedule for school materials in this district?",
    theme: "Education access",
    confidence: 0.71,
    importance: 0.77,
  },
  {
    id: "tza",
    title: "Inspect a rural clinic schedule",
    place: "Dodoma",
    country: "Tanzania",
    coords: [35.75, -6.17],
    layer: "health",
    description: "Find the regional health office and ask where residents can view the staffing and medicine availability schedule for a rural clinic.",
    source: "Tanzania Ministry of Health",
    url: "https://www.moh.go.tz/",
    sourceClass: "Government ministry",
    listed: "2026-09-19",
    holder: "Regional health management office",
    witness: "Community health workers",
    ask: "Where can residents view the staffing and medicine availability schedule for this clinic?",
    theme: "Health access",
    confidence: 0.67,
    importance: 0.81,
  },
  {
    id: "eth",
    title: "Locate a power restoration timeline",
    place: "Addis Ababa",
    country: "Ethiopia",
    coords: [38.75, 9.03],
    layer: "energy",
    description: "Find the utility office and ask where the public can view the expected restoration timeline after an outage.",
    source: "Ethiopian Electric Utility",
    url: "https://www.eep.gov.et/",
    sourceClass: "State utility",
    listed: "2026-09-16",
    holder: "Customer service office",
    witness: "Residents association",
    ask: "Where can residents view the expected power restoration timeline and report ongoing outages?",
    theme: "Energy & grids",
    confidence: 0.64,
    importance: 0.83,
  },
  {
    id: "cmr",
    title: "Trace a market price signal",
    place: "Douala",
    country: "Cameroon",
    coords: [9.7, 4.05],
    layer: "markets",
    description: "Find the trade and consumer office and ask where residents can view a staple-goods price series and report discrepancies.",
    source: "Cameroon Ministry of Trade",
    url: "https://www.mincommerce.gov.cm/",
    sourceClass: "Government ministry",
    listed: "2026-09-20",
    holder: "Regional trade office",
    witness: "Market vendors association",
    ask: "Where can residents view the published staple-goods price series and report discrepancies?",
    theme: "Market prices",
    confidence: 0.63,
    importance: 0.75,
  },
  {
    id: "uga",
    title: "Follow a land registry query",
    place: "Kampala",
    country: "Uganda",
    coords: [32.58, 0.35],
    layer: "resources",
    description: "Find the land registry office and ask where residents can inspect the status of a community land title query.",
    source: "Uganda Land Commission",
    url: "https://www.ulc.go.ug/",
    sourceClass: "Government commission",
    listed: "2026-09-18",
    holder: "District land registry",
    witness: "Community land committee",
    ask: "Where can residents inspect the status of a land title query and the expected response date?",
    theme: "Land & resources",
    confidence: 0.66,
    importance: 0.73,
  },
  {
    id: "civ",
    title: "Connect a service query to a date",
    place: "Brazzaville",
    country: "Republic of the Congo",
    coords: [15.28, -4.27],
    layer: "services",
    description: "Find the citizen service desk and ask where residents can submit a written request and receive a response date.",
    source: "Congo Ministry of Justice",
    url: "https://www justice.gouv.cg/",
    sourceClass: "Government ministry",
    listed: "2026-09-17",
    holder: "Citizen service desk",
    witness: "Community paralegal group",
    ask: "Where can residents submit a written service query and receive a written response date?",
    theme: "Service access",
    confidence: 0.61,
    importance: 0.71,
  },
];

export const SEED_FILES = [
  {
    id: "TRL-104",
    recordId: "gha",
    title: "Follow the community benefit",
    holder: "District assembly information desk",
    witness: "Community association",
    created: "2026-09-18",
    due: "2026-09-25",
    expires: "2026-10-02",
    answered: null,
    links: [],
  },
  {
    id: "TRL-108",
    recordId: "sen",
    title: "Make the next meeting accessible",
    holder: "Municipal information desk",
    witness: "Local youth association",
    created: "2026-09-16",
    due: "2026-09-20",
    expires: "2026-09-27",
    answered: "2026-09-20",
    links: [],
  },
  {
    id: "TRL-112",
    recordId: "eth",
    title: "Locate a power restoration timeline",
    holder: "Customer service office",
    witness: "Residents association",
    created: "2026-09-19",
    due: "2026-09-24",
    expires: "2026-10-01",
    answered: null,
    links: ["nga"],
  },
  {
    id: "TRL-115",
    recordId: "tza",
    title: "Inspect a rural clinic schedule",
    holder: "Regional health management office",
    witness: "Community health workers",
    created: "2026-09-20",
    due: "2026-09-26",
    expires: "2026-10-03",
    answered: null,
    links: [],
  },
];

export const STORAGE_KEY = "trail-files-v3";
export const recordById = (id) => RECORDS.find((r) => r.id === id);
export const placeLabel = (r) => `${r.place}, ${r.country}`;
export function dateLabel(date) {
  return new Date(`${date}T12:00:00Z`).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
  });
}
export function addDays(date, days) {
  const d = new Date(`${date}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}
export function stateAt(file, date) {
  if (date < file.created) return "Not yet opened";
  if (file.answered && date >= file.answered) return "Answered";
  if (date > file.expires) return "Expired unanswered";
  if (date > file.due) return "Overdue";
  return "Awaiting response";
}
export function validFile(f) {
  const iso = (value) =>
    typeof value === "string" &&
    /^20[2-9][0-9]-\d{2}-\d{2}$/.test(value) &&
    !isNaN(new Date(value).valueOf());
  return (
    f &&
    recordById(f.recordId) &&
    ["id", "title", "holder", "witness"].every(
      (k) =>
        typeof f[k] === "string" &&
        f[k].trim().length > 0 &&
        f[k].length <= 160,
    ) &&
    iso(f.created) &&
    iso(f.due) &&
    iso(f.expires) &&
    f.created <= f.due &&
    f.due < f.expires &&
    (f.answered === null || (iso(f.answered) && f.answered >= f.created)) &&
    Array.isArray(f.links) &&
    f.links.every((id) => recordById(id) && id !== f.recordId)
  );
}
export function loadFiles(storage) {
  try {
    const raw = storage.getItem(STORAGE_KEY);
    if (!raw) return structuredClone(SEED_FILES);
    const files = JSON.parse(raw);
    return Array.isArray(files) && files.every(validFile)
      ? files
      : structuredClone(SEED_FILES);
  } catch {
    return structuredClone(SEED_FILES);
  }
}
export function packetText(file, format, date) {
  const r = recordById(file.recordId);
  const header = `TRAIL · ILLUSTRATIVE DEMO FILE\n${file.id} · ${file.title}\nPlace: ${placeLabel(r)}\nProposed holder: ${file.holder}\nProposed witness: ${file.witness}\nResponse requested by: ${file.due}\nReview closes: ${file.expires}\nState at ${date}: ${stateAt(file, date)}\n`;
  const safety = "\nDEMO & SAFETY\nThis is an illustrative case, not a verified incident. No institution has been contacted. No personal locations collected.\n";
  const links = file.links.length
    ? `\nCONNECTED CONTEXT\n${file.links.map((id) => {
        const l = recordById(id);
        return `${l.title} — ${placeLabel(l)}`;
      }).join("\n")}\n`
    : "";
  if (format === "sms")
    return `${header}\n${r.ask} Please acknowledge by ${file.due}, quoting ${file.id}.${links}${safety}`;
  return `${header}\n01 · CHECK THE FACT\nReview the source. Verify locally.\n\n02 · PUT THE QUESTION IN THE RIGHT HANDS\n${r.ask}\n\n03 · KEEP TWO COPIES\nAsk a community witness to retain a copy.\n\n04 · COME BACK ON ${dateLabel(file.due).toUpperCase()}\nRecord a response, or follow up if unanswered. Silence never means resolved.${links}${safety}`;
}
