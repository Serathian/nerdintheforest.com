<script setup lang="ts">
import { computed } from 'vue'

interface Amenity {
  icon: string
  label: string
}

interface Props {
  id: string
  title: string
  area?: string
  timeAgo?: string
  date?: string
  visitedCount?: number
  amenities: Amenity[]
  active?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  area: '',
  timeAgo: '',
  date: '',
  visitedCount: 0,
  active: false
})

const emit = defineEmits<{
  (e: 'click', id: string): void
}>()

const formattedUpdated = computed(() => {
  const rawDate = (props.date || '').trim()
  const rawTimeAgo = (props.timeAgo || '').trim()

  if (rawDate && !rawDate.toUpperCase().includes('UNVISITED')) {
    if (rawDate.includes('//')) {
      return rawDate.split('//')[0].trim()
    }
    const parsed = new Date(rawDate)
    if (!Number.isNaN(parsed.getTime())) {
      return parsed
        .toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
        .toUpperCase()
    }
    return rawDate.toUpperCase()
  }

  if (rawTimeAgo && rawTimeAgo.toLowerCase() !== 'unvisited') {
    return rawTimeAgo.toUpperCase()
  }

  if (rawDate.includes('//')) {
    return rawDate.split('//')[0].trim()
  }

  return 'RECENTLY ADDED'
})
</script>

<template>
  <article
    :class="['recent-card', { active }]"
    role="button"
    tabindex="0"
    @click="emit('click', id)"
    @keydown.enter.prevent="emit('click', id)"
    @keydown.space.prevent="emit('click', id)"
  >
    <!-- Top Row: Area & Visited Count -->
    <div class="card-meta-row font-mono">
      <span v-if="area" class="card-area-badge" :title="area">
        <span class="material-symbols-outlined area-icon">public</span>
        <span class="area-text">{{ area }}</span>
      </span>

      <span
        v-if="visitedCount > 0"
        class="visited-badge visited"
      >
        <span class="material-symbols-outlined check-icon">check_circle</span>
        <span>VISITED {{ visitedCount }}x</span>
      </span>
      <span
        v-else
        class="visited-badge unvisited"
      >
        <span class="material-symbols-outlined check-icon">radio_button_unchecked</span>
        <span>NOT VISITED</span>
      </span>
    </div>

    <!-- Location Name & Last Updated -->
    <div class="card-header-group">
      <h3 class="card-title font-serif">
        {{ title }}
      </h3>
      <div class="card-updated-row font-mono">
        <span class="material-symbols-outlined updated-icon">schedule</span>
        <span>UPDATED {{ formattedUpdated }}</span>
      </div>
    </div>

    <!-- Amenities -->
    <div class="amenities-row">
      <template v-if="amenities && amenities.length > 0">
        <span
          v-for="(amenity, idx) in amenities"
          :key="idx"
          class="amenity-widget font-mono"
        >
          <span class="material-symbols-outlined widget-icon">{{ amenity.icon }}</span>
          <span>{{ amenity.label }}</span>
        </span>
      </template>
      <span v-else class="amenities-unverified font-mono">
        <span class="material-symbols-outlined unverified-icon">pending</span>
        <span>UNVERIFIED AMENITIES</span>
      </span>
    </div>
  </article>
</template>

<style scoped>
.recent-card {
  width: 260px;
  min-width: 260px;
  max-width: 260px;
  flex-shrink: 0;
  scroll-snap-align: start;
  user-select: none;
  border-radius: 8px;
  padding: 12px 14px;
  background-color: var(--color-card-bg, #ffffff);
  border: 1px solid var(--color-card-border, rgba(27, 46, 36, 0.16));
  box-shadow: 0 2px 10px rgba(27, 46, 36, 0.07);
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  gap: 10px;
  cursor: pointer;
  transition: all 0.18s ease;
  box-sizing: border-box;
}

.recent-card:first-child {
  margin-left: 16px;
}

.recent-card:last-child {
  margin-right: 16px;
}

.recent-card:hover {
  border-color: var(--color-secondary, #d9531e);
  box-shadow: 0 6px 16px rgba(27, 46, 36, 0.12);
  transform: translateY(-1px);
}

.recent-card.active {
  border-color: var(--color-secondary, #d9531e);
  box-shadow: 0 0 0 1.5px rgba(217, 83, 30, 0.4), 0 6px 16px rgba(27, 46, 36, 0.14);
  background-color: #fef9ed;
}

/* TOP ROW: AREA & VISITED STATUS */
.card-meta-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.card-area-badge {
  display: inline-flex;
  align-items: center;
  gap: 3.5px;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  background-color: rgba(217, 83, 30, 0.1);
  color: var(--color-secondary, #d9531e);
  border: 1px solid rgba(217, 83, 30, 0.25);
  min-width: 0;
  max-width: 135px;
}

.area-icon {
  font-size: 11px;
  flex-shrink: 0;
}

.area-text {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.visited-badge {
  display: inline-flex;
  align-items: center;
  gap: 3.5px;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 8.5px;
  font-weight: 600;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  white-space: nowrap;
  flex-shrink: 0;
}

.visited-badge.visited {
  background-color: var(--color-primary-container, #1b2e24);
  color: #ffffff;
  border: 1px solid rgba(27, 46, 36, 0.4);
}

.visited-badge.unvisited {
  background-color: var(--color-surface-container, #eedfc5);
  color: var(--color-on-surface-variant, #424844);
  border: 1px solid rgba(194, 200, 194, 0.5);
}

.check-icon {
  font-size: 10px;
}

/* TITLE & UPDATED DATE */
.card-header-group {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.card-title {
  font-size: 17px;
  line-height: 1.25;
  color: var(--color-primary, #1b2e24);
  font-weight: 500;
  letter-spacing: -0.01em;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-updated-row {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 9.5px;
  font-weight: 500;
  letter-spacing: 0.04em;
  color: var(--color-lichen-slate, #526056);
  text-transform: uppercase;
}

.updated-icon {
  font-size: 11px;
  color: var(--color-secondary, #d9531e);
  opacity: 0.85;
}

/* AMENITIES */
.amenities-row {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  margin-top: auto;
  padding-top: 6px;
  border-top: 1px solid rgba(115, 120, 116, 0.16);
}

.amenity-widget {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 6px;
  border-radius: 4px;
  background-color: var(--color-surface-container-low, #f7f0e2);
  border: 1px solid rgba(194, 200, 194, 0.55);
  color: var(--color-primary, #1b2e24);
  font-size: 9.5px;
  font-weight: 500;
  line-height: 1;
}

.widget-icon {
  font-size: 11.5px;
  color: var(--color-secondary, #d9531e);
}

.amenities-unverified {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 6px;
  border-radius: 4px;
  background-color: var(--color-surface-container-low, #f7f0e2);
  border: 1px dashed rgba(115, 120, 116, 0.3);
  color: var(--color-lichen-slate, #526056);
  font-size: 9px;
  font-weight: 600;
  letter-spacing: 0.05em;
  line-height: 1;
}

.unverified-icon {
  font-size: 11px;
  opacity: 0.7;
}
</style>
