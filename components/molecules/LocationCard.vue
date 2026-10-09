<script setup lang="ts">
interface Props {
  id: string
  title: string
  region: string
  lat: number
  lng: number
  elevation?: string
  distance?: string
  thumbnailUrl?: string
  active?: boolean
}

defineProps<Props>()

const emit = defineEmits<{
  (e: 'select', id: string): void
}>()
</script>

<template>
  <div
    :class="['location-card', { active }]"
    @click="emit('select', id)"
  >
    <div v-if="thumbnailUrl" class="thumbnail-wrap">
      <img :src="thumbnailUrl" :alt="title" class="thumbnail-img" />
    </div>

    <div class="card-body">
      <div class="card-header">
        <span class="region-tag">{{ region }}</span>
        <CoordinateStamp :lat="lat" :lng="lng" />
      </div>

      <h3 class="card-title">{{ title }}</h3>

      <div v-if="elevation || distance" class="card-telemetry">
        <span v-if="distance" class="telemetry-item">DIST: {{ distance }}</span>
        <span v-if="elevation" class="telemetry-item">ELEV: {{ elevation }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.location-card {
  display: flex;
  flex-direction: column;
  background-color: var(--color-surface-container);
  border: 1px solid var(--color-surface-container-highest);
  border-radius: var(--radius-base);
  overflow: hidden;
  cursor: pointer;
  transition: border-color 0.15s ease, background-color 0.15s ease, box-shadow 0.15s ease;
  user-select: none;
}

.location-card:hover {
  border-color: var(--color-outline-variant);
  background-color: var(--color-surface-container-high);
}

.location-card.active {
  border-color: var(--color-pine-primary);
  box-shadow: 0 4px 12px rgba(27, 46, 36, 0.08);
}

.thumbnail-wrap {
  width: 100%;
  height: 120px;
  overflow: hidden;
  background-color: var(--color-surface-container-high);
}

.thumbnail-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.location-card:hover .thumbnail-img {
  transform: scale(1.03);
}

.card-body {
  padding: var(--space-md);
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-sm);
}

.region-tag {
  font-family: var(--font-mono);
  font-size: 10px;
  line-height: 14px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--color-lichen-slate);
}

.card-title {
  font-family: var(--font-serif);
  font-size: 18px;
  font-weight: 500;
  line-height: 24px;
  color: var(--color-pine-primary);
  margin-top: 2px;
}

.card-telemetry {
  display: flex;
  gap: var(--space-md);
  margin-top: 4px;
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--color-on-surface-variant);
}
</style>
