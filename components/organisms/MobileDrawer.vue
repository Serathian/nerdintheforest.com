<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { FieldNote, LinkedDispatch } from '../../types/fieldNotes'
import type { Dispatch } from '~/types/models'
import MobileDrawerContainer from '../molecules/MobileDrawerContainer.vue'
import MobileSearchSection from '../molecules/MobileSearchSection.vue'
import MobileRecentLocationsCarousel from '../molecules/MobileRecentLocationsCarousel.vue'
import MobileLocationPeek from '../molecules/MobileLocationPeek.vue'
import MobileDispatchesTrack from '../molecules/MobileDispatchesTrack.vue'
import MobileDispatchInspectionPeek from '../molecules/MobileDispatchInspectionPeek.vue'
import { useTrailheadNav } from '~/composables/useTrailheadNav'

interface Props {
  fieldNotes: FieldNote[]
  selectedId?: string
  searchQuery?: string
  activeCategory?: string
  activeFilterCount?: number
  activeDispatch?: Dispatch | null
  inspectedWaypoints?: any[]
  selectedLegIndex?: number | null
}

const props = withDefaults(defineProps<Props>(), {
  selectedId: '',
  searchQuery: '',
  activeCategory: 'ALL',
  activeFilterCount: 0,
  activeDispatch: null,
  inspectedWaypoints: () => [],
  selectedLegIndex: null
})

const emit = defineEmits<{
  (e: 'select-note', id: string): void
  (e: 'select-leg', index: number): void
  (e: 'clear-leg'): void
  (e: 'clear-selected'): void
  (e: 'read-story', target: any): void
  (e: 'navigate', payload: { id: string; lat: number; lng: number }): void
  (e: 'open-filters'): void
  (e: 'update:searchQuery', query: string): void
  (e: 'select-category', category: string): void
  (e: 'exit-inspection'): void
}>()

// 2 CORE BASE LAYER MODES:
// 'search': Base layer is Search & Filter controls
// 'location_peek': Base layer is Focused Location Peek card
type ViewMode = 'search' | 'location_peek'

const viewMode = ref<ViewMode>(props.selectedId ? 'location_peek' : 'search')
const isRecentLocationsOpen = ref(false)
const isDispatchesExpanded = ref(false)

const selectedLocation = computed(() => {
  if (!props.selectedId) return null
  return props.fieldNotes.find(n => n.id === props.selectedId) || null
})

// Elevation gain and loss for selected location route (only when trailhead is a separate hike away)
const elevationGainLoss = computed(() => {
  if (!selectedLocation.value) return null
  const th = selectedLocation.value.trailhead
  const gain = th?.elevationGain ?? selectedLocation.value.elevationGain
  const loss = th?.elevationLoss ?? selectedLocation.value.elevationLoss
  if (gain != null && loss != null && (gain > 0 || loss > 0)) {
    return { up: gain, down: loss }
  }
  return null
})

// Estimated trailhead start elevation (destination elevation minus net elevation gain)
const calculatedStartElevation = computed(() => {
  if (!selectedLocation.value) return 350
  const dest = selectedLocation.value.elevation ?? 500
  if (elevationGainLoss.value) {
    const net = elevationGainLoss.value.up - elevationGainLoss.value.down
    return Math.max(50, dest - net)
  }
  return Math.max(50, dest - 100)
})

// Normalize dispatches for the selected location (strictly empty when visitedCount is 0)
const availableDispatches = computed<LinkedDispatch[]>(() => {
  if (!selectedLocation.value) return []
  if ((selectedLocation.value.visitedCount ?? 0) <= 0) {
    return []
  }
  if (selectedLocation.value.dispatches && selectedLocation.value.dispatches.length > 0) {
    return selectedLocation.value.dispatches
  }
  return [
    {
      id: `${selectedLocation.value.id}-d1`,
      slug: selectedLocation.value.slug || selectedLocation.value.id,
      title: selectedLocation.value.title,
      date: selectedLocation.value.date || 'OCT 04, 2026 // 06:40 CET',
      readTime: selectedLocation.value.readTime || '4 MIN READ',
      excerpt: selectedLocation.value.description,
      weather: selectedLocation.value.weather,
      heroImage: selectedLocation.value.heroImage,
      content: selectedLocation.value.content
    }
  ]
})

// Watch selectedId changes from parent (e.g. map pin tap, or clearing selection on reader close)
watch(() => props.selectedId, (newId) => {
  if (newId) {
    viewMode.value = 'location_peek'
    isDispatchesExpanded.value = false
  } else if (viewMode.value === 'location_peek') {
    viewMode.value = 'search'
    isDispatchesExpanded.value = false
  }
})

function handleSelectLocation(id: string) {
  isRecentLocationsOpen.value = false
  emit('select-note', id)
  viewMode.value = 'location_peek'
  isDispatchesExpanded.value = false
}

