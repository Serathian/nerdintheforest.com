'use client'

import Image from 'next/image'
import Link from 'next/link'

import type { NitfPostGeo, PostType } from '@/types'
import { formatDate } from '@/lib/format'

interface PostPanelProps {
  post: NitfPostGeo
  onClose: () => void
}

const TYPE_LABELS: Record<PostType, string> = {
  adventure: 'Adventure',
  tips:      'Tips & Info',
  recipe:    'Recipe',
  review:    'Review',
  general:   'General',
}

export default function PostPanel({ post, onClose }: PostPanelProps) {
  return (
    <>
      {/* Mobile-only backdrop — tap to close */}
      <div
        className="fixed inset-0 z-30 md:hidden"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel — bottom sheet on mobile, right sidebar on desktop */}
      <aside
        className="animate-fade-up fixed bottom-0 left-0 right-0 z-40 overflow-y-auto md:bottom-auto md:top-14 md:left-auto md:right-4 md:w-80 md:max-h-[calc(100dvh-4.5rem)] md:rounded-xl"
        style={{
          backgroundColor: 'var(--color-parchment)',
          borderTop: '1px solid var(--color-rule)',
          borderRadius: '14px 14px 0 0',
          boxShadow: '0 -4px 32px rgba(61,46,31,0.14)',
        }}
      >
        {/* Drag handle (mobile) */}
        <div className="pt-3 pb-1 md:hidden">
          <div className="drag-handle" />
        </div>

        <div className="p-5 relative">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-7 h-7 flex items-center justify-center rounded-full text-stone hover:text-bark hover:bg-rule transition-colors"
            aria-label="Close post panel"
            style={{ fontFamily: 'var(--font-mono)', fontSize: '13px' }}
          >
            ✕
          </button>

          {/* Post type badge */}
          <p
            className="text-[10px] uppercase tracking-[0.18em] text-stone mb-3"
            style={{ fontFamily: 'var(--font-mono)' }}
          >
            {TYPE_LABELS[post.type]}
          </p>

          {/* Cover image */}
          {post.cover_image && (
            <div className="relative w-full h-40 rounded-lg overflow-hidden mb-4">
              <Image
                src={post.cover_image.url}
                alt={post.cover_image.alt}
                fill
                className="object-cover"
                sizes="(min-width: 768px) 320px, 100vw"
              />
            </div>
          )}

          {/* Title */}
          <h2
            className="text-xl leading-snug text-bark mb-1 pr-6"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            {post.title}
          </h2>

          {/* Meta */}
          <p
            className="text-[11px] text-stone mb-4"
            style={{ fontFamily: 'var(--font-mono)' }}
          >
            {formatDate(post.published_at ?? undefined)}
            {post.reading_time_minutes ? ` · ${post.reading_time_minutes} min read` : ''}
          </p>

          {/* Excerpt */}
          {post.excerpt && (
            <p className="text-sm text-bark leading-relaxed mb-5">
              {post.excerpt}
            </p>
          )}

          {/* CTA */}
          <Link
            href={`/posts/${post.slug}`}
            className="cta-arrow inline-flex items-center gap-1 text-[13px] text-lichen hover:text-bark transition-colors"
            style={{ fontFamily: 'var(--font-mono)' }}
          >
            Read more <span aria-hidden="true">→</span>
          </Link>
        </div>
      </aside>
    </>
  )
}
