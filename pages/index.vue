<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import type { FilterState } from '~/components/organisms/FilterModal.vue'
import { calculateMapFocusPadding, measureDrawerTop } from '~/utils/mapViewport'
import { mockFieldNotes, mockLocations } from '~/data/mockNordicTrail'

useHead({
  title: 'Nerd in the Forest — Nordic Cartography & Adventure Atlas',
  meta: [
    {
      name: 'description',
      content: 'Interactive cartographic expedition atlas, topographic field notes, and backcountry waypoints from the Nordic wilderness.'
    },
    { property: 'og:title', content: 'Nerd in the Forest — Nordic Adventure Atlas' },
    { property: 'og:description', content: 'Explore surveyed Nordic wilderness waypoints, gapahuk shelters, and hearths.' }
  ]
})

const mapRef = ref<any>(null)
const selectedNoteId = ref('')
const isDossierOpen = ref(false)
const isReaderOpen = ref(false)
const router = useRouter()
const route = useRoute()
const activeDispatchInspection = useState<any>('activeDispatchInspection', () => null)
const isFilterOpen = ref(false)
const searchQuery = ref('')
const activeCategory = ref('ALL')
const activeLayer = ref<'topo' | 'satellite'>('topo')
const userLocation = ref<[number, number] | null>(null)
const isLocating = ref(false)
const notificationMessage = ref<string | null>(null)

const filters = ref<FilterState>({
  category: 'ALL',
  area: 'ALL',
  visitStatus: 'ALL',
  maxDistanceKm: 0,
  amenities: []
})

const { fieldNotes, mapWaypoints, locations, dispatches, fetchPosts, fetchWaypoints, fetchDispatchBySlug, fetchLocationBySlug } = useNitfCms()

const activeDispatchSlug = computed(() => {
  return (route.query.dispatch as string) || (route.query.story as string) || activeDispatchInspection.value?.slug || ''
})

const asyncFetchedDispatch = ref<any>(null)

watch(activeDispatchSlug, async (slug) => {
  if (!slug) {
    asyncFetchedDispatch.value = null
    return
  }

  // 1. Direct match in local dispatches
  const found = dispatches.value.find(d => d.slug === slug || d.id === slug)
  if (found) {
    asyncFetchedDispatch.value = found
    return
  }

  // 2. Fetch directly from CMS
  try {
    const fetched = await fetchDispatchBySlug(slug)
    if (fetched) {
      asyncFetchedDispatch.value = fetched
      return
    }
  } catch {
    // Ignore fetch error
  }

  // 3. Fallback: check if slug matches a field note that has linked dispatches
  const matchingNote = fieldNotes.value.find(n => n.slug === slug || n.id === slug)
  if (matchingNote && matchingNote.dispatches && matchingNote.dispatches.length > 0) {
    const d = matchingNote.dispatches[0]
    const foundInList = dispatches.value.find(item => item.slug === d.slug || item.id === d.id)
    if (foundInList) {
      asyncFetchedDispatch.value = foundInList
      return
    }
    asyncFetchedDispatch.value = {
      id: d.id,
      slug: d.slug,
      title: d.title,
      publishedAt: d.date || new Date().toISOString(),
      status: 'published',
      locations: [matchingNote.id],
      excerpt: d.excerpt || '',
      weather: d.weather || '4°C • MIST',
      heroImage: d.heroImage,
      content: d.content || []
    }
  }
}, { immediate: true })

const activeInspectedDispatch = computed(() => {
  if (asyncFetchedDispatch.value) return asyncFetchedDispatch.value
  const query = activeDispatchSlug.value
  if (!query) return null
  return dispatches.value.find(d => d.slug === query || d.id === query) || null
})

