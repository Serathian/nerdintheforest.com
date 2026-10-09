<script setup lang="ts">
import { ref } from 'vue'

interface Props {
  lat: number
  lng: number
  label?: string
}

const props = defineProps<Props>()
const copied = ref(false)

function formatDMS(deg: number, isLat: boolean): string {
  const absolute = Math.abs(deg)
  const degrees = Math.floor(absolute)
  const minutes = Math.floor((absolute - degrees) * 60)
  const seconds = ((absolute - degrees - minutes / 60) * 3600).toFixed(1)
  const direction = isLat ? (deg >= 0 ? 'N' : 'S') : (deg >= 0 ? 'E' : 'W')
  return `${degrees}°${minutes}'${seconds}"${direction}`
}

function copyCoordinates() {
  const text = `${props.lat.toFixed(6)}, ${props.lng.toFixed(6)}`
  navigator.clipboard?.writeText(text)
  copied.value = true
  setTimeout(() => {
    copied.value = false
  }, 2000)
}
</script>

<template>
  <button
    type="button"
    class="coordinate-stamp"
    :title="copied ? 'Coordinates Copied!' : 'Click to copy GPS coordinates'"
    @click="copyCoordinates"
  >
    <span class="bracket">[</span>
    <span class="coord-val">{{ formatDMS(lat, true) }}</span>
    <span class="dot">•</span>
    <span class="coord-val">{{ formatDMS(lng, false) }}</span>
    <span class="bracket">]</span>
    <span v-if="copied" class="copied-badge">COPIED</span>
  </button>
</template>

<style scoped>
.coordinate-stamp {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  background-color: var(--color-surface-container-high);
  border: 1px solid var(--color-surface-container-highest);
  border-radius: var(--radius-sm);
  padding: 3px 8px;
  font-family: var(--font-mono);
  font-size: 10px;
  line-height: 14px;
  letter-spacing: 0.08em;
  color: var(--color-pine-primary);
  cursor: pointer;
  user-select: none;
  transition: background-color 0.15s ease, border-color 0.15s ease;
  position: relative;
}

.coordinate-stamp:hover {
  background-color: var(--color-surface-container-highest);
  border-color: var(--color-outline-variant);
}

.bracket {
  color: var(--color-lichen-slate);
}

.dot {
  color: var(--color-beacon-secondary);
  font-size: 8px;
  margin: 0 1px;
}

.copied-badge {
  margin-left: 4px;
  font-size: 9px;
  color: var(--color-beacon-secondary);
  font-weight: 500;
}
</style>
