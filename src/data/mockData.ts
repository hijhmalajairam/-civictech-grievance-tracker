import { ReportedIssue, CivicPoll, LocationMarker, LiveAlert } from '../types';

export const HYDERABAD_ZONES: LocationMarker[] = [
  { name: 'Madhapur (Hitec City)', lat: 38, lng: 25, description: 'IT Corridor and surrounding municipal works' },
  { name: 'Charminar (Old City)', lat: 75, lng: 52, description: 'Heritage zone sanitation and water networks' },
  { name: 'Gachibowli', lat: 45, lng: 18, description: 'Stretches of rapid urban transport and flyovers' },
  { name: 'Secunderabad', lat: 25, lng: 65, description: 'Railway terminal zone drainage & public sanitation' },
  { name: 'Begumpet', lat: 35, lng: 48, description: 'Central flood-prone water logging basins' },
  { name: 'Kukatpally', lat: 20, lng: 32, description: 'High-density residential and lake conservation zones' },
  { name: 'Banjara Hills', lat: 48, lng: 38, description: 'Undulating terrains with stormwater runoff challenges' }
];

export const TELANGANA_DISTRICTS: LocationMarker[] = [
  { name: 'Hyderabad District', lat: 50, lng: 48, district: 'Hyderabad', description: 'Metropolitan hub civic amenities' },
  { name: 'Warangal District', lat: 38, lng: 72, district: 'Warangal Urban', description: 'Heritage city drainage and tourist facility pipelines' },
  { name: 'Karimnagar District', lat: 24, lng: 58, district: 'Karimnagar', description: 'Irrigation channels & rural connectivity roads' },
  { name: 'Nizamabad District', lat: 20, lng: 28, district: 'Nizamabad', description: 'Core market yard highways and sanitation' },
  { name: 'Khammam District', lat: 68, lng: 85, district: 'Khammam', description: 'Mining belt environment protection systems' },
  { name: 'Mahabubnagar District', lat: 78, lng: 35, district: 'Mahabubnagar', description: 'Semi-arid drinking water supply projects' },
  { name: 'Medak District', lat: 35, lng: 32, district: 'Medak', description: 'Industrial discharge monitoring and rural roads' }
];

export const INDIA_REGIONS: LocationMarker[] = [
  { name: 'Southern India (Telangana/AP/TN/KA/KL)', lat: 78, lng: 48, state: 'Telangana', description: 'National Highway linkages & interstate water shares' },
  { name: 'Northern India (Delhi/UP/PB/HR/JK)', lat: 32, lng: 42, state: 'Delhi NCR', description: 'National Capital environmental controls and expressways' },
  { name: 'Western India (MH/GJ/RJ)', lat: 55, lng: 25, state: 'Maharashtra', description: 'Industrial corridors and maritime environmental protocols' },
  { name: 'Eastern India (WB/OD/JH/BH)', lat: 54, lng: 74, state: 'West Bengal', description: 'Flood protection dams and coastal ecosystem protection' },
  { name: 'Northeastern India (AS/ML/MN/NL)', lat: 45, lng: 88, state: 'Assam', description: 'Hilly terrain landslide prevention and forest preservation' }
];

