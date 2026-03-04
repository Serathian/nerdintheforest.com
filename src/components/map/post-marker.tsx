'use client'

import { useEffect, useRef } from 'react'
import maplibregl from 'maplibre-gl'
import type { NitfPostGeo, PostType } from '@/types'

const TYPE_COLORS: Record<PostType, string> = {
  adventure: 'var(--color-lichen)',
  tips: 'var(--color-water)',
  recipe: 'var(--color-blaze)',
  review: 'var(--color-stone)',
  general: 'var(--color-bark)',
}

interface PostMarkerProps {
  post: NitfPostGeo
  map: maplibregl.Map
  isActive: boolean
  onClick: (id: number) => void
}

export default function PostMarker({ post, map, isActive, onClick }: PostMarkerProps) {
  const markerRef = useRef<maplibregl.Marker | null>(null)
  const elRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!post.latitude || !post.longitude) return

    const el = document.createElement('div')
    el.style.width = isActive ? '16px' : '12px'
    el.style.height = isActive ? '16px' : '12px'
    el.style.borderRadius = '50%'
    el.style.backgroundColor = TYPE_COLORS[post.type] ?? 'var(--color-bark)'
    el.style.border = '2px solid var(--color-parchment)'
    el.style.cursor = 'pointer'
    el.style.position = 'relative'
    el.style.transition = 'width 0.2s, height 0.2s'
    if (isActive) el.classList.add('marker-active')

    el.addEventListener('click', (e) => {
      e.stopPropagation()
      onClick(post.id)
    })

    elRef.current = el
    const marker = new maplibregl.Marker({ element: el })
      .setLngLat([post.longitude, post.latitude])
      .addTo(map)

    markerRef.current = marker

    return () => {
      marker.remove()
    }
  }, [post, map, isActive, onClick])

  return null
}