const inspectedWaypoints = computed(() => {
  if (!activeInspectedDispatch.value) return []
  const d = activeInspectedDispatch.value
  if (!d.locations || !Array.isArray(d.locations)) return []

  const list: any[] = []
  d.locations.forEach((locRef: any, idx: number) => {
    const locId = typeof locRef === 'object' && locRef !== null ? String(locRef.id || locRef.slug || '') : String(locRef)
    const locSlug = typeof locRef === 'object' && locRef !== null ? String(locRef.slug || locRef.id || '') : String(locRef)

    // 1. Try matching in fieldNotes
    const matchedNote = fieldNotes.value.find(n =>
      String(n.id) === locId ||
      String(n.slug) === locSlug ||
      String(n.id) === locSlug ||
      String(n.slug) === locId
    )

    // 2. Try matching in locations
    const matchedLoc = locations.value.find(l =>
      String(l.id) === locId ||
      String(l.slug) === locSlug ||
      String(l.id) === locSlug ||
      String(l.slug) === locId
    )

    // 3. Fallback to mock data if CMS database doesn't have this location
    const matchedMock = mockFieldNotes.find(n =>
      String(n.id) === locId ||
      String(n.slug) === locSlug ||
      String(n.id) === locSlug ||
      String(n.slug) === locId
    ) || mockLocations.find(l =>
      String(l.id) === locId ||
      String(l.slug) === locSlug ||
      String(l.id) === locSlug ||
      String(l.slug) === locId
    )

    if (matchedNote) {
      list.push({
        id: matchedNote.id,
        slug: matchedNote.slug || matchedNote.id,
        title: matchedNote.title,
        elevation: matchedNote.elevation,
        category: matchedNote.category,
        latitude: matchedNote.latitude,
        longitude: matchedNote.longitude,
        summary: matchedNote.description,
        order: idx + 1
      })
    } else if (matchedLoc) {
      list.push({
        id: matchedLoc.id,
        slug: matchedLoc.slug || matchedLoc.id,
        title: matchedLoc.name,
        elevation: matchedLoc.elevation,
        category: matchedLoc.category,
        latitude: matchedLoc.latitude,
        longitude: matchedLoc.longitude,
        summary: matchedLoc.summary,
        order: idx + 1
      })
    } else if (matchedMock) {
      const isLoc = 'name' in matchedMock
      list.push({
        id: matchedMock.id,
        slug: matchedMock.slug || matchedMock.id,
        title: isLoc ? (matchedMock as any).name : (matchedMock as any).title,
        elevation: matchedMock.elevation,
        category: matchedMock.category,
        latitude: matchedMock.latitude,
        longitude: matchedMock.longitude,
        summary: isLoc ? (matchedMock as any).summary : (matchedMock as any).description,
        order: idx + 1
      })
    } else if (typeof locRef === 'object' && locRef !== null) {
      list.push({
        id: String(locRef.id || `loc-${idx}`),
        slug: String(locRef.slug || locRef.id || `loc-${idx}`),
        title: locRef.name || locRef.title || 'Surveyed Waypoint',
        elevation: locRef.elevation,
        category: locRef.category,
        latitude: locRef.latitude,
        longitude: locRef.longitude,
        summary: locRef.summary || '',
        order: idx + 1
      })
    }
  })
  return list
})

const inspectedRoute = computed(() => {
  if (!activeInspectedDispatch.value || inspectedWaypoints.value.length === 0) return null
  return {
    dispatchId: activeInspectedDispatch.value.id,
    title: activeInspectedDispatch.value.title,
    waypoints: inspectedWaypoints.value
      .filter(w => w.latitude != null && w.longitude != null)
      .map(w => ({
        id: w.id,
        title: w.title,
        lat: w.latitude!,
        lng: w.longitude!,
        order: w.order
      }))
  }
})

async function focusInspectedRoute() {
  if (!activeInspectedDispatch.value || inspectedWaypoints.value.length === 0) return

  await nextTick()
  if (typeof window !== 'undefined') {
    await new Promise(resolve => requestAnimationFrame(resolve))
  }

  const points: Array<[number, number]> = inspectedWaypoints.value
    .filter(w => w.longitude != null && w.latitude != null)
    .map(w => [w.longitude!, w.latitude!])

  if (points.length > 0) {
    if (!mapRef.value) {
      setTimeout(() => {
        mapRef.value?.focusOn(points, getMapFocusPadding())
      }, 120)
      return
    }
    mapRef.value?.focusOn(points, getMapFocusPadding())
  }
}

