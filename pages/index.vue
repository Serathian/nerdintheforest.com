<script setup lang="ts">
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import type { FilterState } from '~/components/organisms/FilterModal.vue'

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
const isFilterOpen = ref(false)
const searchQuery = ref('')
const activeCategory = ref('ALL')
const activeLayer = ref<'topo' | 'satellite'>('topo')
const userLocation = ref<[number, number] | null>(null)
const isLocating = ref(false)
const notificationMessage = ref<string | null>(null)

const filters = ref<FilterState>({
  category: 'ALL',
  visitStatus: 'ALL',
  maxDistanceKm: 0,
  amenities: []
})

const { fieldNotes, mapWaypoints, fetchPosts, fetchWaypoints } = useNitfCms()

onMounted(async () => {
  try {
    await fetchPosts()
    await fetchWaypoints()
  } catch (e) {
    // Graceful fallback to default fieldNotes/mapWaypoints
  }

  // Check URL query param for direct story link sharing (e.g., ?story=langvatnet-gapahuk or ?story=note-1)
  if (typeof window !== 'undefined') {
    const params = new URLSearchParams(window.location.search)
    const storyParam = params.get('story')
    if (storyParam) {
      const match = fieldNotes.value.find(n => n.slug === storyParam || n.id === storyParam)
      if (match) {
        selectedNoteId.value = match.id
        isReaderOpen.value = true
      }
    }
  }
})

// Active Filter Count Badge
const activeFilterCount = computed(() => {
  let count = 0
  if (filters.value.category !== 'ALL' || activeCategory.value !== 'ALL') count++
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
      const matchesDesc = note.description.toLowerCase().includes(q)
      const matchesTag = note.numberTag.toLowerCase().includes(q)
      const matchesFeature = note.footerFeature.toLowerCase().includes(q)
      if (!matchesTitle && !matchesDesc && !matchesTag && !matchesFeature) {
        return false
      }
    }

    // 2. Category Filter (either quick category or modal filter)
    const effectiveCategory = filters.value.category !== 'ALL' ? filters.value.category : activeCategory.value
    if (effectiveCategory !== 'ALL') {
      const noteCat = note.category || ''
      const tagUpper = note.numberTag.toUpperCase()
      const match = noteCat.toUpperCase().includes(effectiveCategory) || tagUpper.includes(effectiveCategory)
      if (!match) return false
    }

    // 3. Visit Status
    if (filters.value.visitStatus === 'VISITED' && (note.visitedCount ?? 0) <= 0) {
      return false
    }
    if (filters.value.visitStatus === 'UNVISITED' && (note.visitedCount ?? 0) > 0) {
      return false
    }

    // 4. Max Distance
    if (filters.value.maxDistanceKm > 0) {
      const dist = note.distanceKm ?? 1.5
      if (dist > filters.value.maxDistanceKm) {
        return false
      }
    }

    // 5. Amenities
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
  return { name: note.trailhead.name, lat: note.trailhead.latitude, lng: note.trailhead.longitude }
})

const viewportRef = ref<HTMLElement | null>(null)
const drawerRef = ref<any>(null)

/**
 * Space (px) the camera must keep clear: the floating top console, the right-hand map
 * controls, and whatever part of the map the bottom drawer / peek card currently covers.
 * Uses offsetHeight so the peek card's slide-up transform doesn't skew the measurement.
 */
function getMapFocusPadding() {
  const padding = { top: 110, bottom: 48, left: 48, right: 72 }
  const viewport = viewportRef.value
  const drawer: HTMLElement | null =
    drawerRef.value?.$el?.querySelector?.('.mobile-map-bottom-container') ?? null
  if (viewport && drawer && typeof window !== 'undefined') {
    const viewportBottom = viewport.getBoundingClientRect().bottom
    const drawerTop = window.innerHeight - drawer.offsetHeight
    padding.bottom = Math.max(0, viewportBottom - drawerTop) + 48
  }
  return padding
}

function focusSelection() {
  const note = fieldNotes.value.find(n => n.id === selectedNoteId.value)
  if (!note || note.longitude == null || note.latitude == null) return
  const points: Array<[number, number]> = [[note.longitude, note.latitude]]
  if (selectedTrailhead.value) {
    points.push([selectedTrailhead.value.lng, selectedTrailhead.value.lat])
  }
  mapRef.value?.focusOn(points, getMapFocusPadding())
}

// Frame the selection after the DOM updates so the peek card is rendered and measurable
watch(selectedNoteId, (id) => {
  if (id) focusSelection()
}, { flush: 'post' })

