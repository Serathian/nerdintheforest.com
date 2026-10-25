<script setup lang="ts">
import { computed } from 'vue'
import type { Dispatch } from '~/types/models'
import { haversineKm, formatDistance } from '~/utils/geo'

interface WaypointItem {
  id: string
  slug: string
  title: string
  elevation?: number
  category?: string
  latitude?: number
  longitude?: number
  order: number
}

interface Props {
  dispatch: Dispatch
  waypoints: WaypointItem[]
  selectedLocationId?: string
  selectedLegIndex?: number | null
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'select-waypoint', id: string): void
  (e: 'select-leg', index: number): void
  (e: 'clear-leg'): void
  (e: 'exit'): void
  (e: 'read-dispatch', slug: string): void
}>()

interface LegItem {
  index: number
  letter: string
  distanceKm: number
  distanceFormatted: string
  fromId: string
  toId: string
}

const legs = computed<LegItem[]>(() => {
  const list: LegItem[] = []
  if (!props.waypoints || props.waypoints.length < 2) return list

  for (let i = 0; i < props.waypoints.length - 1; i++) {
    const from = props.waypoints[i]
    const to = props.waypoints[i + 1]
    let distKm = 0
    if (from.longitude != null && from.latitude != null && to.longitude != null && to.latitude != null) {
      distKm = haversineKm([from.longitude, from.latitude], [to.longitude, to.latitude])
    }
    list.push({
      index: i,
      letter: String.fromCharCode(65 + i), // 0 -> 'A', 1 -> 'B', 2 -> 'C', etc.
      distanceKm: distKm,
      distanceFormatted: formatDistance(distKm),
      fromId: from.id,
      toId: to.id
    })
  }
  return list
})

function handleLegClick(index: number) {
  if (props.selectedLegIndex === index) {
    emit('clear-leg')
  } else {
    emit('select-leg', index)
  }
}

function getCategoryIcon(cat?: string): string {
  const c = (cat || '').toLowerCase()
  if (c.includes('shelter')) return 'cabin'
  if (c.includes('hearth') || c.includes('fire')) return 'outdoor_grill'
  if (c.includes('spring') || c.includes('water')) return 'water_drop'
  if (c.includes('view') || c.includes('vista') || c.includes('summit')) return 'landscape'
  if (c.includes('trailhead') || c.includes('parking')) return 'directions_car'
  return 'explore'
}
</script>

<template>
  <div class="dispatch-inspection-peek">
    <!-- Dispatch Title -->
    <div class="title-meta-group">
      <h2 class="dispatch-title font-serif">
        {{ dispatch.title }}
      </h2>
    </div>

    <!-- Sequential Timeline Stepper Track -->
    <div class="timeline-stepper-track scrollbar-none">
      <div class="timeline-row">
        <template v-for="(wp, idx) in waypoints" :key="wp.id">
          <!-- Minimified Waypoint Chip -->
          <div :class="[
            'timeline-step-chip font-mono',
            {
              'is-selected': selectedLocationId === wp.id || selectedLocationId === wp.slug,
              'is-leg-start': selectedLegIndex === idx,
              'is-leg-end': selectedLegIndex !== null && selectedLegIndex !== undefined && idx === selectedLegIndex + 1
            }
          ]" role="button" :title="`Focus ${wp.title}`" @click="emit('select-waypoint', wp.id)">
            <!-- Top Row: Sequence Number, Category Icon, Elevation with Symbol -->
            <div class="step-chip-top">
              <div class="step-chip-meta">
                <span class="step-order-badge">
                  {{ wp.order }}
                </span>
                <span class="material-symbols-outlined step-cat-icon">
                  {{ getCategoryIcon(wp.category) }}
                </span>
              </div>
              <span v-if="wp.elevation" class="step-elev" title="Elevation">
                <span class="material-symbols-outlined step-elev-icon">terrain</span>
                <span>{{ wp.elevation }}m</span>
              </span>
            </div>

            <!-- Bottom Row: Location Name -->
            <span class="step-title font-serif">
              {{ wp.title }}
            </span>
          </div>

          <!-- Minimal Leg Connector Line between waypoints -->
          <div v-if="idx < waypoints.length - 1 && legs[idx]"
            :class="['timeline-leg-connector font-mono', { 'is-active': selectedLegIndex === idx }]" role="button"
            tabindex="0"
            :aria-label="`Inspect leg ${legs[idx].letter}: ${legs[idx].distanceFormatted}`"
            :title="`Focus Leg ${legs[idx].letter} (${legs[idx].distanceFormatted})`"
            @click="handleLegClick(idx)"
            @keydown.enter.prevent="handleLegClick(idx)"
            @keydown.space.prevent="handleLegClick(idx)">
            <span class="leg-connector-line" />
            <span class="leg-dist-pill">
              <span class="leg-dist-text">{{ legs[idx].distanceFormatted }}</span>
            </span>
          </div>
        </template>
      </div>
    </div>

    <!-- Actions Row -->
    <div class="peek-actions-row font-mono">
      <NuxtLink :to="`/dispatches/${dispatch.slug || dispatch.id}`" class="action-btn read-dispatch-btn">
        <span>READ FULL DISPATCH</span>
        <span class="material-symbols-outlined text-[14px]">menu_book</span>
      </NuxtLink>

      <button class="action-btn exit-inspection-btn" type="button" @click="emit('exit')">
        <span>✕ EXIT ROUTE</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.dispatch-inspection-peek {
  width: 100%;
  padding: 12px 16px 8px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  box-sizing: border-box;
}

