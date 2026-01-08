// Field Trip Data - IAG DENUCHANGE Workshop Naxos 2026
// Note: The detailed program will be announced closer to the event

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
        id: "apeiranthos",
        name: "Apeiranthos: Mountains Under the Pressure of Climate",
        shortDescription: "Geology, geomorphology & climate change",
        fullDescription: "Examine how geology and geomorphology, together with climate change, transform mountain landscapes and the lives of local communities. The stop includes a visit to the geological museum to connect theory with real-world examples.",
        images: ["/images/fieldtrip/apeiranthos-1.jpeg", "/images/fieldtrip/apeiranthos-2.jpeg"],
        lat: 37.0718,
        lng: 25.5196,
        order: 1,
      },
      {
        id: "faneromeni-dam",
        name: "Faneromeni Dam: Water Balance in a Changing Climate",
        shortDescription: "Drought, water scarcity & freshwater resources",
        fullDescription: "Discover the challenges of small watersheds under reduced rainfall and growing water demand in tourist regions. Learn how drought, water scarcity, and climate change shape the availability of freshwater resources.",
        images: ["/images/fieldtrip/faneromeni-dam-1.jpeg", "/images/fieldtrip/faneromeni-dam-2.jpeg"],
        lat: 37.1395,
        lng: 25.4721,
        order: 2,
      },
      {
        id: "kinidaros",
        name: "Kinidaros: How Forest Fires Shape Runoff and Erosion",
        shortDescription: "Fire, soils, aquifers & flood risk",
        fullDescription: "Understand why forest fires spread more easily under climate stress and how they trigger a vicious cycle affecting soils, aquifers, and flood risk. See firsthand how fire reshapes the landscape and impacts water flow.",
        images: ["/images/fieldtrip/kinidaros-1.jpeg", "/images/fieldtrip/kinidaros-2.jpeg"],
        lat: 37.1014,
        lng: 25.4791,
        order: 3,
      },
      {
        id: "aplomata",
        name: "Aplomata: Climate Change and Landslide Risk",
        shortDescription: "Geology, rainfall patterns & hazards",
        fullDescription: "Explore how the local geology and landscape morphology, combined with intensifying rainfall patterns, increase the likelihood of landslides. This stop highlights climate-driven hazards.",
        images: ["/images/fieldtrip/aplomata.jpeg"],
        lat: 37.108,
        lng: 25.377,
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
        name: "Lagoon – Manto: Upstream Forces, Coastal Futures",
        shortDescription: "Nature-based solutions & dune restoration",
        fullDescription: "Explore how upstream geomorphology and human pressures shape coastal lagoons over time. The session highlights nature-based solutions for beach protection, dune restoration, and CO₂ mitigation, linking sand dynamics to climate change and coastal pressures.",
        images: ["/images/fieldtrip/laguna.jpeg"],
        lat: 37.0872,
        lng: 25.3584,
        order: 5,
      },
      {
        id: "stelida",
        name: "Stelida Tafone: Weathering and Coastal Change",
        shortDescription: "Rock decay, cliffs & sediments",
        fullDescription: "Examine how weathering processes in the hinterland drive landscape evolution and affect the adjacent coast. Learn how rock decay shapes cliffs and sediments, connecting geomorphology to coastal dynamics under climate stress.",
        images: [],
        lat: 37.0832,
        lng: 25.3441,
        order: 6,
      },
      {
        id: "mikri-vigla",
        name: "Mikri Vigla Coastal Lagoons: Beaches in a Changing Climate",
        shortDescription: "Adaptation & sustainable management",
        fullDescription: "Discover the vulnerability of coastal lagoons and beaches to rising temperatures, shifting precipitation, and human activity. Discuss strategies for adaptation and sustainable management of fragile coastal ecosystems.",
        images: [],
        lat: 37.0279,
        lng: 25.3712,
        order: 7,
      },
      {
        id: "pyrgaki",
        name: "Pyrgaki Sand Dunes: Rivers, Winds, and Shifting Sands",
        shortDescription: "Fluvial systems, wind & dune stability",
        fullDescription: "Explore the interaction of fluvial systems, wind processes, climate change, and human interventions in shaping sand dunes. Understand the dynamic equilibrium of dunes and the pressures threatening their stability.",
        images: ["/images/fieldtrip/pyrgaki.jpeg"],
        lat: 36.9762,
        lng: 25.4026,
        order: 8,
      },
      {
        id: "alyko",
        name: "Alyko Pocket Beach: Cliffs, Retreat, and Coastal Dynamics",
        shortDescription: "Cliff erosion & sediment transport",
        fullDescription: "Observe cliff erosion, sediment transport, and beach retreat in a small pocket beach. Link geological processes, climate-driven changes, and human impact to the evolving coastal landscape.",
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
