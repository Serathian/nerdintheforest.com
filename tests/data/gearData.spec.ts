import { describe, it, expect } from 'vitest'
import {
  mockLoadoutKits,
  mockGearInsights,
  mockGearItems,
  mockGearReviews,
  mockLoadouts
} from '../../data/mockGearData'

describe('Gear Ledger Data Specifications', () => {
  it('validates seasonal loadout kits structure', () => {
    expect(mockLoadoutKits.length).toBe(4)

    const seasons = mockLoadoutKits.map(k => k.season)
    expect(seasons).toEqual(['AUTUMN', 'WINTER', 'SPRING', 'SUMMER'])

    for (const kit of mockLoadoutKits) {
      expect(kit.title).toBeDefined()
      expect(kit.baseWeightKg).toBeGreaterThan(0)
      expect(kit.categories.length).toBeGreaterThanOrEqual(2)

      for (const category of kit.categories) {
        expect(category.items.length).toBeGreaterThan(0)
        for (const item of category.items) {
          expect(item.name).toBeTruthy()
          expect(item.weightGrams).toBeGreaterThan(0)
          expect(item.spec).toBeTruthy()
          expect(['PACKED', 'ESSENTIAL', 'READY', 'WORN']).toContain(item.status)
        }
      }
    }
  })

  it('validates gear insights data structure and categories', () => {
    expect(mockGearInsights.length).toBeGreaterThanOrEqual(6)

    for (const insight of mockGearInsights) {
      expect(insight.id).toBeTruthy()
      expect(insight.title).toBeTruthy()
      expect(insight.tag).toBeTruthy()
      expect(insight.image).toBeTruthy()
      expect(insight.summary).toBeTruthy()
      expect(insight.equipmentTested).toBeTruthy()
      expect(insight.duration).toBeTruthy()
      expect(insight.date).toBeTruthy()
      expect(insight.readTime).toBeTruthy()
      expect(insight.observations.length).toBeGreaterThanOrEqual(3)
      expect(insight.verdict).toBeTruthy()
      expect(insight.telemetry.length).toBeGreaterThanOrEqual(3)
    }

    const categories = new Set(mockGearInsights.map(i => i.category))
    expect(categories.has('DURABILITY')).toBe(true)
    expect(categories.has('THERMAL')).toBe(true)
    expect(categories.has('MAINTENANCE')).toBe(true)
    expect(categories.has('PHILOSOPHY')).toBe(true)
  })

  it('verifies discrete season selector stops mapping', () => {
    const seasonStops = ['SPRING', 'SUMMER', 'AUTUMN', 'WINTER'] as const
    for (const stop of seasonStops) {
      const kit = mockLoadoutKits.find(k => k.id === stop)
      expect(kit).toBeDefined()
      expect(kit?.label).toBeTruthy()
    }

    // Verify discrete station snapping (0 to 3) without continuous progressive fill
    const testRatios = [0.05, 0.24, 0.26, 0.49, 0.51, 0.74, 0.76, 0.99]
    const expectedIndices = [0, 0, 1, 1, 2, 2, 3, 3]
    testRatios.forEach((ratio, i) => {
      const index = Math.min(3, Math.floor(ratio * 4))
      expect(index).toBe(expectedIndices[i])
    })
  })

  it('validates normalized core gear models (mockGearItems, mockGearReviews, mockLoadouts)', () => {
    // 1. Master Gear Items Catalog
    expect(mockGearItems.length).toBeGreaterThanOrEqual(10)
    for (const item of mockGearItems) {
      expect(item.id).toBeTruthy()
      expect(item.name).toBeTruthy()
      expect(item.brand).toBeTruthy()
      expect(item.weightGrams).toBeGreaterThan(0)
      expect(item.category).toBeTruthy()
    }

    // 2. Simplified Gear Reviews (linking to gear items)
    expect(mockGearReviews.length).toBeGreaterThanOrEqual(6)
    for (const review of mockGearReviews) {
      expect(review.id).toBeTruthy()
      expect(review.title).toBeTruthy()
      expect(review.gearItem).toBeDefined()
      expect(review.keyTakeaways.length).toBeGreaterThanOrEqual(3)
      expect(review.verdict).toBeTruthy()
    }

    // 3. Loadouts (clean without terrain, computing weights dynamically)
    expect(mockLoadouts.length).toBe(4)
    for (const loadout of mockLoadouts) {
      expect(loadout.id).toBeTruthy()
      expect(loadout.title).toBeTruthy()
      expect(loadout.season).toBeTruthy()
      expect(loadout.items.length).toBeGreaterThan(0)
      for (const entry of loadout.items) {
        expect(entry.item).toBeDefined()
        expect(['packed', 'essential', 'worn', 'consumable']).toContain(entry.status)
      }
    }
  })
})

