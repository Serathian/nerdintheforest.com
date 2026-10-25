import { ref } from 'vue'
import {
  mockFieldNotes,
  mockMapWaypoints,
  mockLocations,
  mockDispatches,
  mockAreas,
  type MockFieldNote,
  type MockMapWaypoint,
  type AmenityItem
} from '../data/mockNordicTrail'
import type { Location, Dispatch, Area, LocationAmenity, LocationCategory } from '../types/models'
import { getLocationVisits, getAmenityMeta, calculateReadTime, getLocationMediaArchive } from '../utils/formatters'

export interface CmsNitfPost {
  id: string
  title?: string
  slug?: string
  status?: 'draft' | 'published'
  excerpt?: string
  latitude?: number
  longitude?: number
  elevation?: number
  visited_count?: number
  amenities?: Array<string | { name?: string; icon?: string }>
  createdAt?: string
  areaId?: string
  area?: string
}

export interface CmsNitfWaypoint {
  id: string
  name?: string
  type?: string
  latitude?: number
  longitude?: number
  elevation?: number
  areaId?: string
  area?: string
}

export type TransformedFieldNote = MockFieldNote
export type TransformedMapWaypoint = MockMapWaypoint

// Export both names for backwards compatibility and clarity
export { mockFieldNotes, mockMapWaypoints }
export const fallbackFieldNotes = mockFieldNotes
export const fallbackMapWaypoints = mockMapWaypoints

/**
 * Legacy transformer for backwards compatibility with tests and raw post feeds
 */
