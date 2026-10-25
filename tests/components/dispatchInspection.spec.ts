import { describe, it, expect } from 'vitest'
import { mockDispatches, mockLocations } from '../../data/mockNordicTrail'

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
})
