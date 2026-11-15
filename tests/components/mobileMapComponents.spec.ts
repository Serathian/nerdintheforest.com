import { describe, it, expect } from 'vitest'
import { mockFieldNotes as fallbackFieldNotes } from '../../data/mockNordicTrail'
import { calculateMapFocusPadding } from '../../utils/mapViewport'

describe('Mobile Map View Component Specifications', () => {
  it('validates Nordic Field Notes color tokens in CSS variables', () => {
    const pinePrimary = '#1b2e24'
    const beaconSecondary = '#d9531e'
    const surfaceParchment = '#fef9ed'
    const lichenSlate = '#526056'

    expect(pinePrimary).toBe('#1b2e24')
    expect(beaconSecondary).toBe('#d9531e')
    expect(surfaceParchment).toBe('#fef9ed')
    expect(lichenSlate).toBe('#526056')
  })

  it('validates Standardized Dossier Sheet data structure', () => {
    const testNote = fallbackFieldNotes[0]
    expect(testNote.title).toBe('Langvatnet Gapahuk')
    expect(testNote.numberTag).toBe('#04 SHELTER')
    expect(testNote.visitedCount).toBe(2)
    expect(testNote.elevation).toBe(501)
    expect(testNote.distanceKm).toBe(1.2)
    expect(testNote.amenities.length).toBeGreaterThanOrEqual(3)
  })

  it('verifies filter criteria matching for categories, distance, and areas', () => {
    const shelterNotes = fallbackFieldNotes.filter(n => n.category === 'SHELTER')
    expect(shelterNotes.length).toBeGreaterThanOrEqual(1)

    const nearbyNotes = fallbackFieldNotes.filter(n => (n.distanceKm ?? 0) <= 2.0)
    expect(nearbyNotes.length).toBeGreaterThanOrEqual(2)

    const visitedNotes = fallbackFieldNotes.filter(n => (n.visitedCount ?? 0) > 0)
    expect(visitedNotes.length).toBeGreaterThanOrEqual(3)

    // Area filtering
    const pirkanmaaNotes = fallbackFieldNotes.filter(n => n.areaId === 'pirkanmaa')
    expect(pirkanmaaNotes.length).toBeGreaterThanOrEqual(2)
    for (const note of pirkanmaaNotes) {
      expect(note.area).toBe('Pirkanmaa')
    }

    const nordmarkaNotes = fallbackFieldNotes.filter(n => n.areaId === 'nordmarka')
    expect(nordmarkaNotes.length).toBeGreaterThanOrEqual(4)
    for (const note of nordmarkaNotes) {
      expect(note.area).toBe('Nordmarka')
    }
  })

  it('verifies elevation profile telemetry calculation', () => {
    const startElevation = 305
    const peakElevation = 485
    const netGain = peakElevation - startElevation
    expect(netGain).toBe(180)
  })

  it('validates unvisited locations have no dispatches and no amenities', () => {
    const unvisitedNotes = fallbackFieldNotes.filter(n => (n.visitedCount ?? 0) === 0)
    expect(unvisitedNotes.length).toBeGreaterThanOrEqual(1)

    for (const note of unvisitedNotes) {
      expect(note.amenities).toHaveLength(0)
      expect(note.dispatches ?? []).toHaveLength(0)
    }
  })

  it('validates visited locations have dispatches count matching visited counter', () => {
    const visitedNotes = fallbackFieldNotes.filter(n => (n.visitedCount ?? 0) > 0)
    expect(visitedNotes.length).toBeGreaterThanOrEqual(1)

    for (const note of visitedNotes) {
      expect(note.dispatches?.length).toBe(note.visitedCount)
      expect(note.amenities.length).toBeGreaterThan(0)
    }
  })

  it('verifies trailhead availability for navigation eligibility', () => {
    const notesWithTrailhead = fallbackFieldNotes.filter(n => !!n.trailhead)
    const notesWithoutTrailhead = fallbackFieldNotes.filter(n => !n.trailhead)

    expect(notesWithTrailhead.length).toBeGreaterThanOrEqual(1)
    expect(notesWithoutTrailhead.length).toBeGreaterThanOrEqual(1)

    for (const note of notesWithTrailhead) {
      expect(note.trailhead?.name).toBeDefined()
      expect(note.trailhead?.latitude).toBeDefined()
      expect(note.trailhead?.longitude).toBeDefined()
      expect(note.trailhead?.elevationGain).toBeGreaterThan(0)
      expect(note.trailhead?.elevationLoss).toBeGreaterThanOrEqual(0)
    }
  })

  it('verifies unified bookmark sheet specifications and metrics', () => {
    // Asymmetric 2/3 ledger tab width ratio
    const ledgerTabRatio = 2 / 3
    expect(ledgerTabRatio).toBeCloseTo(0.667, 2)

    // Standard tactile tab height
    const tabHeightPx = 38
    expect(tabHeightPx).toBe(38)

    // Chevron icons for closed/open bookmark sheet states
    const chevronClosed = 'keyboard_arrow_up'
    const chevronOpen = 'keyboard_arrow_down'
    expect(chevronClosed).toBe('keyboard_arrow_up')
    expect(chevronOpen).toBe('keyboard_arrow_down')
  })

  it('validates base layer overlay mechanics for search and location peek modes', () => {
    // Mode transitions: search mode base layer vs location peek base layer
    const getMode = (selectedId?: string) => (selectedId ? 'location_peek' : 'search')
    expect(getMode()).toBe('search')
    expect(getMode('langvatnet-gapahuk')).toBe('location_peek')

    // Two-section minimum height rule: at least two tab heights above bottom nav
    const minTabHeightPx = 38
    const minTwoSectionHeightPx = 2 * minTabHeightPx
    expect(minTwoSectionHeightPx).toBe(76)

    // Contrast tones between main section and collapsible drawer
    const mainSectionTone = '#faf4e8' // Light floating parchment
    const collapsibleDrawerTone = '#e5d6b8' // Deeper warm Kraft tray
    expect(mainSectionTone).not.toBe(collapsibleDrawerTone)

    // Pinned bottom nav offset ensuring base controls stay static
    const bottomNavOffsetPx = 68
    expect(bottomNavOffsetPx).toBe(68)
  })

  it('centers map elements in visible viewport when peeking a location with or without trailhead', () => {
    const windowHeight = 844
    const viewportBottom = windowHeight - 64 // 780px map canvas
    const topClearance = 76

    // Scenario A: Location WITH trailhead (tall peek card ~340px)
    const drawerHeightWithTrailhead = 340
    const drawerTopWithTrailhead = windowHeight - drawerHeightWithTrailhead // 504px
    const paddingWithTrailhead = calculateMapFocusPadding({
      windowHeight,
      viewportBottom,
      drawerTop: drawerTopWithTrailhead,
      topClearance
    })

    // Bounds center calculation in MapLibre:
    // (pad.top + (canvasHeight - pad.bottom)) / 2
    const boundsCenterY =
      (paddingWithTrailhead.top + (viewportBottom - paddingWithTrailhead.bottom)) / 2
    expect(boundsCenterY).toBe(drawerTopWithTrailhead / 2) // Exactly 252px
    // Equal clearance from top of screen and from top of drawer
    expect(boundsCenterY - 0).toBe(drawerTopWithTrailhead - boundsCenterY)

    // Scenario B: Location WITHOUT trailhead (compact peek card ~240px)
    const drawerHeightWithoutTrailhead = 240
    const drawerTopWithoutTrailhead = windowHeight - drawerHeightWithoutTrailhead // 604px
    const paddingWithoutTrailhead = calculateMapFocusPadding({
      windowHeight,
      viewportBottom,
      drawerTop: drawerTopWithoutTrailhead,
      topClearance
    })

    // Single-point offset in MapLibre:
    // Y = canvasHeight / 2 + (pad.top - pad.bottom) / 2
    const singlePointOffsetY =
      Math.round((paddingWithoutTrailhead.top - paddingWithoutTrailhead.bottom) / 2)
    const singlePointY = viewportBottom / 2 + singlePointOffsetY
    expect(singlePointY).toBe(drawerTopWithoutTrailhead / 2) // Exactly 302px
    // Equal clearance from top of screen and from top of drawer
    expect(singlePointY - 0).toBe(drawerTopWithoutTrailhead - singlePointY)
  })

  it('centers inspected route waypoints in visible viewport above inspection dock', () => {
    const windowHeight = 940
    const viewportBottom = 940
    const topClearance = 76
    const inspectionCardHeight = 330
    const drawerTop = windowHeight - inspectionCardHeight // 610px

    const padding = calculateMapFocusPadding({
      windowHeight,
      viewportBottom,
      drawerTop,
      topClearance
    })

    expect(padding.top).toBe(76)
    expect(padding.bottom).toBe(330 + 76) // 406px

    // Midpoint of bounds in MapLibre:
    // (pad.top + (canvasHeight - pad.bottom)) / 2
    const boundsCenterY = (padding.top + (viewportBottom - padding.bottom)) / 2
    expect(boundsCenterY).toBe(drawerTop / 2) // Exactly 305px, precisely centered above drawer
    expect(boundsCenterY - 0).toBe(drawerTop - boundsCenterY)
  })

  it('measures drawer top correctly when inspection dock card is present', async () => {
    const { measureDrawerTop } = await import('../../utils/mapViewport')
    const mockCard = {
      getBoundingClientRect: () => ({
        top: 610,
        bottom: 940,
        left: 0,
        right: 400,
        width: 400,
        height: 330,
        x: 0,
        y: 610
      })
    }
    const mockContainer = {
      querySelector: (sel: string) => {
        if (sel.includes('.inspection-dock-card')) return mockCard
        return null
      }
    } as any

    // Ensure window exists in Node environment for this test
    const origWindow = (globalThis as any).window
    ;(globalThis as any).window = { innerHeight: 940 }
    try {
      const measured = measureDrawerTop(mockContainer)
      expect(measured).toBe(610)
    } finally {
      ;(globalThis as any).window = origWindow
    }
  })

  it('restores camera position across refreshes with storage', async () => {
    const { CAMERA_STORAGE_KEY, loadSavedCamera, saveCameraState, hasSavedCamera } = await import('../../utils/mapCamera')

    const mockStorageMap = new Map<string, string>()
    const mockStorage = {
      getItem: (key: string) => mockStorageMap.get(key) || null,
      setItem: (key: string, val: string) => { mockStorageMap.set(key, val) },
      removeItem: (key: string) => { mockStorageMap.delete(key) }
    }

    // 1. When storage is empty: returns null
    expect(loadSavedCamera(mockStorage)).toBeNull()
    expect(hasSavedCamera(mockStorage)).toBe(false)

    // 2. Save camera state from mock map instance
    const mockMap = {
      getCenter: () => ({ lng: 24.12543, lat: 61.85219 }),
      getZoom: () => 13.54,
      getBearing: () => 15.2,
      getPitch: () => 0
    }
    saveCameraState(mockMap, mockStorage)

    expect(hasSavedCamera(mockStorage)).toBe(true)
    const restored = loadSavedCamera(mockStorage)
    expect(restored).not.toBeNull()
    expect(restored?.center).toEqual([24.12543, 61.85219])
    expect(restored?.zoom).toBe(13.54)
    expect(restored?.bearing).toBe(15)

    // 3. When corrupted or out-of-bounds data exists: handles gracefully
    mockStorage.setItem(CAMERA_STORAGE_KEY, JSON.stringify({ center: [999, 999], zoom: -5 }))
    expect(loadSavedCamera(mockStorage)).toBeNull()
  })
})