export const INITIALLY_REPORTED_ISSUES: ReportedIssue[] = [
  {
    id: 'issue-hyd-1',
    title: 'Severe storm-water drainage clogging',
    description: 'The main storm-water drain near Metro Pillar C1450 is heavily choked with plastic bottles and concrete debris. Even with mild rains, the water blocks the entire left lane, creating hazardous driving conditions for two-wheelers.',
    category: 'Water & Sanitation',
    location: 'Madhapur (Hitec City), Hyderabad',
    level: 'City',
    lat: 38,
    lng: 25,
    reporter: 'Sai Kiran G.',
    upvotes: 42,
    status: 'Pending',
    priority: 'High',
    priorityScore: 8,
    createdAt: new Date(Date.now() - 4 * 3600000).toISOString(), // 4h ago
    image: null,
    aiResponse: {
      department: 'Greater Hyderabad Municipal Corporation (GHMC) - Stormwater Drainage Dept',
      priorityScore: 8,
      priorityLevel: 'High',
      resolvedChecklist: [
        'Dispatch hydraulic drainage clearing machines to Sector - 3 Madhapur',
        'Extract solid plastic waste and debris blockages from primary inlet pipeline',
        'Deploy silt catchers at grid points to stop further silt build-ups',
        'Inspect surrounding retail stalls for code violations on solid waste Disposal'
      ],
      officialLetterDraft: `To,\nThe Assistant Commissioner,\nStormwater Drainage & Sanitation Wing,\nGreater Hyderabad Municipal Corporation (GHMC),\nHyderabad, Telangana.\n\nSubject: Urgent Redressal Needed for Stormwater Drainage Overflow Near Madhapur Metro Pillar C1450\n\nRespected Sir/Madam,\n\nI am writing to draw your attention to a critical grievance concerning the main stormwater drainage channel located near Metro Pillar C1450 in Sector-3, Madhapur, Hyderabad.\n\nThis drainage line is severely blocked with garbage, construction concrete, and single-use plastic waste. As a consequence of this choke point, water regularly overflows during rains, covering half of the arterial road. This causes severe traffic bottlenecks and poses a life-threatening risk to three-wheelers and motorcyclists who cannot gauge the depth of the submerged road.\n\nWe request your department to dispatch a specialized suction truck to clear this blockage immediately, before the impending monsoon season triggers more severe local inundation.\n\nSincerely,\nSai Kiran G. and Citizens of Madhapur Ward.`,
      authorityContact: 'GHMC Central Helpline: 040-21111111 | stormdrainage@ghmc.gov.in',
      suggestedActionPlan: 'Initiate a community petition to the Ward Corporator and copy the GHMC Zonal Commissioner with live photos on Hyderabad PGIS Portal.'
    }
  },
  {
    id: 'issue-hyd-2',
    title: 'Complete dark zone and broken high-mast lights',
    description: 'The street lamps and primary high-mast light poles surrounding the Gachibowli girls hostel alleyway are completely non-functional. The entire 300-meter stretch is pitch black after 6:30 PM, raising serious security concerns for women returning from colleges and workspaces.',
    category: 'Women Safety & Lights',
    location: 'Gachibowli, Hyderabad',
    level: 'City',
    lat: 45,
    lng: 18,
    reporter: 'Ananya S.',
    upvotes: 112,
    status: 'Pending',
    priority: 'Critical',
    priorityScore: 10,
    createdAt: new Date(Date.now() - 2 * 3600000).toISOString(), // 2h ago
    image: null,
    aiResponse: {
      department: 'Greater Hyderabad Municipal Corporation (GHMC) - Street Lighting & Women Safety Wing',
      priorityScore: 10,
      priorityLevel: 'Critical',
      resolvedChecklist: [
        'Dispatch emergency electrician squad to inspect the circuit feeder pillar in Gachibowli Zone 3',
        'Replace burnt copper cabling and install high-luminance LED bulbs on all non-functional poles',
        'Establish direct integration with Hyderabad Police She-Teams surveillance nodes',
        'Conduct trim-clearing of overgrown tree branches obstructing light dispersion'
      ],
      officialLetterDraft: `To,\nThe Zonal Commissioner,\nElectrical & Public Safety Division,\nGreater Hyderabad Municipal Corporation (GHMC),\nHyderabad, Telangana.\n\nSubject: Emergency Intervention Request - Dark Zone & Missing Street Lighting Near Gachibowli Hostel Alley\n\nRespected Sir,\n\nI am writing to report a critical public safety threat. The 300-meter pathway spanning the girls hostel alleyway near the Gachibowli IT Corridor junction has been engulfed in total darkness for the past two weeks due to a total failure of high-mast street lights.\n\nWe have observed unidentified individuals clustering in these dark corners, posing a severe security hazard for working women and students commuting after dusk. Women safety is a paramount objective of our administration, and this infrastructural darkness directly compromises it.\n\nPlease direct an emergency electricity crew to replace the faulty copper cabling and restore immediate lighting. We also request coordinating with the local Police station to increase She-Teams foot patrols until light fixtures are functional.\n\nWarm regards,\nAnanya S. & Resident Alliance.`,
      authorityContact: 'GHMC Electrical Control Room: 040-23225397 | safety.elec@ghmc.gov.in',
      suggestedActionPlan: 'Raise an immediate alert via the Hawk-Eye App and share the ticket link on Twitter tagging the Commissioner of Police, Telangana.'
    }
  },
  {
    id: 'issue-tel-1',
    title: 'Massive illegal solid waste dumping & lake polluting site',
    description: 'Heavy commercial and toxic garbage has been piled up and is being illegally burned near the local drinking water lake on the Warangal bypass borders. Toxic fumes are spreading into dense residential pockets daily, while direct plastic runoff is entering the active reservoir.',
    category: 'Garbage & Waste',
    location: 'Warangal District, Telangana',
    level: 'State',
    lat: 38,
    lng: 72,
    reporter: 'Dr. Ramakanth Rao',
    upvotes: 89,
    status: 'Review',
    priority: 'High',
    priorityScore: 9,
    createdAt: new Date(Date.now() - 24 * 3600000).toISOString(), // 1 day ago
    image: null,
    aiResponse: {
      department: 'Telangana State Pollution Control Board (TSPCB) & Regional Municipality',
      priorityScore: 9,
      priorityLevel: 'High',
      resolvedChecklist: [
        'Enforce immediate physical containment barrier around the illegal dumping shoreline',
        'Extinguish active chemical trash burns and clear ash loads via municipal waste payloaders',
        'Deploy mobile CCTV security sentinel nodes to intercept unauthorized commercial dump vehicles',
        'Launch community clean-up drive and place formal warning trespass boards'
      ],
      officialLetterDraft: `To,\nThe Member Secretary,\nTelangana State Pollution Control Board (TSPCB),\nParyavarana Bhavan, Sanathnagar,\nHyderabad, Telangana.\n\nSubject: Violation Complaint - Severe Commercial Waste Dumping and Garbage Burning near Drinking Reservoir\n\nRespected Sir,\n\nI am writing to draw your attention to a grave ecological and health violation at the Warangal suburb bypass limits.\n\nOver the past few weeks, commercial transport vehicles have been dumping tons of domestic, electronic, and industrial solid-waste right on the banks of our local drinking water lake. Active piles of plastic are regularly burned, producing thick, toxic black smoke that suffocates nearby colonies. Heavy rainfall is washing plastics directly into the sensitive water reservoir, threatening local livelihoods.\n\nWe urgently request your regional office to inspect this site, fine the violators, and coordinate with the local municipal division to completely clear the existing garbage accumulations.\n\nYours faithfully,\nDr. Ramakanth Rao, Environmental Citizen Forum.`,
      authorityContact: 'TSPCB Regional Center: 040-23887500 | membersecy@tspcb.gov.in',
      suggestedActionPlan: 'Submit a formal grievance ticket on the Telangana State Pollution Control Board portal and escalate to local ward officers.'
    }
  },
  {
    id: 'issue-ind-1',
    title: 'Severe Crater Potholes on high-speed NH-44',
    description: 'Enormous, deep crater potholes have opened up across the middle lane on National Highway NH-44 near the North Telangana border. Speeding heavy vehicles and cars slam their breaks suddenly, leading to serious pile-ups and fatal micro-accidents daily.',
    category: 'Roads & Mobility',
    location: 'Telangana border area, NH-44',
    level: 'National',
    lat: 50,
    lng: 48,
    reporter: 'Amitabh Sharma',
    upvotes: 76,
    status: 'Pending',
    priority: 'High',
    priorityScore: 8,
    createdAt: new Date(Date.now() - 36 * 3600000).toISOString(), // 1.5 days ago
    image: null,
    aiResponse: null
  }
];