watch([activeInspectedDispatch, inspectedWaypoints], ([d, wps]) => {
  if (d) {
    activeDispatchInspection.value = {
      dispatchId: d.id,
      slug: d.slug,
      title: d.title,
      locationsCount: d.locations?.length || 0
    }
    if (wps.length > 0 && !selectedNoteId.value) {
      focusInspectedRoute()
    }
  } else if (!route.query.dispatch && !route.query.story) {
    activeDispatchInspection.value = null
  }
}, { immediate: true, flush: 'post' })

function handleExitInspection() {
  activeDispatchInspection.value = null
  selectedNoteId.value = ''
  const query = { ...route.query }
  delete query.dispatch
  delete query.story
  router.push({ path: route.path, query })
  nextTick(() => {
    fitAllWaypoints()
  })
}

function handleWindowResize() {
  if (activeInspectedDispatch.value) {
    if (selectedNoteId.value) {
      focusSelection()
    } else {
      focusInspectedRoute()
    }
  } else if (selectedNoteId.value) {
    focusSelection()
  }
}

function focusStoryLocations(storySlugOrId: string): boolean {
  if (!storySlugOrId) return false

  // 1. Find matching dispatch
  const dispatch = dispatches.value.find(d => d.slug === storySlugOrId || d.id === storySlugOrId)

  let targetNotes: any[] = []
  if (dispatch && Array.isArray(dispatch.locations) && dispatch.locations.length > 0) {
    targetNotes = fieldNotes.value.filter(n => {
      return dispatch.locations.some(l => {
        const id = typeof l === 'object' && l !== null ? (l.id || l.slug) : String(l)
        return id === n.id || id === n.slug
      })
    })
  }

  // Fallback: look for matching field note directly
  if (targetNotes.length === 0) {
    const single = fieldNotes.value.find(n => n.slug === storySlugOrId || n.id === storySlugOrId)
    if (single) targetNotes.push(single)
  }

  // Also check if any field note has a dispatch with this slug
  if (targetNotes.length === 0) {
    const matchingNote = fieldNotes.value.find(n => n.dispatches?.some(d => d.slug === storySlugOrId || d.id === storySlugOrId))
    if (matchingNote) targetNotes.push(matchingNote)
  }

  if (targetNotes.length === 0) return false

  // Set selected note to the first location in the route
  selectedNoteId.value = targetNotes[0].id

  // Collect coordinates of all locations in the story (plus trailheads)
  const points: Array<[number, number]> = []
  for (const note of targetNotes) {
    if (note.longitude != null && note.latitude != null) {
      points.push([note.longitude, note.latitude])
    }
    if (note.trailhead?.longitude != null && note.trailhead?.latitude != null) {
      points.push([note.trailhead.longitude, note.trailhead.latitude])
    }
  }

  if (points.length > 0) {
    nextTick(() => {
      mapRef.value?.focusOn(points, getMapFocusPadding())
    })
  }

  return true
}

function fitAllWaypoints() {
  nextTick(() => {
    const list = filteredWaypoints.value.length > 0 ? filteredWaypoints.value : mapWaypoints.value
    if (list.length > 0) {
      const points: Array<[number, number]> = list.map(wp => [wp.lng, wp.lat])
      mapRef.value?.focusOn(points, getMapFocusPadding())
    }
  })
}

