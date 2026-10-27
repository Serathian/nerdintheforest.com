<script setup lang="ts">
import { ref, computed } from 'vue'
import { extractElevationTelemetry } from '~/utils/geo'

export interface ElevationProfileWaypoint {
  order: number
  title: string
  fraction: number
  elevation?: number
}

export interface ElevationHighlightedRange {
  startFraction: number
  endFraction: number
  label?: string
  distanceFormatted?: string
  elevationGain?: number
  elevationLoss?: number
  startOrder?: number
  endOrder?: number
}

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
  segmentLabel?: string
  samples?: number[]
  routeGeometry?: Array<[number, number]> | null
  waypoints?: ElevationProfileWaypoint[]
  highlightedRange?: ElevationHighlightedRange | null
  hoveredWaypointOrder?: number | null
}

const props = withDefaults(defineProps<Props>(), {
  startElevation: 350,
  destinationElevation: 500,
  currentElevation: 500,
  peakElevation: 500,
  distanceKm: 1.5,
  elevationGain: 145,
  elevationLoss: 24,
  trailheadName: 'START',
  destinationName: 'FINISH',
  segmentLabel: '',
  samples: undefined,
  routeGeometry: null,
  waypoints: () => [],
  highlightedRange: null,
  hoveredWaypointOrder: null
})

const SVG_WIDTH = 360
const SVG_HEIGHT = 72
const X_START = 12
const X_END = 348
const Y_TOP = 14
const Y_BOTTOM = 58

const telemetry = computed(() => {
  const fallbackStart = Math.round(props.startElevation ?? 350)
  const fallbackDest = Math.round(
    props.destinationElevation ?? props.currentElevation ?? props.peakElevation ?? 500
  )
  const fallbackGain = Math.max(0, Math.round(props.elevationGain ?? 0))
  const fallbackLoss = Math.max(0, Math.round(props.elevationLoss ?? 0))

  if (Array.isArray(props.samples) && props.samples.length >= 4) {
    const s = props.samples.map(v => Number(v))
    return {
      samples: s,
      startElevation: Math.round(s[0]),
      destinationElevation: Math.round(s[s.length - 1]),
      elevationGain: fallbackGain,
      elevationLoss: fallbackLoss,
      minElevation: Math.round(Math.min(...s)),
      maxElevation: Math.round(Math.max(...s)),
      hasMeasuredElevation: true
    }
  }

  const anchors = (props.waypoints || [])
    .filter(w => w.elevation != null && w.fraction > 0.02 && w.fraction < 0.98)
    .map(w => ({ fraction: w.fraction, elevation: Number(w.elevation) }))

  return extractElevationTelemetry({
    geometry: props.routeGeometry,
    startElevation: fallbackStart,
    destinationElevation: fallbackDest,
    elevationGain: fallbackGain,
    elevationLoss: fallbackLoss,
    anchors,
    sampleCount: 56
  })
})

const profileSamples = computed(() => telemetry.value.samples)
const startElev = computed(() => telemetry.value.startElevation)
const destElev = computed(() => telemetry.value.destinationElevation)
const gain = computed(() =>
  props.elevationGain != null && props.elevationGain > 0 && !telemetry.value.hasMeasuredElevation
    ? Math.round(props.elevationGain)
    : telemetry.value.elevationGain || Math.round(props.elevationGain ?? 0)
)
const loss = computed(() =>
  props.elevationLoss != null && props.elevationLoss > 0 && !telemetry.value.hasMeasuredElevation
    ? Math.round(props.elevationLoss)
    : telemetry.value.elevationLoss || Math.round(props.elevationLoss ?? 0)
)
const netGain = computed(() => destElev.value - startElev.value)

const formattedDistanceKm = computed(() => {
  if (!props.distanceKm) return null
  return Number(Number(props.distanceKm).toFixed(1))
})

// Dynamic Topo Bounds strictly enveloping all profile samples with breathing headroom
const peakVal = computed(() => {
  const maxPoint = Math.max(...profileSamples.value)
  const minPoint = Math.min(...profileSamples.value)
  const span = Math.max(maxPoint - minPoint, 12)
  const pad = Math.max(3, Math.round(span * 0.14))
  return Math.round(maxPoint + pad)
})

const minVal = computed(() => {
  const maxPoint = Math.max(...profileSamples.value)
  const minPoint = Math.min(...profileSamples.value)
  const span = Math.max(maxPoint - minPoint, 12)
  const pad = Math.max(3, Math.round(span * 0.12))
  return Math.max(0, Math.round(minPoint - pad))
})

