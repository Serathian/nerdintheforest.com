<script setup lang="ts">
import { computed } from 'vue'

interface Amenity {
  icon: string
  label: string
}

interface FieldNote {
  id: string
  numberTag: string
  title: string
  areaId?: string
  area?: string
  description: string
  timeAgo: string
  visitedCount?: number
  amenities: Amenity[]
  footerFeature: string
  footerIcon?: string
  metrics: string
  latitude?: number
  longitude?: number
  elevation?: number
  trailhead?: { name: string; latitude: number; longitude: number }
}

interface Props {
  note: FieldNote | null
  isOpen: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'read-story', note: FieldNote): void
}>()

const lat = computed(() => props.note?.latitude ?? 60.25)
const lng = computed(() => props.note?.longitude ?? 10.7167)

function handleNavigateTrailhead() {
  if (!props.note?.trailhead) return
  const destLat = props.note.trailhead.latitude
  const destLng = props.note.trailhead.longitude
  if (typeof window !== 'undefined') {
    const isApple = /Mac|iPhone|iPad|iPod/.test(navigator.userAgent)
    const url = isApple
      ? `maps://maps.apple.com/?daddr=${destLat},${destLng}&dirflg=d`
      : `https://www.google.com/maps/dir/?api=1&destination=${destLat},${destLng}`
    window.open(url, '_blank')
  }
}
</script>

