import {
  extractElevationTelemetry,
  formatDistance,
  haversineKm,
  polylineDistanceKm,
  splitRouteWithRemainder
} from './geo'

export interface InspectedRouteWaypoint {
  id: string
  title: string
  lat: number
  lng: number
  order: number
}

export interface InspectedRoute {
  dispatchId: string
  title: string
  waypoints: InspectedRouteWaypoint[]
  geometry?: Array<[number, number]>
}

export interface InspectionWaypointInput {
  id: string
  slug?: string
  title: string
  elevation?: number
  elevationGain?: number
  elevationLoss?: number
  category?: string
  latitude?: number
  longitude?: number
  order: number
}

export interface ProfileWaypointMarker {
  order: number
  title: string
  fraction: number
  elevation?: number
}

export interface LegItem {
  index: number
  letter: string
  segmentLabel: string
  distanceKm: number
  distanceFormatted: string
  fromId: string
  toId: string
  startElevation: number
  destinationElevation: number
  elevationGain: number
  elevationLoss: number
  fromTitle: string
  toTitle: string
  routeGeometry?: Array<[number, number]> | null
  profileWaypoints?: ProfileWaypointMarker[]
}

export interface WholeRouteElevationData {
  segmentLabel: string
  startElevation: number
  destinationElevation: number
  elevationGain: number
  elevationLoss: number
  distanceKm: number
  fromTitle: string
  toTitle: string
  routeGeometry: Array<[number, number]> | null
  profileWaypoints: ProfileWaypointMarker[]
}

const EMPTY_FC = { type: 'FeatureCollection' as const, features: [] as any[] }

function getCoordElevation(coord: any): number | undefined {
  if (Array.isArray(coord) && coord.length >= 3 && coord[2] != null && !Number.isNaN(Number(coord[2]))) {
    return Number(coord[2])
  }
  return undefined
}

/**
 * Normalizes trail geometry from either raw coordinate arrays `[[lng, lat], ...]`
 * or a GeoJSON LineString `{ type: 'LineString', coordinates: [...] }`.
 */
export function normalizeTrailGeometry(raw: any): Array<[number, number]> | undefined {
  const coords = Array.isArray(raw)
    ? raw
    : raw && typeof raw === 'object' && raw.type === 'LineString' && Array.isArray(raw.coordinates)
      ? raw.coordinates
      : undefined
  if (!Array.isArray(coords) || coords.length < 2) return undefined
  return coords
}

/**
 * Resolves valid `[lng, lat]` (or `[lng, lat, ele]`) GPX geometry from a dispatch document.
 */
export function resolveDispatchTrailGeometry(dispatch: any): Array<[number, number]> | undefined {
  if (!dispatch) return undefined
  return normalizeTrailGeometry(dispatch.trailGeometry || dispatch.trail_geometry)
}

/**
 * Builds the inspection route payload for MapCanvas from a dispatch and its resolved waypoints.
 * Supports GPX-only dispatches (0 waypoints with `>= 2` geometry points) as well as single- and multi-waypoint routes.
 */
export function buildInspectedRoute(
  dispatch: any,
  waypoints: InspectionWaypointInput[]
): InspectedRoute | null {
  if (!dispatch) return null
  const geometry = resolveDispatchTrailGeometry(dispatch)
  const validWaypoints: InspectedRouteWaypoint[] = (waypoints || [])
    .filter(w => w.latitude != null && w.longitude != null)
    .map(w => ({
      id: w.id,
      title: w.title,
      lat: w.latitude!,
      lng: w.longitude!,
      order: w.order
    }))

  if (validWaypoints.length === 0 && !geometry) return null

  return {
    dispatchId: dispatch.id,
    title: dispatch.title,
    geometry,
    waypoints: validWaypoints
  }
}

/**
 * Collects all `[lng, lat]` coordinates needed to frame an inspected route on the map.
 */
export function collectInspectedRouteFocusPoints(
  route: InspectedRoute | null
): Array<[number, number]> {
  if (!route) return []
  const points: Array<[number, number]> = route.waypoints.map(w => [w.lng, w.lat])
  if (route.geometry?.length) {
    points.push(...route.geometry)
  }
  return points
}

/**
 * Builds the MapLibre GeoJSON FeatureCollection for an inspected dispatch route,
 * splitting multi-segment routes by waypoints or falling back to a single LineString for GPX-only tracks.
 */
