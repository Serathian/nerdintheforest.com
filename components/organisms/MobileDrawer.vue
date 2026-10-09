<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'

interface LinkedDispatch {
  id: string
  slug: string
  title: string
  date: string
  readTime: string
  excerpt?: string
  weather?: string
  heroImage?: string
  content?: string[]
}

interface FieldNote {
  id: string
  numberTag: string
  title: string
  description?: string
  timeAgo?: string
  visitedCount?: number
  amenities: { icon: string; label: string }[]
  footerFeature?: string
  footerIcon?: string
  metrics?: string
  latitude?: number
  longitude?: number
  elevation?: number
  distanceKm?: number
  slug?: string
  date?: string
  readTime?: string
  weather?: string
  heroImage?: string
  content?: string[]
  dispatches?: LinkedDispatch[]
}

interface Props {
  fieldNotes: FieldNote[]
  selectedId?: string
  searchQuery?: string
  activeCategory?: string
  activeFilterCount?: number
}

const props = withDefaults(defineProps<Props>(), {
  selectedId: '',
  searchQuery: '',
  activeCategory: 'ALL',
  activeFilterCount: 0
})

const emit = defineEmits<{
  (e: 'select-note', id: string): void
  (e: 'clear-selected'): void
  (e: 'read-story', target: any): void
  (e: 'navigate', payload: { id: string; lat: number; lng: number }): void
  (e: 'open-filters'): void
  (e: 'update:searchQuery', query: string): void
  (e: 'select-category', category: string): void
}>()

// 3 MAIN MAP STATES:
// 1. 'search_only'       -> Only search & filter visible + subtle 'Recently Updated Locations ⌃' pull handle
// 2. 'recent_locations'  -> Search & filters + the 'Recently Updated Locations' horizontal carousel drawer
// 3. 'location_peek'     -> Focused Location Peek card (replaces search & filters)
type ViewState = 'search_only' | 'recent_locations' | 'location_peek'

const viewState = ref<ViewState>(props.selectedId ? 'location_peek' : 'search_only')
// Track what the state was before entering location_peek (e.g. was user in 'recent_locations' or 'search_only')
const previousViewState = ref<ViewState>('search_only')
const selectedDispatchIndex = ref(0)

const quickCategories = [
  { id: 'ALL', label: 'ALL LOCATIONS' },
  { id: 'SHELTER', label: 'SHELTERS' },
  { id: 'HEARTH', label: 'HEARTHS' },
  { id: 'SPRINGHEAD', label: 'SPRINGS' },
  { id: 'VIEWPOINT', label: 'VIEWPOINTS' }
]

const selectedLocation = computed(() => {
  if (!props.selectedId) return null
  return props.fieldNotes.find(n => n.id === props.selectedId) || null
})

// Normalize dispatches for the selected location (ensures at least 1 dispatch is available)
const availableDispatches = computed<LinkedDispatch[]>(() => {
  if (!selectedLocation.value) return []
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

const activeDispatch = computed<LinkedDispatch | null>(() => {
  if (availableDispatches.value.length === 0) return null
  return availableDispatches.value[selectedDispatchIndex.value] || availableDispatches.value[0]
})

// Watch selectedId changes from parent (e.g. map pin tap, or clearing selection on reader close)
watch(() => props.selectedId, (newId, oldId) => {
  if (newId) {
    if (viewState.value !== 'location_peek') {
      previousViewState.value = viewState.value
    }
    viewState.value = 'location_peek'
    selectedDispatchIndex.value = 0
  } else if (viewState.value === 'location_peek') {
    // Revert to whatever state we came from (recent_locations or search_only)
    viewState.value = previousViewState.value || 'search_only'
  }
})

const isSearchOpen = ref(false)
const searchContainerRef = ref<HTMLElement | null>(null)

function toggleSearch() {
  isSearchOpen.value = !isSearchOpen.value
}

function handleSearchInput(e: Event) {
  const target = e.target as HTMLInputElement
  emit('update:searchQuery', target.value)
}

function clearSearch() {
  emit('update:searchQuery', '')
  isSearchOpen.value = false
}

function handleClickOutside(event: Event) {
  if (!isSearchOpen.value) return
  const target = event.target as Node | null
  if (searchContainerRef.value && !searchContainerRef.value.contains(target)) {
    isSearchOpen.value = false
  }
}

function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape' && isSearchOpen.value) {
    isSearchOpen.value = false
  }
}

