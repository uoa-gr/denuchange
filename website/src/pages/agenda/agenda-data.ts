// Transcribed from the supplied DENUCHANGE_Program.pdf (8 pages).
// Source spellings and printed time anomalies are preserved, with approved
// programme updates including the poster withdrawal and sequential numbering.
export interface AgendaEntry {
  time: string;
  title: string;
  speakers?: string[];
  paragraphs?: string[];
  kind?: 'break' | 'meal' | 'social';
}

export interface AgendaPoster {
  number: string;
  title: string;
  authors: string;
}

export interface AgendaBlock {
  title?: string;
  subtitle?: string;
  chairs?: string;
  description?: string;
  tutors?: string;
  entries: AgendaEntry[];
  posters?: AgendaPoster[];
}

export interface AgendaDay {
  id: string;
  date: string;
  label: string;
  blocks: AgendaBlock[];
}

export const agendaTitle = 'IAG DENUCHANGE Workshop 2026';
export const agendaSubtitle = '5th International Workshop on Denudation and Climate Change';
export const agendaLocationDate = 'Naxos, Greece 6 - 7 October 2026';

export const organizingBodies = [
  { name: 'National and Kapodistrian University of Athens', image: '/images/logo-nkua.jpg' },
  { name: 'Laguna Coast Foundation', image: '/images/laguna-coast-foundation.png' },
  { name: 'International Association of Geomorphologists', image: '/images/logo-iag.jpg' },
  { name: 'IAG Working Group Denudation and Environmental Changes in Different Morphoclimatic Zones (DENUCHANGE)', image: '/images/logo-denuchange.jpg' },
  { name: 'IAG Working Group Virtual Trips in Geomorphology', image: '/images/logo-vft-working-group.png' },
];

export const supportedBy = {
  name: 'Municipality of Naxos and Small Cyclades',
  image: '/images/municipality-naxos-small-cyclades.png',
};

export const organizingCommittee = [
  'Prof. Niki Evelpidou, Faculty of Geology & Geoenvironment, National & Kapodistrian University of Athens, Greece',
  'Prof. Assimina Antonarakou, Faculty of Geology & Geoenvironment, National & Kapodistrian University of Athens, Greece',
  'Dr. Anna Karkani, Faculty of Geology & Geoenvironment, National & Kapodistrian University of Athens, Greece',
  'Dr. Giannis Saitis, Faculty of Geology & Geoenvironment, National & Kapodistrian University of Athens, Greece',
];

export const scientificCommittee = [
  'Dr. Achim A. Beylich, Geomorphological Field Laboratory, Norway',
  'Prof. Niki Evelpidou, National & Kapodistrian University of Athens, Greece',
  'Dr. Anna Karkani, National & Kapodistrian University of Athens, Greece',
  'Dr. Eliza Płaczkowska, University of Wrocław, Poland',
  'Prof. Nurit Shtober-Zisu, University of Haifa, Israel',
  'Dr. Giannis Saitis, National & Kapodistrian University of Athens, Greece',
  'Prof. Zbigniew Zwoliński, Adam Mickiewicz University, Poland',
];

export const venueName = 'Laguna Coast Resort, Naxos';
export const venueUrl = 'https://maps.app.goo.gl/iDLaAnaS7PCajEDv5';
export const busStationUrl = 'https://maps.app.goo.gl/PsK22G3EVy2mAKBL8';
export const transportParagraphs = [
  'For the ice breaker event, a bus service to the venue will be provided at 18:45 departing from the central bus station in Naxos Town.',
  `On both days of the workshop, a single bus service to the venue will be provided in the morning, departing from the central bus station in Naxos Town (${busStationUrl}). The journey takes approximately 10 minutes. Return transfer will also be provided at the end of the day’s activities.`,
  'Departures: Tuesday 6 October at 08:45 · Wednesday 7 October at 09:10',
  'Please note that this is the only scheduled morning departure on each day. Participants are kindly asked to arrive at the departure point a few minutes in advance.',
];