/* HEADER */
.peek-header-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.tag-badges-group {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
}

.inspection-beacon-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background-color: rgba(217, 83, 30, 0.12);
  color: var(--color-secondary, #d9531e);
  border: 1px solid rgba(217, 83, 30, 0.4);
  border-radius: 4px;
  padding: 3px 8px;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.08em;
}

.beacon-dot {
  width: 6px;
  height: 6px;
  border-radius: 9999px;
  background-color: var(--color-secondary, #d9531e);
  animation: beacon-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes beacon-pulse {

  0%,
  100% {
    opacity: 1;
    transform: scale(1);
  }

  50% {
    opacity: 0.3;
    transform: scale(0.85);
  }
}

.date-badge,
.weather-badge {
  background-color: var(--color-surface-container, #f3ede1);
  color: var(--color-tertiary, #526056);
  border: 1px solid var(--color-outline-variant, #c2c8c2);
  border-radius: 4px;
  padding: 3px 8px;
  font-size: 10px;
  font-weight: 600;
}

.peek-close-btn {
  background: transparent;
  border: 1px solid var(--color-outline-variant, #c2c8c2);
  border-radius: 50%;
  width: 26px;
  height: 26px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--color-on-surface-variant, #424844);
  cursor: pointer;
  transition: all 0.15s ease;
}

.peek-close-btn:hover {
  background-color: var(--color-secondary, #d9531e);
  color: #ffffff;
  border-color: var(--color-secondary, #d9531e);
}

/* TITLE & META */
.title-meta-group {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.dispatch-title {
  font-size: 19px;
  line-height: 1.25;
  color: var(--color-on-surface, #1d1c14);
  margin: 0;
}

.dispatch-route-meta {
  font-size: 9.5px;
  letter-spacing: 0.06em;
  color: var(--color-tertiary, #526056);
}

/* TIMELINE STEPPER */
.timeline-stepper-track {
  width: 100%;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  padding: 4px 0 6px;
}

.timeline-row {
  display: flex;
  align-items: center;
  gap: 0;
  min-width: min-content;
}

/* COMPACT SHRUNK WAYPOINT CARD */
.timeline-step-chip {
  position: relative;
  background-color: var(--color-surface-container-low, #f8f3e7);
  border: 1px solid var(--color-outline-variant, #c2c8c2);
  border-radius: 6px;
  padding: 5px 8px;
  display: flex;
  flex-direction: column;
  gap: 3px;
  cursor: pointer;
  transition: all 0.16s ease;
  user-select: none;
  box-sizing: border-box;
  width: 124px;
  min-width: 112px;
  max-width: 136px;
  flex-shrink: 0;
}

.timeline-step-chip:hover {
  background-color: var(--color-surface-container, #f3ede1);
  border-color: var(--color-primary, #1b2e24);
  transform: translateY(-1px);
}

.timeline-step-chip.is-selected {
  background-color: #fef9ed;
  border: 1.5px solid var(--color-secondary, #d9531e);
  box-shadow: 0 3px 10px rgba(217, 83, 30, 0.18);
}

.timeline-step-chip.is-leg-start,
.timeline-step-chip.is-leg-end {
  background-color: #fef9ed;
}

/* 1/3 partial border wrapping the right edge of the start location closest to the active leg */
.timeline-step-chip.is-leg-start::after {
  content: '';
  position: absolute;
  top: -1px;
  bottom: -1px;
  right: -1px;
  width: 34%;
  border-top: 2px solid var(--color-secondary, #d9531e);
  border-bottom: 2px solid var(--color-secondary, #d9531e);
  border-right: 2px solid var(--color-secondary, #d9531e);
  border-top-right-radius: 6px;
  border-bottom-right-radius: 6px;
  pointer-events: none;
  z-index: 2;
}

/* 1/3 partial border wrapping the left edge of the end location closest to the active leg */
.timeline-step-chip.is-leg-end::after {
  content: '';
  position: absolute;
  top: -1px;
  bottom: -1px;
  left: -1px;
  width: 34%;
  border-top: 2px solid var(--color-secondary, #d9531e);
  border-bottom: 2px solid var(--color-secondary, #d9531e);
  border-left: 2px solid var(--color-secondary, #d9531e);
  border-top-left-radius: 6px;
  border-bottom-left-radius: 6px;
  pointer-events: none;
  z-index: 2;
}

.step-chip-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  gap: 4px;
}

.step-chip-meta {
  display: flex;
  align-items: center;
  gap: 4px;
}

.step-order-badge {
  background-color: var(--color-secondary, #d9531e);
  color: #ffffff;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 9px;
  flex-shrink: 0;
}

.step-cat-icon {
  font-size: 13px;
  color: var(--color-primary, #1b2e24);
  flex-shrink: 0;
}

.step-elev {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  font-size: 9px;
  font-weight: 700;
  color: var(--color-tertiary, #526056);
  flex-shrink: 0;
  background-color: rgba(82, 96, 86, 0.08);
  padding: 1px 4px;
  border-radius: 3px;
  line-height: 1;
}

.step-elev-icon {
  font-size: 11px;
  line-height: 1;
  color: var(--color-secondary, #d9531e);
}

.step-title {
  font-size: 11.5px;
  line-height: 1.25;
  color: var(--color-on-surface, #1d1c14);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 100%;
  text-align: left;
}

/* MINIMAL LEG CONNECTOR LINE */
.timeline-leg-connector {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 44px;
  height: 44px;
  padding: 0 5px;
  cursor: pointer;
  user-select: none;
  flex-shrink: 0;
}

.leg-connector-line {
  position: absolute;
  left: 0;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  height: 0;
  border-top: 1.5px dashed var(--color-outline-variant, #c2c8c2);
  transition: all 0.16s ease;
}

.timeline-leg-connector:hover .leg-connector-line {
  border-top-color: var(--color-secondary, #d9531e);
}

.timeline-leg-connector.is-active .leg-connector-line {
  left: -1px;
  right: -1px;
  border-top: 2px solid var(--color-secondary, #d9531e);
  z-index: 3;
}

.leg-dist-pill {
  position: relative;
  z-index: 4;
  display: inline-flex;
  align-items: center;
  gap: 3px;
  padding: 2px 5px;
  border-radius: 9999px;
  background-color: var(--color-surface-container-low, #f8f3e7);
  border: 1px solid var(--color-outline-variant, #c2c8c2);
  box-shadow: 0 1px 2px rgba(27, 46, 36, 0.08);
  transition: all 0.16s ease;
}

.timeline-leg-connector:hover .leg-dist-pill {
  background-color: #fef9ed;
  border-color: var(--color-secondary, #d9531e);
  transform: translateY(-1px);
  box-shadow: 0 2px 5px rgba(217, 83, 30, 0.16);
}

.timeline-leg-connector.is-active .leg-dist-pill {
  background-color: #fef4ea;
  border-color: var(--color-secondary, #d9531e);
  box-shadow: 0 2px 6px rgba(217, 83, 30, 0.22);
}

.leg-dist-text {
  font-size: 8.5px;
  font-weight: 700;
  letter-spacing: 0.02em;
  line-height: 1;
  color: var(--color-tertiary, #526056);
  white-space: nowrap;
  transition: color 0.15s ease;
}

.timeline-leg-connector:hover .leg-dist-text,
.timeline-leg-connector.is-active .leg-dist-text {
  color: var(--color-secondary, #d9531e);
}

/* ACTIONS */
.peek-actions-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding-top: 2px;
}

.action-btn {
  height: 36px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.06em;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.15s ease;
  box-sizing: border-box;
}

.read-dispatch-btn {
  flex: 1;
  background-color: var(--color-primary, #1b2e24);
  color: #fef9ed;
  border: none;
}

.read-dispatch-btn:hover {
  background-color: var(--color-secondary, #d9531e);
}

.exit-inspection-btn {
  padding: 0 14px;
  background-color: transparent;
  color: var(--color-on-surface-variant, #424844);
  border: 1px solid var(--color-outline-variant, #c2c8c2);
}

.exit-inspection-btn:hover {
  background-color: var(--color-surface-container, #f3ede1);
  border-color: var(--color-primary, #1b2e24);
  color: var(--color-primary, #1b2e24);
}
</style>