function closeLocationPeek() {
  emit('clear-selected')
  viewMode.value = 'search'
  isDispatchesExpanded.value = false
}

function handleReadSpecificDispatch(dispatch: LinkedDispatch) {
  emit('read-story', dispatch)
}

const { openTrailheadModal } = useTrailheadNav()

function handleNavigate(note: FieldNote) {
  if (!note.trailhead && !note.hasParking) return
  const lat = note.trailhead?.latitude ?? note.latitude ?? 60.2710
  const lng = note.trailhead?.longitude ?? note.longitude ?? 10.7320
  emit('navigate', { id: note.id, lat, lng })
  openTrailheadModal({
    trailheadName: note.trailhead?.name || `${note.title} Parking`,
    locationName: note.title,
    lat,
    lng
  })
}
</script>

<template>
  <div class="mobile-drawer-root">
    <!-- ======================================================================= -->
    <!-- SCENARIO C: DISPATCH INSPECTION MODE                                    -->
    <!-- Renders dedicated sequential timeline tray for the active dispatch     -->
    <!-- ======================================================================= -->
    <div v-if="activeDispatch" class="inspection-dock-container">
      <div class="inspection-dock-card">
        <MobileDispatchInspectionPeek
          :dispatch="activeDispatch"
          :waypoints="inspectedWaypoints"
          :selected-location-id="selectedId"
          :selected-leg-index="selectedLegIndex"
          @select-waypoint="(id) => emit('select-note', id)"
          @select-leg="(idx) => emit('select-leg', idx)"
          @clear-leg="emit('clear-leg')"
          @exit="emit('exit-inspection')"
          @read-dispatch="(slug) => emit('read-story', slug)"
        />
      </div>
    </div>

    <!-- ======================================================================= -->
    <!-- SCENARIO A: SEARCH MODE                                                 -->
    <!-- #main: Search & Filter section (always visible, light parchment)        -->
    <!-- #drawer: Recently updated locations carousel (tactile Kraft tray)       -->
    <!-- ======================================================================= -->
    <MobileDrawerContainer
      v-else-if="viewMode !== 'location_peek'"
      v-model:isOpen="isRecentLocationsOpen"
      tab-title="RECENTLY UPDATED"
      tab-icon="layers"
      :tab-count="fieldNotes.length"
      drawer-height="388px"
    >
      <template #main>
        <MobileSearchSection
          :search-query="searchQuery"
          :active-filter-count="activeFilterCount"
          @update:search-query="(q) => emit('update:searchQuery', q)"
          @open-filters="emit('open-filters')"
        />
      </template>

      <template #drawer>
        <MobileRecentLocationsCarousel
          :field-notes="fieldNotes"
          :selected-id="selectedId"
          @select-location="handleSelectLocation"
          @read-story="(id) => emit('read-story', id)"
          @navigate="(p) => emit('navigate', p)"
        />
      </template>
    </MobileDrawerContainer>

    <!-- ======================================================================= -->
    <!-- SCENARIO B: LOCATION PEEK MODE                                          -->
    <!-- #main: Focused location dossier card (always visible, light parchment)  -->
    <!-- #drawer: Field dispatches scroll track (tactile Kraft tray)             -->
    <!-- ======================================================================= -->
    <MobileDrawerContainer
      v-else-if="viewMode === 'location_peek' && selectedLocation"
      v-model:isOpen="isDispatchesExpanded"
      tab-title="FIELD DISPATCHES"
      tab-icon="history_edu"
      :tab-count="availableDispatches.length"
      drawer-height="270px"
    >
      <template #main>
        <MobileLocationPeek
          :location="selectedLocation"
          :elevation-gain-loss="elevationGainLoss"
          :start-elevation="calculatedStartElevation"
          @close="closeLocationPeek"
          @navigate="handleNavigate"
        />
      </template>

      <template #drawer>
        <MobileDispatchesTrack
          :dispatches="availableDispatches"
          @read-dispatch="handleReadSpecificDispatch"
        />
      </template>
    </MobileDrawerContainer>
  </div>
</template>

<style scoped>
.mobile-drawer-root {
  position: static;
}

.inspection-dock-container {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  z-index: 40;
  pointer-events: none;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
}

.inspection-dock-card {
  width: 100%;
  border-top-left-radius: 16px;
  border-top-right-radius: 16px;
  background-color: var(--color-floating-bg, #faf4e8);
  border-top: 1.5px solid rgba(115, 120, 116, 0.4);
  box-shadow: 0 -8px 24px rgba(27, 46, 36, 0.2);
  pointer-events: auto;
  box-sizing: border-box;
  overflow: hidden;
  padding-bottom: 68px; /* Seamless continuation all the way to bottom edge of viewport behind BottomNav */
}
</style>
