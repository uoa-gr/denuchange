export const BUS_DEPARTURE_URL = "https://maps.app.goo.gl/PsK22G3EVy2mAKBL8"
export const VENUE_URL = "https://maps.app.goo.gl/st8XksPC3D6TYvqNA"

export type TravelLocationKind = "port" | "airport" | "hotel" | "venue" | "bus"

export interface TravelLocation {
  id: string
  name: string
  shortName: string
  kind: TravelLocationKind
  lat: number
  lng: number
  description: string
  image: string
  imageAlt: string
  mapsUrl: string
  website?: string
  credit: {
    label: string
    url?: string
  }
}

export const travelLocations: TravelLocation[] = [
  {
    id: "naxos-port",
    name: "Naxos Port",
    shortName: "Port",
    kind: "port",
    lat: 37.1065,
    lng: 25.3741,
    description: "Main ferry arrival point in Naxos Town.",
    image: "/images/travel/naxos-port.webp",
    imageAlt: "Naxos Town and its port viewed from the sea",
    mapsUrl: "https://www.google.com/maps/search/?api=1&query=37.1065,25.3741",
    credit: {
      label: "Rol1000 / Wikimedia Commons, resized (CC BY-SA)",
      url: "https://commons.wikimedia.org/wiki/File:Naxos-port.JPG",
    },
  },
  {
    id: "naxos-airport",
    name: "Naxos Airport",
    shortName: "Airport",
    kind: "airport",
    lat: 37.0817,
    lng: 25.3682,
    description: "Naxos Airport (JNX), approximately 3 km from Naxos Town.",
    image: "/images/travel/naxos-airport.webp",
    imageAlt: "Aircraft at Naxos Airport",
    mapsUrl: "https://www.google.com/maps/search/?api=1&query=37.0817,25.3682",
    credit: {
      label: "cQIXk / Wikimedia Commons, resized (CC BY-SA 4.0)",
      url: "https://commons.wikimedia.org/wiki/File:Flughafen_Naxos.jpg",
    },
  },
  {
    id: "princess-of-naxos",
    name: "Princess of Naxos",
    shortName: "Princess of Naxos",
    kind: "hotel",
    lat: 37.0926649,
    lng: 25.3748824,
    description: "Suggested hotel at Agios Georgios Beach, 800 m from the centre.",
    image: "/images/travel/princess-of-naxos.webp",
    imageAlt: "Swimming pool at Princess of Naxos",
    mapsUrl: "https://www.google.com/maps/search/?api=1&query=37.0926649,25.3748824",
    website: "https://princessofnaxos.com",
    credit: {
      label: "Princess of Naxos official website",
      url: "https://princessofnaxos.com",
    },
  },
  {
    id: "princess-mare",
    name: "Princess Mare",
    shortName: "Princess Mare",
    kind: "hotel",
    lat: 37.1005399,
    lng: 25.3744604,
    description: "Suggested hotel at Agios Georgios Beach, in the centre.",
    image: "/images/travel/princess-mare.webp",
    imageAlt: "Guest room at Princess Mare",
    mapsUrl: "https://www.google.com/maps/search/?api=1&query=37.1005399,25.3744604",
    website: "https://princessmare.com.gr/en/",
    credit: {
      label: "Princess Mare official website",
      url: "https://princessmare.com.gr/en/",
    },
  },
  {
    id: "hotel-grotta",
    name: "Hotel Grotta",
    shortName: "Hotel Grotta",
    kind: "hotel",
    lat: 37.1096407,
    lng: 25.3806292,
    description: "Suggested hotel in the Grotta area, 400 m from the centre.",
    image: "/images/travel/hotel-grotta.webp",
    imageAlt: "Sea view terrace at Hotel Grotta",
    mapsUrl: "https://www.google.com/maps/search/?api=1&query=37.1096407,25.3806292",
    website: "https://www.hotelgrotta.gr/",
    credit: {
      label: "Hotel Grotta official website",
      url: "https://www.hotelgrotta.gr/",
    },
  },
  {
    id: "workshop-venue",
    name: "Laguna Coast Resort",
    shortName: "Laguna Coast Resort",
    kind: "venue",
    lat: 37.085639,
    lng: 25.358361,
    description: "Venue for the Workshop Sessions.",
    image: "/images/travel/laguna-coast-resort-aerial.jpg",
    imageAlt: "Aerial view of Laguna Coast Resort in Stelida, Naxos",
    mapsUrl: VENUE_URL,
    credit: {
      label: "Hilton / Laguna Coast Resort",
      url: "https://www.hilton.com/en/hotels/jnxlclx-laguna-coast-resort/",
    },
  },
  {
    id: "bus-departure",
    name: "Workshop bus departure point",
    shortName: "Bus departure",
    kind: "bus",
    lat: 37.10806,
    lng: 25.374452,
    description: "Departure point for the dedicated workshop bus.",
    image: "/images/travel/bus-departure.webp",
    imageAlt: "Central bus station in Naxos Town",
    mapsUrl: BUS_DEPARTURE_URL,
    credit: {
      label: "Zde / Wikimedia Commons, resized (CC BY-SA 4.0)",
      url: "https://commons.wikimedia.org/wiki/File:Naxos,_Bus_station,_11H2361.jpg",
    },
  },
]
