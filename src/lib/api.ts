import type {
  NitfPost,
  NitfPostGeo,
  NitfLocation,
  NitfWaypoint,
  NearbyPost,
  PaginatedResponse,
  PostType,
} from '@/types'

const CMS_URL =
  process.env.NEXT_PUBLIC_CMS_URL ?? 'https://cms.jake-reddy.com'

// ─── Internal helpers ─────────────────────────────────────────

function cmsUrl(path: string, params?: Record<string, string>): string {
  const url = new URL(`${CMS_URL}/api${path}`)
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      url.searchParams.set(k, v)
    }
  }
  return url.toString()
}

async function get<T>(url: string, revalidate?: number): Promise<T> {
  const res = await fetch(url, {
    next: revalidate !== undefined ? { revalidate } : { revalidate: 300 },
  })
  if (!res.ok) throw new Error(`CMS fetch failed: ${res.status} ${url}`)
  return res.json() as Promise<T>
}

// ─── Posts ────────────────────────────────────────────────────

/**
 * Fetch a page of published posts, slim shape for map/feed.
 * depth=1 populates cover_image.
 */
export async function fetchPosts(params?: {
  type?: PostType
  page?: number
  limit?: number
  sort?: string
}): Promise<PaginatedResponse<NitfPostGeo>> {
  const qs: Record<string, string> = {
    'where[status][equals]': 'published',
    depth: '1',
    limit: String(params?.limit ?? 200),
    page: String(params?.page ?? 1),
    sort: params?.sort ?? '-published_at',
  }
  if (params?.type) qs['where[type][equals]'] = params.type

  return get<PaginatedResponse<NitfPostGeo>>(
    cmsUrl('/nitf_posts', qs),
    300,
  )
}

/**
 * Fetch a single post by slug, deep population (depth=2).
 */
export async function fetchPostBySlug(slug: string): Promise<NitfPost | null> {
  const qs: Record<string, string> = {
    'where[slug][equals]': slug,
    'where[status][equals]': 'published',
    depth: '2',
    limit: '1',
  }
  const data = await get<PaginatedResponse<NitfPost>>(
    cmsUrl('/nitf_posts', qs),
    3600,
  )
  return data.docs[0] ?? null
}

/**
 * Fetch all published post slugs for generateStaticParams.
 */
export async function fetchAllPostSlugs(): Promise<string[]> {
  const qs: Record<string, string> = {
    'where[status][equals]': 'published',
    limit: '1000',
    depth: '0',
    'select[slug]': 'true',
  }
  const data = await get<PaginatedResponse<{ slug: string }>>(
    cmsUrl('/nitf_posts', qs),
    3600,
  )
  return data.docs.map((d) => d.slug)
}

// ─── Locations ────────────────────────────────────────────────

export async function fetchLocations(): Promise<NitfLocation[]> {
  const qs: Record<string, string> = { limit: '1000', depth: '0' }
  const data = await get<PaginatedResponse<NitfLocation>>(
    cmsUrl('/nitf_locations', qs),
    300,
  )
  return data.docs
}

// ─── Waypoints ────────────────────────────────────────────────

export async function fetchTrailWaypoints(trailId: number): Promise<NitfWaypoint[]> {
  const qs: Record<string, string> = {
    'where[trail][equals]': String(trailId),
    sort: 'sort',
    limit: '200',
    depth: '0',
  }
  const data = await get<PaginatedResponse<NitfWaypoint>>(
    cmsUrl('/nitf_waypoints', qs),
    3600,
  )
  return data.docs
}

// ─── PostGIS nearby ───────────────────────────────────────────

/**
 * Fetch posts near a coordinate using the PostGIS endpoint.
 * radius in metres, default 25 000 m (25 km).
 */
export async function fetchNearbyPosts(
  lat: number,
  lon: number,
  radius = 25000,
): Promise<NearbyPost[]> {
  const url = `${CMS_URL}/api/nitf-posts/nearby?lat=${lat}&lon=${lon}&radius=${radius}`
  const res = await fetch(url, { next: { revalidate: 3600 } })
  if (!res.ok) return []
  return res.json() as Promise<NearbyPost[]>
}
