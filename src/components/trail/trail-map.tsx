'use client'

import { useEffect, useRef } from 'react'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'

import type { NitfTrail, NitfWaypoint } from '@/types'
import { fetchGpxAsGeoJson } from '@/lib/gpx'

interface TrailMapProps {
  trail: NitfTrail
  waypoints: NitfWaypoint[]
}

export default function TrailMap({ trail, waypoints }: TrailMapProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<maplibregl.Map | null>(null)

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: 'https://tiles.openfreemap.org/styles/liberty',
      center: [trail.longitude_start ?? 26, trail.latitude_start ?? 64],
      zoom: trail.latitude_start ? 12 : 5,
    })

    mapRef.current = map
    map.addControl(new maplibregl.NavigationControl(), 'bottom-right')

    map.on('load', async () => {
      if (trail.gpx_file?.url) {
        const geojson = await fetchGpxAsGeoJson(trail.gpx_file.url)
        if (geojson) {
          // Cast coordinates: gpx.ts uses `number?` for optional elevation,
          // but GeoJSON Position requires `number`. Values are always numeric at runtime.
          const data = {
            type: 'Feature' as const,
            geometry: {
              type: 'LineString' as const,
              coordinates: geojson.geometry.coordinates as number[][],
            },
            properties: {},
          }
          map.addSource('route', { type: 'geojson', data })

          map.addLayer({
            id: 'route-casing',
            type: 'line',
            source: 'route',
            layout: { 'line-join': 'round', 'line-cap': 'round' },
            paint: { 'line-color': '#fff', 'line-width': 5 },
          })
          map.addLayer({
            id: 'route-line',
            type: 'line',
            source: 'route',
            layout: { 'line-join': 'round', 'line-cap': 'round' },
            paint: { 'line-color': '#c4541a', 'line-width': 3 },
          })

          const coords = data.geometry.coordinates as [number, number][]
          if (coords.length > 1) {
            const bounds = coords.reduce(
              (b, c) => b.extend(c),
              new maplibregl.LngLatBounds(coords[0], coords[0]),
            )
            map.fitBounds(bounds, { padding: 40, maxZoom: 14 })
          }
        }
      }

      for (const wp of waypoints) {
        new maplibregl.Marker({ color: '#6b7c5e' })
          .setLngLat([wp.longitude, wp.latitude])
          .setPopup(
            new maplibregl.Popup({ offset: 20 }).setHTML(
              `<strong>${wp.name}</strong>${wp.description ? `<br/>${wp.description}` : ''}`,
            ),
          )
          .addTo(map)
      }
    })

    return () => {
      map.remove()
      mapRef.current = null
    }
  }, [trail, waypoints])

  return <div ref={containerRef} className="w-full h-full" />
}