function initDefaultPosition() {
  // Check URL query param for direct story or location link sharing
  if (typeof window !== 'undefined') {
    const params = new URLSearchParams(window.location.search)
    const storyParam = params.get('story') || params.get('dispatch')
    if (storyParam) {
      isReaderOpen.value = false
      showNotification('Dispatch route inspection active')
      focusInspectedRoute()
      return
    }

    const locationParam = params.get('location')
    if (locationParam) {
      const match = fieldNotes.value.find(n => n.slug === locationParam || n.id === locationParam)
      if (match) {
        selectedNoteId.value = match.id
        nextTick(() => focusSelection())
        return
      }
    }
  }

  // 1. Check if camera was remembered from previous session / refresh
  const hasSavedCamera = mapRef.value?.hasSavedCamera?.()
  if (hasSavedCamera) {
    // Camera is already positioned at saved coordinates by MapCanvas.
    // Silently obtain user coordinates in background to display the blue marker if available
    if (typeof navigator !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          userLocation.value = [pos.coords.longitude, pos.coords.latitude]
        },
        () => {},
        { enableHighAccuracy: true, timeout: 8000 }
      )
    }
    return
  }

  // 2. No saved camera -> App default location:
  // "The apps default location should be the users location. If that isn't available then show all the points currently on the map."
  if (typeof navigator !== 'undefined' && navigator.geolocation) {
    // Show all waypoints immediately while waiting for GPS / permission prompt
    fitAllWaypoints()

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lng = position.coords.longitude
        const lat = position.coords.latitude
        userLocation.value = [lng, lat]
        mapRef.value?.flyToCoordinates(lng, lat, 13)
        showNotification(`Position acquired [${lat.toFixed(3)}°N • ${lng.toFixed(3)}°E]`)
      },
      (_err) => {
        // Geolocation denied, unavailable, or timed out -> frame all points currently on the map
        fitAllWaypoints()
      },
      { enableHighAccuracy: true, timeout: 6000 }
    )
  } else {
    // Geolocation not supported by device
    fitAllWaypoints()
  }
}

onMounted(async () => {
  try {
    await fetchPosts()
    await fetchWaypoints()
  } catch (e) {
    // Graceful fallback to default fieldNotes/mapWaypoints
  }

  if (typeof window !== 'undefined') {
    window.addEventListener('resize', handleWindowResize)
  }

  initDefaultPosition()
})

onUnmounted(() => {
  if (typeof window !== 'undefined') {
    window.removeEventListener('resize', handleWindowResize)
  }
})

// Active Filter Count Badge
const activeFilterCount = computed(() => {
  let count = 0
  if (filters.value.category !== 'ALL' || activeCategory.value !== 'ALL') count++
  if (filters.value.area !== 'ALL') count++
  if (filters.value.visitStatus !== 'ALL') count++
  if (filters.value.maxDistanceKm > 0) count++
  if (filters.value.amenities.length > 0) count += filters.value.amenities.length
  return count
})

// Filtered Field Notes
const filteredFieldNotes = computed(() => {
  return fieldNotes.value.filter((note) => {
    // 1. Search Query
    if (searchQuery.value.trim()) {
      const q = searchQuery.value.toLowerCase().trim()
      const matchesTitle = note.title.toLowerCase().includes(q)
      const matchesDesc = (note.description || '').toLowerCase().includes(q)
      const matchesTag = note.numberTag.toLowerCase().includes(q)
      const matchesFeature = (note.footerFeature || '').toLowerCase().includes(q)
      const matchesArea = (note.area || '').toLowerCase().includes(q) || (note.areaId || '').toLowerCase().includes(q)
      if (!matchesTitle && !matchesDesc && !matchesTag && !matchesFeature && !matchesArea) {
        return false
      }
    }

    // 2. Area Filter
    if (filters.value.area && filters.value.area !== 'ALL') {
      const targetArea = filters.value.area.toLowerCase()
      const noteAreaId = (note.areaId || '').toLowerCase()
      const noteArea = (note.area || '').toLowerCase()
      if (noteAreaId !== targetArea && noteArea !== targetArea) {
        return false
      }
    }

    // 3. Category Filter (either quick category or modal filter)
    const effectiveCategory = filters.value.category !== 'ALL' ? filters.value.category : activeCategory.value
    if (effectiveCategory !== 'ALL') {
      const noteCat = note.category || ''
      const tagUpper = note.numberTag.toUpperCase()
      const match = noteCat.toUpperCase().includes(effectiveCategory) || tagUpper.includes(effectiveCategory)
      if (!match) return false
    }

    // 4. Visit Status
    if (filters.value.visitStatus === 'VISITED' && (note.visitedCount ?? 0) <= 0) {
      return false
    }
    if (filters.value.visitStatus === 'UNVISITED' && (note.visitedCount ?? 0) > 0) {
      return false
    }

    // 5. Max Distance
    if (filters.value.maxDistanceKm > 0) {
      const dist = note.distanceKm ?? 1.5
      if (dist > filters.value.maxDistanceKm) {
        return false
      }
    }

    // 6. Amenities
    if (filters.value.amenities.length > 0) {
      const noteAmenityLabels = note.amenities.map(a => a.label.toLowerCase())
      for (const required of filters.value.amenities) {
        const has = noteAmenityLabels.some(l => l.includes(required.toLowerCase()))
        if (!has) return false
      }
    }

    return true
  })
})