<template>
  <Transition name="sheet-slide">
    <div
      v-if="isOpen && note"
      class="dossier-sheet-wrapper"
    >
      <!-- Backdrop Dimmer on mobile touch -->
      <div
        class="dossier-backdrop"
        @click="emit('close')"
      />

      <!-- Sheet Container -->
      <div class="dossier-sheet">
        <!-- Top Drag Handle & Close Header -->
        <div class="dossier-header">
          <div class="flex items-center gap-2">
            <span class="font-label-sm text-[10px] font-mono text-secondary font-bold uppercase tracking-wider">
              {{ note.numberTag }}
            </span>
            <span
              v-if="note.area"
              class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded font-label-sm text-[9px] font-mono font-bold uppercase bg-secondary/10 text-secondary border border-secondary/30"
            >
              <span class="material-symbols-outlined text-[10px]">public</span>
              {{ note.area }}
            </span>
            <span
              v-if="(note.visitedCount ?? 0) > 0"
              class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded font-label-sm text-[9px] font-mono font-semibold uppercase bg-primary-container text-inverse-primary border border-primary/40"
            >
              <span class="material-symbols-outlined text-[10px]" style="font-variation-settings: 'FILL' 1;">check_circle</span>
              VISITED {{ note.visitedCount }}x
            </span>
            <span
              v-else
              class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded font-label-sm text-[9px] font-mono font-medium uppercase bg-surface-container text-on-surface-variant border border-outline/30"
            >
              NOT VISITED
            </span>
          </div>

          <button
            aria-label="Close Dossier"
            class="w-7 h-7 rounded-full bg-surface-container hover:bg-surface-container-highest border border-outline-variant/50 flex items-center justify-center text-on-surface-variant hover:text-primary transition-all active:scale-95"
            type="button"
            @click="emit('close')"
          >
            <span class="material-symbols-outlined text-[16px]">close</span>
          </button>
        </div>

        <!-- Scrollable Dossier Body -->
        <div class="overflow-y-auto px-4 py-3 flex flex-col gap-3.5 scrollbar-none flex-1">
          <!-- Title & Sector -->
          <div>
            <div class="flex items-baseline justify-between gap-2">
              <h1 class="font-headline-md text-[22px] leading-tight text-primary font-medium tracking-tight font-serif">
                {{ note.title }}
              </h1>
              <span class="font-label-sm text-[10px] font-mono text-on-surface-variant/70 shrink-0">
                {{ note.timeAgo }}
              </span>
            </div>
            <p class="font-label-sm text-[10px] font-mono text-lichen-slate uppercase tracking-wider mt-0.5">
              SECTOR // BLÅVANN NW • NORWEGIAN BOREAL HIGHLANDS
            </p>
          </div>

          <!-- Coordinate Stamp -->
          <div class="flex items-center gap-2">
            <CoordinateStamp :lat="lat" :lng="lng" />
            <span class="font-label-sm text-[10px] font-mono text-on-surface-variant/60">
              TAP GPS TO COPY
            </span>
          </div>

          <!-- Editorial Field Notes Dispatch -->
          <div class="p-3.5 rounded bg-surface-container-low border border-outline-variant/30 flex flex-col gap-1.5">
            <div class="flex items-center gap-1.5 border-b border-outline-variant/20 pb-1.5">
              <span class="material-symbols-outlined text-[14px] text-secondary">edit_note</span>
              <span class="font-label-sm text-[10px] font-mono uppercase text-primary font-semibold">
                SURVEYOR FIELD DISPATCH
              </span>
            </div>
            <p class="font-body-md text-[14px] leading-relaxed text-on-surface font-serif">
              {{ note.description }}
            </p>
          </div>

          <!-- Amenities List -->
          <div>
            <span class="font-label-sm text-[10px] font-mono uppercase tracking-wider text-lichen-slate block mb-1.5">
              WAYPOINT PROVISIONS & AMENITIES
            </span>
            <div v-if="note.amenities && note.amenities.length > 0" class="flex flex-wrap gap-1.5">
              <span
                v-for="(amenity, idx) in note.amenities"
                :key="idx"
                class="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-surface-container border border-outline/25 text-primary text-[11px] font-mono font-medium"
              >
                <span class="material-symbols-outlined text-[13px] text-secondary">{{ amenity.icon }}</span>
                {{ amenity.label }}
              </span>
            </div>
            <div v-else class="text-[11px] font-mono text-lichen-slate/80 italic flex items-center gap-1.5 py-1">
              <span class="material-symbols-outlined text-[14px]">shield_with_heart</span>
              <span>Site unvisited • Provisions unverified until on-site survey</span>
            </div>
          </div>
        </div>

        <!-- Sticky Action Buttons Footer -->
        <div class="px-4 py-3 border-t border-outline-variant/40 bg-surface-container-high/90 backdrop-blur flex items-center gap-2 shrink-0 pb-safe">
          <button
            v-if="(note.visitedCount ?? 0) > 0"
            class="flex-1 h-11 rounded bg-primary hover:bg-primary-container text-white font-mono text-[11px] font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm active:scale-98 transition-all"
            type="button"
            @click="emit('read-story', note)"
          >
            <span>READ FULL STORY</span>
            <span class="material-symbols-outlined text-[15px]">menu_book</span>
          </button>
          <button
            v-else
            class="flex-1 h-11 rounded bg-surface-container text-on-surface-variant/40 border border-outline/20 font-mono text-[11px] font-medium uppercase tracking-wider flex items-center justify-center gap-2 cursor-not-allowed opacity-60"
            type="button"
            disabled
            title="No field dispatches logged for unvisited sites"
          >
            <span>NO DISPATCHES</span>
            <span class="material-symbols-outlined text-[15px]">drafts</span>
          </button>

          <button
            v-if="note.trailhead"
            class="flex-1 h-11 rounded bg-surface-container-highest hover:bg-surface-container border border-outline/35 text-primary font-mono text-[11px] font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm active:scale-98 transition-all"
            type="button"
            title="Directions to trailhead"
            @click="handleNavigateTrailhead"
          >
            <span>NAVIGATE TRAILHEAD</span>
            <span class="material-symbols-outlined text-[15px]">directions</span>
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.dossier-sheet-wrapper {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  top: 0;
  z-index: 60;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  align-items: center;
  pointer-events: none;
}

.dossier-backdrop {
  position: fixed;
  inset: 0;
  background-color: rgba(6, 25, 16, 0.35);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  pointer-events: auto;
}

.dossier-sheet {
  position: relative;
  width: 100%;
  max-width: 600px;
  max-height: 85vh;
  background-color: var(--color-surface);
  border-top-left-radius: 16px;
  border-top-right-radius: 16px;
  border-top: 1px solid rgba(115, 120, 116, 0.3);
  box-shadow: 0 -12px 32px rgba(6, 25, 16, 0.25);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  pointer-events: auto;
  z-index: 1;
}

.dossier-header {
  width: 100%;
  padding: 12px 16px 8px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid rgba(194, 200, 194, 0.3);
  background-color: var(--color-surface-container-low);
  flex-shrink: 0;
}

.sheet-slide-enter-active,
.sheet-slide-leave-active {
  transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.25s ease;
}

.sheet-slide-enter-from,
.sheet-slide-leave-to {
  transform: translateY(100%);
  opacity: 0;
}
</style>
