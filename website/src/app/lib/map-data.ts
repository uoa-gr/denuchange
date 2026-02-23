// Static Points of Interest for the Naxos attendee map

export type PoiCategory =
  | "venue"
  | "field_trip"
  | "hotel"
  | "transport"
  | "beach"
  | "restaurant"

export interface PoI {
  id: string
  name: string
  category: PoiCategory
  lat: number
  lng: number
  description: string
  mapsUrl: string
}

function gmap(lat: number, lng: number) {
  return `https://maps.google.com/?q=${lat},${lng}`
}

export const POI_CATEGORY_LABELS: Record<PoiCategory, string> = {
  venue: "Conference Venue",
  field_trip: "Field Trip",
  hotel: "Hotel",
  transport: "Transport",
  beach: "Beach",
  restaurant: "Restaurants & Cafés",
}

export const POI_CATEGORY_COLORS: Record<PoiCategory, string> = {
  venue: "#074F6A",
  field_trip: "#355e3b",
  hotel: "#7c3aed",
  transport: "#d97706",
  beach: "#0ea5e9",
  restaurant: "#e11d48",
}

export const pois: PoI[] = [
  // --- Venue ---
  {
    id: "venue-tbd",
    name: "Conference Venue (TBD)",
    category: "venue",
    lat: 37.1065,
    lng: 25.38,
    description: "Main conference venue for the IAG DENUCHANGE Workshop 2026. Location to be confirmed.",
    mapsUrl: gmap(37.1065, 25.38),
  },

  // --- Hotels ---
  {
    id: "hotel-princess-naxos",
    name: "Princess of Naxos",
    category: "hotel",
    lat: 37.108,
    lng: 25.3736,
    description: "Recommended workshop hotel. Use code DENUCHANGE2026 for a discount.",
    mapsUrl: gmap(37.108, 25.3736),
  },
  {
    id: "hotel-princess-mare",
    name: "Princess Mare",
    category: "hotel",
    lat: 37.1052,
    lng: 25.3721,
    description: "Recommended workshop hotel. Use code DENUCHANGE2026 for a discount.",
    mapsUrl: gmap(37.1052, 25.3721),
  },
  {
    id: "hotel-grotta",
    name: "Hotel Grotta",
    category: "hotel",
    lat: 37.1083,
    lng: 25.3721,
    description: "Recommended workshop hotel near Naxos town. Use code DENUCHANGE2026 for a discount.",
    mapsUrl: gmap(37.1083, 25.3721),
  },

  // --- Transport ---
  {
    id: "port-naxos",
    name: "Naxos Port (Ferry Terminal)",
    category: "transport",
    lat: 37.1065,
    lng: 25.3741,
    description:
      "Main ferry terminal. Blue Star Ferries (~5-6h from Piraeus), SeaJets / Hellenic Seaways high-speed (~3-4h).",
    mapsUrl: gmap(37.1065, 25.3741),
  },
  {
    id: "airport-jnx",
    name: 'Naxos Airport "Apollo" (JNX)',
    category: "transport",
    lat: 37.0817,
    lng: 25.3682,
    description:
      "Regional airport. Sky Express & Aegean Airlines from ATH (~35 min). ~3 km from Naxos town.",
    mapsUrl: gmap(37.0817, 25.3682),
  },

  // --- Beaches ---
  {
    id: "beach-agios-georgios",
    name: "Agios Georgios Beach",
    category: "beach",
    lat: 37.1012,
    lng: 25.3658,
    description: "Town beach of Naxos — easy walk from the old town. Sandy, shallow, good for swimming.",
    mapsUrl: gmap(37.1012, 25.3658),
  },
  {
    id: "beach-agios-prokopios",
    name: "Agios Prokopios Beach",
    category: "beach",
    lat: 37.0869,
    lng: 25.3545,
    description: "One of the most popular beaches on Naxos. Fine white sand, crystal-clear water.",
    mapsUrl: gmap(37.0869, 25.3545),
  },
  {
    id: "beach-agia-anna",
    name: "Agia Anna Beach",
    category: "beach",
    lat: 37.0746,
    lng: 25.3508,
    description: "Beautiful quiet beach south of Agios Prokopios, with traditional tavernas nearby.",
    mapsUrl: gmap(37.0746, 25.3508),
  },
  {
    id: "beach-plaka",
    name: "Plaka Beach",
    category: "beach",
    lat: 37.056,
    lng: 25.354,
    description: "Long, unspoiled sandy beach with dunes — a favourite for windsurfers.",
    mapsUrl: gmap(37.056, 25.354),
  },

  // --- Field Trip Stops (Day 1 – Inland) ---
  {
    id: "ft-apeiranthos",
    name: "Apeiranthos",
    category: "field_trip",
    lat: 37.0718,
    lng: 25.5196,
    description:
      "Day 1 – Stop 1. Mountains under climate pressure. Includes a visit to the geological museum.",
    mapsUrl: gmap(37.0718, 25.5196),
  },
  {
    id: "ft-faneromeni-dam",
    name: "Faneromeni Dam",
    category: "field_trip",
    lat: 37.1395,
    lng: 25.4721,
    description: "Day 1 – Stop 2. Water balance in a changing climate. Drought & water scarcity study.",
    mapsUrl: gmap(37.1395, 25.4721),
  },
  {
    id: "ft-kinidaros",
    name: "Kinidaros",
    category: "field_trip",
    lat: 37.1014,
    lng: 25.4791,
    description: "Day 1 – Stop 3. Forest fire impact on erosion and runoff.",
    mapsUrl: gmap(37.1014, 25.4791),
  },
  {
    id: "ft-aplomata",
    name: "Aplomata",
    category: "field_trip",
    lat: 37.108,
    lng: 25.377,
    description: "Day 1 – Stop 4. Landslide risk and climate-driven hazards.",
    mapsUrl: gmap(37.108, 25.377),
  },
  // --- Field Trip Stops (Day 2 – Coastal) ---
  {
    id: "ft-laguna",
    name: "Lagoon – Manto",
    category: "field_trip",
    lat: 37.0872,
    lng: 25.3584,
    description: "Day 2 – Stop 5. Coastal lagoons, NbS, sand dynamics, beachrocks.",
    mapsUrl: gmap(37.0872, 25.3584),
  },
  {
    id: "ft-stelida",
    name: "Stelida Tafone",
    category: "field_trip",
    lat: 37.0832,
    lng: 25.3441,
    description: "Day 2 – Stop 6. Tafoni, weathering, coastal dynamics.",
    mapsUrl: gmap(37.0832, 25.3441),
  },
  {
    id: "ft-mikri-vigla",
    name: "Mikri Vigla",
    category: "field_trip",
    lat: 37.0279,
    lng: 25.3712,
    description: "Day 2 – Stop 7. Coastal vulnerability and climate adaptation.",
    mapsUrl: gmap(37.0279, 25.3712),
  },
  {
    id: "ft-pyrgaki",
    name: "Pyrgaki Sand Dunes",
    category: "field_trip",
    lat: 36.9762,
    lng: 25.4026,
    description: "Day 2 – Stop 8. Fluvial/aeolian sand dynamics and dune stability.",
    mapsUrl: gmap(36.9762, 25.4026),
  },
  {
    id: "ft-alyko",
    name: "Alyko Pocket Beach",
    category: "field_trip",
    lat: 36.9785,
    lng: 25.3908,
    description: "Day 2 – Stop 9. Cliff erosion, sediment transport, beach retreat.",
    mapsUrl: gmap(36.9785, 25.3908),
  },

  // --- Restaurants & Cafés (Naxos Town) ---
  {
    id: "rest-placeholder",
    name: "Restaurants & Cafés",
    category: "restaurant",
    lat: 37.106,
    lng: 25.376,
    description:
      "Naxos old town has many excellent tavernas. Explore the Chora area for fresh seafood and local Naxian cuisine.",
    mapsUrl: "https://maps.google.com/?q=restaurants+naxos+town+greece",
  },
]
