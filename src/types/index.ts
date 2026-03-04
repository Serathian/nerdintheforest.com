import type {
  NitfPost as CmsNitfPost,
  NitfTrail as CmsNitfTrail,
  Tag,
  NitfLocation,
} from '@serathian/basecamp-cms-types'

// Re-export types that are used as-is from the CMS schema
export type { Tag, NitfLocation, NitfWaypoint } from '@serathian/basecamp-cms-types'

// ─── Union types (derived from canonical CMS schema) ──────────
export type PostType       = CmsNitfPost['type']
export type PostStatus     = CmsNitfPost['status']
export type PlaceType      = NitfLocation['place_type']
export type MarkerType     = NitfLocation['marker_type']
export type TrailDifficulty = NonNullable<CmsNitfTrail['difficulty']>
export type TrailType      = NonNullable<CmsNitfTrail['trail_type']>

// ─── MediaItem ────────────────────────────────────────────────
// Populated/non-null subset of CMS Media, as returned by depth≥1 fetches.
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

// ─── Author ───────────────────────────────────────────────────
// Populated form of CMS Author (avatar resolved at depth≥1).
export interface Author {
  id: number
  name: string
  slug: string
  bio?: string | null
  avatar?: MediaItem | null
}

// ─── NitfTrail ────────────────────────────────────────────────
// Depth-1 resolved form: gpx_file is a populated MediaItem rather than a number union.
export interface NitfTrail extends Omit<CmsNitfTrail, 'gpx_file'> {
  gpx_file?: MediaItem | null
}

// ─── Location junction entry (on posts) ───────────────────────
export interface LocationEntry {
  location: NitfLocation
  visit_date?: string | null
  id?: string | null
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
  rating?: number
  pros?: string[]
  cons?: string[]
  verdict?: string
  [key: string]: unknown
}

// ─── NitfPost ─────────────────────────────────────────────────
// Depth-2 resolved form: all relations are populated objects, not ID numbers.
export interface NitfPost extends Omit<
  CmsNitfPost,
  'cover_image' | 'author' | 'tags' | 'trail' | 'locations' | 'review_meta' | 'recipe_meta'
> {
  cover_image?: MediaItem | null
  author?: Author | null
  tags?: Tag[] | null
  trail?: NitfTrail | null
  locations?: LocationEntry[] | null
  review_meta?: ReviewMetaData | null
  recipe_meta?: RecipeMetaData | null
}

// ─── Slim post for map / feed ─────────────────────────────────
export interface NitfPostGeo {
  id: number
  title: string
  slug: string
  type: PostType
  excerpt?: string | null
  cover_image?: MediaItem | null
  published_at?: string | null
  reading_time_minutes?: number | null
  latitude?: number | null
  longitude?: number | null
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
