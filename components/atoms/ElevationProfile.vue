<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  startElevation?: number
  destinationElevation?: number
  currentElevation?: number
  peakElevation?: number
  distanceKm?: number
  elevationGain?: number
  elevationLoss?: number
  trailheadName?: string
  destinationName?: string
}

const props = withDefaults(defineProps<Props>(), {
  startElevation: 350,
  destinationElevation: 500,
  currentElevation: 500,
  peakElevation: 500,
  distanceKm: 1.5,
  elevationGain: 145,
  elevationLoss: 24,
  trailheadName: 'TRAILHEAD',
  destinationName: 'SITE'
})

const destElev = computed(() => props.destinationElevation ?? props.currentElevation ?? props.peakElevation ?? 500)
const startElev = computed(() => props.startElevation ?? 350)
const gain = computed(() => props.elevationGain ?? 0)
const loss = computed(() => props.elevationLoss ?? 0)
const netGain = computed(() => destElev.value - startElev.value)

// Dynamic Topo Bounds
const peakVal = computed(() => Math.max(startElev.value, destElev.value, startElev.value + Math.max(0, gain.value - loss.value)))
const minVal = computed(() => Math.min(startElev.value, destElev.value) - Math.min(loss.value, 30))
const elevRange = computed(() => Math.max(peakVal.value - minVal.value, 30))

// SVG coordinates mapping (ViewBox 300 x 54)
// Usable Y: 8 (highest point) to 44 (lowest point)
function getY(elev: number): number {
  const norm = (elev - minVal.value) / elevRange.value
  return Math.round(44 - norm * 34)
}

const y0 = computed(() => getY(startElev.value))
const y1 = computed(() => getY(startElev.value - (loss.value > 0 ? loss.value * 0.7 : -gain.value * 0.2)))
const y2 = computed(() => getY(Math.round((startElev.value + destElev.value) / 2 + gain.value * 0.15)))
const y3 = computed(() => getY(Math.round(destElev.value - 6)))
const yEnd = computed(() => getY(destElev.value))

const curvePath = computed(() => {
  return `M 12 ${y0.value} C 50 ${y0.value}, 65 ${y1.value}, 90 ${y1.value} C 130 ${y1.value}, 155 ${y2.value}, 185 ${y2.value} C 220 ${y2.value}, 250 ${y3.value}, 288 ${yEnd.value}`
})

const areaPath = computed(() => {
  return `${curvePath.value} L 288 52 L 12 52 Z`
})
</script>

<template>
  <div class="elevation-profile-container">
    <!-- Header with Profile Title & Up/Down Telemetry -->
    <div class="profile-header">
      <div class="header-left">
        <span class="material-symbols-outlined text-[13px] text-primary">terrain</span>
        <span class="header-title font-mono">TRAIL ELEVATION</span>
        <span v-if="distanceKm" class="distance-pill font-mono">{{ distanceKm }} KM</span>
      </div>

      <!-- Up & Down Elevation Stats -->
      <div class="header-right font-mono">
        <span class="elev-stat-up">
          <span class="arrow">↑</span> +{{ elevationGain }}M
        </span>
        <span v-if="elevationLoss != null && elevationLoss > 0" class="elev-stat-down">
          <span class="arrow">↓</span> -{{ elevationLoss }}M
        </span>
      </div>
    </div>

    <!-- SVG Elevation Sparkline -->
    <div class="sparkline-wrapper">
      <!-- Topo Reference Lines & Labels -->
      <div class="topo-grid">
        <div class="topo-grid-line top">
          <span>{{ peakVal }}m</span>
        </div>
        <div class="topo-grid-line bottom">
          <span>{{ minVal }}m</span>
        </div>
      </div>

      <!-- Vector Profile Curve -->
      <svg
        class="profile-svg"
        viewBox="0 0 300 54"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="profileGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#1b2e24" stop-opacity="0.22" />
            <stop offset="100%" stop-color="#1b2e24" stop-opacity="0.02" />
          </linearGradient>
        </defs>

        <!-- Area fill under line -->
        <path
          :d="areaPath"
          fill="url(#profileGradient)"
        />

        <!-- Contour elevation stroke line -->
        <path
          :d="curvePath"
          fill="none"
          stroke="#1b2e24"
          stroke-width="2.2"
          stroke-linecap="round"
          stroke-linejoin="round"
        />

        <!-- Trailhead start marker -->
        <circle :cx="12" :cy="y0" r="3.5" fill="#526056" stroke="#ffffff" stroke-width="1.2" />

        <!-- Waypoint Beacon Indicator on destination -->
        <circle :cx="288" :cy="yEnd" r="6" fill="#d9531e" opacity="0.25" class="animate-ping" />
        <circle :cx="288" :cy="yEnd" r="4" fill="#d9531e" stroke="#ffffff" stroke-width="1.5" />
      </svg>
    </div>

    <!-- Axis Labels Row -->
    <div class="profile-axis-row font-mono">
      <span class="axis-point start">
        <span class="dot trailhead-dot" />
        <span>START // {{ startElev }}M</span>
      </span>
      <span class="axis-net">
        NET {{ netGain >= 0 ? '+' : '' }}{{ netGain }}M
      </span>
      <span class="axis-point end">
        <span>DEST // {{ destElev }}M</span>
        <span class="dot beacon-dot" />
      </span>
    </div>
  </div>
