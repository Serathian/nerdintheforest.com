import { HIKING_TRAIL_GEOMETRIES } from './mockHikingTrails'
import type { Area, Location, Dispatch, LocationCategory, LocationAmenity } from '../types/models'

export { type Area, type Location, type Dispatch }

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
  trailGeometry?: Array<[number, number]>
  elevationGain?: number
  elevationLoss?: number
}

export interface MockFieldNote {
  id: string
  numberTag: string
  title: string
  areaId: string
  area: string
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
  shelterCapacity?: number
  tentSpaces?: number
  hasParking?: boolean
  elevationGain?: number
  elevationLoss?: number
  distanceKm: number
  category: 'SHELTER' | 'HEARTH' | 'SPRINGHEAD' | 'SUMMIT' | 'VIEWPOINT' | 'TRAILHEAD'
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
  areaId?: string
  area?: string
  region?: string
}

export const mockAreas: Area[] = [
  {
    id: 'pirkanmaa',
    name: 'Pirkanmaa',
    country: 'Finland',
    description: 'Boreal forest lakes, rugged fault gorges, and primeval pine peatlands in western Finland.',
    center: [23.85, 61.85],
    zoom: 9.5
  },
  {
    id: 'nordmarka',
    name: 'Nordmarka',
    country: 'Norway',
    description: 'Highland boreal lakes, ancient spruce forests, and granite ridge viewpoints north of Oslo.',
    center: [10.715, 60.270],
    zoom: 12.2
  }
]

