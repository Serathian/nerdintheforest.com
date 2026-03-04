import { fetchPosts, fetchLocations } from '@/lib/api'
import MapView from '@/components/map-view'
import type { Metadata } from 'next'

export const revalidate = 300

export const metadata: Metadata = {
  title: 'Map',
  description: 'Finnish nature adventures on the map.',
}

export default async function MapPage() {
  const [postsData, locations] = await Promise.all([
    fetchPosts({ limit: 200, sort: '-published_at' }),
    fetchLocations(),
  ])
  return <MapView posts={postsData.docs} locations={locations} />
}
