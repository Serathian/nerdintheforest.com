import type {
  GearItem as ModelGearItem,
  GearReview,
  Loadout,
  GearCategory,
  GearReviewTopic,
  LoadoutSeason,
  LoadoutItemStatus
} from '../types/models'
import { calculateReadTime, formatWeight, calculateLoadoutStats } from '../utils/formatters'

// Re-export model types
export type {
  ModelGearItem as GearItem,
  GearReview,
  Loadout,
  GearCategory,
  GearReviewTopic,
  LoadoutSeason,
  LoadoutItemStatus
}

// =============================================================================
// MASTER GEAR ITEMS CATALOG (nitf_gear_items)
// =============================================================================
export const mockGearItems: ModelGearItem[] = [
  {
    id: 'hilleberg-akto',
    name: 'Akto 1P Tent',
    brand: 'Hilleberg',
    category: 'shelter_sleep',
    weightGrams: 1700,
    specNote: 'Kerlon 1200 • 4-Season Solo Tunnel',
    notes: 'Proven in gale-force winds on exposed Nordmarka crags. Bone dry inside.',
    image: 'https://images.unsplash.com/photo-1510312305653-8ed496efae75?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'wm-antelope',
    name: 'Antelope MF Sleeping Bag',
    brand: 'Western Mountaineering',
    category: 'shelter_sleep',
    weightGrams: 1105,
    specNote: '850+ Fill Goose Down • -10°C Limit • Microfiber Shell',
    notes: 'Breathable microfiber shell sheds frost and gapahuk timber condensation effortlessly.'
  },
  {
    id: 'tar-xtherm',
    name: 'NeoAir XTherm NXT Sleeping Pad',
    brand: 'Therm-a-Rest',
    category: 'shelter_sleep',
    weightGrams: 439,
    specNote: 'R-Value 7.3 • 7.6cm Thickness • WingLock Valve',
    notes: 'Impervious to ground frost when sleeping directly on granite bedrock shelves.'
  },
  {
    id: 'trangia-27',
    name: 'Trangia 27-1 UL Hard Anodized',
    brand: 'Trangia',
    category: 'cook_water',
    weightGrams: 690,
    specNote: 'Spirit Burner Kit • Simmer Ring • 2x 1.0L Pots',
    notes: 'Dead-reliable in freezing autumn rain using clean denatured bio-ethanol.'
  },
  {
    id: 'katadyn-befree',
    name: 'Katadyn BeFree 1.0L Microfilter',
    brand: 'Katadyn',
    category: 'cook_water',
    weightGrams: 63,
    specNote: '0.1 Micron EZ-Clean Membrane • Collapsible TPU Bladder',
    notes: 'Rapid flow rate from cold glacial tarns and peat-filtered forest springs.'
  },
  {
    id: 'lapland-kuksa',
    name: 'Hand-Carved Lapland Kuksa',
    brand: 'Kuksa Artisan',
    category: 'cook_water',
    weightGrams: 110,
    specNote: 'Salt-cured Birch Burl • Braided Leather Lanyard • 180ml',
    notes: 'Traditional morning coffee and boiling brook water drinking vessel.'
  },
  {
    id: 'silva-expedition',
    name: 'Silva Expedition S Compass',
    brand: 'Silva',
    category: 'navigation_tools',
    weightGrams: 86,
    specNote: 'Global Needle • Mirror Sight • Clinometer • 1:25k Romer',
    notes: 'Precision magnetic bearing navigation across unmarked forest ridges.'
  },
  {
    id: 'nordmarka-topo',
    name: 'Nordmarka 1:25,000 Topo Map',
    brand: 'Statens Kartverk',
    category: 'navigation_tools',
    weightGrams: 45,
    specNote: 'Tyvek Synthetic Waterproof Sheet • Annotated Waypoints',
    notes: 'Hand-annotated shelter waypoints, freshwater springs, and contour lines.'
  },
  {
    id: 'mora-garberg',
    name: 'Morakniv Garberg High-Carbon',
    brand: 'Morakniv',
    category: 'navigation_tools',
    weightGrams: 272,
    specNote: '3.2mm Swedish Carbon Steel • Full Tang • Multi-Mount',
    notes: 'Batoning firewood, carving tinder, and outdoor camp maintenance.'
  },
  {
    id: 'petzl-actik',
    name: 'Petzl Actik Core Headlamp',
    brand: 'Petzl',
    category: 'navigation_tools',
    weightGrams: 75,
    specNote: '450 Lumens • Red Night Vision LED • USB Rechargeable',
    notes: 'Essential for pitch-black autumn trail navigation and timber camp chores.'
  },
  {
    id: 'lundhags-vandra',
    name: 'Lundhags Vandra High Shell Boots',
    brand: 'Lundhags',
    category: 'pack_apparel',
    weightGrams: 1540,
    specNote: 'Unlined Full-Grain Leather • Certech Cellular Rubber Bottom',
    notes: 'Dries in 3 minutes after bog submersion; paired with dual wool sock system.'
  },
  {
    id: 'fjallraven-singi',
    name: 'Fjällräven Singi 48 Rucksack',
    brand: 'Fjällräven',
    category: 'pack_apparel',
    weightGrams: 2100,
    specNote: 'G-1000 HeavyDuty Eco • FSC Certified Birch Wood Frame',
    notes: 'Classic Scandinavian external rucksack hauling capacity.'
  },
  {
    id: 'field-repair-kit',
    name: 'Modular Backcountry Repair Kit',
    brand: 'Surveyor Field',
    category: 'hygiene_repair',
    weightGrams: 85,
    specNote: 'Tenacious Tape • Curved Sailmaker Needle • Kevlar Thread • Snare Wire',
    notes: 'Minimalist failure recovery kit for rucksacks, boots, and shelters.'
  },
  {
    id: 'alpacka-classic',
    name: 'Alpacka Raft Classic Packraft',
    brand: 'Alpacka Raft',
    category: 'pack_apparel',
    weightGrams: 2600,
    specNote: 'Urethane-Coated Nylon • Cargo Fly Zipper • Removable Seat',
    notes: 'Unlocks secluded island campsites and uncharted tarn fishing coves.'
  },
  {
    id: 'aquabound-paddle',
    name: 'Aqua-Bound Manta Ray Carbon Paddle',
    brand: 'Aqua-Bound',
    category: 'pack_apparel',
    weightGrams: 850,
    specNote: '4-Piece Breakdown • Carbon Shaft • Resilient Blades',
    notes: 'Packs flat against rucksack exterior for trail portages.'
  }
]

