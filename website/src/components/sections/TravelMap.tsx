import { useEffect, useState, type ComponentType } from "react"
import {
  BusFront,
  ExternalLink,
  Hotel,
  MapPinned,
  Plane,
  Ship,
  X,
  type LucideProps,
} from "lucide-react"
import {
  Map,
  MapControls,
  MapMarker,
  MarkerContent,
  MarkerPopup,
  useMap,
} from "@/components/ui/map"
import { ThemeProvider } from "@/components/theme-provider"
import {
  travelLocations,
  type TravelLocation,
  type TravelLocationKind,
} from "@/lib/travel-map-data"

const KIND_LABELS: Record<TravelLocationKind, string> = {
  port: "Arrival by sea",
  airport: "Arrival by air",
  hotel: "Accommodation",
  venue: "Workshop Sessions venue",
  bus: "Workshop transport",
}

const KIND_STYLES: Record<TravelLocationKind, string> = {
  port: "bg-cyan-700 text-white",
  airport: "bg-sky-700 text-white",
  hotel: "bg-violet-700 text-white",
  venue: "bg-primary text-primary-foreground",
  bus: "bg-[#f1c100] text-zinc-950",
}

const LOCATION_ICONS: Record<TravelLocationKind, ComponentType<LucideProps>> = {
  port: Ship,
  airport: Plane,
  hotel: Hotel,
  venue: MapPinned,
  bus: BusFront,
}

function LocationIcon({
  kind,
  className = "h-4 w-4",
}: {
  kind: TravelLocationKind
  className?: string
}) {
  const Icon = LOCATION_ICONS[kind]
  return <Icon className={className} aria-hidden="true" />
}

function LocationPopup({
  location,
  onClose,
}: {
  location: TravelLocation
  onClose: () => void
}) {
  return (
    <article className="w-[min(17rem,calc(100vw-3rem))] overflow-hidden rounded-xl border border-border bg-card text-card-foreground shadow-[0_18px_48px_-18px_rgba(15,42,68,0.55)]">
      <div className="relative h-24 overflow-hidden bg-muted sm:h-28">
        <img
          src={location.image}
          alt={location.imageAlt}
          className="h-full w-full object-cover"
          loading="lazy"
        />
        <button
          type="button"
          onClick={onClose}
          className="absolute right-2 top-2 flex h-11 w-11 items-center justify-center rounded-full bg-zinc-950/75 text-white shadow-sm transition-colors hover:bg-zinc-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950"
          aria-label={`Close ${location.name} information`}
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>

      <div className="p-3 sm:p-4">
        <div className="mb-1.5 flex items-center gap-2">
          <span className={`inline-flex h-6 w-6 items-center justify-center rounded-md ${KIND_STYLES[location.kind]}`}>
            <LocationIcon kind={location.kind} className="h-3.5 w-3.5" />
          </span>
          <p className="text-[11px] font-bold uppercase tracking-[0.13em] text-muted-foreground">
            {KIND_LABELS[location.kind]}
          </p>
        </div>

        <h4 className="text-base font-bold leading-snug text-foreground">{location.name}</h4>
        <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground sm:text-sm">
          {location.description}
        </p>

        <div className="mt-3 flex flex-wrap gap-2">
          <a
            href={location.mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-11 items-center gap-1.5 rounded-md bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            Google Maps
            <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
          </a>
          {location.website && (
            <a
              href={location.website}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 items-center gap-1.5 rounded-md border border-border bg-background px-3 py-2 text-xs font-semibold text-foreground transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              Website
              <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
            </a>
          )}
        </div>

        <p className="mt-2 text-[10px] leading-relaxed text-muted-foreground/85">
          Photo:{" "}
          {location.credit.url ? (
            <a
              href={location.credit.url}
              target="_blank"
              rel="noopener noreferrer"
              className="underline decoration-muted-foreground/40 underline-offset-2 hover:decoration-muted-foreground"
            >
              {location.credit.label}
            </a>
          ) : (
            location.credit.label
          )}
        </p>
      </div>
    </article>
  )
}

function TravelMapContent({
  selectedId,
  onSelect,
}: {
  selectedId: string | null
  onSelect: (id: string | null) => void
}) {
  const { map, isLoaded } = useMap()

  useEffect(() => {
    if (!isLoaded || !map || !selectedId) return

    const location = travelLocations.find((item) => item.id === selectedId)
    if (!location) return

    map.easeTo({
      center: [location.lng, location.lat],
      zoom: Math.max(map.getZoom(), 15),
      offset: [0, 125],
      duration: 550,
    })
  }, [isLoaded, map, selectedId])

  return (
    <>
      {travelLocations.map((location) => {
        const isSelected = location.id === selectedId

        return (
          <MapMarker
            key={location.id}
            longitude={location.lng}
            latitude={location.lat}
            anchor="bottom"
          >
            <MarkerContent>
              <button
                type="button"
                onClick={() => onSelect(location.id)}
                className={`flex h-11 w-11 items-center justify-center rounded-full border-2 border-white shadow-[0_5px_16px_-4px_rgba(15,23,42,0.65)] transition-[transform,box-shadow] hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                  isSelected ? "-translate-y-0.5 scale-110" : ""
                } ${KIND_STYLES[location.kind]}`}
                aria-label={`Show ${location.name} on map`}
                aria-pressed={isSelected}
              >
                <LocationIcon
                  kind={location.kind}
                  className={isSelected ? "h-5 w-5" : "h-4 w-4"}
                />
              </button>
            </MarkerContent>

            {isSelected && (
              <MarkerPopup
                anchor="bottom"
                offset={18}
                className="border-0 bg-transparent p-0 shadow-none"
              >
                <LocationPopup location={location} onClose={() => onSelect(null)} />
              </MarkerPopup>
            )}
          </MapMarker>
        )
      })}

      <MapControls position="top-right" showZoom />
    </>
  )
}

export function TravelMap() {
  const [selectedId, setSelectedId] = useState<string | null>(null)

  return (
    <div
      id="travel-map"
      role="region"
      aria-labelledby="travel-map-heading"
      className="mx-auto mt-14 max-w-6xl scroll-mt-24"
    >
      <div className="mb-6 max-w-3xl">
        <h3 id="travel-map-heading" className="text-2xl font-bold tracking-tight sm:text-3xl">
          Arrival, accommodation and workshop map
        </h3>
        <p className="mt-3 leading-relaxed text-muted-foreground">
          Find the port, airport, suggested hotels, the venue, and the workshop bus departure point in one place.
        </p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-[0_20px_60px_-36px_rgba(15,42,68,0.65)]">
        <div className="h-[440px] w-full sm:h-[520px]">
          <ThemeProvider>
            <Map
              center={[25.368, 37.096]}
              zoom={12.6}
              minZoom={10}
              maxZoom={17}
            >
              <TravelMapContent selectedId={selectedId} onSelect={setSelectedId} />
            </Map>
          </ThemeProvider>
        </div>

      </div>
    </div>
  )
}
