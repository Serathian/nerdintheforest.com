'use client'

import { useEffect, useRef, useState } from 'react'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { fetchGpxAsGeoJson } from '@/lib/gpx'

const MAPTILER_KEY = process.env.NEXT_PUBLIC_MAPTILER_KEY ?? ''

interface MiniMapProps {
  latitude: number
  longitude: number
  zoom?: number
  trailGpxUrl?: string
}

export default function MiniMap({ latitude, longitude, zoom = 12, trailGpxUrl }: MiniMapProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<maplibregl.Map | null>(null)
  const [interactive, setInteractive] = useState(false)

  useEffect(() => {
    if (!containerRef.current) return

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: `https://api.maptiler.com/maps/outdoor/style.json?key=${MAPTILER_KEY}`,
      center: [longitude, latitude],
      zoom,
      scrollZoom: false,
      dragPan: false,
    })

    new maplibregl.Marker()
      .setLngLat([longitude, latitude])
      .addTo(map)

    if (trailGpxUrl) {
      map.on('load', async () => {
        const geojson = await fetchGpxAsGeoJson(trailGpxUrl)
        if (!geojson) return
        map.addSource('trail', { type: 'geojson', data: geojson as GeoJSON.Feature })
        map.addLayer({
          id: 'trail-line',
          type: 'line',
          source: 'trail',
          paint: {
            'line-color': '#6b7c5e',
            'line-width': 3,
            'line-dasharray': [2, 2],
          },
        })
      })
    }

    mapRef.current = map

    return () => {
      map.remove()
      mapRef.current = null
    }
  }, [latitude, longitude, zoom, trailGpxUrl])

  const handleMakeInteractive = () => {
    const map = mapRef.current
    if (!map) return
    map.scrollZoom.enable()
    map.dragPan.enable()
    setInteractive(true)
  }

  return (
    <div
      className="border border-rule rounded-sm relative overflow-hidden my-6"
      style={{ height: 240 }}
    >
      <div ref={containerRef} style={{ position: 'absolute', inset: 0 }} />
      {!interactive && (
        <button
          onClick={handleMakeInteractive}
          className="absolute bottom-2 right-2 z-10 px-2 py-1 text-xs border border-rule rounded-sm cursor-pointer"
          style={{
            fontFamily: 'var(--font-mono)',
            backgroundColor: 'var(--color-parchment)',
            color: 'var(--color-bark)',
          }}
        >
          Make interactive
        </button>
      )}
    </div>
  )
}
