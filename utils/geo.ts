/** Great-circle distance in kilometres between two [lng, lat] points (haversine). */
export function haversineKm(a: [number, number], b: [number, number]): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180
  const R = 6371
  const dLat = toRad(b[1] - a[1])
  const dLng = toRad(b[0] - a[0])
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a[1])) * Math.cos(toRad(b[1])) * Math.sin(dLng / 2) ** 2
  return 2 * R * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h))
}

/** Field-tag style distance label: "850 M" under 1 km, otherwise "1.4 KM". */
export function formatDistance(km: number): string {
  if (km < 1) return `${Math.round((km * 1000) / 10) * 10} M`
  return `${km.toFixed(1)} KM`
}

export interface RouteWaypointCoord {
  lng: number
  lat: number
}

/** Total distance in kilometres along a sequence of [lng, lat] coordinates. */
export function polylineDistanceKm(coords: Array<[number, number]>): number {
  if (!coords || coords.length < 2) return 0
  let total = 0
  for (let i = 1; i < coords.length; i++) {
    total += haversineKm(coords[i - 1], coords[i])
  }
  return total
}

export interface SplitRouteResult {
  /** Oriented full polyline coordinates */
  orientedGeometry: Array<[number, number]>
  /** Vertex indices in `orientedGeometry` corresponding to each waypoint (length = waypoints.length) */
  splitIndices: number[]
  /** Contiguous leg polylines between consecutive waypoints (length = waypoints.length - 1) */
  legs: Array<Array<[number, number]>>
  /** Optional GPX track prefix before the first waypoint (when splitIndices[0] > 0) */
  prefix: Array<[number, number]> | null
  /** Optional GPX track suffix after the last waypoint (when splitIndices[N - 1] < M - 1) */
  suffix: Array<[number, number]> | null
}

function findOptimalSplitIndices(
  track: Array<[number, number]>,
  wpCoords: Array<[number, number]>
): { indices: number[]; cost: number } {
  const M = track.length
  const N = wpCoords.length

  const dpCost: Float64Array[] = Array.from({ length: N }, () =>
    new Float64Array(M).fill(Infinity)
  )
  const parentIdx: Int32Array[] = Array.from({ length: N }, () =>
    new Int32Array(M).fill(-1)
  )

  const maxJ0 = M - N
  for (let j = 0; j <= maxJ0; j++) {
    const fracJ = M > 1 ? j / (M - 1) : 0
    dpCost[0][j] = haversineKm(wpCoords[0], track[j]) + 1e-6 * fracJ
  }

  for (let k = 1; k < N; k++) {
    const minJ = k
    const maxJ = M - 1 - (N - 1 - k)
    const fracK = N > 1 ? k / (N - 1) : 0
    let bestPrevCost = Infinity
    let bestPrevJ = -1

    for (let j = minJ; j <= maxJ; j++) {
      const candidatePrevJ = j - 1
      if (dpCost[k - 1][candidatePrevJ] < bestPrevCost) {
        bestPrevCost = dpCost[k - 1][candidatePrevJ]
        bestPrevJ = candidatePrevJ
      }
      const fracJ = M > 1 ? j / (M - 1) : 0
      const vertexCost =
        haversineKm(wpCoords[k], track[j]) + 1e-6 * Math.abs(fracJ - fracK)
      dpCost[k][j] = bestPrevCost + vertexCost
      parentIdx[k][j] = bestPrevJ
    }
  }

  let bestLastJ = N - 1
  let bestLastCost = Infinity
  for (let j = N - 1; j < M; j++) {
    if (dpCost[N - 1][j] < bestLastCost) {
      bestLastCost = dpCost[N - 1][j]
      bestLastJ = j
    }
  }

  const indices = new Array<number>(N)
  let curJ = bestLastJ
  for (let k = N - 1; k >= 0; k--) {
    indices[k] = curJ
    curJ = parentIdx[k][curJ]
  }

  return { indices, cost: bestLastCost }
}

/**
 * Splits a route geometry (such as an ingested GPX track) into sequential legs
 * between the ordered locations (waypoints) listed on a dispatch, while also
 * returning any un-legged track prefix/suffix before the first or after the last location.
 */
function cloneCoord(p: any): [number, number] {
  if (Array.isArray(p) && p.length >= 3 && p[2] != null && !Number.isNaN(Number(p[2]))) {
    return [Number(p[0]), Number(p[1]), Number(p[2])] as unknown as [number, number]
  }
  return [Number(p[0]), Number(p[1])]
}