const midVal = computed(() => Math.round((peakVal.value + minVal.value) / 2))
const elevRange = computed(() => Math.max(peakVal.value - minVal.value, 10))

function getX(fraction: number): number {
  const f = Math.max(0, Math.min(1, fraction))
  return Math.round((X_START + f * (X_END - X_START)) * 10) / 10
}

function getY(elev: number): number {
  const rawNorm = (elev - minVal.value) / elevRange.value
  const norm = Math.max(0, Math.min(1, rawNorm))
  return Math.round((Y_BOTTOM - norm * (Y_BOTTOM - Y_TOP)) * 10) / 10
}

function interpolateElevAtFraction(fraction: number): number {
  const arr = profileSamples.value
  if (arr.length === 0) return startElev.value
  if (arr.length === 1) return arr[0]
  const f = Math.max(0, Math.min(1, fraction))
  const exactIdx = f * (arr.length - 1)
  const idx0 = Math.floor(exactIdx)
  const idx1 = Math.min(arr.length - 1, idx0 + 1)
  const t = exactIdx - idx0
  return arr[idx0] + (arr[idx1] - arr[idx0]) * t
}

const samplePoints = computed(() => {
  const arr = profileSamples.value
  const n = arr.length
  return arr.map((elev, i) => {
    const fraction = n > 1 ? i / (n - 1) : 0
    return {
      x: getX(fraction),
      y: getY(elev),
      elev: Math.round(elev),
      rawElev: elev,
      fraction
    }
  })
})

function buildSmoothPath(pts: Array<{ x: number; y: number }>): string {
  if (pts.length === 0) return ''
  if (pts.length === 1) return `M ${pts[0].x} ${pts[0].y}`

  let d = `M ${pts[0].x} ${pts[0].y}`
  for (let i = 1; i < pts.length; i++) {
    const prev = pts[i - 1]
    const curr = pts[i]
    const midX = Math.round(((prev.x + curr.x) / 2) * 10) / 10
    const midY = Math.round(((prev.y + curr.y) / 2) * 10) / 10
    if (i === 1) {
      d += ` L ${midX} ${midY}`
    } else {
      d += ` Q ${prev.x} ${prev.y} ${midX} ${midY}`
    }
  }
  const last = pts[pts.length - 1]
  d += ` L ${last.x} ${last.y}`
  return d
}

const curvePath = computed(() => buildSmoothPath(samplePoints.value))

const echoCurvePath = computed(() => {
  const pts = samplePoints.value
  if (pts.length < 2) return ''
  let d = `M ${pts[0].x} ${Math.min(Y_BOTTOM + 4, pts[0].y + 3.5)}`
  for (let i = 1; i < pts.length; i++) {
    const curr = pts[i]
    d += ` L ${curr.x} ${Math.min(Y_BOTTOM + 4, Math.round((curr.y + 3.5) * 10) / 10)}`
  }
  return d
})

const areaPath = computed(() => {
  const pts = samplePoints.value
  if (pts.length < 2) return ''
  const first = pts[0]
  const last = pts[pts.length - 1]
  return `${curvePath.value} L ${last.x} ${SVG_HEIGHT - 4} L ${first.x} ${SVG_HEIGHT - 4} Z`
})

// Highlighted sub-range (when hovering a leg in the timeline breakdown)
const activeHighlightSegment = computed(() => {
  const r = props.highlightedRange
  if (!r) return null
  const f0 = Math.max(0, Math.min(1, Math.min(r.startFraction, r.endFraction)))
  const f1 = Math.max(0, Math.min(1, Math.max(r.startFraction, r.endFraction)))
  if (f1 - f0 < 0.005) return null

  const startElevVal = interpolateElevAtFraction(f0)
  const endElevVal = interpolateElevAtFraction(f1)
  const subPts: Array<{ x: number; y: number }> = [
    { x: getX(f0), y: getY(startElevVal) }
  ]

  for (const pt of samplePoints.value) {
    if (pt.fraction > f0 + 0.002 && pt.fraction < f1 - 0.002) {
      subPts.push({ x: pt.x, y: pt.y })
    }
  }

  subPts.push({ x: getX(f1), y: getY(endElevVal) })

  const strokePath = buildSmoothPath(subPts)
  const first = subPts[0]
  const last = subPts[subPts.length - 1]
  const fillPath = `${strokePath} L ${last.x} ${SVG_HEIGHT - 4} L ${first.x} ${SVG_HEIGHT - 4} Z`

  return {
    startX: first.x,
    startY: first.y,
    endX: last.x,
    endY: last.y,
    strokePath,
    fillPath,
    label: r.label,
    distanceFormatted: r.distanceFormatted,
    elevationGain: r.elevationGain,
    elevationLoss: r.elevationLoss,
    startOrder: r.startOrder,
    endOrder: r.endOrder
  }
})

