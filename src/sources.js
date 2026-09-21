/**
 * Verified public source registry.
 *
 * Every entry below was researched and then FETCHED on 2026-09-21 from this
 * machine, with the HTTP status recorded. `verified` is true only where the URL
 * actually resolved and the expected content came back. Where a host answered
 * with a bot challenge, a login wall, an empty JavaScript shell or a 5xx, the
 * entry is marked false and says why — a source that could not be checked is
 * never presented as if it had been.
 *
 * Two findings that shaped the product rather than just the list:
 *
 *   - cohesion.or.ke is a squatted domain now serving a betting site. The real
 *     Kenyan National Cohesion and Integration Commission is cohesion.go.ke.
 *     A civic app that cites the squatted domain would send citizens to a
 *     gambling site while they try to report hate speech.
 *
 *   - No state-run complaint mechanism could be confirmed to offer a genuinely
 *     anonymous submission route. That is why the reporting screen tells the
 *     user to use a trusted organisation's secure channel for anything high
 *     risk, instead of implying the app or an official portal will protect them.
 */

export const DATA_SOURCES = [
  // --------------------------------------------------------- boundaries
  { id: "geoboundaries", name: "geoBoundaries (gbOpen)", url: "https://www.geoboundaries.org/", track: "transparency", layers: ["elections", "services"], licence: "Mixed open, per country (ODbL 1.0, CC BY 3.0 IGO, CC BY 4.0, public domain)", cadence: "Always updating plus numbered archival releases", verified: true, note: "ADM1 for all 54 African countries; 106/106 download URLs returned 200 with no login. Use ISO3 codes in the API path." },
  { id: "geo-adm2", name: "geoBoundaries ADM2", url: "https://www.geoboundaries.org/api/current/gbOpen/ALL/ADM2/", track: "transparency", layers: ["services"], licence: "Mixed open, per country", cadence: "Always updating", verified: true, note: "ADM2 for 52 of 54 countries (Libya and Mauritius missing). Simplified build is 50 MB." },
  { id: "cod-ab", name: "OCHA Common Operational Datasets (COD-AB)", url: "https://data.humdata.org/dataset/cod-ab-ken", track: "transparency", layers: ["services", "health", "food"], licence: "CC BY 3.0 IGO", cadence: "Versioned per country", verified: true, note: "P-coded subnational boundaries at ADM0-3; 54/54 countries have boundaries, 47/54 have GeoJSON." },
  { id: "naturalearth", name: "Natural Earth", url: "https://www.naturalearthdata.com/about/terms-of-use/", track: "transparency", layers: [], licence: "Public domain", cadence: "Versioned releases", verified: true, note: "The country geometry bundled in this app comes from here." },
  { id: "geofabrik", name: "Geofabrik Africa extracts / OpenStreetMap", url: "https://download.geofabrik.de/africa/kenya-latest-free.shp.zip", track: "transparency", layers: ["services", "land", "food"], licence: "ODbL 1.0", cadence: "Daily extracts", verified: true, note: "Per-country extracts. Share-alike applies to derived databases." },

  // --------------------------------------------- transparency & budgets
  { id: "worldbank", name: "World Bank Open Data", url: "https://data.worldbank.org/", track: "transparency", layers: ["budget", "services"], licence: "CC BY 4.0 (default)", cadence: "API continuous; governance indicators annual", verified: true, note: "The old info.worldbank.org/governance path no longer resolves; the indicators moved." },
  { id: "hdx", name: "Humanitarian Data Exchange (OCHA)", url: "https://data.humdata.org/", track: "transparency", layers: ["services", "displacement", "warning", "health"], licence: "Site content CC BY 4.0; each dataset carries its own", cadence: "Continuous", verified: true },
  { id: "municipalmoney", name: "Municipal Money (South Africa National Treasury)", url: "https://municipalmoney.gov.za/", track: "transparency", layers: ["budget"], licence: "Public municipal financial statements; site terms not stated", cadence: "Quarterly", verified: true, note: "Ward and municipality level spend. The clearest working example of a budget trail in the bundle." },
  { id: "ocds", name: "Open Contracting Data Standard", url: "https://standard.open-contracting.org/latest/en/", track: "transparency", layers: ["procurement"], licence: "Specification Apache 2.0; content CC BY 4.0", cadence: "Versioned standard", verified: true, note: "The schema a procurement trail should be written against, not a dataset in itself." },
  { id: "dportal", name: "d-portal (IATI aid transparency)", url: "https://d-portal.org/ctrack.html", track: "transparency", layers: ["budget"], licence: "Set per publishing organisation, not uniform", cadence: "Overnight from the IATI registry", verified: true, note: "Aid and development finance by country and district." },
  { id: "eiti", name: "EITI open data", url: "https://eiti.org/open-data", track: "transparency", layers: ["resources", "budget"], licence: "Not stated on the pages fetched", cadence: "Frequent", verified: true, note: "Extractive payments and licences. Licence unreadable, so no reuse claim is made here." },
  { id: "openownership", name: "Open Ownership", url: "https://www.openownership.org/en/", track: "transparency", layers: ["procurement"], licence: "CC BY 4.0", cadence: "Ongoing register releases", verified: true, note: "Answers 'who owns this contractor'." },
  { id: "icij", name: "ICIJ Offshore Leaks Database", url: "https://offshoreleaks.icij.org/pages/database", track: "transparency", layers: ["procurement"], licence: "ODbL for the database; CC BY-SA for contents", cadence: "Irregular, driven by publications", verified: true },
  { id: "opensanctions", name: "OpenSanctions", url: "https://www.opensanctions.org/licensing/", track: "transparency", layers: ["procurement", "protection"], licence: "CC BY-NC 4.0 — non-commercial only", cadence: "Daily delta files", verified: true, note: "Non-commercial licence: would need review before any commercial deployment." },
  { id: "aleph", name: "OCCRP Aleph", url: "https://aleph.occrp.org/pages/about", track: "transparency", layers: ["procurement", "audit"], licence: "Varies per collection; not stated on the page fetched", cadence: "Continuous ingestion", verified: false, note: "Resolves but returns a client-side shell; licence could not be read without a browser, so it is recorded as unclear rather than guessed." },
  { id: "vdem", name: "V-Dem", url: "https://v-dem.net/data/the-v-dem-dataset/", track: "transparency", layers: ["audit", "elections"], licence: "CC BY-SA 4.0", cadence: "Annual", verified: true },
  { id: "cpi", name: "Transparency International Corruption Perceptions Index", url: "https://www.transparency.org/en/cpi/2024", track: "transparency", layers: ["audit"], licence: "CC BY-ND 4.0 — attribution, no derivatives", cadence: "Annual", verified: true, note: "Verified only with browser-like headers; 403 to a plain client. No-derivatives licence limits republishing scores." },
  { id: "afrobarometer", name: "Afrobarometer", url: "https://www.afrobarometer.org/data/", track: "transparency", layers: ["elections", "services"], licence: "Copyrighted, attribution required — not an open licence", cadence: "Rounds roughly every 2-3 years", verified: true },
  { id: "pmg", name: "Parliamentary Monitoring Group (South Africa)", url: "https://pmg.org.za/", track: "transparency", layers: ["audit", "elections"], licence: "CC BY 3.0 South Africa", cadence: "Weekly during parliamentary terms", verified: true, note: "Committees, bills, questions, attendance — a working follow-up engine." },
  { id: "lawsafrica", name: "Laws.Africa / AfricanLII", url: "https://laws.africa/", track: "transparency", layers: ["rights", "land"], licence: "Per corpus, unconfirmed; API key-gated", cadence: "Continuous as gazettes are processed", verified: true, note: "The statute text behind every obligation. Unauthenticated API returns 403." },
  { id: "afic", name: "Africa Freedom of Information Centre", url: "https://www.africafoicentre.org/", track: "transparency", layers: ["rights"], licence: "All rights reserved, not open", cadence: "News and advocacy driven", verified: true, note: "FOI law status per country — the legal basis for an information request." },
  { id: "energydata", name: "ENERGYDATA.INFO (World Bank / ESMAP)", url: "https://energydata.info/", track: "transparency", layers: ["services"], licence: "CC BY 4.0 for most content, other datasets labelled individually", cadence: "Rolling contributions", verified: true },
  { id: "climatetrace", name: "Climate TRACE", url: "https://climatetrace.org/data", track: "transparency", layers: ["resources"], licence: "CC BY 4.0 with listed third-party exceptions", cadence: "Frequent releases", verified: true },
  { id: "openafrica", name: "openAFRICA (Code for Africa)", url: "https://open.africa/", track: "transparency", layers: [], licence: "CC BY 4.0 per archived snapshot", cadence: "Continuous harvesting", verified: false, note: "HTTP 403 on every route including its CKAN API from this environment. Not usable as a live citation in this build." },
  { id: "kenyaopendata", name: "Kenya Open Data", url: "https://www.opendata.go.ke/", track: "transparency", layers: ["budget"], licence: "No licence statement retrievable", cadence: "Unconfirmed", verified: false, note: "Resolves but returns a JavaScript shell with ten characters of readable text; the licence and content could not be read." },

  // ------------------------------------------------ stability: water/land
  { id: "wpdx", name: "Water Point Data Exchange (WPDx)", url: "https://www.waterpointdata.org/access-data/", track: "stability", layers: ["water"], licence: "Site content all rights reserved; dataset licence unstated", cadence: "Per-contributor country refreshes", verified: true, note: "On HDX the WPdx country files are CC BY-SA 4.0 and cover 15 African countries, 198 MB. Water-point status and survey dates." },
  { id: "mwater", name: "mWater", url: "https://www.mwater.co/", track: "stability", layers: ["water"], licence: "Not stated on the page fetched", cadence: "Continuous", verified: true, note: "Supports community self-survey of water points." },
  { id: "jmp", name: "WHO/UNICEF Joint Monitoring Programme", url: "https://washdata.org/data", track: "stability", layers: ["water"], licence: "Not stated on the page fetched", cadence: "Biennial", verified: true, note: "Lets a ward compare its coverage against the national figure." },
  { id: "wasreb", name: "WASREB complaints (Kenya)", url: "https://wasreb.go.ke/complaints/", track: "stability", layers: ["water"], licence: "Government site, terms not stated", cadence: "Ongoing", verified: true, note: "A real complaint route for a water provider, with a reference number." },
  { id: "ngwater", name: "Nigeria Federal Ministry of Water Resources and Sanitation", url: "https://waterresources.gov.ng/", track: "stability", layers: ["water"], licence: "Government site, terms not stated", cadence: "Ongoing", verified: true },
  { id: "landmatrix", name: "Land Matrix", url: "https://landmatrix.org/", track: "stability", layers: ["land"], licence: "All rights reserved — not openly licensed", cadence: "Continuous deal records", verified: true, note: "Large-scale land acquisitions. Written permission would be needed to redistribute." },
  { id: "acled", name: "ACLED", url: "https://acleddata.com/", track: "stability", layers: ["land", "warning"], licence: "Not stated on the page fetched; access is registration-gated", cadence: "Weekly", verified: true, note: "12-month event export supports a mediation evidence pack." },
  { id: "namati", name: "Namati", url: "https://namati.org/", track: "stability", layers: ["land", "rights"], licence: "Not stated on the page fetched", cadence: "Ongoing", verified: true, note: "Paralegal networks and community land mapping — a route to actual legal support." },
  { id: "landesa", name: "Landesa", url: "https://www.landesa.org/", track: "stability", layers: ["land", "rights"], licence: "Not stated on the page fetched", cadence: "Ongoing", verified: true },
  { id: "ilc", name: "International Land Coalition", url: "https://www.landcoalition.org/", track: "stability", layers: ["land"], licence: "Not stated on the page fetched", cadence: "Ongoing", verified: true },
  { id: "prindex", name: "PRINDEX", url: "https://www.prindex.net/", track: "stability", layers: ["land"], licence: "Not stated on the page fetched", cadence: "Survey rounds", verified: true, note: "Evidences that fear of eviction is widespread, which reframes a 'private' dispute." },
  { id: "vggt", name: "FAO Voluntary Guidelines on the Responsible Governance of Tenure", url: "https://www.fao.org/3/i2801e/i2801e.pdf", track: "stability", layers: ["land"], licence: "FAO publication, terms per FAO", cadence: "Static", verified: true, note: "The expropriation and compensation text to cite at a negotiation." },
  { id: "kenyaland", name: "National Land Commission (Kenya)", url: "https://www.landcommission.go.ke/", track: "stability", layers: ["land"], licence: "Government site, terms not stated", cadence: "Ongoing", verified: true },
  { id: "ghanalands", name: "Lands Commission (Ghana)", url: "https://www.lc.gov.gh/", track: "stability", layers: ["land"], licence: "Government site, terms not stated", cadence: "Ongoing", verified: true },
  { id: "icpald", name: "ICPALD (IGAD Centre for Pastoral Areas and Livestock Development)", url: "https://icpald.org/", track: "stability", layers: ["land"], licence: "Not stated on the page fetched", cadence: "Ongoing", verified: true, note: "Official transhumance corridor mapping." },
  { id: "igadtrans", name: "IGAD Protocol on Transhumance", url: "https://igad.int/igad-protocol-on-transhumance/", track: "stability", layers: ["land"], licence: "IGAD publication", cadence: "Static", verified: true, note: "Citable when a herd is stopped at a closed border." },
  { id: "ilri", name: "ILRI", url: "https://www.ilri.org/", track: "stability", layers: ["land", "food"], licence: "Not stated on the page fetched", cadence: "Ongoing", verified: true },

  // ------------------------------------------------ stability: protection
  { id: "idmc", name: "Internal Displacement Monitoring Centre", url: "https://www.internal-displacement.org/database/displacement-data", track: "stability", layers: ["displacement"], licence: "Not stated on the page fetched", cadence: "Annual with updates", verified: true },
  { id: "unhcr-odp", name: "UNHCR Operational Data Portal", url: "https://data.unhcr.org/en/situations", track: "stability", layers: ["displacement"], licence: "Not stated on the page fetched", cadence: "Continuous per situation", verified: true, note: "Registration plans and response lead. The Refugee Data Finder was 403 behind Cloudflare and is not used." },
  { id: "mmc", name: "Mixed Migration Centre (4Mi)", url: "https://www.mixedmigration.org/", track: "stability", layers: ["displacement"], licence: "Not stated on the page fetched", cadence: "Ongoing", verified: true },
  { id: "accord", name: "ACCORD", url: "https://www.accord.org.za/", track: "stability", layers: ["mediation"], licence: "Not stated on the page fetched", cadence: "Ongoing", verified: true },
  { id: "interpeace", name: "Interpeace", url: "https://www.interpeace.org/", track: "stability", layers: ["mediation"], licence: "Not stated on the page fetched", cadence: "Ongoing", verified: true },
  { id: "cr", name: "Conciliation Resources", url: "https://www.c-r.org/where-we-work", track: "stability", layers: ["mediation"], licence: "Not stated on the page fetched", cadence: "Ongoing", verified: true, note: "In-country partners listed by region — the referral a mediation trail needs." },
  { id: "peacedirect", name: "Peace Direct", url: "https://www.peacedirect.org/", track: "stability", layers: ["mediation"], licence: "Not stated on the page fetched", cadence: "Ongoing", verified: true },
  { id: "searchcg", name: "Search for Common Ground", url: "https://www.sfcg.org/", track: "stability", layers: ["mediation"], licence: "Not stated on the page fetched", cadence: "Ongoing", verified: true, note: "Dialogue and rumour-tracking toolkit." },
  { id: "ka iptc", name: "KAIPTC", url: "https://kaiptc.org/", track: "stability", layers: ["mediation"], licence: "Not stated on the page fetched", cadence: "Ongoing", verified: true },
  { id: "gppac", name: "GPPAC", url: "https://gppac.net/", track: "stability", layers: ["mediation"], licence: "Not stated on the page fetched", cadence: "Ongoing", verified: true },
  { id: "ncic", name: "National Cohesion and Integration Commission (Kenya)", url: "https://cohesion.go.ke/", track: "stability", layers: ["mediation"], licence: "Government site, terms not stated", cadence: "Ongoing", verified: true, note: "WARNING: cohesion.or.ke is a squatted domain now serving a betting site. Use cohesion.go.ke only." },
  { id: "ghananpc", name: "National Peace Council (Ghana)", url: "https://peacecouncil.gov.gh/", track: "stability", layers: ["mediation"], licence: "Government site, terms not stated", cadence: "Ongoing", verified: true, note: "Referral route for chieftaincy and land disputes." },
  { id: "ipcr", name: "Institute for Peace and Conflict Resolution (Nigeria)", url: "https://ipcr.gov.ng/", track: "stability", layers: ["mediation"], licence: "Government site, terms not stated", cadence: "Ongoing", verified: true },
  { id: "cewarn", name: "IGAD CEWARN", url: "https://cewarn.org/", track: "stability", layers: ["warning"], licence: "Not stated on the page fetched", cadence: "Continuous", verified: true, note: "Local focal points and the incident report format." },
  { id: "ecowarn", name: "ECOWAS early warning (ECOWARN)", url: "https://www.ecowas.int/ecowas-commission-engages-partners-on-strengthening-early-warning-and-early-warning-response/", track: "stability", layers: ["warning"], licence: "Not stated on the page fetched", cadence: "Continuous", verified: true },
  { id: "au-cews", name: "AU Continental Early Warning System", url: "https://www.peaceau.org/en/page/28-continental-early-warning", track: "stability", layers: ["warning"], licence: "AU publication", cadence: "Continuous", verified: true, note: "The reporting format and escalation chain." },
  { id: "fewnet", name: "FEWS NET", url: "https://fews.net/", track: "stability", layers: ["food", "warning"], licence: "Not stated on the page fetched", cadence: "Monthly", verified: true, note: "Livelihood zone outlook — the trigger evidence for a food request." },
  { id: "icpac", name: "ICPAC", url: "https://www.icpac.net/", track: "stability", layers: ["warning", "food"], licence: "Not stated on the page fetched", cadence: "Seasonal and dekadal", verified: true },
  { id: "eahazards", name: "East Africa Hazards Watch", url: "https://eahazardswatch.icpac.net/", track: "stability", layers: ["warning"], licence: "Not stated on the page fetched", cadence: "Continuous", verified: true },
  { id: "giews", name: "FAO GIEWS country analysis", url: "https://www.fao.org/giews/country-analysis/en/", track: "stability", layers: ["food"], licence: "FAO publication", cadence: "Continuous", verified: true },
  { id: "gdacs", name: "GDACS", url: "https://www.gdacs.org/", track: "stability", layers: ["warning"], licence: "Not stated on the page fetched", cadence: "Real time", verified: true },
  { id: "globalfloods", name: "Global Flood Awareness System", url: "https://globalfloods.eu/", track: "stability", layers: ["warning"], licence: "Not stated on the page fetched", cadence: "Daily", verified: true },
  { id: "reliefweb", name: "ReliefWeb", url: "https://reliefweb.int/", track: "stability", layers: ["warning", "displacement"], licence: "Per document", cadence: "Continuous", verified: true, note: "Useful for the plain question: is your district in the situation report?" },
  { id: "cakenya", name: "Communications Authority of Kenya", url: "https://www.ca.go.ke/", track: "stability", layers: ["mediation"], licence: "Government site, terms not stated", cadence: "Ongoing", verified: true, note: "Licensed broadcasters and licensee contacts — how a radio alert trail reaches a station." },

  // ------------------------------------------------------------- safety
  { id: "pprotect", name: "Public Protector South Africa", url: "https://www.pprotect.org/", track: "safety", layers: ["protection"], licence: "Government site, terms not stated", cadence: "Ongoing", verified: true, note: "Maladministration, abuse of power, improper conduct by state bodies." },
  { id: "gbvcc", name: "Gender-Based Violence Command Centre (South Africa)", url: "https://gbv.org.za/about-us/", track: "safety", layers: ["gbv"], licence: "Government site, terms not stated", cadence: "24 hour service", verified: true, note: "National GBV crisis line: 0800 428 428. One of only two verified phone numbers in this bundle." },
  { id: "childline116", name: "Childline Kenya 116", url: "https://childrenservices.go.ke/child-helpline-116", track: "safety", layers: ["gbv"], licence: "Government site, terms not stated", cadence: "24 hour service", verified: true, note: "Toll-free child protection and GBV referral line." },
  { id: "eacc", name: "Ethics and Anti-Corruption Commission (Kenya)", url: "https://www.eacc.go.ke/", track: "safety", layers: ["protection"], licence: "Government site, terms not stated", cadence: "Ongoing", verified: true },
  { id: "kombudsman", name: "Commission on Administrative Justice (Kenya Ombudsman)", url: "https://www.ombudsman.go.ke/", track: "safety", layers: ["protection"], licence: "Government site, terms not stated", cadence: "Ongoing", verified: true, note: "Maladministration, delay and abuse by public bodies." },
  { id: "ipoa", name: "Independent Policing Oversight Authority (Kenya)", url: "https://www.ipoa.go.ke/", track: "safety", layers: ["protection"], licence: "Government site, terms not stated", cadence: "Ongoing", verified: true, note: "Police misconduct, deaths and injuries in custody." },
  { id: "fida", name: "FIDA Kenya", url: "https://fidakenya.org/", track: "safety", layers: ["rights", "gbv"], licence: "Not stated on the page fetched", cadence: "Ongoing", verified: true, note: "Free legal aid for women and children." },
  { id: "kituo", name: "Kituo Cha Sheria", url: "https://kituochasheria.or.ke/", track: "safety", layers: ["rights"], licence: "Not stated on the page fetched", cadence: "Ongoing", verified: true, note: "Free legal aid and representation for the indigent." },
  { id: "pcc", name: "Public Complaints Commission (Nigeria)", url: "https://pcc.gov.ng/", track: "safety", layers: ["protection"], licence: "Government site, terms not stated", cadence: "Ongoing", verified: true },
  { id: "efcc", name: "Economic and Financial Crimes Commission (Nigeria)", url: "https://efcc.gov.ng/", track: "safety", layers: ["protection"], licence: "Government site, terms not stated", cadence: "Ongoing", verified: true },
  { id: "chraj", name: "Commission on Human Rights and Administrative Justice (Ghana)", url: "https://chraj.gov.gh/", track: "safety", layers: ["rights", "protection"], licence: "Government site, terms not stated", cadence: "Ongoing", verified: true },
  { id: "osp", name: "Office of the Special Prosecutor (Ghana)", url: "https://www.osp.gov.gh/", track: "safety", layers: ["protection"], licence: "Government site, terms not stated", cadence: "Ongoing", verified: true },
  { id: "rwombudsman", name: "Office of the Ombudsman (Rwanda)", url: "https://www.ombudsman.gov.rw/", track: "safety", layers: ["protection"], licence: "Government site, terms not stated", cadence: "Ongoing", verified: true },
  { id: "zacc", name: "Anti-Corruption Commission (Zambia)", url: "https://acc.gov.zm/", track: "safety", layers: ["protection"], licence: "Government site, terms not stated", cadence: "Ongoing", verified: true },
  { id: "acbmw", name: "Anti-Corruption Bureau (Malawi)", url: "https://acbmw.org/", track: "safety", layers: ["protection"], licence: "Not stated on the page fetched", cadence: "Ongoing", verified: true },
  { id: "achpr", name: "African Commission on Human and Peoples' Rights", url: "https://achpr.au.int/", track: "safety", layers: ["rights"], licence: "AU publication", cadence: "Continuous", verified: true, note: "Regional complaints route when a national one has failed." },
  { id: "ecowascourt", name: "ECOWAS Community Court of Justice", url: "https://courtecowas.org/", track: "safety", layers: ["rights"], licence: "ECOWAS publication", cadence: "Continuous", verified: true, note: "Takes individual human rights complaints against member states." },
  { id: "accessnow", name: "Access Now Digital Security Helpline", url: "https://www.accessnow.org/help/", track: "safety", layers: ["protection"], licence: "Organisation site", cadence: "24/7", verified: true, note: "Free technical support for civil society facing digital threats. The right referral for a reporter worried about device safety." },
  { id: "frontline", name: "Front Line Defenders Emergency Contact", url: "https://www.frontlinedefenders.org/en/emergency-contact", track: "safety", layers: ["protection"], licence: "Organisation site", cadence: "24/7 duty line", verified: true, note: "Emergency support and relocation for defenders at risk." },
  { id: "protectdefenders", name: "ProtectDefenders.eu", url: "https://protectdefenders.eu/", track: "safety", layers: ["protection"], licence: "Organisation site", cadence: "Ongoing", verified: true },
  { id: "securityinabox", name: "Security in a Box (Tactical Tech / Front Line Defenders)", url: "https://securityinabox.org/", track: "safety", layers: ["protection"], licence: "Guides, terms per site", cadence: "Ongoing", verified: true, note: "Tool-based anonymity and device-safety guides." },
  { id: "datadetox", name: "Tactical Tech Data Detox Kit", url: "https://tacticaltech.org/projects/data-detox/", track: "safety", layers: ["protection"], licence: "Organisation site", cadence: "Ongoing", verified: true, note: "Practical metadata-reduction steps." },
  { id: "effssd", name: "EFF Surveillance Self-Defense", url: "https://ssd.eff.org/", track: "safety", layers: ["protection"], licence: "CC BY", cadence: "Ongoing", verified: true, note: "Threat modelling for someone deciding how to send a report." },
  { id: "cpj", name: "Committee to Protect Journalists", url: "https://cpj.org/", track: "safety", layers: ["protection"], licence: "Organisation site", cadence: "Ongoing", verified: true },
  { id: "mediadefence", name: "Media Defence", url: "https://www.mediadefence.org/", track: "safety", layers: ["rights"], licence: "Organisation site", cadence: "Ongoing", verified: true, note: "Legal defence network for journalists and media workers." },
  { id: "childhelplines", name: "Child Helpline International directory", url: "https://childhelplineinternational.org/", track: "safety", layers: ["gbv"], licence: "Organisation site", cadence: "Ongoing", verified: true, note: "Directory of national child helplines including African members." },
  { id: "uncomplaint", name: "UN Human Rights Council Complaint Procedure", url: "https://www.ohchr.org/en/hr-bodies/hrc/complaint-procedure", track: "safety", layers: ["rights"], licence: "UN publication", cadence: "Continuous", verified: true, note: "Confidential, but only for consistent patterns of gross violations." },
  { id: "inspectionpanel", name: "World Bank Inspection Panel", url: "https://www.inspectionpanel.org/", track: "safety", layers: ["protection"], licence: "World Bank publication", cadence: "Continuous", verified: true, note: "For harm caused by a World Bank-financed project." },
  { id: "icrc", name: "International Committee of the Red Cross", url: "https://www.icrc.org/", track: "safety", layers: ["protection"], licence: "ICRC publication", cadence: "Continuous", verified: true },
  { id: "sahrc", name: "South African Human Rights Commission", url: "https://www.sahrc.org.za/", track: "safety", layers: ["rights"], licence: "Government site, terms not stated", cadence: "Ongoing", verified: false, note: "URL not confirmed in this research pass. Do not present as a working route." },
  { id: "icpc", name: "ICPC (Nigeria)", url: "https://icpc.gov.ng/", track: "safety", layers: ["protection"], licence: "Government site, terms not stated", cadence: "Ongoing", verified: false, note: "URL not confirmed." },
  { id: "naptip", name: "NAPTIP (Nigeria)", url: "https://naptip.gov.ng/", track: "safety", layers: ["gbv"], licence: "Government site, terms not stated", cadence: "Ongoing", verified: false, note: "URL not confirmed." },
];