// =============================================================================
// GEAR REVIEWS (nitf_gear_reviews)
// =============================================================================
export const mockGearReviews: GearReview[] = [
  {
    id: 'insight-1',
    slug: 'hilleberg-akto-durability',
    title: 'Hilleberg Kerlon 1200: 4 Years of Sub-Arctic Pine & Sleet Abrasion',
    gearItem: mockGearItems.find(i => i.id === 'hilleberg-akto')!,
    topic: 'durability',
    publishedAt: 'OCT 2026 // FIELD LOG',
    durationTested: '48 Backcountry Nights Across 4 Seasons',
    summary: 'An exhaustive assessment of siliconized nylon durability under severe northern exposure, constant sap exposure, and gale-force ridge winds.',
    keyTakeaways: [
      '12 kg tear strength prevents punctures from sharp granite erratics from expanding into catastrophic tears.',
      '100% silicone coating (3 layers per side) retains hydrophobic water beading with zero fluorocarbon DWR breakdown.',
      'Unlike polyurethane (PU) coated fabrics, Kerlon has shown zero sticky hydrolysis or seam tape delamination after repeated damp storage.',
      'Resinous Scots pine sap spots were safely cleaned using pure isopropanol without degrading fabric elasticity.'
    ],
    verdict: 'MECHANICAL INTEGRITY 100% // ZERO SEAM LEAKAGE OR TENSILE DEGRADATION AFTER 4 YEARS OF HARD FIELD USE.',
    heroImage: 'https://images.unsplash.com/photo-1510312305653-8ed496efae75?auto=format&fit=crop&w=800&q=80',
    content: 'Longform field review of the Hilleberg Akto under Arctic conditions.'
  },
  {
    id: 'insight-2',
    slug: 'trangia-subzero-physics',
    title: 'Vapor Pressure Physics: Why Trangia Bio-Ethanol Defeats Canister Gas Below -5°C',
    gearItem: mockGearItems.find(i => i.id === 'trangia-27')!,
    topic: 'thermal',
    publishedAt: 'SEP 2026 // LAB & FIELD',
    durationTested: 'Sub-Zero Tests from -3°C down to -22°C',
    summary: 'Analyzing boiling telemetry and vaporization thermodynamics in freezing environments.',
    keyTakeaways: [
      'Isobutane/propane canisters suffer severe pressure collapse when the canister wall temperature drops below the fuel boiling point.',
      'Denatured bio-ethanol burns by passive liquid wicking; pairing with a Trangia winter preheat pad maintains steady boil times even at -20°C.',
      'Zero moving valves, O-rings, or pressurized hose junctions to freeze, crack, or leak in sub-zero frost.',
      'Fuel availability is universal across rural Scandinavian grocery stores and timber outposts as "Rødsprit".'
    ],
    verdict: 'LIQUID SPIRIT FUELS RETAIN 100% OPERATIONAL RELIABILITY WHERE GAS CANISTERS SUFFER SYSTEMIC PRESSURE COLLAPSE.',
    heroImage: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=800&q=80',
    content: 'Full review of Trangia spirit stove efficiency in deep frost.'
  },
  {
    id: 'insight-3',
    slug: 'lundhags-shell-boots',
    title: 'The Lundhags Shell Boot System vs Gore-Tex in Norwegian Sphagnum Bogs',
    gearItem: mockGearItems.find(i => i.id === 'lundhags-vandra')!,
    topic: 'philosophy',
    publishedAt: 'AUG 2026 // TAIGA SURVEY',
    durationTested: '350+ Kilometers Across Wetland Taiga',
    summary: 'Why unlined leather shell boots with dual merino wool liners outperform membrane-lined footwear in boreal wetlands.',
    keyTakeaways: [
      'Gore-Tex membrane hiking boots inevitably flood over the ankle collar in deep bog defiles and take 72+ hours to dry in damp cold air.',
      'Unlined shell boots possess zero foam insulation to hold water; simply wring out the wool socks, wipe the cellular rubber base with a bandanna, and put on dry spare socks to be 100% dry in 3 minutes.',
      'Certech cellular rubber footbed provides complete barrier against peat acids, standing mire, and sharp dwarf birch roots.',
      'Full leather upper breathes freely through high collar without moisture trap buildup.'
    ],
    verdict: 'MEMBRANES RETAIN MOISTURE INTERNALLY IN DENSE BOGS. A MODULAR UNLINED SHELL BOOT DRIES INSTANTLY AT THE GAPAHUK.',
    heroImage: 'https://images.unsplash.com/photo-1473448912268-2022ce9509d8?auto=format&fit=crop&w=800&q=80',
    content: 'Full comparison of unlined shell boots vs waterproof membranes.'
  },
  {
    id: 'insight-4',
    slug: 'neoair-xtherm-thermal',
    title: 'Sub-Arctic Sleep Conduction: Why Pad R-Value Outranks Sleeping Bag Loft',
    gearItem: mockGearItems.find(i => i.id === 'tar-xtherm')!,
    topic: 'thermal',
    publishedAt: 'JUL 2026 // FIELD LOG',
    durationTested: '18 Frozen Ground Nights (0°C to -15°C)',
    summary: 'Quantitative heat transfer analysis demonstrating that ground conductive cooling accounts for up to 60% of sleep heat loss.',
    keyTakeaways: [
      'Under body weight, sleeping bag insulation compresses to ~3mm underneath the sleeper, dropping thermal resistance below R-0.5.',
      'Without an R-6.0+ thermal barrier, core body heat conductively bleeds directly into the heat sink of frozen bedrock or permafrost.',
      'Reflective ThermaCapture triangular core matrix reflects infrared radiant heat back to the body while trapping convective air pockets.',
      'A 7.6cm loft prevents hip bone contact with uneven granite erratics, maintaining continuous insulation.'
    ],
    verdict: 'NEVER UPGRADE A SLEEPING BAG BEFORE SECURING AN R-7.0+ THERMAL PAD BARRIER ON BOREAL ROCK.',
    heroImage: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80',
    content: 'Thermal analysis of ground insulation in cold environments.'
  },
  {
    id: 'insight-5',
    slug: 'morakniv-garberg-patina',
    title: 'Carbon Steel in Humid Taiga: The Forced Birch Vinegar Patina Protocol',
    gearItem: mockGearItems.find(i => i.id === 'mora-garberg')!,
    topic: 'maintenance',
    publishedAt: 'JUN 2026 // FORGE & FIELD',
    durationTested: '24 Months Continuous Taiga Field Use',
    summary: 'Chemical surface passivation technique to prevent destructive red rust in high-humidity boreal moss stands.',
    keyTakeaways: [
      'Polished high-carbon steel rusts within 3 hours when exposed to acidic bilberry juices and damp sphagnum moss.',
      'Immersion in heated apple cider vinegar and crushed birch polypore mushroom liquor converts the active iron surface into dark magnetite (Fe3O4 black oxide).',
      'Black oxide patina holds mineral oil film 4x longer than bare ground steel, allowing heavy log splitting with zero flaking.',
      'Scandi-grind edge is maintained on an Arkansas fine oil stone in under 2 minutes.'
    ],
    verdict: 'FORCED MAGNETITE PATINA NEUTRALIZES OXIDATION WHILE MAINTAINING SURGICAL SCANDI-GRIND BARK SHAVING EDGES.',
    heroImage: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=800&q=80',
    content: 'Chemical passivation and sharpening protocol for Swedish carbon steel.'
  },
  {
    id: 'insight-6',
    slug: 'field-repair-manifest',
    title: 'The 85-Gram Field Repair Manifest: Equipment Self-Sufficiency',
    gearItem: mockGearItems.find(i => i.id === 'field-repair-kit')!,
    topic: 'maintenance',
    publishedAt: 'MAY 2026 // PACK REVIEW',
    durationTested: 'Deployed on 7 Multi-Day Expeditions',
    summary: 'Minimalist failure recovery kit capable of repairing tents, pulks, ski bindings, and pack harnesses in isolated wilderness sectors.',
    keyTakeaways: [
      '1 meter of Tenacious Tape rolled around a Bic lighter seals torn silnylon, cracked water bladders, and punctured sleeping pads instantly.',
      'A #4 curved sailmaker’s needle + 5m Kevlar thread repairs torn pack suspension webbing under 40kg dynamic load.',
      '1.5m copper snare wire fixes broken snowshoe hinges, stove pot supports, or ski poles when screws shear in extreme cold.',
      'Small tube of Seam Grip + alcohol prep pads handles vulcanized rubber boot repairs overnight beside the hearth.'
    ],
    verdict: 'SELF-RESCUE REQUIRES MECHANICAL HARDWARE, NOT SPARE ELECTRONICS. WEIGHT COST IS NEGLIGIBLE AT 85 GRAMS.',
    heroImage: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
    content: 'Field equipment repair kit breakdown and instructions.'
  }
]