export function buildInspectedRouteLineGeoJSON(
  route?: InspectedRoute | null,
  selectedLegIndex?: number | null,
  hoveredLegIndex?: number | null
) {
  if (!route) return EMPTY_FC

  const hasGpx = Array.isArray(route.geometry) && route.geometry.length >= 2
  const hasWaypoints = Array.isArray(route.waypoints) && route.waypoints.length >= 1

  if (hasWaypoints && (route.waypoints.length >= 2 || hasGpx)) {
    const sorted = [...route.waypoints].sort((a, b) => a.order - b.order)
    const { legs: legGeometries, prefix, suffix } = splitRouteWithRemainder(route.geometry, sorted)
    const effectiveLegIdx =
      hoveredLegIndex !== null && hoveredLegIndex !== undefined ? hoveredLegIndex : selectedLegIndex
    const hasLegSelection = effectiveLegIdx !== null && effectiveLegIdx !== undefined
    const features: any[] = []

    const pushLegSegment = (coords: Array<[number, number]> | null, legIdx: number, letter: string) => {
      if (!coords || coords.length < 2) return
      const isSelected = hasLegSelection && effectiveLegIdx === legIdx
      const opacity = hasLegSelection ? (isSelected ? 1.0 : 0.25) : 0.85
      const lineWidth = isSelected ? (hasGpx ? 5.5 : 4.5) : (hasGpx ? 3.5 : 2.5)
      const casingWidth = isSelected ? (hasGpx ? 8.5 : 7) : (hasGpx ? 5.5 : 4.5)

      features.push({
        type: 'Feature' as const,
        properties: {
          legIndex: legIdx,
          letter,
          isSelected,
          opacity,
          lineWidth,
          casingWidth
        },
        geometry: {
          type: 'LineString' as const,
          coordinates: coords
        }
      })
    }

    pushLegSegment(prefix, -1, 'START')

    for (let i = 0; i < legGeometries.length; i++) {
      pushLegSegment(legGeometries[i], i, String.fromCharCode(65 + i))
    }

    const suffixIdx = sorted.length - 1
    pushLegSegment(suffix, suffixIdx, String.fromCharCode(65 + suffixIdx))

    // Place the selected/hovered leg last so its full-opacity casing and stroke render cleanly above adjacent dimmed leg endpoints
    if (hasLegSelection) {
      features.sort((a, b) => (a.properties.isSelected ? 1 : 0) - (b.properties.isSelected ? 1 : 0))
    }

    if (features.length > 0) {
      return {
        type: 'FeatureCollection' as const,
        features
      }
    }
  }

  // Fallback for GPX-only dispatch (0 waypoints) or single-location dispatch without prefix/suffix remainder legs
  if (hasGpx) {
    return {
      type: 'FeatureCollection' as const,
      features: [
        {
          type: 'Feature' as const,
          properties: {
            legIndex: null,
            letter: '',
            isSelected: false,
            opacity: 0.85,
            lineWidth: 3.5,
            casingWidth: 5.5
          },
          geometry: {
            type: 'LineString' as const,
            coordinates: route.geometry!
          }
        }
      ]
    }
  }

  return EMPTY_FC
}

/**
 * Computes prefix/inter-stop/suffix legs and full-route elevation telemetry for dispatch inspection.
 */
