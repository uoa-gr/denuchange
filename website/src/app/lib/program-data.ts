// DENUCHANGE 2026 Workshop Program & Announcements
// Based on the official DENUCHANGE_Program.pdf and its verified public agenda.
// The app retains its existing normalization of two printed timing typos below.

export interface ProgramSession {
  id: string
  date: string
  start_time: string
  // Empty when the source specifies a start time without an end time.
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
    "id": "alert-wednesday-session3-venue-20261006",
    "title": "Wednesday Session 3: Naxos City Hall at 09:30",
    "body": "On Wednesday, 7 October, Session 3 will take place at Naxos City Hall, starting at 09:30. Please be at the entrance on the side opposite the basketball court at 09:30. Location: https://maps.app.goo.gl/RwyAEEyAK7FjZZA78",
    "created_at": "2026-10-06T17:46:02.000Z"
  },
  {
    "id": "alert-conversation-in-stone-20261005",
    "title": "A Conversation in Stone: Tuesday Parallel Event",
    "body": "A Conversation in Stone with artist Tom Von Kaenel will take place on Tuesday, 6 October, 18:30–19:30 at Laguna Coast Resort, in parallel with the DENUCHANGE Business Meeting, for participants not attending the meeting.",
    "created_at": "2026-10-05T12:25:13.000Z"
  },
  {
    "id": "alert-tuesday-program-update-20261005",
    "title": "Tuesday Program Update: Bus at 09:00 & Presentation Cancellation",
    "body": "On Tuesday, 6 October, the bus to the venue will depart at 09:00 from the central bus station in Naxos Town, replacing the previously announced 08:45 departure. Please arrive a few minutes early. The 09:00–09:30 registration has been removed from Tuesday’s program; the opening remains at 09:30. The oral presentation ‘SWAT-based modelling of water runoff and suspended sediment transport in catchments across diverse morphoclimatic zones’ by Gudowicz J., Bochenek W., Kijowska-Strugała M., Majewski M. and Zwoliński Z. will not take place, and its associated discussion has been removed. The remaining presentation times are unchanged. Please check the Program tab or View Detailed Program on the homepage for the updated agenda.",
    "created_at": "2026-10-05T06:42:03.000Z"
  },
  {
    "id": "alert-agenda-update-20261003",
    "title": "Workshop Agenda Updated",
    "body": "On Tuesday, 6 October, Santoro G.’s presentation on erosion modelling in Aliano is now at 12:55–13:10 in Session 1. Posazhennikova V.’s presentation on debris-flow susceptibility in the Greater Caucasus is now at 17:20–17:35 in Session 2. Dr. Mihai Micu has been added to the welcome speeches (09:30–10:00). The agenda now lists all session chairs and Wednesday’s closing speakers, Prof. Achim A. Beylich and Prof. Zbigniew Zwoliński (15:00–15:30). Please check the Program tab or View Detailed Program on the homepage for the updated agenda.",
    "created_at": "2026-10-03T10:07:00.000Z"
  },
  {
    "id": "alert-agenda-update-20260927",
    "title": "Program Schedule Updated",
    "body": "The workshop agenda has been updated with timing adjustments for Tuesday Session 2 (including a coffee break at 17:00), revised timings for Wednesday's Poster Session and Lunch, and the addition of a lecture by Kirki Kefalea at 14:45. Please check the Program tab or view the detailed program from the homepage.",
    "created_at": "2026-09-27T19:00:00.000Z"
  },
  {
    "id": "alert-updated-agenda-20260923",
    "title": "Updated Workshop Agenda & Program",
    "body": "The official workshop agenda has been updated. The detailed schedule for October 6–7, 2026—including opening lectures, thematic oral sessions, the poster session, and the Virtual Field Trip Laboratory—is now available in the Program section. You can also view the detailed program directly from the homepage.",
    "created_at": "2026-09-24T12:00:00.000Z"
  }
]