export const INITIAL_POLLS: CivicPoll[] = [
  {
    id: 'poll-1',
    question: 'How should Hyderabad allocate municipal budgets to clean open garbage dumps?',
    options: [
      { id: 'opt-1a', text: 'Increase ward-level waste payloaders and dry/wet segregation vehicles by 40%', votes: 450 },
      { id: 'opt-1b', text: 'Deploy CCTV sentinel security nodes with hefty fines for open garbage burning', votes: 310 },
      { id: 'opt-1c', text: 'Set up neighborhood compost units & community recycling centers', votes: 190 }
    ],
    totalVotes: 950,
    level: 'City'
  },
  {
    id: 'poll-2',
    question: 'What is the top state-level priority for public safety lighting in Telangana?',
    options: [
      { id: 'opt-2a', text: 'Install smart LED high-mast lights in all school and college corridors', votes: 540 },
      { id: 'opt-2b', text: 'Direct She-Teams panic alarm switches linked directly to main grids', votes: 310 },
      { id: 'opt-2c', text: 'Trim overhead trees blocking active public walkways', votes: 420 }
    ],
    totalVotes: 1270,
    level: 'State'
  },
  {
    id: 'poll-3',
    question: 'Should NHAI mandate automated geotagged smart sensors for sewage water logging?',
    options: [
      { id: 'opt-3a', text: 'Yes, mandatory for central fund releases to spur local accountability', votes: 1120 },
      { id: 'opt-3b', text: 'Keep it optional to avoid complex compliance in rural highway corridors', votes: 480 },
      { id: 'opt-3c', text: 'Focus instead on state-level customized visual charts', votes: 154 }
    ],
    totalVotes: 1754,
    level: 'National'
  }
];

export const LIVE_TICKER_TEMPLATES = [
  { text: 'Uncontrolled garbage pile-up near Ameerpet market road', category: 'Garbage & Waste', level: 'City', locationName: 'Begumpet, Hyderabad' },
  { text: 'Dark street zone reported close to Warangal girls pg hostel', category: 'Women Safety & Lights', level: 'State', locationName: 'Warangal District, Telangana' },
  { text: 'Water line burst identified on Madhapur Mindspace grid', category: 'Water & Sanitation', level: 'City', locationName: 'Madhapur (Hitec City), Hyderabad' },
  { text: 'Overflowing open garbage bin blocking state highway', category: 'Garbage & Waste', level: 'State', locationName: 'Karimnagar District, Telangana' },
  { text: 'Broken high mast light near Secunderabad railway terminal', category: 'Women Safety & Lights', level: 'City', locationName: 'Secunderabad, Hyderabad' },
  { text: 'Sewer manhole structural damage reported near Charminar', category: 'Water & Sanitation', level: 'City', locationName: 'Charminar (Old City), Hyderabad' },
  { text: 'Crater potholes on NH-44 creating high-speed vehicle risk', category: 'Roads & Mobility', level: 'National', locationName: 'Telangana border area, NH-44' }
];
