import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Image from 'next/image'

import { fetchPostBySlug, fetchAllPostSlugs } from '@/lib/api'
import { formatDate, formatReadingTime, formatDistance, formatDuration } from '@/lib/format'
import type { PostType } from '@/types'

export const revalidate = 3600

interface PostPageProps {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  const slugs = await fetchAllPostSlugs()
  return slugs.map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: PostPageProps): Promise<Metadata> {
  const { slug } = await params
  const post = await fetchPostBySlug(slug)
  if (!post) return {}
  return {
    title: post.seo_title ?? post.title,
    description: post.seo_description ?? post.excerpt,
    openGraph: post.cover_image
      ? { images: [{ url: post.cover_image.url }] }
      : undefined,
  }
}

const TYPE_LABELS: Record<PostType, string> = {
  adventure: 'Adventure',
  tips:      'Tips & Info',
  recipe:    'Recipe',
  review:    'Review',
  general:   'General',
}

export default async function PostPage({ params }: PostPageProps) {
  const { slug } = await params
  const post = await fetchPostBySlug(slug)
  if (!post) notFound()

  return (
    <article>
      {/* Hero — cover image or gradient header */}
      {post.cover_image ? (
        <div className="relative w-full h-64 sm:h-80 md:h-96 overflow-hidden">
          <Image
            src={post.cover_image.url}
            alt={post.cover_image.alt}
            fill
            className="object-cover"
            sizes="100vw"
            priority
          />
          {/* Gradient scrim for title legibility */}
          <div
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(to bottom, transparent 40%, rgba(61,46,31,0.65) 100%)',
            }}
          />
        </div>
      ) : (
        <div className="h-16" />
      )}

      {/* Content column */}
      <div className="mx-auto max-w-2xl px-5 py-10">
        {/* Post type badge */}
        <p
          className="text-[10px] uppercase tracking-[0.2em] text-stone mb-3"
          style={{ fontFamily: 'var(--font-mono)' }}
        >
          {TYPE_LABELS[post.type]}
        </p>

        {/* Title */}
        <h1
          className="text-3xl sm:text-4xl leading-tight text-bark mb-4"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          {post.title}
        </h1>

        {/* Meta row */}
        <div
          className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-stone mb-8 border-b border-rule pb-6"
          style={{ fontFamily: 'var(--font-mono)' }}
        >
          {post.published_at && <span>{formatDate(post.published_at)}</span>}
          {post.author && <span>{post.author.name}</span>}
          {post.reading_time_minutes ? (
            <span>{formatReadingTime(post.reading_time_minutes)} read</span>
          ) : null}
        </div>

        {/* Trail summary card */}
        {post.trail && (
          <div
            className="mb-8 p-4 rounded-lg border border-rule"
            style={{ backgroundColor: 'rgba(107,124,94,0.06)' }}
          >
            <p
              className="text-[10px] uppercase tracking-widest text-lichen mb-2"
              style={{ fontFamily: 'var(--font-mono)' }}
            >
              Trail
            </p>
            <p
              className="text-base font-semibold text-bark mb-3"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              {post.trail.title}
            </p>
            <div
              className="flex flex-wrap gap-x-5 gap-y-1 text-xs text-stone"
              style={{ fontFamily: 'var(--font-mono)' }}
            >
              {post.trail.distance_km != null && (
                <span>{formatDistance(post.trail.distance_km)}</span>
              )}
              {post.trail.duration_hours != null && (
                <span>{formatDuration(post.trail.duration_hours)}</span>
              )}
              {post.trail.difficulty && (
                <span className="capitalize">{post.trail.difficulty}</span>
              )}
              {post.trail.trail_type && (
                <span className="capitalize">{post.trail.trail_type.replace('-', ' ')}</span>
              )}
            </div>
          </div>
        )}

        {/* Body */}
        {post.body && (
          <div
            className="prose"
            dangerouslySetInnerHTML={{ __html: post.body }}
          />
        )}

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="mt-10 pt-6 border-t border-rule flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <span
                key={tag.id}
                className="text-[11px] px-3 py-1 rounded-full border border-rule text-stone"
                style={{ fontFamily: 'var(--font-mono)' }}
              >
                {tag.name}
              </span>
            ))}
          </div>
        )}
      </div>
    </article>
  )
}