const y0 = computed(() => samplePoints.value[0]?.y ?? getY(startElev.value))
const yEnd = computed(() => samplePoints.value[samplePoints.value.length - 1]?.y ?? getY(destElev.value))

// Highest point along the profile for summit badge callout
const summitPoint = computed(() => {
  const pts = samplePoints.value
  if (pts.length === 0) return null
  let best = pts[0]
  for (const p of pts) {
    if (p.rawElev > best.rawElev) best = p
  }
  return best
})

// Plotted intermediate/endpoint waypoint markers along the terrain curve
const plottedWaypoints = computed(() => {
  if (!props.waypoints || props.waypoints.length === 0) return []
  const pts = samplePoints.value
  if (pts.length === 0) return []

  return props.waypoints.map((wp) => {
    const f = Math.max(0, Math.min(1, wp.fraction))
    const sampleIdx = Math.min(pts.length - 1, Math.max(0, Math.round(f * (pts.length - 1))))
    const samplePt = pts[sampleIdx]
    const isDirectHover = props.hoveredWaypointOrder === wp.order
    const isRangeEndpoint =
      !!activeHighlightSegment.value &&
      (wp.order === activeHighlightSegment.value.startOrder ||
        wp.order === activeHighlightSegment.value.endOrder)

    return {
      order: wp.order,
      title: wp.title,
      x: getX(f),
      y: samplePt ? samplePt.y : getY(wp.elevation ?? startElev.value),
      elevation: wp.elevation != null ? Math.round(wp.elevation) : (samplePt?.elev ?? startElev.value),
      isHighlighted: isDirectHover || isRangeEndpoint,
      isDirectHover
    }
  })
})

const hoveredWaypointPoint = computed(() => {
  if (props.hoveredWaypointOrder == null) return null
  return plottedWaypoints.value.find(w => w.order === props.hoveredWaypointOrder) || null
})

// Interactive Crosshair Scrubber
const hoverFraction = ref<number | null>(null)

const hoverPoint = computed(() => {
  if (hoverFraction.value === null) return null
  const pts = samplePoints.value
  if (pts.length < 2) return null

  const f = Math.max(0, Math.min(1, hoverFraction.value))
  const exactIdx = f * (pts.length - 1)
  const idx = Math.min(pts.length - 1, Math.max(0, Math.round(exactIdx)))
  const pt = pts[idx]

  const totalDist = Number(props.distanceKm || 0)
  const distKm = Number((f * totalDist).toFixed(1))

  // Local grade (%) between surrounding samples
  const prevIdx = Math.max(0, idx - 1)
  const nextIdx = Math.min(pts.length - 1, idx + 1)
  const dElev = pts[nextIdx].rawElev - pts[prevIdx].rawElev
  const dDistM = ((nextIdx - prevIdx) / (pts.length - 1)) * totalDist * 1000
  const gradePct = dDistM > 5 ? Math.round((dElev / dDistM) * 1000) / 10 : 0
  const gradeStr = `${gradePct >= 0 ? '+' : ''}${gradePct.toFixed(1)}%`

  return {
    x: pt.x,
    y: pt.y,
    elev: pt.elev,
    distKm,
    gradeStr
  }
})

function updateHoverFromClientX(clientX: number, target: HTMLElement | null) {
  if (!target) return
  const rect = target.getBoundingClientRect()
  if (rect.width <= 0) return
  const relX = (clientX - rect.left) / rect.width
  hoverFraction.value = Math.max(0, Math.min(1, relX))
}

function handlePointerMove(e: MouseEvent) {
  updateHoverFromClientX(e.clientX, e.currentTarget as HTMLElement)
}

function handleTouchMove(e: TouchEvent) {
  const touch = e.touches?.[0]
  if (!touch) return
  updateHoverFromClientX(touch.clientX, e.currentTarget as HTMLElement)
}

