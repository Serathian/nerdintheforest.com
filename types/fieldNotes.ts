export * from './models'

export interface AmenityItem {
  icon: string
  label: string
}

export interface Trailhead {
  name: string
  latitude: number
  longitude: number
  trailGeometry?: Array<[number, number]>
  elevationGain?: number
  elevationLoss?: number
}

export interface LinkedDispatch {
  id: string
  slug: string
  title: string
  date: string
  readTime: string
  excerpt?: string
  weather?: string
  heroImage?: string
  content?: string[]
}

export interface FieldNote {
  id: string
  numberTag: string
  title: string
  areaId?: string
  area?: string
  description?: string
  timeAgo?: string
  visitedCount?: number
  amenities: AmenityItem[]
  footerFeature?: string
  footerIcon?: string
  metrics?: string
  latitude?: number
  longitude?: number
  elevation?: number
  elevationGain?: number
  elevationLoss?: number
  distanceKm?: number
  category?: 'SHELTER' | 'HEARTH' | 'SPRINGHEAD' | 'SUMMIT' | 'VIEWPOINT' | 'TRAILHEAD' | string
  slug?: string
  date?: string
  readTime?: string
  weather?: string
  heroImage?: string
  content?: string[]
  dispatches?: LinkedDispatch[]
  trailhead?: Trailhead
}
