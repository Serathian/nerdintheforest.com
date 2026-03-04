import Image from 'next/image'
import Link from 'next/link'
import { fetchNearbyPosts } from '@/lib/api'
import { formatDistance } from '@/lib/format'

interface RelatedPostsProps {
  postId: number
  latitude: number
  longitude: number
}

export default async function RelatedPosts({ postId, latitude, longitude }: RelatedPostsProps) {
  const nearby = await fetchNearbyPosts(latitude, longitude, 25000)
  const filtered = nearby.filter((p) => p.id !== postId).slice(0, 3)

  if (filtered.length === 0) return null

  return (
    <div className="my-12 border-t border-rule pt-8">
      <p
        className="text-xs uppercase tracking-wider text-stone mb-4"
        style={{ fontFamily: 'var(--font-mono)' }}
      >
        Nearby on the map
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {filtered.map((post) => (
          <Link
            key={post.id}
            href={`/posts/${post.slug}`}
            className="block group"
          >
            <div
              className="rounded-sm overflow-hidden mb-2"
              style={{
                aspectRatio: '4/3',
                backgroundColor: 'var(--color-bark)',
              }}
            />
            <h4
              className="text-sm text-bark group-hover:text-lichen transition-colors"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              {post.title}
            </h4>
            <span
              className="text-xs text-stone"
              style={{ fontFamily: 'var(--font-mono)' }}
            >
              {formatDistance(post.distance_m / 1000)}
            </span>
          </Link>
        ))}
      </div>
    </div>
  )
}