// Filtered Waypoints matching filtered notes
const filteredWaypoints = computed(() => {
  const matchingIds = new Set(filteredFieldNotes.value.map(n => n.id))
  return mapWaypoints.value.filter(wp => matchingIds.has(wp.id))
})

// Selected Note Details
const selectedNote = computed(() => {
  return fieldNotes.value.find(n => n.id === selectedNoteId.value) || fieldNotes.value[0] || null
})

// Trailhead (parking) for the explicitly selected location — not the fallback note above
const selectedTrailhead = computed(() => {
  const note = fieldNotes.value.find(n => n.id === selectedNoteId.value)
  if (!note?.trailhead) return null
  return {
    name: note.trailhead.name,
    lat: note.trailhead.latitude,
    lng: note.trailhead.longitude,
    trailGeometry: (note.trailhead as any).trailGeometry || null
  }
})

const viewportRef = ref<HTMLElement | null>(null)
const drawerRef = ref<any>(null)

/**
 * Space (px) the camera keeps clear: top overlays (brand notch, toast, map controls)
 * and whatever part of the map the mobileDrawer currently covers at the bottom.
 * By setting pad.bottom = drawerCoveredHeight + topClearance, the target elements
 * (whether a single location point or location + trailhead bounds) are centered
 * in the visible viewport above the mobile drawer.
 */
function getMapFocusPadding() {
  const defaultPadding = { top: 76, bottom: 48, left: 48, right: 72 }
  const viewport = viewportRef.value
  if (!viewport || typeof window === 'undefined') return defaultPadding

  const viewportBottom = viewport.getBoundingClientRect().bottom
  const drawerTop = measureDrawerTop(drawerRef.value?.$el)

  return calculateMapFocusPadding({
    windowHeight: window.innerHeight,
    viewportBottom,
    drawerTop,
    topClearance: 76,
    leftPadding: 48,
    rightPadding: 72
  })
}

async function focusSelection() {
  let note: any = fieldNotes.value.find(n => n.id === selectedNoteId.value || n.slug === selectedNoteId.value)
  if (!note && activeInspectedDispatch.value) {
    const wp = inspectedWaypoints.value.find(w => w.id === selectedNoteId.value || w.slug === selectedNoteId.value)
    if (wp) {
      note = {
        id: wp.id,
        latitude: wp.latitude,
        longitude: wp.longitude,
        trailhead: (wp as any).trailhead
      }
    }
  }
  if (!note || note.longitude == null || note.latitude == null) return

  // Await Vue DOM patch and requestAnimationFrame layout resolution
  // so the newly rendered peek card and drawer height are accurately measured
  await nextTick()
  if (typeof window !== 'undefined') {
    await new Promise(resolve => requestAnimationFrame(resolve))
  }

  const points: Array<[number, number]> = [[note.longitude, note.latitude]]
  const th = note.trailhead
  if (th && th.latitude != null && th.longitude != null) {
    points.push([th.longitude, th.latitude])
    const geom = (th as any).trailGeometry
    if (geom && geom.length > 2) {
      const step = Math.max(1, Math.floor(geom.length / 5))
      for (let i = step; i < geom.length; i += step) {
        points.push(geom[i])
      }
    }
  }
  mapRef.value?.focusOn(points, getMapFocusPadding())
}

