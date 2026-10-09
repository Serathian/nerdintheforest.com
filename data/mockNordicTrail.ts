export interface AmenityItem {
  icon: string
  label: string
}

export interface LinkedDispatch {
  id: string
  slug: string
  title: string
  date: string
  readTime: string
  excerpt?: string
  weather?: string
  heroImage?: string
  content?: string[]
}

export interface Trailhead {
  name: string
  latitude: number
  longitude: number
}

export interface MockFieldNote {
  id: string
  numberTag: string
  title: string
  description: string
  timeAgo: string
  visitedCount: number
  amenities: AmenityItem[]
  footerFeature: string
  footerIcon: string
  metrics: string
  latitude: number
  longitude: number
  elevation: number
  distanceKm: number
  category: 'SHELTER' | 'HEARTH' | 'SPRINGHEAD' | 'SUMMIT' | 'VIEWPOINT'
  slug: string
  date: string
  readTime: string
  weather: string
  heroImage: string
  content: string[]
  gallery: { url: string; caption: string }[]
  dispatches?: LinkedDispatch[]
  /** Nearest parking area / trailhead, when one exists */
  trailhead?: Trailhead
}

export interface MockMapWaypoint {
  id: string
  title: string
  lat: number
  lng: number
  type: string
}

export const mockFieldNotes: MockFieldNote[] = [
  {
    id: 'note-1',
    slug: 'langvatnet-gapahuk',
    numberTag: '#04 SHELTER',
    title: 'Langvatnet Gapahuk',
    description: 'Hand-hewn timber lean-to with double spruce log notch joints perched on the sheltered south-east cove of Langvatnet. Facing morning sun with lake panorama and replenished birch firewood box.',
    timeAgo: '2h ago',
    date: 'OCT 04, 2026 // 06:40 CET',
    readTime: '4 MIN READ',
    weather: '4°C • MIST • BARO 1018 HPA',
    heroImage: 'https://images.unsplash.com/photo-1510312305653-8ed496efae75?auto=format&fit=crop&w=1200&q=80',
    visitedCount: 2,
    amenities: [
      { icon: 'cabin', label: 'Timber Shelter' },
      { icon: 'outdoor_grill', label: 'Stone Hearth' },
      { icon: 'water_drop', label: 'Lake Water' },
      { icon: 'forest', label: 'Dry Wood' },
      { icon: 'visibility', label: 'Lake View' }
    ],
    footerFeature: 'Lakeside cove',
    footerIcon: 'visibility',
    metrics: '501m • 1.2km',
    latitude: 60.2710,
    longitude: 10.7320,
    trailhead: { name: 'Langvatnet P-plass', latitude: 60.2785, longitude: 10.7530 },
    elevation: 501,
    distanceKm: 1.2,
    category: 'SHELTER',
    content: [
      'The morning mist rose in slow, deliberate wisps across the calm mirror surface of Langvatnet. Arriving at the south-eastern cove just past first light, the scent of damp moss, resinous pine needles, and cold granite was everywhere.',
      'The gapahuk itself is a masterwork of local craftsmanship: double-scribed whole spruce trunks interlocked at the corners with axe-hewn notch joinery. Inside, the floorboards are bone dry, lifted thirty centimeters above the damp forest floor on granite footing stones.',
      'A weathered wooden timber crate on the leeward wall was stacked to the brim with split silver birch logs. After lighting a small kettle fire on the granite hearth stones, the water boiled in under six minutes. No sound reached the cove except the occasional call of a black-throated diver drifting across the far reed beds.'
    ],
    gallery: [
      { url: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=800&q=80', caption: 'Morning mist parting over old-growth spruce canopy' },
      { url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80', caption: 'Lakeside granite outcrop reflecting still morning waters' }
    ],
    dispatches: [
      {
        id: 'dispatch-1',
        slug: 'langvatnet-gapahuk',
        title: 'Autumn Frost & Morning Mist at Langvatnet',
        date: 'OCT 04, 2026 // 06:40 CET',
        readTime: '4 MIN READ',
        excerpt: 'Hand-hewn timber lean-to with double spruce log notch joints perched on the sheltered south-east cove of Langvatnet.',
        weather: '4°C • MIST • BARO 1018 HPA',
        heroImage: 'https://images.unsplash.com/photo-1510312305653-8ed496efae75?auto=format&fit=crop&w=1200&q=80'
      },
      {
        id: 'dispatch-2',
        slug: 'langvatnet-midsummer',
        title: 'Midsummer Solstice Camp & Birch Carving',
        date: 'JUN 21, 2026 // 22:30 CET',
        readTime: '5 MIN READ',
        excerpt: 'Long twilight hours at the gapahuk. Carving butter knives from green birch limbs by the lakeshore campfire.',
        weather: '16°C • GOLDEN DUSK • CALM',
        heroImage: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=800&q=80'
      }
    ]
  },
  {
    id: 'note-2',
    slug: 'korsvatnet-hearth',
    numberTag: '#15 HEARTH',
    title: 'Korsvatnet Hearth',
    description: 'Natural circular granite hearth ring nestled in an old-growth scots pine stand along the eastern shoreline of Korsvatnet. Sheltered from westerly winds with natural stone seating.',
    timeAgo: 'Yesterday',
    date: 'OCT 03, 2026 // 18:15 CET',
    readTime: '3 MIN READ',
    weather: '6°C • CLEAR • CALM',
    heroImage: 'https://images.unsplash.com/photo-1470246973918-29a93221c455?auto=format&fit=crop&w=1200&q=80',
    visitedCount: 0,
    amenities: [
      { icon: 'outdoor_grill', label: 'Granite Fire' },
      { icon: 'forest', label: 'Dry Pine Wood' },
      { icon: 'park', label: 'Pine Stand' }
    ],
    footerFeature: 'Korsvatnet shore',
    footerIcon: 'landscape',
    metrics: '500m • 2.4km',
    latitude: 60.2630,
    longitude: 10.7420,
    elevation: 500,
    distanceKm: 2.4,
    category: 'HEARTH',
    content: [
      'The eastern shore of Korsvatnet is dominated by twisted, wind-stunted Scots pines whose roots cling tightly to glacial granite bedrock.',
      'Here sits a perfectly positioned hearth ring built from eight smoothed glacial erratic boulders. With the prevailing wind blowing steady from the west, the low ridge behind the fire ring acts as a natural wind baffle, directing warmth inward.',
      'As dusk settled over the water, amber embers reflected off the lake surface. It is one of those places that feels ancient and undisturbed, untouched by mechanized trails.'
    ],
    gallery: [
      { url: 'https://images.unsplash.com/photo-1511497584788-87676104235f?auto=format&fit=crop&w=800&q=80', caption: 'Pine roots gripping weathered bedrock' }
    ]
  },
  {
    id: 'note-3',
    slug: 'korsbekken-rapids',
    numberTag: '#02 SPRINGHEAD',
    title: 'Korsbekken Rapids',
    description: 'Fast-flowing crystalline cold brook connecting Korsvatnet to Langvatnet. Filtered through deep peat and granite gravel beds. Potable cold drinking water all summer.',
    timeAgo: 'May 18',
    date: 'MAY 18, 2026 // 11:30 CET',
    readTime: '2 MIN READ',
    weather: '12°C • SUNNY • WIND 2 M/S',
    heroImage: 'https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?auto=format&fit=crop&w=1200&q=80',
    visitedCount: 4,
    amenities: [
      { icon: 'water_drop', label: 'Potable Water' },
      { icon: 'waves', label: 'River Pool' },
      { icon: 'spa', label: 'Moss Bank' }
    ],
    footerFeature: 'Tested pure 4°C',
    footerIcon: 'filter_alt',
    metrics: '501m • 0.8km',
    latitude: 60.2670,
    longitude: 10.7360,
    elevation: 501,
    distanceKm: 0.8,
    category: 'SPRINGHEAD',
    content: [
      'Between the two lakes runs Korsbekken, tumbling through a narrow defile of fern-covered boulders and deep sphagnum moss banks.',
      'The water temperature tested at exactly 4.2°C at midday. Having filtered down through hundreds of meters of peat moss and crushed quartz scree, the water is utterly crystal clear with a mineral sweetness rarely found outside sub-arctic springs.'
    ],
    gallery: [
      { url: 'https://images.unsplash.com/photo-1473448912268-2022ce9509d8?auto=format&fit=crop&w=800&q=80', caption: 'Cold brook tumbling across mossy granite stones' }
    ]
  },
  {
    id: 'note-4',
    slug: 'bjorgeseterfjellet-summit',
    numberTag: '#08 SUMMIT',
    title: 'Bjørgeseterfjellet (607m)',
    description: 'Distinctive rocky summit marked at 607m elevation south of Korsvatnet. Wide panoramic vistas over the Nordmarka highland lakes and western Grua valley.',
    timeAgo: 'May 16',
    date: 'MAY 16, 2026 // 15:45 CET',
    readTime: '5 MIN READ',
    weather: '9°C • GUSTY • BARO 1012 HPA',
    heroImage: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80',
    visitedCount: 1,
    amenities: [
      { icon: 'landscape', label: 'Summit Cairn' },
      { icon: 'visibility', label: '360° Panorama' },
      { icon: 'flag', label: 'Elevation 607m' }
    ],
    footerFeature: 'Summit 607m',
    footerIcon: 'flag',
    metrics: '607m • 3.2km',
    latitude: 60.2520,
    longitude: 10.7450,
    trailhead: { name: 'Bjørgeseter P-plass', latitude: 60.2430, longitude: 10.7610 },
    elevation: 607,
    distanceKm: 3.2,
    category: 'SUMMIT',
    content: [
      'The scramble up the southern face of Bjørgeseterfjellet breaks free from the dense spruce canopy at the 540-meter contour line. From that point upward, the landscape transforms abruptly into open sub-alpine heath: stunted mountain birch, heather, and dwarf juniper.',
      'At 607 meters, a prominent stone cairn anchors the high point. Looking northward, both Langvatnet and Korsvatnet appear like shards of dark glass nestled within a boundless sea of green boreal forest.'
    ],
    gallery: [
      { url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80', caption: 'High plateau panorama looking north toward Grua' }
    ]
  },
  {
    id: 'note-5',
    slug: 'dalasjohogda-summit',
    numberTag: '#09 SUMMIT',
    title: 'Dalasjøhøgda (603m)',
    description: 'Exposed granite bedrock summit rising to 603m northwest of Langvatnet. Weathered pine stands and ancient trigonometrical surveyor beacon mark.',
    timeAgo: 'May 12',
    date: 'MAY 12, 2026 // 14:10 CET',
    readTime: '3 MIN READ',
    weather: '14°C • SCATTERED CLOUDS',
    heroImage: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80',
    visitedCount: 0,
    amenities: [
      { icon: 'landscape', label: 'Surveyor Cairn' },
      { icon: 'visibility', label: 'Lake Overlook' },
      { icon: 'flag', label: 'Elevation 603m' }
    ],
    footerFeature: 'Summit 603m',
    footerIcon: 'flag',
    metrics: '603m • 4.1km',
    latitude: 60.2800,
    longitude: 10.7100,
    trailhead: { name: 'Dalsjøen P-plass', latitude: 60.2905, longitude: 10.6950 },
    elevation: 603,
    distanceKm: 4.1,
    category: 'SUMMIT',
    content: [
      'A solitary peak with an old iron surveying bolt driven directly into the granite summit ledge. Few hikers venture up this ridge as no marked footpath leads directly to it; navigating requires reading topo contour lines and following game trails through the blueberry understory.'
    ],
    gallery: []
  },
  {
    id: 'note-6',
    slug: 'saeterberget-vista',
    numberTag: '#11 VIEWPOINT',
    title: 'Sæterberget Vista (587m)',
    description: 'High northern mountain peak at 587m commanding dramatic views over Langvatnet and the southern expanses of the Nordmarka boreal wilderness.',
    timeAgo: 'May 10',
    date: 'MAY 10, 2026 // 19:20 CET',
    readTime: '4 MIN READ',
    weather: '8°C • SUNSET • CALM',
    heroImage: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=1200&q=80',
    visitedCount: 3,
    amenities: [
      { icon: 'visibility', label: 'Valley View' },
      { icon: 'forest', label: 'Old Spruce' },
      { icon: 'wb_twilight', label: 'Alpenglow' }
    ],
    footerFeature: 'Peak 587m',
    footerIcon: 'wb_twilight',
    metrics: '587m • 4.6km',
    latitude: 60.2980,
    longitude: 10.7240,
    elevation: 587,
    distanceKm: 4.6,
    category: 'VIEWPOINT',
    content: [
      'Sæterberget is best climbed in late evening when the setting sun strikes the west-facing granite cliffs in warm amber hues. The vantage looks straight down the spine of the valley toward Oslofjord on exceptionally clear evenings.'
    ],
    gallery: []
  },
  {
    id: 'note-7',
    slug: 'milsteinhagahaugen-ridge',
    numberTag: '#14 RIDGE',
    title: 'Milsteinhagahaugen (515m)',
    description: 'Scenic granite ridge shelf at 515.7m elevation overlooking the historic mining settlement of Grua and the Hadeland railway passage.',
    timeAgo: 'May 06',
    date: 'MAY 06, 2026 // 12:00 CET',
    readTime: '3 MIN READ',
    weather: '11°C • OVERCAST',
    heroImage: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1200&q=80',
    visitedCount: 2,
    amenities: [
      { icon: 'visibility', label: 'West View' },
      { icon: 'outdoor_grill', label: 'Campfire Ring' },
      { icon: 'chair', label: 'Granite Ledge' }
    ],
    footerFeature: 'Ridge 515m',
    footerIcon: 'landscape',
    metrics: '516m • 2.1km',
    latitude: 60.2650,
    longitude: 10.6860,
    elevation: 516,
    distanceKm: 2.1,
    category: 'VIEWPOINT',
    content: [
      'The ridge provides a natural bird-eye view over the old iron and zinc mining valleys below Grua. The pine trees here are gnarled and low, growing sideways against the prevailing autumn gales.'
    ],
    gallery: []
  },
  {
    id: 'note-8',
    slug: 'svaraberget-camp',
    numberTag: '#19 WILD CAMP',
    title: 'Svaraberget Camp (510m)',
    description: 'Southwestern pine ridge summit at 510m overlooking isolated tarns. Flat moss clearing ideal for wild camping with stone hearth and wind shelter.',
    timeAgo: 'Apr 29',
    date: 'APR 29, 2026 // 16:30 CET',
    readTime: '4 MIN READ',
    weather: '5°C • NIGHT CLEAR • BARO 1022 HPA',
    heroImage: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=1200&q=80',
    visitedCount: 1,
    amenities: [
      { icon: 'camping', label: 'Tent Pitches' },
      { icon: 'outdoor_grill', label: 'Stone Hearth' },
      { icon: 'forest', label: 'Dry Wood' }
    ],
    footerFeature: 'Summit 510m',
    footerIcon: 'camping',
    metrics: '510m • 3.8km',
    latitude: 60.2450,
    longitude: 10.6550,
    trailhead: { name: 'Svarabergvegen P', latitude: 60.2380, longitude: 10.6380 },
    elevation: 510,
    distanceKm: 3.8,
    category: 'SHELTER',
    content: [
      'Tucked away on a bench of lichen and deep reindeer moss, Svaraberget Camp is one of the quietest wild campsites in this sector of the forest. Protected from the north by towering pine timber, with a clear flat ledge for a tarp or bivy shelter.'
    ],
    gallery: []
  }
]

export const mockMapWaypoints: MockMapWaypoint[] = mockFieldNotes.map(note => ({
  id: note.id,
  title: note.title,
  lat: note.latitude,
  lng: note.longitude,
  type: note.category.toLowerCase()
}))
