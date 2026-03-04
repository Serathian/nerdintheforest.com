'use client'

import {
  useEffect,
  useRef,
  useState,
  useCallback,
  useImperativeHandle,
  forwardRef,
} from 'react'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import type { NitfPostGeo, NitfLocation } from '@/types'
import PostMarker from './post-marker'
import LocationMarker from './location-marker'
import MapPopup from './map-popup'

export interface MapHandle {
  flyTo(lon: number, lat: number, zoom: number): void
  getMap(): maplibregl.Map | null
}

interface MapContainerProps {
  posts: NitfPostGeo[]
  locations: NitfLocation[]
  activePostId: number | null
  onPostSelect: (id: number) => void
}

const MAPTILER_KEY = process.env.NEXT_PUBLIC_MAPTILER_KEY ?? ''

const MapContainer = forwardRef<MapHandle, MapContainerProps>(function MapContainer(
  { posts, locations, activePostId, onPostSelect },
  ref,
) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<maplibregl.Map | null>(null)
  const [mapReady, setMapReady] = useState(false)
  const [zoom, setZoom] = useState(5)
  const [popupPost, setPopupPost] = useState<NitfPostGeo | null>(null)

  useImperativeHandle(ref, () => ({
    flyTo(lon: number, lat: number, z: number) {
      mapRef.current?.flyTo({ center: [lon, lat], zoom: z, duration: 1200 })
    },
    getMap() {
      return mapRef.current
    },
  }))

  useEffect(() => {
    if (!containerRef.current) return

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: `https://api.maptiler.com/maps/outdoor/style.json?key=${MAPTILER_KEY}`,
      center: [26.0, 64.5],
      zoom: 5,
    })

    map.on('load', () => {
      mapRef.current = map
      setMapReady(true)
    })

    map.on('zoomend', () => {
      setZoom(map.getZoom())
    })

    return () => {
      map.remove()
      mapRef.current = null
      setMapReady(false)
    }
  }, [])

  const handlePostClick = useCallback(
    (id: number) => {
      onPostSelect(id)
      const post = posts.find((p) => p.id === id)
      if (post) setPopupPost(post)
    },
    [onPostSelect, posts],
  )

  const handlePopupClose = useCallback(() => {
    setPopupPost(null)
  }, [])

  return (
    <div ref={containerRef} style={{ position: 'absolute', inset: 0 }}>
      {mapReady && mapRef.current && (
        <>
          {posts.map((post) => (
            <PostMarker
              key={post.id}
              post={post}
              map={mapRef.current!}
              isActive={post.id === activePostId}
              onClick={handlePostClick}
            />
          ))}
          {locations.map((loc) => (
            <LocationMarker
              key={loc.id}
              location={loc}
              map={mapRef.current!}
              visible={zoom >= 8}
            />
          ))}
          {popupPost && (
            <MapPopup
              post={popupPost}
              map={mapRef.current!}
              onClose={handlePopupClose}
            />
          )}
        </>
      )}
    </div>
  )
})

export default MapContainer