function clearHover() {
  hoverFraction.value = null
}
</script>

<template>
  <div class="elevation-profile-container">
    <!-- Header with Profile Title, Segment Pill & Up/Down/Scrub Telemetry -->
    <div class="profile-header">
      <div class="header-left">
        <span class="material-symbols-outlined text-[13px] text-secondary">terrain</span>
        <span class="header-title font-mono">TRAIL ELEVATION</span>
        <span v-if="activeHighlightSegment?.label" class="segment-pill is-highlighted font-mono">
          {{ activeHighlightSegment.label }}
        </span>
        <span v-else-if="segmentLabel" class="segment-pill font-mono">{{ segmentLabel }}</span>
        <span v-if="activeHighlightSegment?.distanceFormatted" class="distance-pill font-mono">
          {{ activeHighlightSegment.distanceFormatted }}
        </span>
        <span v-else-if="formattedDistanceKm" class="distance-pill font-mono">{{ formattedDistanceKm }} KM</span>
      </div>

      <!-- Live Crosshair Readout, Hovered Waypoint/Leg Preview, OR Summary Ascent/Descent Stats -->
      <div class="header-right font-mono">
        <template v-if="hoverPoint">
          <span class="scrub-telemetry-pill">
            <span>{{ hoverPoint.distKm }} KM</span>
            <span class="scrub-sep">•</span>
            <strong>{{ hoverPoint.elev }}M</strong>
            <span class="scrub-grade">{{ hoverPoint.gradeStr }}</span>
          </span>
        </template>
        <template v-else-if="hoveredWaypointPoint">
          <span class="scrub-telemetry-pill">
            <span class="scrub-grade">#{{ hoveredWaypointPoint.order }}</span>
            <span>{{ hoveredWaypointPoint.title.toUpperCase() }}</span>
            <span class="scrub-sep">•</span>
            <strong>{{ hoveredWaypointPoint.elevation }}M</strong>
          </span>
        </template>
        <template v-else-if="activeHighlightSegment && activeHighlightSegment.elevationGain != null">
          <span class="elev-stat-up" title="Leg Ascent">
            <span class="arrow">↑</span> +{{ activeHighlightSegment.elevationGain }}M
          </span>
          <span v-if="activeHighlightSegment.elevationLoss != null && activeHighlightSegment.elevationLoss > 0" class="elev-stat-down" title="Leg Descent">
            <span class="arrow">↓</span> -{{ activeHighlightSegment.elevationLoss }}M
          </span>
        </template>
        <template v-else>
          <span class="elev-stat-up" title="Total Ascent">
            <span class="arrow">↑</span> +{{ gain }}M
          </span>
          <span v-if="loss > 0" class="elev-stat-down" title="Total Descent">
            <span class="arrow">↓</span> -{{ loss }}M
          </span>
        </template>
      </div>
    </div>

    <!-- Interactive SVG Topographic Elevation Canvas -->
    <div
      class="sparkline-wrapper"
      @mousemove="handlePointerMove"
      @mouseleave="clearHover"
      @touchstart.passive="handleTouchMove"
      @touchmove.passive="handleTouchMove"
      @touchend="clearHover"
    >
      <!-- Topographic Elevation & Distance Grid -->
      <div class="topo-grid">
        <div class="topo-v-line" style="left: 25%" />
        <div class="topo-v-line" style="left: 50%" />
        <div class="topo-v-line" style="left: 75%" />

        <div class="topo-grid-line top">
          <span class="scale-tag">{{ peakVal }}m</span>
        </div>
        <div class="topo-grid-line mid">
          <span class="scale-tag mid-tag">{{ midVal }}m</span>
        </div>
        <div class="topo-grid-line bottom">
          <span class="scale-tag">{{ minVal }}m</span>
        </div>
      </div>

      <!-- High-Resolution Vector Terrain Profile -->
      <svg
        class="profile-svg"
        :viewBox="`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="profileGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#1b2e24" stop-opacity="0.30" />
            <stop offset="58%" stop-color="#2e6047" stop-opacity="0.12" />
            <stop offset="100%" stop-color="#d9531e" stop-opacity="0.03" />
          </linearGradient>
          <linearGradient id="highlightRangeGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#d9531e" stop-opacity="0.38" />
            <stop offset="65%" stop-color="#d9531e" stop-opacity="0.16" />
            <stop offset="100%" stop-color="#d9531e" stop-opacity="0.04" />
          </linearGradient>
        </defs>

        <!-- Shaded terrain strata under ridge -->
        <path
          :d="areaPath"
          fill="url(#profileGradient)"
          :opacity="activeHighlightSegment ? 0.42 : 1"
        />

        <!-- Secondary surveyor echo contour line -->
        <path
          v-if="echoCurvePath"
          :d="echoCurvePath"
          fill="none"
          stroke="#1b2e24"
          :stroke-opacity="activeHighlightSegment ? 0.08 : 0.18"
          stroke-width="1"
          stroke-dasharray="2.5 2.5"
        />

        <!-- Waypoint vertical drop-lines to baseline -->
        <line
          v-for="wp in plottedWaypoints"
          :key="`drop-${wp.order}`"
          :x1="wp.x"
          :y1="wp.y"
          :x2="wp.x"
          :y2="SVG_HEIGHT - 4"
          stroke="#d9531e"
          :stroke-opacity="wp.isHighlighted ? 0.85 : 0.32"
          :stroke-width="wp.isHighlighted ? 1.5 : 1"
          stroke-dasharray="2 2"
        />

        <!-- Primary topographic ridge stroke -->
        <path
          :d="curvePath"
          fill="none"
          stroke="#1b2e24"
          :stroke-opacity="activeHighlightSegment ? 0.35 : 1"
          stroke-width="2.1"
          stroke-linecap="round"
          stroke-linejoin="round"
        />

        <!-- Hovered Leg Highlighted Band & Ridge Segment -->
        <g v-if="activeHighlightSegment">
          <line
            :x1="activeHighlightSegment.startX"
            :y1="6"
            :x2="activeHighlightSegment.startX"
            :y2="SVG_HEIGHT - 4"
            stroke="#d9531e"
            stroke-opacity="0.6"
            stroke-width="1.1"
            stroke-dasharray="2 2"
          />
          <line
            :x1="activeHighlightSegment.endX"
            :y1="6"
            :x2="activeHighlightSegment.endX"
            :y2="SVG_HEIGHT - 4"
            stroke="#d9531e"
            stroke-opacity="0.6"
            stroke-width="1.1"
            stroke-dasharray="2 2"
          />
          <path
            :d="activeHighlightSegment.fillPath"
            fill="url(#highlightRangeGradient)"
          />
          <path
            :d="activeHighlightSegment.strokePath"
            fill="none"
            stroke="#d9531e"
            stroke-width="2.9"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <circle
            :cx="activeHighlightSegment.startX"
            :cy="activeHighlightSegment.startY"
            r="3.6"
            fill="#d9531e"
            stroke="#fef9ed"
            stroke-width="1.3"
          />
          <circle
            :cx="activeHighlightSegment.endX"
            :cy="activeHighlightSegment.endY"
            r="3.6"
            fill="#d9531e"
            stroke="#fef9ed"
            stroke-width="1.3"
          />
        </g>

        <!-- Hovered Waypoint Beacon Line & Halo -->
        <g v-if="hoveredWaypointPoint">
          <line
            :x1="hoveredWaypointPoint.x"
            :y1="4"
            :x2="hoveredWaypointPoint.x"
            :y2="SVG_HEIGHT - 4"
            stroke="#d9531e"
            stroke-width="1.5"
            stroke-dasharray="2.5 2"
          />
          <circle
            :cx="hoveredWaypointPoint.x"
            :cy="hoveredWaypointPoint.y"
            r="7"
            fill="#d9531e"
            opacity="0.22"
          />
        </g>

        <!-- Summit crest tick marker -->
        <circle
          v-if="summitPoint && !hoverPoint && !hoveredWaypointPoint"
          :cx="summitPoint.x"
          :cy="summitPoint.y"
          r="2.4"
          fill="#1b2e24"
          stroke="#fef9ed"
          stroke-width="1"
        />

        <!-- Trailhead start marker -->
        <circle :cx="X_START" :cy="y0" r="3.2" fill="#526056" stroke="#ffffff" stroke-width="1.2" />

        <!-- Destination beacon marker -->
        <circle :cx="X_END" :cy="yEnd" r="5.5" fill="#d9531e" opacity="0.22" class="animate-ping" />
        <circle :cx="X_END" :cy="yEnd" r="3.6" fill="#d9531e" stroke="#ffffff" stroke-width="1.3" />

        <!-- Interactive Crosshair Line & Reticle -->
        <g v-if="hoverPoint">
          <line
            :x1="hoverPoint.x"
            :y1="4"
            :x2="hoverPoint.x"
            :y2="SVG_HEIGHT - 4"
            stroke="#d9531e"
            stroke-width="1.2"
            stroke-dasharray="2 2"
          />
          <circle
            :cx="hoverPoint.x"
            :cy="hoverPoint.y"
            r="4.2"
            fill="#d9531e"
            stroke="#fef9ed"
            stroke-width="1.5"
          />
        </g>
      </svg>

      <!-- HTML Overlay Badges for Waypoints & Summit Callout -->
      <div class="sparkline-markers-overlay">
        <div
          v-if="summitPoint && !hoverPoint && !hoveredWaypointPoint && !activeHighlightSegment"
          class="summit-callout font-mono"
          :style="{
            left: `${Math.min(84, Math.max(16, (summitPoint.x / SVG_WIDTH) * 100))}%`,
            top: `${Math.max(4, (summitPoint.y / SVG_HEIGHT) * 100 - 20)}%`
          }"
        >
          ▲ {{ summitPoint.elev }}m
        </div>

        <div
          v-for="wp in plottedWaypoints"
          :key="`badge-${wp.order}`"
          :class="[
            'wp-profile-badge font-mono',
            {
              'is-highlighted': wp.isHighlighted,
              'is-direct-hover': wp.isDirectHover
            }
          ]"
          :style="{
            left: `${(wp.x / SVG_WIDTH) * 100}%`,
            top: `${(wp.y / SVG_HEIGHT) * 100}%`
          }"
          :title="`${wp.order}. ${wp.title} (${wp.elevation}m)`"
        >
          {{ wp.order }}
        </div>
      </div>
    </div>

    <!-- Axis Labels Row with Endpoint Names & Net Elevation Delta -->
    <div class="profile-axis-row font-mono">
      <span class="axis-point start" :title="`${trailheadName} (${startElev}m)`">
        <span class="dot trailhead-dot" />
        <span class="endpoint-name">{{ trailheadName }}</span>
        <span class="endpoint-elev">{{ startElev }}M</span>
      </span>

      <span class="axis-net">
        NET {{ netGain >= 0 ? '+' : '' }}{{ netGain }}M
      </span>

      <span class="axis-point end" :title="`${destinationName} (${destElev}m)`">
        <span class="endpoint-elev">{{ destElev }}M</span>
        <span class="endpoint-name">{{ destinationName }}</span>
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
  background-color: var(--color-surface-container, #f3ede1);
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
  gap: 6px;
  min-height: 18px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 5px;
  min-width: 0;
  flex-wrap: nowrap;
}

