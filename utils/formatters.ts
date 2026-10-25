import type { Location, Dispatch, Loadout, LocationAmenity, GearItem } from '../types/models'

/**
 * Derives visit status and count for a location from linked dispatches.
 * Supports dispatches visiting multiple locations on the same outing.
 */
export function getLocationVisits(loc: Location, allDispatches: Dispatch[] = []) {
  const linked = allDispatches.filter(d => {
    if (!Array.isArray(d.locations)) return false
    return d.locations.some(l => {
      if (typeof l === 'object' && l !== null) {
        return l.id === loc.id || l.slug === loc.slug
      }
      return l === loc.id || l === loc.slug
    })
  })

  return {
    isVisited: linked.length > 0,
    visitCount: linked.length,
    dispatches: linked
  }
}

export interface LocationPhotoArchiveItem {
  url: string
  alt: string
  caption?: string
  dispatchTitle: string
  dispatchSlug: string
  publishedAt: string
}

/**
 * Extracts and aggregates all survey photos across all dispatches tagged with this location.
 */
export function getLocationMediaArchive(
  loc: Location,
  allDispatches: Dispatch[] = []
): LocationPhotoArchiveItem[] {
  const photos: LocationPhotoArchiveItem[] = []

  // Include cover image if available
  if (loc.coverImage?.url) {
    photos.push({
      url: loc.coverImage.url,
      alt: loc.coverImage.alt || loc.name,
      caption: 'Initial survey waypoint reference photo',
      dispatchTitle: 'Survey Log',
      dispatchSlug: loc.slug,
      publishedAt: 'Field Survey'
    })
  }

  for (const dispatch of allDispatches) {
    if (!Array.isArray(dispatch.gallery)) continue

    for (const item of dispatch.gallery) {
      if (!item.location) continue

      const locRef = item.location
      const matches = typeof locRef === 'object' && locRef !== null
        ? (locRef.id === loc.id || locRef.slug === loc.slug)
        : (locRef === loc.id || locRef === loc.slug)

      if (matches) {
        const url = typeof item.image === 'object' && item.image !== null
          ? item.image.url
          : String(item.image || '')

        if (url) {
          photos.push({
            url,
            alt: item.caption || `${loc.name} field survey`,
            caption: item.caption,
            dispatchTitle: dispatch.title,
            dispatchSlug: dispatch.slug,
            publishedAt: dispatch.publishedAt
          })
        }
      }
    }
  }

  return photos
}

/**
 * Calculates estimated reading time from text or content array.
 */
export function calculateReadTime(content: string | string[]): string {
  const fullText = Array.isArray(content) ? content.join(' ') : (content || '')
  const words = fullText.trim().split(/\s+/).filter(Boolean).length
  const minutes = Math.max(1, Math.ceil(words / 200))
  return `${minutes} MIN READ`
}

/**
 * Computes base weight (packed + essential) and total carried items for a loadout.
 */
export function calculateLoadoutStats(loadout: Loadout) {
  let baseWeightGrams = 0
  let totalPackedGrams = 0

  loadout.items.forEach(entry => {
    const item = typeof entry.item === 'object' ? (entry.item as GearItem) : null
    if (item && item.weightGrams) {
      if (entry.status === 'packed' || entry.status === 'essential') {
        baseWeightGrams += item.weightGrams
      }
      totalPackedGrams += item.weightGrams
    }
  })

  return {
    itemCount: loadout.items.length,
    baseWeightKg: (baseWeightGrams / 1000).toFixed(2),
    totalWeightKg: (totalPackedGrams / 1000).toFixed(2)
  }
}

/**
 * Formats coordinates into standard surveyor stamp: [60°16'N • 10°43'E]
 */
export function formatCoordinates(lat: number, lng: number): string {
  const latStr = `${Math.abs(lat).toFixed(4)}°${lat >= 0 ? 'N' : 'S'}`
  const lngStr = `${Math.abs(lng).toFixed(4)}°${lng >= 0 ? 'E' : 'W'}`
  return `[${latStr} • ${lngStr}]`
}

/**
 * Formats grams to readable string, e.g. 1700 -> "1,700g" or "1.7 kg"
 */
export function formatWeight(grams: number): string {
  if (grams >= 1000) {
    return `${(grams / 1000).toFixed(1)} kg`
  }
  return `${grams.toLocaleString()}g`
}

const AMENITY_MAP: Record<LocationAmenity, { label: string; icon: string }> = {
  timber_shelter: { label: 'Timber Shelter', icon: 'cabin' },
  stone_hearth: { label: 'Stone Hearth', icon: 'outdoor_grill' },
  potable_water: { label: 'Potable Spring', icon: 'water_drop' },
  dry_wood: { label: 'Dry Wood', icon: 'forest' },
  lake_view: { label: 'Lake View', icon: 'visibility' },
  lake_water: { label: 'Lake Water', icon: 'water_drop' },
  tent_pitch: { label: 'Tent Pitch', icon: 'camping' },
  parking: { label: 'Parking / Trailhead', icon: 'directions_car' }
}

export function getAmenityMeta(amenity: LocationAmenity): { label: string; icon: string } {
  return AMENITY_MAP[amenity] || { label: amenity, icon: 'park' }
}
