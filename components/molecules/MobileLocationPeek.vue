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
    <!-- Location Title & Close Button Row -->
    <div class="peek-title-row">
      <h2 class="location-title font-serif">
        {{ location.title }}
      </h2>
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

    <!-- Location Coordinates & Elevation Stamp -->
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

    <!-- Amenities Section (Includes Visited Badge) -->
    <div class="amenities-row">
      <!-- Visited status badge integrated into amenities section -->
      <span
        v-if="(location.visitedCount ?? 0) > 0"
        class="amenity-widget visited-pill font-mono"
      >
        <span class="material-symbols-outlined widget-icon check-icon">check_circle</span>
        <span>VISITED {{ location.visitedCount }}X</span>
      </span>
      <span
        v-else
        class="amenity-widget unvisited-pill font-mono"
      >
        <span class="material-symbols-outlined widget-icon check-icon">radio_button_unchecked</span>
        <span>NOT VISITED</span>
      </span>

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
    <div v-if="location.trailhead" class="peek-actions-row">
      <button
        class="action-btn trailhead-btn font-mono"
        type="button"
        title="Directions to trailhead"
        @click="emit('navigate', location)"
      >
        <span class="material-symbols-outlined btn-icon">directions</span>
        <span>NAVIGATE TO TRAILHEAD</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.location-peek-base {
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;
  box-sizing: border-box;
}

.peek-title-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
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
  flex-wrap: wrap;
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
  display: inline-flex;
  align-items: center;
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

.amenity-widget.visited-pill {
  background-color: var(--color-primary-container);
  color: #ffffff;
  border-color: rgba(27, 46, 36, 0.5);
}

.amenity-widget.visited-pill .widget-icon {
  color: #72f7ab;
}

.amenity-widget.unvisited-pill {
  background-color: var(--color-surface-container);
  color: var(--color-on-surface-variant);
  border-color: rgba(194, 200, 194, 0.5);
}

.amenity-widget.unvisited-pill .widget-icon {
  color: var(--color-secondary);
  opacity: 0.7;
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

.btn-icon {
  font-size: 14px;
}
</style>
