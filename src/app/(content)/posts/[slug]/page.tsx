import { notFound } from 'next/navigation'
import { fetchPostBySlug, fetchAllPostSlugs } from '@/lib/api'
import PostHeader from '@/components/post/post-header'
import PostBody from '@/components/post/post-body'
import TrailCard from '@/components/post/trail-card'
import RecipeMeta from '@/components/post/recipe-meta'
import ReviewMeta from '@/components/post/review-meta'
import LocationsList from '@/components/post/locations-list'
import RelatedPosts from '@/components/post/related-posts'
import MiniMap from '@/components/map/mini-map'
import type { Metadata } from 'next'

export const revalidate = 3600

export async function generateStaticParams() {
  const slugs = await fetchAllPostSlugs()
  return slugs.map((slug) => ({ slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const post = await fetchPostBySlug(slug)
  if (!post) return {}
  return {
    title: post.seo_title ?? post.title,
    description: post.seo_description ?? post.excerpt,
  }
}

export default async function PostPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const post = await fetchPostBySlug(slug)
  if (!post) notFound()

  return (
    <article className="max-w-2xl mx-auto px-5 py-12">
      <PostHeader post={post} />
      {post.latitude && post.longitude && (
        <MiniMap
          latitude={post.latitude}
          longitude={post.longitude}
          trailGpxUrl={post.trail?.gpx_file?.url}
        />
      )}
      {post.trail && <TrailCard trail={post.trail} />}
      <PostBody content={post.body} />
      {post.type === 'recipe' && post.recipe_meta && (
        <RecipeMeta meta={post.recipe_meta} />
      )}
      {post.type === 'review' && post.review_meta && (
        <ReviewMeta meta={post.review_meta} />
      )}
      {post.locations && post.locations.length > 0 && (
        <LocationsList locations={post.locations} />
      )}
      {post.latitude && post.longitude && (
        <RelatedPosts
          postId={post.id}
          latitude={post.latitude}
          longitude={post.longitude}
        />
      )}
    </article>
  )
}