// =============================================================================
// LOADOUTS (nitf_loadouts - Terrain removed, weights dynamically computed)
// =============================================================================
export const mockLoadouts: Loadout[] = [
  {
    id: 'AUTUMN',
    slug: 'autumn-taiga',
    title: 'Autumn Taiga & Lake Bivouac',
    season: 'autumn',
    tempRange: '-2°C to 10°C',
    description: 'Solo gapahuk bivouac, cold mist, peat wetlands, and frost nights',
    items: [
      { item: mockGearItems.find(i => i.id === 'hilleberg-akto')!, status: 'packed' },
      { item: mockGearItems.find(i => i.id === 'wm-antelope')!, status: 'packed' },
      { item: mockGearItems.find(i => i.id === 'tar-xtherm')!, status: 'packed' },
      { item: mockGearItems.find(i => i.id === 'trangia-27')!, status: 'packed' },
      { item: mockGearItems.find(i => i.id === 'katadyn-befree')!, status: 'packed' },
      { item: mockGearItems.find(i => i.id === 'lapland-kuksa')!, status: 'packed' },
      { item: mockGearItems.find(i => i.id === 'silva-expedition')!, status: 'essential' },
      { item: mockGearItems.find(i => i.id === 'nordmarka-topo')!, status: 'essential' },
      { item: mockGearItems.find(i => i.id === 'mora-garberg')!, status: 'essential' },
      { item: mockGearItems.find(i => i.id === 'petzl-actik')!, status: 'essential' },
      { item: mockGearItems.find(i => i.id === 'lundhags-vandra')!, status: 'worn' },
      { item: mockGearItems.find(i => i.id === 'fjallraven-singi')!, status: 'packed' },
      { item: mockGearItems.find(i => i.id === 'field-repair-kit')!, status: 'essential' }
    ]
  },
  {
    id: 'WINTER',
    slug: 'winter-subzero',
    title: 'Sub-Zero Ski & Pulk Expedition',
    season: 'winter',
    tempRange: '-22°C to -4°C',
    description: 'Frozen lakes, ski traverse, gapahuk fires, and heavy frost line',
    items: [
      { item: mockGearItems.find(i => i.id === 'hilleberg-akto')!, status: 'packed' },
      { item: mockGearItems.find(i => i.id === 'wm-antelope')!, status: 'packed' },
      { item: mockGearItems.find(i => i.id === 'tar-xtherm')!, status: 'packed' },
      { item: mockGearItems.find(i => i.id === 'trangia-27')!, status: 'packed' },
      { item: mockGearItems.find(i => i.id === 'silva-expedition')!, status: 'essential' },
      { item: mockGearItems.find(i => i.id === 'mora-garberg')!, status: 'essential' },
      { item: mockGearItems.find(i => i.id === 'field-repair-kit')!, status: 'essential' }
    ]
  },
  {
    id: 'SPRING',
    slug: 'spring-thaw',
    title: 'Spring Thaw & Fastpacking Traverse',
    season: 'spring',
    tempRange: '1°C to 14°C',
    description: 'Snowmelt tarns, rushing brooks, granite ridges, and early daylight',
    items: [
      { item: mockGearItems.find(i => i.id === 'hilleberg-akto')!, status: 'packed' },
      { item: mockGearItems.find(i => i.id === 'tar-xtherm')!, status: 'packed' },
      { item: mockGearItems.find(i => i.id === 'katadyn-befree')!, status: 'packed' },
      { item: mockGearItems.find(i => i.id === 'silva-expedition')!, status: 'essential' },
      { item: mockGearItems.find(i => i.id === 'field-repair-kit')!, status: 'essential' }
    ]
  },
  {
    id: 'SUMMER',
    slug: 'summer-packraft',
    title: 'Summer Lake Archipelago & Packraft Loop',
    season: 'summer',
    tempRange: '12°C to 24°C',
    description: 'Midnight sun, calm boreal waterways, swimming coves, and island bivouacs',
    items: [
      { item: mockGearItems.find(i => i.id === 'alpacka-classic')!, status: 'packed' },
      { item: mockGearItems.find(i => i.id === 'aquabound-paddle')!, status: 'packed' },
      { item: mockGearItems.find(i => i.id === 'katadyn-befree')!, status: 'packed' },
      { item: mockGearItems.find(i => i.id === 'lapland-kuksa')!, status: 'packed' },
      { item: mockGearItems.find(i => i.id === 'silva-expedition')!, status: 'essential' }
    ]
  },
  {
    id: 'autumn-packraft-recon',
    slug: 'autumn-packraft-recon',
    title: 'Autumn Lake Traverse & Packraft Kit',
    season: 'autumn',
    tempRange: '0°C to 8°C',
    description: 'Amphibious lake-hopping and pine peninsula bivouacs in late October',
    items: [
      { item: mockGearItems.find(i => i.id === 'hilleberg-akto')!, status: 'packed' },
      { item: mockGearItems.find(i => i.id === 'alpacka-classic')!, status: 'packed' },
      { item: mockGearItems.find(i => i.id === 'aquabound-paddle')!, status: 'packed' },
      { item: mockGearItems.find(i => i.id === 'trangia-27')!, status: 'packed' },
      { item: mockGearItems.find(i => i.id === 'silva-expedition')!, status: 'essential' }
    ]
  }
]

