<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { mockAreas } from '~/data/mockNordicTrail'

export interface FilterState {
  category: string // 'ALL' | 'SHELTER' | 'HEARTH' | 'SPRINGHEAD' | 'VIEWPOINT'
  area: string // 'ALL' | 'pirkanmaa' | 'nordmarka'
  visitStatus: 'ALL' | 'VISITED' | 'UNVISITED'
  maxDistanceKm: number // 0 = any, 2, 5, 10
  amenities: string[]
}

interface Props {
  isOpen: boolean
  activeFilters: FilterState
  matchingCount: number
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'apply', filters: FilterState): void
  (e: 'reset'): void
}>()

const localCategory = ref(props.activeFilters.category)
const localArea = ref(props.activeFilters.area || 'ALL')
const localVisitStatus = ref(props.activeFilters.visitStatus)
const localMaxDistance = ref(props.activeFilters.maxDistanceKm)
const localAmenities = ref<string[]>([...props.activeFilters.amenities])

// Keep local state in sync when modal opens
watch(
  () => props.isOpen,
  (open) => {
    if (open) {
      localCategory.value = props.activeFilters.category
      localArea.value = props.activeFilters.area || 'ALL'
      localVisitStatus.value = props.activeFilters.visitStatus
      localMaxDistance.value = props.activeFilters.maxDistanceKm
      localAmenities.value = [...props.activeFilters.amenities]
    }
  }
)

const categories = [
  { id: 'ALL', label: 'All Locations', icon: 'explore' },
  { id: 'SHELTER', label: 'Shelters', icon: 'cabin' },
  { id: 'HEARTH', label: 'Hearths', icon: 'outdoor_grill' },
  { id: 'SPRINGHEAD', label: 'Springs', icon: 'water_drop' },
  { id: 'VIEWPOINT', label: 'Viewpoints', icon: 'visibility' }
]

const areas = computed(() => [
  { id: 'ALL', label: 'All Areas', country: '', icon: 'public' },
  ...mockAreas.map(a => ({
    id: a.id,
    label: a.name,
    country: a.country,
    icon: a.country === 'Finland' ? 'terrain' : 'forest'
  }))
])

const visitStatuses: Array<{ id: 'ALL' | 'VISITED' | 'UNVISITED'; label: string; icon: string }> = [
  { id: 'ALL', label: 'All Stops', icon: 'all_inclusive' },
  { id: 'VISITED', label: 'Visited', icon: 'check_circle' },
  { id: 'UNVISITED', label: 'Unvisited', icon: 'radio_button_unchecked' }
]

const distances = [
  { value: 0, label: 'Any' },
  { value: 2, label: '< 2 km' },
  { value: 5, label: '< 5 km' },
  { value: 10, label: '< 10 km' }
]

const availableAmenities = [
  { id: 'Water', label: 'Potable Water', icon: 'water_drop' },
  { id: 'Hearth', label: 'Granite Hearth', icon: 'outdoor_grill' },
  { id: 'Shelter', label: 'Timber Shelter', icon: 'cabin' },
  { id: 'Wood', label: 'Dry Firewood', icon: 'forest' },
  { id: 'Parking', label: 'Parking / Trailhead', icon: 'directions_car' }
]

const hasActiveFilters = computed(() => {
  return (
    localCategory.value !== 'ALL' ||
    localArea.value !== 'ALL' ||
    localVisitStatus.value !== 'ALL' ||
    localMaxDistance.value !== 0 ||
    localAmenities.value.length > 0
  )
})

function toggleAmenity(id: string) {
  const idx = localAmenities.value.indexOf(id)
  if (idx > -1) {
    localAmenities.value.splice(idx, 1)
  } else {
    localAmenities.value.push(id)
  }
}

function handleReset() {
  localCategory.value = 'ALL'
  localArea.value = 'ALL'
  localVisitStatus.value = 'ALL'
  localMaxDistance.value = 0
  localAmenities.value = []
  emit('reset')
}

function handleApply() {
  emit('apply', {
    category: localCategory.value,
    area: localArea.value,
    visitStatus: localVisitStatus.value,
    maxDistanceKm: localMaxDistance.value,
    amenities: [...localAmenities.value]
  })
  emit('close')
}
</script>

