import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { useNitfCms } from '../../composables/useNitfCms'

describe('useNitfCms Composable & Data Transformers', () => {
  beforeEach(() => {
    vi.unstubAllGlobals()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  it('starts empty with zero mock data fallback before CMS loads', () => {
    const {
      fieldNotes,
      mapWaypoints,
      locations,
      dispatches,
      areas,
      gearItems,
      gearReviews,
      loadouts,
      gearInsights,
      loadoutKits,
      gearCategories,
    } = useNitfCms()

    expect(fieldNotes.value).toEqual([])
    expect(mapWaypoints.value).toEqual([])
    expect(locations.value).toEqual([])
    expect(dispatches.value).toEqual([])
    expect(areas.value).toEqual([])
    expect(gearItems.value).toEqual([])
    expect(gearReviews.value).toEqual([])
    expect(loadouts.value).toEqual([])
    expect(gearInsights.value).toEqual([])
    expect(loadoutKits.value).toEqual([])
    expect(gearCategories.value).toEqual([])
  })

  it('sets error and preserves empty state instead of mocks when CMS is offline', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Network offline')))

    const {
      locations,
      dispatches,
      gearItems,
      loadoutKits,
      error,
      fetchWaypoints,
      fetchPosts,
      fetchGear,
      fetchLocationBySlug,
      fetchDispatchBySlug,
    } = useNitfCms()

    await fetchWaypoints()
    expect(locations.value).toEqual([])
    expect(error.value).toBeTruthy()

    await fetchPosts()
    expect(dispatches.value).toEqual([])
    expect(error.value).toBeTruthy()

    await fetchGear()
    expect(gearItems.value).toEqual([])
    expect(loadoutKits.value).toEqual([])
    expect(error.value).toBeTruthy()

    await expect(fetchLocationBySlug('non-existent')).resolves.toBeNull()
    await expect(fetchDispatchBySlug('non-existent')).resolves.toBeNull()
  })

  it('hydrates empty and populated CMS docs without leaking mock content', async () => {
    const fetchMock = vi.fn().mockImplementation(async (url: string) => {
      if (url.includes('/nitf_areas')) {
        return {
          ok: true,
          json: async () => ({
            docs: [{ id: 'area-1', name: 'Pirkanmaa', slug: 'pirkanmaa' }],
          }),
        }
      }
      if (url.includes('/nitf_locations')) {
        return {
          ok: true,
          json: async () => ({
            docs: [
              {
                id: 'loc-1',
                name: 'Vähä-Riutta Laavu',
                slug: 'vaha-riutta-laavu',
                area: { id: 'area-1', name: 'Pirkanmaa', slug: 'pirkanmaa' },
                category: 'shelter',
                latitude: 61.34,
                longitude: 23.76,
                amenities: ['timber_shelter'],
              },
            ],
          }),
        }
      }
      if (url.includes('/nitf_dispatches')) {
        return {
          ok: true,
          json: async () => ({ docs: [] }),
        }
      }
      return {
        ok: true,
        json: async () => ({ docs: [] }),
      }
    })
    vi.stubGlobal('fetch', fetchMock)

    const { locations, fieldNotes, mapWaypoints, dispatches, error, fetchWaypoints, fetchPosts } = useNitfCms()
    await fetchWaypoints()
    await fetchPosts()

    expect(error.value).toBeNull()
    expect(locations.value).toHaveLength(1)
    expect(fieldNotes.value).toHaveLength(1)
    expect(fieldNotes.value[0].area).toBe('Pirkanmaa')
    expect(mapWaypoints.value).toHaveLength(1)
    expect(dispatches.value).toEqual([])
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