// Frame the selection after the DOM updates so the peek card is rendered and measurable
watch(selectedNoteId, (id) => {
  if (id) {
    focusSelection()
  } else if (activeInspectedDispatch.value) {
    focusInspectedRoute()
  }
}, { flush: 'post' })

function handleSelectNote(id: string) {
  if (selectedNoteId.value === id) {
    // Same location re-tapped: the watcher won't fire, so re-frame explicitly
    focusSelection()
    return
  }
  selectedNoteId.value = id
}

function handleSelectCategory(cat: string) {
  activeCategory.value = cat
  filters.value.category = cat
}

function handleOpenFilters() {
  isFilterOpen.value = true
}

function handleApplyFilters(newFilters: FilterState) {
  const previousArea = filters.value.area
  filters.value = { ...newFilters }
  activeCategory.value = newFilters.category
  showNotification(`Filters applied: ${filteredFieldNotes.value.length} discoveries found`)

  if (newFilters.area !== previousArea) {
    nextTick(() => {
      const targetNotes = filteredFieldNotes.value
      if (targetNotes.length > 0) {
        const points = targetNotes
          .filter(n => n.longitude != null && n.latitude != null)
          .map(n => [n.longitude!, n.latitude!] as [number, number])
        if (points.length > 0) {
          mapRef.value?.focusOn(points, getMapFocusPadding())
        }
      }
    })
  }
}

function handleResetFilters() {
  const previousArea = filters.value.area
  filters.value = {
    category: 'ALL',
    area: 'ALL',
    visitStatus: 'ALL',
    maxDistanceKm: 0,
    amenities: []
  }
  activeCategory.value = 'ALL'
  searchQuery.value = ''
  showNotification('Filters reset to default')

  if (previousArea !== 'ALL') {
    nextTick(() => {
      const allPoints = fieldNotes.value
        .filter(n => n.longitude != null && n.latitude != null)
        .map(n => [n.longitude!, n.latitude!] as [number, number])
      if (allPoints.length > 0) {
        mapRef.value?.focusOn(allPoints, getMapFocusPadding())
      }
    })
  }
}

function handleToggleLayer() {
  activeLayer.value = activeLayer.value === 'topo' ? 'satellite' : 'topo'
}

function handleZoomIn() {
  mapRef.value?.zoomIn()
}

function handleZoomOut() {
  mapRef.value?.zoomOut()
}

function handleLocate() {
  if (typeof navigator === 'undefined' || !navigator.geolocation) {
    showNotification('Geolocation not supported by device')
    return
  }
  isLocating.value = true
  navigator.geolocation.getCurrentPosition(
    (position) => {
      isLocating.value = false
      const lng = position.coords.longitude
      const lat = position.coords.latitude
      userLocation.value = [lng, lat]
      mapRef.value?.flyToCoordinates(lng, lat, 14)
      showNotification(`Location acquired [${lat.toFixed(3)}°N • ${lng.toFixed(3)}°E]`)
    },
    (err) => {
      isLocating.value = false
      showNotification('Location access unavailable — showing all waypoints')
      fitAllWaypoints()
    },
    { enableHighAccuracy: true, timeout: 8000 }
  )
}

function handleClearSelected() {
  selectedNoteId.value = ''
}

function handleReadStory(target: any) {
  let storyIdentifier = ''

  if (typeof target === 'string') {
    storyIdentifier = target
  } else if (target && typeof target === 'object') {
    storyIdentifier = target.slug || target.id || ''
  }

  if (storyIdentifier) {
    router.push(`/dispatches/${storyIdentifier}`)
    return
  }

  if (target && typeof target === 'object' && target.id) {
    router.push(`/locations/${target.slug || target.id}`)
  }
}

