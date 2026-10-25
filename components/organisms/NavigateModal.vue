<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useTrailheadNav } from '~/composables/useTrailheadNav'

const { navTarget, closeTrailheadModal } = useTrailheadNav()
const copied = ref(false)

watch(navTarget, () => {
  copied.value = false
})

const formattedDecimalCoords = computed(() => {
  if (!navTarget.value) return ''
  return `${navTarget.value.lat.toFixed(5)}, ${navTarget.value.lng.toFixed(5)}`
})

const formattedCardinalCoords = computed(() => {
  if (!navTarget.value) return ''
  const latDir = navTarget.value.lat >= 0 ? 'N' : 'S'
  const lngDir = navTarget.value.lng >= 0 ? 'E' : 'W'
  return `${Math.abs(navTarget.value.lat).toFixed(4)}°${latDir} • ${Math.abs(navTarget.value.lng).toFixed(4)}°${lngDir}`
})

const googleMapsUrl = computed(() => {
  if (!navTarget.value) return '#'
  const { lat, lng } = navTarget.value
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`
})

function handleOpenGoogleMaps() {
  if (!navTarget.value || typeof window === 'undefined') return
  window.open(googleMapsUrl.value, '_blank', 'noopener,noreferrer')
  closeTrailheadModal()
}

async function handleCopyCoordinates() {
  if (!navTarget.value || typeof window === 'undefined') return
  const text = `${navTarget.value.lat}, ${navTarget.value.lng}`
  try {
    await navigator.clipboard.writeText(text)
    copied.value = true
    setTimeout(() => {
      copied.value = false
    }, 2200)
  } catch {
    // Fallback copy if clipboard API blocked
    const textarea = document.createElement('textarea')
    textarea.value = text
    document.body.appendChild(textarea)
    textarea.select()
    document.execCommand('copy')
    document.body.removeChild(textarea)
    copied.value = true
    setTimeout(() => {
      copied.value = false
    }, 2200)
  }
}
</script>

<template>
  <Teleport to="body">
    <Transition name="nav-modal-fade">
      <div
        v-if="navTarget"
        class="nav-modal-overlay"
        role="dialog"
        aria-modal="true"
        aria-labelledby="nav-modal-title"
      >
        <div class="nav-modal-backdrop" @click="closeTrailheadModal" />

        <div class="nav-modal-card">
          <!-- Header -->
          <div class="nav-modal-header font-mono">
            <div class="header-left">
              <span class="header-icon-badge">
                <span class="material-symbols-outlined text-[15px]">directions</span>
              </span>
              <span id="nav-modal-title" class="header-title">NAVIGATE TO TRAILHEAD</span>
            </div>

            <button
              class="close-btn"
              type="button"
              aria-label="Close navigation modal"
              @click="closeTrailheadModal"
            >
              <span class="material-symbols-outlined text-[16px]">close</span>
            </button>
          </div>

          <!-- Destination Info -->
          <div class="nav-modal-body">
            <div class="destination-info">
              <span v-if="navTarget.locationName" class="destination-sub font-mono">
                ACCESS POINT FOR {{ navTarget.locationName.toUpperCase() }}
              </span>
              <h3 class="destination-name font-serif">
                {{ navTarget.trailheadName }}
              </h3>
            </div>

            <!-- Coordinates Readout -->
            <div class="coords-box font-mono">
              <div class="coords-row">
                <span class="material-symbols-outlined coords-icon">my_location</span>
                <span class="coords-decimal">{{ formattedDecimalCoords }}</span>
              </div>
              <span class="coords-cardinal">[{{ formattedCardinalCoords }}]</span>
            </div>

            <!-- Action Buttons -->
            <div class="nav-actions-col font-mono">
              <button
                class="nav-option-btn google-maps-btn"
                type="button"
                @click="handleOpenGoogleMaps"
              >
                <span class="material-symbols-outlined btn-icon">map</span>
                <span>OPEN IN GOOGLE MAPS</span>
                <span class="material-symbols-outlined external-icon">open_in_new</span>
              </button>

              <button
                :class="['nav-option-btn copy-coords-btn', { 'is-copied': copied }]"
                type="button"
                @click="handleCopyCoordinates"
              >
                <span class="material-symbols-outlined btn-icon">
                  {{ copied ? 'check_circle' : 'content_copy' }}
                </span>
                <span>{{ copied ? 'COORDINATES COPIED' : 'COPY COORDINATES' }}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.nav-modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 120;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
}

.nav-modal-backdrop {
  position: fixed;
  inset: 0;
  background-color: rgba(6, 25, 16, 0.48);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
}

.nav-modal-card {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 360px;
  border-radius: 12px;
  background-color: var(--color-floating-bg, #faf4e8);
  border: 1.5px solid rgba(27, 46, 36, 0.25);
  box-shadow: 0 16px 40px rgba(6, 25, 16, 0.28);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.nav-modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 14px;
  background-color: var(--color-surface-container-high, #e5d6b8);
  border-bottom: 1px solid rgba(115, 120, 116, 0.35);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.header-icon-badge {
  width: 24px;
  height: 24px;
  border-radius: 6px;
  background-color: var(--color-secondary, #d9531e);
  color: #ffffff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.header-title {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.08em;
  color: var(--color-primary, #1b2e24);
}

.close-btn {
  width: 26px;
  height: 26px;
  border-radius: 9999px;
  background-color: rgba(250, 244, 232, 0.8);
  border: 1px solid rgba(115, 120, 116, 0.35);
  color: var(--color-on-surface, #1d1c14);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.15s ease;
}

.close-btn:hover {
  background-color: var(--color-secondary, #d9531e);
  border-color: var(--color-secondary, #d9531e);
  color: #ffffff;
}

.nav-modal-body {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.destination-info {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.destination-sub {
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.07em;
  color: var(--color-secondary, #d9531e);
}

.destination-name {
  font-size: 20px;
  line-height: 1.2;
  font-weight: 500;
  color: var(--color-primary, #1b2e24);
  margin: 0;
}

.coords-box {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 8px 10px;
  border-radius: 6px;
  background-color: var(--color-surface-container, #eedfc5);
  border: 1px solid rgba(115, 120, 116, 0.3);
}

.coords-row {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.coords-icon {
  font-size: 14px;
  color: var(--color-secondary, #d9531e);
}

.coords-decimal {
  font-size: 11px;
  font-weight: 700;
  color: var(--color-primary, #1b2e24);
}

.coords-cardinal {
  font-size: 9.5px;
  color: var(--color-lichen-slate, #526056);
}

.nav-actions-col {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.nav-option-btn {
  width: 100%;
  height: 40px;
  padding: 0 14px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;
  transition: all 0.16s ease;
}

.google-maps-btn {
  background-color: var(--color-primary, #1b2e24);
  color: #ffffff;
  border: 1px solid var(--color-primary, #1b2e24);
}

.google-maps-btn:hover {
  background-color: var(--color-secondary, #d9531e);
  border-color: var(--color-secondary, #d9531e);
}

.copy-coords-btn {
  background-color: #ffffff;
  color: var(--color-primary, #1b2e24);
  border: 1px solid rgba(27, 46, 36, 0.25);
}

.copy-coords-btn:hover {
  background-color: var(--color-surface-container-low, #f7f0e2);
  border-color: var(--color-primary, #1b2e24);
}

.copy-coords-btn.is-copied {
  background-color: rgba(27, 46, 36, 0.08);
  border-color: var(--color-primary, #1b2e24);
  color: var(--color-primary, #1b2e24);
}

.btn-icon {
  font-size: 15px;
}

.external-icon {
  font-size: 13px;
  opacity: 0.8;
  margin-left: auto;
}

.nav-modal-fade-enter-active,
.nav-modal-fade-leave-active {
  transition: opacity 0.2s ease;
}

.nav-modal-fade-enter-active .nav-modal-card,
.nav-modal-fade-leave-active .nav-modal-card {
  transition: transform 0.22s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.2s ease;
}

.nav-modal-fade-enter-from,
.nav-modal-fade-leave-to {
  opacity: 0;
}

.nav-modal-fade-enter-from .nav-modal-card,
.nav-modal-fade-leave-to .nav-modal-card {
  transform: scale(0.95) translateY(8px);
  opacity: 0;
}
</style>