<template>
  <Teleport to="body">
    <Transition name="modal-slide">
      <div
        v-if="isOpen"
        class="filter-modal-overlay"
      >
        <!-- Backdrop Dimmer with subtle blur -->
        <div
          class="filter-backdrop"
          @click="emit('close')"
        />

      <!-- Sheet Container -->
      <div class="filter-modal-sheet">
        <!-- Top Archival Pull Notch -->
        <div class="sheet-drag-handle-wrapper">
          <div class="sheet-drag-handle" />
        </div>

        <!-- Header -->
        <div class="sheet-header">
          <div class="flex items-center gap-2.5">
            <span class="header-badge-icon">
              <span class="material-symbols-outlined text-[16px]">tune</span>
            </span>
            <div>
              <h2 class="font-serif text-[18px] font-normal text-primary tracking-tight leading-tight">
                Field Filters & Telemetry
              </h2>
              <p class="font-mono text-[9px] uppercase tracking-wider text-lichen-slate">
                Nordmarka Waypoint Ledger
              </p>
            </div>
          </div>

          <button
            aria-label="Close Filters"
            class="close-btn"
            type="button"
            @click="emit('close')"
          >
            <span class="material-symbols-outlined text-[16px]">close</span>
          </button>
        </div>

        <!-- Filter Controls Body -->
        <div class="sheet-body scrollbar-none">
          <!-- 1. Quick Search / Category Pills -->
          <section class="filter-section">
            <div class="section-header font-mono">
              <span class="section-dot" />
              <span class="section-title">Waypoint Category</span>
              <span class="section-line" />
            </div>

            <div class="flex flex-wrap gap-2">
              <button
                v-for="cat in categories"
                :key="cat.id"
                :class="[
                  'category-pill font-mono',
                  localCategory === cat.id ? 'active' : ''
                ]"
                type="button"
                @click="localCategory = cat.id"
              >
                <span
                  v-if="localCategory === cat.id"
                  class="active-dot"
                />
                <span
                  class="material-symbols-outlined text-[14px]"
                  :class="localCategory === cat.id ? 'text-secondary' : 'text-lichen-slate'"
                >
                  {{ cat.icon }}
                </span>
                <span>{{ cat.label }}</span>
              </button>
            </div>
          </section>

          <!-- 2. Expedition Area (Regional Wilderness Territory) -->
          <section class="filter-section">
            <div class="section-header font-mono">
              <span class="section-dot" />
              <span class="section-title">Expedition Area</span>
              <span class="section-line" />
            </div>

            <div class="flex flex-wrap gap-2">
              <button
                v-for="area in areas"
                :key="area.id"
                :class="[
                  'category-pill font-mono',
                  localArea === area.id ? 'active' : ''
                ]"
                type="button"
                @click="localArea = area.id"
              >
                <span
                  v-if="localArea === area.id"
                  class="active-dot"
                />
                <span
                  class="material-symbols-outlined text-[14px]"
                  :class="localArea === area.id ? 'text-secondary' : 'text-lichen-slate'"
                >
                  {{ area.icon }}
                </span>
                <span>{{ area.label }}</span>
                <span
                  v-if="area.country"
                  class="area-badge-chip"
                >
                  {{ area.country }}
                </span>
              </button>
            </div>
          </section>

          <!-- 3. Visit Status (Refined Segmented Ledger Rail) -->
          <section class="filter-section">
            <div class="section-header font-mono">
              <span class="section-dot" />
              <span class="section-title">Expedition Visit Status</span>
              <span class="section-line" />
            </div>

            <div class="segmented-track">
              <button
                v-for="status in visitStatuses"
                :key="status.id"
                :class="[
                  'segmented-option font-mono',
                  localVisitStatus === status.id ? 'active' : ''
                ]"
                type="button"
                @click="localVisitStatus = status.id"
              >
                <span
                  class="material-symbols-outlined text-[14px]"
                  :class="localVisitStatus === status.id ? 'text-secondary' : 'text-lichen-slate'"
                >
                  {{ status.icon }}
                </span>
                <span>{{ status.label }}</span>
              </button>
            </div>
          </section>

          <!-- 3. Maximum Distance Radius (Calibrated Range Strip) -->
          <section class="filter-section">
            <div class="section-header font-mono">
              <span class="section-dot" />
              <span class="section-title">Approach Radius</span>
              <span class="section-line" />
            </div>

            <div class="segmented-track">
              <button
                v-for="dist in distances"
                :key="dist.value"
                :class="[
                  'segmented-option font-mono',
                  localMaxDistance === dist.value ? 'active' : ''
                ]"
                type="button"
                @click="localMaxDistance = dist.value"
              >
                <span>{{ dist.label }}</span>
              </button>
            </div>
          </section>

          <!-- 4. Required Provisions & Amenities -->
          <section class="filter-section">
            <div class="section-header font-mono">
              <span class="section-dot" />
              <span class="section-title">Required Provisions & Amenities</span>
              <span class="section-line" />
            </div>

            <div class="grid grid-cols-2 gap-2">
              <button
                v-for="amenity in availableAmenities"
                :key="amenity.id"
                :class="[
                  'amenity-card font-mono',
                  localAmenities.includes(amenity.id) ? 'active' : ''
                ]"
                type="button"
                @click="toggleAmenity(amenity.id)"
              >
                <div class="w-full flex items-center gap-1.5 min-w-0 overflow-hidden">
                  <span
                    v-if="localAmenities.includes(amenity.id)"
                    class="active-dot shrink-0"
                  />
                  <span
                    class="material-symbols-outlined text-[15px] shrink-0"
                    :class="localAmenities.includes(amenity.id) ? 'text-secondary' : 'text-lichen-slate'"
                  >
                    {{ amenity.icon }}
                  </span>
                  <span class="text-[9.5px] tracking-tight font-medium">{{ amenity.label }}</span>
                </div>
              </button>
            </div>
          </section>
        </div>

        <!-- Sticky Submit Footer (Elevated above all navigation) -->
        <div class="sheet-footer">
          <!-- Reset Button (1/4 width, greyed out when no filters applied) -->
          <button
            class="reset-btn font-mono"
            type="button"
            :disabled="!hasActiveFilters"
            title="Reset all filters to default"
            @click="handleReset"
          >
            <span class="material-symbols-outlined text-[15px]">restart_alt</span>
            <span>RESET</span>
          </button>

          <!-- Apply Button (3/4 width) -->
          <button
            class="apply-btn font-mono"
            type="button"
            @click="handleApply"
          >
            <span class="material-symbols-outlined text-[16px] text-secondary">explore</span>
            <span>APPLY // {{ matchingCount }} FOUND</span>
          </button>
        </div>
      </div>
    </div>
  </Transition>
  </Teleport>