export function splitRouteWithRemainder(
  geometry: Array<[number, number]> | undefined | null,
  waypoints: RouteWaypointCoord[]
): SplitRouteResult {
  const MIN_REMAINDER_KM = 0.05

  if (!waypoints || waypoints.length === 0) {
    const orientedGeometry: Array<[number, number]> = Array.isArray(geometry)
      ? geometry.map(cloneCoord)
      : []
    return {
      orientedGeometry,
      splitIndices: [],
      legs: [],
      prefix: null,
      suffix: null
    }
  }

  const wpCoords: Array<[number, number]> = waypoints.map(w => [Number(w.lng), Number(w.lat)])
  const N = wpCoords.length

  if (!geometry || !Array.isArray(geometry) || geometry.length < 2) {
    const legs: Array<Array<[number, number]>> = []
    for (let i = 0; i < N - 1; i++) {
      legs.push([wpCoords[i], wpCoords[i + 1]])
    }
    return {
      orientedGeometry: wpCoords,
      splitIndices: wpCoords.map((_, i) => i),
      legs,
      prefix: null,
      suffix: null
    }
  }

  let pts: Array<[number, number]> = geometry.map(cloneCoord)

  if (N === 1) {
    let bestJ = 0
    let bestDist = Infinity
    for (let j = 0; j < pts.length; j++) {
      const d = haversineKm(wpCoords[0], pts[j])
      if (d < bestDist) {
        bestDist = d
        bestJ = j
      }
    }
    const rawPrefix = bestJ > 0 ? pts.slice(0, bestJ + 1) : null
    const rawSuffix = bestJ < pts.length - 1 ? pts.slice(bestJ, pts.length) : null
    const prefix = rawPrefix && polylineDistanceKm(rawPrefix) >= MIN_REMAINDER_KM ? rawPrefix : null
    const suffix = rawSuffix && polylineDistanceKm(rawSuffix) >= MIN_REMAINDER_KM ? rawSuffix : null
    return {
      orientedGeometry: pts,
      splitIndices: [bestJ],
      legs: [],
      prefix,
      suffix
    }
  }

  // Ensure the polyline has at least N vertices so each of the N - 1 legs spans at least 1 segment
  while (pts.length < N) {
    let maxSegIdx = 0
    let maxSegDist = -1
    for (let i = 0; i < pts.length - 1; i++) {
      const d = haversineKm(pts[i], pts[i + 1])
      if (d > maxSegDist) {
        maxSegDist = d
        maxSegIdx = i
      }
    }
    const a = pts[maxSegIdx] as any
    const b = pts[maxSegIdx + 1] as any
    const mid: any =
      a.length >= 3 && b.length >= 3
        ? [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2]
        : [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2]
    pts.splice(maxSegIdx + 1, 0, mid)
  }

  // Match all N waypoints along both forward and reverse track orientations
  const forward = findOptimalSplitIndices(pts, wpCoords)
  const reversedPts = [...pts].reverse()
  const reverse = findOptimalSplitIndices(reversedPts, wpCoords)

  let splitIndices = [...forward.indices]
  if (reverse.cost + 1e-6 < forward.cost) {
    pts = reversedPts
    splitIndices = [...reverse.indices]
  }

  // Absorb tiny sub-50m GPS start/end jitter into the adjacent outer leg
  if (splitIndices[0] > 0) {
    const candidatePrefix = pts.slice(0, splitIndices[0] + 1)
    if (polylineDistanceKm(candidatePrefix) < MIN_REMAINDER_KM) {
      splitIndices[0] = 0
    }
  }
  if (splitIndices[N - 1] < pts.length - 1) {
    const candidateSuffix = pts.slice(splitIndices[N - 1], pts.length)
    if (polylineDistanceKm(candidateSuffix) < MIN_REMAINDER_KM) {
      splitIndices[N - 1] = pts.length - 1
    }
  }

  const legs: Array<Array<[number, number]>> = []
  for (let i = 0; i < N - 1; i++) {
    legs.push(pts.slice(splitIndices[i], splitIndices[i + 1] + 1))
  }

  const prefix = splitIndices[0] > 0 ? pts.slice(0, splitIndices[0] + 1) : null
  const suffix =
    splitIndices[N - 1] < pts.length - 1
      ? pts.slice(splitIndices[N - 1], pts.length)
      : null

  return {
    orientedGeometry: pts,
    splitIndices,
    legs,
    prefix,
    suffix
  }
}