// =============================================================================
// BACKWARDS-COMPATIBILITY ADAPTERS FOR EXISTING COMPONENTS & TESTS
// =============================================================================

export interface GearInsight {
  id: string
  gearItemId?: string
  gearItemName?: string
  gearCategory?: GearCategory
  gearCategoryLabel?: string
  tag: string
  category: 'DURABILITY' | 'THERMAL' | 'MAINTENANCE' | 'PHILOSOPHY'
  title: string
  date: string
  readTime: string
  image: string
  equipmentTested: string
  duration: string
  summary: string
  observations: string[]
  verdict: string
  telemetry: { label: string; value: string }[]
}

export interface GearItemLoadoutRef {
  id: string
  slug: string
  title: string
  season: string
}

export interface LoadoutDispatchRef {
  id: string
  slug: string
  title: string
  date?: string
}

export interface LoadoutCategory {
  name: string
  items: Array<{
    id: string
    name: string
    brand?: string
    spec: string
    status: 'PACKED' | 'ESSENTIAL' | 'READY' | 'WORN' | 'CONSUMABLE' | ''
    weight: string
    weightGrams: number
    note: string
    category: string
    categoryKey?: GearCategory
    insightId?: string
    insightIds?: string[]
    loadouts?: GearItemLoadoutRef[]
  }>
}