export const DEFAULT_PROGRAM_SESSIONS: ProgramSession[] = [
  {
    "id": "mon-bus",
    "date": "2026-10-05",
    "start_time": "18:45",
    "end_time": "",
    "title": "Bus transfer to venue",
    "description": "For the ice breaker event, a bus service to the venue will be provided at 18:45 departing from the central bus station in Naxos Town.",
    "location": "Central bus station, Naxos Town",
    "session_type": "social"
  },
  {
    "id": "mon-icebreaker",
    "date": "2026-10-05",
    "start_time": "19:00",
    "end_time": "",
    "title": "ICE BREAKER",
    "description": "Registration · A welcome evening with light dinner and drinks.",
    "location": "Laguna Coast Resort, Naxos",
    "session_type": "social"
  },
  {
    "id": "tue-bus",
    "date": "2026-10-06",
    "start_time": "09:00",
    "end_time": "",
    "title": "Bus transfer to venue",
    "description": "On Tuesday, 6 October, the bus service to the venue will depart at 09:00 from the central bus station in Naxos Town (https://maps.app.goo.gl/PsK22G3EVy2mAKBL8). The journey takes approximately 10 minutes. Return transfer will also be provided at the end of the day’s activities.\n\nPlease note that this is the only scheduled Tuesday morning departure. Participants are kindly asked to arrive at the departure point a few minutes in advance.",
    "location": "Central bus station, Naxos Town",
    "session_type": "social"
  },
  {
    "id": "tue-welcome",
    "date": "2026-10-06",
    "start_time": "09:30",
    "end_time": "10:00",
    "title": "Opening: Welcome speeches & Event Opening",
    "description": "Welcome speeches:\nProf. Niki Evelpidou, Chair of the organising committee / Department of Geology and Geoenvironment, National and Kapodistrian University of Athens\nProf. Assimina Antonarakou, President, Department of Geology and Geoenvironment, National and Kapodistrian University of Athens\nDimitris Lianos, Mayor of Municipality of Naxos and Small Cyclades\nVasilis Flerianos, Deputy Mayor for Culture, Municipality of Naxos and Small Cyclades\nDr. Mihai Micu, President of the International Association of Geomorphologists /Institute of Geography, Romanian Academy\nProf. Achim A. Beylich, Chair of the IAG WG DENUCHANGE / Geomorphological Field Laboratory\nProf. Zbigniew Zwoliński, Co-Chair of the IAG WG DENUCHANGE / Institute of Geoecology and Geoinformation, Adam Mickiewicz University\n\nEvent Opening:\nProf. Efstathios Efstathopoulos, Vice-Rector for Research and Innovation, National and Kapodistrian University of Athens",
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
    "description": "Pitaras A., Dimopoulos G.",
    "location": "Laguna Coast Resort, Naxos",
    "session_type": "session"
  },
  {
    "id": "tue-keynote-vespremeanu",
    "date": "2026-10-06",
    // Printed as 11:45-11:15 in the PDF; the app keeps its existing 10:45 start.
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
    "id": "tue-s1-2",
    "date": "2026-10-06",
    "start_time": "11:55",
    "end_time": "12:10",
    "title": "From LiDAR to Water-Level Animation: Visualizing Reservoir Storage Dynamics in the Mavrokolympos reservoir basin, Cyprus",
    "description": "Roussou O., Moysidou L., Agapiou A., Skarlatos D., Papakonstantinou A.\n\nSession 1: Catchment Hydrology, Sediment Connectivity and Modelling (Understanding how sediment is mobilised, transported and monitored)\nChairs: Achim Beylich, Giannis Saitis",
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
    "title": "Toward the integration of historical data in erosion modelling: the case of Badlands landscapes of Aliano (Basilicata, Southern Italy)",
    "description": "Santoro G., Mairota P., Capolongo D., Marsico A.\n\nSession 1: Catchment Hydrology, Sediment Connectivity and Modelling",
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
    "id": "tue-coffee-2",
    "date": "2026-10-06",
    "start_time": "17:00",
    "end_time": "17:20",
    "title": "Coffee break",
    "description": "",
    "location": "Laguna Coast Resort, Naxos",
    "session_type": "break"
  },
  {
    "id": "tue-s2-1",
    "date": "2026-10-06",
    "start_time": "17:20",
    "end_time": "17:35",
    "title": "Debris flow release susceptibility and sediment connectivity in the Russian sector of the Greater Caucasus",
    "description": "Posazhennikova V., Golosov V. N., Kharchenko S. V.\n\nSession 2: Denudation, Landscape Evolution and Sediment Sources (From long-term landscape evolution to sediment production)\nChairs: Zbigniew Zwoliński, Nurit Shtober-Zisu",
    "location": "Laguna Coast Resort, Naxos",
    "session_type": "session"
  },
  {
    "id": "tue-s2-1-disc",
    "date": "2026-10-06",
    "start_time": "17:35",
    "end_time": "17:40",
    "title": "Discussion",
    "description": "",
    "location": "Laguna Coast Resort, Naxos",
    "session_type": "break"
  },
  {
    "id": "tue-s2-2",
    "date": "2026-10-06",
    "start_time": "17:40",
    "end_time": "17:55",
    "title": "Climate-Driven Shifts in Denudational Regimes of a Lowland Fluvial System",
    "description": "Szpikowski J., Szpikowska G., Zwoliński Zb., Mazurek M., Kruszyk R., Kostrzewski A.\n\nSession 2: Denudation, Landscape Evolution and Sediment Sources",
    "location": "Laguna Coast Resort, Naxos",
    "session_type": "session"
  },
  {
    "id": "tue-s2-2-disc",
    "date": "2026-10-06",
    "start_time": "17:55",
    "end_time": "18:00",
    "title": "Discussion",
    "description": "",
    "location": "Laguna Coast Resort, Naxos",
    "session_type": "break"
  },
  {
    "id": "tue-s2-3",
    "date": "2026-10-06",
    "start_time": "18:00",
    "end_time": "18:15",
    "title": "Denudation hotspots in Italy: Towards the first national spatial dataset of badlands distribution",
    "description": "La Licata M., Maerker M., Panagos P. & Borrelli P.\n\nSession 2: Denudation, Landscape Evolution and Sediment Sources",
    "location": "Laguna Coast Resort, Naxos",
    "session_type": "session"
  },
  {
    "id": "tue-s2-3-disc",
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
    "id": "tue-conversation-in-stone",
    "date": "2026-10-06",
    "start_time": "18:30",
    "end_time": "19:30",
    "title": "A Conversation in Stone",
    "description": "Artist Tom Von Kaenel\n\nParallel event for participants not attending the business meeting.",
    "location": "Laguna Coast Resort, Naxos",
    "session_type": "session"
  },
  {
    "id": "tue-dinner",
    "date": "2026-10-06",
    "start_time": "19:30",
    "end_time": "",
    "title": "Conference Dinner",
    "description": "Laguna Coast Resort, Naxos",
    "location": "Laguna Coast Resort, Naxos",
    "session_type": "meal"
  },
  {
    "id": "wed-s3-venue",
    "date": "2026-10-07",
    "start_time": "09:30",
    "end_time": "",
    "title": "Session 3 venue: Naxos City Hall",
    "description": "On Wednesday, 7 October, Session 3 will take place at Naxos City Hall at 09:30. Please be at the entrance on the side opposite the basketball court.\n\nLocation: https://maps.app.goo.gl/RwyAEEyAK7FjZZA78",
    "location": "Naxos City Hall",
    "session_type": "social"
  },
  {
    "id": "wed-s3-1",
    "date": "2026-10-07",
    "start_time": "09:30",
    "end_time": "09:45",
    "title": "Wildfire-Induced Denudation Processes in Mediterranean Mountain Catchments",
    "description": "Wittenberg L., Malkinson D., Brook A., Ben Yehuda D., Tessler N., Shtober-Zisu N.\n\nSession 3: Climate Change, Wildfires and Extreme Events (Disturbance-driven denudation and geomorphic hazards)\nChairs: Mihaela Verga, Anna Karkani",
    "location": "Naxos City Hall",
    "session_type": "session"
  },
  {
    "id": "wed-s3-1-disc",
    "date": "2026-10-07",
    "start_time": "09:45",
    "end_time": "09:50",
    "title": "Discussion",
    "description": "",
    "location": "Naxos City Hall",
    "session_type": "break"
  },
  {
    "id": "wed-s3-2",
    "date": "2026-10-07",
    "start_time": "09:50",
    "end_time": "10:05",
    "title": "The role of upstream contributing area to channel incision: Insights from the 21st-January flash flood of Glyfada, Athens, Greece",
    "description": "Spyrou E., Evelpidou N., Enzel Y.\n\nSession 3: Climate Change, Wildfires and Extreme Events",
    "location": "Naxos City Hall",
    "session_type": "session"
  },
  {
    "id": "wed-s3-2-disc",
    "date": "2026-10-07",
    "start_time": "10:05",
    "end_time": "10:10",
    "title": "Discussion",
    "description": "",
    "location": "Naxos City Hall",
    "session_type": "break"
  },
  {
    "id": "wed-s3-3",
    "date": "2026-10-07",
    "start_time": "10:10",
    "end_time": "10:25",
    "title": "Hydrological and sedimentological changes following the 2010-forest fire in the Nahal Oren Basin, Mt. Carmel, Israel – a comparison to pre-fire natural rates",
    "description": "Greenbaum N., Wittenberg L., Malkinson D.\n\nSession 3: Climate Change, Wildfires and Extreme Events",
    "location": "Naxos City Hall",
    "session_type": "session"
  },
  {
    "id": "wed-s3-3-disc",
    "date": "2026-10-07",
    "start_time": "10:25",
    "end_time": "10:30",
    "title": "Discussion",
    "description": "",
    "location": "Naxos City Hall",
    "session_type": "break"
  },
  {
    "id": "wed-s3-4",
    "date": "2026-10-07",
    "start_time": "10:30",
    "end_time": "10:45",
    "title": "Late Quaternary extreme erosion post-fire in the southern Levant",
    "description": "Frumkin A.\n\nSession 3: Climate Change, Wildfires and Extreme Events",
    "location": "Naxos City Hall",
    "session_type": "session"
  },
  {
    "id": "wed-s3-4-disc",
    "date": "2026-10-07",
    "start_time": "10:45",
    "end_time": "10:50",
    "title": "Discussion",
    "description": "",
    "location": "Naxos City Hall",
    "session_type": "break"
  },
  {
    "id": "wed-s3-5",
    "date": "2026-10-07",
    "start_time": "10:50",
    "end_time": "11:05",
    "title": "HistoricFloods.org: An Open WebGIS Database of Historic Flood Events in Greece (1886–2022)",
    "description": "Liaskos A., Spyrou E., Saitis G., Karkani A., Evelpidou N.\n\nSession 3: Climate Change, Wildfires and Extreme Events",
    "location": "Naxos City Hall",
    "session_type": "session"
  },
  {
    "id": "wed-s3-5-disc",
    "date": "2026-10-07",
    "start_time": "11:05",
    "end_time": "11:10",
    "title": "Discussion",
    "description": "",
    "location": "Naxos City Hall",
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
    "description": "Lynch K., Cascone S., Morley T.\n\nSession 4: From Catchments to Coasts: Coastal Responses to Sediment Fluxes (How sediment delivery shapes coastal landscapes)\nChairs: Katja Laute, Niki Evelpidou",
    "location": "Laguna Coast Resort, Naxos",
    "session_type": "session"
  },
  {
    "id": "wed-s4-1-disc",
    "date": "2026-10-07",
    // Printed as 11:45-11:-50 in the PDF; the app keeps its existing 11:50 end.
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
    "title": "From Open Bay to Coastal Lagoon: Holocene Landscape Evolution of the Voidokilia–Gialova Coastal System",
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
    "end_time": "13:15",
    "title": "Poster Session",
    "description": "P1. The impact of beaver activity on geomorphological processes in mountain streams (Western Carpathians)\nWąs J., Kijowska-Strugała M., Gorczyca E.\n\nP2. Typology and Morphometric Differentiation of Erosional-Denudational Valleys in the Marginal Zones of the Southern Baltic\nPaluszkiewicz R., Winowski M.\n\nP3. Artificial Litter versus Geomorphological Processes: Field Experiments on Litter Movement along Carpathian Valley Slopes\nHaska W., Gorczyca E., Liro M.\n\nP4. Geomorphology of Skiathos\nSoultanis K.\n\nP5. Rockwall weathering and associated rockfall activity in the fjord landscape in western Norway\nLaute K., Beylich A. A.\n\nP6. Sea-Level Forcing and Cliff Retreat on Wolin Island, Southern Baltic Sea, over a 40-Year Period: Temporal and Spatial Variability\nWinowski M., Tylkowski J., Kostrzewski A., Zwoliński Z.\n\nP7. Investigating Subsurface Erosion in a Peculiar Badland Landform in Italy\nSannino A., Vergari F., Ciampi P.\n\nP8. An integrated graph theory and remote sensing approach to functional sediment connectivity analysis in an Alpine proglacial area across multiple temporal scales\nPandey A., Heckmann T., Savi S.\n\nP9. Responses of sediment sources and contemporary denudation rates to environmental changes in selected cold-climate drainage basin systems in Norway\nBeylich A. A., Laute, K.\n\nP10. Geomorphological Nature-based solutions for mitigation of coastal natural hazards (tsunami & coastal floods): The case of Naxos Island\nGogou M., Mavroulis S., Saitis G., Karkani A., Lekkas E., Evelpidou N.",
    "location": "Laguna Coast Resort, Naxos",
    "session_type": "session"
  },
  {
    "id": "wed-lunch",
    "date": "2026-10-07",
    "start_time": "13:15",
    "end_time": "14:45",
    "title": "Lunch",
    "description": "",
    "location": "Laguna Coast Resort, Naxos",
    "session_type": "meal"
  },
  {
    "id": "wed-kefalea",
    "date": "2026-10-07",
    "start_time": "14:45",
    "end_time": "15:00",
    "title": "From the “Dream on the wave” to the “Waste land”: Nature, War, and the Loss of Human Harmony in the work of Alexandros Papadiamantis, T.S. Eliot and W.B. Yeats",
    "description": "Kirki Kefalea",
    "location": "Laguna Coast Resort, Naxos",
    "session_type": "session"
  },
  {
    "id": "wed-closing",
    "date": "2026-10-07",
    "start_time": "15:00",
    "end_time": "15:30",
    "title": "Closing remarks",
    "description": "Prof. Achim A. Beylich, Chair of the IAG WG DENUCHANGE / Geomorphological Field Laboratory\nProf. Zbigniew Zwoliński, Co-Chair of the IAG WG DENUCHANGE / Institute of Geoecology and Geoinformation, Adam Mickiewicz University",
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