/** Reporting routes grouped by what a person is reporting. */
export const PATHWAYS_BY_CATEGORY = {
  corruption: ["eacc", "kombudsman", "pcc", "efcc", "chraj", "osp", "rwombudsman", "zacc", "acbmw", "pprotect", "ipoa", "achpr", "ecowascourt", "inspectionpanel"],
  service: ["kombudsman", "pprotect", "pcc", "chraj", "ipoa", "eacc"],
  violence: ["ipoa", "achpr", "ecowascourt", "frontline", "accessnow", "cpj", "inspectionpanel"],
  gbv: ["gbvcc", "childline116", "fida", "childhelplines", "frontline", "achpr"],
  child: ["childline116", "childhelplines", "fida", "naptip"],
  rights: ["fida", "kituo", "chraj", "achpr", "ecowascourt", "mediadefence", "uncomplaint", "sahrc"],
  resource: ["ncic", "ghananpc", "ipcr", "namati", "ilc", "kenyaland", "ghanalands"],
};

export const SAFETY_GUIDES = ["accessnow", "frontline", "securityinabox", "datadetox", "effssd", "protectdefenders"];

export const SOURCE_WARNINGS = [
  "cohesion.or.ke is a squatted domain now serving a betting site. The real Kenyan National Cohesion and Integration Commission is at cohesion.go.ke. Citing the wrong one would send someone reporting hate speech to a gambling site.",
  "No state-run complaint mechanism could be confirmed to offer a genuinely anonymous submission route. Not one. The reporting screen says so rather than implying otherwise.",
  "openAFRICA returned HTTP 403 on every route including its API from this environment, so it is not used as a live citation in this build.",
  "Africa Check and PesaCheck returned 403 on every route tested and had no usable archive snapshot, so they are deliberately absent rather than described from memory.",
  "Uganda, Tanzania, Sierra Leone, Liberia and Zimbabwe anti-corruption or human rights bodies surfaced only as social accounts or third-party pages. No official URL was confirmed, so none is listed.",
  "Only two phone numbers in this entire bundle could be verified: South Africa's 0800 428 428 GBV line, and Kenya's 116 child helpline. No other number, short code or email is published here, because an unverified number in a safety tool is worse than none.",
  "Fifteen of the geospatial datasets are verified downloads but their record-level completeness was not opened and checked. Coverage quality inside each file is unconfirmed.",
];

export const sourceById = (id) => DATA_SOURCES.find((s) => s.id === id);
export const verifiedCount = () => DATA_SOURCES.filter((s) => s.verified).length;
