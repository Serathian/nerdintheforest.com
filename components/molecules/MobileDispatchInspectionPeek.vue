<script setup lang="ts">
import type { Dispatch } from '~/types/models'

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
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'select-waypoint', id: string): void
  (e: 'exit'): void
  (e: 'read-dispatch', slug: string): void
}>()

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
    <!-- Top Telemetry Header Bar -->
    <div class="peek-header-row font-mono">
      <div class="tag-badges-group">
        <span class="inspection-beacon-badge">
          <span class="beacon-dot" />
          <span>INSPECTING DISPATCH</span>
        </span>

        <span class="date-badge">
          {{ new Date(dispatch.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) }}
        </span>

        <span v-if="dispatch.weather" class="weather-badge">
          {{ dispatch.weather }}
        </span>
      </div>

      <!-- Close / Exit Inspection Button -->
      <button
        class="peek-close-btn"
        type="button"
        title="Exit Route Inspection"
        aria-label="Exit Route Inspection"
        @click="emit('exit')"
      >
        <span class="material-symbols-outlined text-[15px]">close</span>
      </button>
    </div>

    <!-- Dispatch Title -->
    <div class="title-meta-group">
      <h2 class="dispatch-title font-serif">
        {{ dispatch.title }}
      </h2>
      <span class="dispatch-route-meta font-mono">
        {{ waypoints.length }} SURVEYED WAYPOINTS IN CHRONOLOGICAL ROUTE SEQUENCE
      </span>
    </div>

    <!-- Sequential Timeline Stepper Track -->
    <div class="timeline-stepper-track scrollbar-none">
      <div class="timeline-row">
        <template v-for="(wp, idx) in waypoints" :key="wp.id">
          <!-- Waypoint Step Card -->
          <div
            :class="['timeline-step-card font-mono', { 'is-selected': selectedLocationId === wp.id || selectedLocationId === wp.slug }]"
            @click="emit('select-waypoint', wp.id)"
          >
            <div class="step-badge-row">
              <span class="step-order-badge">
                {{ wp.order }}
              </span>
              <span class="material-symbols-outlined step-cat-icon">
                {{ getCategoryIcon(wp.category) }}
              </span>
              <span v-if="wp.elevation" class="step-elev">
                {{ wp.elevation }}M
              </span>
            </div>

            <div class="step-title font-serif">
              {{ wp.title }}
            </div>

            <!-- Quick link to dedicated location dossier -->
            <NuxtLink
              :to="`/locations/${wp.slug || wp.id}`"
              class="step-dossier-link"
              title="Open full location dossier"
              @click.stop
            >
              <span>DOSSIER</span>
              <span class="material-symbols-outlined text-[10px]">open_in_new</span>
            </NuxtLink>
          </div>

          <!-- Connecting Trail Line Indicator between waypoints -->
          <div v-if="idx < waypoints.length - 1" class="timeline-connector">
            <span class="connector-line" />
            <span class="material-symbols-outlined connector-arrow">arrow_forward</span>
            <span class="connector-line" />
          </div>
        </template>
      </div>
    </div>

    <!-- Actions Row -->
    <div class="peek-actions-row font-mono">
      <NuxtLink
        :to="`/dispatches/${dispatch.slug || dispatch.id}`"
        class="action-btn read-dispatch-btn"
      >
        <span>READ FULL DISPATCH</span>
        <span class="material-symbols-outlined text-[14px]">menu_book</span>
      </NuxtLink>

      <button
        class="action-btn exit-inspection-btn"
        type="button"
        @click="emit('exit')"
      >
        <span>✕ EXIT ROUTE</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.dispatch-inspection-peek {
  width: 100%;
  padding: 14px 16px 10px;
  display: flex;
  flex-direction: column;
  gap: 10px;
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
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.3; transform: scale(0.85); }
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
  font-size: 20px;
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
  padding: 6px 0 8px;
}

.timeline-row {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: min-content;
}

.timeline-step-card {
  background-color: var(--color-surface-container-low, #f8f3e7);
  border: 1px solid var(--color-outline-variant, #c2c8c2);
  border-radius: 6px;
  padding: 8px 12px;
  min-width: 140px;
  max-width: 180px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  cursor: pointer;
  transition: all 0.18s ease;
  user-select: none;
}

.timeline-step-card:hover {
  background-color: var(--color-surface-container, #f3ede1);
  border-color: var(--color-primary, #1b2e24);
  transform: translateY(-1px);
}

.timeline-step-card.is-selected {
  background-color: #fef9ed;
  border: 1.5px solid var(--color-secondary, #d9531e);
  box-shadow: 0 4px 12px rgba(217, 83, 30, 0.15);
}

.step-badge-row {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 10px;
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
}

.step-cat-icon {
  font-size: 13px;
  color: var(--color-primary, #1b2e24);
}

.step-elev {
  font-size: 9px;
  color: var(--color-tertiary, #526056);
  margin-left: auto;
}

.step-title {
  font-size: 13px;
  line-height: 1.25;
  color: var(--color-on-surface, #1d1c14);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.step-dossier-link {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  font-size: 9px;
  color: var(--color-secondary, #d9531e);
  text-decoration: none;
  font-weight: 700;
  letter-spacing: 0.05em;
  margin-top: 2px;
}

.step-dossier-link:hover {
  text-decoration: underline;
}

.timeline-connector {
  display: flex;
  align-items: center;
  gap: 2px;
  color: var(--color-secondary, #d9531e);
  opacity: 0.7;
}

.connector-line {
  width: 8px;
  height: 1px;
  background-color: var(--color-secondary, #d9531e);
}

.connector-arrow {
  font-size: 14px;
}

/* ACTIONS */
.peek-actions-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding-top: 4px;
}

.action-btn {
  height: 38px;
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
