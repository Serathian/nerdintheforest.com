import { describe, it, expect } from 'vitest'
import { extractElevationTelemetry, formatDistance, haversineKm, polylineDistanceKm, splitRouteIntoLegs, splitRouteWithRemainder } from '../../utils/geo'
import { mockFieldNotes as fallbackFieldNotes } from '../../data/mockNordicTrail'

describe('geo utils', () => {
  it('computes great-circle distance in km', () => {
    // 0.01° of latitude ≈ 1.112 km anywhere on the globe
    expect(haversineKm([10.7, 60.27], [10.7, 60.28])).toBeCloseTo(1.112, 2)
    expect(haversineKm([10.7, 60.27], [10.7, 60.27])).toBe(0)
  })

  it('formats sub-kilometre distances in metres and longer ones in km', () => {
    expect(formatDistance(0.846)).toBe('850 M')
    expect(formatDistance(1.44)).toBe('1.4 KM')
    expect(formatDistance(12.06)).toBe('12.1 KM')
  })
})

describe('trailhead fallback data', () => {
  it('has some locations with a trailhead and some without', () => {
    const withTrailhead = fallbackFieldNotes.filter(n => n.trailhead)
    expect(withTrailhead.length).toBeGreaterThan(0)
    expect(withTrailhead.length).toBeLessThan(fallbackFieldNotes.length)
  })

  it('places every trailhead within a plausible walk-in distance of its location', () => {
    for (const note of fallbackFieldNotes) {
      if (!note.trailhead) continue
      const km = haversineKm(
        [note.longitude, note.latitude],
        [note.trailhead.longitude, note.trailhead.latitude]
      )
      expect(km).toBeGreaterThan(0.1)
      expect(km).toBeLessThan(10)
    }
  })

  it('provides real hiking trail geometry connecting trailhead to destination', () => {
    const notesWithTrailGeom = fallbackFieldNotes.filter(n => n.trailhead?.trailGeometry)
    expect(notesWithTrailGeom.length).toBeGreaterThanOrEqual(4)

    for (const note of notesWithTrailGeom) {
      const geom = note.trailhead!.trailGeometry!
      expect(geom.length).toBeGreaterThan(15) // Winding hiking trail with multiple waypoints
      
      // Calculate total winding trail distance
      let trailDist = 0
      for (let i = 1; i < geom.length; i++) {
        trailDist += haversineKm(geom[i - 1], geom[i])
      }
      
      const straightDist = haversineKm(
        [note.longitude, note.latitude],
        [note.trailhead!.longitude, note.trailhead!.latitude]
      )
      // Winding hiking trail distance should be equal to or greater than straight line
      expect(trailDist).toBeGreaterThanOrEqual(straightDist * 0.95)
    }
  })
})