onMounted(() => {
  if (typeof window !== 'undefined') {
    window.addEventListener('pointerdown', handleClickOutside)
    window.addEventListener('keydown', handleKeydown)
  }
})

onUnmounted(() => {
  if (typeof window !== 'undefined') {
    window.removeEventListener('pointerdown', handleClickOutside)
    window.removeEventListener('keydown', handleKeydown)
  }
})

// Transition from State 1 to State 2
function openRecentLocations() {
  viewState.value = 'recent_locations'
  previousViewState.value = 'recent_locations'
}

// Collapse State 2 back to State 1
function collapseToSearchOnly() {
  viewState.value = 'search_only'
  previousViewState.value = 'search_only'
}

// Transition to State 3 (Location Peek)
function handleSelectLocation(id: string) {
  previousViewState.value = 'recent_locations'
  emit('select-note', id)
  viewState.value = 'location_peek'
  selectedDispatchIndex.value = 0
}

// Close Location Peek and return to previous state (or recent_locations if opened from there)
function closeLocationPeek() {
  emit('clear-selected')
  viewState.value = previousViewState.value || 'search_only'
  selectedDispatchIndex.value = 0
}

function handleReadSpecificDispatch(dispatch: LinkedDispatch) {
  emit('read-story', dispatch)
}

function handleReadDispatch() {
  if (activeDispatch.value) {
    emit('read-story', activeDispatch.value)
  } else if (selectedLocation.value) {
    emit('read-story', selectedLocation.value.id)
  }
}

function handleNavigate(note: FieldNote) {
  const lat = note.latitude ?? 60.2710
  const lng = note.longitude ?? 10.7320
  emit('navigate', { id: note.id, lat, lng })
  if (typeof window !== 'undefined') {
    const isApple = /Mac|iPhone|iPad|iPod/.test(navigator.userAgent)
    const url = isApple
      ? `maps://maps.apple.com/?daddr=${lat},${lng}&dirflg=d`
      : `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`
    window.open(url, '_blank')
  }
}
</script>