export interface LoadoutKit {
  id: string
  slug?: string
  season: 'AUTUMN' | 'WINTER' | 'SPRING' | 'SUMMER'
  label: string
  title: string
  subtitle: string
  tempRange: string
  terrain?: string
  baseWeightKg: number
  totalItemsCount?: number
  categories: LoadoutCategory[]
  dispatches?: LoadoutDispatchRef[]
}

export const CATEGORY_NAMES: Record<GearCategory, string> = {
  shelter_sleep: 'SHELTER & SLEEP',
  cook_water: 'COOK & WATER',
  navigation_tools: 'NAVIGATION & TOOLS',
  pack_apparel: 'PACK & APPAREL',
  hygiene_repair: 'FIELD REPAIR & HYGIENE'
}

export function getMatchingReviewsForItem(item: ModelGearItem, reviews: GearReview[] = []): GearReview[] {
  return reviews.filter(r => {
    const rItem = r.gearItem as ModelGearItem
    if (rItem && typeof rItem === 'object') {
      return String(rItem.id) === String(item.id) || rItem.name?.toLowerCase() === item.name?.toLowerCase()
    }
    return String(r.gearItem) === String(item.id)
  })
}

export function getMatchingLoadoutsForItem(
  item: ModelGearItem,
  loadouts: Loadout[] = []
): GearItemLoadoutRef[] {
  const matches: GearItemLoadoutRef[] = []
  loadouts.forEach(loadout => {
    const hasItem = (loadout.items || []).some(entry => {
      const entryItem = entry.item as ModelGearItem
      if (entryItem && typeof entryItem === 'object') {
        return String(entryItem.id) === String(item.id) || entryItem.name?.toLowerCase() === item.name?.toLowerCase()
      }
      return String(entry.item) === String(item.id)
    })
    if (hasItem) {
      matches.push({
        id: loadout.slug || String(loadout.id),
        slug: loadout.slug || String(loadout.id),
        title: loadout.title,
        season: (loadout.season || 'autumn').toUpperCase()
      })
    }
  })
  return matches
}