describe('splitRouteIntoLegs & polylineDistanceKm', () => {
  it('returns empty array when fewer than 2 locations are provided', () => {
    const gpx: Array<[number, number]> = [
      [23.89, 61.39],
      [23.90, 61.40],
      [23.91, 61.41]
    ]
    expect(splitRouteIntoLegs(gpx, [])).toEqual([])
    expect(splitRouteIntoLegs(gpx, [{ lng: 23.89, lat: 61.39 }])).toEqual([])
  })

  it('falls back to straight-line leg segments when no GPX geometry is provided', () => {
    const waypoints = [
      { lng: 23.892, lat: 61.398 },
      { lng: 23.9085, lat: 61.4045 },
      { lng: 23.9246, lat: 61.3665 }
    ]
    const legs = splitRouteIntoLegs(undefined, waypoints)
    expect(legs).toHaveLength(2)
    expect(legs[0]).toEqual([
      [23.892, 61.398],
      [23.9085, 61.4045]
    ])
    expect(legs[1]).toEqual([
      [23.9085, 61.4045],
      [23.9246, 61.3665]
    ])
  })

  it('splits a GPX route into contiguous legs at the listed dispatch locations', () => {
    // 7-point GPX track passing through 3 locations (start at idx 0, midpoint stop at idx 3, end at idx 6)
    const gpxTrack: Array<[number, number]> = [
      [23.8920, 61.3980], // 0: Location 1 (Savontie Trailhead)
      [23.8975, 61.4002], // 1
      [23.9030, 61.4025], // 2
      [23.9085, 61.4045], // 3: Location 2 (Vähä-Riutta Laavu)
      [23.9140, 61.3920], // 4
      [23.9195, 61.3790], // 5
      [23.9246, 61.3665]  // 6: Location 3 (Vähä-Kauas Laavu)
    ]
    const waypoints = [
      { lng: 23.8920, lat: 61.3980 },
      { lng: 23.9085, lat: 61.4045 },
      { lng: 23.9246, lat: 61.3665 }
    ]

    const legs = splitRouteIntoLegs(gpxTrack, waypoints)
    expect(legs).toHaveLength(2)

    // Leg A (0 -> 3): 4 points
    expect(legs[0]).toEqual(gpxTrack.slice(0, 4))
    // Leg B (3 -> 6): 4 points
    expect(legs[1]).toEqual(gpxTrack.slice(3, 7))

    // Adjacent legs share the boundary vertex seamlessly
    expect(legs[0][legs[0].length - 1]).toEqual(legs[1][0])

    // Sum of leg distances equals total GPX track distance
    const totalDist = polylineDistanceKm(gpxTrack)
    const sumLegsDist = polylineDistanceKm(legs[0]) + polylineDistanceKm(legs[1])
    expect(sumLegsDist).toBeCloseTo(totalDist, 6)
  })

  it('automatically reverses GPX geometry if recorded in reverse direction of dispatch locations', () => {
    const forwardTrack: Array<[number, number]> = [
      [10.700, 60.250],
      [10.710, 60.260],
      [10.720, 60.270],
      [10.730, 60.280],
      [10.740, 60.290]
    ]
    const reversedTrack = [...forwardTrack].reverse()
    const waypoints = [
      { lng: 10.700, lat: 60.250 },
      { lng: 10.720, lat: 60.270 },
      { lng: 10.740, lat: 60.290 }
    ]

    const legs = splitRouteIntoLegs(reversedTrack, waypoints)
    expect(legs).toHaveLength(2)
    expect(legs[0][0]).toEqual([10.700, 60.250])
    expect(legs[0][legs[0].length - 1]).toEqual([10.720, 60.270])
    expect(legs[1][0]).toEqual([10.720, 60.270])
    expect(legs[1][legs[1].length - 1]).toEqual([10.740, 60.290])
  })

  it('splits a 5-location traverse GPX into 4 sequential legs (A, B, C, D)', () => {
    const waypoints = [
      { lng: 23.8320, lat: 62.0380 }, // 1
      { lng: 23.8447, lat: 62.0306 }, // 2
      { lng: 23.8120, lat: 61.9960 }, // 3
      { lng: 23.9782, lat: 61.6215 }, // 4
      { lng: 23.7745, lat: 61.4079 }  // 5
    ]

    // Build a dense 21-point GPX track passing through all 5 waypoints (5 points per leg)
    const gpx: Array<[number, number]> = []
    for (let i = 0; i < waypoints.length - 1; i++) {
      const a = waypoints[i]
      const b = waypoints[i + 1]
      const steps = 5
      for (let s = 0; s < steps; s++) {
        if (i > 0 && s === 0) continue
        const t = s / (steps - 1)
        gpx.push([
          a.lng + (b.lng - a.lng) * t,
          a.lat + (b.lat - a.lat) * t
        ])
      }
    }

    const legs = splitRouteIntoLegs(gpx, waypoints)
    expect(legs).toHaveLength(4)
    for (let i = 0; i < 4; i++) {
      expect(legs[i].length).toBeGreaterThanOrEqual(2)
      expect(legs[i][0][0]).toBeCloseTo(waypoints[i].lng, 4)
      expect(legs[i][0][1]).toBeCloseTo(waypoints[i].lat, 4)
      expect(legs[i][legs[i].length - 1][0]).toBeCloseTo(waypoints[i + 1].lng, 4)
      expect(legs[i][legs[i].length - 1][1]).toBeCloseTo(waypoints[i + 1].lat, 4)
    }
  })

  it('slices a GPX track strictly between listed locations even when the GPX continues past the last location (including 2-location dispatches)', () => {
    // Simulates Birgitan Polku where the GPX starts near Vähä-Riutan laavu, passes Vähä-Kauas laavu at index 3,
    // and then continues much further west to index 7.
    const gpxTrack: Array<[number, number]> = [
      [23.9078, 61.4045], // 0: start near Location 1 (Vähä-Riutan laavu)
      [23.9140, 61.3920], // 1
      [23.9195, 61.3790], // 2
      [23.9246, 61.3665], // 3: Location 2 (Vähä-Kauas laavu)
      [23.8800, 61.3650], // 4: GPX continues beyond Location 2
      [23.8200, 61.3640], // 5
      [23.7600, 61.3635], // 6
      [23.7171, 61.3629]  // 7: end of GPX track far west
    ]
    const waypoints = [
      { lng: 23.9085, lat: 61.4045 }, // Vähä-Riutan laavu
      { lng: 23.9246, lat: 61.3665 }  // Vähä-Kauas laavu
    ]

    const { legs, prefix, suffix } = splitRouteWithRemainder(gpxTrack, waypoints)
    expect(legs).toHaveLength(1)
    // Leg A must only span indices 0..3 (between Location 1 and Location 2), NOT the entire 0..7 track
    expect(legs[0]).toEqual(gpxTrack.slice(0, 4))
    expect(prefix).toBeNull()
    // The remainder after Location 2 is preserved in suffix (indices 3..7)
    expect(suffix).toEqual(gpxTrack.slice(3, 8))
  })

  it('extracts both inspectable prefix (before first location) and suffix (after last location) when GPX extends on both ends', () => {
    const gpxTrack: Array<[number, number]> = [
      [23.8800, 61.4250], // 0: GPX starts 2.5km north-west before Location 1
      [23.8940, 61.4140], // 1
      [23.9085, 61.4045], // 2: Location 1 (Vähä-Riutan laavu)
      [23.9165, 61.3850], // 3
      [23.9246, 61.3665], // 4: Location 2 (Vähä-Kauas laavu)
      [23.8400, 61.3645], // 5
      [23.7500, 61.3630]  // 6: GPX ends far west after Location 2
    ]
    const waypoints = [
      { lng: 23.9085, lat: 61.4045 },
      { lng: 23.9246, lat: 61.3665 }
    ]

    const { legs, prefix, suffix } = splitRouteWithRemainder(gpxTrack, waypoints)
    expect(prefix).toEqual(gpxTrack.slice(0, 3))
    expect(legs).toHaveLength(1)
    expect(legs[0]).toEqual(gpxTrack.slice(2, 5))
    expect(suffix).toEqual(gpxTrack.slice(4, 7))
  })

  it('extracts high-resolution elevation telemetry from 3D [lng, lat, ele] GPX coordinates and synthesizes realistic profiles when 2D', () => {
    const gpx3d: any = [
      [23.9085, 61.4045, 134.6],
      [23.9140, 61.3920, 148.2],
      [23.9195, 61.3790, 129.0],
      [23.9246, 61.3665, 141.5]
    ]
    const measured = extractElevationTelemetry({ geometry: gpx3d, sampleCount: 32 })
    expect(measured.hasMeasuredElevation).toBe(true)
    expect(measured.samples).toHaveLength(32)
    expect(measured.startElevation).toBe(135)
    expect(measured.destinationElevation).toBe(142)
    expect(measured.elevationGain).toBeGreaterThan(20)
    expect(measured.elevationLoss).toBeGreaterThan(15)

    const synth = extractElevationTelemetry({
      startElevation: 180,
      destinationElevation: 240,
      elevationGain: 160,
      elevationLoss: 100,
      anchors: [{ fraction: 0.5, elevation: 215 }],
      sampleCount: 32
    })
    expect(synth.hasMeasuredElevation).toBe(false)
    expect(synth.samples).toHaveLength(32)
    expect(synth.samples[0]).toBe(180)
    expect(synth.samples[synth.samples.length - 1]).toBe(240)
    expect(synth.maxElevation).toBeGreaterThan(240)
  })
})
