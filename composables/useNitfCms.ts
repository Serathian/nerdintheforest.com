import { ref } from 'vue'
import { mockFieldNotes, mockMapWaypoints, type MockFieldNote, type MockMapWaypoint } from '../data/mockNordicTrail'

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
}

export interface CmsNitfWaypoint {
  id: string
  name?: string
  type?: string
  latitude?: number
  longitude?: number
  elevation?: number
}

export type TransformedFieldNote = MockFieldNote
export type TransformedMapWaypoint = MockMapWaypoint

// Export both names for backwards compatibility and clarity
export { mockFieldNotes, mockMapWaypoints }
export const fallbackFieldNotes = mockFieldNotes
export const fallbackMapWaypoints = mockMapWaypoints

export function transformPostToFieldNote(post: CmsNitfPost, index: number): TransformedFieldNote {
  const numberTag = `#${String(index + 1).padStart(2, '0')} FIELD NOTE`
  const elevationText = post.elevation ? `${post.elevation}m` : '480m'
  const amenitiesList: Array<{ icon: string; label: string }> = []

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
    category: 'SHELTER'
  }
}

export function useNitfCms() {
  const fieldNotes = ref<TransformedFieldNote[]>([...mockFieldNotes])
  const mapWaypoints = ref<TransformedMapWaypoint[]>([...mockMapWaypoints])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // In mock mode: resolves immediately with local mock data without HTTP requests
  async function fetchPosts() {
    isLoading.value = true
    error.value = null
    fieldNotes.value = [...mockFieldNotes]
    isLoading.value = false
    return { docs: mockFieldNotes }
  }

  async function fetchWaypoints() {
    mapWaypoints.value = [...mockMapWaypoints]
    return { docs: mockMapWaypoints }
  }

  async function fetchNearby(_lat: number, _lng: number, _radiusKm: number = 25) {
    return { docs: mockFieldNotes }
  }

  return {
    fieldNotes,
    mapWaypoints,
    isLoading,
    error,
    fetchPosts,
    fetchWaypoints,
    fetchNearby
  }
}
