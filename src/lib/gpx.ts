/**
 * Minimal GPX → GeoJSON LineString converter.
 * Parses a GPX file (XML) and returns a GeoJSON feature for use
 * with MapLibre GL JS as a line source.
 */

export interface GeoJsonLineString {
  type: 'Feature'
  geometry: {
    type: 'LineString'
    coordinates: [number, number, number?][]
  }
  properties: Record<string, never>
}

/**
 * Fetch a GPX file and convert it to a GeoJSON LineString feature.
 * Returns null if the fetch or parse fails.
 */
export async function fetchGpxAsGeoJson(
  gpxUrl: string,
): Promise<GeoJsonLineString | null> {
  try {
    const res = await fetch(gpxUrl)
    if (!res.ok) return null
    const text = await res.text()
    return parseGpxToGeoJson(text)
  } catch {
    return null
  }
}

/**
 * Parse a GPX XML string to a GeoJSON LineString feature.
 */
export function parseGpxToGeoJson(gpxText: string): GeoJsonLineString | null {
  try {
    const parser = new DOMParser()
    const doc = parser.parseFromString(gpxText, 'application/xml')

    // Prefer <trkseg> track points, fall back to <rte> route points
    const trkpts = Array.from(doc.querySelectorAll('trkpt'))
    const rtepts = Array.from(doc.querySelectorAll('rtept'))
    const points = trkpts.length > 0 ? trkpts : rtepts

    if (points.length === 0) return null

    const coordinates: [number, number, number?][] = points.map((pt) => {
      const lat = parseFloat(pt.getAttribute('lat') ?? '0')
      const lon = parseFloat(pt.getAttribute('lon') ?? '0')
      const eleEl = pt.querySelector('ele')
      const ele = eleEl ? parseFloat(eleEl.textContent ?? '0') : undefined
      return ele !== undefined ? [lon, lat, ele] : [lon, lat]
    })

    return {
      type: 'Feature',
      geometry: {
        type: 'LineString',
        coordinates,
      },
      properties: {},
    }
  } catch {
    return null
  }
}