export const mockFieldNotes: MockFieldNote[] = [
  {
    id: 'note-1',
    slug: 'langvatnet-gapahuk',
    numberTag: '#04 SHELTER',
    title: 'Langvatnet Gapahuk',
    areaId: 'nordmarka',
    area: 'Nordmarka',
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
    trailhead: {
      name: 'Langvatnet P-plass',
      latitude: 60.2785,
      longitude: 10.7530,
      trailGeometry: HIKING_TRAIL_GEOMETRIES['note-1'],
      elevationGain: 145,
      elevationLoss: 24
    },
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
    areaId: 'nordmarka',
    area: 'Nordmarka',
    description: 'Natural circular granite hearth ring nestled in an old-growth scots pine stand along the eastern shoreline of Korsvatnet. Sheltered from westerly winds with natural stone seating.',
    timeAgo: 'Unvisited',
    date: 'OCT 03, 2026 // UNVISITED',
    readTime: 'NO LOG',
    weather: 'UNSURVEYED',
    heroImage: 'https://images.unsplash.com/photo-1470246973918-29a93221c455?auto=format&fit=crop&w=1200&q=80',
    visitedCount: 0,
    amenities: [],
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
      'Here sits a circular hearth ring rumored from historical forestry maps. However, until an on-site field survey is completed, exact timber supplies, granite boulder stability, and shoreline access remain unverified.',
      'Coordinates sourced from aerial ortho-imagery; physical expedition required for formal registration.'
    ],
    gallery: [],
    dispatches: []
  },
  {
    id: 'note-3',
    slug: 'korsbekken-rapids',
    numberTag: '#02 SPRINGHEAD',
    title: 'Korsbekken Rapids',
    areaId: 'nordmarka',
    area: 'Nordmarka',
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
    ],
    dispatches: [
      {
        id: 'dispatch-3-1',
        slug: 'korsbekken-spring-melt',
        title: 'Spring Melt & Crystalline Peat Water',
        date: 'MAY 18, 2026 // 11:30 CET',
        readTime: '2 MIN READ',
        excerpt: 'Cold brook roaring between Korsvatnet and Langvatnet with pure sub-arctic mineral sweetness.',
        weather: '12°C • SUNNY • WIND 2 M/S',
        heroImage: 'https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?auto=format&fit=crop&w=1200&q=80'
      },
      {
        id: 'dispatch-3-2',
        slug: 'korsbekken-trout-pools',
        title: 'Midsummer Pool Drift & Brown Trout',
        date: 'JUN 24, 2026 // 14:15 CET',
        readTime: '3 MIN READ',
        excerpt: 'Clear granite eddies where young brown trout shelter beneath submerged peat overhangs.',
        weather: '19°C • SCATTERED HIGH CIRRUS',
        heroImage: 'https://images.unsplash.com/photo-1473448912268-2022ce9509d8?auto=format&fit=crop&w=800&q=80'
      },
      {
        id: 'dispatch-3-3',
        slug: 'korsbekken-summer-dossier',
        title: 'Late Summer Flow & Sphagnum Moss Beds',
        date: 'AUG 09, 2026 // 09:45 CET',
        readTime: '3 MIN READ',
        excerpt: 'Low water levels reveal polished quartzite pebbles and emerald green water-starwort ribbons.',
        weather: '15°C • OVERCAST • BARO 1014 HPA',
        heroImage: 'https://images.unsplash.com/photo-1511497584788-87676104235f?auto=format&fit=crop&w=800&q=80'
      },
      {
        id: 'dispatch-3-4',
        slug: 'korsbekken-autumn-defile',
        title: 'Autumn Equinox Rapids Crossing',
        date: 'SEP 22, 2026 // 16:00 CET',
        readTime: '4 MIN READ',
        excerpt: 'Golden birch leaves floating down the cascades as night frost begins settling in the valley defile.',
        weather: '5°C • CRISP • CALM',
        heroImage: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=800&q=80'
      }
    ]
  },
  {
    id: 'note-4',
    slug: 'bjorgeseterfjellet-summit',
    numberTag: '#08 SUMMIT',
    title: 'Bjørgeseterfjellet (607m)',
    areaId: 'nordmarka',
    area: 'Nordmarka',
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
    trailhead: {
      name: 'Bjørgeseter P-plass',
      latitude: 60.2430,
      longitude: 10.7610,
      trailGeometry: HIKING_TRAIL_GEOMETRIES['note-3'],
      elevationGain: 195,
      elevationLoss: 8
    },
    elevation: 607,
    distanceKm: 3.2,
    category: 'SUMMIT',
    content: [
      'The scramble up the southern face of Bjørgeseterfjellet breaks free from the dense spruce canopy at the 540-meter contour line. From that point upward, the landscape transforms abruptly into open sub-alpine heath: stunted mountain birch, heather, and dwarf juniper.',
      'At 607 meters, a prominent stone cairn anchors the high point. Looking northward, both Langvatnet and Korsvatnet appear like shards of dark glass nestled within a boundless sea of green boreal forest.'
    ],
    gallery: [
      { url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80', caption: 'High plateau panorama looking north toward Grua' }
    ],
    dispatches: [
      {
        id: 'dispatch-4-1',
        slug: 'bjorgeseterfjellet-summit',
        title: 'Summit Scramble & 360° Panorama Over Grua',
        date: 'MAY 16, 2026 // 15:45 CET',
        readTime: '5 MIN READ',
        excerpt: 'Scrambling past the spruce line onto open sub-alpine heath and stone cairns at 607 meters.',
        weather: '9°C • GUSTY • BARO 1012 HPA',
        heroImage: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80'
      }
    ]
  },
  {
    id: 'note-5',
    slug: 'dalasjohogda-summit',
    numberTag: '#09 SUMMIT',
    title: 'Dalasjøhøgda (603m)',
    areaId: 'nordmarka',
    area: 'Nordmarka',
    description: 'Exposed granite bedrock summit rising to 603m northwest of Langvatnet. Weathered pine stands and ancient trigonometrical surveyor beacon mark.',
    timeAgo: 'Unvisited',
    date: 'MAY 12, 2026 // UNVISITED',
    readTime: 'NO LOG',
    weather: 'UNSURVEYED',
    heroImage: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80',
    visitedCount: 0,
    amenities: [],
    footerFeature: 'Summit 603m',
    footerIcon: 'flag',
    metrics: '603m • 4.1km',
    latitude: 60.2800,
    longitude: 10.7100,
    trailhead: {
      name: 'Dalsjøen P-plass',
      latitude: 60.2905,
      longitude: 10.6950,
      trailGeometry: HIKING_TRAIL_GEOMETRIES['note-4'],
      elevationGain: 182,
      elevationLoss: 14
    },
    elevation: 603,
    distanceKm: 4.1,
    category: 'SUMMIT',
    content: [
      'A solitary peak with an old iron surveying bolt driven directly into the granite summit ledge according to historical maps. Few hikers venture up this ridge as no marked footpath leads directly to it.',
      'As this summit remains unvisited, provisions and shelter conditions cannot be verified until a direct route reconnaissance is conducted.'
    ],
    gallery: [],
    dispatches: []
  },
  {
    id: 'note-6',
    slug: 'saeterberget-vista',
    numberTag: '#11 VIEWPOINT',
    title: 'Sæterberget Vista (587m)',
    areaId: 'nordmarka',
    area: 'Nordmarka',
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
    gallery: [],
    dispatches: [
      {
        id: 'dispatch-6-1',
        slug: 'saeterberget-sunset',
        title: 'Amber Alpenglow Across Nordmarka',
        date: 'MAY 10, 2026 // 19:20 CET',
        readTime: '4 MIN READ',
        excerpt: 'Late evening ascent as the setting sun paints the granite cliffs in deep warm orange.',
        weather: '8°C • SUNSET • CALM',
        heroImage: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=1200&q=80'
      },
      {
        id: 'dispatch-6-2',
        slug: 'saeterberget-inversion',
        title: 'Valley Fog Inversion & Sea of Clouds',
        date: 'JUL 11, 2026 // 05:15 CET',
        readTime: '3 MIN READ',
        excerpt: 'Looking out over an unbroken blanket of stratus fog filling the lower lakes before burn-off.',
        weather: '11°C • CLOUD INVERSION • BARO 1024 HPA',
        heroImage: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80'
      },
      {
        id: 'dispatch-6-3',
        slug: 'saeterberget-hawk-ridge',
        title: 'Boreal Raptor Ridge Transit',
        date: 'AUG 30, 2026 // 13:40 CET',
        readTime: '4 MIN READ',
        excerpt: 'Rough-legged buzzards circling high thermals rising off the south-facing crags.',
        weather: '16°C • BREEZY • CLEAR',
        heroImage: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80'
      }
    ]
  },
  {
    id: 'note-7',
    slug: 'milsteinhagahaugen-ridge',
    numberTag: '#14 RIDGE',
    title: 'Milsteinhagahaugen (515m)',
    areaId: 'nordmarka',
    area: 'Nordmarka',
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
    gallery: [],
    dispatches: [
      {
        id: 'dispatch-7-1',
        slug: 'milsteinhagahaugen-ridge',
        title: 'Iron Mines & High Ridge Gale Survey',
        date: 'MAY 06, 2026 // 12:00 CET',
        readTime: '3 MIN READ',
        excerpt: 'Bird-eye perspective over historical Grua zinc mine ruins amidst gnarled scots pines.',
        weather: '11°C • OVERCAST • WIND 7 M/S',
        heroImage: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1200&q=80'
      },
      {
        id: 'dispatch-7-2',
        slug: 'milsteinhagahaugen-thunder',
        title: 'Thunderstorm Watch Over Hadeland',
        date: 'AUG 18, 2026 // 17:30 CET',
        readTime: '3 MIN READ',
        excerpt: 'Dark storm cells tracking east along the railway corridor while the ridge catches warm downdrafts.',
        weather: '18°C • DISTANT THUNDER • HUMID',
        heroImage: 'https://images.unsplash.com/photo-1511497584788-87676104235f?auto=format&fit=crop&w=800&q=80'
      }
    ]
  },
  {
    id: 'note-8',
    slug: 'svaraberget-camp',
    numberTag: '#19 WILD CAMP',
    title: 'Svaraberget Camp (510m)',
    areaId: 'nordmarka',
    area: 'Nordmarka',
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
    trailhead: {
      name: 'Svarabergvegen P',
      latitude: 60.2380,
      longitude: 10.6380,
      trailGeometry: HIKING_TRAIL_GEOMETRIES['note-6'],
      elevationGain: 165,
      elevationLoss: 20
    },
    elevation: 510,
    distanceKm: 3.8,
    category: 'SHELTER',
    content: [
      'Tucked away on a bench of lichen and deep reindeer moss, Svaraberget Camp is one of the quietest wild campsites in this sector of the forest. Protected from the north by towering pine timber, with a clear flat ledge for a tarp or bivy shelter.'
    ],
    gallery: [],
    dispatches: [
      {
        id: 'dispatch-8-1',
        slug: 'svaraberget-camp',
        title: 'Solitary Tarp Camp & Lichen Plateau',
        date: 'APR 29, 2026 // 16:30 CET',
        readTime: '4 MIN READ',
        excerpt: 'Quiet shelter pitch on reindeer moss bench beneath ancient timber pines.',
        weather: '5°C • NIGHT CLEAR • BARO 1022 HPA',
        heroImage: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=1200&q=80'
      }
    ]
  },
  {
    id: 'note-kikut',
    slug: 'kikut-peak',
    numberTag: '#12 VIEWPOINT',
    title: 'Kikut Peak (604m)',
    areaId: 'nordmarka',
    area: 'Nordmarka',
    description: 'Panoramic granite vantage rising to 604m commanding sweeping views over Lake Bjørnsjøen and the deep Nordmarka old-growth spruce canopy.',
    timeAgo: 'Recent',
    date: 'OCT 12, 2026 // 14:30 CET',
    readTime: '3 MIN READ',
    weather: '6°C • CRISP • GUSTS 5 M/S',
    heroImage: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80',
    visitedCount: 1,
    amenities: [
      { icon: 'visibility', label: 'Lake View' },
      { icon: 'forest', label: 'Old Spruce' }
    ],
    footerFeature: 'Peak 604m',
    footerIcon: 'landscape',
    metrics: '604m • 5.2km',
    latitude: 60.0880,
    longitude: 10.6550,
    elevation: 604,
    distanceKm: 5.2,
    category: 'VIEWPOINT',
    content: [
      'Kikut Peak provides one of the most commanding panoramic vistas in all of Nordmarka. Looking north from the granite ledge, Bjørnsjøen stretches out like dark glass between pine-carpeted ridges.',
      'The trail ascends past historic forestry paths, climbing through blueberry and lichen undergrowth up to the wind-buffeted high bedrock mark.'
    ],
    gallery: [
      { url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80', caption: 'Nordmarka forest canopy overlooking Lake Bjørnsjøen from Kikut' }
    ],
    dispatches: [
      {
        id: 'dispatch-kikut-1',
        slug: 'kikut-traverse',
        title: 'Autumn Ascent to Kikut Peak & Katnosa Traverse',
        date: 'OCT 12, 2026 // 14:30 CET',
        readTime: '4 MIN READ',
        excerpt: 'Challenging high-ridge traverse connecting Langvatnet gapahuk with the panoramic granite summit of Kikut Peak.',
        weather: '6°C • CRISP • GUSTS 5 M/S',
        heroImage: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80'
      }
    ]
  },
  {
    id: 'note-fi-1',
    slug: 'helvetinkolu-gapahuk',
    numberTag: '#21 SHELTER',
    title: 'Helvetinkolu Gapahuk & Gorge',
    areaId: 'pirkanmaa',
    area: 'Pirkanmaa',
    description: 'Sturdy timber shelter nestled beside the dramatic glacial cleft of Helvetinkolu in Helvetinjärvi National Park. Sheer 40-meter granite fault gorge with stone fireplace and old-growth pine taiga.',
    timeAgo: '1d ago',
    date: 'OCT 08, 2026 // 09:15 EET',
    readTime: '4 MIN READ',
    weather: '3°C • FROST • BARO 1021 HPA',
    heroImage: 'https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?auto=format&fit=crop&w=1200&q=80',
    visitedCount: 1,
    amenities: [
      { icon: 'cabin', label: 'Timber Shelter' },
      { icon: 'outdoor_grill', label: 'Stone Hearth' },
      { icon: 'forest', label: 'Dry Wood' },
      { icon: 'visibility', label: 'Gorge View' }
    ],
    footerFeature: 'Fault gorge cleft',
    footerIcon: 'landscape',
    metrics: '172m • 2.0km',
    latitude: 62.0306,
    longitude: 23.8447,
    trailhead: {
      name: 'Kankimäki P-alue (Helvetinjärvi)',
      latitude: 62.0380,
      longitude: 23.8320,
      elevationGain: 65,
      elevationLoss: 42
    },
    elevation: 172,
    distanceKm: 2.0,
    category: 'SHELTER',
    content: [
      'The morning frost coated the sheer granite walls of Helvetinkolu in delicate rime. The cleft, formed billions of years ago during ancient tectonic movements, plunges 40 meters straight down into Lake Helvetinjärvi.',
      'The gapahuk shelter sits just above the gorge descent, constructed from weathered Finnish pine logs. A roaring birch fire in the field-stone hearth took the chill off the morning sub-arctic air in minutes.'
    ],
    gallery: [
      { url: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=800&q=80', caption: 'Lichen-covered granite rift cleft in Helvetinjärvi' }
    ],
    dispatches: [
      {
        id: 'dispatch-fi-1',
        slug: 'helvetinkolu-gapahuk',
        title: 'Autumn Frost in the Ancient Fault Gorge of Helvetinkolu',
        date: 'OCT 08, 2026 // 09:15 EET',
        readTime: '4 MIN READ',
        excerpt: 'Surveying the sheer 40-meter granite fault cleft and timber lean-to as first frost grips the Ruovesi taiga.',
        weather: '3°C • FROST • BARO 1021 HPA',
        heroImage: 'https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?auto=format&fit=crop&w=1200&q=80'
      }
    ]
  },
  {
    id: 'note-fi-2',
    slug: 'kintulammi-kirkkokivi',
    numberTag: '#22 HEARTH',
    title: 'Kintulammi Kirkkokivi Hearth',
    areaId: 'pirkanmaa',
    area: 'Pirkanmaa',
    description: 'Sheltered granite campfire site beside the historic Kirkkokivi glacial erratic boulder in the Kintulammi hiking reserve, Tampere. Pristine peat ponds and boardwalk transit.',
    timeAgo: 'Unvisited',
    date: 'OCT 07, 2026 // UNVISITED',
    readTime: 'NO LOG',
    weather: 'UNSURVEYED',
    heroImage: 'https://images.unsplash.com/photo-1510312305653-8ed496efae75?auto=format&fit=crop&w=1200&q=80',
    visitedCount: 0,
    amenities: [],
    footerFeature: 'Erratic boulder',
    footerIcon: 'landscape',
    metrics: '145m • 1.8km',
    latitude: 61.6215,
    longitude: 23.9782,
    trailhead: {
      name: 'Kintulammi Kaukajärventie P',
      latitude: 61.6150,
      longitude: 23.9620,
      elevationGain: 28,
      elevationLoss: 12
    },
    elevation: 145,
    distanceKm: 1.8,
    category: 'HEARTH',
    content: [
      'The massive Kirkkokivi ("Church Stone") erratic boulder was deposited here by the retreating Fennoscandian ice sheet. Rumored to have sheltered ancient travelers along forest trading trails.',
      'Field reconnaissance required to verify firewood shed stock and boardwalk condition across the bog margin.'
    ],
    gallery: [],
    dispatches: []
  },
  {
    id: 'note-fi-3',
    slug: 'seitseminen-pitkajarvi',
    numberTag: '#23 SPRINGHEAD',
    title: 'Seitseminen Pitkäjärvi Spring',
    areaId: 'pirkanmaa',
    area: 'Pirkanmaa',
    description: 'Cold natural springhead and traditional log lean-to shelter on the bog-fringed shore of Pitkäjärvi in Seitseminen National Park. Old-growth pine taiga and untouched peat bogs.',
    timeAgo: 'Sep 29',
    date: 'SEP 29, 2026 // 14:00 EET',
    readTime: '3 MIN READ',
    weather: '8°C • CRISP • WIND 3 M/S',
    heroImage: 'https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?auto=format&fit=crop&w=1200&q=80',
    visitedCount: 2,
    amenities: [
      { icon: 'water_drop', label: 'Potable Spring' },
      { icon: 'cabin', label: 'Timber Shelter' },
      { icon: 'outdoor_grill', label: 'Stone Hearth' },
      { icon: 'forest', label: 'Dry Wood' }
    ],
    footerFeature: 'Natural spring pool',
    footerIcon: 'filter_alt',
    metrics: '165m • 3.1km',
    latitude: 61.8920,
    longitude: 23.4410,
    trailhead: {
      name: 'Seitseminen Luontokeskus P',
      latitude: 61.9160,
      longitude: 23.4020,
      elevationGain: 45,
      elevationLoss: 20
    },
    elevation: 165,
    distanceKm: 3.1,
    category: 'SPRINGHEAD',
    content: [
      'Water bubbling up from deep sandy glacial moraine into a pristine stone basin at the edge of the Seitsemisharju ridge. Crystal clear at 4.6°C year-round.',
      'Surrounded by primeval pine forest where trees are over 300 years old, scarred by historical forest fires and draped in beard lichen.'
    ],
    gallery: [],
    dispatches: [
      {
        id: 'dispatch-fi-3-1',
        slug: 'seitseminen-pitkajarvi',
        title: 'Glacial Spring Water & Ancient Scots Pine Bogs',
        date: 'SEP 29, 2026 // 14:00 EET',
        readTime: '3 MIN READ',
        excerpt: 'Sub-surface spring bubbling through Seitsemisharju moraine into a granite pool near Pitkäjärvi.',
        weather: '8°C • CRISP • WIND 3 M/S',
        heroImage: 'https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?auto=format&fit=crop&w=1200&q=80'
      },
      {
        id: 'dispatch-fi-3-2',
        slug: 'seitseminen-multiharju',
        title: 'Primeval Taiga Canopy Patrol',
        date: 'AUG 14, 2026 // 11:30 EET',
        readTime: '4 MIN READ',
        excerpt: 'Surveying 300-year-old pine stands of Multiharju ridge before descending to the springhead.',
        weather: '18°C • WARM SUN',
        heroImage: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=800&q=80'
      }
    ]
  },
  {
    id: 'note-fi-4',
    slug: 'hervantajarvi-kallio-vista',
    numberTag: '#24 VIEWPOINT',
    title: 'Hervantajärvi Kallio Vista',
    areaId: 'pirkanmaa',
    area: 'Pirkanmaa',
    description: 'High quartzite ridge shelf overlooking the narrow forested bays of Hervantajärvi and the Makkarajärvi nature reserve on the southern boundary of Tampere.',
    timeAgo: 'Sep 21',
    date: 'SEP 21, 2026 // 18:20 EET',
    readTime: '3 MIN READ',
    weather: '10°C • GOLDEN HOUR',
    heroImage: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=1200&q=80',
    visitedCount: 1,
    amenities: [
      { icon: 'visibility', label: 'Lake Vista' },
      { icon: 'outdoor_grill', label: 'Campfire Ring' },
      { icon: 'forest', label: 'Old Pine' }
    ],
    footerFeature: 'Ridge shelf 152m',
    footerIcon: 'visibility',
    metrics: '152m • 1.4km',
    latitude: 61.4180,
    longitude: 23.8680,
    trailhead: {
      name: 'Makkarajärventie Trailhead',
      latitude: 61.4240,
      longitude: 23.8550,
      elevationGain: 38,
      elevationLoss: 15
    },
    elevation: 152,
    distanceKm: 1.4,
    category: 'VIEWPOINT',
    content: [
      'The trail ascends through dense bilberry undergrowth onto a polished bedrock outcrop. From the rocky ledge, the view opens southward over Hervantajärvi, reflecting the orange hues of the autumn sunset.',
      'An official municipality campfire ring with granite stones provides a sheltered rest spot facing the lake breeze.'
    ],
    gallery: [],
    dispatches: [
      {
        id: 'dispatch-fi-4',
        slug: 'hervantajarvi-kallio-vista',
        title: 'Sunset Over the Waters of Southern Pirkanmaa',
        date: 'SEP 21, 2026 // 18:20 EET',
        readTime: '3 MIN READ',
        excerpt: 'Rocky ridge ascent overlooking mirror waters and Scots pines of the Hervantajärvi nature trail.',
        weather: '10°C • GOLDEN HOUR',
        heroImage: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=1200&q=80'
      }
    ]
  },
  {
    id: 'note-fi-5',
    slug: 'vaha-riutta-laavu',
    numberTag: '#25 SHELTER',
    title: 'Vähä-Riutan laavu',
    areaId: 'pirkanmaa',
    area: 'Pirkanmaa',
    description: 'Suosittu ja tilava hirsirakenteinen tuplalaavu ja kota Iso-Riutan ja Vähä-Riutan järvien välisellä kannaksella Birgitan polun varrella Lempäälässä. Uimalaituri, nuotiopaikka ja puuvaja.',
    timeAgo: 'Oct 04',
    date: 'OCT 04, 2026 // 06:40 EET',
    readTime: '3 MIN READ',
    weather: '2°C • CALM • BARO 1022 HPA',
    heroImage: 'https://images.unsplash.com/photo-1510312305653-8ed496efae75?auto=format&fit=crop&w=1200&q=80',
    visitedCount: 1,
    amenities: [
      { icon: 'cabin', label: 'Timber Shelter' },
      { icon: 'outdoor_grill', label: 'Stone Hearth' },
      { icon: 'forest', label: 'Dry Wood' },
      { icon: 'visibility', label: 'Lake View' },
      { icon: 'water_drop', label: 'Lake Water' }
    ],
    footerFeature: 'Lakeside isthmus',
    footerIcon: 'cabin',
    metrics: '138m • 1.2km',
    latitude: 61.4045,
    longitude: 23.9085,
    elevation: 138,
    distanceKm: 1.2,
    category: 'SHELTER',
    content: [
      'Overnight solo camp at the Vähä-Riutta double lean-to nestled between Iso-Riutta and Vähä-Riutta lakes along Birgitan polku in Lempäälä.'
    ],
    gallery: [
      { url: 'https://images.unsplash.com/photo-1510312305653-8ed496efae75?auto=format&fit=crop&w=1200&q=80', caption: 'Vähä-Riutan laavu beside calm autumn lake' }
    ],
    dispatches: [
      {
        id: 'dispatch-fi-5',
        slug: 'autumn-night-vaha-riutta',
        title: 'Autumn Night at Vähä-Riutan Laavu',
        date: 'OCT 04, 2026 // 06:40 EET',
        readTime: '3 MIN READ',
        excerpt: 'Overnight solo camp at the Vähä-Riutta double lean-to nestled between Iso-Riutta and Vähä-Riutta lakes along Birgitan polku in Lempäälä.',
        weather: '2°C • CALM • BARO 1022 HPA',
        heroImage: 'https://images.unsplash.com/photo-1510312305653-8ed496efae75?auto=format&fit=crop&w=1200&q=80'
      }
    ]
  },
  {
    id: 'savontie-trailhead',
    slug: 'savontie-trailhead',
    numberTag: '#26 TRAILHEAD',
    title: 'Savontie P-alue (Birgitan polku)',
    areaId: 'pirkanmaa',
    area: 'Pirkanmaa',
    description: 'Pysäköintialue Savontien varrella Lempäälässä. Päälähtöpiste Birgitan polulle kohti Vähä-Riutan ja Vähä-Kauas laavuja.',
    timeAgo: 'Oct 10',
    date: 'OCT 10, 2026 // 09:15 EET',
    readTime: '2 MIN READ',
    weather: '4°C • CRISP AUTUMN • BARO 1024 HPA',
    heroImage: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1200&q=80',
    visitedCount: 1,
    amenities: [
      { icon: 'forest', label: 'Dry Wood' },
      { icon: 'directions_car', label: 'Parking' }
    ],
    footerFeature: 'Trailhead Gate',
    footerIcon: 'directions_car',
    metrics: '125m • 0.0km',
    latitude: 61.3980,
    longitude: 23.8920,
    elevation: 125,
    distanceKm: 0.0,
    category: 'TRAILHEAD',
    content: ['Pysäköintialue Savontien varrella Lempäälässä. Päälähtöpiste Birgitan polulle kohti Vähä-Riutan ja Vähä-Kauas laavuja.'],
    gallery: [],
    dispatches: [
      {
        id: 'dispatch-birgitan-polku',
        slug: 'birgitan-polku-circuit',
        title: 'Birgitan Polku Lake Circuit & Ridge Traverse',
        date: 'OCT 10, 2026 // 09:15 EET',
        readTime: '3 MIN READ',
        excerpt: 'Three-stage autumn trek beginning at Savontie trailhead.',
        weather: '4°C • CRISP AUTUMN',
        heroImage: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1200&q=80'
      }
    ]
  },
  {
    id: 'vaha-kauas-laavu',
    slug: 'vaha-kauas-laavu',
    numberTag: '#27 SHELTER',
    title: 'Vähä-Kauas laavu',
    areaId: 'pirkanmaa',
    area: 'Pirkanmaa',
    description: 'Rauhallinen rantalaavu ja kamiinalla varustettu laavukota Vähä-Kausjärven itärannalla Birgitan polun erämaisella osuudella Lempäälässä. Rantanuotiopaikka ja kuivakäymälä.',
    timeAgo: 'Oct 10',
    date: 'OCT 10, 2026 // 12:45 EET',
    readTime: '3 MIN READ',
    weather: '4°C • CRISP AUTUMN • BARO 1024 HPA',
    heroImage: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=1200&q=80',
    visitedCount: 1,
    amenities: [
      { icon: 'cabin', label: 'Timber Shelter' },
      { icon: 'outdoor_grill', label: 'Stone Hearth' },
      { icon: 'forest', label: 'Dry Wood' },
      { icon: 'visibility', label: 'Lake View' },
      { icon: 'water_drop', label: 'Lake Water' }
    ],
    footerFeature: 'Lakeside kota',
    footerIcon: 'cabin',
    metrics: '132m • 4.8km',
    latitude: 61.3665,
    longitude: 23.9246,
    elevation: 132,
    distanceKm: 4.8,
    category: 'SHELTER',
    content: ['Rauhallinen rantalaavu ja kamiinalla varustettu laavukota Vähä-Kausjärven itärannalla Birgitan polun erämaisella osuudella Lempäälässä.'],
    gallery: [],
    dispatches: [
      {
        id: 'dispatch-birgitan-polku',
        slug: 'birgitan-polku-circuit',
        title: 'Birgitan Polku Lake Circuit & Ridge Traverse',
        date: 'OCT 10, 2026 // 09:15 EET',
        readTime: '3 MIN READ',
        excerpt: 'Three-stage autumn trek beginning at Savontie trailhead.',
        weather: '4°C • CRISP AUTUMN',
        heroImage: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=1200&q=80'
      }
    ]
  },
  {
    id: 'kankimaki-trailhead',
    slug: 'kankimaki-trailhead',
    numberTag: '#28 TRAILHEAD',
    title: 'Kankimäki P-alue (Helvetinjärvi)',
    areaId: 'pirkanmaa',
    area: 'Pirkanmaa',
    description: 'Pääportti ja taukokeskus Helvetinjärven kansallispuistoon Ruovedellä. Lähtöpiste polulle kohti Helvetinkolun murroslaaksoa.',
    timeAgo: 'Oct 15',
    date: 'OCT 15, 2026 // 08:00 EET',
    readTime: '2 MIN READ',
    weather: '5°C • MIST & SPRUCE CANOPY • BARO 1018 HPA',
    heroImage: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1200&q=80',
    visitedCount: 1,
    amenities: [
      { icon: 'forest', label: 'Dry Wood' },
      { icon: 'directions_car', label: 'Parking' }
    ],
    footerFeature: 'National park gate',
    footerIcon: 'directions_car',
    metrics: '180m • 0.0km',
    latitude: 62.0380,
    longitude: 23.8320,
    elevation: 180,
    distanceKm: 0.0,
    category: 'TRAILHEAD',
    content: ['Pääportti ja taukokeskus Helvetinjärven kansallispuistoon Ruovedellä.'],
    gallery: [],
    dispatches: [
      {
        id: 'dispatch-helvetinjarvi-traverse',
        slug: 'helvetinjarvi-taiga-traverse',
        title: 'Helvetinjärvi & Pirkanmaa Grand Taiga Traverse',
        date: 'OCT 15, 2026 // 08:00 EET',
        readTime: '4 MIN READ',
        excerpt: 'Comprehensive five-point expedition in Helvetinjärvi.',
        weather: '5°C • MIST',
        heroImage: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1200&q=80'
      }
    ]
  },
  {
    id: 'pirunkirkko-nakoalapaikka',
    slug: 'pirunkirkko-nakoalapaikka',
    numberTag: '#29 VIEWPOINT',
    title: 'Pirunkirkko näköalapaikka',
    areaId: 'pirkanmaa',
    area: 'Pirkanmaa',
    description: 'Karun kaunis kalliomaisema ja siirtolohkareluola Helvetinjärven jyrkänteillä.',
    timeAgo: 'Oct 15',
    date: 'OCT 15, 2026 // 11:30 EET',
    readTime: '3 MIN READ',
    weather: '5°C • MIST & SPRUCE CANOPY • BARO 1018 HPA',
    heroImage: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80',
    visitedCount: 1,
    amenities: [
      { icon: 'visibility', label: 'Lake View' },
      { icon: 'landscape', label: 'Granite Cleft' }
    ],
    footerFeature: 'Precipice Vista',
    footerIcon: 'landscape',
    metrics: '195m • 3.2km',
    latitude: 61.9960,
    longitude: 23.8120,
    elevation: 195,
    distanceKm: 3.2,
    category: 'VIEWPOINT',
    content: ['Karun kaunis kalliomaisema ja siirtolohkareluola Helvetinjärven jyrkänteillä.'],
    gallery: [],
    dispatches: [
      {
        id: 'dispatch-helvetinjarvi-traverse',
        slug: 'helvetinjarvi-taiga-traverse',
        title: 'Helvetinjärvi & Pirkanmaa Grand Taiga Traverse',
        date: 'OCT 15, 2026 // 08:00 EET',
        readTime: '4 MIN READ',
        excerpt: 'Comprehensive five-point expedition in Helvetinjärvi.',
        weather: '5°C • MIST',
        heroImage: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80'
      }
    ]
  },
  {
    id: 'kirskaanniemi-laavu',
    slug: 'kirskaanniemi-laavu',
    numberTag: '#30 SHELTER',
    title: 'Kirskaanniemi laavu',
    areaId: 'pirkanmaa',
    area: 'Pirkanmaa',
    description: 'Kaunis kallioinen niemenkärki ja useampi laavu Höytämönjärven rannalla Birgitan polun reitistöllä.',
    timeAgo: 'Oct 15',
    date: 'OCT 15, 2026 // 16:40 EET',
    readTime: '3 MIN READ',
    weather: '5°C • MIST & SPRUCE CANOPY • BARO 1018 HPA',
    heroImage: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=1200&q=80',
    visitedCount: 1,
    amenities: [
      { icon: 'cabin', label: 'Timber Shelter' },
      { icon: 'outdoor_grill', label: 'Stone Hearth' },
      { icon: 'forest', label: 'Dry Wood' },
      { icon: 'visibility', label: 'Lake View' }
    ],
    footerFeature: 'Peninsula Point',
    footerIcon: 'cabin',
    metrics: '115m • 6.4km',
    latitude: 61.4079,
    longitude: 23.7745,
    elevation: 115,
    distanceKm: 6.4,
    category: 'SHELTER',
    content: ['Kaunis kallioinen niemenkärki ja useampi laavu Höytämönjärven rannalla Birgitan polun reitistöllä.'],
    gallery: [],
    dispatches: [
      {
        id: 'dispatch-helvetinjarvi-traverse',
        slug: 'helvetinjarvi-taiga-traverse',
        title: 'Helvetinjärvi & Pirkanmaa Grand Taiga Traverse',
        date: 'OCT 15, 2026 // 08:00 EET',
        readTime: '4 MIN READ',
        excerpt: 'Comprehensive five-point expedition in Helvetinjärvi.',
        weather: '5°C • MIST',
        heroImage: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=1200&q=80'
      }
    ]
  }
]

export const mockMapWaypoints: MockMapWaypoint[] = mockFieldNotes
  .filter(note => note.category.toUpperCase() !== 'TRAILHEAD')
  .map(note => ({
    id: note.id,
    title: note.title,
    lat: note.latitude,
    lng: note.longitude,
    type: note.category.toLowerCase(),
    areaId: note.areaId,
    area: note.area,
    region: note.area
  }))

// =============================================================================
// NORMALIZED DISPATCHES (nitf_dispatches)
// =============================================================================
export const mockDispatches: Dispatch[] = [
  {
    id: 'dispatch-1',
    slug: 'langvatnet-gapahuk',
    title: 'Autumn Frost & Morning Mist at Langvatnet',
    publishedAt: '2026-10-06T09:15:00Z',
    startDate: '2026-10-03',
    endDate: '2026-10-04',
    status: 'published',
    locations: ['note-1', 'note-3'],
    excerpt: 'Hand-hewn timber lean-to with double spruce log notch joints perched on the sheltered south-east cove of Langvatnet, followed by a fast hike past Korsbekken rapids.',
    weather: '4°C • MIST • BARO 1018 HPA',
    heroImage: 'https://images.unsplash.com/photo-1510312305653-8ed496efae75?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      {
        id: 'gal-1-1',
        image: 'https://images.unsplash.com/photo-1510312305653-8ed496efae75?auto=format&fit=crop&w=1200&q=80',
        location: 'note-1',
        caption: 'Spruce timber gapahuk sheltered beneath granite ridge pines'
      },
      {
        id: 'gal-1-2',
        image: 'https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?auto=format&fit=crop&w=1200&q=80',
        location: 'note-3',
        caption: 'Cold peat-filtered brook tumbling across mossy granite stones at Korsbekken'
      },
      {
        id: 'gal-1-3',
        image: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=800&q=80',
        caption: 'Autumn taiga canopy veiled in morning mist'
      }
    ],
    content: [
      'The morning mist rose in slow, deliberate wisps across the calm mirror surface of Langvatnet. Arriving at the south-eastern cove just past first light, the scent of damp moss, resinous pine needles, and cold granite was everywhere.',
      'The gapahuk itself is a masterwork of local craftsmanship: double-scribed whole spruce trunks interlocked at the corners with axe-hewn notch joinery. Inside, the floorboards are bone dry, lifted thirty centimeters above the damp forest floor on granite footing stones.',
      'A weathered wooden timber crate on the leeward wall was stacked to the brim with split silver birch logs. After lighting a small kettle fire on the granite hearth stones, the water boiled in under six minutes.',
      'Following the ridge trail northward, we crossed the crystalline rapids of Korsbekken to replenish our field flasks with icy mineral water.'
    ]
  },
  {
    id: 'dispatch-2',
    slug: 'langvatnet-midsummer',
    title: 'Midsummer Solstice Camp & Birch Carving',
    publishedAt: '2026-06-24T18:00:00Z',
    startDate: '2026-06-20',
    endDate: '2026-06-22',
    status: 'published',
    locations: ['note-1'],
    excerpt: 'Long twilight hours at the gapahuk. Carving butter knives from green birch limbs by the lakeshore campfire.',
    weather: '16°C • GOLDEN DUSK • CALM',
    heroImage: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=800&q=80',
    gallery: [
      {
        id: 'gal-2-1',
        image: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=800&q=80',
        location: 'note-1',
        caption: 'Late evening golden hour light filtering through the birch canopy'
      }
    ],
    content: [
      'Twilight that never fades into true darkness. Sitting on the smooth granite shelf as the water turned lilac and rose pink.'
    ]
  },
  {
    id: 'dispatch-fi-3-1',
    slug: 'seitseminen-pitkajarvi',
    title: 'Glacial Spring Water & Ancient Scots Pine Bogs',
    publishedAt: '2026-09-29T14:00:00Z',
    status: 'published',
    locations: ['note-fi-3', 'note-fi-4'],
    excerpt: 'Sub-surface spring bubbling through Seitsemisharju moraine into a granite pool near Pitkäjärvi, followed by the southern ridge overlook.',
    weather: '8°C • CRISP • WIND 3 M/S',
    heroImage: 'https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      {
        id: 'gal-3-1',
        image: 'https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?auto=format&fit=crop&w=1200&q=80',
        location: 'note-fi-3',
        caption: 'Pure sub-surface spring bubbling into granite stone basin'
      },
      {
        id: 'gal-3-2',
        image: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=1200&q=80',
        location: 'note-fi-4',
        caption: 'Bedrock overlook across southern Pirkanmaa lakes'
      }
    ],
    content: [
      'Water bubbling up from deep sandy glacial moraine into a pristine stone basin at the edge of the Seitsemisharju ridge. Crystal clear at 4.6°C year-round.'
    ]
  },
  {
    id: 'dispatch-fi-3-2',
    slug: 'seitseminen-multiharju',
    title: 'Primeval Taiga Canopy Patrol',
    publishedAt: '2026-08-14T11:30:00Z',
    status: 'published',
    locations: ['note-fi-3'],
    excerpt: 'Surveying 300-year-old pine stands of Multiharju ridge before descending to the springhead.',
    weather: '18°C • WARM SUN',
    heroImage: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=800&q=80',
    content: [
      'Surveying 300-year-old pine stands of Multiharju ridge before descending to the springhead.'
    ]
  },
  {
    id: 'dispatch-fi-4',
    slug: 'hervantajarvi-kallio-vista',
    title: 'Sunset Over the Waters of Southern Pirkanmaa',
    publishedAt: '2026-09-21T18:20:00Z',
    status: 'published',
    locations: ['note-fi-4'],
    excerpt: 'Rocky ridge ascent overlooking mirror waters and Scots pines of the Hervantajärvi nature trail.',
    weather: '10°C • GOLDEN HOUR',
    heroImage: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=1200&q=80',
    content: [
      'The trail ascends through dense bilberry undergrowth onto a polished bedrock outcrop. From the rocky ledge, the view opens southward over Hervantajärvi.'
    ]
  },
  {
    id: 'dispatch-kikut',
    slug: 'kikut-traverse',
    title: 'Autumn Ascent to Kikut Peak & Katnosa Traverse',
    publishedAt: '2026-10-14T14:30:00Z',
    startDate: '2026-10-11',
    endDate: '2026-10-12',
    status: 'published',
    locations: ['langvatnet-gapahuk', 'kikut-peak'],
    excerpt: 'Challenging high-ridge traverse connecting Langvatnet gapahuk with the panoramic granite summit of Kikut Peak.',
    weather: '6°C • CRISP • GUSTS 5 M/S',
    heroImage: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      {
        id: 'gal-kikut-1',
        image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80',
        location: 'kikut-peak',
        caption: 'High granite ledge of Kikut Peak overlooking Bjørnsjøen'
      },
      {
        id: 'gal-kikut-2',
        image: 'https://images.unsplash.com/photo-1510312305653-8ed496efae75?auto=format&fit=crop&w=1200&q=80',
        location: 'langvatnet-gapahuk',
        caption: 'Morning basecamp at Langvatnet before starting the climb'
      }
    ],
    content: [
      'We set out early from Langvatnet gapahuk as first frost coated the spruce needles.',
      'The trail climbs steadily toward Kikut Peak, crossing rocky scree slopes before opening into the great panorama.'
    ]
  },
  {
    id: 'dispatch-fi-5',
    slug: 'autumn-night-vaha-riutta',
    title: 'Autumn Night at Vähä-Riutan Laavu',
    publishedAt: '2026-10-04T06:40:00Z',
    status: 'published',
    locations: ['vaha-riutta-laavu'],
    excerpt: 'Overnight solo camp at the Vähä-Riutta double lean-to nestled between Iso-Riutta and Vähä-Riutta lakes along Birgitan polku in Lempäälä.',
    weather: '2°C • CALM • BARO 1022 HPA',
    heroImage: 'https://images.unsplash.com/photo-1510312305653-8ed496efae75?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      {
        id: 'gal-vaha-riutta-1',
        image: 'https://images.unsplash.com/photo-1510312305653-8ed496efae75?auto=format&fit=crop&w=1200&q=80',
        location: 'vaha-riutta-laavu',
        caption: 'Vähä-Riutan laavu beside calm autumn lake'
      }
    ],
    content: [
      'Overnight solo camp at the Vähä-Riutta double lean-to nestled between Iso-Riutta and Vähä-Riutta lakes along Birgitan polku in Lempäälä.'
    ]
  },
  {
    id: 'dispatch-birgitan-polku',
    slug: 'birgitan-polku-circuit',
    title: 'Birgitan Polku Lake Circuit & Ridge Traverse',
    publishedAt: '2026-10-12T09:15:00Z',
    startDate: '2026-10-09',
    endDate: '2026-10-10',
    status: 'published',
    locations: ['savontie-trailhead', 'vaha-riutta-laavu', 'vaha-kauas-laavu'],
    excerpt: 'Three-stage autumn trek beginning at Savontie trailhead, traversing north along pine ridges to the double timber shelter at Vähä-Riutta, and concluding at the remote lakeside kota at Vähä-Kauas.',
    weather: '4°C • CRISP AUTUMN • BARO 1024 HPA',
    heroImage: 'https://images.unsplash.com/photo-1510312305653-8ed496efae75?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      {
        id: 'gal-bpc-1',
        image: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1200&q=80',
        location: 'savontie-trailhead',
        caption: 'Savontie trailhead gate under morning spruce shadows'
      },
      {
        id: 'gal-bpc-2',
        image: 'https://images.unsplash.com/photo-1510312305653-8ed496efae75?auto=format&fit=crop&w=1200&q=80',
        location: 'vaha-riutta-laavu',
        caption: 'Double timber lean-to on the Vähä-Riutta lake isthmus'
      },
      {
        id: 'gal-bpc-3',
        image: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=1200&q=80',
        location: 'vaha-kauas-laavu',
        caption: 'Lakeside shelter and firewood reserve at Vähä-Kauas'
      }
    ],
    content: [
      'Stage 1: Departed Savontie trailhead under clear skies and cold autumn air.',
      'Stage 2: Reached the Vähä-Riutta isthmus after a brisk 1.2km trek along pine root paths. The double lean-to was in immaculate condition with dry birch logs in the shed.',
      'Stage 3: Pushed south along the Birgitan Polku ridge trail to Vähä-Kauas. Stoked a small hearth fire as evening mist settled over the water.'
    ]
  },
  {
    id: 'dispatch-helvetinjarvi-traverse',
    slug: 'helvetinjarvi-taiga-traverse',
    title: 'Helvetinjärvi & Pirkanmaa Grand Taiga Traverse',
    publishedAt: '2026-10-18T10:00:00Z',
    startDate: '2026-10-14',
    endDate: '2026-10-16',
    status: 'published',
    locations: [
      'kankimaki-trailhead',
      'helvetinkolu-gapahuk',
      'pirunkirkko-nakoalapaikka',
      'kintulammi-kirkkokivi',
      'kirskaanniemi-laavu'
    ],
    excerpt: 'Comprehensive five-point expedition surveying the fault valley staircase at Helvetinkolu, the precipitous cleft of Pirunkirkko, natural springheads at Kintulammi, and the rocky pine peninsula of Kirskaanniemi.',
    weather: '5°C • MIST & SPRUCE CANOPY • BARO 1018 HPA',
    heroImage: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      {
        id: 'gal-htt-1',
        image: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1200&q=80',
        location: 'kankimaki-trailhead',
        caption: 'Kankimäki trailhead gate leading into primeval spruce stands'
      },
      {
        id: 'gal-htt-2',
        image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80',
        location: 'helvetinkolu-gapahuk',
        caption: 'Glacial fault cleft stairs descending to Helvetinjärvi shoreline'
      },
      {
        id: 'gal-htt-3',
        image: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=1200&q=80',
        location: 'pirunkirkko-nakoalapaikka',
        caption: 'Granite boulder cave and steep precipice ledge at Pirunkirkko'
      },
      {
        id: 'gal-htt-4',
        image: 'https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?auto=format&fit=crop&w=1200&q=80',
        location: 'kintulammi-kirkkokivi',
        caption: 'Glacial erratic church stone and clear spring brook at Kintulammi'
      },
      {
        id: 'gal-htt-5',
        image: 'https://images.unsplash.com/photo-1510312305653-8ed496efae75?auto=format&fit=crop&w=1200&q=80',
        location: 'kirskaanniemi-laavu',
        caption: 'Sunset across Höytämönjärvi from Kirskaanniemi point'
      }
    ],
    content: [
      'Stop 1 - Kankimäki Trailhead: Commenced expedition at 08:00 through morning fog.',
      'Stop 2 - Helvetinkolu Cleft: Descended the iconic 40m granite fault stairs.',
      'Stop 3 - Pirunkirkko Precipice: Surveyed the ancient cliffside rock overhang.',
      'Stop 4 - Kintulammi Kirkkokivi: Replenished water flasks at the boreal spring and rested at the glacial erratic boulder.',
      'Stop 5 - Kirskaanniemi Peninsula: Concluded the grand traverse beside the Höytämönjärvi hearth.'
    ]
  }
]

