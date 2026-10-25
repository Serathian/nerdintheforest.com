import { describe, it, expect } from 'vitest'
import {
  calculateReadTime,
  calculateLoadoutStats,
  getLocationVisits,
  getLocationMediaArchive,
  formatCoordinates,
  formatWeight,
  getAmenityMeta
} from '../../utils/formatters'
import { mockLoadouts, mockGearItems } from '../../data/mockGearData'
import { mockLocations, mockDispatches } from '../../data/mockNordicTrail'

describe('utils/formatters Specification', () => {
  it('calculates read time accurately from text and string arrays', () => {
    // 200 words = 1 min
    const shortText = 'One two three four five'
    expect(calculateReadTime(shortText)).toBe('1 MIN READ')

    const words450 = new Array(450).fill('word').join(' ')
    expect(calculateReadTime(words450)).toBe('3 MIN READ')

    const arrayText = ['Paragraph one with words.', 'Paragraph two with more words.']
    expect(calculateReadTime(arrayText)).toBe('1 MIN READ')
  })

  it('computes loadout base weight accurately excluding worn gear', () => {
    const autumnLoadout = mockLoadouts.find(l => l.season === 'autumn')!
    expect(autumnLoadout).toBeDefined()

    const stats = calculateLoadoutStats(autumnLoadout)
    expect(Number(stats.baseWeightKg)).toBeGreaterThan(0)
    expect(Number(stats.totalWeightKg)).toBeGreaterThanOrEqual(Number(stats.baseWeightKg))
    expect(stats.itemCount).toBe(autumnLoadout.items.length)
  })

  it('derives location visit count and status directly from linked dispatches', () => {
    // Unvisited location (note-2) has 0 dispatches
    const unvisitedLoc = mockLocations.find(l => l.id === 'note-2')!
    expect(unvisitedLoc).toBeDefined()
    const unvisitedStats = getLocationVisits(unvisitedLoc, mockDispatches)
    expect(unvisitedStats.isVisited).toBe(false)
    expect(unvisitedStats.visitCount).toBe(0)
    expect(unvisitedStats.dispatches).toHaveLength(0)

    // Visited location (note-1) has dispatches
    const visitedLoc = mockLocations.find(l => l.id === 'note-1')!
    expect(visitedLoc).toBeDefined()
    const visitedStats = getLocationVisits(visitedLoc, mockDispatches)
    expect(visitedStats.isVisited).toBe(true)
    expect(visitedStats.visitCount).toBeGreaterThanOrEqual(2)
    expect(visitedStats.dispatches.length).toBe(visitedStats.visitCount)
  })

  it('formats GPS coordinates into surveyor stamp format', () => {
    const stamp = formatCoordinates(60.2710, 10.7320)
    expect(stamp).toBe('[60.2710°N • 10.7320°E]')

    const southWest = formatCoordinates(-33.8688, -151.2093)
    expect(southWest).toBe('[33.8688°S • 151.2093°W]')
  })

  it('formats weight in grams and kilograms', () => {
    expect(formatWeight(63)).toBe('63g')
    expect(formatWeight(439)).toBe('439g')
    expect(formatWeight(1700)).toBe('1.7 kg')
    expect(formatWeight(2600)).toBe('2.6 kg')
  })

  it('resolves amenity metadata labels and icons', () => {
    const shelter = getAmenityMeta('timber_shelter')
    expect(shelter.label).toBe('Timber Shelter')
    expect(shelter.icon).toBe('cabin')

    const hearth = getAmenityMeta('stone_hearth')
    expect(hearth.label).toBe('Stone Hearth')
    expect(hearth.icon).toBe('outdoor_grill')
  })

  it('supports multi-location dispatches registering visits to all linked locations', () => {
    // dispatch-1 links both note-1 and note-3
    const loc1 = mockLocations.find(l => l.id === 'note-1')!
    const loc3 = mockLocations.find(l => l.id === 'note-3')!

    const visits1 = getLocationVisits(loc1, mockDispatches)
    const visits3 = getLocationVisits(loc3, mockDispatches)

    expect(visits1.dispatches.some(d => d.id === 'dispatch-1')).toBe(true)
    expect(visits3.dispatches.some(d => d.id === 'dispatch-1')).toBe(true)
  })

  it('extracts and aggregates tagged survey photos into a location photo archive', () => {
    const loc1 = mockLocations.find(l => l.id === 'note-1')!
    const archive = getLocationMediaArchive(loc1, mockDispatches)

    expect(archive.length).toBeGreaterThan(0)
    // First photo should be cover image or tagged dispatch photo
    expect(archive[0].url).toBeDefined()
    // Check that dispatch-1 tagged photos are in the archive
    const dispatchTagged = archive.find(p => p.dispatchTitle.includes('Langvatnet'))
    expect(dispatchTagged).toBeDefined()
  })
})
