import { describe, it, expect } from 'vitest'
import { formatDistance, haversineKm } from '../../utils/geo'
import { fallbackFieldNotes } from '../../composables/useNitfCms'

describe('geo utils', () => {
  it('computes great-circle distance in km', () => {
    // 0.01° of latitude ≈ 1.112 km anywhere on the globe
    expect(haversineKm([10.7, 60.27], [10.7, 60.28])).toBeCloseTo(1.112, 2)
    expect(haversineKm([10.7, 60.27], [10.7, 60.27])).toBe(0)
  })

  it('formats sub-kilometre distances in metres and longer ones in km', () => {
    expect(formatDistance(0.846)).toBe('850 M')
    expect(formatDistance(1.44)).toBe('1.4 KM')
    expect(formatDistance(12.06)).toBe('12.1 KM')
  })
})

describe('trailhead fallback data', () => {
  it('has some locations with a trailhead and some without', () => {
    const withTrailhead = fallbackFieldNotes.filter(n => n.trailhead)
    expect(withTrailhead.length).toBeGreaterThan(0)
    expect(withTrailhead.length).toBeLessThan(fallbackFieldNotes.length)
  })

  it('places every trailhead within a plausible walk-in distance of its location', () => {
    for (const note of fallbackFieldNotes) {
      if (!note.trailhead) continue
      const km = haversineKm(
        [note.longitude, note.latitude],
        [note.trailhead.longitude, note.trailhead.latitude]
      )
      expect(km).toBeGreaterThan(0.1)
      expect(km).toBeLessThan(10)
    }
  })
})
