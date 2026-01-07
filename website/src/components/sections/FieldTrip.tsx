import { useState, useEffect, useCallback, useRef } from "react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import {
  Map,
  MapMarker,
  MarkerContent,
  MapControls,
  MapRoute,
  MapPopup,
} from "@/components/ui/map"
import { ThemeProvider } from "@/components/theme-provider"

// Field trip stops on Naxos - verified GPS coordinates
// Day 1 (Oct 8): Inland - Aplomata, Faneromeni Dam, Kinidaros, Apeiranthos
// Day 2 (Oct 9): Coastal - Laguna, Stelida, Mikri Vigla, Pyrgaki, Alyko
const fieldStops = [
  // Day 1 - Inland
  {
    name: "Aplomata",
    lat: 37.108,
    lng: 25.377,
    description: "Landslide hazard area near Grotta",
    image: "/images/fieldtrip/aplomata.jpeg",
    order: 1,
    day: 1,
  },
  {
    name: "Faneromeni Dam",
    lat: 37.1395,
    lng: 25.4721,
    description: "Water management & sediment budgets",
    image: "/images/fieldtrip/faneromeni-dam-1.jpeg",
    order: 2,
    day: 1,
  },
  {
    name: "Kinidaros",
    lat: 37.1014,
    lng: 25.4791,
    description: "Forest fire impact & erosion processes",
    image: "/images/fieldtrip/kinidaros-1.jpeg",
    order: 3,
    day: 1,
  },
  {
    name: "Apeiranthos",
    lat: 37.0718,
    lng: 25.5196,
    description: "Geological Museum & emery mine",
    image: "/images/fieldtrip/apeiranthos-1.jpeg",
    order: 4,
    day: 1,
  },
  // Day 2 - Coastal
  {
    name: "Laguna",
    lat: 37.0872,
    lng: 25.3584,
    description: "Palaeogeography, tafoni & beachrocks",
    image: "/images/fieldtrip/laguna.jpeg",
    order: 5,
    day: 2,
  },
  {
    name: "Stelida",
    lat: 37.0832,
    lng: 25.3441,
    description: "Tafoni & weathering processes",
    image: "/images/fieldtrip/laguna.jpeg",
    order: 6,
    day: 2,
  },
  {
    name: "Mikri Vigla",
    lat: 37.0279,
    lng: 25.3712,
    description: "Coastal protection & climate change",
    image: "/images/fieldtrip/pyrgaki.jpeg",
    order: 7,
    day: 2,
  },
  {
    name: "Pyrgaki Beach",
    lat: 36.9762,
    lng: 25.4026,
    description: "Sand dunes (>5m) & coastal processes",
    image: "/images/fieldtrip/pyrgaki.jpeg",
    order: 8,
    day: 2,
  },
  {
    name: "Alyko Beach",
    lat: 36.9785,
    lng: 25.3908,
    description: "Cliff retreat & GNSS-RTK survey",
    image: "/images/fieldtrip/alyko.png",
    order: 9,
    day: 2,
  },
]

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

const themes = [
  "Land degradation & desertification drivers",
  "Forest fire geomorphological footprint",
  "Runoff erosion processes",
  "Agricultural terraces & dams impact",
  "Hydro-geomorphological hazards",
  "Coastal pressures & NbS for climate adaptation",
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

export function FieldTrip() {
  const [activeStop, setActiveStop] = useState(0)
  const [visiblePoints, setVisiblePoints] = useState(stopPointIndices[0])
  const [isDrawing, setIsDrawing] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
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
                        <img
                          src={`${import.meta.env.BASE_URL}${currentStop.image.replace(/^\//, '')}`}
                          alt={currentStop.name}
                          className="w-full h-28 object-cover rounded-md mb-2"
                          loading="lazy"
                        />
                        <div className="font-medium">{currentStop.name}</div>
                        <div className="text-xs opacity-80">{currentStop.description}</div>
                      </div>
                    </MapPopup>
                  )}

                  <MapControls position="bottom-right" showZoom />
                </Map>
              </ThemeProvider>
            </div>
          </div>

          {/* Themes */}
          <div className="space-y-6">
            <h3 className="text-xl font-semibold">Topics Covered</h3>
            <p className="text-sm text-muted-foreground -mt-4">
              Thematic areas explored across the 9 field stops
            </p>
            <div className="grid grid-cols-1 gap-3">
              {themes.map((theme, i) => (
                <Card key={i} className="p-4 hover:bg-accent/50 transition-colors">
                  <CardContent className="p-0 flex items-center gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-medium flex items-center justify-center">
                      •
                    </span>
                    <span className="text-sm">{theme}</span>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="mt-6 p-4 bg-[#f1c100]/15 border border-[#f1c100]/25 rounded-lg">
              <p className="text-sm text-muted-foreground">
                <strong className="text-foreground">Day 1 (Oct 8):</strong> Inland route from Aplomata
                through Faneromeni Dam and Kinidaros to Apeiranthos.
                <br />
                <strong className="text-foreground">Day 2 (Oct 9):</strong> Coastal route from Laguna
                through Stelida and Mikri Vigla to Pyrgaki and Alyko beaches.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
