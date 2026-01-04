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
const fieldStops = [
  {
    name: "Peritsis Valley",
    lat: 37.1099,
    lng: 25.4748,
    description: "Scenic valley, waterfalls & stone bridges",
    image: "/images/peritsis-valley.jpg",
    order: 1,
  },
  {
    name: "Alyki / Peritsis Mouth",
    lat: 37.082892,
    lng: 25.361861,
    description: "River mouth, flash floods & wetland",
    image: "/images/alyki-lagoon.jpg",
    order: 2,
  },
  {
    name: "Alyko Beach",
    lat: 36.9783,
    lng: 25.3892,
    description: "Coastal dunes & cliff retreat",
    image: "/images/alyko-beach.jpg",
    order: 3,
  },
  {
    name: "Pyrgaki Beach",
    lat: 36.9752,
    lng: 25.4042,
    description: "Beach erosion & NbS sites",
    image: "/images/pyrgaki-beach.jpg",
    order: 4,
  },
]

// Full route coordinates - each stop corresponds to specific indices:
// Index 0: Peritsis Valley, Index 3: Alyki, Index 5: Alyko Beach, Index 6: Pyrgaki
const fullRoute: [number, number][] = [
  [25.4748, 37.1099],
  [25.4200, 37.1000],
  [25.3800, 37.0900],
  [25.361861, 37.082892],
  [25.3750, 37.0200],
  [25.3892, 36.9783],
  [25.4042, 36.9752],
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
const STOP_DISPLAY_TIME = 3000 // Time to show each stop popup (ms)
const DASH_INTERVAL = 100 // Time between each dash appearing (ms) - slower for Indiana Jones effect

// Number of interpolated points per original route segment
const POINTS_PER_SEGMENT = 10

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

// Create detailed path: fullRoute has 7 points (6 segments), each gets 10 interpolated points
// Result: 1 + 6*10 = 61 points total (indices 0-60)
const detailedRoute = interpolatePath(fullRoute, POINTS_PER_SEGMENT)

// Map each field stop to its position in detailedRoute
// Stop positions in fullRoute: index 0, 3, 5, 6
// After interpolation: position = 1 + (fullRouteIndex * POINTS_PER_SEGMENT), except index 0 = 1
// These values represent how many points to show (for slice)
const stopPointIndices = [
  1,                              // Stop 1 (Peritsis Valley) - show 1 point
  1 + 3 * POINTS_PER_SEGMENT,     // Stop 2 (Alyki) - show 31 points
  1 + 5 * POINTS_PER_SEGMENT,     // Stop 3 (Alyko Beach) - show 51 points
  detailedRoute.length,           // Stop 4 (Pyrgaki) - show all 61 points
]

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
                          src={currentStop.image}
                          alt={currentStop.name}
                          className="w-full h-28 object-cover rounded-md mb-2"
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
            <h3 className="text-xl font-semibold">Research Themes</h3>
            <div className="grid grid-cols-1 gap-3">
              {themes.map((theme, i) => (
                <Card key={i} className="p-4 hover:bg-accent/50 transition-colors">
                  <CardContent className="p-0 flex items-center gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-medium flex items-center justify-center">
                      {i + 1}
                    </span>
                    <span className="text-sm">{theme}</span>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="mt-6 p-4 bg-primary/5 rounded-lg border">
              <p className="text-sm text-muted-foreground">
                <strong className="text-foreground">Route:</strong> From Peritsis Valley
                (mountains) through Alyki Lagoon to the coastal stops at Alyko and Pyrgaki.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
