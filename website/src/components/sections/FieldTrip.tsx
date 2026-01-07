import { useState, useEffect, useCallback, useRef } from "react"
import { Badge } from "@/components/ui/badge"
import {
  Map,
  MapMarker,
  MarkerContent,
  MapControls,
  MapRoute,
  MapPopup,
} from "@/components/ui/map"
import { ThemeProvider } from "@/components/theme-provider"
import { ChevronDown, Calendar } from "lucide-react"
import { fieldTripDays, allFieldStops } from "@/lib/fieldtrip-data"

// Use imported data
const fieldStops = allFieldStops

// Full route coordinates for 9 stops across 2 days
// Day 1: Aplomata -> Faneromeni Dam -> Kinidaros -> Apeiranthos
// Day 2: Laguna -> Stelida -> Mikri Vigla -> Pyrgaki -> Alyko
const fullRoute: [number, number][] = [
  // Day 1 - Inland route
  [25.377, 37.108],    // 1. Aplomata
  [25.4721, 37.1395],  // 2. Faneromeni Dam
  [25.4791, 37.1014],  // 3. Kinidaros
  [25.5196, 37.0718],  // 4. Apeiranthos
  // Day 2 - Coastal route
  [25.3584, 37.0872],  // 5. Laguna
  [25.3441, 37.0832],  // 6. Stelida
  [25.3712, 37.0279],  // 7. Mikri Vigla
  [25.4026, 36.9762],  // 8. Pyrgaki
  [25.3908, 36.9785],  // 9. Alyko
]



// Animation timing constants
const STOP_DISPLAY_TIME = 2500 // Time to show each stop popup (ms)
const DASH_INTERVAL = 80 // Time between each dash appearing (ms)

// Number of interpolated points per original route segment
const POINTS_PER_SEGMENT = 8

// Interpolate points along a path to create more granular segments
function interpolatePath(coords: [number, number][], pointsPerSegment: number): [number, number][] {
  if (coords.length < 2) return coords

  const result: [number, number][] = [coords[0]]

  for (let i = 0; i < coords.length - 1; i++) {
    const start = coords[i]
    const end = coords[i + 1]

    for (let j = 1; j <= pointsPerSegment; j++) {
      const t = j / pointsPerSegment
      result.push([
        start[0] + (end[0] - start[0]) * t,
        start[1] + (end[1] - start[1]) * t,
      ])
    }
  }

  return result
}

// Create detailed path: fullRoute has 9 points (8 segments), each gets 8 interpolated points
// Result: 1 + 8*8 = 65 points total
const detailedRoute = interpolatePath(fullRoute, POINTS_PER_SEGMENT)

// Map each field stop to its position in detailedRoute
// Each stop is at index i in fullRoute, which maps to 1 + i * POINTS_PER_SEGMENT in detailedRoute
const stopPointIndices = fieldStops.map((_, i) =>
  i === 0 ? 1 : 1 + i * POINTS_PER_SEGMENT
)