export function buildRouteLegBreakdown(
  dispatch: any,
  waypoints: InspectionWaypointInput[]
) {
  const rawGeom = resolveDispatchTrailGeometry(dispatch)
  const hasGpx = Array.isArray(rawGeom) && rawGeom.length >= 2
  const wpList = waypoints || []
  const wpCoords = wpList.map(w => ({ lng: w.longitude ?? 0, lat: w.latitude ?? 0 }))
  const split = splitRouteWithRemainder(hasGpx ? rawGeom : undefined, wpCoords)
  const routeSplit = { hasGpx, rawGeom, ...split }

  let prefixLeg: LegItem | null = null
  if (wpList.length > 0 && hasGpx && split.prefix && split.prefix.length >= 2) {
    const distKm = polylineDistanceKm(split.prefix)
    if (distKm >= 0.05) {
      const firstWp = wpList[0]
      const destElev = Math.round(firstWp?.elevation ?? getCoordElevation(split.prefix[split.prefix.length - 1]) ?? 250)
      const startElev = Math.round(getCoordElevation(split.prefix[0]) ?? destElev)
      const undulatingMargin = Math.max(12, Math.round(distKm * 18))
      const measured = extractElevationTelemetry({ geometry: split.prefix })
      prefixLeg = {
        index: -1,
        letter: 'START',
        segmentLabel: 'START LEG',
        distanceKm: Number(distKm.toFixed(1)),
        distanceFormatted: formatDistance(distKm),
        fromId: 'route-start',
        toId: firstWp.id,
        startElevation: startElev,
        destinationElevation: destElev,
        elevationGain: measured.hasMeasuredElevation ? measured.elevationGain : undulatingMargin,
        elevationLoss: measured.hasMeasuredElevation ? measured.elevationLoss : undulatingMargin,
        fromTitle: 'TRAIL START',
        toTitle: firstWp.title,
        routeGeometry: split.prefix
      }
    }
  }

  const legs: LegItem[] = []
  if (wpList.length >= 2) {
    for (let i = 0; i < wpList.length - 1; i++) {
      const from = wpList[i]
      const to = wpList[i + 1]
      let distKm = 0
      if (hasGpx && split.legs[i] && split.legs[i].length >= 2) {
        distKm = polylineDistanceKm(split.legs[i])
      } else if (from.longitude != null && from.latitude != null && to.longitude != null && to.latitude != null) {
        distKm = haversineKm([from.longitude, from.latitude], [to.longitude, to.latitude])
      }

      const startElev = Math.round(from.elevation ?? to.elevation ?? 250)
      const destElev = Math.round(to.elevation ?? from.elevation ?? 280)
      const netDiff = destElev - startElev
      const undulatingMargin = Math.max(12, Math.round(distKm * 18))

      const gain = to.elevationGain != null && to.elevationGain > 0
        ? Math.round(to.elevationGain)
        : Math.max(0, netDiff) + undulatingMargin
      const loss = to.elevationLoss != null && to.elevationLoss > 0
        ? Math.round(to.elevationLoss)
        : Math.max(0, -netDiff) + undulatingMargin

      const letter = String.fromCharCode(65 + i)
      legs.push({
        index: i,
        letter,
        segmentLabel: `LEG ${letter}`,
        distanceKm: Number(distKm.toFixed(1)),
        distanceFormatted: formatDistance(distKm),
        fromId: from.id,
        toId: to.id,
        startElevation: startElev,
        destinationElevation: destElev,
        elevationGain: gain,
        elevationLoss: loss,
        fromTitle: from.title,
        toTitle: to.title,
        routeGeometry: split.legs[i] || null
      })
    }
  }

  let suffixLeg: LegItem | null = null
  if (wpList.length > 0 && hasGpx && split.suffix && split.suffix.length >= 2) {
    const distKm = polylineDistanceKm(split.suffix)
    if (distKm >= 0.05) {
      const lastIdx = wpList.length - 1
      const lastWp = wpList[lastIdx]
      const firstWp = wpList[0]
      const startElev = Math.round(lastWp?.elevation ?? getCoordElevation(split.suffix[0]) ?? firstWp?.elevation ?? 250)
      const destElev = Math.round(getCoordElevation(split.suffix[split.suffix.length - 1]) ?? firstWp?.elevation ?? startElev)
      const netDiff = destElev - startElev
      const undulatingMargin = Math.max(12, Math.round(distKm * 18))
      const measured = extractElevationTelemetry({ geometry: split.suffix })
      const letter = String.fromCharCode(65 + lastIdx)

      suffixLeg = {
        index: lastIdx,
        letter,
        segmentLabel: `LEG ${letter}`,
        distanceKm: Number(distKm.toFixed(1)),
        distanceFormatted: formatDistance(distKm),
        fromId: lastWp.id,
        toId: 'route-end',
        startElevation: startElev,
        destinationElevation: destElev,
        elevationGain: measured.hasMeasuredElevation ? measured.elevationGain : Math.max(0, netDiff) + undulatingMargin,
        elevationLoss: measured.hasMeasuredElevation ? measured.elevationLoss : Math.max(0, -netDiff) + undulatingMargin,
        fromTitle: lastWp.title,
        toTitle: 'TRAIL END',
        routeGeometry: split.suffix
      }
    }
  }

  let wholeRouteData: WholeRouteElevationData | null = null
  if (wpList.length > 0 || hasGpx) {
    const measuredFull = hasGpx ? extractElevationTelemetry({ geometry: split.orientedGeometry }) : null
    const gpxStartEle = hasGpx ? getCoordElevation(split.orientedGeometry[0]) : undefined
    const gpxEndEle = hasGpx ? getCoordElevation(split.orientedGeometry[split.orientedGeometry.length - 1]) : undefined

    const firstKnownElev = wpList.find(w => w.elevation != null)?.elevation ?? gpxStartEle ?? 250
    const lastKnownElev = [...wpList].reverse().find(w => w.elevation != null)?.elevation ?? gpxEndEle ?? firstKnownElev

    const startElev = Math.round((prefixLeg ? gpxStartEle : undefined) ?? wpList[0]?.elevation ?? firstKnownElev)
    const destElev = Math.round((suffixLeg ? gpxEndEle : undefined) ?? wpList[wpList.length - 1]?.elevation ?? lastKnownElev)

    const preDist = prefixLeg?.distanceKm ?? 0
    const interDists = legs.map(l => l.distanceKm)
    const sufDist = suffixLeg?.distanceKm ?? 0
    const sumSegmentDists = preDist + interDists.reduce((a, b) => a + b, 0) + sufDist

    const dispatchDist = dispatch?.distanceKm ?? dispatch?.distance_km
    let totalDistKm = 0
    if (dispatchDist != null && Number(dispatchDist) > 0) {
      totalDistKm = Number(dispatchDist)
    } else if (sumSegmentDists > 0) {
      totalDistKm = sumSegmentDists
    } else if (hasGpx) {
      totalDistKm = polylineDistanceKm(split.orientedGeometry)
    }

    const effectiveSpanKm = sumSegmentDists > 0 ? sumSegmentDists : Math.max(totalDistKm, 0.1)
    const profileWaypoints: ProfileWaypointMarker[] = []
    let cumKm = preDist
    for (let i = 0; i < wpList.length; i++) {
      const wp = wpList[i]
      const frac = Math.max(0, Math.min(1, cumKm / effectiveSpanKm))
      profileWaypoints.push({
        order: wp.order,
        title: wp.title,
        fraction: frac,
        elevation: wp.elevation
      })
      if (i < interDists.length) {
        cumKm += interDists[i]
      }
    }

    const dispatchGain = dispatch?.elevationGainM ?? dispatch?.elevation_gain_m
    const dispatchLoss = dispatch?.elevationLossM ?? dispatch?.elevation_loss_m
    const netDiff = destElev - startElev
    const undulatingMargin = Math.max(12, Math.round(totalDistKm * 18))
    const hasSegmentBreakdown = legs.length > 0 || prefixLeg !== null || suffixLeg !== null

    const totalGain = dispatchGain != null && Number(dispatchGain) > 0
      ? Math.round(Number(dispatchGain))
      : measuredFull?.hasMeasuredElevation
        ? measuredFull.elevationGain
        : hasSegmentBreakdown
          ? Math.round(
              (prefixLeg?.elevationGain ?? 0) +
              legs.reduce((sum, leg) => sum + leg.elevationGain, 0) +
              (suffixLeg?.elevationGain ?? 0)
            )
          : Math.max(0, netDiff) + undulatingMargin

    const totalLoss = dispatchLoss != null && Number(dispatchLoss) > 0
      ? Math.round(Number(dispatchLoss))
      : measuredFull?.hasMeasuredElevation
        ? measuredFull.elevationLoss
        : hasSegmentBreakdown
          ? Math.round(
              (prefixLeg?.elevationLoss ?? 0) +
              legs.reduce((sum, leg) => sum + leg.elevationLoss, 0) +
              (suffixLeg?.elevationLoss ?? 0)
            )
          : Math.max(0, -netDiff) + undulatingMargin

    const fromTitle = prefixLeg ? 'TRAIL START' : (wpList[0]?.title || 'START')
    const toTitle = suffixLeg ? 'TRAIL END' : (wpList[wpList.length - 1]?.title || 'FINISH')

    wholeRouteData = {
      segmentLabel: 'FULL ROUTE',
      startElevation: startElev,
      destinationElevation: destElev,
      elevationGain: totalGain,
      elevationLoss: totalLoss,
      distanceKm: Number(totalDistKm.toFixed(1)),
      fromTitle,
      toTitle,
      routeGeometry: hasGpx ? split.orientedGeometry : null,
      profileWaypoints
    }
  }

  return {
    routeSplit,
    prefixLeg,
    legs,
    suffixLeg,
    wholeRouteData
  }
}

/**
 * Selects which elevation telemetry payload is currently active in the inspection peek card.
 */
export function resolveActiveElevationData(options: {
  wholeRouteData: WholeRouteElevationData | null
  selectedLegData: LegItem | null
  isHoveringWholeRoutePreview: boolean
}): WholeRouteElevationData | LegItem | null {
  if (options.isHoveringWholeRoutePreview) return options.wholeRouteData
  if (options.selectedLegData) return options.selectedLegData
  return options.wholeRouteData
}
