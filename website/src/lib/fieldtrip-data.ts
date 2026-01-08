// Field Trip Data extracted from Plan_Naxos fieldtrip_DENUCHANGE_20260107.odt
// Each stop has been verified with correct image mapping

export interface FieldTripStop {
  id: string
  name: string
  shortDescription: string
  fullDescription: string
  images: string[]
  lat: number
  lng: number
  order: number
}

export interface FieldTripDay {
  day: number
  date: string
  weekday: string
  theme: string
  stops: FieldTripStop[]
}

export const fieldTripDays: FieldTripDay[] = [
  {
    day: 1,
    date: "October 8, 2026",
    weekday: "Thursday",
    theme: "Inland",
    stops: [
      {
        id: "aplomata",
        name: "Aplomata",
        shortDescription: "Landslide hazard",
        fullDescription: "Details coming soon.",
        images: ["/images/fieldtrip/aplomata.jpeg"],
        lat: 37.108,
        lng: 25.377,
        order: 1,
      },
      {
        id: "faneromeni-dam",
        name: "Faneromeni Dam",
        shortDescription: "Details coming soon",
        fullDescription: "",
        images: ["/images/fieldtrip/faneromeni-dam-1.jpeg", "/images/fieldtrip/faneromeni-dam-2.jpeg"],
        lat: 37.1395,
        lng: 25.4721,
        order: 2,
      },
      {
        id: "kinidaros",
        name: "Kinidaros",
        shortDescription: "Forest fire impact & erosion",
        fullDescription: "This area has been affected by forest fires. Participants will discuss the impact of fires on the landscape and the resulting erosion processes.",
        images: ["/images/fieldtrip/kinidaros-1.jpeg", "/images/fieldtrip/kinidaros-2.jpeg"],
        lat: 37.1014,
        lng: 25.4791,
        order: 3,
      },
      {
        id: "apeiranthos",
        name: "Apeiranthos",
        shortDescription: "Geological Museum",
        fullDescription: "A small mountainous village in the center of Naxos. Participants will visit the Geological Museum for an introduction to the island's geological, geomorphological, and palaeogeographical history, including a virtual tour of an emery mine.",
        images: ["/images/fieldtrip/apeiranthos-1.jpeg", "/images/fieldtrip/apeiranthos-2.jpeg"],
        lat: 37.0718,
        lng: 25.5196,
        order: 4,
      },
    ],
  },
  {
    day: 2,
    date: "October 9, 2026",
    weekday: "Friday",
    theme: "Coastal",
    stops: [
      {
        id: "laguna",
        name: "Laguna",
        shortDescription: "Palaeogeography, tafoni & beachrocks",
        fullDescription: "Participants will explore the local geomorphology and palaeogeographical evolution of the area—during Antiquity this was a bay serving as a harbor for the temple of Dionysus at Yria. The stop features Naxos granodiorite with spectacular tafoni (honeycomb weathering), aeolianites with ancient quarry marks, and beachrocks that demonstrate nature-based coastal protection.",
        images: ["/images/fieldtrip/laguna.jpeg"],
        lat: 37.0872,
        lng: 25.3584,
        order: 5,
      },
      {
        id: "stelida",
        name: "Stelida",
        shortDescription: "Tafoni & weathering processes",
        fullDescription: "Details coming soon.",
        images: [],
        lat: 37.0832,
        lng: 25.3441,
        order: 6,
      },
      {
        id: "mikri-vigla",
        name: "Mikri Vigla",
        shortDescription: "Coastal protection & climate change",
        fullDescription: "Protection of coastal vulnerable environments. Climate change and sea level rise.",
        images: [],
        lat: 37.0279,
        lng: 25.3712,
        order: 7,
      },
      {
        id: "pyrgaki",
        name: "Pyrgaki",
        shortDescription: "Sand dunes",
        fullDescription: "Majestic sand dunes have formed around the beach, some reaching over 5 meters in height.",
        images: ["/images/fieldtrip/pyrgaki.jpeg"],
        lat: 36.9762,
        lng: 25.4026,
        order: 8,
      },
      {
        id: "alyko",
        name: "Alyko",
        shortDescription: "Pocket beach & cliff retreat",
        fullDescription: "A sandy pocket beach at the front of a steep coastal cliff. Participants will discuss coastal processes, cliff retreat, erosion rates, and survey methods including GNSS-RTK for topographic cross sections.",
        images: ["/images/fieldtrip/alyko.png"],
        lat: 36.9785,
        lng: 25.3908,
        order: 9,
      },
    ],
  },
]

// Flattened list of all stops for map display
export const allFieldStops = fieldTripDays.flatMap((day) =>
  day.stops.map((stop) => ({ ...stop, day: day.day }))
)
