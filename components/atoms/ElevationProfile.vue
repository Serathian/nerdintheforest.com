<script setup lang="ts">
interface Props {
  startElevation?: number
  peakElevation?: number
  currentElevation?: number
  distanceKm?: number
  elevationGain?: number
}

const props = withDefaults(defineProps<Props>(), {
  startElevation: 305,
  peakElevation: 485,
  currentElevation: 485,
  distanceKm: 1.2,
  elevationGain: 180
})
</script>

<template>
  <div class="elevation-profile-container w-full p-3.5 rounded bg-surface-container border border-outline-variant/40 flex flex-col gap-2">
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-1.5">
        <span class="w-1.5 h-1.5 rounded-full bg-secondary" />
        <span class="font-label-sm text-[10px] font-mono uppercase tracking-wider text-primary font-semibold">
          TOPOGRAPHIC PROFILE // ELEVATION
        </span>
      </div>
      <div class="flex items-center gap-2 font-mono text-[10px] text-on-surface-variant font-medium">
        <span>GAIN: <strong class="text-secondary font-bold">+{{ elevationGain }}M</strong></span>
        <span>•</span>
        <span>PEAK: <strong class="text-primary font-bold">{{ peakElevation }}M</strong></span>
      </div>
    </div>

    <!-- SVG Elevation Sparkline -->
    <div class="relative w-full h-20 overflow-hidden rounded bg-surface-container-high/60 border border-outline-variant/20 px-1 pt-2">
      <!-- Topo Grid Lines -->
      <div class="topo-grid">
        <div class="topo-grid-line top">
          {{ peakElevation }}m
        </div>
        <div class="topo-grid-line mid">
          {{ Math.round((startElevation + peakElevation) / 2) }}m
        </div>
        <div class="topo-grid-line bottom">
          {{ startElevation }}m
        </div>
      </div>

      <!-- Vector Profile Curve -->
      <svg
        class="w-full h-full overflow-visible"
        viewBox="0 0 300 70"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="profileGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#1b2e24" stop-opacity="0.25" />
            <stop offset="100%" stop-color="#1b2e24" stop-opacity="0.02" />
          </linearGradient>
        </defs>

        <!-- Area fill under line -->
        <path
          d="M 10 58 Q 60 52, 100 45 T 180 32 T 250 16 L 285 12 L 285 64 L 10 64 Z"
          fill="url(#profileGradient)"
        />

        <!-- Contour elevation stroke line -->
        <path
          d="M 10 58 Q 60 52, 100 45 T 180 32 T 250 16 L 285 12"
          fill="none"
          stroke="#1b2e24"
          stroke-width="2.5"
          stroke-linecap="round"
        />

        <!-- Waypoint Beacon Indicator on peak/destination -->
        <circle cx="285" cy="12" r="6" fill="#d9531e" opacity="0.3" class="animate-ping" />
        <circle cx="285" cy="12" r="4.5" fill="#d9531e" stroke="#ffffff" stroke-width="1.5" />
      </svg>
    </div>

    <!-- Distance Axis Labels -->
    <div class="flex items-center justify-between text-[9px] font-mono text-on-surface-variant/70 px-1">
      <span>START // 0.0 KM</span>
      <span class="text-secondary font-semibold">APPROACH GRADIENT: +15%</span>
      <span>SUMMIT // {{ distanceKm }} KM</span>
    </div>
  </div>
</template>

<style scoped>
.elevation-profile-container {
  user-select: none;
}

.topo-grid {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.topo-grid-line {
  position: absolute;
  left: 8px;
  right: 8px;
  border-bottom: 1px dashed rgba(194, 200, 194, 0.4);
  font-family: var(--font-mono);
  font-size: 8px;
  color: rgba(66, 72, 68, 0.5);
  text-align: right;
  padding-right: 4px;
}

.topo-grid-line.top {
  top: 8px;
}

.topo-grid-line.mid {
  top: 32px;
}

.topo-grid-line.bottom {
  bottom: 8px;
}
</style>
