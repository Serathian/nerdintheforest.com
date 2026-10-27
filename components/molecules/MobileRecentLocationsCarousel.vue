<script setup lang="ts">
import type { FieldNote } from '../../types/fieldNotes'
import RecentCard from './RecentCard.vue'

interface Props {
  fieldNotes: FieldNote[]
  selectedId?: string
}

withDefaults(defineProps<Props>(), {
  selectedId: ''
})

const emit = defineEmits<{
  (e: 'select-location', id: string): void
  (e: 'read-story', id: string): void
  (e: 'navigate', payload: { id: string; lat: number; lng: number }): void
}>()
</script>

<template>
  <div class="recent-locations-container">
    <!-- Horizontal Snapping Card Carousel -->
    <div v-if="fieldNotes.length > 0" class="locations-carousel scroll-hint-x">
      <RecentCard
        v-for="note in fieldNotes"
        :key="note.id"
        :id="note.id"
        :title="note.title"
        :area="note.area"
        :time-ago="note.timeAgo"
        :date="note.date"
        :visited-count="note.visitedCount"
        :amenities="note.amenities"
        :active="note.id === selectedId"
        @click="emit('select-location', note.id)"
      />
    </div>

    <!-- Empty state when active filters yield 0 matches -->
    <div v-else class="empty-state">
      <span class="material-symbols-outlined empty-icon">explore_off</span>
      <span class="empty-title font-serif">No locations match active filters</span>
      <span class="empty-desc font-mono">
        Try adjusting keywords or selecting ALL LOCATIONS
      </span>
    </div>
  </div>
</template>

<style scoped>
.recent-locations-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: var(--color-surface-container-high, #e5d6b8);
  box-sizing: border-box;
}

.locations-carousel {
  display: flex;
  align-items: stretch;
  gap: 12px;
  overflow-x: auto;
  padding: 10px 0 12px;
  scroll-padding-left: 16px;
  scroll-padding-right: 16px;
  scroll-snap-type: x mandatory;
  -webkit-overflow-scrolling: touch;
}

.locations-carousel > :first-child {
  margin-left: 16px;
}

.locations-carousel > :last-child {
  margin-right: 16px;
}

.empty-state {
  padding: 32px 16px;
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
</style>