</template>

<style scoped>
.elevation-profile-container {
  width: 100%;
  padding: 8px 10px 7px;
  border-radius: 8px;
  background-color: var(--color-surface-container);
  border: 1px solid rgba(115, 120, 116, 0.28);
  display: flex;
  flex-direction: column;
  gap: 5px;
  user-select: none;
  box-sizing: border-box;
}

.profile-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 5px;
}

.header-title {
  font-size: 9.5px;
  font-weight: 700;
  letter-spacing: 0.08em;
  color: var(--color-primary);
  text-transform: uppercase;
}

.distance-pill {
  font-size: 8.5px;
  font-weight: 600;
  letter-spacing: 0.05em;
  color: var(--color-secondary);
  background-color: rgba(27, 46, 36, 0.06);
  padding: 1px 5px;
  border-radius: 3px;
  border: 1px solid rgba(115, 120, 116, 0.2);
}

.header-right {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.04em;
}

.elev-stat-up {
  color: #1b2e24;
  display: inline-flex;
  align-items: center;
  gap: 2px;
}

.elev-stat-up .arrow {
  color: #2e6047;
  font-weight: 800;
}

.elev-stat-down {
  color: #8b5a3c;
  display: inline-flex;
  align-items: center;
  gap: 2px;
}

.elev-stat-down .arrow {
  color: #8b5a3c;
  font-weight: 800;
}

.sparkline-wrapper {
  position: relative;
  width: 100%;
  height: 48px;
  overflow: hidden;
  border-radius: 5px;
  background-color: rgba(254, 249, 237, 0.65);
  border: 1px solid rgba(115, 120, 116, 0.2);
  padding: 0;
}

.topo-grid {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.topo-grid-line {
  position: absolute;
  left: 6px;
  right: 6px;
  display: flex;
  justify-content: flex-end;
  padding-right: 14px;
  font-family: var(--font-mono);
  font-size: 8px;
  color: rgba(66, 72, 68, 0.5);
  line-height: 1;
}

.topo-grid-line.top {
  top: 5px;
  border-bottom: 1px dashed rgba(194, 200, 194, 0.45);
  padding-bottom: 2px;
}

.topo-grid-line.bottom {
  bottom: 5px;
  border-top: 1px dashed rgba(194, 200, 194, 0.35);
  padding-top: 2px;
}

.profile-svg {
  width: 100%;
  height: 100%;
  overflow: visible;
  display: block;
}

.profile-axis-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 8.5px;
  letter-spacing: 0.05em;
  color: var(--color-lichen-slate);
  padding: 0 2px;
}

.axis-point {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 42%;
}

.axis-net {
  color: var(--color-secondary);
  font-weight: 700;
  font-size: 8.5px;
}

.dot {
  width: 5px;
  height: 5px;
  border-radius: 9999px;
  flex-shrink: 0;
}

.trailhead-dot {
  background-color: #526056;
}

.beacon-dot {
  background-color: #d9531e;
}
</style>
