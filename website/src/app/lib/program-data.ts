// DENUCHANGE 2026 Workshop Program & Announcements
// Extracted exactly from official agenda: DENUCHANGE_Program_20260923.pdf

export interface ProgramSession {
  id: string
  date: string
  start_time: string
  end_time: string
  title: string
  description: string
  location: string
  session_type: string
}

export interface NotificationItem {
  id: string
  title: string
  body: string
  created_at: string
}

export const DEFAULT_ANNOUNCEMENTS: NotificationItem[] = [
  {
    id: "alert-updated-agenda-20260923",
    title: "Updated Workshop Agenda & Program",
    body: "The official workshop agenda has been updated. The detailed schedule for October 6–7, 2026—including opening lectures, thematic oral sessions, the poster session, and the Virtual Field Trip Laboratory—is now available in the Program section. You can also download the updated PDF program directly from the homepage.",
    created_at: "2026-09-24T12:00:00.000Z",
  },
]

export const DEFAULT_PROGRAM_SESSIONS: ProgramSession[] = [
  {
    "id": "mon-bus",
    "date": "2026-10-05",
    "start_time": "18:45",
    "end_time": "19:00",
    "title": "Bus transfer to venue",
    "description": "Bus service to the venue departing from the central bus station in Naxos Town (approx. 10 min journey).",
    "location": "Central bus station, Naxos Town",
    "session_type": "social"
  },
  {
    "id": "mon-icebreaker",
    "date": "2026-10-05",
    "start_time": "19:00",
    "end_time": "21:30",
    "title": "ICE BREAKER",
    "description": "Pre-workshop event · A welcome evening with light dinner and drinks.",
    "location": "Laguna Coast Resort, Naxos",
    "session_type": "social"
  },
  {
    "id": "tue-bus",
    "date": "2026-10-06",
    "start_time": "08:45",
    "end_time": "09:00",
    "title": "Bus transfer to venue",
    "description": "Morning bus departure from the central bus station in Naxos Town to Laguna Coast Resort.",
    "location": "Central bus station, Naxos Town",
    "session_type": "social"
  },
  {
    "id": "tue-reg",
    "date": "2026-10-06",
    "start_time": "09:00",
    "end_time": "09:30",
    "title": "Registration",
    "description": "",
    "location": "Laguna Coast Resort, Naxos",
    "session_type": "break"
  },
  {
    "id": "tue-welcome",
    "date": "2026-10-06",
    "start_time": "09:30",
    "end_time": "10:00",
    "title": "Opening: Welcome speeches & Event Opening",
    "description": "Welcome speeches:\nProf. Niki Evelpidou, Chair of the IAG WG Virtual trips in Geomorphology / Department of Geology and Geoenvironment, National and Kapodistrian University of Athens\nProf. Achim A. Beylich, Chair of the IAG WG DENUCHANGE / Geomorphological Field Laboratory\nProf. Zbigniew Zwoliński, Co-Chair of the IAG WG DENUCHANGE / Institute of Geoecology and Geoinformation, Adam Mickiewicz University\nVasilis Flerianos, Deputy Mayor for Culture, Municipality of Naxos and Small Cyclades\nProf. Assimina Antonarakou, President, Department of Geology and Geoenvironment, National and Kapodistrian University of Athens\n\nEvent Opening:\nProf. Efstathios Efstathopoulos, Vice-Rector for Research and Innovation, National and Kapodistrian University of Athens",
    "location": "Laguna Coast Resort, Naxos",
    "session_type": "session"
  },
  {
    "id": "tue-beylich-intro",
    "date": "2026-10-06",
    "start_time": "10:00",
    "end_time": "10:30",
    "title": "The IAG Working Group on Denudation and Environmental Changes in Different Morphoclimatic Zones (DENUCHANGE, 2017-2030): Scientific need, research questions, outcomes and possible future directions",
    "description": "Beylich A.",
    "location": "Laguna Coast Resort, Naxos",
    "session_type": "keynote"
  },
  {
    "id": "tue-pitaras",
    "date": "2026-10-06",
    "start_time": "10:30",
    "end_time": "10:45",
    "title": "From Sustainable Tourism to Regenerative Island Development: The Laguna Pilot Model",
    "description": "Pitaras, A.",
    "location": "Laguna Coast Resort, Naxos",
    "session_type": "session"
  },
  {
    "id": "tue-keynote-vespremeanu",
    "date": "2026-10-06",
    "start_time": "10:45",
    "end_time": "11:15",
    "title": "Invited keynote lecture: From Deglaciation to Rock Glaciers: Timing and Patterns of Rock-Wall Debris Production in the Southern Carpathians",
    "description": "Vespremeanu Stroe, Α.",
    "location": "Laguna Coast Resort, Naxos",
    "session_type": "keynote"
  },
  {
    "id": "tue-coffee-1",
    "date": "2026-10-06",
    "start_time": "11:15",
    "end_time": "11:35",
    "title": "Coffee break",
    "description": "",
    "location": "Laguna Coast Resort, Naxos",
    "session_type": "break"
  },
  {
    "id": "tue-s1-1",
    "date": "2026-10-06",
    "start_time": "11:35",
    "end_time": "11:50",
    "title": "SWAT-based modelling of water runoff and suspended sediment transport in catchments across diverse morphoclimatic zones",
    "description": "Gudowicz J., Bochenek W., Kijowska-Strugała M., Majewski M., Zwoliński Z.\n\nSession 1: Catchment Hydrology, Sediment Connectivity and Modelling (Understanding how sediment is mobilised, transported and monitored)",
    "location": "Laguna Coast Resort, Naxos",
    "session_type": "session"
  },
  {
    "id": "tue-s1-1-disc",
    "date": "2026-10-06",
    "start_time": "11:50",
    "end_time": "11:55",
    "title": "Discussion",
    "description": "",
    "location": "Laguna Coast Resort, Naxos",
    "session_type": "break"
  },
  {
    "id": "tue-s1-2",
    "date": "2026-10-06",
    "start_time": "11:55",
    "end_time": "12:10",
    "title": "From LiDAR to Water-Level Animation: Visualizing Reservoir Storage Dynamics in the Mavrokolympos reservoir basin, Cyprus",
    "description": "Roussou O., Moysidou L., Agapiou A., Skarlatos D., Papakonstantinou A.\n\nSession 1: Catchment Hydrology, Sediment Connectivity and Modelling",
    "location": "Laguna Coast Resort, Naxos",
    "session_type": "session"
  },
  {
    "id": "tue-s1-2-disc",
    "date": "2026-10-06",
    "start_time": "12:10",
    "end_time": "12:15",
    "title": "Discussion",
    "description": "",
    "location": "Laguna Coast Resort, Naxos",
    "session_type": "break"
  },
  {
    "id": "tue-s1-3",
    "date": "2026-10-06",
    "start_time": "12:15",
    "end_time": "12:30",
    "title": "Cumulative mountain forest disturbance impacts on 23-year suspended sediment dynamics in a humid headwater catchment of southwestern Japan",
    "description": "Koyanagi K., Shinohara Y., Takagi M.\n\nSession 1: Catchment Hydrology, Sediment Connectivity and Modelling",
    "location": "Laguna Coast Resort, Naxos",
    "session_type": "session"
  },
  {
    "id": "tue-s1-3-disc",
    "date": "2026-10-06",
    "start_time": "12:30",
    "end_time": "12:35",
    "title": "Discussion",
    "description": "",
    "location": "Laguna Coast Resort, Naxos",
    "session_type": "break"
  },
  {
    "id": "tue-s1-4",
    "date": "2026-10-06",
    "start_time": "12:35",
    "end_time": "12:50",
    "title": "Structural connectivity in sediment transfer in the foothill Stara Rzeka catchment",
    "description": "Święchowicz J., Michno A., Ostafin K., Najwer A.\n\nSession 1: Catchment Hydrology, Sediment Connectivity and Modelling",
    "location": "Laguna Coast Resort, Naxos",
    "session_type": "session"
  },
  {
    "id": "tue-s1-4-disc",
    "date": "2026-10-06",
    "start_time": "12:50",
    "end_time": "12:55",
    "title": "Discussion",
    "description": "",
    "location": "Laguna Coast Resort, Naxos",
    "session_type": "break"
  },
  {
    "id": "tue-s1-5",
    "date": "2026-10-06",
    "start_time": "12:55",
    "end_time": "13:10",
    "title": "Debris flow release susceptibility and sediment connectivity in the Russian sector of the Greater Caucasus",
    "description": "Posazhennikova V., Golosov V. N., Kharchenko S. V.\n\nSession 1: Catchment Hydrology, Sediment Connectivity and Modelling",
    "location": "Laguna Coast Resort, Naxos",
    "session_type": "session"
  },
  {
    "id": "tue-s1-5-disc",
    "date": "2026-10-06",
    "start_time": "13:10",
    "end_time": "13:15",
    "title": "Discussion",
    "description": "",
    "location": "Laguna Coast Resort, Naxos",
    "session_type": "break"
  },
  {
    "id": "tue-lunch",
    "date": "2026-10-06",
    "start_time": "13:15",
    "end_time": "14:45",
    "title": "Light Lunch",
    "description": "",
    "location": "Laguna Coast Resort, Naxos",
    "session_type": "meal"
  },
  {
    "id": "tue-laguna-visit",
    "date": "2026-10-06",
    "start_time": "14:45",
    "end_time": "17:00",
    "title": "Visit to the Laguna site",
    "description": "Field visit to the Laguna site.",
    "location": "Laguna site, Naxos",
    "session_type": "field_trip"
  },
  {
    "id": "tue-s2-1",
    "date": "2026-10-06",
    "start_time": "17:00",
    "end_time": "17:15",
    "title": "Toward the integration of historical data in erosion modelling: the case of Badlands landscapes of Aliano (Basilicata, Southern Italy)",
    "description": "Santoro G., Mairota P., Capolongo D., Marsico A.\n\nSession 2: Denudation, Landscape Evolution and Sediment Sources (From long-term landscape evolution to sediment production)",
    "location": "Laguna Coast Resort, Naxos",
    "session_type": "session"
  },
  {
    "id": "tue-s2-1-disc",
    "date": "2026-10-06",
    "start_time": "17:15",
    "end_time": "17:20",
    "title": "Discussion",
    "description": "",
    "location": "Laguna Coast Resort, Naxos",
    "session_type": "break"
  },
  {
    "id": "tue-s2-2",
    "date": "2026-10-06",
    "start_time": "17:20",
    "end_time": "17:35",
    "title": "Climate-Driven Shifts in Denudational Regimes of a Lowland Fluvial System",
    "description": "Szpikowski J., Szpikowska G., Zwoliński Zb., Mazurek M., Kruszyk R., Kostrzewski A.\n\nSession 2: Denudation, Landscape Evolution and Sediment Sources",
    "location": "Laguna Coast Resort, Naxos",
    "session_type": "session"
  },
  {
    "id": "tue-s2-2-disc",
    "date": "2026-10-06",
    "start_time": "17:35",
    "end_time": "17:40",
    "title": "Discussion",
    "description": "",
    "location": "Laguna Coast Resort, Naxos",
    "session_type": "break"
  },
  {
    "id": "tue-s2-3",
    "date": "2026-10-06",
    "start_time": "17:40",
    "end_time": "17:55",
    "title": "Denudation hotspots in Italy: Towards the first national spatial dataset of badlands distribution",
    "description": "La Licata M., Maerker M., Panagos P. & Borrelli P.\n\nSession 2: Denudation, Landscape Evolution and Sediment Sources",
    "location": "Laguna Coast Resort, Naxos",
    "session_type": "session"
  },
  {
    "id": "tue-s2-3-disc",
    "date": "2026-10-06",
    "start_time": "17:55",
    "end_time": "18:00",
    "title": "Discussion",
    "description": "",
    "location": "Laguna Coast Resort, Naxos",
    "session_type": "break"
  },
  {
    "id": "tue-s2-4",
    "date": "2026-10-06",
    "start_time": "18:00",
    "end_time": "18:15",
    "title": "Sediment Budget and Connectivity over the last 40 years of a small high-mountain cirque in the North Caucasus, Russia",
    "description": "Sheremetev I., Kharchenko S., Golosov V.\n\nSession 2: Denudation, Landscape Evolution and Sediment Sources",
    "location": "Laguna Coast Resort, Naxos",
    "session_type": "session"
  },
  {
    "id": "tue-s2-4-disc",
    "date": "2026-10-06",
    "start_time": "18:15",
    "end_time": "18:20",
    "title": "Discussion",
    "description": "",
    "location": "Laguna Coast Resort, Naxos",
    "session_type": "break"
  },
  {
    "id": "tue-meeting",
    "date": "2026-10-06",
    "start_time": "18:30",
    "end_time": "19:30",
    "title": "DENUCHANGE Business Meeting",
    "description": "Working Group members",
    "location": "Laguna Coast Resort, Naxos",
    "session_type": "session"
  },
  {
    "id": "tue-dinner",
    "date": "2026-10-06",
    "start_time": "19:30",
    "end_time": "22:30",
    "title": "Conference Dinner",
    "description": "Laguna Coast Resort, Naxos",
    "location": "Laguna Coast Resort, Naxos",
    "session_type": "meal"
  },
  {
    "id": "wed-bus",
    "date": "2026-10-07",
    "start_time": "09:10",
    "end_time": "09:25",
    "title": "Bus transfer to venue",
    "description": "Morning bus departure from the central bus station in Naxos Town to Laguna Coast Resort.",
    "location": "Central bus station, Naxos Town",
    "session_type": "social"
  },
  {
    "id": "wed-s3-1",
    "date": "2026-10-07",
    "start_time": "09:30",
    "end_time": "09:45",
    "title": "Wildfire-Induced Denudation Processes in Mediterranean Mountain Catchments",
    "description": "Wittenberg L., Malkinson D., Brook A., Ben Yehuda D., Tessler N., Shtober -Zisu N.\n\nSession 3: Climate Change, Wildfires and Extreme Events (Disturbance-driven denudation and geomorphic hazards)",
    "location": "Laguna Coast Resort, Naxos",
    "session_type": "session"
  },
  {
    "id": "wed-s3-1-disc",
    "date": "2026-10-07",
    "start_time": "09:45",
    "end_time": "09:50",
    "title": "Discussion",
    "description": "",
    "location": "Laguna Coast Resort, Naxos",
    "session_type": "break"
  },
  {
    "id": "wed-s3-2",
    "date": "2026-10-07",
    "start_time": "09:50",
    "end_time": "10:05",
    "title": "The role of upstream contributing area to channel incision: Insights from the 21st-January flash flood of Glyfada, Athens, Greece",
    "description": "Spyrou E., Evelpidou N., Enzel Y.\n\nSession 3: Climate Change, Wildfires and Extreme Events",
    "location": "Laguna Coast Resort, Naxos",
    "session_type": "session"
  },
  {
    "id": "wed-s3-2-disc",
    "date": "2026-10-07",
    "start_time": "10:05",
    "end_time": "10:10",
    "title": "Discussion",
    "description": "",
    "location": "Laguna Coast Resort, Naxos",
    "session_type": "break"
  },
  {
    "id": "wed-s3-3",
    "date": "2026-10-07",
    "start_time": "10:10",
    "end_time": "10:25",
    "title": "Hydrological and sedimentological changes following the 2010-forest fire in the Nahal Oren Basin, Mt. Carmel, Israel – a comparison to pre-fire natural rates",
    "description": "Greenbaum N., Wittenberg L., Malkinson D.\n\nSession 3: Climate Change, Wildfires and Extreme Events",
    "location": "Laguna Coast Resort, Naxos",
    "session_type": "session"
  },
  {
    "id": "wed-s3-3-disc",
    "date": "2026-10-07",
    "start_time": "10:25",
    "end_time": "10:30",
    "title": "Discussion",
    "description": "",
    "location": "Laguna Coast Resort, Naxos",
    "session_type": "break"
  },
  {
    "id": "wed-s3-4",
    "date": "2026-10-07",
    "start_time": "10:30",
    "end_time": "10:45",
    "title": "Late Quaternary extreme erosion post-fire in the southern Levant",
    "description": "Frumkin A.\n\nSession 3: Climate Change, Wildfires and Extreme Events",
    "location": "Laguna Coast Resort, Naxos",
    "session_type": "session"
  },
  {
    "id": "wed-s3-4-disc",
    "date": "2026-10-07",
    "start_time": "10:45",
    "end_time": "10:50",
    "title": "Discussion",
    "description": "",
    "location": "Laguna Coast Resort, Naxos",
    "session_type": "break"
  },
  {
    "id": "wed-s3-5",
    "date": "2026-10-07",
    "start_time": "10:50",
    "end_time": "11:05",
    "title": "HistoricFloods.org: An Open WebGIS Database of Historic Flood Events in Greece (1886–2022)",
    "description": "Liaskos A., Spyrou E., Saitis G., Karkani A., Evelpidou N.\n\nSession 3: Climate Change, Wildfires and Extreme Events",
    "location": "Laguna Coast Resort, Naxos",
    "session_type": "session"
  },
  {
    "id": "wed-s3-5-disc",
    "date": "2026-10-07",
    "start_time": "11:05",
    "end_time": "11:10",
    "title": "Discussion",
    "description": "",
    "location": "Laguna Coast Resort, Naxos",
    "session_type": "break"
  },
  {
    "id": "wed-coffee",
    "date": "2026-10-07",
    "start_time": "11:10",
    "end_time": "11:30",
    "title": "Coffee break",
    "description": "",
    "location": "Laguna Coast Resort, Naxos",
    "session_type": "break"
  },
  {
    "id": "wed-s4-1",
    "date": "2026-10-07",
    "start_time": "11:30",
    "end_time": "11:45",
    "title": "Coastal dune recovery: a case study from the west of Ireland",
    "description": "Lynch K., Cascone S., Morley T.\n\nSession 4: From Catchments to Coasts: Coastal Responses to Sediment Fluxes (How sediment delivery shapes coastal landscapes)",
    "location": "Laguna Coast Resort, Naxos",
    "session_type": "session"
  },
  {
    "id": "wed-s4-1-disc",
    "date": "2026-10-07",
    "start_time": "11:45",
    "end_time": "11:50",
    "title": "Discussion",
    "description": "",
    "location": "Laguna Coast Resort, Naxos",
    "session_type": "break"
  },
  {
    "id": "wed-s4-2",
    "date": "2026-10-07",
    "start_time": "11:50",
    "end_time": "12:05",
    "title": "Seasonal sediment grain-size dynamics along a cliff-dominated beach in the eastern Mediterranean: the role of cliff erosion, waves and wind",
    "description": "Crouvi O., Shemesh R., Katz O., Mushkin A., Lensky N., Jacobi Y., Morag N.\n\nSession 4: From Catchments to Coasts: Coastal Responses to Sediment Fluxes",
    "location": "Laguna Coast Resort, Naxos",
    "session_type": "session"
  },
  {
    "id": "wed-s4-2-disc",
    "date": "2026-10-07",
    "start_time": "12:05",
    "end_time": "12:10",
    "title": "Discussion",
    "description": "",
    "location": "Laguna Coast Resort, Naxos",
    "session_type": "break"
  },
  {
    "id": "wed-s4-3",
    "date": "2026-10-07",
    "start_time": "12:10",
    "end_time": "12:25",
    "title": "The Gialova Lagoon as a Holocene sediment trap: from sediment storage to catchment-scale denudation in the Xirolagkados basin (SW Peloponnese, Greece)",
    "description": "Vespremeanu-Stroe Α., Evelpidou N., Cîrjan A., Preoteasa L., Dobre M., Țuțuianu L., Hanganu D., Cruceru N., Grosu G., Karkani A., Saitis G., Spyrou E., Verga M., Piotrowska N., Mănăilescu C., Tătui F.\n\nSession 4: From Catchments to Coasts: Coastal Responses to Sediment Fluxes",
    "location": "Laguna Coast Resort, Naxos",
    "session_type": "session"
  },
  {
    "id": "wed-s4-3-disc",
    "date": "2026-10-07",
    "start_time": "12:25",
    "end_time": "12:30",
    "title": "Discussion",
    "description": "",
    "location": "Laguna Coast Resort, Naxos",
    "session_type": "break"
  },
  {
    "id": "wed-s4-4",
    "date": "2026-10-07",
    "start_time": "12:30",
    "end_time": "12:45",
    "title": "Preliminary results on coastal morphodynamics from seasonal monitoring at Aghios Georgios, Naxos, Greece",
    "description": "Konstantinidou V., Evelpidou N., Sabatier F., Karkani A., Longour L.\n\nSession 4: From Catchments to Coasts: Coastal Responses to Sediment Fluxes",
    "location": "Laguna Coast Resort, Naxos",
    "session_type": "session"
  },
  {
    "id": "wed-s4-4-disc",
    "date": "2026-10-07",
    "start_time": "12:45",
    "end_time": "12:50",
    "title": "Discussion",
    "description": "",
    "location": "Laguna Coast Resort, Naxos",
    "session_type": "break"
  },
  {
    "id": "wed-poster",
    "date": "2026-10-07",
    "start_time": "12:50",
    "end_time": "13:30",
    "title": "Poster Session",
    "description": "P1. A Regional Morpho-Kinematic Inventory of Periglacial Landforms in the Marginal Permafrost Environment of the Southern Carpathians\nOnaca A., Sîrbu F., Ardelean F., Poncos V., Strozzi T.\n\nP3. The impact of beaver activity on geomorphological processes in mountain streams (Western Carpathians)\nWąs J., Kijowska-Strugała M., Gorczyca E.\n\nP4. Typology and Morphometric Differentiation of Erosional-Denudational Valleys in the Marginal Zones of the Southern Baltic\nPaluszkiewicz R., Winowski M.\n\nP5. Artificial Litter versus Geomorphological Processes: Field Experiments on Litter Movement along Carpathian Valley Slopes\nHaska W., Gorczyca E., Liro M.\n\nP6. Geomorphology of Skiathos\nSoultanis K.\n\nP7. Rockwall weathering and associated rockfall activity in the fjord landscape in western Norway\nLaute K., Beylich A. A.\n\nP8. Sea-Level Forcing and Cliff Retreat on Wolin Island, Southern Baltic Sea, over a 40-Year Period: Temporal and Spatial Variability\nWinowski M., Tylkowski J., Kostrzewski A., Zwoliński Z.\n\nP9. Investigating Subsurface Erosion in a Peculiar Badland Landform in Italy\nSannino A., Vergari F., Ciampi P.\n\nP10. An integrated graph theory and remote sensing approach to functional sediment connectivity analysis in an Alpine proglacial area across multiple temporal scales\nPandey A., Heckmann T., Savi S.\n\nP11. Responses of sediment sources and contemporary denudation rates to environmental changes in selected cold-climate drainage basin systems in Norway\nBeylich A. A., Laute, K.\n\nP12. Geomorphological Nature-based solutions for mitigation of coastal natural hazards (tsunami & coastal floods): The case of Naxos Island\nGogou M., Mavroulis S., Saitis G., Karkani A., Lekkas E., Evelpidou N.\n\nP13. Preliminary Assessment of Nearshore Hydrodynamics and Potential Sediment Mobility in the Alyko Pocket-Beach System, Naxos, Greece\nSaitis G., Evelpidou N., Sabatier F.",
    "location": "Laguna Coast Resort, Naxos",
    "session_type": "session"
  },
  {
    "id": "wed-lunch",
    "date": "2026-10-07",
    "start_time": "13:30",
    "end_time": "15:00",
    "title": "Lunch",
    "description": "",
    "location": "Laguna Coast Resort, Naxos",
    "session_type": "meal"
  },
  {
    "id": "wed-closing",
    "date": "2026-10-07",
    "start_time": "15:00",
    "end_time": "15:30",
    "title": "Closing remarks",
    "description": "",
    "location": "Laguna Coast Resort, Naxos",
    "session_type": "session"
  },
  {
    "id": "wed-vft-intro",
    "date": "2026-10-07",
    "start_time": "15:30",
    "end_time": "16:00",
    "title": "Virtual Field Trip (VFT) Laboratory: Introduction to Virtual Field Trips & Methodology",
    "description": "Tutors: Dr. Anna Karkani, Dr. Giannis Saitis, Alexandros Liaskos\n\nPractical experience in designing and applying Virtual Field Trips for geomorphological research and education. Use of VR headsets to explore immersive examples of Virtual Field Trips firsthand. Fostering active collaboration between members of the DENUCHANGE and VFT Working Groups.\n\nTheoretical framework of VFTs, equipment selection, workflow, and showcase of diverse VFT creation tools (e.g., ArcGIS StoryMaps, Google Earth)",
    "location": "Laguna Coast Resort, Naxos",
    "session_type": "session"
  },
  {
    "id": "wed-vft-rot-a",
    "date": "2026-10-07",
    "start_time": "16:00",
    "end_time": "16:40",
    "title": "Virtual Field Trip (VFT) Laboratory: Rotation A (Parallel Groups)",
    "description": "Group 1 (Field Data Collection): Data collection techniques (360° imagery and mobile device usage).\n\nGroup 2 (VR Exploration): Immersive VR headset experience; exploring diverse VFT examples.",
    "location": "Laguna Coast Resort, Naxos",
    "session_type": "session"
  },
  {
    "id": "wed-vft-break",
    "date": "2026-10-07",
    "start_time": "16:40",
    "end_time": "16:50",
    "title": "Transition & Short Break",
    "description": "Switchover between groups.",
    "location": "Laguna Coast Resort, Naxos",
    "session_type": "break"
  },
  {
    "id": "wed-vft-rot-b",
    "date": "2026-10-07",
    "start_time": "16:50",
    "end_time": "17:30",
    "title": "Virtual Field Trip (VFT) Laboratory: Rotation B (Parallel Groups)",
    "description": "Group 1 (VR Exploration): Immersive VR headset experience; exploring diverse VFT examples.\n\nGroup 2 (Field Data Collection): Data collection techniques (360° imagery and mobile device usage).",
    "location": "Laguna Coast Resort, Naxos",
    "session_type": "session"
  },
  {
    "id": "wed-vft-synthesis",
    "date": "2026-10-07",
    "start_time": "17:30",
    "end_time": "18:30",
    "title": "Virtual Field Trip (VFT) Laboratory: Synthesis",
    "description": "Computer-based demonstration: Integrating collected field data into different virtual environments to develop a VFT.",
    "location": "Laguna Coast Resort, Naxos",
    "session_type": "session"
  }
]
