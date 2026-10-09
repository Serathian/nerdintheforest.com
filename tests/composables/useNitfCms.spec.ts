import { describe, it, expect } from 'vitest'
import { fallbackFieldNotes, fallbackMapWaypoints, transformPostToFieldNote } from '../../composables/useNitfCms'

describe('useNitfCms Composable & Data Transformers', () => {
  it('provides rich fallback field notes when offline', () => {
    expect(fallbackFieldNotes.length).toBeGreaterThanOrEqual(6)
    expect(fallbackFieldNotes[0].title).toBe('Langvatnet Gapahuk')
    expect(fallbackFieldNotes[0].numberTag).toBe('#04 SHELTER')
    expect(fallbackFieldNotes[0].elevation).toBe(501)
    expect(fallbackFieldNotes[0].distanceKm).toBe(1.2)
  })

  it('provides fallback map waypoints with lat/lng', () => {
    expect(fallbackMapWaypoints.length).toBeGreaterThanOrEqual(6)
    expect(fallbackMapWaypoints[0].lat).toBeCloseTo(60.271, 2)
    expect(fallbackMapWaypoints[0].lng).toBeCloseTo(10.732, 2)
  })

  it('covers all Stitch categories across fallback field notes', () => {
    const categories = fallbackFieldNotes.map(n => n.category)
    expect(categories).toContain('SHELTER')
    expect(categories).toContain('HEARTH')
    expect(categories).toContain('SPRINGHEAD')
    expect(categories).toContain('SUMMIT')
    expect(categories).toContain('VIEWPOINT')
  })

  it('transforms CMS posts into frontend FieldNotes correctly', () => {
    const rawPost = {
      id: 'cms-post-101',
      title: 'Nordmarka Ridge Survey',
      excerpt: 'High elevation patrol along ridge line',
      latitude: 60.15,
      longitude: 10.43,
      elevation: 520,
      createdAt: '2026-03-01T12:00:00Z',
      amenities: ['Summit', 'Campground']
    }

    const transformed = transformPostToFieldNote(rawPost, 0)
    expect(transformed.id).toBe('cms-post-101')
    expect(transformed.numberTag).toBe('#01 FIELD NOTE')
    expect(transformed.title).toBe('Nordmarka Ridge Survey')
    expect(transformed.description).toBe('High elevation patrol along ridge line')
    expect(transformed.metrics).toContain('520m')
    expect(transformed.latitude).toBe(60.15)
  })
})
