<script setup lang="ts">
interface Amenity {
  icon: string
  label: string
}

interface Props {
  id: string
  numberTag: string
  title: string
  description?: string
  visitedCount?: number
  dispatchCount?: number
  amenities: Amenity[]
  latitude?: number
  longitude?: number
  active?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  description: '',
  visitedCount: 0,
  dispatchCount: 1,
  latitude: 60.2710,
  longitude: 10.7320,
  active: false
})

const emit = defineEmits<{
  (e: 'click', id: string): void
  (e: 'view-location', id: string): void
  (e: 'read-story', id: string): void
  (e: 'navigate', payload: { id: string; lat: number; lng: number }): void
}>()

function handleNavigate() {
  emit('navigate', { id: props.id, lat: props.latitude, lng: props.longitude })
  // Open external maps navigation from current location to trailhead
  if (typeof window !== 'undefined') {
    const isApple = /Mac|iPhone|iPad|iPod/.test(navigator.userAgent)
    const url = isApple
      ? `maps://maps.apple.com/?daddr=${props.latitude},${props.longitude}&dirflg=d`
      : `https://www.google.com/maps/dir/?api=1&destination=${props.latitude},${props.longitude}`
    window.open(url, '_blank')
  }
}
</script>

<template>
  <div
    :class="[
      'recent-card',
      active ? 'active' : ''
    ]"
    @click="emit('click', id)"
  >
    <!-- Card Top Header: Tag & Badges -->
    <div class="card-top-row">
      <span class="card-tag font-mono">
        {{ numberTag }}
      </span>

      <div class="badges-group">
        <!-- Dispatches Count Badge -->
        <span
          v-if="dispatchCount > 0"
          class="dispatch-badge font-mono"
        >
          <span class="material-symbols-outlined badge-icon">article</span>
          {{ dispatchCount }} {{ dispatchCount === 1 ? 'DISPATCH' : 'DISPATCHES' }}
        </span>

        <!-- Visited Status Badge -->
        <span
          v-if="visitedCount > 0"
          class="visited-badge visited font-mono"
        >
          <span class="material-symbols-outlined check-icon">check_circle</span>
          VISITED {{ visitedCount }}x
        </span>
        <span
          v-else
          class="visited-badge unvisited font-mono"
        >
          <span class="material-symbols-outlined check-icon">radio_button_unchecked</span>
          NOT VISITED
        </span>
      </div>
    </div>

    <!-- Title -->
    <h3 class="card-title font-serif">
      {{ title }}
    </h3>

    <!-- Information Widgets (Lean-to, Firewood, Lake Water, Toilet, etc.) -->
    <div class="amenities-row">
      <span
        v-for="(amenity, idx) in amenities"
        :key="idx"
        class="amenity-widget font-mono"
      >
        <span class="material-symbols-outlined widget-icon">{{ amenity.icon }}</span>
        <span>{{ amenity.label }}</span>
      </span>
    </div>

    <!-- Action Buttons Row -->
    <div class="card-actions-row">
      <!-- View Location Button -->
      <button
        class="action-btn view-btn font-mono"
        type="button"
        @click.stop="emit('view-location', id)"
      >
        <span class="material-symbols-outlined btn-icon">explore</span>
        <span>VIEW LOCATION</span>
      </button>

      <!-- Navigate to Trailhead Button -->
      <button
        class="action-btn nav-btn font-mono"
        type="button"
        title="Directions from current location"
        @click.stop="handleNavigate"
      >
        <span class="material-symbols-outlined btn-icon">directions</span>
        <span>TRAILHEAD</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.recent-card {
  width: 275px;
  min-width: 275px;
  max-width: 275px;
  flex-shrink: 0;
  scroll-snap-align: start;
  user-select: none;
  border-radius: 8px;
  padding: 12px 14px;
  background-color: var(--color-card-bg);
  border: 1px solid var(--color-card-border);
  box-shadow: var(--color-card-shadow);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 10px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.recent-card:hover {
  border-color: var(--color-secondary);
  box-shadow: 0 6px 18px rgba(27, 46, 36, 0.12);
}

.recent-card.active {
  border-color: var(--color-secondary);
  box-shadow: 0 0 0 2px rgba(217, 83, 30, 0.35), 0 6px 18px rgba(27, 46, 36, 0.14);
  background-color: #ffffff;
}

.card-top-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
}

.card-tag {
  font-size: 10px;
  color: var(--color-secondary);
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.badges-group {
  display: flex;
  align-items: center;
  gap: 4px;
}

.dispatch-badge {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  padding: 2px 5px;
  border-radius: 4px;
  font-size: 8.5px;
  font-weight: 600;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  background-color: rgba(231, 226, 214, 0.9);
  color: var(--color-primary);
  border: 1px solid rgba(115, 120, 116, 0.3);
}

.badge-icon {
  font-size: 10px;
  color: var(--color-secondary);
}

.visited-badge {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  padding: 2px 5px;
  border-radius: 4px;
  font-size: 8.5px;
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
  font-size: 10px;
}

.card-title {
  font-size: 18px;
  line-height: 1.25;
  color: var(--color-primary);
  font-weight: 500;
  letter-spacing: -0.01em;
  margin: 0;
}

/* INFORMATION WIDGETS */
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

/* ACTION BUTTONS */
.card-actions-row {
  padding-top: 8px;
  border-top: 1px solid rgba(115, 120, 116, 0.2);
  display: flex;
  align-items: center;
  gap: 6px;
}

.action-btn {
  flex: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  height: 32px;
  padding: 0 8px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  border: none;
  cursor: pointer;
  transition: all 0.15s ease;
}

.view-btn {
  background-color: var(--color-primary);
  color: #ffffff;
}

.view-btn:hover {
  background-color: var(--color-secondary);
}

.nav-btn {
  background-color: var(--color-surface-container-high);
  color: var(--color-primary);
  border: 1px solid rgba(115, 120, 116, 0.35);
}

.nav-btn:hover {
  background-color: var(--color-surface-container-highest);
  border-color: var(--color-primary);
}

.action-btn:active {
  transform: scale(0.97);
}

.btn-icon {
  font-size: 13px;
}
</style>
