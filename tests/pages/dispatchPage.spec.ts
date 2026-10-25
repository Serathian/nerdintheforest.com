import { describe, it, expect } from 'vitest'
import { mockDispatches, mockLocations } from '../../data/mockNordicTrail'
import { calculateReadTime } from '../../utils/formatters'

describe('Dedicated Dispatch Page Data Layer (/dispatches/[slug])', () => {
  it('resolves dispatch details by slug with full metadata', () => {
    const dispatch = mockDispatches.find(d => d.slug === 'langvatnet-gapahuk')
    expect(dispatch).toBeDefined()
    expect(dispatch?.title).toBe('Autumn Frost & Morning Mist at Langvatnet')
    expect(dispatch?.weather).toContain('MIST')
    expect(dispatch?.locations).toBeInstanceOf(Array)
    expect(dispatch?.locations.length).toBeGreaterThanOrEqual(1)
  })

  it('resolves all linked locations visited during the dispatch outing', () => {
    const dispatch = mockDispatches.find(d => d.slug === 'langvatnet-gapahuk')!
    expect(dispatch).toBeDefined()

    // Dispatch 1 links multiple locations (note-1 and note-3)
    const linked = mockLocations.filter(loc => {
      return dispatch.locations.some(l => {
        const id = typeof l === 'object' ? (l.id || l.slug) : l
        return id === loc.id || id === loc.slug
      })
    })

    expect(linked.length).toBeGreaterThanOrEqual(2)
    const names = linked.map(l => l.name)
    expect(names.some(n => n.includes('Langvatnet'))).toBe(true)
    expect(names.some(n => n.includes('Korsbekken'))).toBe(true)
  })

  it('calculates reading time from dispatch content', () => {
    const dispatch = mockDispatches.find(d => d.slug === 'langvatnet-gapahuk')!
    const time = calculateReadTime(dispatch.content)
    expect(time).toMatch(/^\d+ MIN READ$/)
  })

  it('contains survey photo gallery with per-photo location tagging', () => {
    const dispatch = mockDispatches.find(d => d.slug === 'langvatnet-gapahuk')!
    expect(dispatch.gallery).toBeDefined()
    expect(dispatch.gallery!.length).toBeGreaterThanOrEqual(2)

    const taggedPhoto = dispatch.gallery!.find(g => g.location === 'note-1')
    expect(taggedPhoto).toBeDefined()
    expect(taggedPhoto?.caption).toBeDefined()
  })
})