// =============================================================================
// NORMALIZED LOCATIONS (nitf_locations - visitCount derived from dispatches)
// =============================================================================
export const mockLocations: Location[] = mockFieldNotes.map(note => {
  const linkedDispatches = mockDispatches.filter(d => Array.isArray(d.locations) && d.locations.includes(note.id))

  const amenityList: LocationAmenity[] = []
  note.amenities.forEach(a => {
    const l = a.label.toLowerCase()
    if (l.includes('shelter')) amenityList.push('timber_shelter')
    else if (l.includes('hearth') || l.includes('fire') || l.includes('grill')) amenityList.push('stone_hearth')
    else if (l.includes('spring') || l.includes('potable')) amenityList.push('potable_water')
    else if (l.includes('wood')) amenityList.push('dry_wood')
    else if (l.includes('view') || l.includes('vista')) amenityList.push('lake_view')
    else if (l.includes('water')) amenityList.push('lake_water')
    else if (l.includes('tent') || l.includes('pitch')) amenityList.push('tent_pitch')
    else if (l.includes('parking') || l.includes('trailhead')) amenityList.push('parking')
  })

  // Trailhead self-referencing Location (or the location itself if it has parking)
  let trailheadLoc: Location | undefined
  if (note.trailhead) {
    trailheadLoc = {
      id: `th-${note.id}`,
      slug: `${note.slug}-trailhead`,
      name: note.trailhead.name,
      area: note.areaId,
      category: 'trailhead',
      latitude: note.trailhead.latitude,
      longitude: note.trailhead.longitude,
      summary: `Trailhead parking for ${note.title}`,
      amenities: ['parking'],
      hasParking: true,
      elevationGain: note.trailhead.elevationGain,
      elevationLoss: note.trailhead.elevationLoss,
      trailGeometry: note.trailhead.trailGeometry
    }
  } else if (amenityList.includes('parking') || note.hasParking) {
    trailheadLoc = {
      id: note.id,
      slug: note.slug,
      name: note.title,
      area: note.areaId,
      category: note.category.toLowerCase() as LocationCategory,
      latitude: note.latitude,
      longitude: note.longitude,
      summary: note.description,
      amenities: amenityList,
      hasParking: true,
      elevationGain: 0,
      elevationLoss: 0
    }
  }

  const cat = note.category.toLowerCase() as LocationCategory
  const hasShelterAmenity = amenityList.includes('timber_shelter') || cat === 'shelter'
  const defaultShelterCapacity = note.shelterCapacity ?? (hasShelterAmenity ? 4 : 0)
  const defaultTentSpaces = note.tentSpaces ?? (cat === 'shelter' ? 3 : cat === 'hearth' ? 2 : cat === 'trailhead' ? 0 : 1)

  return {
    id: note.id,
    slug: note.slug,
    name: note.title,
    area: note.areaId,
    category: cat,
    latitude: note.latitude,
    longitude: note.longitude,
    elevation: note.elevation,
    shelterCapacity: defaultShelterCapacity,
    tentSpaces: defaultTentSpaces,
    hasParking: amenityList.includes('parking') || Boolean(note.hasParking),
    summary: note.description,
    amenities: amenityList,
    trailhead: trailheadLoc,
    trailGeometry: note.trailhead?.trailGeometry,
    elevationGain: note.trailhead?.elevationGain,
    elevationLoss: note.trailhead?.elevationLoss,
    coverImage: {
      id: `img-${note.id}`,
      url: note.heroImage,
      alt: note.title
    },
    dispatches: linkedDispatches
  }
})


