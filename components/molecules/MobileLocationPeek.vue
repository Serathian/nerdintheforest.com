<script setup lang="ts">
import type { FieldNote } from '../../types/fieldNotes'
import ElevationProfile from '../atoms/ElevationProfile.vue'

interface Props {
  location: FieldNote
  elevationGainLoss: { up: number; down: number } | null
  startElevation: number
}

defineProps<Props>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'navigate', note: FieldNote): void
}>()
</script>

<template>
  <div class="location-peek-base">
    <!-- Location Header Bar -->
    <div class="peek-header-row">
      <div class="tag-badges-group">
        <span class="location-tag font-mono">
          {{ location.numberTag }}
        </span>

        <span v-if="location.area" class="area-badge font-mono">
          <span class="material-symbols-outlined area-icon">public</span>
          {{ location.area }}
        </span>

        <span v-if="(location.visitedCount ?? 0) > 0" class="visited-badge visited font-mono">
          <span class="material-symbols-outlined check-icon">check_circle</span>
          VISITED {{ location.visitedCount }}x
        </span>
        <span v-else class="visited-badge unvisited font-mono">
          <span class="material-symbols-outlined check-icon">radio_button_unchecked</span>
          NOT VISITED
        </span>
      </div>

      <!-- Close Button (Returns to Search & Filter only) -->
      <button
        class="peek-close-btn"
        type="button"
        title="Close location peek & return to search"
        aria-label="Close location peek"
        @click="emit('close')"
      >
        <span class="material-symbols-outlined" style="font-size: 16px;">close</span>
      </button>
    </div>

    <!-- Location Title & Coordinates / Elevation Stamp -->
    <div class="title-meta-group">
      <h2 class="location-title font-serif">
        {{ location.title }}
      </h2>
      <div class="location-coords-row font-mono">
        <span class="coords-stamp">
          [{{ (location.latitude ?? 60.271).toFixed(3) }}°N • {{ (location.longitude ??
            10.732).toFixed(3) }}°E]
        </span>
        <span v-if="location.elevation" class="coords-divider">•</span>
        <span v-if="location.elevation" class="elevation-stamp">
          {{ location.elevation }}M ELEV
        </span>
      </div>
    </div>

    <!-- Amenities Widgets (Lean-to, Firewood, Lake Water, Toilet, etc.) -->
    <div class="amenities-row">
      <template v-if="location.amenities && location.amenities.length > 0">
        <span v-for="(amenity, idx) in location.amenities" :key="idx" class="amenity-widget font-mono">
          <span class="material-symbols-outlined widget-icon">{{ amenity.icon }}</span>
          <span>{{ amenity.label }}</span>
        </span>
      </template>
      <span v-else class="amenities-empty-hint font-mono">
        <span class="material-symbols-outlined text-[13px] opacity-70">shield_with_heart</span>
        <span>UNVERIFIED AMENITIES • SITE PENDING FIELD VISIT</span>
      </span>
    </div>

    <!-- Topographic Elevation Profile Graph (above navigate button) -->
    <ElevationProfile
      v-if="location.trailhead && elevationGainLoss"
      :start-elevation="startElevation"
      :destination-elevation="location.elevation"
      :elevation-gain="elevationGainLoss.up"
      :elevation-loss="elevationGainLoss.down"
      :distance-km="location.distanceKm"
      :trailhead-name="location.trailhead.name"
      :destination-name="location.title"
    />

    <!-- Action Buttons Row (only shown if location has a trailhead) -->
    <div class="peek-actions-row">
      <button
        v-if="location.trailhead"
        class="action-btn trailhead-btn font-mono"
        type="button"
        title="Directions from current location"
        @click="emit('navigate', location)"
      >
        <span class="material-symbols-outlined btn-icon">directions</span>
        <span>NAVIGATE TO TRAILHEAD</span>
      </button>
      <button
        v-else
        class="action-btn trailhead-btn disabled font-mono"
        type="button"
        disabled
      >
        <span class="material-symbols-outlined btn-icon">explore_off</span>
        <span>TRAILHEAD ACCESS OFF-GRID</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.location-peek-base {
  width: 100%;
  padding: 14px 16px 10px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  box-sizing: border-box;
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

.area-badge {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 8.5px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  background-color: rgba(217, 83, 30, 0.1);
  color: var(--color-secondary);
  border: 1px solid rgba(217, 83, 30, 0.3);
}

.area-icon {
  font-size: 11px;
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
  flex-shrink: 0;
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

.amenities-empty-hint {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.05em;
  color: var(--color-lichen-slate);
  padding: 4px 8px;
  background-color: var(--color-surface-container);
  border: 1px dashed rgba(115, 120, 116, 0.35);
  border-radius: 4px;
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

.trailhead-btn.disabled {
  opacity: 0.5;
  cursor: not-allowed;
  pointer-events: none;
  background-color: var(--color-surface-container);
  color: var(--color-lichen-slate);
  border-color: rgba(115, 120, 116, 0.25);
}

.btn-icon {
  font-size: 14px;
}
</style>