function handleCloseReader() {
  isReaderOpen.value = false
  selectedNoteId.value = ''
  if (typeof window !== 'undefined') {
    const url = new URL(window.location.href)
    url.searchParams.delete('story')
    window.history.pushState({}, '', url.toString())
  }
}

function showNotification(msg: string) {
  notificationMessage.value = msg
  setTimeout(() => {
    if (notificationMessage.value === msg) {
      notificationMessage.value = null
    }
  }, 2800)
}
</script>

<template>
  <div class="atlas-page">
    <!-- Main Map View Area -->
    <main ref="viewportRef" class="main-viewport">
      <!-- Topographic Map Canvas -->
      <ClientOnly>
        <MapCanvas ref="mapRef" :waypoints="filteredWaypoints" :selected-id="selectedNoteId"
          :trailhead="selectedTrailhead" :active-layer="activeLayer" :user-location="userLocation"
          :inspected-route="inspectedRoute"
          @select-waypoint="handleSelectNote" />
      </ClientOnly>

      <!-- Map Controls (Zoom, Current Location, Layer Toggle) -->
      <MapControls :active-layer="activeLayer" :is-locating="isLocating" @zoom-in="handleZoomIn"
        @zoom-out="handleZoomOut" @locate="handleLocate" @toggle-layer="handleToggleLayer" />

      <!-- Live Toast Notification Banner -->
      <Transition name="fade">
        <div v-if="notificationMessage" class="toast-notification font-mono">
          <span class="toast-dot">●</span>
          {{ notificationMessage }}
        </div>
      </Transition>
    </main>

    <!-- TWO-ZONE BOTTOM DRAWER (docked fixed at bottom: 64px) -->
    <MobileDrawer ref="drawerRef" :field-notes="filteredFieldNotes" :selected-id="selectedNoteId"
      :search-query="searchQuery" :active-category="activeCategory" :active-filter-count="activeFilterCount"
      :active-dispatch="activeInspectedDispatch" :inspected-waypoints="inspectedWaypoints"
      @select-note="handleSelectNote" @clear-selected="handleClearSelected" @read-story="handleReadStory" @navigate="(p) => {
        selectedNoteId = p.id
        focusSelection()
        showNotification('Opening maps to trailhead...')
      }" @open-filters="handleOpenFilters" @update:search-query="(q) => searchQuery = q"
      @select-category="handleSelectCategory" @exit-inspection="handleExitInspection" />

    <!-- STANDARDIZED DOSSIER SHEET MODAL -->
    <DossierSheet :note="selectedNote" :is-open="isDossierOpen" @close="isDossierOpen = false"
      @read-story="handleReadStory" />

    <!-- DEDICATED EDITORIAL DISPATCH READER VIEW -->
    <DispatchReader :note="selectedNote" :is-open="isReaderOpen" @close="handleCloseReader"
      @back-to-map="handleCloseReader" />

    <!-- ACTIVE FILTER SHEET MODAL -->
    <FilterModal :is-open="isFilterOpen" :active-filters="filters" :matching-count="filteredFieldNotes.length"
      @close="isFilterOpen = false" @apply="handleApplyFilters" @reset="handleResetFilters" />
  </div>
</template>

<style scoped>
.atlas-page {
  position: fixed;
  inset: 0;
  overflow: hidden;
  user-select: none;
}

.main-viewport {
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  overflow: hidden;
  background-color: #e8e2d4;
}

/* TOAST NOTIFICATION */
.toast-notification {
  position: absolute;
  top: 76px;
  left: 16px;
  right: 16px;
  margin: 0 auto;
  max-width: 360px;
  z-index: 40;
  background-color: rgba(27, 46, 36, 0.95);
  color: var(--color-surface);
  text-align: center;
  padding: 6px 12px;
  border-radius: 4px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(217, 83, 30, 0.4);
  font-size: 11px;
  font-weight: 500;
}

.toast-dot {
  color: var(--color-secondary);
  font-weight: 700;
  margin-right: 4px;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
