// DENUCHANGE Workshop Event Data
// Centralized data for the website content

export const eventData = {
  name: "IAG DENUCHANGE Workshop",
  tagline: "Denudation and Environmental Changes in Different Morphoclimatic Zones",
  dates: {
    workshop: "6-7 October 2026",
    fieldTrip: "8-9 October 2026",
    full: "6-9 October 2026",
  },
  location: {
    venue: "Naxos",
    country: "Greece",
    region: "Cyclades, Aegean Sea",
  },
  deadlines: [
    { label: "Abstract Submission", date: "13 June 2026" },
    { label: "Author Notifications", date: "15 June 2026" },
    { label: "Registration Deadline", date: "15 July 2026" },
  ],
  registration: {
    formUrl: "https://forms.gle/Nz7TP2rviNwt8k437",
    fees: [
      { type: "Regular (Full)", price: 450, description: "2 days meeting + 2 days field trip" },
      { type: "Student (Full)", price: 300, description: "2 days meeting + 2 days field trip" },
      { type: "Meeting Only", price: 100, description: "2 days meeting only" },
      { type: "Accompanying Person", price: 300, description: "Field trip only" },
    ],
    includes: [
      "Meeting materials",
      "Coffee breaks and lunches (6-7 Oct)",
      "Workshop Dinner (7 Oct)",
      "2-day field trip (full fee only)",
    ],
  },
  abstractSubmission: {
    wordLimit: 500,
    language: "English",
    format: "Calibri font, size 11",
    fileNaming: "Surname_Name_Topic.docx",
    presentationTypes: ["Oral", "Poster"],
  },
  aims: [
    "Advance understanding of denudation processes including weathering, erosion, and mass movements",
    "Study coastal and terrestrial environments",
    "Analyze drivers, rates, diversity and variability worldwide",
    "Facilitate future collaborations among geoscientists",
  ],
  fieldTrip: {
    dates: "8-9 October 2026",
    focus: "Critical continuum between catchment dynamics and coastal evolution",
    themes: [
      "Land degradation and desertification drivers",
      "Geomorphological footprint of forest fires",
      "Runoff erosion processes",
      "Agricultural terraces and dams impact on sediment budgets",
      "Hydro-geomorphological hazards",
      "Nature-based Solutions (NbS) for climate adaptation",
    ],
    locations: [
      "Aplomata", "Faneromeni Dam", "Kinidaros", "Apeiranthos",
      "Laguna", "Stelida", "Mikri Vigla", "Pyrgaki", "Alyko"
    ],
  },
  committees: {
    organizing: [
      { name: "Prof. Niki Evelpidou", affiliation: "Department of Geology & Geoenvironment, NKUA" },
      { name: "Prof. Assimina Antonarakou", affiliation: "Department of Geology & Geoenvironment, NKUA" },
      { name: "Dr. Anna Karkani", affiliation: "Department of Geology & Geoenvironment, NKUA" },
      { name: "Dr. Giannis Saitis", affiliation: "Department of Geology & Geoenvironment, NKUA" },
    ],
    scientific: [
      { name: "Dr. Achim A. Beylich", affiliation: "Geomorphological Field Laboratory (GFL), Norway" },
      { name: "Prof. Niki Evelpidou", affiliation: "NKUA, Greece" },
      { name: "Dr. Anna Karkani", affiliation: "NKUA, Greece" },
      { name: "Dr. Eliza Płaczkowska", affiliation: "University of Wrocław, Poland" },
      { name: "Prof. Nurit Shtober-Zisu", affiliation: "University of Haifa, Israel" },
      { name: "Prof. Zbigniew Zwoliński", affiliation: "Adam Mickiewicz University, Poland" },
    ],
  },
  contact: {
    email: "evelpidou@geol.uoa.gr",
    organization: "National & Kapodistrian University of Athens",
    department: "Department of Geology & Geoenvironment",
  },
} as const;

export type EventData = typeof eventData;
