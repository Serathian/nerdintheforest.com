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
})
