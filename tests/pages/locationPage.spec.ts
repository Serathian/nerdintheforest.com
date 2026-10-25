import { describe, it, expect } from 'vitest'
import { mockLocations, mockDispatches } from '../../data/mockNordicTrail'
import { getLocationVisits, getLocationMediaArchive, formatCoordinates } from '../../utils/formatters'

describe('Dedicated Location Page Data Layer (/locations/[slug])', () => {
  it('resolves location details by slug with full metadata', () => {
    const loc = mockLocations.find(l => l.slug === 'langvatnet-gapahuk')
    expect(loc).toBeDefined()
    expect(loc?.name).toBe('Langvatnet Gapahuk')
    expect(loc?.latitude).toBeCloseTo(60.271)
    expect(loc?.longitude).toBeCloseTo(10.732)
    expect(loc?.category).toBe('shelter')
    expect(loc?.amenities).toContain('timber_shelter')
    expect(loc?.amenities).toContain('stone_hearth')
  })

  it('resolves Kikut Peak by slug matching CMS seed data', () => {
    const kikut = mockLocations.find(l => l.slug === 'kikut-peak')
    expect(kikut).toBeDefined()
    expect(kikut?.name).toBe('Kikut Peak (604m)')
    expect(kikut?.elevation).toBe(604)
    expect(kikut?.latitude).toBeCloseTo(60.088)
    expect(kikut?.longitude).toBeCloseTo(10.655)
    expect(kikut?.category).toBe('viewpoint')
  })

  it('aggregates multi-location visits across multiple outings', () => {
    const loc1 = mockLocations.find(l => l.id === 'note-1')!
    const loc3 = mockLocations.find(l => l.id === 'note-3')!

    const visits1 = getLocationVisits(loc1, mockDispatches)
    const visits3 = getLocationVisits(loc3, mockDispatches)

    // Both note-1 and note-3 are visited by dispatch-1
    expect(visits1.dispatches.some(d => d.id === 'dispatch-1')).toBe(true)
    expect(visits3.dispatches.some(d => d.id === 'dispatch-1')).toBe(true)

    // Visit count is greater than 0
    expect(visits1.visitCount).toBeGreaterThan(0)
    expect(visits3.visitCount).toBeGreaterThan(0)
  })

  it('aggregates photo archive items with captions and dispatch context', () => {
    const loc1 = mockLocations.find(l => l.id === 'note-1')!
    const archive = getLocationMediaArchive(loc1, mockDispatches)

    expect(archive.length).toBeGreaterThanOrEqual(2)
    const firstPhoto = archive[0]
    expect(firstPhoto.url).toBeDefined()

    // Contains tagged photo from dispatch-1
    const tagged = archive.find(p => p.caption?.includes('timber gapahuk'))
    expect(tagged).toBeDefined()
    expect(tagged?.dispatchTitle).toContain('Langvatnet')
  })

  it('formats coordinates and stamps for SEO & telemetry', () => {
    const loc = mockLocations.find(l => l.slug === 'langvatnet-gapahuk')!
    const coords = formatCoordinates(loc.latitude, loc.longitude)
    expect(coords).toMatch(/^\[\d+\.\d+°N • \d+\.\d+°E\]$/)
  })
})