<template>
  <div>
    <!-- Backdrop for State 2 (Recent Locations): Invisible click-outside catcher that lets the map stay visible -->
    <div v-if="viewState === 'recent_locations'" class="drawer-backdrop-catcher" @click="collapseToSearchOnly" />

    <div class="mobile-map-bottom-container">
      <!-- ======================================================================= -->
      <!-- STATE 1 & 2: BOTTOM SEARCH & FILTER BAR + DRAWER CONTAINER              -->
      <!-- (Visible when not in State 3 location_peek)                             -->
      <!-- ======================================================================= -->
      <div v-if="viewState !== 'location_peek'" :class="[
        'bottom-search-tray',
        viewState === 'recent_locations' ? 'expanded' : 'collapsed'
      ]">
        <!-- Zone A: Search & Filter Controls -->
        <div class="search-filter-section">
          <div class="search-filter-row">
            <!-- Search Pill / Inline Field -->
            <div v-if="!isSearchOpen" class="search-pill" @click="toggleSearch">
              <span class="material-symbols-outlined search-icon">search</span>
              <span class="search-label">
                {{ searchQuery ? searchQuery : 'Search locations, coordinates...' }}
              </span>
            </div>

            <div v-else ref="searchContainerRef" class="search-input-active">
              <span class="material-symbols-outlined search-icon">search</span>
              <input :value="searchQuery" placeholder="Search locations, coordinates..." autofocus class="search-field"
                @input="handleSearchInput" />
              <button class="search-close-btn" type="button" @click="clearSearch">
                <span class="material-symbols-outlined" style="font-size: 15px;">close</span>
              </button>
            </div>

            <!-- Open Filter Modal Button -->
            <button :class="['filter-btn', { compact: isSearchOpen }]" type="button"
              :title="isSearchOpen ? 'Filter' : undefined" @click="emit('open-filters')">
              <span class="material-symbols-outlined"
                style="font-size: 15px; color: var(--color-secondary);">tune</span>
              <span v-if="!isSearchOpen" class="filter-btn-text">Filter</span>
              <span v-if="activeFilterCount > 0" class="filter-badge font-mono">
                {{ activeFilterCount }}
              </span>
            </button>
          </div>
        </div>

        <!-- ===================================================================== -->
        <!-- STATE 1: RECENT LOCATIONS ASYMMETRIC 2/3 LEFT LEDGER TAB              -->
        <!-- ===================================================================== -->
        <div v-if="viewState === 'search_only'" class="recent-locations-tab-shelf">
          <!-- The Left-merged 2/3 Ledger Tab -->
          <button class="recent-locations-ledger-tab font-mono" type="button"
            aria-label="Open recently updated locations" @click.stop="openRecentLocations">
            <div class="tab-main-info">
              <span class="material-symbols-outlined tab-icon">layers</span>
              <span class="tab-text">RECENTLY UPDATED</span>
              <span v-if="fieldNotes.length > 0" class="tab-badge">
                {{ fieldNotes.length }}
              </span>
            </div>
            <div class="tab-arrow-wrap">
              <span class="material-symbols-outlined tab-chevron">keyboard_arrow_up</span>
            </div>
          </button>

          <!-- Right 1/3 shoulder baseline strip (lighter shade behind) -->
          <div class="tab-shelf-right-shoulder" @click.stop="openRecentLocations" />
        </div>

        <!-- ===================================================================== -->
        <!-- STATE 2: RECENT LOCATIONS EXPANDED DRAWER CONTENT                     -->
        <!-- ===================================================================== -->
        <div v-else-if="viewState === 'recent_locations'" class="recent-locations-drawer-content">
          <!-- Expanded Tab Header: Identical 2/3 Left-merged Asymmetric Ledger Tab -->
          <div class="recent-locations-tab-shelf expanded">
            <button class="recent-locations-ledger-tab font-mono" type="button"
              aria-label="Collapse recently updated locations" @click.stop="collapseToSearchOnly">
              <div class="tab-main-info">
                <span class="material-symbols-outlined tab-icon">layers</span>
                <span class="tab-text">RECENTLY UPDATED</span>
                <span v-if="fieldNotes.length > 0" class="tab-badge">
                  {{ fieldNotes.length }}
                </span>
              </div>
              <div class="tab-arrow-wrap">
                <span class="material-symbols-outlined tab-chevron">keyboard_arrow_down</span>
              </div>
            </button>

            <!-- Right 1/3 shoulder baseline strip (lighter shade behind) -->
            <div class="tab-shelf-right-shoulder" @click.stop="collapseToSearchOnly" />
          </div>

          <!-- Horizontal Snapping Card Carousel (Matching Stitch screen 5aa410902c584116a8582521266216ea) -->
          <div v-if="fieldNotes.length > 0" class="locations-carousel">
            <RecentCard v-for="note in fieldNotes" :key="note.id" :id="note.id" :number-tag="note.numberTag"
              :title="note.title" :description="note.description" :visited-count="note.visitedCount"
              :dispatch-count="note.dispatches?.length || 1" :amenities="note.amenities" :latitude="note.latitude"
              :longitude="note.longitude" :active="note.id === selectedId" @click="handleSelectLocation(note.id)"
              @view-location="handleSelectLocation(note.id)" @read-story="(id) => emit('read-story', id)"
              @navigate="(p) => emit('navigate', p)" />
          </div>

          <div v-else class="empty-state">
            <span class="material-symbols-outlined empty-icon">explore_off</span>
            <span class="empty-title font-serif">No locations match active filters</span>
            <span class="empty-desc font-mono">
              Try adjusting keywords or selecting ALL LOCATIONS
            </span>
          </div>
        </div>
      </div>

      <!-- ======================================================================= -->
      <!-- STATE 3: THE LOCATION PEEK CARD                                         -->
      <!-- (Replaces search & filters with focused location details & dispatches)   -->
      <!-- ======================================================================= -->
      <div v-else-if="viewState === 'location_peek' && selectedLocation" class="location-peek-card">
        <!-- Location Header Bar -->
        <div class="peek-header-row">
          <div class="tag-badges-group">
            <span class="location-tag font-mono">
              {{ selectedLocation.numberTag }}
            </span>

            <span v-if="(selectedLocation.visitedCount ?? 0) > 0" class="visited-badge visited font-mono">
              <span class="material-symbols-outlined check-icon">check_circle</span>
              VISITED {{ selectedLocation.visitedCount }}x
            </span>
            <span v-else class="visited-badge unvisited font-mono">
              <span class="material-symbols-outlined check-icon">radio_button_unchecked</span>
              NOT VISITED
            </span>
          </div>

          <!-- Close Button (Returns to State 1: Search & Filter only) -->
          <button class="peek-close-btn" type="button" title="Close location peek & return to search"
            aria-label="Close location peek" @click="closeLocationPeek">
            <span class="material-symbols-outlined" style="font-size: 16px;">close</span>
          </button>
        </div>

        <!-- Location Title & Coordinates / Elevation Stamp -->
        <div class="title-meta-group">
          <h2 class="location-title font-serif">
            {{ selectedLocation.title }}
          </h2>
          <div class="location-coords-row font-mono">
            <span class="coords-stamp">
              [{{ (selectedLocation.latitude ?? 60.271).toFixed(3) }}°N • {{ (selectedLocation.longitude ??
                10.732).toFixed(3) }}°E]
            </span>
            <span v-if="selectedLocation.elevation" class="coords-divider">•</span>
            <span v-if="selectedLocation.elevation" class="elevation-stamp">
              {{ selectedLocation.elevation }}M ELEV
            </span>
          </div>
        </div>

        <!-- Amenities Widgets (Lean-to, Firewood, Lake Water, Toilet, etc.) -->
        <div class="amenities-row">
          <span v-for="(amenity, idx) in selectedLocation.amenities" :key="idx" class="amenity-widget font-mono">
            <span class="material-symbols-outlined widget-icon">{{ amenity.icon }}</span>
            <span>{{ amenity.label }}</span>
          </span>
        </div>

        <!-- ===================================================================== -->
        <!-- LINKED DISPATCHES SECTION (Side-scrollable cards with read more btns)  -->
        <!-- ===================================================================== -->
        <div class="linked-dispatches-section">
          <div class="dispatches-section-header">
            <div class="dispatches-header-left">
              <span class="material-symbols-outlined section-icon">history_edu</span>
              <span class="section-title font-mono">LINKED FIELD DISPATCHES</span>
            </div>
            <span class="dispatches-count-pill font-mono">
              {{ availableDispatches.length }} {{ availableDispatches.length === 1 ? 'STORY' : 'STORIES' }}
            </span>
          </div>

          <!-- Side-scrollable dispatch cards track -->
          <div class="dispatches-scroll-track scrollbar-none">
            <article
              v-for="(disp, idx) in availableDispatches"
              :key="disp.id"
              class="dispatch-card"
            >
              <div class="dispatch-card-top">
                <div class="dispatch-card-title-row">
                  <h4 class="dispatch-card-title font-serif">
                    {{ disp.title }}
                  </h4>
                  <span class="dispatch-time-meta font-mono">
                    {{ disp.readTime }}
                  </span>
                </div>

                <p v-if="disp.excerpt" class="dispatch-card-excerpt">
                  {{ disp.excerpt }}
                </p>

                <div class="dispatch-card-meta font-mono">
                  <span class="meta-date">{{ disp.date }}</span>
                </div>
              </div>

              <!-- Dedicated read button inside each card -->
              <div class="dispatch-card-footer">
                <button
                  class="dispatch-read-btn font-mono"
                  type="button"
                  @click.stop="handleReadSpecificDispatch(disp)"
                >
                  <span class="material-symbols-outlined text-[14px]">menu_book</span>
                  <span>READ DISPATCH</span>
                </button>
              </div>
            </article>
          </div>
        </div>

        <!-- Action Buttons Row -->
        <div class="peek-actions-row">
          <button
            class="action-btn trailhead-btn font-mono"
            type="button"
            title="Directions from current location"
            @click="handleNavigate(selectedLocation)"
          >
            <span class="material-symbols-outlined btn-icon">directions</span>
            <span>NAVIGATE TO TRAILHEAD</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Invisible click-outside catcher across viewport when drawer is open */
