export const LAYERS = [
  { id: "services", name: "Public services", color: "#b56e50" },
  { id: "resources", name: "Land & resources", color: "#748771" },
  { id: "participation", name: "Civic participation", color: "#ac965b" },
];
export const RECORDS = [
  {
    id: "mak",
    title: "A clearer route to water access",
    place: "Makueni County",
    country: "Kenya",
    coords: [37.62, -1.8],
    layer: "services",
    description:
      "A community water point needs a clear maintenance contact. Connect the service question to the county water office and ask for a dated response.",
    source: "Makueni County Government",
    url: "https://makueni.go.ke/",
    sourceClass: "Government portal",
    listed: "2026-09-19",
    holder: "County water services office",
    witness: "Community water committee",
    ask: "Who is responsible for this water point, and when can the community expect a maintenance update?",
    theme: "Water & sanitation",
  },
  {
    id: "gha",
    title: "Follow the community benefit",
    place: "Tarkwa",
    country: "Ghana",
    coords: [-1.99, 5.3],
    layer: "resources",
    description:
      "Follow a community benefit question from a mining-affected locality to the district assembly. Ask where the allocation is published and when residents can take part.",
    source: "Ghana Minerals Commission",
    url: "https://www.mincom.gov.gh/",
    sourceClass: "Public regulator",
    listed: "2026-09-17",
    holder: "District assembly information desk",
    witness: "Community association",
    ask: "Where can residents view the community benefit allocation and the next public consultation date?",
    theme: "Community benefit",
  },
  {
    id: "sen",
    title: "Make the next meeting accessible",
    place: "Dakar",
    country: "Senegal",
    coords: [-17.45, 14.69],
    layer: "participation",
    description:
      "Ask for the date, venue and accessible participation arrangements for a local public meeting. Make room for questions before the meeting begins.",
    source: "Senegal public services portal",
    url: "https://www.servicepublic.gouv.sn/",
    sourceClass: "Government portal",
    listed: "2026-09-18",
    holder: "Municipal information desk",
    witness: "Local youth association",
    ask: "When is the next public meeting, and how can residents submit a question in advance?",
    theme: "Citizen participation",
  },
  {
    id: "nga",
    title: "Find the right service desk",
    place: "Abuja",
    country: "Nigeria",
    coords: [7.49, 9.06],
    layer: "services",
    description:
      "Turn a confusing public-service route into a written request for the right office, required documents and a response date.",
    source: "SERVICOM",
    url: "https://servicom.gov.ng/",
    sourceClass: "Government service office",
    listed: "2026-09-20",
    holder: "Service improvement desk",
    witness: "Residents association",
    ask: "Which desk holds this service request, what documents are required, and what is the expected response time?",
    theme: "Service accountability",
  },
  {
    id: "drc",
    title: "Put a land question on record",
    place: "Kolwezi",
    country: "DR Congo",
    coords: [25.47, -10.72],
    layer: "resources",
    description:
      "Request a public consultation record and a named office for a community land question. No household or personal locations are collected.",
    source: "DRC Ministry of Mines",
    url: "https://mines.gouv.cd/",
    sourceClass: "Government portal",
    listed: "2026-09-15",
    holder: "Provincial information office",
    witness: "Community liaison group",
    ask: "Which public consultation record covers this area, and who can provide a written response to residents?",
    theme: "Land & resources",
  },
  {
    id: "moz",
    title: "A place in the local conversation",
    place: "Maputo",
    country: "Mozambique",
    coords: [32.57, -25.97],
    layer: "participation",
    description:
      "Ask for an inclusive way to join a local civic meeting, including an offline option for residents without internet access.",
    source: "Mozambique Government",
    url: "https://www.portaldogoverno.gov.mz/",
    sourceClass: "Government portal",
    listed: "2026-09-16",
    holder: "Municipal citizen service office",
    witness: "Women-led community group",
    ask: "How can residents contribute to the next civic meeting by paper or through a community representative?",
    theme: "Inclusive participation",
  },
  {
    id: "zaf",
    title: "Know the next step for a request",
    place: "Johannesburg",
    country: "South Africa",
    coords: [28.05, -26.2],
    layer: "services",
    description:
      "Attach a service query to a named municipal desk. Ask for an acknowledgement, a reference number and a clear next step.",
    source: "City of Johannesburg",
    url: "https://www.joburg.org.za/",
    sourceClass: "Municipal portal",
    listed: "2026-09-20",
    holder: "Municipal service centre",
    witness: "Ward community forum",
    ask: "Please acknowledge this service query, provide a reference number and confirm the next response date.",
    theme: "Public services",
  },
  {
    id: "ken",
    title: "Connect a budget to a service",
    place: "Nairobi",
    country: "Kenya",
    coords: [36.82, -1.29],
    layer: "participation",
    description:
      "Locate the public-budget information desk and ask where residents can inspect a service allocation and give feedback.",
    source: "Kenya National Treasury",
    url: "https://www.treasury.go.ke/",
    sourceClass: "Government portal",
    listed: "2026-09-18",
    holder: "Public participation information desk",
    witness: "Budget accountability group",
    ask: "Where is the published allocation for this service, and how can residents submit feedback?",
    theme: "Budget participation",
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
];
export const STORAGE_KEY = "trail-files-v2";
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
    /^2026-\d{2}-\d{2}$/.test(value) &&
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
  const header = `TRAIL · ILLUSTRATIVE DEMO FILE\n${file.id} · ${file.title}\nPlace: ${placeLabel(r)}\nProposed holder: ${file.holder}\nProposed witness: ${file.witness}\nResponse requested by: ${file.due} (not a statutory deadline)\nReview closes: ${file.expires} (demo rule: due + 7 days)\nState at ${date}: ${stateAt(file, date)}\n`;
  const safety =
    "\nDEMO & SAFETY\nThis is an illustrative case, not a verified incident. No institution has been contacted; no holder or witness has accepted. Do not include sensitive information or personal locations. No live SMS number or USSD shortcode is provisioned. Files stay in this browser.\n";
  const source = `\nSOURCE & LIMITS\n${r.source} — ${r.url}\nClass: ${r.sourceClass}\nListed: ${r.listed} (demo timeline)\nFetched at: not fetched\nLast verified: unknown; no independent verification performed.\nThe portal is a research starting point, not evidence for this case.\n`;
  const links = file.links.length
    ? `\nCONNECTED CONTEXT (not corroboration)\n${file.links
        .map((id) => {
          const l = recordById(id);
          return `${l.title} — ${placeLabel(l)}\n${l.url}`;
        })
        .join("\n")}\n`
    : "";
  if (format === "sms")
    return `${header}\nHOLDER MESSAGE\n${r.ask} Please acknowledge and reply by ${file.due}, quoting ${file.id}.\n\nCHECK-IN TEMPLATE\nSTATUS ${file.id}\n\nUSSD FLOW — SIMULATION ONLY\nLocal civic service → Check a file → Enter receipt → Read holder, due date and state.\nNo real shortcode exists. Use the in-app receipt search to check this device’s copy.\n${source}${links}${safety}`;
  if (format === "radio")
    return `${header}\nRADIO / MEETING SCRIPT\n“Residents of ${placeLabel(r)}: we have a question about ${r.theme.toLowerCase()}. ${r.ask} The proposed holder is ${file.holder}. We request a response by ${dateLabel(file.due)}. The proposed witness is ${file.witness}. At the next community meeting, quote ${file.id} to follow up.”\n\nAdapt with a local-language speaker before use. Do not broadcast names of affected individuals.\n${source}${links}${safety}`;
  return `${header}\n01 · CHECK THE FACT\nReview the source and its limits below. Ask a local facilitator to check the appropriate office and procedures.\n\n02 · PUT THE QUESTION IN THE RIGHT HANDS\n${r.ask}\nAsk the proposed holder to acknowledge the request. A role listed here is not an accepted assignment.\n\n03 · KEEP TWO COPIES\nAsk a community witness to retain a copy. Keep this receipt.\n\n04 · COME BACK ON ${dateLabel(file.due).toUpperCase()}\nRecord a response, or follow up if unanswered. Silence never means resolved.\n\nHOLDER ACKNOWLEDGEMENT / DATE\n__________________________________________________\n\nWITNESS ACKNOWLEDGEMENT / DATE\n__________________________________________________\n\nRESPONSE / NEXT STEP\n__________________________________________________\n__________________________________________________\n${source}${links}${safety}`;
}
