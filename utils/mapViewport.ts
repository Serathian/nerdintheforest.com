export interface MapFocusPadding {
  top: number
  bottom: number
  left: number
  right: number
}

export interface ViewportPaddingOptions {
  windowHeight: number
  viewportBottom: number
  drawerTop: number
  topClearance?: number
  leftPadding?: number
  rightPadding?: number
}

/**
 * Calculates the MapLibre focus padding required to keep map elements
 * (whether a single point or multiple points such as location + trailhead bounds)
 * centered in the visible viewport above the mobile drawer.
 *
 * When pad.bottom is set to `drawerCoveredHeight + topClearance`, the midpoint
 * of the visible vertical space is placed exactly at `drawerTop / 2`, regardless
 * of the drawer's render height.
 */
export function calculateMapFocusPadding(options: ViewportPaddingOptions): MapFocusPadding {
  const topClearance = options.topClearance ?? 76
  const left = options.leftPadding ?? 48
  const right = options.rightPadding ?? 72

  // Pixels of the map canvas covered by the drawer
  const drawerCoveredHeight = Math.max(0, options.viewportBottom - options.drawerTop)

  return {
    top: topClearance,
    bottom: drawerCoveredHeight + topClearance,
    left,
    right
  }
}

/**
 * Measures the topmost visible pixel boundary (from top of viewport) of the bottom drawer.
 */
export function measureDrawerTop(rootEl?: HTMLElement | null): number {
  if (typeof window === 'undefined') return 0
  const doc = typeof document !== 'undefined' ? document : null

  const mainCard = (rootEl?.querySelector('.mobile-drawer-main-card') ||
    rootEl?.querySelector('.main-section-card') ||
    rootEl?.querySelector('.inspection-dock-card') ||
    rootEl?.querySelector('.dispatch-inspection-peek') ||
    doc?.querySelector('.mobile-drawer-main-card') ||
    doc?.querySelector('.main-section-card') ||
    doc?.querySelector('.inspection-dock-card') ||
    doc?.querySelector('.dispatch-inspection-peek')) as HTMLElement | null

  const openSheet = (rootEl?.querySelector('.collapsible-drawer-sheet.is-open') ||
    doc?.querySelector('.collapsible-drawer-sheet.is-open')) as HTMLElement | null

  let highestTop = window.innerHeight

  if (mainCard) {
    const rect = mainCard.getBoundingClientRect()
    if (rect.height > 0) {
      highestTop = Math.min(highestTop, rect.top)
    }
  }

  if (openSheet) {
    const rect = openSheet.getBoundingClientRect()
    if (rect.height > 0) {
      highestTop = Math.min(highestTop, rect.top)
    }
  }

  if (highestTop >= window.innerHeight) {
    const dock = (rootEl?.querySelector('.mobile-map-bottom-container') ||
      rootEl?.querySelector('.drawer-dock-container') ||
      rootEl?.querySelector('.inspection-dock-container') ||
      doc?.querySelector('.drawer-dock-container') ||
      doc?.querySelector('.inspection-dock-container')) as HTMLElement | null
    if (dock) {
      const rect = dock.getBoundingClientRect()
      if (rect.height > 0) {
        highestTop = Math.min(highestTop, rect.top)
      }
    }
  }

  return highestTop
}
