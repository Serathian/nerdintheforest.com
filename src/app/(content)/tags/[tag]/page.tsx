import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'

import { fetchPostsByTag, fetchAllTags } from '@/lib/api'
import { formatDate } from '@/lib/format'
import type { PostType } from '@/types'

export const revalidate = 3600

interface TagPageProps {
  params: Promise<{ tag: string }>
}

export async function generateStaticParams() {
  const tags = await fetchAllTags()
  return tags.map((t) => ({ tag: t.slug }))
}

export async function generateMetadata({ params }: TagPageProps): Promise<Metadata> {
  const { tag } = await params
  return { title: `#${tag} — Nerd in the Forest` }
}

const TYPE_LABELS: Record<PostType, string> = {
  adventure: 'Adventure',
  tips: 'Tips & Info',
  recipe: 'Recipe',
  review: 'Review',
  general: 'General',
}

export default async function TagPage({ params }: TagPageProps) {
  const { tag } = await params
  const posts = await fetchPostsByTag(tag)
  if (posts.length === 0) notFound()

  return (
    <div className="mx-auto max-w-2xl px-5 py-10">
      <p
        className="text-[10px] uppercase tracking-[0.2em] text-stone mb-3"
        style={{ fontFamily: 'var(--font-mono)' }}
      >
        Tag
      </p>
      <h1
        className="text-3xl sm:text-4xl text-bark mb-10"
        style={{ fontFamily: 'var(--font-display)' }}
      >
        #{tag}
      </h1>

      <ol className="space-y-8">
        {posts.map((post) => (
          <li key={post.id}>
            <Link href={`/posts/${post.slug}`} className="group flex gap-4 items-start">
              {post.cover_image && (
                <div className="flex-shrink-0 relative w-20 h-20 sm:w-24 sm:h-24 rounded-lg overflow-hidden">
                  <Image
                    src={post.cover_image.url}
                    alt={post.cover_image.alt}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    sizes="96px"
                  />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p
                  className="text-[10px] uppercase tracking-[0.16em] text-stone mb-1"
                  style={{ fontFamily: 'var(--font-mono)' }}
                >
                  {TYPE_LABELS[post.type]}
                </p>
                <h2
                  className="text-lg leading-snug text-bark group-hover:text-lichen transition-colors"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  {post.title}
                </h2>
                {post.published_at && (
                  <p
                    className="text-xs text-stone mt-1"
                    style={{ fontFamily: 'var(--font-mono)' }}
                  >
                    {formatDate(post.published_at)}
                  </p>
                )}
              </div>
            </Link>
          </li>
        ))}
      </ol>
    </div>
  )
}
