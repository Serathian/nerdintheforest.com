'use client'

import { useEffect, useRef } from 'react'
import type { NitfPostGeo } from '@/types'
import PostCard from './post-card'
import PostCardSkeleton from './post-card-skeleton'

interface PostFeedProps {
  posts: NitfPostGeo[]
  activePostId: number | null
  onPostClick: (post: NitfPostGeo) => void
  loading?: boolean
}

export default function PostFeed({ posts, activePostId, onPostClick, loading }: PostFeedProps) {
  const itemRefs = useRef<Record<number, HTMLDivElement | null>>({})

  useEffect(() => {
    if (activePostId && itemRefs.current[activePostId]) {
      itemRefs.current[activePostId]?.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      })
    }
  }, [activePostId])

  if (loading) {
    return (
      <div style={{ overflowY: 'auto', flex: 1 }}>
        {Array.from({ length: 5 }).map((_, i) => (
          <PostCardSkeleton key={i} />
        ))}
      </div>
    )
  }

  if (posts.length === 0) {
    return (
      <div
        className="text-xs text-stone text-center p-8"
        style={{ fontFamily: 'var(--font-mono)' }}
      >
        No posts yet.
      </div>
    )
  }

  return (
    <div style={{ overflowY: 'auto', flex: 1 }}>
      {posts.map((post) => (
        <div key={post.id} ref={(el) => { itemRefs.current[post.id] = el }}>
          <PostCard
            post={post}
            isActive={post.id === activePostId}
            onClick={onPostClick}
          />
        </div>
      ))}
    </div>
  )
}
