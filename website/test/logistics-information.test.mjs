import assert from "node:assert/strict"
import test from "node:test"
import path from "node:path"
import { fileURLToPath } from "node:url"
import React from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { createServer } from "vite"

const testDirectory = path.dirname(fileURLToPath(import.meta.url))
const projectRoot = path.resolve(testDirectory, "..")

const busDepartureUrl = "https://maps.app.goo.gl/PsK22G3EVy2mAKBL8"
const venueUrl = "https://maps.app.goo.gl/st8XksPC3D6TYvqNA"

test("Program keeps transport outside its two-part itinerary", async (context) => {
  const vite = await createServer({
    root: projectRoot,
    server: { middlewareMode: true },
    appType: "custom",
    optimizeDeps: { noDiscovery: true },
  })

  context.after(async () => {
    await vite.close()
  })

  const [programModule, fieldTripModule] = await Promise.all([
    vite.ssrLoadModule("/src/components/sections/Program.tsx"),
    vite.ssrLoadModule("/src/components/sections/FieldTrip.tsx"),
  ])
  const markup = renderToStaticMarkup(React.createElement(programModule.Program))
  const fieldTripMarkup = renderToStaticMarkup(React.createElement(fieldTripModule.FieldTrip))
  const scheduleMarkup = markup.match(/<ol[^>]*aria-label="Workshop schedule"[^>]*>[\s\S]*?<\/ol>/)?.[0]

  assert.ok(scheduleMarkup, "Workshop schedule is missing")
  assert.equal(scheduleMarkup.match(/<h3(?:\s|>)/g)?.length, 2)
  assert.match(scheduleMarkup, /class="[^"]*lg:grid-cols-2[^"]*"/)
  assert.doesNotMatch(scheduleMarkup, /md:grid-cols-2/)
  assert.match(scheduleMarkup, /Laguna Coast Resort/)
  assert.doesNotMatch(scheduleMarkup, /Alyki Lagoon/)

  const workshopLocationLinks = scheduleMarkup.match(
    /<div[^>]*aria-label="Workshop Sessions location links"[^>]*>[\s\S]*?<\/div>/
  )?.[0]
  const fieldTripLocationLinks = scheduleMarkup.match(
    /<div[^>]*aria-label="Field Trip location links"[^>]*>[\s\S]*?<\/div>/
  )?.[0]

  assert.ok(workshopLocationLinks, "Workshop Sessions location links are missing")
  assert.match(workshopLocationLinks, new RegExp(`href="${venueUrl}"`))
  assert.match(workshopLocationLinks, /href="#travel-map"[^>]*>[\s\S]*?View map below/)
  assert.match(workshopLocationLinks, /href="#travel-map"[^>]*class="[^"]*\btext-primary\b[^"]*"/)
  assert.doesNotMatch(workshopLocationLinks, /text-primary\/\d+/)
  assert.ok(fieldTripLocationLinks, "Field Trip location link is missing")
  assert.match(fieldTripLocationLinks, /href="#field-trip-map"[^>]*>[\s\S]*?View map below/)
  assert.match(fieldTripLocationLinks, /href="#field-trip-map"[^>]*class="[^"]*\btext-primary\b[^"]*"/)
  assert.doesNotMatch(fieldTripLocationLinks, /text-primary\/\d+/)
  assert.doesNotMatch(scheduleMarkup, /Venue for most workshop activities/)
  assert.doesNotMatch(scheduleMarkup, new RegExp(busDepartureUrl))
  assert.match(fieldTripMarkup, /id="field-trip-map"/)

  const practicalInformation = markup.match(
    /<aside[^>]*aria-label="Practical information"[^>]*>[\s\S]*?<\/aside>/
  )?.[0]

  assert.ok(practicalInformation, "Practical information is missing")
  assert.match(practicalInformation, new RegExp(`href="${busDepartureUrl}"`))
  assert.match(practicalInformation, /Detailed program will be announced closer to the event\./)
  assert.doesNotMatch(practicalInformation, /with session times/i)
  assert.match(practicalInformation, /Workshop transport/)
  assert.match(practicalInformation, /A dedicated workshop bus will provide transport during the field trip and transfers between the/)
  assert.match(practicalInformation, /central bus station/)
  assert.match(practicalInformation, /and the venue\./)
  assert.doesNotMatch(practicalInformation, /Conference transport/)
})

test("Travel map exposes only the seven arrival and workshop logistics points", async (context) => {
  const vite = await createServer({
    root: projectRoot,
    server: { middlewareMode: true },
    appType: "custom",
    optimizeDeps: { noDiscovery: true },
  })

  context.after(async () => {
    await vite.close()
  })

  const travelModule = await vite.ssrLoadModule("/src/components/sections/Travel.tsx")
  const mapDataModule = await vite.ssrLoadModule("/src/lib/travel-map-data.ts")
  const markup = renderToStaticMarkup(React.createElement(travelModule.Travel))

  assert.match(
    markup,
    /<div[^>]*id="travel-map"[^>]*role="region"[^>]*aria-labelledby="travel-map-heading"/
  )
  assert.doesNotMatch(markup, /aria-label="Map locations"/)
  assert.doesNotMatch(markup, /data-map-location=/)
  assert.match(markup, /Find the port, airport, suggested hotels, the venue, and the workshop bus departure point in one place\./)
  assert.doesNotMatch(markup, new RegExp(`href="${venueUrl}"`))
  assert.doesNotMatch(markup, /Bus transport will be provided/i)
  assert.match(markup, /consider staying within walking distance of the/)
  assert.match(markup, /central bus station/)
  assert.match(markup, new RegExp(`href="${busDepartureUrl}"`))

  assert.equal(mapDataModule.travelLocations.length, 7)

  const locationNames = mapDataModule.travelLocations.map((location) => location.name)
  for (const location of [
    "Naxos Port",
    "Naxos Airport",
    "Princess of Naxos",
    "Princess Mare",
    "Hotel Grotta",
    "Laguna Coast Resort",
    "Workshop bus departure point",
  ]) {
    assert.ok(locationNames.includes(location), `Map location is missing: ${location}`)
  }

  assert.doesNotMatch(markup, /most workshop activities/i)
  assert.ok(
    mapDataModule.travelLocations.every((location) => !location.id.startsWith("field-trip-")),
    "The travel map must not include field-trip stops",
  )

  const locationsById = Object.fromEntries(
    mapDataModule.travelLocations.map((location) => [location.id, location])
  )

  assert.equal(locationsById["workshop-venue"].mapsUrl, venueUrl)
  assert.equal(locationsById["workshop-venue"].description, "Venue for the Workshop Sessions.")
  assert.equal(locationsById["workshop-venue"].image, "/images/travel/laguna-coast-resort-aerial.jpg")
  assert.equal(
    locationsById["workshop-venue"].imageAlt,
    "Aerial view of Laguna Coast Resort in Stelida, Naxos",
  )
  assert.equal(locationsById["bus-departure"].mapsUrl, busDepartureUrl)
  assert.equal(locationsById["bus-departure"].description, "Departure point for the dedicated workshop bus.")

  assert.deepEqual(
    [locationsById["princess-of-naxos"].lat, locationsById["princess-of-naxos"].lng],
    [37.0926649, 25.3748824]
  )
  assert.deepEqual(
    [locationsById["princess-mare"].lat, locationsById["princess-mare"].lng],
    [37.1005399, 25.3744604]
  )
  assert.deepEqual(
    [locationsById["hotel-grotta"].lat, locationsById["hotel-grotta"].lng],
    [37.1096407, 25.3806292]
  )
})
