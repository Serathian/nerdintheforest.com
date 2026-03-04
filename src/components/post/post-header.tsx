import Image from 'next/image'
import type { NitfPost, PostType } from '@/types'
import { formatDate, formatReadingTime } from '@/lib/format'

const TYPE_COLORS: Record<PostType, string> = {
  adventure: 'var(--color-lichen)',
  tips: 'var(--color-water)',
  recipe: 'var(--color-blaze)',
  review: 'var(--color-stone)',
  general: 'var(--color-bark)',
}

interface PostHeaderProps {
  post: NitfPost
}

export default function PostHeader({ post }: PostHeaderProps) {
  return (
    <>
      {/* Cover image */}
      <div className="relative w-full overflow-hidden rounded-sm mb-4" style={{ aspectRatio: '16/9' }}>
        {post.cover_image ? (
          <>
            <Image
              src={post.cover_image.url}
              alt={post.cover_image.alt || post.title}
              fill
              priority
              sizes="(max-width:768px) 100vw, 768px"
              className="object-cover"
            />
            <div
              className="absolute inset-0"
              style={{
                background: 'linear-gradient(to top, rgba(61,46,31,0.7), transparent)',
              }}
            />
            <h1
              className="absolute bottom-0 left-0 p-4 text-2xl sm:text-3xl text-parchment"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              {post.title}
            </h1>
          </>
        ) : (
          <div
            className="w-full h-full flex items-end p-4"
            style={{ backgroundColor: 'var(--color-bark)' }}
          >
            <h1
              className="text-2xl sm:text-3xl text-parchment"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              {post.title}
            </h1>
          </div>
        )}
      </div>

      {/* Meta bar */}
      <div
        className="py-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-stone"
        style={{ fontFamily: 'var(--font-mono)' }}
      >
        <span style={{ color: TYPE_COLORS[post.type] }}>{post.type}</span>
        {post.published_at && <span>{formatDate(post.published_at)}</span>}
        {post.reading_time_minutes && <span>{formatReadingTime(post.reading_time_minutes)}</span>}
        {post.author?.name && <span>{post.author.name}</span>}
      </div>

      {/* Tags */}
      {post.tags && post.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {post.tags.map((tag) => (
            <span
              key={tag.id}
              className="text-[10px] text-stone border border-rule rounded-sm px-2 py-0.5"
              style={{ fontFamily: 'var(--font-mono)' }}
            >
              {tag.name}
            </span>
          ))}
        </div>
      )}
    </>
  )
}
