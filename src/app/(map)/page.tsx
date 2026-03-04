import { fetchPosts } from '@/lib/api'
import MapView from '@/components/map/map-view'

export const revalidate = 300

export default async function HomePage() {
  const { docs: posts } = await fetchPosts({ limit: 200 })
  return <MapView posts={posts} />
}