.header-title {
  font-size: 9.5px;
  font-weight: 700;
  letter-spacing: 0.08em;
  color: var(--color-primary, #1b2e24);
  text-transform: uppercase;
  white-space: nowrap;
}

.segment-pill {
  font-size: 8px;
  font-weight: 700;
  letter-spacing: 0.05em;
  color: #fef9ed;
  background-color: var(--color-primary, #1b2e24);
  padding: 1px 5px;
  border-radius: 3px;
  white-space: nowrap;
  transition: background-color 0.15s ease;
}

.segment-pill.is-highlighted {
  background-color: var(--color-secondary, #d9531e);
}

.distance-pill {
  font-size: 8.5px;
  font-weight: 700;
  letter-spacing: 0.05em;
  color: var(--color-secondary, #d9531e);
  background-color: rgba(217, 83, 30, 0.09);
  padding: 1px 5px;
  border-radius: 3px;
  border: 1px solid rgba(217, 83, 30, 0.25);
  white-space: nowrap;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 7px;
  font-size: 9.5px;
  font-weight: 700;
  letter-spacing: 0.04em;
  flex-shrink: 0;
  max-width: 56%;
}

.scrub-telemetry-pill {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 8.5px;
  background-color: #fef9ed;
  color: var(--color-primary, #1b2e24);
  border: 1px solid rgba(217, 83, 30, 0.45);
  padding: 1px 6px;
  border-radius: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.scrub-sep {
  opacity: 0.45;
}

.scrub-grade {
  color: var(--color-secondary, #d9531e);
  font-weight: 700;
}

.elev-stat-up {
  color: #1b2e24;
  display: inline-flex;
  align-items: center;
  gap: 1.5px;
}

.elev-stat-up .arrow {
  color: #2e6047;
  font-weight: 800;
}

.elev-stat-down {
  color: #8b5a3c;
  display: inline-flex;
  align-items: center;
  gap: 1.5px;
}

.elev-stat-down .arrow {
  color: #8b5a3c;
  font-weight: 800;
}

.sparkline-wrapper {
  position: relative;
  width: 100%;
  height: 62px;
  overflow: hidden;
  border-radius: 6px;
  background:
    linear-gradient(180deg, rgba(254, 249, 237, 0.88) 0%, rgba(243, 237, 225, 0.65) 100%);
  border: 1px solid rgba(115, 120, 116, 0.24);
  padding: 0;
  cursor: crosshair;
}

.topo-grid {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.topo-v-line {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 0;
  border-left: 1px dotted rgba(115, 120, 116, 0.18);
}

.topo-grid-line {
  position: absolute;
  left: 6px;
  right: 6px;
  display: flex;
  justify-content: flex-end;
  padding-right: 12px;
  font-family: var(--font-mono);
  font-size: 7.5px;
  color: rgba(66, 72, 68, 0.58);
  line-height: 1;
  box-sizing: border-box;
}

.topo-grid-line.top {
  top: 3px;
  border-bottom: 1px dashed rgba(194, 200, 194, 0.45);
  padding-bottom: 1px;
}

.topo-grid-line.mid {
  top: 50%;
  transform: translateY(-50%);
  border-bottom: 1px dotted rgba(194, 200, 194, 0.3);
  padding-bottom: 1px;
}

.topo-grid-line.bottom {
  bottom: 3px;
  border-top: 1px dashed rgba(194, 200, 194, 0.38);
  padding-top: 1px;
}

.scale-tag {
  background-color: rgba(254, 249, 237, 0.78);
  padding: 0 3px;
  border-radius: 2px;
}

.mid-tag {
  opacity: 0.75;
}

.profile-svg {
  width: 100%;
  height: 100%;
  overflow: hidden;
  display: block;
}

.sparkline-markers-overlay {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.summit-callout {
  position: absolute;
  transform: translateX(-50%);
  font-size: 7.5px;
  font-weight: 700;
  letter-spacing: 0.03em;
  color: var(--color-primary, #1b2e24);
  background-color: rgba(254, 249, 237, 0.92);
  border: 1px solid rgba(27, 46, 36, 0.22);
  border-radius: 3px;
  padding: 0.5px 4px;
  line-height: 1.2;
  white-space: nowrap;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.06);
}

.wp-profile-badge {
  position: absolute;
  transform: translate(-50%, -50%);
  width: 13px;
  height: 13px;
  border-radius: 50%;
  background-color: var(--color-secondary, #d9531e);
  color: #ffffff;
  font-size: 7.5px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1.2px solid #fef9ed;
  box-shadow: 0 1px 3px rgba(27, 46, 36, 0.22);
  transition: transform 0.16s ease, background-color 0.16s ease, border-color 0.16s ease, box-shadow 0.16s ease;
}

.wp-profile-badge.is-highlighted {
  transform: translate(-50%, -50%) scale(1.25);
  background-color: var(--color-primary, #1b2e24);
  border-color: var(--color-secondary, #d9531e);
  box-shadow: 0 0 0 3px rgba(217, 83, 30, 0.25);
  z-index: 5;
}

.wp-profile-badge.is-direct-hover {
  transform: translate(-50%, -50%) scale(1.38);
  background-color: var(--color-primary, #1b2e24);
  border-color: var(--color-secondary, #d9531e);
  box-shadow: 0 0 0 4px rgba(217, 83, 30, 0.32);
  z-index: 6;
}

.profile-axis-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
  font-size: 8.5px;
  letter-spacing: 0.04em;
  color: var(--color-lichen-slate, #526056);
  padding: 0 2px;
}

.axis-point {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  white-space: nowrap;
  overflow: hidden;
  max-width: 42%;
  min-width: 0;
}

.endpoint-name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--color-on-surface, #1d1c14);
  font-weight: 600;
  text-transform: uppercase;
}

.endpoint-elev {
  color: var(--color-tertiary, #526056);
  font-weight: 700;
  flex-shrink: 0;
}

.axis-net {
  color: var(--color-secondary, #d9531e);
  font-weight: 700;
  font-size: 8.5px;
  background-color: rgba(217, 83, 30, 0.08);
  padding: 1px 5px;
  border-radius: 3px;
  flex-shrink: 0;
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
