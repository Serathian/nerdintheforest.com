import { describe, it, expect } from 'vitest'
import { fallbackFieldNotes, fallbackMapWaypoints, transformPostToFieldNote, useNitfCms } from '../../composables/useNitfCms'

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

  it('exposes normalized locations and dispatches with derived visit count', () => {
    const { locations, dispatches, areas } = useNitfCms()
    expect(areas.value.length).toBeGreaterThanOrEqual(2)
    expect(locations.value.length).toBeGreaterThanOrEqual(6)
    expect(dispatches.value.length).toBeGreaterThanOrEqual(5)

    // Unvisited location has 0 dispatches
    const unvisited = locations.value.find(l => l.id === 'note-2')
    expect(unvisited).toBeDefined()
    expect(unvisited?.dispatches?.length).toBe(0)

    // Visited location has matching linked dispatches
    const visited = locations.value.find(l => l.id === 'note-1')
    expect(visited).toBeDefined()
    expect(visited?.dispatches?.length).toBeGreaterThanOrEqual(2)
  })

  it('transforms live Payload CMS location docs into client models', async () => {
    const { transformCmsLocation, transformLocationToFieldNote } = await import('../../composables/useNitfCms')

    const rawLocationDoc = {
      id: 12,
      name: 'Kaitajärvi Kota',
      slug: 'kaitajarvi-kota',
      category: 'shelter',
      latitude: 61.852,
      longitude: 24.125,
      elevation: 180,
      summary: 'Timber kota on the eastern shore of Kaitajärvi lake.',
      amenities: ['timber_shelter', 'stone_hearth', 'dry_wood'],
      area: {
        id: 6,
        name: 'Pirkanmaa',
        slug: 'pirkanmaa'
      },
      trailhead: {
        id: 11,
        name: 'Kaitajärvi Trailhead',
        slug: 'kaitajarvi-trailhead',
        category: 'trailhead',
        latitude: 61.848,
        longitude: 24.110,
        elevation_gain: 35
      },
      elevation_gain: 35
    }

    const loc = transformCmsLocation(rawLocationDoc)
    expect(loc.id).toBe('kaitajarvi-kota')
    expect(loc.category).toBe('shelter')
    expect(loc.latitude).toBe(61.852)
    expect(loc.amenities).toEqual(['timber_shelter', 'stone_hearth', 'dry_wood'])
    expect(loc.trailhead).toBeDefined()
    expect(typeof loc.trailhead).toBe('object')
    if (typeof loc.trailhead === 'object') {
      expect(loc.trailhead?.name).toBe('Kaitajärvi Trailhead')
      expect(loc.trailhead?.latitude).toBe(61.848)
    }

    const fieldNote = transformLocationToFieldNote(loc, 'Pirkanmaa', 0, [])
    expect(fieldNote.title).toBe('Kaitajärvi Kota')
    expect(fieldNote.category).toBe('SHELTER')
    expect(fieldNote.area).toBe('Pirkanmaa')
    expect(fieldNote.trailhead?.name).toBe('Kaitajärvi Trailhead')
    expect(fieldNote.visitedCount).toBe(0)
    expect(fieldNote.amenities.some(a => a.icon === 'cabin')).toBe(true)
    expect(fieldNote.amenities.some(a => a.icon === 'outdoor_grill')).toBe(true)
  })
})

