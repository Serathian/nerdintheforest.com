'use client'

import { useState, useMemo, useRef, useCallback } from 'react'
import type { NitfPostGeo, NitfLocation, PostType } from '@/types'
import { useMediaQuery } from '@/lib/use-media-query'
import MapContainer, { type MapHandle } from './map/map-container'
import MapControls from './map/map-controls'
import MapHeader from './layout/map-header'
import Sidebar from './feed/sidebar'
import BottomSheet from './feed/bottom-sheet'
import FilterBar from './feed/filter-bar'
import PostFeed from './feed/post-feed'

interface MapViewProps {
  posts: NitfPostGeo[]
  locations: NitfLocation[]
}

export default function MapView({ posts, locations }: MapViewProps) {
  const [activePostId, setActivePostId] = useState<number | null>(null)
  const [activeType, setActiveType] = useState<PostType | 'all'>('all')
  const [snapState, setSnapState] = useState<'peek' | 'half' | 'full'>('half')
  const mapRef = useRef<MapHandle>(null)
  const isDesktop = useMediaQuery('(min-width: 1024px)')

  const filteredPosts = useMemo(
    () => (activeType === 'all' ? posts : posts.filter((p) => p.type === activeType)),
    [posts, activeType],
  )

  const handlePostSelect = useCallback(
    (id: number) => {
      setActivePostId(id)
      if (snapState === 'peek') setSnapState('half')
    },
    [snapState],
  )

  const handleCardClick = useCallback(
    (post: NitfPostGeo) => {
      setActivePostId(post.id)
      if (post.longitude && post.latitude) {
        mapRef.current?.flyTo(post.longitude, post.latitude, 12)
      }
      setSnapState('peek')
    },
    [],
  )

  const handleLocate = useCallback((lat: number, lon: number) => {
    mapRef.current?.flyTo(lon, lat, 11)
  }, [])

  const feedContent = (
    <>
      <FilterBar
        activeType={activeType}
        onTypeChange={setActiveType}
        resultCount={filteredPosts.length}
      />
      <PostFeed
        posts={filteredPosts}
        activePostId={activePostId}
        onPostClick={handleCardClick}
      />
    </>
  )

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <MapHeader />

      {/* Map area */}
      <div
        style={
          isDesktop
            ? { position: 'absolute', top: 0, left: 420, right: 0, bottom: 0 }
            : { position: 'absolute', inset: 0 }
        }
      >
        <MapContainer
          ref={mapRef}
          posts={filteredPosts}
          locations={locations}
          activePostId={activePostId}
          onPostSelect={handlePostSelect}
        />
        <MapControls
          onZoomIn={() => mapRef.current?.getMap()?.zoomIn()}
          onZoomOut={() => mapRef.current?.getMap()?.zoomOut()}
          onLocate={handleLocate}
        />
      </div>

      {isDesktop ? (
        <Sidebar>{feedContent}</Sidebar>
      ) : (
        <BottomSheet snapState={snapState} onSnapChange={setSnapState}>
          {feedContent}
        </BottomSheet>
      )}
    </div>
  )
}