</template>

<style scoped>
.filter-modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 100;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  align-items: center;
  pointer-events: none;
}

.filter-backdrop {
  position: fixed;
  inset: 0;
  background-color: rgba(18, 30, 24, 0.45);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  pointer-events: auto;
}

.filter-modal-sheet {
  position: relative;
  width: 100%;
  max-width: 540px;
  max-height: 85vh;
  background-color: #faf4e8;
  border-top-left-radius: 20px;
  border-top-right-radius: 20px;
  border-top: 1.5px solid rgba(115, 120, 116, 0.4);
  border-left: 1px solid rgba(115, 120, 116, 0.3);
  border-right: 1px solid rgba(115, 120, 116, 0.3);
  box-shadow: 0 -16px 40px rgba(18, 30, 24, 0.28);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  pointer-events: auto;
  z-index: 1;
}

.sheet-drag-handle-wrapper {
  width: 100%;
  display: flex;
  justify-content: center;
  padding-top: 8px;
  padding-bottom: 2px;
  background-color: #faf4e8;
}

.sheet-drag-handle {
  width: 36px;
  height: 4px;
  border-radius: 9999px;
  background-color: rgba(115, 120, 116, 0.35);
}

.sheet-header {
  width: 100%;
  padding: 8px 18px 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid rgba(115, 120, 116, 0.22);
  background-color: #faf4e8;
  flex-shrink: 0;
}

.header-badge-icon {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  background-color: rgba(217, 83, 30, 0.1);
  color: var(--color-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(217, 83, 30, 0.25);
  flex-shrink: 0;
}

.close-btn {
  width: 28px;
  height: 28px;
  border-radius: 9999px;
  background-color: rgba(237, 228, 210, 0.6);
  border: 1px solid rgba(115, 120, 116, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-lichen-slate);
  cursor: pointer;
  transition: all 0.15s ease;
}

.close-btn:hover {
  background-color: #ede4d2;
  color: var(--color-primary);
  border-color: rgba(115, 120, 116, 0.5);
}

.close-btn:active {
  transform: scale(0.95);
}

.sheet-body {
  overflow-y: auto;
  padding: 16px 18px 20px;
  display: flex;
  flex-direction: column;
  gap: 18px;
  flex: 1;
}

.filter-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 10px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--color-lichen-slate);
  font-weight: 600;
}

.section-dot {
  width: 4px;
  height: 4px;
  border-radius: 9999px;
  background-color: var(--color-secondary);
  opacity: 0.85;
}

.section-line {
  flex: 1;
  height: 1px;
  background-color: rgba(115, 120, 116, 0.2);
}

/* 1. Category Pills */
.category-pill {
  padding: 6px 12px;
  border-radius: 9999px;
  font-size: 10.5px;
  font-weight: 500;
  letter-spacing: 0.04em;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  background-color: #f4ecda;
  border: 1px solid rgba(115, 120, 116, 0.3);
  color: var(--color-on-surface-variant);
  cursor: pointer;
  transition: all 0.15s ease;
  user-select: none;
}