export function convertGearItemsToCategories(
  items: ModelGearItem[] = [],
  reviews: GearReview[] = [],
  loadouts: Loadout[] = []
): LoadoutCategory[] {
  const catMap = new Map<string, any[]>()

  items.forEach(item => {
    const catName = CATEGORY_NAMES[item.category] || 'MISC'
    if (!catMap.has(catName)) {
      catMap.set(catName, [])
    }
    const matchingReviews = getMatchingReviewsForItem(item, reviews)
    const matchingLoadouts = getMatchingLoadoutsForItem(item, loadouts)
    catMap.get(catName)!.push({
      id: String(item.id),
      name: item.name,
      brand: item.brand,
      spec: item.specNote ? `${item.brand} • ${item.specNote}` : `${item.brand} • ${formatWeight(item.weightGrams)}`,
      status: matchingLoadouts.length > 0 ? 'PACKED' : '',
      weight: formatWeight(item.weightGrams),
      weightGrams: item.weightGrams,
      note: item.notes || '',
      category: catName,
      categoryKey: item.category,
      insightId: matchingReviews[0]?.id,
      insightIds: matchingReviews.map(r => r.id),
      loadouts: matchingLoadouts
    })
  })

  return Array.from(catMap.entries()).map(([name, catItems]) => ({ name, items: catItems }))
}

