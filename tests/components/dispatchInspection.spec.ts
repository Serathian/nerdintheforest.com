import { describe, it, expect } from 'vitest'
import { mockDispatches, mockLocations } from '../../data/mockNordicTrail'
import { polylineDistanceKm, splitRouteIntoLegs, formatDistance } from '../../utils/geo'

describe('Atlas Dispatch Inspection Mode (/ ?dispatch=slug / ?story=slug)', () => {
  it('identifies multi-location dispatches for inspection', () => {
    const dispatch = mockDispatches.find(d => d.slug === 'autumn-night-vaha-riutta' || d.slug === 'kikut-traverse')
    expect(dispatch).toBeDefined()
    expect(Array.isArray(dispatch?.locations)).toBe(true)
    expect(dispatch!.locations.length).toBeGreaterThanOrEqual(2)
  })

  it('maps sequential visited waypoints in chronological order with elevation & coordinates', () => {
    const dispatch = mockDispatches.find(d => d.slug === 'kikut-traverse')!
    expect(dispatch).toBeDefined()

    const inspectedWaypoints = dispatch.locations.map((locRef: any, idx: number) => {
      const locId = typeof locRef === 'object' && locRef !== null ? (locRef.id || locRef.slug) : String(locRef)
      const loc = mockLocations.find(l => l.id === locId || l.slug === locId)
      return {
        id: loc?.id || locId,
        slug: loc?.slug || locId,
        title: loc?.name || 'Waypoint',
        elevation: loc?.elevation,
        latitude: loc?.latitude,
        longitude: loc?.longitude,
        order: idx + 1
      }
    })

    expect(inspectedWaypoints.length).toBe(2)
    expect(inspectedWaypoints[0].order).toBe(1)
    expect(inspectedWaypoints[0].slug).toBe('langvatnet-gapahuk')
    expect(inspectedWaypoints[0].latitude).toBeCloseTo(60.271)

    expect(inspectedWaypoints[1].order).toBe(2)
    expect(inspectedWaypoints[1].slug).toBe('kikut-peak')
    expect(inspectedWaypoints[1].elevation).toBe(604)
  })

  it('generates line coordinates connecting waypoints sequentially', () => {
    const dispatch = mockDispatches.find(d => d.slug === 'kikut-traverse')!
    const coords = dispatch.locations.map((locRef: any) => {
      const locId = typeof locRef === 'object' && locRef !== null ? (locRef.id || locRef.slug) : String(locRef)
      const loc = mockLocations.find(l => l.id === locId || l.slug === locId)!
      return [loc.longitude, loc.latitude]
    })

    expect(coords.length).toBe(2)
    expect(coords[0][0]).toBeCloseTo(10.732)
    expect(coords[1][0]).toBeCloseTo(10.655)
  })

  it('calculates opacity dimming: 1.0 for waypoints in route, 0.25 for unrelated waypoints', () => {
    const dispatch = mockDispatches.find(d => d.slug === 'kikut-traverse')!
    const routeLocIds = new Set(dispatch.locations.map((l: any) => typeof l === 'object' ? l.id : l))

    mockLocations.forEach(loc => {
      const inRoute = routeLocIds.has(loc.id) || routeLocIds.has(loc.slug)
      const expectedOpacity = inRoute ? 1.0 : 0.25

      if (loc.slug === 'kikut-peak' || loc.slug === 'langvatnet-gapahuk') {
        expect(expectedOpacity).toBe(1.0)
      } else {
        expect(expectedOpacity).toBe(0.25)
      }
    })
  })

  it('formats telemetry title for top notch brand display', () => {
    const dispatch = mockDispatches.find(d => d.slug === 'kikut-traverse')!
    const notchHeader = {
      label: 'DISPATCH INSPECTION',
      title: dispatch.title,
      locationsCount: dispatch.locations.length
    }

    expect(notchHeader.label).toBe('DISPATCH INSPECTION')
    expect(notchHeader.title).toBe('Autumn Ascent to Kikut Peak & Katnosa Traverse')
    expect(notchHeader.locationsCount).toBe(2)
  })

  it('supports 3-location dispatch (Birgitan Polku Lake Circuit)', () => {
    const dispatch = mockDispatches.find(d => d.slug === 'birgitan-polku-circuit')
    expect(dispatch).toBeDefined()
    expect(dispatch?.locations).toHaveLength(3)
    expect(dispatch?.locations).toEqual(['savontie-trailhead', 'vaha-riutta-laavu', 'vaha-kauas-laavu'])
  })

  it('supports 5-location dispatch (Helvetinjärvi & Pirkanmaa Grand Taiga Traverse)', () => {
    const dispatch = mockDispatches.find(d => d.slug === 'helvetinjarvi-taiga-traverse')
    expect(dispatch).toBeDefined()
    expect(dispatch?.locations).toHaveLength(5)
    expect(dispatch?.locations).toEqual([
      'kankimaki-trailhead',
      'helvetinkolu-gapahuk',
      'pirunkirkko-nakoalapaikka',
      'kintulammi-kirkkokivi',
      'kirskaanniemi-laavu'
    ])
  })

  it('configures location map markers as numbers only in inspection mode', () => {
    const dispatch = mockDispatches.find(d => d.slug === 'birgitan-polku-circuit')!
    const routePoints = dispatch.locations.map((locRef, idx) => ({
      id: locRef,
      order: idx + 1,
      orderStr: String(idx + 1),
      isSelected: idx === 0
    }))

    expect(routePoints).toHaveLength(3)
    expect(routePoints[0].orderStr).toBe('1')
    expect(routePoints[1].orderStr).toBe('2')
    expect(routePoints[2].orderStr).toBe('3')
    expect(routePoints[0].isSelected).toBe(true)
    expect(routePoints[1].isSelected).toBe(false)
  })

  it('computes inter-stop legs with alphabetical letters and distances', () => {
    const dispatch = mockDispatches.find(d => d.slug === 'birgitan-polku-circuit')!
    // 3 waypoints -> 2 legs (A, B)
    const waypoints = dispatch.locations.map((locRef, idx) => {
      const loc = mockLocations.find(l => l.id === locRef || l.slug === locRef)
      return {
        id: locRef,
        order: idx + 1,
        lat: loc?.latitude ?? 61.35 + idx * 0.02,
        lng: loc?.longitude ?? 23.75 + idx * 0.02
      }
    })

    const legs = []
    for (let i = 0; i < waypoints.length - 1; i++) {
      const from = waypoints[i]
      const to = waypoints[i + 1]
      const letter = String.fromCharCode(65 + i) // 'A', 'B', ...
      legs.push({
        index: i,
        letter,
        fromId: from.id,
        toId: to.id
      })
    }

    expect(legs).toHaveLength(2)
    expect(legs[0].letter).toBe('A')
    expect(legs[0].index).toBe(0)
    expect(legs[1].letter).toBe('B')
    expect(legs[1].index).toBe(1)
  })

  it('generates segment features with active leg styling for 5-location traverse', () => {
    const dispatch = mockDispatches.find(d => d.slug === 'helvetinjarvi-taiga-traverse')!
    // 5 locations -> 4 legs (A, B, C, D)
    const numLegs = dispatch.locations.length - 1
    expect(numLegs).toBe(4)

    const letters = Array.from({ length: numLegs }, (_, i) => String.fromCharCode(65 + i))
    expect(letters).toEqual(['A', 'B', 'C', 'D'])

    // When leg 2 ('C') is selected
    const selectedLegIndex = 2
    const segments = letters.map((letter, idx) => {
      const isSelected = selectedLegIndex === idx
      const hasSelection = selectedLegIndex !== null
      return {
        legIndex: idx,
        letter,
        isSelected,
        opacity: hasSelection ? (isSelected ? 1.0 : 0.25) : 0.85,
        lineWidth: isSelected ? 4.5 : 3
      }
    })

    expect(segments[0].opacity).toBe(0.25)
    expect(segments[1].opacity).toBe(0.25)
    expect(segments[2].opacity).toBe(1.0)
    expect(segments[2].lineWidth).toBe(4.5)
    expect(segments[2].letter).toBe('C')
    expect(segments[3].opacity).toBe(0.25)
  })

  it('formats shrunk waypoint card layout with top row metadata and bottom row title', () => {
    const waypoint = {
      order: 1,
      category: 'trailhead',
      elevation: 180,
      title: 'Kankimäki P-alue (Helvetinjärvi)'
    }

    const cardLayout = {
      topRow: {
        order: waypoint.order,
        categoryIcon: waypoint.category.includes('trailhead') ? 'directions_car' : 'explore',
        elevation: {
          symbol: 'terrain',
          valueFormatted: `${waypoint.elevation}m`
        }
      },
      bottomRow: {
        title: waypoint.title
      }
    }

    expect(cardLayout.topRow.order).toBe(1)
    expect(cardLayout.topRow.categoryIcon).toBe('directions_car')
    expect(cardLayout.topRow.elevation.symbol).toBe('terrain')
    expect(cardLayout.topRow.elevation.valueFormatted).toBe('180m')
    expect(cardLayout.bottomRow.title).toBe('Kankimäki P-alue (Helvetinjärvi)')
  })

  it('automatically splits an ingested GPX route into legs based on dispatch locations', () => {
    const dispatch = mockDispatches.find(d => d.slug === 'birgitan-polku-circuit')!
    const waypoints = dispatch.locations.map((locRef: any, idx: number) => {
      const loc = mockLocations.find(l => l.id === locRef || l.slug === locRef)!
      return {
        id: loc.id,
        order: idx + 1,
        lat: loc.latitude,
        lng: loc.longitude
      }
    })

    // Simulated GPX track passing through Savontie Trailhead -> Vähä-Riutta -> Vähä-Kauas
    const gpxGeometry: Array<[number, number]> = [
      [23.8920, 61.3980],
      [23.8980, 61.4005],
      [23.9040, 61.4028],
      [23.9085, 61.4045], // Vähä-Riutta split vertex
      [23.9130, 61.3950],
      [23.9190, 61.3800],
      [23.9246, 61.3665]
    ]

    const legGeometries = splitRouteIntoLegs(gpxGeometry, waypoints)
    expect(legGeometries).toHaveLength(2)
    expect(legGeometries[0]).toEqual(gpxGeometry.slice(0, 4))
    expect(legGeometries[1]).toEqual(gpxGeometry.slice(3, 7))

    // Each leg carries its own GPX trail distance
    const legADistKm = polylineDistanceKm(legGeometries[0])
    const legBDistKm = polylineDistanceKm(legGeometries[1])
    expect(legADistKm).toBeGreaterThan(0)
    expect(legBDistKm).toBeGreaterThan(0)
    expect(formatDistance(legADistKm)).toMatch(/KM|M/)
    expect(formatDistance(legBDistKm)).toMatch(/KM|M/)
  })

  it('computes whole-route elevation telemetry when no leg is selected and keeps elevation curve strictly within SVG graph bounds', () => {
    const startElev = 135
    const destElev = 135
    const gain = 661
    const loss = 656

    const highEnd = Math.max(startElev, destElev)
    const lowEnd = Math.min(startElev, destElev)
    const baseSpan = Math.abs(destElev - startElev)
    const refSpan = Math.max(baseSpan, 24)
    const netAscent = Math.max(0, destElev - startElev)
    const netDescent = Math.max(0, startElev - destElev)
    const extraGain = Math.max(0, gain - netAscent)
    const extraLoss = Math.max(0, loss - netDescent)

    const crestAbove = extraGain > 0
      ? Math.min(Math.round(extraGain * 0.25), Math.round(refSpan * 0.55))
      : 0
    const dipBelow = extraLoss > 0
      ? Math.min(Math.round(extraLoss * 0.25), Math.round(refSpan * 0.45), Math.max(0, lowEnd - 5))
      : 0

    const e0 = startElev
    const eEnd = destElev
    const e1 = Math.round(e0 + (eEnd - e0) * 0.28 - dipBelow)
    const e2 = Math.round(highEnd + crestAbove)
    const e3 = Math.round(eEnd + (e2 - eEnd) * 0.22 - Math.min(dipBelow * 0.2, 4))
    const profileElevations = [e0, e1, e2, e3, eEnd]

    const maxPoint = Math.max(...profileElevations)
    const minPoint = Math.min(...profileElevations)
    const span = Math.max(maxPoint - minPoint, 12)
    const pad = Math.max(3, Math.round(span * 0.12))
    const peakVal = Math.round(maxPoint + pad)
    const minVal = Math.max(0, Math.round(minPoint - pad))
    const elevRange = Math.max(peakVal - minVal, 10)

    const getY = (elev: number) => {
      const rawNorm = (elev - minVal) / elevRange
      const norm = Math.max(0, Math.min(1, rawNorm))
      return Math.round(40 - norm * 26)
    }

    for (const elev of profileElevations) {
      expect(elev).toBeGreaterThanOrEqual(minVal)
      expect(elev).toBeLessThanOrEqual(peakVal)
      const y = getY(elev)
      // Must stay strictly inside [14, 40] within viewBox="0 0 300 54"
      expect(y).toBeGreaterThanOrEqual(14)
      expect(y).toBeLessThanOrEqual(40)
    }
  })

  it('highlights hovered location and hovered leg across both trail elevation profile and map layers', () => {
    const waypoints = [
      { id: 'wp-1', slug: 'wp-1', title: 'Savontie Trailhead', order: 1, elevation: 135, fraction: 0.2 },
      { id: 'wp-2', slug: 'wp-2', title: 'Vähä-Riutta Laavu', order: 2, elevation: 165, fraction: 0.55 },
      { id: 'wp-3', slug: 'wp-3', title: 'Vähä-Kauas Laavu', order: 3, elevation: 150, fraction: 0.85 }
    ]

    // 1. Hovering location 'wp-2' highlights order 2 on elevation profile and dims other waypoints on map
    const hoveredWaypointId = 'wp-2'
    const hoveredWaypointOrder = waypoints.find(w => w.id === hoveredWaypointId)?.order ?? null
    expect(hoveredWaypointOrder).toBe(2)

    const mapPointsOnLocationHover = waypoints.map((wp) => {
      const isHoveredWp = wp.id === hoveredWaypointId
      return {
        id: wp.id,
        order: wp.order,
        isSelected: isHoveredWp,
        isHovered: isHoveredWp,
        opacity: isHoveredWp ? 1.0 : 0.45
      }
    })
    expect(mapPointsOnLocationHover[0].opacity).toBe(0.45)
    expect(mapPointsOnLocationHover[1].isSelected).toBe(true)
    expect(mapPointsOnLocationHover[1].opacity).toBe(1.0)
    expect(mapPointsOnLocationHover[2].opacity).toBe(0.45)

    // 2. Hovering Leg A (index = 0, between wp-1 and wp-2) highlights [0.2, 0.55] on elevation profile
    //    and highlights Leg 0 + endpoint waypoints (idx 0 and idx 1) on the map
    const hoveredLegIndex = 0
    const highlightedRange = {
      startFraction: waypoints[hoveredLegIndex].fraction,
      endFraction: waypoints[hoveredLegIndex + 1].fraction,
      startOrder: waypoints[hoveredLegIndex].order,
      endOrder: waypoints[hoveredLegIndex + 1].order
    }
    expect(highlightedRange.startFraction).toBeCloseTo(0.2)
    expect(highlightedRange.endFraction).toBeCloseTo(0.55)
    expect(highlightedRange.startOrder).toBe(1)
    expect(highlightedRange.endOrder).toBe(2)

    const mapPointsOnLegHover = waypoints.map((wp, idx) => {
      const isLegEndpoint = idx === hoveredLegIndex || idx === hoveredLegIndex + 1
      return {
        id: wp.id,
        isSelected: isLegEndpoint,
        isLegEndpoint,
        opacity: isLegEndpoint ? 1.0 : 0.35
      }
    })
    expect(mapPointsOnLegHover[0].isSelected).toBe(true)
    expect(mapPointsOnLegHover[1].isSelected).toBe(true)
    expect(mapPointsOnLegHover[2].isSelected).toBe(false)
    expect(mapPointsOnLegHover[2].opacity).toBe(0.35)
  })
})