.category-pill:hover:not(.active) {
  background-color: #ede2cd;
  border-color: rgba(115, 120, 116, 0.5);
  color: var(--color-primary);
}

.category-pill.active {
  background-color: var(--color-primary);
  color: #fef9ed;
  border-color: var(--color-primary);
  box-shadow: 0 2px 6px rgba(27, 46, 36, 0.18);
  font-weight: 600;
}

.active-dot {
  width: 5px;
  height: 5px;
  border-radius: 9999px;
  background-color: var(--color-secondary);
}

.area-badge-chip {
  font-size: 8.5px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 1px 4px;
  border-radius: 3px;
  background-color: rgba(115, 120, 116, 0.15);
  margin-left: 2px;
}

.category-pill.active .area-badge-chip {
  background-color: rgba(255, 255, 255, 0.2);
  color: #fef9ed;
}

/* 2 & 3. Segmented Controls */
.segmented-track {
  background-color: #ede2cd;
  border: 1px solid rgba(115, 120, 116, 0.3);
  border-radius: 10px;
  padding: 3px;
  display: flex;
  gap: 3px;
}

.segmented-option {
  flex: 1 1 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  padding: 8px 4px;
  border-radius: 7px;
  border: 1px solid transparent;
  background-color: transparent;
  color: var(--color-lichen-slate);
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  cursor: pointer;
  transition: all 0.18s ease;
  user-select: none;
}

.segmented-option:hover:not(.active) {
  color: var(--color-primary);
  background-color: rgba(255, 255, 255, 0.35);
}

.segmented-option.active {
  background-color: #ffffff;
  color: var(--color-primary);
  border-color: rgba(115, 120, 116, 0.25);
  box-shadow: 0 1px 4px rgba(27, 46, 36, 0.1);
  font-weight: 700;
}

/* 4. Amenities Cards */
.amenity-card {
  box-sizing: border-box;
  width: 100%;
  padding: 7px 8px;
  border-radius: 8px;
  background-color: #f4ecda;
  border: 1px solid rgba(115, 120, 116, 0.3);
  display: flex;
  align-items: center;
  cursor: pointer;
  transition: all 0.15s ease;
  user-select: none;
  color: var(--color-on-surface-variant);
  font-weight: 500;
}

.amenity-card:hover:not(.active) {
  background-color: #ede2cd;
  border-color: rgba(115, 120, 116, 0.5);
  color: var(--color-primary);
}

.amenity-card.active {
  background-color: #ffffff;
  border-color: var(--color-primary);
  color: var(--color-primary);
  box-shadow: 0 1px 4px rgba(27, 46, 36, 0.08);
  font-weight: 700;
}

/* Sticky Submit Footer */
.sheet-footer {
  padding: 12px 18px;
  padding-bottom: max(16px, env(safe-area-inset-bottom));
  border-top: 1px solid rgba(115, 120, 116, 0.22);
  background: rgba(250, 244, 232, 0.98);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.reset-btn {
  flex: 1 1 0;
  height: 42px;
  border-radius: 8px;
  border: 1px solid rgba(115, 120, 116, 0.35);
  background-color: #f4ecda;
  color: var(--color-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  font-size: 10.5px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  cursor: pointer;
  transition: all 0.15s ease;
  user-select: none;
}

.reset-btn:hover:not(:disabled) {
  background-color: #ede2cd;
  border-color: rgba(115, 120, 116, 0.5);
  color: var(--color-secondary);
}

.reset-btn:active:not(:disabled) {
  transform: scale(0.98);
}

.reset-btn:disabled {
  background-color: rgba(115, 120, 116, 0.08);
  border-color: rgba(115, 120, 116, 0.18);
  color: rgba(115, 120, 116, 0.4);
  cursor: not-allowed;
  opacity: 0.6;
}

.apply-btn {
  flex: 3 1 0;
  height: 42px;
  border-radius: 8px;
  background-color: var(--color-primary);
  color: #faf4e8;
  border: 1px solid rgba(27, 46, 36, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  box-shadow: 0 2px 8px rgba(27, 46, 36, 0.16);
  cursor: pointer;
  transition: all 0.15s ease;
  white-space: nowrap;
}

.apply-btn:hover {
  background-color: #264032;
  box-shadow: 0 4px 12px rgba(27, 46, 36, 0.22);
}

.apply-btn:active {
  transform: scale(0.99);
}

/* Transitions */
.modal-slide-enter-active,
.modal-slide-leave-active {
  transition: transform 0.28s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.22s ease;
}

.modal-slide-enter-from,
.modal-slide-leave-to {
  transform: translateY(100%);
  opacity: 0;
}
</style>
