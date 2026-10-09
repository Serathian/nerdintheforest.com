<script setup lang="ts">
interface Props {
  activeLayer?: 'topo' | 'satellite'
  isLocating?: boolean
}

withDefaults(defineProps<Props>(), {
  activeLayer: 'topo',
  isLocating: false
})

const emit = defineEmits<{
  (e: 'zoom-in'): void
  (e: 'zoom-out'): void
  (e: 'locate'): void
  (e: 'toggle-layer'): void
}>()
</script>

<template>
  <div class="map-controls">
    <!-- Zoom controls stack -->
    <div class="control-group zoom-group">
      <button
        class="control-btn"
        type="button"
        title="Zoom in"
        aria-label="Zoom in"
        @click="emit('zoom-in')"
      >
        <span class="material-symbols-outlined icon">add</span>
      </button>
      <div class="control-divider" />
      <button
        class="control-btn"
        type="button"
        title="Zoom out"
        aria-label="Zoom out"
        @click="emit('zoom-out')"
      >
        <span class="material-symbols-outlined icon">remove</span>
      </button>
    </div>

    <!-- Current GPS Location Button -->
    <div class="control-group">
      <button
        :class="['control-btn', { locating: isLocating }]"
        type="button"
        title="Current Location"
        aria-label="Current Location"
        @click="emit('locate')"
      >
        <span
          class="material-symbols-outlined icon location-icon"
          :class="{ spin: isLocating }"
        >
          {{ isLocating ? 'progress_activity' : 'my_location' }}
        </span>
      </button>
    </div>

    <!-- Map Layers Toggle Button -->
    <div class="control-group">
      <button
        :class="['control-btn', 'layer-btn', { active: activeLayer === 'satellite' }]"
        type="button"
        :title="activeLayer === 'satellite' ? 'Switch to Topo Map' : 'Switch to Satellite Map'"
        aria-label="Toggle Map Layers"
        @click="emit('toggle-layer')"
      >
        <span class="material-symbols-outlined icon">layers</span>
        <span class="layer-indicator font-mono">
          {{ activeLayer === 'satellite' ? 'SAT' : 'TOPO' }}
        </span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.map-controls {
  position: absolute;
  top: 48px;
  right: 12px;
  z-index: 35;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8px;
  pointer-events: auto;
}

.control-group {
  display: flex;
  flex-direction: column;
  background-color: rgba(248, 243, 231, 0.95);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border: 1px solid rgba(115, 120, 116, 0.35);
  border-radius: 6px;
  box-shadow: 0 2px 8px rgba(6, 25, 16, 0.12);
  overflow: hidden;
  transition: all 0.15s ease;
}

.control-group:hover {
  border-color: rgba(115, 120, 116, 0.5);
  box-shadow: 0 4px 12px rgba(6, 25, 16, 0.18);
}

.control-btn {
  width: 36px;
  height: 36px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border: none;
  background: transparent;
  color: var(--color-primary);
  cursor: pointer;
  padding: 0;
  transition: background-color 0.15s ease, color 0.15s ease;
}

.control-btn:hover {
  background-color: var(--color-surface-container);
}

.control-btn:active {
  background-color: var(--color-surface-container-highest);
}

.control-divider {
  width: 100%;
  height: 1px;
  background-color: rgba(115, 120, 116, 0.25);
}

.icon {
  font-size: 18px;
  line-height: 1;
}

.location-icon {
  color: var(--color-secondary);
}

.control-btn.locating {
  background-color: rgba(217, 83, 30, 0.1);
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.spin {
  animation: spin 1s linear infinite;
}

.layer-btn {
  height: auto;
  min-height: 36px;
  padding: 4px 0;
  gap: 2px;
}

.layer-btn.active {
  background-color: var(--color-primary);
  color: #ffffff;
}

.layer-btn.active .layer-indicator {
  color: #ffdbcf;
}

.layer-indicator {
  font-size: 8px;
  font-weight: 700;
  letter-spacing: 0.05em;
  color: var(--color-secondary);
  line-height: 1;
}
</style>
