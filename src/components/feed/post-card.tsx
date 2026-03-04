'use client'

import Image from 'next/image'
import type { NitfPostGeo, PostType } from '@/types'
import { formatDate, formatReadingTime } from '@/lib/format'

const TYPE_COLORS: Record<PostType, string> = {
  adventure: 'var(--color-lichen)',
  tips: 'var(--color-water)',
  recipe: 'var(--color-blaze)',
  review: 'var(--color-stone)',
  general: 'var(--color-bark)',
}

interface PostCardProps {
  post: NitfPostGeo
  isActive: boolean
  onClick: (post: NitfPostGeo) => void
}

export default function PostCard({ post, isActive, onClick }: PostCardProps) {
  return (
    <div
      onClick={() => onClick(post)}
      className={`flex flex-row px-4 py-3 gap-3 border-b border-rule cursor-pointer transition-colors ${
        isActive ? 'border-l-[3px] border-l-lichen pl-3' : ''
      }`}
      style={isActive ? { backgroundColor: '#efe9dd' } : undefined}
    >
      {/* Cover image */}
      <div className="flex-shrink-0">
        {post.cover_image ? (
          <Image
            src={post.cover_image.url}
            alt={post.cover_image.alt || post.title}
            width={80}
            height={80}
            className="object-cover rounded-sm"
            style={{ width: 80, height: 80 }}
          />
        ) : (
          <div
            className="rounded-sm"
            style={{
              width: 80,
              height: 80,
              backgroundColor: 'var(--color-contour)',
            }}
          />
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col gap-0.5 min-w-0">
        <span
          className="text-[10px] uppercase"
          style={{
            fontFamily: 'var(--font-mono)',
            color: TYPE_COLORS[post.type],
          }}
        >
          {post.type}
        </span>
        <h3
          className="text-base text-bark line-clamp-2"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          {post.title}
        </h3>
        {post.excerpt && (
          <p
            className="text-xs text-stone line-clamp-2"
            style={{ fontFamily: 'var(--font-body)' }}
          >
            {post.excerpt}
          </p>
        )}
        <div
          className="text-[11px] text-stone flex gap-2"
          style={{ fontFamily: 'var(--font-mono)' }}
        >
          {post.published_at && <span>{formatDate(post.published_at)}</span>}
          {post.reading_time_minutes && (
            <span>{formatReadingTime(post.reading_time_minutes)}</span>
          )}
        </div>
      </div>
    </div>
  )
}