/**
 * Splits a route geometry (such as an ingested GPX track) into sequential legs
 * corresponding to the ordered locations (waypoints) listed on a dispatch.
 *
 * - If `waypoints` has fewer than 2 locations, returns `[]`.
 * - If `geometry` is absent or has fewer than 2 points, returns straight-line
 *   `[[from.lng, from.lat], [to.lng, to.lat]]` segments for each leg.
 * - If `geometry` has >= 2 points, automatically orients the track to match the
 *   waypoint traversal order and extracts the exact GPX trail sub-segment between
 *   each consecutive pair of locations.
 */
export function splitRouteIntoLegs(
  geometry: Array<[number, number]> | undefined | null,
  waypoints: RouteWaypointCoord[]
): Array<Array<[number, number]>> {
  return splitRouteWithRemainder(geometry, waypoints).legs
}

export interface ElevationWaypointAnchor {
  fraction: number
  elevation: number
}

export interface ElevationTelemetryResult {
  samples: number[]
  startElevation: number
  destinationElevation: number
  elevationGain: number
  elevationLoss: number
  minElevation: number
  maxElevation: number
  hasMeasuredElevation: boolean
}

/**
 * Extracts a high-resolution elevation profile (and ascent/descent stats) from a
 * polyline geometry `[lng, lat, ele?][]` when 3D GPX elevation coordinates are
 * present, or synthesizes a realistic topographic cross-section anchored at the
 * known waypoint elevations and gain/loss metrics.
 */