.drawer-backdrop-catcher {
  position: fixed;
  inset: 0;
  z-index: 38;
  background: transparent;
  pointer-events: auto;
}

.mobile-map-bottom-container {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 40;
  max-width: 600px;
  margin: 0 auto;
  pointer-events: none;
}

/* ========================================================================= */
/* STATE 1 & 2: BOTTOM SEARCH & FILTER TRAY                                  */
/* ========================================================================= */
.bottom-search-tray {
  width: 100%;
  border-top-left-radius: 16px;
  border-top-right-radius: 16px;
  background-color: var(--color-surface);
  border-top: 1.5px solid rgba(115, 120, 116, 0.4);
  box-shadow: 0 -8px 28px rgba(27, 46, 36, 0.22);
  display: flex;
  flex-direction: column;
  pointer-events: auto;
  transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
  overflow: hidden;
  z-index: 45;
  padding-bottom: 58px;
  /* Extends substrate seamlessly behind 68px BottomNav */
}

.bottom-search-tray.collapsed {
  /* Fits search row + pull tab */
}

.bottom-search-tray.expanded {
  box-shadow: 0 -12px 32px rgba(6, 25, 16, 0.3);
}

/* ZONE A: SEARCH & FILTER CONTROLS (Uniform search tab surface) */
.search-filter-section {
  width: 100%;
  padding: 10px 16px 4px;
  background-color: var(--color-floating-bg);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
}

