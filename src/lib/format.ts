// ─── Date formatting ──────────────────────────────────────────

const dateFormatter = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
})

/**
 * Format an ISO date string to e.g. "12 Jun 2025"
 */
export function formatDate(iso?: string): string {
  if (!iso) return ''
  return dateFormatter.format(new Date(iso))
}

/**
 * Format an ISO date string to a short form e.g. "Jun 2025"
 */
export function formatDateShort(iso?: string): string {
  if (!iso) return ''
  return new Intl.DateTimeFormat('en-GB', { month: 'short', year: 'numeric' }).format(
    new Date(iso),
  )
}

// ─── Distance ─────────────────────────────────────────────────

/**
 * Format a distance in km, e.g. "12.4 km"
 */
export function formatDistance(km?: number): string {
  if (km === undefined || km === null) return '—'
  return `${km.toFixed(1)} km`
}

/**
 * Format metres, e.g. "340 m"
 */
export function formatMetres(m?: number): string {
  if (m === undefined || m === null) return '—'
  return `${Math.round(m)} m`
}

/**
 * Format duration in hours to e.g. "4 h 30 min" or "45 min"
 */
export function formatDuration(hours?: number): string {
  if (hours === undefined || hours === null) return '—'
  const h = Math.floor(hours)
  const m = Math.round((hours - h) * 60)
  if (h === 0) return `${m} min`
  if (m === 0) return `${h} h`
  return `${h} h ${m} min`
}

/**
 * Format reading time, e.g. "8 min read"
 */
export function formatReadingTime(minutes?: number): string {
  if (!minutes) return ''
  return `${minutes} min`
}

// ─── Coordinates ──────────────────────────────────────────────

/**
 * Format lat/lon to a compact display, e.g. "60.1695° N, 24.9354° E"
 */
export function formatCoords(lat?: number, lon?: number): string {
  if (lat === undefined || lon === undefined) return ''
  const latStr = `${Math.abs(lat).toFixed(4)}° ${lat >= 0 ? 'N' : 'S'}`
  const lonStr = `${Math.abs(lon).toFixed(4)}° ${lon >= 0 ? 'E' : 'W'}`
  return `${latStr}, ${lonStr}`
}