export function convertLoadoutToKit(
  loadout: Loadout,
  reviews: GearReview[] = [],
  allDispatches: Array<{ id: string; slug: string; title: string; publishedAt?: string; loadout?: any }> = []
): LoadoutKit {
  const stats = calculateLoadoutStats(loadout)
  const catMap = new Map<string, any[]>()
  let itemCount = 0

  loadout.items.forEach(entry => {
    const item = entry.item as ModelGearItem
    if (!item || typeof item !== 'object') return
    itemCount += 1
    const catName = CATEGORY_NAMES[item.category] || 'MISC'
    if (!catMap.has(catName)) {
      catMap.set(catName, [])
    }
    const matchingReviews = getMatchingReviewsForItem(item, reviews)
    catMap.get(catName)!.push({
      id: String(item.id),
      name: item.name,
      brand: item.brand,
      spec: item.specNote || `${item.brand} • ${formatWeight(item.weightGrams)}`,
      status: (entry.status || 'packed').toUpperCase(),
      weight: formatWeight(item.weightGrams),
      weightGrams: item.weightGrams,
      note: entry.customNote || item.notes || '',
      category: catName,
      categoryKey: item.category,
      insightId: matchingReviews[0]?.id,
      insightIds: matchingReviews.map(r => r.id)
    })
  })

  const seasonUpper = (loadout.season || 'autumn').toUpperCase() as 'AUTUMN' | 'WINTER' | 'SPRING' | 'SUMMER'
  const labels: Record<string, string> = {
    AUTUMN: 'Autumn / Taiga',
    WINTER: 'Winter / Sub-Zero',
    SPRING: 'Spring / Thaw',
    SUMMER: 'Summer / Boreal'
  }

  const loadoutSlug = loadout.slug || String(loadout.id)
  const dispatchesMap = new Map<string, LoadoutDispatchRef>()

  if (Array.isArray(loadout.dispatches)) {
    loadout.dispatches.forEach((d: any) => {
      if (d && typeof d === 'object') {
        const dSlug = d.slug || String(d.id)
        dispatchesMap.set(dSlug, {
          id: String(d.id || dSlug),
          slug: dSlug,
          title: d.title || 'Field Dispatch',
          date: d.publishedAt || d.published_at
        })
      }
    })
  }

  allDispatches.forEach(d => {
    if (!d.loadout) return
    const lRef = typeof d.loadout === 'object' ? (d.loadout.slug || String(d.loadout.id)) : String(d.loadout)
    if (lRef === loadoutSlug || lRef === String(loadout.id)) {
      const dSlug = d.slug || String(d.id)
      dispatchesMap.set(dSlug, {
        id: String(d.id || dSlug),
        slug: dSlug,
        title: d.title,
        date: d.publishedAt
      })
    }
  })

  return {
    id: loadoutSlug,
    slug: loadoutSlug,
    season: seasonUpper,
    label: labels[seasonUpper] || loadout.title,
    title: loadout.title,
    subtitle: loadout.description || '',
    tempRange: loadout.tempRange,
    terrain: loadout.description || 'Nordic Wilderness',
    baseWeightKg: Number(stats.baseWeightKg),
    totalItemsCount: itemCount,
    categories: Array.from(catMap.entries()).map(([name, items]) => ({ name, items })),
    dispatches: Array.from(dispatchesMap.values())
  }
}