export function transformPostToFieldNote(post: CmsNitfPost, index: number): TransformedFieldNote {
  const numberTag = `#${String(index + 1).padStart(2, '0')} FIELD NOTE`
  const elevationText = post.elevation ? `${post.elevation}m` : '480m'
  const amenitiesList: AmenityItem[] = []

  if (Array.isArray(post.amenities)) {
    post.amenities.forEach(item => {
      if (typeof item === 'string') {
        amenitiesList.push({ icon: 'park', label: item })
      } else if (item && typeof item === 'object') {
        amenitiesList.push({
          icon: item.icon || 'park',
          label: item.name || 'Feature'
        })
      }
    })
  }

  if (amenitiesList.length === 0) {
    amenitiesList.push(
      { icon: 'cabin', label: 'Shelter' },
      { icon: 'water_drop', label: 'Spring' }
    )
  }

  return {
    id: post.id,
    numberTag,
    title: post.title || 'Untitled Dispatch',
    areaId: post.areaId || 'nordmarka',
    area: post.area || 'Nordmarka',
    description: post.excerpt || 'Tactile backcountry survey note from the Nordic field.',
    timeAgo: post.createdAt ? new Date(post.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Recent',
    visitedCount: post.visited_count ?? 1,
    amenities: amenitiesList,
    footerFeature: 'Surveyed spot',
    footerIcon: 'explore',
    metrics: `${elevationText} • GPS`,
    latitude: post.latitude ?? 60.25,
    longitude: post.longitude ?? 10.7167,
    elevation: post.elevation ?? 480,
    distanceKm: 1.5,
    category: 'SHELTER',
    slug: post.slug || post.id,
    date: 'OCT 04, 2026 // 06:40 CET',
    readTime: '3 MIN READ',
    weather: '4°C • MIST',
    heroImage: '',
    content: [post.excerpt || 'Backcountry field note.'],
    gallery: []
  }
}

/**
 * Transforms a raw Payload CMS Area doc into the client Area interface
 */
export function transformCmsArea(doc: any): Area {
  const center: [number, number] = Array.isArray(doc.bounds?.center) && doc.bounds.center.length === 2
    ? [Number(doc.bounds.center[0]), Number(doc.bounds.center[1])]
    : [23.85, 61.85]

  return {
    id: doc.slug || String(doc.id),
    slug: doc.slug || String(doc.id),
    name: doc.name || 'Nordic Region',
    country: doc.country || 'Finland',
    description: doc.description || '',
    center,
    zoom: doc.bounds?.zoom ?? 10,
    heroImage: doc.hero_image?.url ? {
      id: String(doc.hero_image.id || 'hero'),
      url: doc.hero_image.url,
      alt: doc.hero_image.alt || doc.name
    } : undefined
  }
}

/**
 * Transforms a raw Payload CMS Location doc into the client Location interface
 */
export function transformCmsLocation(doc: any): Location {
  const areaId = typeof doc.area === 'object' && doc.area !== null
    ? (doc.area.slug || String(doc.area.id))
    : String(doc.area || '')

  const docSlug = doc.slug || String(doc.id)
  const matchedMockNote = mockFieldNotes.find(
    n => n.slug === docSlug || n.id === docSlug || n.id === String(doc.id)
  )
  const resolvedTrailGeometry: Array<[number, number]> | undefined =
    doc.trail_geometry ||
    doc.trailGeometry ||
    doc.trailhead?.trail_geometry ||
    doc.trailhead?.trailGeometry ||
    matchedMockNote?.trailhead?.trailGeometry

  let trailheadLoc: Location | undefined = undefined
  if (doc.trailhead && typeof doc.trailhead === 'object') {
    trailheadLoc = {
      id: doc.trailhead.slug || String(doc.trailhead.id),
      slug: doc.trailhead.slug || `th-${doc.trailhead.id}`,
      name: doc.trailhead.name || 'Trailhead',
      area: areaId,
      category: 'trailhead',
      latitude: Number(doc.trailhead.latitude),
      longitude: Number(doc.trailhead.longitude),
      summary: doc.trailhead.summary || 'Trailhead access point',
      amenities: [],
      elevationGain: doc.elevation_gain ?? doc.trailhead.elevation_gain,
      elevationLoss: doc.elevation_loss ?? doc.trailhead.elevation_loss,
      trailGeometry: resolvedTrailGeometry
    }
  } else if (!doc.trailhead && matchedMockNote?.trailhead) {
    trailheadLoc = {
      id: `th-${docSlug}`,
      slug: `${docSlug}-trailhead`,
      name: matchedMockNote.trailhead.name,
      area: areaId,
      category: 'trailhead',
      latitude: matchedMockNote.trailhead.latitude,
      longitude: matchedMockNote.trailhead.longitude,
      summary: `Trailhead parking for ${doc.name || matchedMockNote.title}`,
      amenities: [],
      elevationGain: doc.elevation_gain ?? matchedMockNote.trailhead.elevationGain,
      elevationLoss: doc.elevation_loss ?? matchedMockNote.trailhead.elevationLoss,
      trailGeometry: resolvedTrailGeometry
    }
  }

  const coverImageUrl = doc.cover_image && typeof doc.cover_image === 'object'
    ? doc.cover_image.url
    : undefined

  const cat = (doc.category || 'shelter') as LocationCategory
  const amenitiesArr: LocationAmenity[] = Array.isArray(doc.amenities) ? doc.amenities : []
  const hasShelter = amenitiesArr.includes('timber_shelter') || cat === 'shelter'
  const defaultShelterCap = hasShelter ? 4 : 0
  const defaultTentSpaces = cat === 'shelter' ? 3 : cat === 'hearth' ? 2 : cat === 'trailhead' ? 0 : 1

  return {
    id: doc.slug || String(doc.id),
    slug: doc.slug || String(doc.id),
    name: doc.name || 'Survey Waypoint',
    area: areaId,
    category: cat,
    latitude: Number(doc.latitude),
    longitude: Number(doc.longitude),
    elevation: doc.elevation != null ? Number(doc.elevation) : undefined,
    shelterCapacity:
      doc.shelter_capacity != null
        ? Number(doc.shelter_capacity)
        : doc.shelterCapacity != null
          ? Number(doc.shelterCapacity)
          : (matchedMockNote?.shelterCapacity ?? defaultShelterCap),
    tentSpaces:
      doc.tent_spaces != null
        ? Number(doc.tent_spaces)
        : doc.tentSpaces != null
          ? Number(doc.tentSpaces)
          : (matchedMockNote?.tentSpaces ?? defaultTentSpaces),
    summary: doc.summary || '',
    amenities: amenitiesArr,
    trailhead: trailheadLoc || (doc.trailhead ? String(doc.trailhead) : undefined),
    trailGeometry: resolvedTrailGeometry,
    elevationGain: doc.elevation_gain != null ? Number(doc.elevation_gain) : undefined,
    elevationLoss: doc.elevation_loss != null ? Number(doc.elevation_loss) : undefined,
    coverImage: coverImageUrl ? {
      id: String(doc.cover_image.id || doc.id),
      url: coverImageUrl,
      alt: doc.name
    } : undefined,
    dispatches: []
  }
}

/**
 * Transforms a raw Payload CMS Dispatch doc into the client Dispatch interface
 */
export function transformCmsDispatch(doc: any): Dispatch {
  let locationsList: any[] = []
  if (Array.isArray(doc.locations)) {
    locationsList = doc.locations.map((l: any) => {
      if (typeof l === 'object' && l !== null) {
        return {
          id: String(l.id),
          slug: l.slug || String(l.id),
          name: l.name || l.title || 'Waypoint',
          title: l.name || l.title || 'Waypoint',
          latitude: l.latitude != null ? Number(l.latitude) : undefined,
          longitude: l.longitude != null ? Number(l.longitude) : undefined,
          elevation: l.elevation != null ? Number(l.elevation) : undefined,
          category: l.category,
          summary: l.summary || ''
        }
      }
      return String(l)
    })
  } else if (doc.location) {
    const single = typeof doc.location === 'object' && doc.location !== null
      ? {
          id: String(doc.location.id),
          slug: doc.location.slug || String(doc.location.id),
          name: doc.location.name || doc.location.title || 'Waypoint',
          title: doc.location.name || doc.location.title || 'Waypoint',
          latitude: doc.location.latitude != null ? Number(doc.location.latitude) : undefined,
          longitude: doc.location.longitude != null ? Number(doc.location.longitude) : undefined,
          elevation: doc.location.elevation != null ? Number(doc.location.elevation) : undefined,
          category: doc.location.category,
          summary: doc.location.summary || ''
        }
      : String(doc.location)
    locationsList = [single]
  }

  const galleryList = Array.isArray(doc.gallery)
    ? doc.gallery.map((g: any) => {
        const locRef = typeof g.location === 'object' && g.location !== null
          ? (g.location.slug || String(g.location.id))
          : (g.location ? String(g.location) : undefined)
        return {
          id: g.id ? String(g.id) : undefined,
          image: g.image?.url || g.image,
          location: locRef,
          caption: g.caption || ''
        }
      })
    : []

  const rawContent = doc.content
  let contentList: string[] = []
  if (Array.isArray(rawContent)) {
    contentList = rawContent.map(c => typeof c === 'string' ? c : (c?.text || ''))
  } else if (typeof rawContent === 'string') {
    contentList = [rawContent]
  } else if (doc.excerpt) {
    contentList = [doc.excerpt]
  }

  return {
    id: doc.slug || String(doc.id),
    slug: doc.slug || String(doc.id),
    title: doc.title || 'Field Dispatch',
    publishedAt: doc.published_at || doc.createdAt || new Date().toISOString(),
    status: doc.status || 'published',
    locations: locationsList,
    gallery: galleryList,
    excerpt: doc.excerpt || '',
    weather: doc.weather || '4°C • MIST',
    heroImage: doc.hero_image?.url || doc.hero_image,
    content: contentList
  }
}

/**
 * Transforms a normalized client Location into the rich MockFieldNote structure for cards/drawers
 */
export function transformLocationToFieldNote(
  loc: Location,
  areaName: string = '',
  index: number = 0,
  dispatches: Dispatch[] = []
): TransformedFieldNote {
  const { visitCount, dispatches: linked } = getLocationVisits(loc, dispatches)
  const categoryUpper = (loc.category || 'shelter').toUpperCase() as any
  const elevationText = loc.elevation ? `${loc.elevation}m` : '—'

  const amenitiesList: AmenityItem[] = (loc.amenities || []).map(a => getAmenityMeta(a))
  if (amenitiesList.length === 0) {
    amenitiesList.push({ icon: 'park', label: 'Nordic Wilderness' })
  }

  const latestDispatch = linked[0]
  const areaId = (typeof loc.area === 'object' && loc.area !== null
    ? (loc.area.id || loc.area.slug)
    : String(loc.area || '')) || 'nordic'

  return {
    id: loc.id,
    numberTag: `#${String(index + 1).padStart(2, '0')} ${categoryUpper}`,
    title: loc.name,
    areaId,
    area: areaName || 'Wilderness Area',
    description: loc.summary || 'Tactile backcountry survey note from the Nordic field.',
    timeAgo: latestDispatch?.publishedAt
      ? new Date(latestDispatch.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      : 'Unvisited',
    visitedCount: visitCount,
    amenities: amenitiesList,
    footerFeature: loc.trailhead ? 'Trailhead linked' : 'Wilderness location',
    footerIcon: loc.category === 'shelter' ? 'cabin' : 'explore',
    metrics: `${elevationText} • GPS`,
    latitude: loc.latitude,
    longitude: loc.longitude,
    elevation: loc.elevation || 0,
    shelterCapacity: loc.shelterCapacity,
    tentSpaces: loc.tentSpaces,
    elevationGain: loc.elevationGain,
    elevationLoss: loc.elevationLoss,
    distanceKm: 1.5,
    category: categoryUpper,
    slug: loc.slug,
    date: latestDispatch ? latestDispatch.publishedAt : 'OCT 03, 2026 // UNVISITED',
    readTime: latestDispatch ? calculateReadTime(latestDispatch.content) : 'NO LOG',
    weather: latestDispatch?.weather || 'UNSURVEYED',
    heroImage: loc.coverImage?.url || 'https://images.unsplash.com/photo-1510312305653-8ed496efae75?auto=format&fit=crop&w=1200&q=80',
    content: loc.summary ? [loc.summary] : ['Surveyed backcountry location.'],
    gallery: getLocationMediaArchive(loc, dispatches).map(m => ({ url: m.url, caption: m.caption || m.alt })),
    dispatches: linked.map(d => ({
      id: d.id,
      slug: d.slug,
      title: d.title,
      date: d.publishedAt,
      readTime: calculateReadTime(d.content),
      excerpt: d.excerpt,
      weather: d.weather,
      heroImage: typeof d.heroImage === 'object' ? d.heroImage?.url : d.heroImage,
      content: Array.isArray(d.content) ? d.content : [d.content]
    })),
    trailhead: loc.trailhead && typeof loc.trailhead === 'object' ? {
      name: loc.trailhead.name,
      latitude: loc.trailhead.latitude,
      longitude: loc.trailhead.longitude,
      elevationGain: loc.elevationGain,
      elevationLoss: loc.elevationLoss,
      trailGeometry: loc.trailGeometry
    } : undefined
  }
}

/**
 * Universal safe API fetcher working across Nuxt SSR, Browser, and Vitest test environments
 */
async function fetchFromCms<T>(endpoint: string, base: string = '/api/cms'): Promise<T> {
  const normalizedBase = base.replace(/\/+$/, '')
  const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`
  const fullUrl = `${normalizedBase}${normalizedEndpoint}`

  if (typeof $fetch !== 'undefined') {
    return $fetch<T>(fullUrl)
  }

  if (typeof fetch !== 'undefined') {
    const res = await fetch(fullUrl)
    if (!res.ok) {
      throw new Error(`HTTP error ${res.status} from ${fullUrl}`)
    }
    return res.json() as Promise<T>
  }

  throw new Error('No fetch implementation available')
}

export function useNitfCms() {
  const fieldNotes = ref<TransformedFieldNote[]>([...mockFieldNotes])
  const mapWaypoints = ref<TransformedMapWaypoint[]>([...mockMapWaypoints])
  const locations = ref<Location[]>([...mockLocations])
  const dispatches = ref<Dispatch[]>([...mockDispatches])
  const areas = ref<Area[]>([...mockAreas])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  function getApiBase(): string {
    try {
      // In Nuxt runtime
      const config = useRuntimeConfig()
      return config?.public?.cmsApiBase || '/api/cms'
    } catch {
      return '/api/cms'
    }
  }

  function rebuildDerivedViews() {
    const areaNameMap = new Map<string, string>()
    areas.value.forEach(a => {
      areaNameMap.set(a.id, a.name)
      if (a.slug) areaNameMap.set(a.slug, a.name)
    })

    // Exclude stand-alone trailhead entries from the field note cards (they are linked in destination locations)
    const cardLocations = locations.value.filter(l => l.category !== 'trailhead')

    fieldNotes.value = cardLocations.map((loc, idx) => {
      const areaKey = (typeof loc.area === 'object' && loc.area !== null
        ? (loc.area.id || loc.area.slug)
        : String(loc.area || '')) || 'nordic'
      const areaName = areaNameMap.get(areaKey) || 'Nordic Region'
      return transformLocationToFieldNote(loc, areaName, idx, dispatches.value)
    })

    mapWaypoints.value = locations.value.map(loc => {
      const areaKey = (typeof loc.area === 'object' && loc.area !== null
        ? (loc.area.id || loc.area.slug)
        : String(loc.area || '')) || 'nordic'
      const areaName = areaNameMap.get(areaKey) || 'Nordic Region'
      return {
        id: loc.id,
        title: loc.name,
        lat: loc.latitude,
        lng: loc.longitude,
        type: (loc.category || 'SHELTER').toUpperCase(),
        areaId: areaKey,
        area: areaName
      }
    })
  }

  async function fetchAreas(): Promise<{ docs: Area[] }> {
    try {
      const base = getApiBase()
      const data = await fetchFromCms<{ docs: any[] }>('/nitf_areas?limit=100', base)
      if (data && Array.isArray(data.docs) && data.docs.length > 0) {
        areas.value = data.docs.map(transformCmsArea)
        return { docs: areas.value }
      }
    } catch {
      // Graceful fallback to mock areas
    }
    return { docs: areas.value }
  }

  async function fetchPosts(): Promise<{ docs: Dispatch[] }> {
    isLoading.value = true
    error.value = null
    try {
      const base = getApiBase()
      const data = await fetchFromCms<{ docs: any[] }>('/nitf_dispatches?depth=2&limit=100', base)
      if (data && Array.isArray(data.docs) && data.docs.length > 0) {
        dispatches.value = data.docs.map(transformCmsDispatch)
        rebuildDerivedViews()
        isLoading.value = false
        return { docs: dispatches.value }
      }
    } catch (e: any) {
      error.value = e?.message || 'Could not fetch dispatches from CMS'
    } finally {
      isLoading.value = false
    }
    return { docs: dispatches.value }
  }

  async function fetchWaypoints(): Promise<{ docs: TransformedMapWaypoint[] }> {
    isLoading.value = true
    error.value = null
    try {
      const base = getApiBase()
      // First fetch areas to resolve area names
      await fetchAreas()

      // Fetch locations with populated relationships (depth=2 for trailhead and area)
      const data = await fetchFromCms<{ docs: any[] }>('/nitf_locations?depth=2&limit=100', base)
      if (data && Array.isArray(data.docs) && data.docs.length > 0) {
        locations.value = data.docs.map(transformCmsLocation)
        rebuildDerivedViews()
        isLoading.value = false
        return { docs: mapWaypoints.value }
      }
    } catch (e: any) {
      error.value = e?.message || 'Could not fetch locations from CMS'
    } finally {
      isLoading.value = false
    }
    return { docs: mapWaypoints.value }
  }

  async function fetchLocationBySlug(slug: string): Promise<Location | null> {
    // 1. Try querying CMS for this specific slug first
    try {
      const base = getApiBase()
      const data = await fetchFromCms<{ docs: any[] }>(`/nitf_locations?where[slug][equals]=${encodeURIComponent(slug)}&depth=2&limit=1`, base)
      if (data && Array.isArray(data.docs) && data.docs.length > 0) {
        const transformed = transformCmsLocation(data.docs[0])
        const existingIdx = locations.value.findIndex(l => l.slug === slug || l.id === slug)
        if (existingIdx >= 0) {
          locations.value[existingIdx] = transformed
        } else {
          locations.value.push(transformed)
        }
        await fetchPosts()
        return transformed
      }
    } catch {
      // CMS offline or error, continue to fallback
    }

    // 2. Try fetching all waypoints from CMS
    try {
      await fetchWaypoints()
      await fetchPosts()
      const foundInCms = locations.value.find(l => l.slug === slug || l.id === slug)
      if (foundInCms) return foundInCms
    } catch {
      // Continue to fallback
    }

    // 3. Fallback to in-memory / mock locations
    return locations.value.find(l => l.slug === slug || l.id === slug) || null
  }

  async function fetchDispatchBySlug(slug: string): Promise<Dispatch | null> {
    // 1. Try querying CMS for this specific slug
    try {
      const base = getApiBase()
      const data = await fetchFromCms<{ docs: any[] }>(`/nitf_dispatches?where[slug][equals]=${encodeURIComponent(slug)}&depth=2&limit=1`, base)
      if (data && Array.isArray(data.docs) && data.docs.length > 0) {
        const transformed = transformCmsDispatch(data.docs[0])
        const existingIdx = dispatches.value.findIndex(d => d.slug === slug || d.id === slug)
        if (existingIdx >= 0) {
          dispatches.value[existingIdx] = transformed
        } else {
          dispatches.value.push(transformed)
        }
        return transformed
      }
    } catch {
      // Continue to fallback
    }

    // 2. Fetch all dispatches from CMS
    try {
      await fetchPosts()
      const found = dispatches.value.find(d => d.slug === slug || d.id === slug)
      if (found) return found
    } catch {
      // Continue
    }

    // 3. Fallback to in-memory / mock dispatches
    return dispatches.value.find(d => d.slug === slug || d.id === slug) || null
  }

  async function fetchNearby(_lat: number, _lng: number, _radiusKm: number = 25) {
    return { docs: fieldNotes.value }
  }

  return {
    fieldNotes,
    mapWaypoints,
    locations,
    dispatches,
    areas,
    isLoading,
    error,
    fetchAreas,
    fetchPosts,
    fetchWaypoints,
    fetchLocationBySlug,
    fetchDispatchBySlug,
    fetchNearby
  }
}