.search-filter-row {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
}

.search-pill {
  flex: 1 1 auto;
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 9999px;
  background-color: var(--color-card-bg);
  border: 1px solid rgba(115, 120, 116, 0.4);
  color: var(--color-on-surface);
  cursor: pointer;
  box-shadow: 0 1px 4px rgba(27, 46, 36, 0.08);
  transition: all 0.2s ease;
}

.search-pill:hover {
  border-color: var(--color-secondary);
}

.search-icon {
  font-size: 16px;
  color: var(--color-secondary);
  flex-shrink: 0;
}

.search-label {
  font-family: var(--font-serif);
  font-size: 12px;
  color: rgba(66, 72, 68, 0.85);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
}

.search-input-active {
  flex: 1 1 auto;
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 5px 10px;
  border-radius: 9999px;
  background-color: var(--color-surface-container-highest);
  border: 1px solid var(--color-secondary);
  transition: all 0.2s ease;
}

.search-field {
  flex: 1;
  min-width: 0;
  background: transparent;
  border: none;
  outline: none;
  font-family: var(--font-mono);
  font-size: 12px;
  color: var(--color-primary);
}

.search-close-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 2px;
  border-radius: 9999px;
  display: flex;
  align-items: center;
  color: var(--color-on-surface-variant);
  flex-shrink: 0;
}

.filter-btn {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  padding: 6px 12px;
  border-radius: 9999px;
  background-color: var(--color-card-bg);
  border: 1px solid rgba(115, 120, 116, 0.4);
  color: var(--color-primary);
  box-shadow: 0 1px 4px rgba(27, 46, 36, 0.08);
  cursor: pointer;
  transition: all 0.2s ease;
}

.filter-btn.compact {
  padding: 6px 10px;
}

.filter-btn:hover {
  border-color: var(--color-secondary);
}

.filter-btn-text {
  font-family: var(--font-mono);
  font-size: 11px;
  text-transform: uppercase;
  font-weight: 600;
  letter-spacing: 0.05em;
  white-space: nowrap;
}

