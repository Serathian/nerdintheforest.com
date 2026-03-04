'use client'

import { useEffect, useRef, useState } from 'react'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'

import type { NitfPostGeo, PostType } from '@/types'
import MapHeader from '@/components/layout/map-header'
import PostPanel from '@/components/map/post-panel'

// Color each post type with a design token hex
const TYPE_COLORS: Record<PostType, string> = {
  adventure: '#c4541a', // blaze
  tips:      '#6b7c5e', // lichen
  recipe:    '#4a7c8f', // water
  review:    '#94897c', // stone
  general:   '#3d2e1f', // bark
}

interface MapViewProps {
  posts: NitfPostGeo[]
}

export default function MapView({ posts }: MapViewProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<maplibregl.Map | null>(null)
  const [activePost, setActivePost] = useState<NitfPostGeo | null>(null)

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: 'https://tiles.openfreemap.org/styles/liberty',
      center: [26, 64], // Finland centroid
      zoom: 5,
    })

    mapRef.current = map

    map.addControl(new maplibregl.NavigationControl(), 'bottom-right')

    map.on('load', () => {
      const geoPosts = posts.filter((p) => p.latitude != null && p.longitude != null)

      // Build a GeoJSON FeatureCollection from geo-tagged posts
      const geojson = {
        type: 'FeatureCollection' as const,
        features: geoPosts.map((p) => ({
          type: 'Feature' as const,
          geometry: {
            type: 'Point' as const,
            coordinates: [p.longitude!, p.latitude!],
          },
          properties: {
            id: p.id,
            type: p.type,
            color: TYPE_COLORS[p.type],
          },
        })),
      }

      map.addSource('posts', { type: 'geojson', data: geojson })

      // Outer glow ring
      map.addLayer({
        id: 'posts-halo',
        type: 'circle',
        source: 'posts',
        paint: {
          'circle-radius': 14,
          'circle-color': ['get', 'color'],
          'circle-opacity': 0.15,
        },
      })

      // Main dot
      map.addLayer({
        id: 'posts-dot',
        type: 'circle',
        source: 'posts',
        paint: {
          'circle-radius': 7,
          'circle-color': ['get', 'color'],
          'circle-stroke-width': 2,
          'circle-stroke-color': '#fff',
        },
      })

      map.on('click', 'posts-dot', (e) => {
        if (!e.features?.[0]) return
        const id = e.features[0].properties?.id as number
        const post = posts.find((p) => p.id === id)
        if (post) setActivePost(post)
      })

      map.on('mouseenter', 'posts-dot', () => {
        map.getCanvas().style.cursor = 'pointer'
      })
      map.on('mouseleave', 'posts-dot', () => {
        map.getCanvas().style.cursor = ''
      })
    })

    return () => {
      map.remove()
      mapRef.current = null
    }
  }, [posts])

  return (
    <div className="relative w-full h-full">
      <MapHeader />
      <div ref={containerRef} className="absolute inset-0" />
      {activePost && (
        <PostPanel post={activePost} onClose={() => setActivePost(null)} />
      )}
    </div>
  )
}
