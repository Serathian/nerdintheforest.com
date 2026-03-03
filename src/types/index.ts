// ─── Enums / Union types ──────────────────────────────────────
export type PostType = 'adventure' | 'tips' | 'recipe' | 'review' | 'general'
export type PostStatus = 'draft' | 'published' | 'archived'

export type PlaceType =
  | 'forest' | 'lake' | 'park' | 'viewpoint' | 'summit'
  | 'town' | 'beach' | 'island' | 'valley' | 'other'

export type MarkerType =
  | 'camp' | 'cabin' | 'cabin-paid' | 'camp-paid' | 'laavu'
  | 'motorhome' | 'day-visit' | 'trailhead' | 'viewpoint' | 'other'

export type TrailDifficulty = 'easy' | 'moderate' | 'hard' | 'expert'
export type TrailType = 'loop' | 'out-and-back' | 'point-to-point'

// ─── Shared primitives ────────────────────────────────────────
export interface MediaItem {
  id: number
  url: string
  alt: string
  width: number
  height: number
  filename?: string
  mimeType?: string
  filesize?: number
}

export interface Author {
  id: number
  name: string
  slug: string
  bio?: string
  avatar?: MediaItem
}

export interface Tag {
  id: number
  name: string
  slug: string
}

// ─── NitfLocation ─────────────────────────────────────────────
export interface NitfLocation {
  id: number
  name: string
  description?: string
  place_type: PlaceType
  marker_type: MarkerType
  latitude: number
  longitude: number
  country?: string
}

// ─── NitfTrail ────────────────────────────────────────────────
export interface NitfTrail {
  id: number
  title: string
  status: 'draft' | 'published'
  gpx_file?: MediaItem
  distance_km?: number
  elevation_gain_m?: number
  elevation_loss_m?: number
  duration_hours?: number
  difficulty?: TrailDifficulty
  trail_type?: TrailType
  latitude_start?: number
  longitude_start?: number
  bounding_box?: unknown
  country?: string
  region?: string
  season_start?: string
  season_end?: string
}

// ─── NitfWaypoint ─────────────────────────────────────────────
export interface NitfWaypoint {
  id: number
  trail: number
  name: string
  description?: string
  type: 'viewpoint' | 'summit' | 'water' | 'hazard' | 'camp' | 'junction' | 'trailhead' | 'other'
  latitude: number
  longitude: number
  altitude_m?: number
  sort?: number
}

// ─── Location junction entry (on posts) ───────────────────────
export interface LocationEntry {
  location: NitfLocation
  visit_date?: string
}

// ─── Recipe / Review metadata shapes ─────────────────────────
export interface RecipeMetaData {
  prep_time?: string
  cook_time?: string
  servings?: string | number
  difficulty?: string
  equipment?: string[]
  [key: string]: unknown
}

export interface ReviewMetaData {
  subject?: string
  rating?: number   // 1–5
  pros?: string[]
  cons?: string[]
  verdict?: string
  [key: string]: unknown
}

// ─── Full NitfPost ────────────────────────────────────────────
export interface NitfPost {
  id: number
  status: PostStatus
  title: string
  slug: string
  type: PostType
  excerpt?: string
  body?: string
  cover_image?: MediaItem
  author?: Author
  tags?: Tag[]
  published_at?: string
  reading_time_minutes?: number
  latitude?: number
  longitude?: number
  trail?: NitfTrail
  locations?: LocationEntry[]
  review_meta?: ReviewMetaData
  recipe_meta?: RecipeMetaData
  seo_title?: string
  seo_description?: string
  createdAt: string
  updatedAt: string
}

// ─── Slim post for map / feed ─────────────────────────────────
export interface NitfPostGeo {
  id: number
  title: string
  slug: string
  type: PostType
  excerpt?: string
  cover_image?: MediaItem
  published_at?: string
  reading_time_minutes?: number
  latitude?: number
  longitude?: number
}

// ─── PostGIS nearby result ────────────────────────────────────
export interface NearbyPost {
  id: number
  title: string
  slug: string
  latitude: number
  longitude: number
  distance_m: number
}

// ─── Payload pagination envelope ─────────────────────────────
export interface PaginatedResponse<T> {
  docs: T[]
  totalDocs: number
  totalPages: number
  page: number
  limit: number
  hasNextPage: boolean
  hasPrevPage: boolean
}
