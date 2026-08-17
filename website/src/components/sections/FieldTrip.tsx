import { useState, useCallback, useRef, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import {
  Map,
  MapMarker,
  MarkerContent,
  MarkerPopup,
  MapControls,
  MapRoute,
  useMap,
} from "@/components/ui/map"
import { ThemeProvider } from "@/components/theme-provider"
import { ChevronDown, Calendar } from "lucide-react"
import { fieldTripDays, allFieldStops, type FieldTripStop } from "@/lib/fieldtrip-data"

// Use imported data
const fieldStops = allFieldStops

// Full route coordinates for 9 stops across 2 days
const fullRoute: [number, number][] = [
  // Day 1 - Inland route
  [25.5196, 37.0718],  // 1. Apeiranthos
  [25.4721, 37.1395],  // 2. Faneromeni Dam
  [25.4791, 37.1014],  // 3. Kinidaros
  [25.377, 37.108],    // 4. Aplomata
  // Day 2 - Coastal route
  [25.3584, 37.0872],  // 5. Lagoon/Manto
  [25.3441, 37.0832],  // 6. Stelida
  [25.3712, 37.0279],  // 7. Mikri Vigla
  [25.4026, 36.9762],  // 8. Pyrgaki
  [25.3908, 36.9785],  // 9. Alyko
]

// Destinations List Component
function DestinationsList({
  selectedStopId,
  onStopSelect,
}: {
  selectedStopId: string | null
  onStopSelect: (stop: FieldTripStop & { day: number }) => void
}) {
  const itemRefs = useRef(new globalThis.Map<string, HTMLDivElement>())

  // Scroll selected item into view
  useEffect(() => {
    if (selectedStopId) {
      const el = itemRefs.current.get(selectedStopId)
      if (el) {
        // Small delay to let the expanded content render
        setTimeout(() => {
          el.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
        }, 50)
      }
    }
  }, [selectedStopId])

  return (
    <div className="space-y-6 max-h-[500px] overflow-y-auto pr-2">
      {fieldTripDays.map((day) => (
        <div key={day.day}>
          <div className="flex items-center gap-2 mb-3">
            <Calendar className="h-4 w-4 text-primary" />
            <h3 className="font-semibold">
              Day {day.day}: {day.theme}
            </h3>
            <span className="text-sm text-muted-foreground">
              ({day.weekday}, {day.date})
            </span>
          </div>

          <div className="space-y-2">
            {day.stops.map((stop) => {
              const isSelected = selectedStopId === stop.id
              const stopWithDay = { ...stop, day: day.day }

              return (
                <div
                  key={stop.id}
                  ref={(el) => {
                    if (el) itemRefs.current.set(stop.id, el)
                  }}
                  className={`border rounded-lg overflow-hidden bg-card transition-all ${
                    isSelected ? "border-primary" : ""
                  }`}
                >
                  <button
                    onClick={() => onStopSelect(stopWithDay)}
                    className="w-full px-4 py-3 flex items-center justify-between hover:bg-accent/50 transition-colors focus:outline-none focus-visible:outline-none cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <span className={`flex-shrink-0 w-6 h-6 rounded-full text-xs font-medium flex items-center justify-center transition-colors ${
                        isSelected
                          ? "bg-primary text-primary-foreground"
                          : "bg-primary/10 text-primary"
                      }`}>
                        {stop.order}
                      </span>
                      <div className="text-left">
                        <div className="font-medium">{stop.name}</div>
                        <div className="text-sm text-muted-foreground">{stop.shortDescription}</div>
                      </div>
                    </div>
                    <ChevronDown
                      className={`h-4 w-4 text-muted-foreground transition-transform ${
                        isSelected ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {isSelected && (
                    <div className="px-4 pb-4 border-t bg-muted/30">
                      {stop.images.length > 0 && (
                        <div className="flex gap-2 mt-3 overflow-x-auto pb-2">
                          {stop.images.map((img, idx) => (
                            <img
                              key={idx}
                              src={`${import.meta.env.BASE_URL}${img.replace(/^\//, '')}`}
                              alt={`${stop.name} ${idx + 1}`}
                              className="h-32 w-auto rounded-md object-cover flex-shrink-0"
                              loading="lazy"
                            />
                          ))}
                        </div>
                      )}
                      <p className="text-sm text-muted-foreground mt-3">
                        {stop.fullDescription}
                      </p>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}

// Inner map content component that can use the useMap hook
function FieldTripMapContent({
  selectedStopId,
  onStopSelect,
}: {
  selectedStopId: string | null
  onStopSelect: (stop: (typeof fieldStops)[0]) => void
}) {
  const { map, isLoaded } = useMap()
  const prevSelectedRef = useRef<string | null>(null)

  // Pan to selected stop with offset to ensure popup is visible
  useEffect(() => {
    if (!isLoaded || !map || !selectedStopId) return
    // Skip if same stop already selected (avoid re-panning)
    if (prevSelectedRef.current === selectedStopId) return
    prevSelectedRef.current = selectedStopId

    const stop = fieldStops.find(s => s.id === selectedStopId)
    if (stop) {
      // Offset pushes marker down in viewport, leaving room for popup above
      map.easeTo({
        center: [stop.lng, stop.lat],
        offset: [0, 80], // positive y = marker appears lower, popup has room above
        duration: 500,
      })
    }
  }, [selectedStopId, isLoaded, map])

  // Reset ref when selection is cleared
  useEffect(() => {
    if (!selectedStopId) {
      prevSelectedRef.current = null
    }
  }, [selectedStopId])

  return (
    <>
      {/* Static route trail */}
      <MapRoute
        coordinates={fullRoute}
        color="#1a1a1a"
        width={2.5}
        opacity={0.85}
        dashArray={[4, 6]}
      />

      {/* Field stop markers with popups */}
      {fieldStops.map((stop) => {
        const isSelected = selectedStopId === stop.id

        return (
          <MapMarker
            key={stop.id}
            longitude={stop.lng}
            latitude={stop.lat}
            onClick={() => {
              // Reset ref so clicking marker triggers pan with offset for popup visibility
              prevSelectedRef.current = null
              onStopSelect(stop)
            }}
          >
            <MarkerContent>
              <div
                className={`h-6 w-6 rounded-full border-2 border-white shadow-lg flex items-center justify-center text-[10px] font-bold text-white transition-all duration-300 cursor-pointer hover:scale-110 ${
                  isSelected
                    ? "bg-primary scale-125"
                    : "bg-zinc-800"
                }`}
              >
                {stop.order}
              </div>
            </MarkerContent>
            {isSelected && (
              <MarkerPopup offset={20}>
                <div className="w-48">
                  {stop.images.length > 0 && (
                    <img
                      src={`${import.meta.env.BASE_URL}${stop.images[0].replace(/^\//, '')}`}
                      alt={stop.name}
                      className="w-full h-28 object-cover rounded-md mb-2"
                      loading="lazy"
                    />
                  )}
                  <div className="font-medium">{stop.name}</div>
                  <div className="text-xs text-muted-foreground">{stop.shortDescription}</div>
                </div>
              </MarkerPopup>
            )}
          </MapMarker>
        )
      })}

      <MapControls position="bottom-right" showZoom />
    </>
  )
}

export function FieldTrip() {
  const [selectedStopId, setSelectedStopId] = useState<string | null>(null)

  const handleStopSelect = useCallback((stop: (typeof fieldStops)[0]) => {
    // Toggle off if clicking the same stop
    setSelectedStopId(prev => prev === stop.id ? null : stop.id)
  }, [])

  return (
    <section id="field-trip" className="py-20 bg-muted/30">
      <div className="container">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <Badge variant="outline" className="mb-4">
            Field Trip
          </Badge>
          <h2 className="text-3xl font-bold tracking-tight mb-4">
            Catchment to Coast: October 8-9
          </h2>
          <p className="text-muted-foreground">
            A two-day excursion exploring natural hazards, weathering processes,
            and coastal dynamics from inland Naxos to its coastline.
          </p>
          <p className="text-sm text-muted-foreground mt-3">
            <a href="#travel" className="text-primary hover:underline cursor-pointer">
              View travel & accommodation options →
            </a>
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto items-stretch">
          {/* Map */}
          <div
            id="field-trip-map"
            className="scroll-mt-24 overflow-hidden rounded-xl border bg-card shadow-sm min-h-[500px] w-full [&_.maplibregl-map]:!h-full [&_.maplibregl-map]:!w-full [&_.maplibregl-canvas-container]:!h-full [&_.maplibregl-canvas]:!h-full"
          >
            <div className="h-full w-full">
              <ThemeProvider>
                <Map
                  center={[25.42, 37.04]}
                  zoom={10}
                  minZoom={9}
                  maxZoom={15}
                >
                  <FieldTripMapContent
                    selectedStopId={selectedStopId}
                    onStopSelect={handleStopSelect}
                  />
                </Map>
              </ThemeProvider>
            </div>
          </div>

          {/* Destinations by Day */}
          <DestinationsList
            selectedStopId={selectedStopId}
            onStopSelect={handleStopSelect}
          />
        </div>

        {/* Note about itinerary */}
        <div className="max-w-6xl mx-auto mt-8">
          <div className="bg-[#f1c100]/15 border border-[#f1c100]/30 rounded-lg p-4 text-center">
            <p className="text-sm text-foreground/80">
              <span className="font-bold">Note:</span> The detailed itinerary will be announced closer to the event.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