function handleSelectNote(id: string) {
  if (selectedNoteId.value === id) {
    // Same location re-tapped: the watcher won't fire, so re-frame explicitly
    nextTick(focusSelection)
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
  filters.value = { ...newFilters }
  activeCategory.value = newFilters.category
  showNotification(`Filters applied: ${filteredFieldNotes.value.length} discoveries found`)
}

function handleResetFilters() {
  filters.value = {
    category: 'ALL',
    visitStatus: 'ALL',
    maxDistanceKm: 0,
    amenities: []
  }
  activeCategory.value = 'ALL'
  searchQuery.value = ''
  showNotification('Filters reset to default')
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
      const fallbackLng = 10.715
      const fallbackLat = 60.270
      userLocation.value = [fallbackLng, fallbackLat]
      mapRef.value?.flyToCoordinates(fallbackLng, fallbackLat, 13)
      showNotification('Using Nordmarka field benchmark coords')
    },
    { enableHighAccuracy: true, timeout: 8000 }
  )
}

function handleClearSelected() {
  selectedNoteId.value = ''
}

function handleReadStory(target: any) {
  let noteObj = null
  if (typeof target === 'string') {
    noteObj = fieldNotes.value.find(n => n.id === target || n.slug === target)
  } else if (target && typeof target === 'object') {
    if (target.slug) {
      noteObj = fieldNotes.value.find(n => n.slug === target.slug || n.id === target.id)
      if (!noteObj) {
        noteObj = fieldNotes.value.find(n => n.dispatches?.some(d => d.slug === target.slug || d.id === target.id))
      }
      if (!noteObj && selectedNote.value) {
        noteObj = { ...selectedNote.value, ...target }
      }
    } else {
      noteObj = target
    }
  }

  if (noteObj) {
    selectedNoteId.value = noteObj.id
  }
  isDossierOpen.value = false
  isReaderOpen.value = true

  // Sync URL query without full page reload for shareability
  if (typeof window !== 'undefined' && noteObj) {
    const url = new URL(window.location.href)
    url.searchParams.set('story', noteObj.slug || noteObj.id)
    window.history.pushState({}, '', url.toString())
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
        <MapCanvas
          ref="mapRef"
          :waypoints="filteredWaypoints"
          :selected-id="selectedNoteId"
          :trailhead="selectedTrailhead"
          :active-layer="activeLayer"
          :user-location="userLocation"
          @select-waypoint="handleSelectNote"
        />
      </ClientOnly>

      <!-- Map Controls (Zoom, Current Location, Layer Toggle) -->
      <MapControls
        :active-layer="activeLayer"
        :is-locating="isLocating"
        @zoom-in="handleZoomIn"
        @zoom-out="handleZoomOut"
        @locate="handleLocate"
        @toggle-layer="handleToggleLayer"
      />

      <!-- Live Toast Notification Banner -->
      <Transition name="fade">
        <div
          v-if="notificationMessage"
          class="toast-notification font-mono"
        >
          <span class="toast-dot">●</span>
          {{ notificationMessage }}
        </div>
      </Transition>
    </main>

    <!-- TWO-ZONE BOTTOM DRAWER (docked fixed at bottom: 64px) -->
    <MobileDrawer
      ref="drawerRef"
      :field-notes="filteredFieldNotes"
      :selected-id="selectedNoteId"
      :search-query="searchQuery"
      :active-category="activeCategory"
      :active-filter-count="activeFilterCount"
      @select-note="handleSelectNote"
      @clear-selected="handleClearSelected"
      @read-story="handleReadStory"
      @navigate="(p) => {
        selectedNoteId = p.id
        mapRef?.flyToWaypoint(p.lng, p.lat)
        showNotification('Opening maps to trailhead...')
      }"
      @open-filters="handleOpenFilters"
      @update:search-query="(q) => searchQuery = q"
      @select-category="handleSelectCategory"
    />

    <!-- STANDARDIZED DOSSIER SHEET MODAL -->
    <DossierSheet
      :note="selectedNote"
      :is-open="isDossierOpen"
      @close="isDossierOpen = false"
      @read-story="handleReadStory"
    />

    <!-- DEDICATED EDITORIAL DISPATCH READER VIEW -->
    <DispatchReader
      :note="selectedNote"
      :is-open="isReaderOpen"
      @close="handleCloseReader"
      @back-to-map="handleCloseReader"
    />

    <!-- ACTIVE FILTER SHEET MODAL -->
    <FilterModal
      :is-open="isFilterOpen"
      :active-filters="filters"
      :matching-count="filteredFieldNotes.length"
      @close="isFilterOpen = false"
      @apply="handleApplyFilters"
      @reset="handleResetFilters"
    />
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
  bottom: 64px;
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