export function extractElevationTelemetry(options: {
  geometry?: Array<[number, number]> | null
  startElevation?: number
  destinationElevation?: number
  elevationGain?: number
  elevationLoss?: number
  anchors?: ElevationWaypointAnchor[]
  sampleCount?: number
}): ElevationTelemetryResult {
  const sampleCount = Math.max(16, options.sampleCount ?? 56)
  const geom = options.geometry || []

  // 1. Check if geometry carries 3D GPX elevation coordinates [lng, lat, ele]
  const has3dElev =
    geom.length >= 2 &&
    geom.every((p: any) => Array.isArray(p) && p.length >= 3 && p[2] != null && !Number.isNaN(Number(p[2])))

  if (has3dElev) {
    const cumDist: number[] = [0]
    for (let i = 1; i < geom.length; i++) {
      cumDist.push(cumDist[i - 1] + haversineKm(geom[i - 1], geom[i]))
    }
    const totalDist = cumDist[cumDist.length - 1]
    const rawSamples: number[] = []

    if (totalDist <= 1e-6) {
      for (let s = 0; s < sampleCount; s++) {
        const idx = Math.min(geom.length - 1, Math.floor((s / (sampleCount - 1)) * geom.length))
        rawSamples.push(Number((geom[idx] as any)[2]))
      }
    } else {
      let segIdx = 0
      for (let s = 0; s < sampleCount; s++) {
        const targetDist = (s / (sampleCount - 1)) * totalDist
        while (segIdx < cumDist.length - 2 && cumDist[segIdx + 1] < targetDist) {
          segIdx++
        }
        const d0 = cumDist[segIdx]
        const d1 = cumDist[segIdx + 1]
        const t = d1 > d0 ? (targetDist - d0) / (d1 - d0) : 0
        const e0 = Number((geom[segIdx] as any)[2])
        const e1 = Number((geom[segIdx + 1] as any)[2])
        rawSamples.push(e0 + (e1 - e0) * t)
      }
    }

    // Light 2-pass moving average to smooth 1Hz barometric/GPS altimeter micro-steps
    let smoothed = [...rawSamples]
    for (let pass = 0; pass < 2; pass++) {
      const next = [...smoothed]
      for (let i = 1; i < smoothed.length - 1; i++) {
        next[i] = smoothed[i - 1] * 0.22 + smoothed[i] * 0.56 + smoothed[i + 1] * 0.22
      }
      smoothed = next
    }

    let gain = 0
    let loss = 0
    for (let i = 1; i < geom.length; i++) {
      const diff = Number((geom[i] as any)[2]) - Number((geom[i - 1] as any)[2])
      if (diff > 0) gain += diff
      else loss += Math.abs(diff)
    }

    const roundedSamples = smoothed.map(v => Math.round(v * 10) / 10)
    const startElevation = Math.round(Number((geom[0] as any)[2]))
    const destinationElevation = Math.round(Number((geom[geom.length - 1] as any)[2]))

    return {
      samples: roundedSamples,
      startElevation,
      destinationElevation,
      elevationGain: Math.round(gain),
      elevationLoss: Math.round(loss),
      minElevation: Math.round(Math.min(...roundedSamples)),
      maxElevation: Math.round(Math.max(...roundedSamples)),
      hasMeasuredElevation: true
    }
  }

  // 2. Synthesize a detailed, deterministic topographic profile from waypoint anchors + gain/loss
  const startElev = Math.round(options.startElevation ?? 250)
  const destElev = Math.round(options.destinationElevation ?? startElev)
  const gain = Math.max(0, Math.round(options.elevationGain ?? 0))
  const loss = Math.max(0, Math.round(options.elevationLoss ?? 0))

  // Build ordered piecewise-linear baseline anchors
  const anchors: ElevationWaypointAnchor[] = [{ fraction: 0, elevation: startElev }]
  if (options.anchors && options.anchors.length > 0) {
    const sorted = [...options.anchors]
      .filter(a => a.fraction > 0.02 && a.fraction < 0.98 && a.elevation != null)
      .sort((a, b) => a.fraction - b.fraction)
    anchors.push(...sorted)
  }
  anchors.push({ fraction: 1, elevation: destElev })

  // Deterministic phase seed from coordinates / elevations so each trail has a unique terrain signature
  let seed = Math.abs(startElev * 13 + destElev * 29 + gain * 7 + loss * 11)
  if (geom.length >= 2) {
    seed += Math.round((Math.abs(geom[0][0]) + Math.abs(geom[0][1]) + Math.abs(geom[geom.length - 1][0])) * 1000)
  }
  const phase1 = ((seed % 100) / 100) * Math.PI * 2
  const phase2 = (((seed * 7) % 100) / 100) * Math.PI * 2
  const phase3 = (((seed * 19) % 100) / 100) * Math.PI * 2

  const netAscent = Math.max(0, destElev - startElev)
  const netDescent = Math.max(0, startElev - destElev)
  const extraGain = Math.max(0, gain - netAscent)
  const extraLoss = Math.max(0, loss - netDescent)
  const baseSpan = Math.max(Math.abs(destElev - startElev), 20)

  const crestAmp = extraGain > 0
    ? Math.min(extraGain * 0.24, Math.max(baseSpan * 0.55, 18))
    : Math.min(baseSpan * 0.15, 8)
  const dipAmp = extraLoss > 0
    ? Math.min(extraLoss * 0.22, Math.max(baseSpan * 0.45, 15))
    : Math.min(baseSpan * 0.12, 6)
  const waveAmp = (crestAmp + dipAmp) * 0.5

  const samples: number[] = []
  for (let s = 0; s < sampleCount; s++) {
    const t = s / (sampleCount - 1)

    // Interpolate along piecewise waypoint anchors
    let aIdx = 0
    while (aIdx < anchors.length - 2 && anchors[aIdx + 1].fraction < t) {
      aIdx++
    }
    const a0 = anchors[aIdx]
    const a1 = anchors[aIdx + 1]
    const localT = a1.fraction > a0.fraction ? (t - a0.fraction) / (a1.fraction - a0.fraction) : 0
    // Smoothstep blend between anchor elevations
    const smoothT = localT * localT * (3 - 2 * localT)
    const baseElev = a0.elevation + (a1.elevation - a0.elevation) * smoothT

    // Taper undulation to zero at start (t=0), finish (t=1), and exact anchor stops
    const edgeEnvelope = Math.sin(Math.PI * t) ** 0.85
    const anchorEnvelope = Math.sin(Math.PI * localT)

    // Multi-frequency Nordic ridge/esker terrain harmonics
    const w1 = Math.sin(t * Math.PI * 2.2 + phase1) * 0.52
    const w2 = Math.sin(t * Math.PI * 5.0 + phase2) * 0.31
    const w3 = Math.cos(t * Math.PI * 9.5 + phase3) * 0.17
    const asymBias = (crestAmp - dipAmp) * 0.35 * Math.sin(Math.PI * t)

    const delta =
      waveAmp * (w1 + w2 + w3) * (0.55 * edgeEnvelope + 0.45 * anchorEnvelope) +
      asymBias * edgeEnvelope

    const val = Math.max(2, Math.round((baseElev + delta) * 10) / 10)
    samples.push(val)
  }

  samples[0] = startElev
  samples[samples.length - 1] = destElev

  return {
    samples,
    startElevation: startElev,
    destinationElevation: destElev,
    elevationGain: gain,
    elevationLoss: loss,
    minElevation: Math.round(Math.min(...samples)),
    maxElevation: Math.round(Math.max(...samples)),
    hasMeasuredElevation: false
  }
}

