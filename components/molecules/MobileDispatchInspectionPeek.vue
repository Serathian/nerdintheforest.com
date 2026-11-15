<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Dispatch } from '~/types/models'
import { buildRouteLegBreakdown, resolveActiveElevationData, type LegItem } from '~/utils/dispatchInspection'
import ElevationProfile, { type ElevationHighlightedRange } from '../atoms/ElevationProfile.vue'

interface WaypointItem {
  id: string
  slug: string
  title: string
  elevation?: number
  elevationGain?: number
  elevationLoss?: number
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
  (e: 'hover-waypoint', id: string | null): void
  (e: 'hover-leg', index: number | null): void
  (e: 'exit'): void
  (e: 'read-dispatch', slug: string): void
}>()

const hoveredLocationId = ref<string | null>(null)
const hoveredLegIndex = ref<number | null>(null)

function handleWaypointEnter(id: string) {
  if (hoveredLegIndex.value !== null) {
    hoveredLegIndex.value = null
    emit('hover-leg', null)
  }
  hoveredLocationId.value = id
  emit('hover-waypoint', id)
}

function handleWaypointLeave(id: string) {
  if (hoveredLocationId.value === id) {
    hoveredLocationId.value = null
    emit('hover-waypoint', null)
  }
}

function handleLegEnter(index: number) {
  if (hoveredLocationId.value !== null) {
    hoveredLocationId.value = null
    emit('hover-waypoint', null)
  }
  hoveredLegIndex.value = index
  emit('hover-leg', index)
}

function handleLegLeave(index: number) {
  if (hoveredLegIndex.value === index) {
    hoveredLegIndex.value = null
    emit('hover-leg', null)
  }
}

function handleTimelineLeave() {
  if (hoveredLocationId.value !== null) {
    hoveredLocationId.value = null
    emit('hover-waypoint', null)
  }
  if (hoveredLegIndex.value !== null) {
    hoveredLegIndex.value = null
    emit('hover-leg', null)
  }
}

const routeBreakdown = computed(() => {
  return buildRouteLegBreakdown(props.dispatch, props.waypoints)
})

const prefixLeg = computed<LegItem | null>(() => routeBreakdown.value.prefixLeg)
const legs = computed<LegItem[]>(() => routeBreakdown.value.legs)
const suffixLeg = computed<LegItem | null>(() => routeBreakdown.value.suffixLeg)

function getLegByIndex(idx: number | null | undefined): LegItem | null {
  if (idx === null || idx === undefined) return null
  if (idx === -1) return prefixLeg.value
  if (suffixLeg.value && idx === suffixLeg.value.index) return suffixLeg.value
  return legs.value[idx] || null
}

const selectedLegData = computed<LegItem | null>(() => {
  return getLegByIndex(props.selectedLegIndex)
})

const effectiveLegHighlight = computed<number | null>(() => {
  if (hoveredLegIndex.value !== null) return hoveredLegIndex.value
  return props.selectedLegIndex ?? null
})

const wholeRouteData = computed(() => routeBreakdown.value.wholeRouteData)

const isHoveringWholeRoutePreview = computed(() => {
  if (hoveredLocationId.value !== null) return true
  if (hoveredLegIndex.value !== null && hoveredLegIndex.value !== props.selectedLegIndex) return true
  return false
})

const activeElevationData = computed(() => {
  return resolveActiveElevationData({
    wholeRouteData: wholeRouteData.value,
    selectedLegData: selectedLegData.value,
    isHoveringWholeRoutePreview: isHoveringWholeRoutePreview.value
  })
})

const hoveredWaypointOrder = computed<number | null>(() => {
  if (hoveredLegIndex.value !== null) return null
  const targetId = hoveredLocationId.value || (selectedLegData.value ? null : props.selectedLocationId)
  if (!targetId) return null
  const wp = props.waypoints.find(w => w.id === targetId || w.slug === targetId)
  return wp ? wp.order : null
})