// Destinations List Component
function DestinationsList({
  expandedStop,
  setExpandedStop
}: {
  expandedStop: string | null
  setExpandedStop: (id: string | null) => void
}) {
  return (
    <div className="space-y-6">
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
            {day.stops.map((stop) => (
              <div
                key={stop.id}
                className="border rounded-lg overflow-hidden bg-card"
              >
                <button
                  onClick={() => setExpandedStop(expandedStop === stop.id ? null : stop.id)}
                  className="w-full px-4 py-3 flex items-center justify-between hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-medium flex items-center justify-center">
                      {stop.order}
                    </span>
                    <div className="text-left">
                      <div className="font-medium">{stop.name}</div>
                      <div className="text-sm text-muted-foreground">{stop.shortDescription}</div>
                    </div>
                  </div>
                  <ChevronDown
                    className={`h-4 w-4 text-muted-foreground transition-transform ${
                      expandedStop === stop.id ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {expandedStop === stop.id && (
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
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

export function FieldTrip() {
  const [activeStop, setActiveStop] = useState(0)
  const [visiblePoints, setVisiblePoints] = useState(stopPointIndices[0])
  const [isDrawing, setIsDrawing] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [expandedStop, setExpandedStop] = useState<string | null>(null)
  const resumeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Dash-by-dash drawing animation
  useEffect(() => {
    if (!isDrawing || isPaused) return

    const targetPoints = stopPointIndices[activeStop + 1]
    if (targetPoints === undefined) return

    if (visiblePoints < targetPoints) {
      const timer = setTimeout(() => {
        setVisiblePoints((prev) => prev + 1)
      }, DASH_INTERVAL)
      return () => clearTimeout(timer)
    } else {
      // Drawing complete - move to next stop
      setIsDrawing(false)
      setActiveStop((prev) => prev + 1)
    }
  }, [isDrawing, visiblePoints, activeStop, isPaused])

  // Main animation loop - cycle through stops
  useEffect(() => {
    if (isPaused || isDrawing) return

    const timer = setTimeout(() => {
      if (activeStop < fieldStops.length - 1) {
        // Start drawing to next stop
        setIsDrawing(true)
      } else {
        // Last stop reached, reset to beginning
        setActiveStop(0)
        setVisiblePoints(stopPointIndices[0])
      }
    }, STOP_DISPLAY_TIME)

    return () => clearTimeout(timer)
  }, [activeStop, isDrawing, isPaused])

  // Cleanup resume timer on unmount
  useEffect(() => {
    return () => {
      if (resumeTimerRef.current) {
        clearTimeout(resumeTimerRef.current)
      }
    }
  }, [])

  const handleMapInteraction = useCallback(() => {
    // Cancel any pending resume timer
    if (resumeTimerRef.current) {
      clearTimeout(resumeTimerRef.current)
      resumeTimerRef.current = null
    }
    setIsPaused(true)
  }, [])

  const handleMapLeave = useCallback(() => {
    // Resume animation after a short delay
    resumeTimerRef.current = setTimeout(() => {
      setIsPaused(false)
      resumeTimerRef.current = null
    }, 1000)
  }, [])

  const currentStop = fieldStops[activeStop]
  const drawnRoute = detailedRoute.slice(0, visiblePoints)

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
            A two-day excursion exploring the continuum from catchment dynamics
            to coastal evolution across Naxos Island.
          </p>
          <p className="text-sm text-muted-foreground mt-3">
            <a href="#travel" className="text-primary hover:underline">
              View travel & accommodation options →
            </a>
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto items-stretch">
          {/* Map */}
          <div
            className="overflow-hidden rounded-xl border bg-card shadow-sm min-h-[400px] w-full [&_.maplibregl-map]:!h-full [&_.maplibregl-map]:!w-full [&_.maplibregl-canvas-container]:!h-full [&_.maplibregl-canvas]:!h-full"
            onMouseEnter={handleMapInteraction}
            onMouseLeave={handleMapLeave}
          >
            <div className="h-full w-full">
              <ThemeProvider>
                <Map
                  center={[25.42, 37.04]}
                  zoom={10}
                  minZoom={9}
                  maxZoom={15}
                >
                  {/* Animated drawn route - black dashed line like Indiana Jones */}
                  {drawnRoute.length > 1 && (
                    <MapRoute
                      coordinates={drawnRoute}
                      color="#1a1a1a"
                      width={2.5}
                      opacity={0.85}
                      dashArray={[4, 6]}
                    />
                  )}

                  {/* Field stop markers */}
                  {fieldStops.map((stop, index) => (
                    <MapMarker
                      key={stop.name}
                      longitude={stop.lng}
                      latitude={stop.lat}
                    >
                      <MarkerContent>
                        <div
                          className={`h-6 w-6 rounded-full border-2 border-white shadow-lg flex items-center justify-center text-[10px] font-bold text-white transition-all duration-300 ${
                            index === activeStop && !isDrawing
                              ? "bg-zinc-800 scale-125"
                              : index <= activeStop
                                ? "bg-zinc-800"
                                : "bg-muted-foreground/40"
                          }`}
                        >
                          {stop.order}
                        </div>
                      </MarkerContent>
                    </MapMarker>
                  ))}

                  {/* Active stop popup - only when not drawing */}
                  {!isDrawing && currentStop && (
                    <MapPopup
                      longitude={currentStop.lng}
                      latitude={currentStop.lat}
                      offset={20}
                      closeButton={false}
                    >
                      <div className="w-48">
                        {currentStop.images.length > 0 && (
                          <img
                            src={`${import.meta.env.BASE_URL}${currentStop.images[0].replace(/^\//, '')}`}
                            alt={currentStop.name}
                            className="w-full h-28 object-cover rounded-md mb-2"
                            loading="lazy"
                          />
                        )}
                        <div className="font-medium">{currentStop.name}</div>
                        <div className="text-xs opacity-80">{currentStop.shortDescription}</div>
                      </div>
                    </MapPopup>
                  )}

                  <MapControls position="bottom-right" showZoom />
                </Map>
              </ThemeProvider>
            </div>
          </div>

          {/* Destinations by Day */}
          <DestinationsList expandedStop={expandedStop} setExpandedStop={setExpandedStop} />
        </div>
      </div>
    </section>
  )
}