export const days: AgendaDay[] = [
  {
    id: 'monday',
    date: '2026-10-05',
    label: 'Monday, 5 October 2026',
    blocks: [
      {
        title: 'ICE BREAKER',
        entries: [
          { time: '19:00', title: 'Registration' },
          {
            time: '19:00',
            title: 'A welcome evening with light dinner and drinks.',
            kind: 'social',
            paragraphs: [
              `${venueName} — ${venueUrl}`,
              transportParagraphs[0],
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'tuesday',
    date: '2026-10-06',
    label: 'Tuesday, 6 October 2026',
    blocks: [
      {
        entries: [{ time: '09:00 - 09:30', title: 'Registration' }],
      },
      {
        title: 'Opening',
        subtitle: 'Welcome, Introductory lecture and Invited keynote lecture',
        entries: [
          {
            time: '09:30-10:00',
            title: 'Welcome speeches',
            speakers: [
              'Prof. Niki Evelpidou, Chair of the organising committee / Department of Geology and Geoenvironment, National and Kapodistrian University of Athens',
              'Prof. Assimina Antonarakou, President, Department of Geology and Geoenvironment, National and Kapodistrian University of Athens',
              'Dimitris Lianos, Mayor of Municipality of Naxos and Small Cyclades',
              'Vasilis Flerianos, Deputy Mayor for Culture, Municipality of Naxos and Small Cyclades',
              'Dr. Mihai Micu, President of the International Association of Geomorphologists /Institute of Geography, Romanian Academy',
              'Prof. Achim A. Beylich, Chair of the IAG WG DENUCHANGE / Geomorphological Field Laboratory',
              'Prof. Zbigniew Zwoliński, Co-Chair of the IAG WG DENUCHANGE / Institute of Geoecology and Geoinformation, Adam Mickiewicz University',
            ],
            paragraphs: [
              'Event Opening',
              'Prof. Efstathios Efstathopoulos, Vice-Rector for Research and Innovation, National and Kapodistrian University of Athens',
            ],
          },
          {
            time: '10:00-10:30',
            title: 'The IAG Working Group on Denudation and Environmental Changes in Different Morphoclimatic Zones (DENUCHANGE, 2017-2030): Scientific need, research questions, outcomes and possible future directions',
            speakers: ['Beylich A.'],
          },
          {
            time: '10:30-10:45',
            title: 'From Sustainable Tourism to Regenerative Island Development: The Laguna Pilot Model',
            speakers: ['Pitaras, A.'],
          },
          {
            time: '11:45-11:15',
            title: 'From Deglaciation to Rock Glaciers: Timing and Patterns of Rock-Wall Debris Production in the Southern Carpathians',
            paragraphs: ['Invited keynote lecture'],
            speakers: ['Vespremeanu Stroe, Α.'],
          },
          { time: '11:15-11:35', title: 'Coffee break', kind: 'break' },
        ],
      },
      {
        title: 'Session 1: Catchment Hydrology, Sediment Connectivity and Modelling',
        subtitle: 'Understanding how sediment is mobilised, transported and monitored',
        chairs: 'Chairs: Achim Beylich, Giannis Saitis',
        entries: [
          {
            time: '11:35-11:50',
            title: 'SWAT-based modelling of water runoff and suspended sediment transport in catchments across diverse morphoclimatic zones',
            speakers: ['Gudowicz J., Bochenek W., Kijowska-Strugała M., Majewski M., Zwoliński Z.'],
          },
          { time: '11:50-11:55', title: 'Discussion', kind: 'break' },
          {
            time: '11:55-12:10',
            title: 'From LiDAR to Water-Level Animation: Visualizing Reservoir Storage Dynamics in the Mavrokolympos reservoir basin, Cyprus',
            speakers: ['Roussou O., Moysidou L., Agapiou A., Skarlatos D., Papakonstantinou A.'],
          },
          { time: '12:10-12:15', title: 'Discussion', kind: 'break' },
          {
            time: '12:15-12:30',
            title: 'Cumulative mountain forest disturbance impacts on 23-year suspended sediment dynamics in a humid headwater catchment of southwestern Japan',
            speakers: ['Koyanagi K., Shinohara Y., Takagi M.'],
          },
          { time: '12:30-12:35', title: 'Discussion', kind: 'break' },
          {
            time: '12:35-12:50',
            title: 'Structural connectivity in sediment transfer in the foothill Stara Rzeka catchment',
            speakers: ['Święchowicz J., Michno A., Ostafin K., Najwer A.'],
          },
          { time: '12:50-12:55', title: 'Discussion', kind: 'break' },
          {
            time: '12:55-13:10',
            title: 'Toward the integration of historical data in erosion modelling: the case of Badlands landscapes of Aliano (Basilicata, Southern Italy)',
            speakers: ['Santoro G., Mairota P., Capolongo D., Marsico A.'],
          },
          { time: '13:10-13:15', title: 'Discussion', kind: 'break' },
        ],
      },
      {
        entries: [
          { time: '13:15-14:45', title: 'Light Lunch', kind: 'meal' },
          { time: '14:45-17:00', title: 'Visit to the Laguna site', kind: 'social' },
          { time: '17:00-17:20', title: 'Coffee break', kind: 'break' },
        ],
      },
      {
        title: 'Session 2: Denudation, Landscape Evolution and Sediment Sources',
        subtitle: 'From long-term landscape evolution to sediment production',
        chairs: 'Chairs: Zbigniew Zwoliński, Nurit Shtober-Zisu',
        entries: [
          {
            time: '17:20-17:35',
            title: 'Debris flow release susceptibility and sediment connectivity in the Russian sector of the Greater Caucasus',
            speakers: ['Posazhennikova V., Golosov V. N., Kharchenko S. V.'],
          },
          { time: '17:35-17:40', title: 'Discussion', kind: 'break' },
          {
            time: '17:40-17:55',
            title: 'Climate-Driven Shifts in Denudational Regimes of a Lowland Fluvial System',
            speakers: ['Szpikowski J., Szpikowska G., Zwoliński Zb., Mazurek M., Kruszyk R., Kostrzewski A.'],
          },
          { time: '17:55-18:00', title: 'Discussion', kind: 'break' },
          {
            time: '18:00-18:15',
            title: 'Denudation hotspots in Italy: Towards the first national spatial dataset of badlands distribution',
            speakers: ['La Licata M., Maerker M., Panagos P. & Borrelli P.'],
          },
          { time: '18:15-18:20', title: 'Discussion', kind: 'break' },
        ],
      },
      {
        entries: [
          {
            time: '18:30-19:30',
            title: 'DENUCHANGE Business Meeting',
            paragraphs: ['Working Group members'],
          },
          {
            time: '19:30',
            title: 'Conference Dinner',
            paragraphs: [`${venueName} — ${venueUrl}`],
            kind: 'meal',
          },
        ],
      },
    ],
  },
  {
    id: 'wednesday',
    date: '2026-10-07',
    label: 'Wednesday, 7 October 2026',
    blocks: [
      {
        title: 'Session 3: Climate Change, Wildfires and Extreme Events',
        subtitle: 'Disturbance-driven denudation and geomorphic hazards',
        chairs: 'Chairs: Mihaela Verga, Anna Karkani',
        entries: [
          {
            time: '09:30-09:45',
            title: 'Wildfire-Induced Denudation Processes in Mediterranean Mountain Catchments',
            speakers: ['Wittenberg L., Malkinson D., Brook A., Ben Yehuda D., Tessler N., Shtober-Zisu N.'],
          },
          { time: '09:45-09:50', title: 'Discussion', kind: 'break' },
          {
            time: '09:50-10:05',
            title: 'The role of upstream contributing area to channel incision: Insights from the 21st-January flash flood of Glyfada, Athens, Greece',
            speakers: ['Spyrou E., Evelpidou N., Enzel Y.'],
          },
          { time: '10:05-10:10', title: 'Discussion', kind: 'break' },
          {
            time: '10:10-10:25',
            title: 'Hydrological and sedimentological changes following the 2010-forest fire in the Nahal Oren Basin, Mt. Carmel, Israel – a comparison to pre-fire natural rates',
            speakers: ['Greenbaum N., Wittenberg L., Malkinson D.'],
          },
          { time: '10:25-10:30', title: 'Discussion', kind: 'break' },
          {
            time: '10:30-10:45',
            title: 'Late Quaternary extreme erosion post-fire in the southern Levant',
            speakers: ['Frumkin A.'],
          },
          { time: '10:45-10:50', title: 'Discussion', kind: 'break' },
          {
            time: '10:50-11:05',
            title: 'HistoricFloods.org: An Open WebGIS Database of Historic Flood Events in Greece (1886–2022)',
            speakers: ['Liaskos A., Spyrou E., Saitis G., Karkani A., Evelpidou N.'],
          },
          { time: '11:05-11:10', title: 'Discussion', kind: 'break' },
        ],
      },
      { entries: [{ time: '11:10-11:30', title: 'Coffee break', kind: 'break' }] },
      {
        title: 'Session 4: From Catchments to Coasts: Coastal Responses to Sediment Fluxes',
        subtitle: 'How sediment delivery shapes coastal landscapes',
        chairs: 'Chairs: Katja Laute, Niki Evelpidou',
        entries: [
          {
            time: '11:30-11:45',
            title: 'Coastal dune recovery: a case study from the west of Ireland',
            speakers: ['Lynch K., Cascone S., Morley T.'],
          },
          { time: '11:45-11:-50', title: 'Discussion', kind: 'break' },
          {
            time: '11:50-12:05',
            title: 'Seasonal sediment grain-size dynamics along a cliff-dominated beach in the eastern Mediterranean: the role of cliff erosion, waves and wind',
            speakers: ['Crouvi O., Shemesh R., Katz O., Mushkin A., Lensky N., Jacobi Y., Morag N.'],
          },
          { time: '12:05-12:10', title: 'Discussion', kind: 'break' },
          {
            time: '12:10-12:25',
            title: 'The Gialova Lagoon as a Holocene sediment trap: from sediment storage to catchment-scale denudation in the Xirolagkados basin (SW Peloponnese, Greece)',
            speakers: ['Vespremeanu-Stroe Α., Evelpidou N., Cîrjan A., Preoteasa L., Dobre M., Țuțuianu L., Hanganu D., Cruceru N., Grosu G., Karkani A., Saitis G., Spyrou E., Verga M., Piotrowska N., Mănăilescu C., Tătui F.'],
          },
          { time: '12:25-12:30', title: 'Discussion', kind: 'break' },
          {
            time: '12:30-12:45',
            title: 'Preliminary results on coastal morphodynamics from seasonal monitoring at Aghios Georgios, Naxos, Greece',
            speakers: ['Konstantinidou V., Evelpidou N., Sabatier F., Karkani A., Longour L.'],
          },
          { time: '12:45-12:50', title: 'Discussion', kind: 'break' },
        ],
      },
      {
        title: 'Poster Session',
        entries: [{ time: '12:50 – 13:15', title: 'Poster Session' }],
        posters: [
          {
            number: 'P1',
            title: 'The impact of beaver activity on geomorphological processes in mountain streams (Western Carpathians)',
            authors: 'Wąs J., Kijowska-Strugała M., Gorczyca E.',
          },
          {
            number: 'P2',
            title: 'Typology and Morphometric Differentiation of Erosional-Denudational Valleys in the Marginal Zones of the Southern Baltic',
            authors: 'Paluszkiewicz R., Winowski M.',
          },
          {
            number: 'P3',
            title: 'Artificial Litter versus Geomorphological Processes: Field Experiments on Litter Movement along Carpathian Valley Slopes',
            authors: 'Haska W., Gorczyca E., Liro M.',
          },
          {
            number: 'P4',
            title: 'Geomorphology of Skiathos',
            authors: 'Soultanis K.',
          },
          {
            number: 'P5',
            title: 'Rockwall weathering and associated rockfall activity in the fjord landscape in western Norway',
            authors: 'Laute K., Beylich A. A.',
          },
          {
            number: 'P6',
            title: 'Sea-Level Forcing and Cliff Retreat on Wolin Island, Southern Baltic Sea, over a 40-Year Period: Temporal and Spatial Variability',
            authors: 'Winowski M., Tylkowski J., Kostrzewski A., Zwoliński Z.',
          },
          {
            number: 'P7',
            title: 'Investigating Subsurface Erosion in a Peculiar Badland Landform in Italy',
            authors: 'Sannino A., Vergari F., Ciampi P.',
          },
          {
            number: 'P8',
            title: 'An integrated graph theory and remote sensing approach to functional sediment connectivity analysis in an Alpine proglacial area across multiple temporal scales',
            authors: 'Pandey A., Heckmann T., Savi S.',
          },
          {
            number: 'P9',
            title: 'Responses of sediment sources and contemporary denudation rates to environmental changes in selected cold-climate drainage basin systems in Norway',
            authors: 'Beylich A. A., Laute, K.',
          },
          {
            number: 'P10',
            title: 'Geomorphological Nature-based solutions for mitigation of coastal natural hazards (tsunami & coastal floods): The case of Naxos Island',
            authors: 'Gogou M., Mavroulis S., Saitis G., Karkani A., Lekkas E., Evelpidou N.',
          },
        ],
      },
      {
        entries: [
          { time: '13:15-14:45', title: 'Lunch', kind: 'meal' },
          {
            time: '14:45-15:00',
            title: 'From the “Dream on the wave” to the “Waste land”: Nature, War, and the Loss of Human Harmony in the work of Alexandros Papadiamantis, T.S. Eliot and W.B. Yeats',
            speakers: ['Kirki Kefalea'],
          },
          {
            time: '15:00-15:30',
            title: 'Closing remarks',
            speakers: [
              'Prof. Achim A. Beylich, Chair of the IAG WG DENUCHANGE / Geomorphological Field Laboratory',
              'Prof. Zbigniew Zwoliński, Co-Chair of the IAG WG DENUCHANGE / Institute of Geoecology and Geoinformation, Adam Mickiewicz University',
            ],
          },
        ],
      },
      {
        title: 'Virtual Field Trip (VFT) Laboratory',
        description: 'Practical experience in designing and applying Virtual Field Trips for geomorphological research and education. Use of VR headsets to explore immersive examples of Virtual Field Trips firsthand. Fostering active collaboration between members of the DENUCHANGE and VFT Working Groups.',
        tutors: 'Tutors: Dr. Anna Karkani, Dr. Giannis Saitis, Alexandros Liaskos',
        entries: [
          {
            time: '15:30-16:00',
            title: 'Introduction to Virtual Field Trips & Methodology',
            paragraphs: ['Theoretical framework of VFTs, equipment selection, workflow, and showcase of diverse VFT creation tools (e.g., ArcGIS StoryMaps, Google Earth)'],
          },
          {
            time: '16:00-16:40',
            title: 'Rotation A (Parallel Groups)',
            paragraphs: [
              'Group 1 (Field Data Collection): Data collection techniques (360° imagery and mobile device usage).',
              'Group 2 (VR Exploration): Immersive VR headset experience; exploring diverse VFT examples.',
            ],
          },
          {
            time: '16:40-16:50',
            title: 'Transition & Short Break',
            paragraphs: ['Switchover between groups.'],
            kind: 'break',
          },
          {
            time: '16:50-17:30',
            title: 'Rotation B (Parallel Groups)',
            paragraphs: [
              'Group 1 (VR Exploration): Immersive VR headset experience; exploring diverse VFT examples.',
              'Group 2 (Field Data Collection): Data collection techniques (360° imagery and mobile device usage).',
            ],
          },
          {
            time: '17:30-18:30',
            title: 'Synthesis',
            paragraphs: ['Computer-based demonstration: Integrating collected field data into different virtual environments to develop a VFT.'],
          },
        ],
      },
    ],
  },
];
