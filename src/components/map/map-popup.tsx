'use client'

import { useEffect, useRef } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import maplibregl from 'maplibre-gl'
import Image from 'next/image'
import type { NitfPostGeo, PostType } from '@/types'
import { formatDate } from '@/lib/format'

const TYPE_COLORS: Record<PostType, string> = {
  adventure: 'var(--color-lichen)',
  tips: 'var(--color-water)',
  recipe: 'var(--color-blaze)',
  review: 'var(--color-stone)',
  general: 'var(--color-bark)',
}

function PopupContent({ post }: { post: NitfPostGeo }) {
  return (
    <div style={{ width: 240, fontFamily: 'var(--font-body)' }}>
      {post.cover_image ? (
        <Image
          src={post.cover_image.url}
          alt={post.cover_image.alt || post.title}
          width={240}
          height={120}
          className="object-cover rounded-t-sm"
          style={{ width: 240, height: 120 }}
        />
      ) : (
        <div
          style={{ width: 240, height: 120, backgroundColor: 'var(--color-contour)' }}
          className="rounded-t-sm"
        />
      )}
      <div style={{ padding: '8px 10px 10px' }}>
        <h3
          style={{ fontFamily: 'var(--font-display)', color: 'var(--color-bark)' }}
          className="text-sm line-clamp-2 mb-1"
        >
          {post.title}
        </h3>
        <div
          style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-stone)' }}
          className="text-[10px] flex gap-2 mb-2"
        >
          <span style={{ color: TYPE_COLORS[post.type] }}>{post.type}</span>
          {post.published_at && <span>{formatDate(post.published_at)}</span>}
        </div>
        <a
          href={`/posts/${post.slug}`}
          style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-blaze)' }}
          className="text-xs"
        >
          Read post &rarr;
        </a>
      </div>
    </div>
  )
}

interface MapPopupProps {
  post: NitfPostGeo
  map: maplibregl.Map
  onClose: () => void
}

export default function MapPopup({ post, map, onClose }: MapPopupProps) {
  const popupRef = useRef<maplibregl.Popup | null>(null)
  const rootRef = useRef<Root | null>(null)

  useEffect(() => {
    if (!post.longitude || !post.latitude) return

    const container = document.createElement('div')
    const root = createRoot(container)
    rootRef.current = root
    root.render(<PopupContent post={post} />)

    const popup = new maplibregl.Popup({
      closeOnClick: true,
      maxWidth: '240px',
      className: 'nitf-popup',
    })
      .setLngLat([post.longitude, post.latitude])
      .setDOMContent(container)
      .addTo(map)

    popup.on('close', onClose)
    popupRef.current = popup

    return () => {
      rootRef.current?.unmount()
      popup.remove()
    }
  }, [post, map, onClose])

  return null
}
