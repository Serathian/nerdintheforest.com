/**
 * Stylized, per-category waypoint markers for the MapLibre canvas.
 *
 * Markers are rasterised synchronously onto a <canvas> from SVG path data (24×24 icon box)
 * and registered with `map.addImage` on demand via the `styleimagemissing` event, so they
 * remain native symbol-layer features (fast, clickable, collision-aware) rather than DOM markers.
 */

export interface MarkerStyle {
  /** Pin body fill */
  fill: string
  /** Icon glyph colour */
  glyph: string
  /** SVG path data in a 24×24 box */
  icon: string
  /**
   * 'pin' (default): teardrop, tip at bottom-centre → use `icon-anchor: 'bottom'`.
   * 'sign': rounded-square road sign, centred → use `icon-anchor: 'center'`.
   */
  shape?: 'pin' | 'sign'
}

const PARCHMENT = '#fef9ed'
const BEACON = '#d9531e'

export const MARKER_IMAGE_PREFIX = 'nitf-marker-'

export const MARKER_STYLES: Record<string, MarkerStyle> = {
  // Gapahuk / lean-to cabin — deep pine
  shelter: {
    fill: '#1b2e24',
    glyph: PARCHMENT,
    icon: 'M12 3 2 11.5h2.5V21h5v-6h5v6h5v-9.5H22L12 3z'
  },
  // Fire pit — ember rust
  hearth: {
    fill: '#a3401f',
    glyph: '#ffe7c2',
    icon:
      'M19.48 12.35c-1.57-4.08-7.16-4.3-5.81-10.23.1-.44-.37-.78-.75-.55C9.29 3.71 6.68 8 8.87 13.62c.18.46-.36.89-.75.59-1.81-1.37-2-3.34-1.84-4.75.06-.52-.62-.77-.91-.34C4.69 10.16 4 11.84 4 14.37c.38 5.6 5.11 7.32 6.81 7.54 2.43.31 5.06-.14 6.95-1.87 2.08-1.93 2.84-5.01 1.72-7.69zm-9.28 5.03c1.44-.35 2.18-1.39 2.38-2.31.33-1.43-.96-2.83-.09-5.09.33 1.87 3.27 3.04 3.27 5.08.08 2.53-2.66 4.7-5.56 2.32z'
  },
  // Fresh water spring — glacial fjord blue
  springhead: {
    fill: '#2d6a86',
    glyph: PARCHMENT,
    icon: 'M12 2c-5.33 4.55-8 8.48-8 11.8 0 4.98 3.8 8.2 8 8.2s8-3.22 8-8.2c0-3.32-2.67-7.25-8-11.8z'
  },
  // Peak — granite slate
  summit: {
    fill: '#4a4f57',
    glyph: PARCHMENT,
    icon: 'M14 6l-3.75 5 2.85 3.8-1.6 1.2C9.81 13.75 7 10 7 10l-6 8h22L14 6z'
  },
  // Lookout — lichen ochre
  viewpoint: {
    fill: '#8a6a1c',
    glyph: PARCHMENT,
    icon:
      'M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z'
  },
  // Trailhead parking area — road-sign blue square "P"
  trailhead: {
    fill: '#1f4f8f',
    glyph: '#ffffff',
    icon: 'M13 3H6v18h4v-6h3c3.31 0 6-2.69 6-6s-2.69-6-6-6zm.2 8H10V7h3.2c1.1 0 2 .9 2 2s-.9 2-2 2z',
    shape: 'sign'
  }
}

const FALLBACK_STYLE: MarkerStyle = {
  fill: '#526056',
  glyph: PARCHMENT,
  // Simple survey dot
  icon: 'M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10z'
}

export function getMarkerStyle(type?: string): MarkerStyle {
  return MARKER_STYLES[(type || '').toLowerCase()] ?? FALLBACK_STYLE
}

export function markerImageId(type: string, selected: boolean): string {
  return `${MARKER_IMAGE_PREFIX}${type}${selected ? '-selected' : ''}`
}

/** Parses an image id produced by `markerImageId`; returns null for foreign ids. */
export function parseMarkerImageId(id: string): { type: string; selected: boolean } | null {
  if (!id.startsWith(MARKER_IMAGE_PREFIX)) return null
  const rest = id.slice(MARKER_IMAGE_PREFIX.length)
  const selected = rest.endsWith('-selected')
  const type = selected ? rest.slice(0, -'-selected'.length) : rest
  return { type, selected }
}

/**
 * Draws a category marker. For 'pin' shapes the image's bottom-centre is the pin tip
 * (use `icon-anchor: 'bottom'`); 'sign' shapes are centred (use `icon-anchor: 'center'`).
 */
export function createMarkerImage(
  type: string,
  selected: boolean,
  pixelRatio = 2
): { width: number; height: number; data: Uint8ClampedArray } | null {
  if (typeof document === 'undefined') return null

  const style = getMarkerStyle(type)
  const isSign = style.shape === 'sign'
  const r = selected ? 17 : isSign ? 12 : 14 // head radius / sign half-size (logical px)
  const pad = 5 // room for stroke + drop shadow
  const cx = r + pad
  const cy = r + pad
  const tipY = cy + r * Math.SQRT2 // tangent point at 45° meets here
  const width = Math.ceil((r + pad) * 2)
  const height = isSign ? width : Math.ceil(tipY + pad)

  const canvas = document.createElement('canvas')
  canvas.width = width * pixelRatio
  canvas.height = height * pixelRatio
  const ctx = canvas.getContext('2d')
  if (!ctx) return null
  ctx.scale(pixelRatio, pixelRatio)

  const pin = new Path2D()
  if (isSign) {
    // Rounded-square road sign centred on the point
    pin.roundRect(cx - r, cy - r, r * 2, r * 2, r * 0.3)
  } else {
    // Pin silhouette: arc over the top from 135° → 45° (clockwise), then down to the tip
    pin.arc(cx, cy, r, Math.PI * 0.75, Math.PI * 0.25, false)
    pin.lineTo(cx, tipY)
    pin.closePath()
  }

  // Body with soft drop shadow
  ctx.save()
  ctx.shadowColor = 'rgba(6, 25, 16, 0.4)'
  ctx.shadowBlur = 4
  ctx.shadowOffsetY = 1.5
  ctx.fillStyle = style.fill
  ctx.fill(pin)
  ctx.restore()

  // Outline — beacon orange when selected, parchment otherwise
  ctx.lineJoin = 'round'
  ctx.lineWidth = selected ? 3 : 2
  ctx.strokeStyle = selected ? BEACON : PARCHMENT
  ctx.stroke(pin)

  // Category glyph centred in the pin head
  const iconSize = r * 1.15
  ctx.save()
  ctx.translate(cx - iconSize / 2, cy - iconSize / 2)
  ctx.scale(iconSize / 24, iconSize / 24)
  ctx.fillStyle = style.glyph
  ctx.fill(new Path2D(style.icon))
  ctx.restore()

  const img = ctx.getImageData(0, 0, canvas.width, canvas.height)
  return { width: img.width, height: img.height, data: img.data }
}