.filter-badge {
  width: 16px;
  height: 16px;
  border-radius: 9999px;
  background-color: var(--color-secondary);
  color: #ffffff;
  font-size: 9px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

/* ========================================================================= */
/* STATE 1: RECENT LOCATIONS ASYMMETRIC 2/3 LEFT LEDGER TAB                  */
/* ========================================================================= */
.recent-locations-tab-shelf {
  width: 100%;
  height: 38px;
  background-color: var(--color-floating-bg);
  /* #faf4e8: A shade lighter behind the tab */
  display: flex;
  align-items: flex-end;
  position: relative;
  box-sizing: border-box;
}

.recent-locations-ledger-tab {
  position: relative;
  width: 66.7%;
  height: 100%;
  padding: 0 14px 0 16px;
  background-color: var(--color-tray-bg);
  /* #f4ecda: ONE shade with content drawer */
  border: none;
  border-top: 1.5px solid rgba(115, 120, 116, 0.45);
  border-right: 1.5px solid rgba(115, 120, 116, 0.45);
  border-top-left-radius: 0;
  /* Merges flush with left side of screen */
  border-bottom-left-radius: 0;
  border-top-right-radius: 14px;
  border-bottom-right-radius: 0;
  border-bottom: none;
  /* Flows seamlessly into content drawer below */
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  user-select: none;
  box-shadow: 2px -2px 6px rgba(27, 46, 36, 0.06);
  transition: filter 0.15s ease;
  z-index: 2;
  margin-bottom: -1px;
}

.recent-locations-ledger-tab:hover {
  filter: brightness(0.98);
}

.tab-main-info {
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
}

.tab-icon {
  font-size: 16px;
  color: var(--color-secondary);
  flex-shrink: 0;
}

.tab-text {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.07em;
  color: var(--color-primary);
  text-transform: uppercase;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.tab-badge {
  font-size: 9px;
  padding: 1px 5px;
  border-radius: 9999px;
  background-color: rgba(27, 46, 36, 0.08);
  border: 1px solid rgba(115, 120, 116, 0.3);
  color: var(--color-primary);
  font-weight: 700;
  flex-shrink: 0;
}

.tab-arrow-wrap {
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

.tab-chevron {
  font-size: 18px;
  color: var(--color-secondary);
}

/* Right 1/3 shoulder baseline strip (lighter shade behind) */
.tab-shelf-right-shoulder {
  flex: 1;
  height: 100%;
  background-color: var(--color-floating-bg);
  /* #faf4e8: A shade lighter behind the tab */
  border-bottom: 1.5px solid rgba(115, 120, 116, 0.45);
  /* Fluid baseline connecting from tab right edge */
  cursor: pointer;
  position: relative;
  z-index: 1;
}

/* ========================================================================= */
/* STATE 2: RECENT LOCATIONS EXPANDED DRAWER CONTENT                         */
/* ========================================================================= */
.recent-locations-drawer-content {
  width: 100%;
  display: flex;
  flex-direction: column;
  padding-bottom: 24px;
  background-color: var(--color-tray-bg);
  /* #f4ecda: ONE shade with tab */
}

.locations-carousel {
  display: flex;
  align-items: stretch;
  gap: 12px;
  overflow-x: auto;
  padding: 12px 16px 14px;
  scroll-snap-type: x mandatory;
  scrollbar-width: none;
  -webkit-overflow-scrolling: touch;
}

.locations-carousel::-webkit-scrollbar {
  display: none;
}

.empty-state {
  padding: 24px 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  gap: 6px;
  color: var(--color-on-surface-variant);
}

.empty-icon {
  font-size: 28px;
  color: var(--color-lichen-slate);
}

.empty-title {
  font-size: 14px;
  color: var(--color-primary);
}

.empty-desc {
  font-size: 10px;
  color: rgba(66, 72, 68, 0.7);
}

/* ========================================================================= */
/* STATE 3: THE LOCATION PEEK CARD                                           */
/* ========================================================================= */
.location-peek-card {
  width: 100%;
  border-top-left-radius: 16px;
  border-top-right-radius: 16px;
  padding: 12px 16px 74px;
  background-color: var(--color-surface-container-lowest);
  border-top: 1px solid rgba(115, 120, 116, 0.35);
  box-shadow: 0 -8px 24px rgba(6, 25, 16, 0.22);
  display: flex;
  flex-direction: column;
  gap: 10px;
  pointer-events: auto;
  animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes slideUp {
  from {
    transform: translateY(100%);
    opacity: 0;
  }

  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.peek-header-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.tag-badges-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.location-tag {
  font-size: 10px;
  color: var(--color-secondary);
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.visited-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 9px;
  font-weight: 600;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.visited-badge.visited {
  background-color: var(--color-primary-container);
  color: #ffffff;
  border: 1px solid rgba(27, 46, 36, 0.4);
}

.visited-badge.unvisited {
  background-color: var(--color-surface-container);
  color: var(--color-on-surface-variant);
  border: 1px solid rgba(194, 200, 194, 0.5);
}

.check-icon {
  font-size: 11px;
}

.peek-close-btn {
  width: 26px;
  height: 26px;
  border-radius: 9999px;
  background-color: var(--color-surface-container);
  border: 1px solid rgba(115, 120, 116, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-on-surface);
  cursor: pointer;
  transition: all 0.15s ease;
}

.peek-close-btn:hover {
  background-color: var(--color-secondary);
  color: #ffffff;
  border-color: var(--color-secondary);
}

.title-meta-group {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.location-title {
  font-size: 20px;
  line-height: 1.25;
  color: var(--color-primary);
  font-weight: 500;
  letter-spacing: -0.01em;
  margin: 0;
}

.location-coords-row {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 10px;
  color: var(--color-lichen-slate);
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.coords-stamp {
  color: var(--color-primary);
  font-weight: 600;
}

.coords-divider {
  color: rgba(115, 120, 116, 0.4);
}

.elevation-stamp {
  color: var(--color-secondary);
  font-weight: 600;
}

/* AMENITIES */
.amenities-row {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}

.amenity-widget {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 6px;
  border-radius: 4px;
  background-color: var(--color-surface-container);
  border: 1px solid rgba(194, 200, 194, 0.5);
  color: var(--color-primary);
  font-size: 10px;
  font-weight: 500;
  line-height: 1;
}

.widget-icon {
  font-size: 12px;
  color: var(--color-secondary);
}

/* ========================================================================= */
/* LINKED DISPATCHES SECTION (Side-scrollable cards with read more btns)      */
/* ========================================================================= */
.linked-dispatches-section {
  padding: 10px;
  border-radius: 10px;
  background-color: var(--color-surface-container-low);
  border: 1px solid rgba(115, 120, 116, 0.22);
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.dispatches-section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.dispatches-header-left {
  display: flex;
  align-items: center;
  gap: 5px;
}

.section-icon {
  font-size: 14px;
  color: var(--color-secondary);
}

.section-title {
  font-size: 9.5px;
  font-weight: 700;
  letter-spacing: 0.08em;
  color: var(--color-primary);
  text-transform: uppercase;
}

.dispatches-count-pill {
  font-size: 8.5px;
  font-weight: 600;
  letter-spacing: 0.06em;
  color: var(--color-secondary);
  background-color: var(--color-surface-container);
  padding: 1px 6px;
  border-radius: 4px;
  border: 1px solid rgba(115, 120, 116, 0.2);
}

/* Side Scrollable Cards Track */
.dispatches-scroll-track {
  display: flex;
  gap: 10px;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  scroll-snap-type: x mandatory;
  padding: 2px 2px 4px;
}

.dispatch-card {
  flex: 0 0 240px;
  width: 240px;
  min-width: 240px;
  scroll-snap-align: start;
  background-color: #faf4e8;
  border: 1px solid rgba(115, 120, 116, 0.28);
  border-radius: 8px;
  padding: 10px 12px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  box-shadow: 0 1px 4px rgba(27, 46, 36, 0.06);
  box-sizing: border-box;
}

.dispatches-scroll-track:has(> .dispatch-card:only-child) .dispatch-card {
  flex: 1 1 auto;
  width: 100%;
  min-width: 0;
}

.dispatch-card-top {
  display: flex;
  flex-direction: column;
  gap: 3px;
  margin-bottom: 8px;
}

.dispatch-card-title-row {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 8px;
}

.dispatch-time-meta {
  font-size: 8.5px;
  color: var(--color-lichen-slate);
  font-weight: 600;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  white-space: nowrap;
  flex-shrink: 0;
  opacity: 0.85;
}

.dispatch-card-title {
  font-size: 13.5px;
  line-height: 1.3;
  color: var(--color-primary);
  font-weight: 500;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.dispatch-card-excerpt {
  font-family: var(--font-serif);
  font-size: 10.5px;
  line-height: 1.4;
  color: var(--color-on-surface-variant);
  margin: 3px 0 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  opacity: 0.85;
}

.dispatch-card-meta {
  font-size: 8.5px;
  color: var(--color-lichen-slate);
  text-transform: uppercase;
  letter-spacing: 0.04em;
  margin-top: 4px;
}

.dispatch-card-footer {
  margin-top: auto;
}

.dispatch-read-btn {
  width: 100%;
  height: 30px;
  border-radius: 6px;
  background-color: var(--color-primary);
  color: #faf4e8;
  border: 1px solid rgba(27, 46, 36, 0.8);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  box-shadow: 0 1px 3px rgba(27, 46, 36, 0.12);
  cursor: pointer;
  transition: all 0.15s ease;
}

.dispatch-read-btn:hover {
  background-color: #264032;
  box-shadow: 0 2px 6px rgba(27, 46, 36, 0.2);
}

.dispatch-read-btn:active {
  transform: scale(0.98);
}

/* ACTION BUTTONS */
.peek-actions-row {
  display: flex;
  align-items: center;
  padding-top: 2px;
}

.trailhead-btn {
  width: 100%;
  height: 38px;
  border-radius: 8px;
  background-color: var(--color-surface-container-high);
  color: var(--color-primary);
  border: 1.5px solid rgba(115, 120, 116, 0.4);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  cursor: pointer;
  transition: all 0.15s ease;
}

.trailhead-btn:hover {
  background-color: #ede2cd;
  border-color: var(--color-primary);
}

.trailhead-btn:active {
  transform: scale(0.99);
}

.btn-icon {
  font-size: 14px;
}

/* TRANSITIONS */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
