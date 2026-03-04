'use client'

import { useEffect, useRef } from 'react'
import maplibregl from 'maplibre-gl'
import type { NitfLocation, MarkerType } from '@/types'

function createIconSvg(type: MarkerType): SVGElement {
  const ns = 'http://www.w3.org/2000/svg'

  if (type === 'other') {
    const svg = document.createElementNS(ns, 'svg')
    svg.setAttribute('viewBox', '0 0 8 8')
    svg.setAttribute('width', '6')
    svg.setAttribute('height', '6')
    const circle = document.createElementNS(ns, 'circle')
    circle.setAttribute('cx', '4')
    circle.setAttribute('cy', '4')
    circle.setAttribute('r', '3')
    circle.setAttribute('fill', '#3d2e1f')
    svg.appendChild(circle)
    return svg
  }

  const pathMap: Record<string, string> = {
    camp: 'M8 3 L14 13 H2 Z',
    'camp-paid': 'M8 3 L14 13 H2 Z',
    laavu: 'M8 3 L14 13 H2 Z',
    cabin: 'M3 13V7L8 3l5 4v6H3Z',
    'cabin-paid': 'M3 13V7L8 3l5 4v6H3Z',
    motorhome: 'M2 6h10v5H2Zm10 0h2l1 2v3h-3Z',
    trailhead: 'M5 2v12M5 2h6v5H5',
    viewpoint: 'M1 8a7 7 0 0 1 14 0 7 7 0 0 1-14 0Zm4 0a3 3 0 0 1 6 0 3 3 0 0 1-6 0Z',
    'day-visit': 'M1 8a7 7 0 0 1 14 0 7 7 0 0 1-14 0Zm4 0a3 3 0 0 1 6 0 3 3 0 0 1-6 0Z',
  }

  const svg = document.createElementNS(ns, 'svg')
  svg.setAttribute('viewBox', '0 0 16 16')
  svg.setAttribute('width', '10')
  svg.setAttribute('height', '10')
  svg.setAttribute('fill', 'none')
  svg.setAttribute('stroke', '#3d2e1f')
  svg.setAttribute('stroke-width', '1.5')

  const path = document.createElementNS(ns, 'path')
  path.setAttribute('d', pathMap[type] ?? pathMap['camp'])
  svg.appendChild(path)
  return svg
}

interface LocationMarkerProps {
  location: NitfLocation
  map: maplibregl.Map
  visible: boolean
}

export default function LocationMarker({ location, map, visible }: LocationMarkerProps) {
  const markerRef = useRef<maplibregl.Marker | null>(null)

  useEffect(() => {
    const el = document.createElement('div')
    el.style.width = '8px'
    el.style.height = '8px'
    el.style.transform = 'rotate(45deg)'
    el.style.border = '1px solid var(--color-bark)'
    el.style.backgroundColor = 'var(--color-contour)'
    el.style.display = 'flex'
    el.style.alignItems = 'center'
    el.style.justifyContent = 'center'
    el.style.position = 'relative'

    const icon = document.createElement('div')
    icon.style.transform = 'rotate(-45deg)'
    icon.appendChild(createIconSvg(location.marker_type))
    el.appendChild(icon)

    if (!visible) el.style.display = 'none'

    const marker = new maplibregl.Marker({ element: el })
      .setLngLat([location.longitude, location.latitude])
      .addTo(map)

    markerRef.current = marker

    return () => {
      marker.remove()
    }
  }, [location, map, visible])

  useEffect(() => {
    const el = markerRef.current?.getElement()
    if (el) el.style.display = visible ? 'flex' : 'none'
  }, [visible])

  return null
}