export function convertReviewToInsight(r: GearReview): GearInsight {
  const item = (typeof r.gearItem === 'object' && r.gearItem !== null
    ? r.gearItem
    : { id: String(r.gearItem || ''), name: r.title, brand: 'Field Tested', category: 'shelter_sleep' as GearCategory, weightGrams: 0 }) as ModelGearItem
  const categoryUpper = (r.topic || 'durability').toUpperCase() as 'DURABILITY' | 'THERMAL' | 'MAINTENANCE' | 'PHILOSOPHY'
  const rawImage = typeof r.heroImage === 'string'
    ? r.heroImage
    : r.heroImage?.url || (typeof item.image === 'string' ? item.image : item.image?.url) || ''
  const image = rawImage

  let formattedDate = r.publishedAt
  if (r.publishedAt && /^\d{4}-\d{2}-\d{2}/.test(r.publishedAt) && r.publishedAt.includes('T')) {
    const parsed = new Date(r.publishedAt)
    if (!Number.isNaN(parsed.getTime())) {
      formattedDate = parsed.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }).toUpperCase()
    }
  }

  const gearCategoryLabel = (CATEGORY_NAMES[item.category] || item.category || 'SHELTER & SLEEP').toUpperCase()

  return {
    id: r.id,
    gearItemId: String(item.id),
    gearItemName: `${item.brand} ${item.name}`.trim(),
    gearCategory: item.category,
    gearCategoryLabel,
    tag: `${categoryUpper} LOG`,
    category: categoryUpper,
    title: r.title,
    date: formattedDate,
    readTime: calculateReadTime(r.keyTakeaways?.length ? r.keyTakeaways : r.content),
    image,
    equipmentTested: item.specNote ? `${item.brand} ${item.name} (${item.specNote})` : `${item.brand} ${item.name}`,
    duration: r.durationTested,
    summary: r.summary,
    observations: r.keyTakeaways || [],
    verdict: r.verdict,
    telemetry: [
      { label: 'ITEM WEIGHT', value: formatWeight(item.weightGrams || 0).toUpperCase() },
      { label: 'CATEGORY', value: gearCategoryLabel },
      { label: 'BRAND', value: (item.brand || 'FIELD').toUpperCase() }
    ]
  }
}

// Convert mockLoadouts into LoadoutKit format expected by gear.vue
export const mockLoadoutKits: LoadoutKit[] = mockLoadouts.map(l => convertLoadoutToKit(l, mockGearReviews))

// Convert mockGearReviews into GearInsight format expected by InsightReader.vue
export const mockGearInsights: GearInsight[] = mockGearReviews.map(convertReviewToInsight)
