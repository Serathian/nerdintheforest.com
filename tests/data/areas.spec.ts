import { describe, it, expect } from 'vitest'
import { mockAreas, mockFieldNotes, mockMapWaypoints } from '../../data/mockNordicTrail'
import type { FilterState } from '../../components/organisms/FilterModal.vue'

describe('Atlas Map Area Model and Filter Specification', () => {
  it('validates configured areas including Pirkanmaa in Finland', () => {
    expect(mockAreas.length).toBeGreaterThanOrEqual(2)

    const pirkanmaa = mockAreas.find(a => a.id === 'pirkanmaa')
    expect(pirkanmaa).toBeDefined()
    expect(pirkanmaa?.name).toBe('Pirkanmaa')
    expect(pirkanmaa?.country).toBe('Finland')
    expect(pirkanmaa?.center).toBeDefined()

    const nordmarka = mockAreas.find(a => a.id === 'nordmarka')
    expect(nordmarka).toBeDefined()
    expect(nordmarka?.name).toBe('Nordmarka')
    expect(nordmarka?.country).toBe('Norway')
  })

  it('validates 1:N relationship: an area contains multiple locations, but locations link to only one area', () => {
    const validAreaIds = new Set(mockAreas.map(a => a.id))

    // Every location has exactly one areaId that exists in mockAreas
    for (const note of mockFieldNotes) {
      expect(typeof note.areaId).toBe('string')
      expect(note.areaId.length).toBeGreaterThan(0)
      expect(validAreaIds.has(note.areaId)).toBe(true)
      expect(note.area).toBeDefined()
    }

    // An area can contain multiple locations
    const pirkanmaaLocations = mockFieldNotes.filter(n => n.areaId === 'pirkanmaa')
    expect(pirkanmaaLocations.length).toBeGreaterThanOrEqual(2)

    const nordmarkaLocations = mockFieldNotes.filter(n => n.areaId === 'nordmarka')
    expect(nordmarkaLocations.length).toBeGreaterThanOrEqual(2)

    // Sum of locations partitioned by area equals total locations
    expect(pirkanmaaLocations.length + nordmarkaLocations.length).toBe(mockFieldNotes.length)
  })

  it('verifies that Area is a filter type in FilterState and filters locations accurately', () => {
    // 1. ALL areas
    const filterAll: FilterState = {
      category: 'ALL',
      area: 'ALL',
      visitStatus: 'ALL',
      maxDistanceKm: 0,
      amenities: []
    }
    const filteredAll = mockFieldNotes.filter(n => {
      if (filterAll.area !== 'ALL' && n.areaId !== filterAll.area) return false
      return true
    })
    expect(filteredAll).toHaveLength(mockFieldNotes.length)

    // 2. Filter by Pirkanmaa
    const filterPirkanmaa: FilterState = {
      category: 'ALL',
      area: 'pirkanmaa',
      visitStatus: 'ALL',
      maxDistanceKm: 0,
      amenities: []
    }
    const filteredPirkanmaa = mockFieldNotes.filter(n => {
      if (filterPirkanmaa.area !== 'ALL' && n.areaId !== filterPirkanmaa.area) return false
      return true
    })
    expect(filteredPirkanmaa.length).toBeGreaterThanOrEqual(2)
    for (const note of filteredPirkanmaa) {
      expect(note.areaId).toBe('pirkanmaa')
      expect(note.area).toBe('Pirkanmaa')
    }

    // 3. Filter by Nordmarka
    const filterNordmarka: FilterState = {
      category: 'ALL',
      area: 'nordmarka',
      visitStatus: 'ALL',
      maxDistanceKm: 0,
      amenities: []
    }
    const filteredNordmarka = mockFieldNotes.filter(n => {
      if (filterNordmarka.area !== 'ALL' && n.areaId !== filterNordmarka.area) return false
      return true
    })
    expect(filteredNordmarka.length).toBeGreaterThanOrEqual(4)
    for (const note of filteredNordmarka) {
      expect(note.areaId).toBe('nordmarka')
      expect(note.area).toBe('Nordmarka')
    }
  })

  it('validates map waypoints inherit the location area and region metadata', () => {
    expect(mockMapWaypoints.length).toBe(mockFieldNotes.length)

    for (const wp of mockMapWaypoints) {
      expect(wp.areaId).toBeDefined()
      expect(wp.area).toBeDefined()
      expect(wp.region).toBe(wp.area)
    }

    const pirkanmaaWps = mockMapWaypoints.filter(w => w.areaId === 'pirkanmaa')
    expect(pirkanmaaWps.length).toBeGreaterThanOrEqual(2)

    const nordmarkaWps = mockMapWaypoints.filter(w => w.areaId === 'nordmarka')
    expect(nordmarkaWps.length).toBeGreaterThanOrEqual(4)
  })
})
