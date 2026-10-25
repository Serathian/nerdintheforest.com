/**
 * Core Data Models for Nerd in the Forest (nitf_*)
 * Standardized for Payload CMS v3 integration and client consumption.
 */

// =============================================================================
// SHARED / CMS PRIMITIVES
// =============================================================================

export interface FilterState {
  category: string
  area: string
  visitStatus: 'ALL' | 'VISITED' | 'UNVISITED'
  maxDistanceKm: number
  amenities: string[]
}

export interface CmsMedia {
  id: string
  url: string
  alt: string
  width?: number
  height?: number
  mimeType?: string
}

/** Standard Payload CMS relation: string ID or populated document */
export type Relation<T> = string | T

// =============================================================================
// 1. AREA (nitf_areas)
// =============================================================================

export interface Area {
  id: string
  slug?: string
  name: string
  country: string
  description?: string
  center: [number, number] // [lng, lat] for MapLibre / OpenLayers
  defaultZoom?: number     // e.g. 11.5
  zoom?: number            // alias for map camera
  heroImage?: CmsMedia
}

// =============================================================================
// 2. LOCATION (nitf_locations)
// =============================================================================

export type LocationCategory =
  | 'shelter'
  | 'hearth'
  | 'springhead'
  | 'summit'
  | 'viewpoint'
  | 'trailhead'

export type LocationAmenity =
  | 'timber_shelter'
  | 'stone_hearth'
  | 'potable_water'
  | 'dry_wood'
  | 'lake_view'
  | 'lake_water'
  | 'tent_pitch'

export interface Location {
  id: string
  slug: string
  name: string
  area: Relation<Area>
  category: LocationCategory
  latitude: number
  longitude: number
  elevation?: number       // in meters (e.g. 501)
  summary?: string         // brief 2-sentence description for cards/drawers
  amenities: LocationAmenity[]
  /**
   * Self-referencing link to another Location where category === 'trailhead'
   */
  trailhead?: Relation<Location>
  coverImage?: CmsMedia

  // Trail geometry connecting trailhead to location (if surveyed)
  trailGeometry?: Array<[number, number]>
  elevationGain?: number
  elevationLoss?: number

  // Client-populated / Virtual relations:
  dispatches?: Dispatch[]
}

// =============================================================================
// 3. DISPATCH (nitf_dispatches)
// =============================================================================

export interface DispatchGalleryItem {
  id?: string
  image: Relation<CmsMedia> | string
  location?: Relation<Location>
  caption?: string
}

export interface Dispatch {
  id: string
  slug: string
  title: string
  publishedAt: string      // ISO Date or human string
  status: 'draft' | 'published'
  locations: Relation<Location>[]
  gallery?: DispatchGalleryItem[]
  excerpt: string          // summary for ledger cards
  weather?: string         // e.g. "4°C • MIST • 1018 HPA"
  heroImage?: CmsMedia | string
  content: string | string[] // RichText / paragraphs
}

// =============================================================================
// 4. GEAR ITEM (nitf_gear_items)
// =============================================================================

export type GearCategory =
  | 'shelter_sleep'
  | 'cook_water'
  | 'navigation_tools'
  | 'pack_apparel'
  | 'hygiene_repair'

export interface GearItem {
  id: string
  name: string            // e.g. "Akto 1P"
  brand: string           // e.g. "Hilleberg"
  category: GearCategory
  weightGrams: number     // single source of truth (e.g. 1700)
  specNote?: string       // e.g. "Kerlon 1200 • 4-Season Solo Tunnel"
  notes?: string          // e.g. "Proven in gale-force winds on exposed crags."
  image?: CmsMedia | string
  productUrl?: string
}

// =============================================================================
// 5. GEAR REVIEW (nitf_gear_reviews)
// =============================================================================

export type GearReviewTopic =
  | 'durability'
  | 'thermal'
  | 'maintenance'
  | 'philosophy'

export interface GearReview {
  id: string
  slug: string
  title: string
  gearItem: Relation<GearItem>
  topic: GearReviewTopic
  publishedAt: string     // ISO Date or display date
  durationTested: string  // e.g. "48 Backcountry Nights Across 4 Seasons"
  summary: string         // lead overview
  verdict: string         // decisive surveyor callout
  keyTakeaways: string[]  // concise bullet points
  heroImage?: CmsMedia | string
  content: string | string[] // full article body / observations
}

// =============================================================================
// 6. LOADOUT (nitf_loadouts)
// =============================================================================

export type LoadoutSeason = 'spring' | 'summer' | 'autumn' | 'winter'

export type LoadoutItemStatus =
  | 'packed'     // carried in rucksack (counts toward base weight)
  | 'essential'  // vital safety/nav gear (counts toward base weight)
  | 'worn'       // clothes/boots worn on body (excluded from base weight)
  | 'consumable' // food/fuel/water (excluded from base weight)

export interface LoadoutItemEntry {
  item: Relation<GearItem>
  status: LoadoutItemStatus
  customNote?: string    // optional trip-specific note
}

export interface Loadout {
  id: string
  slug: string
  title: string          // e.g. "Autumn Taiga & Lake Bivouac"
  season: LoadoutSeason
  tempRange: string      // e.g. "-2°C to 10°C"
  description?: string   // e.g. "Solo gapahuk bivouac, cold mist, peat wetlands"
  items: LoadoutItemEntry[]
}