const highlightedProfileRange = computed<ElevationHighlightedRange | null>(() => {
  const legIdx = hoveredLegIndex.value
  if (legIdx === null || !wholeRouteData.value) return null
  // Only highlight sub-range when viewing the full route profile
  if (activeElevationData.value !== wholeRouteData.value) return null

  const leg = getLegByIndex(legIdx)
  if (!leg) return null

  const pWaypoints = wholeRouteData.value.profileWaypoints || []
  let startFraction = 0
  let endFraction = 1
  let startOrder: number | undefined
  let endOrder: number | undefined

  if (legIdx === -1) {
    startFraction = 0
    endFraction = pWaypoints[0]?.fraction ?? 0.2
    endOrder = props.waypoints[0]?.order
  } else if (suffixLeg.value && legIdx === suffixLeg.value.index) {
    const lastIdx = props.waypoints.length - 1
    startFraction = pWaypoints[lastIdx]?.fraction ?? 0.8
    endFraction = 1
    startOrder = props.waypoints[lastIdx]?.order
  } else {
    startFraction = pWaypoints[legIdx]?.fraction ?? 0
    endFraction = pWaypoints[legIdx + 1]?.fraction ?? 1
    startOrder = props.waypoints[legIdx]?.order
    endOrder = props.waypoints[legIdx + 1]?.order
  }

  return {
    startFraction,
    endFraction,
    label: leg.segmentLabel,
    distanceKm: leg.distanceKm,
    elevationGain: leg.elevationGain,
    elevationLoss: leg.elevationLoss,
    startOrder,
    endOrder
  }
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
    <div v-if="waypoints.length > 0" class="timeline-stepper-track scroll-hint-x" @mouseleave="handleTimelineLeave">
      <div class="timeline-row">
        <!-- Optional Prefix Leg Connector before first listed location -->
        <div
          v-if="prefixLeg"
          :class="['timeline-leg-connector is-prefix font-mono', { 'is-active': selectedLegIndex === -1 || hoveredLegIndex === -1 }]"
          role="button"
          tabindex="0"
          :aria-label="`Inspect start leg: ${prefixLeg.distanceFormatted}`"
          :title="`Focus Trail Start → ${prefixLeg.toTitle} (${prefixLeg.distanceFormatted})`"
          @click="handleLegClick(-1)"
          @mouseenter="handleLegEnter(-1)"
          @mouseleave="handleLegLeave(-1)"
          @focus="handleLegEnter(-1)"
          @blur="handleLegLeave(-1)"
          @keydown.enter.prevent="handleLegClick(-1)"
          @keydown.space.prevent="handleLegClick(-1)"
        >
          <span class="leg-terminal-dot start" />
          <span class="leg-connector-line" />
          <span class="leg-dist-pill">
            <span class="leg-dist-text">{{ prefixLeg.distanceFormatted }}</span>
          </span>
        </div>

        <template v-for="(wp, idx) in waypoints" :key="wp.id">
          <!-- Minimified Waypoint Chip -->
          <div :class="[
            'timeline-step-chip font-mono',
            {
              'is-selected': selectedLocationId === wp.id || selectedLocationId === wp.slug || hoveredLocationId === wp.id,
              'is-leg-start': effectiveLegHighlight === idx,
              'is-leg-end': effectiveLegHighlight !== null && idx === effectiveLegHighlight + 1
            }
          ]" role="button" tabindex="0" :title="`Focus ${wp.title}`"
            @click="emit('select-waypoint', wp.id)"
            @mouseenter="handleWaypointEnter(wp.id)"
            @mouseleave="handleWaypointLeave(wp.id)"
            @focus="handleWaypointEnter(wp.id)"
            @blur="handleWaypointLeave(wp.id)"
            @keydown.enter.prevent="emit('select-waypoint', wp.id)"
            @keydown.space.prevent="emit('select-waypoint', wp.id)">
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
            :class="['timeline-leg-connector font-mono', { 'is-active': selectedLegIndex === idx || hoveredLegIndex === idx }]" role="button"
            tabindex="0"
            :aria-label="`Inspect leg ${legs[idx].letter}: ${legs[idx].distanceFormatted}`"
            :title="`Focus Leg ${legs[idx].letter} (${legs[idx].distanceFormatted})`"
            @click="handleLegClick(idx)"
            @mouseenter="handleLegEnter(idx)"
            @mouseleave="handleLegLeave(idx)"
            @focus="handleLegEnter(idx)"
            @blur="handleLegLeave(idx)"
            @keydown.enter.prevent="handleLegClick(idx)"
            @keydown.space.prevent="handleLegClick(idx)">
            <span class="leg-connector-line" />
            <span class="leg-dist-pill">
              <span class="leg-dist-text">{{ legs[idx].distanceFormatted }}</span>
            </span>
          </div>
        </template>

        <!-- Optional Suffix Leg Connector after last listed location -->
        <div
          v-if="suffixLeg"
          :class="['timeline-leg-connector is-suffix font-mono', { 'is-active': selectedLegIndex === suffixLeg.index || hoveredLegIndex === suffixLeg.index }]"
          role="button"
          tabindex="0"
          :aria-label="`Inspect finish leg: ${suffixLeg.distanceFormatted}`"
          :title="`Focus ${suffixLeg.fromTitle} → Trail End (${suffixLeg.distanceFormatted})`"
          @click="handleLegClick(suffixLeg.index)"
          @mouseenter="handleLegEnter(suffixLeg.index)"
          @mouseleave="handleLegLeave(suffixLeg.index)"
          @focus="handleLegEnter(suffixLeg.index)"
          @blur="handleLegLeave(suffixLeg.index)"
          @keydown.enter.prevent="handleLegClick(suffixLeg.index)"
          @keydown.space.prevent="handleLegClick(suffixLeg.index)"
        >
          <span class="leg-connector-line" />
          <span class="leg-dist-pill">
            <span class="leg-dist-text">{{ suffixLeg.distanceFormatted }}</span>
          </span>
          <span class="leg-terminal-dot end" />
        </div>
      </div>
    </div>

    <!-- Trail Elevation Profile (Whole Route by default, or Selected Leg when focused) -->
    <ElevationProfile
      v-if="activeElevationData"
      :start-elevation="activeElevationData.startElevation"
      :destination-elevation="activeElevationData.destinationElevation"
      :elevation-gain="activeElevationData.elevationGain"
      :elevation-loss="activeElevationData.elevationLoss"
      :distance-km="activeElevationData.distanceKm"
      :trailhead-name="activeElevationData.fromTitle"
      :destination-name="activeElevationData.toTitle"
      :segment-label="activeElevationData.segmentLabel"
      :route-geometry="activeElevationData.routeGeometry"
      :waypoints="activeElevationData.profileWaypoints"
      :highlighted-range="highlightedProfileRange"
      :hovered-waypoint-order="hoveredWaypointOrder"
    />

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

.timeline-leg-connector.is-prefix {
  padding-left: 10px;
}

.timeline-leg-connector.is-suffix {
  padding-right: 10px;
}

.leg-terminal-dot {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background-color: var(--color-outline-variant, #c2c8c2);
  border: 1.5px solid var(--color-surface-container-low, #f8f3e7);
  z-index: 4;
  transition: all 0.16s ease;
}

.leg-terminal-dot.start {
  left: 0;
}

.leg-terminal-dot.end {
  right: 0;
}

.timeline-leg-connector:hover .leg-terminal-dot,
.timeline-leg-connector.is-active .leg-terminal-dot {
  background-color: var(--color-secondary, #d9531e);
  transform: translateY(-50%) scale(1.15);
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
