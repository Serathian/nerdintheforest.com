<script setup lang="ts">
import { ref } from 'vue'

interface Waypoint {
  id: string
  title: string
  region: string
  lat: number
  lng: number
  elevation?: string
  distance?: string
  thumbnailUrl?: string
}

defineProps<{
  waypoints: Waypoint[]
  selectedId?: string
}>()

const emit = defineEmits<{
  (e: 'select', id: string): void
  (e: 'open-filters'): void
  (e: 'search', query: string): void
}>()

const isExpanded = ref(false)
const searchQuery = ref('')

function toggleExpand() {
  isExpanded.value = !isExpanded.value
}

function handleSearch(query: string) {
  emit('search', query)
}
</script>

<template>
  <div :class="['mobile-peeking-tray', { expanded: isExpanded }]">
    <!-- Sticky Search & Filter Action Bar -->
    <div class="sticky-action-bar">
      <div class="search-bar-row">
        <SearchInput
          v-model="searchQuery"
          placeholder="Search trails or coordinates..."
          @search="handleSearch"
        />
        <BaseButton variant="secondary" size="md" @click="emit('open-filters')">
          ⚙ FILTERS
        </BaseButton>
      </div>

      <!-- Drag Handle & Tray Header -->
      <button
        type="button"
        class="tray-handle-bar"
        :aria-label="isExpanded ? 'Collapse waypoints tray' : 'Expand waypoints tray'"
        @click="toggleExpand"
      >
        <div class="drag-handle" />
        <div class="tray-header-content">
          <div class="header-left">
            <span class="tray-title font-mono">Nordic Atlas Waypoints</span>
            <span class="tray-badge font-mono">{{ waypoints.length }} STOPS</span>
          </div>

          <span class="chevron" :class="{ upside: isExpanded }">▲</span>
        </div>
      </button>

      <!-- Quick Filter Chips -->
      <div class="tray-quick-filters">
        <BeaconChip label="ALL TRAILS" active />
        <BeaconChip label="SUMMITS" />
        <BeaconChip label="SHELTERS" />
        <BeaconChip label="WATERFALLS" />
      </div>
    </div>

    <DashedDivider />

    <!-- Waypoints List (Scrollable when expanded) -->
    <div class="tray-content">
      <div class="waypoints-list">
        <LocationCard
          v-for="wp in waypoints"
          :key="wp.id"
          :id="wp.id"
          :title="wp.title"
          :region="wp.region"
          :lat="wp.lat"
          :lng="wp.lng"
          :elevation="wp.elevation"
          :distance="wp.distance"
          :thumbnail-url="wp.thumbnailUrl"
          :active="wp.id === selectedId"
          @select="(id) => emit('select', id)"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.mobile-peeking-tray {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: var(--color-surface-container-high);
  border-top: 1px solid var(--color-outline-variant);
  border-top-left-radius: var(--radius-lg);
  border-top-right-radius: var(--radius-lg);
  box-shadow: 0 -6px 24px rgba(27, 46, 36, 0.16);
  z-index: 100;
  height: 80vh;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  padding: 12px var(--space-md) var(--space-md) var(--space-md);
  /* Collapsed peeking state: showing sticky search bar & header (~145px visible) */
  transform: translateY(calc(100% - 145px));
  transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1);
}

.mobile-peeking-tray.expanded {
  transform: translateY(0);
}

.sticky-action-bar {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.search-bar-row {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
}

.tray-handle-bar {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 4px 0;
  cursor: pointer;
  user-select: none;
  background: none;
  border: none;
  width: 100%;
  text-align: left;
}

.drag-handle {
  width: 36px;
  height: 4px;
  border-radius: 2px;
  background-color: var(--color-lichen-slate);
  opacity: 0.6;
  margin-bottom: 6px;
}

.tray-header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}

.header-left {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
}

.tray-title {
  font-size: 11px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--color-pine-primary);
  font-weight: 500;
}

.tray-badge {
  font-size: 10px;
  letter-spacing: 0.08em;
  color: var(--color-beacon-secondary);
  background-color: var(--color-surface-container-highest);
  padding: 2px 6px;
  border-radius: var(--radius-sm);
}

.chevron {
  color: var(--color-pine-primary);
  font-size: 10px;
  display: inline-block;
  transition: transform 0.3s ease;
}

.chevron.upside {
  transform: rotate(180deg);
}

.tray-quick-filters {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  overflow-x: auto;
  padding-bottom: 2px;
  -webkit-overflow-scrolling: touch;
}

.tray-quick-filters::-webkit-scrollbar {
  display: none;
}

.tray-content {
  overflow-y: auto;
  flex: 1;
}

.waypoints-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
  padding-bottom: var(--space-md);
}

/* Responsive Desktop Overrides */
@media (min-width: 1024px) {
  .mobile-peeking-tray {
    position: relative;
    height: auto;
    max-height: 100%;
    transform: none !important;
    border-radius: var(--radius-base);
    box-shadow: none;
    border: 1px solid var(--color-outline-variant);
  }

  .chevron {
    display: none;
  }
}
</style>
