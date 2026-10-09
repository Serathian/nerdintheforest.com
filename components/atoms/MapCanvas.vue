<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { MARKER_IMAGE_PREFIX, createMarkerImage, parseMarkerImageId } from '~/utils/mapMarkers'
import { formatDistance, haversineKm } from '~/utils/geo'

interface Waypoint {
  id: string
  title: string
  lat: number
  lng: number
  region?: string
  type?: string
}

export interface MapTrailhead {
  name: string
  lat: number
  lng: number
  trailGeometry?: Array<[number, number]> | null
}

export interface MapFocusPadding {
  top: number
  bottom: number
  left: number
  right: number
}

interface Props {
  waypoints: Waypoint[]
  selectedId?: string
  /** Parking area for the selected waypoint; drawn with a distance-annotated link when set */
  trailhead?: MapTrailhead | null
  activeLayer?: 'topo' | 'satellite'
  center?: [number, number]
  zoom?: number
  userLocation?: [number, number] | null
}

const props = withDefaults(defineProps<Props>(), {
  activeLayer: 'topo',
  center: () => [10.715, 60.270], // Nordmarka sector framing Langvatnet, Dalasjøhøgda & Bjørgeseterfjellet
  zoom: 12.2,
  trailhead: null,
  userLocation: null
})

const emit = defineEmits<{
  (e: 'select-waypoint', id: string): void
  (e: 'map-click'): void
}>()

const mapContainer = ref<HTMLElement | null>(null)
let map: maplibregl.Map | null = null

const EMPTY_FC = { type: 'FeatureCollection' as const, features: [] as any[] }

function buildUserLocationGeoJSON(loc?: [number, number] | null) {
  if (!loc) {
    return {
      type: 'FeatureCollection' as const,
      features: []
    }
  }
  return {
    type: 'FeatureCollection' as const,
    features: [
      {
        type: 'Feature' as const,
        properties: { title: 'Current Location' },
        geometry: {
          type: 'Point' as const,
          coordinates: loc
        }
      }
    ]
  }
}

function buildWaypointsGeoJSON(waypoints: Waypoint[], selectedId?: string) {
  return {
    type: 'FeatureCollection' as const,
    features: waypoints.map((wp) => ({
      type: 'Feature' as const,
      properties: {
        id: wp.id,
        title: wp.title,
        type: (wp.type || 'shelter').toLowerCase(),
        isSelected: wp.id === selectedId
      },
      geometry: {
        type: 'Point' as const,
        coordinates: [wp.lng, wp.lat] as [number, number]
      }
    }))
  }
}

/** Selected waypoint coords, only when it is currently rendered on the map */
function getSelectedCoords(): [number, number] | null {
  const wp = props.waypoints.find(w => w.id === props.selectedId)
  return wp ? [wp.lng, wp.lat] : null
}

/**
 * Clockwise rotation (deg, relative to north-up map) that lays text along the a→b segment
 * in Web Mercator, normalised to stay upright.
 */
function segmentTextRotation(a: [number, number], b: [number, number]): number {
  const toRad = (d: number) => (d * Math.PI) / 180
  const mercY = (lat: number) => Math.log(Math.tan(Math.PI / 4 + toRad(lat) / 2))
  const dx = toRad(b[0] - a[0])
  const dy = mercY(b[1]) - mercY(a[1])
  let deg = (-Math.atan2(dy, dx) * 180) / Math.PI
  if (deg > 90) deg -= 180
  if (deg < -90) deg += 180
  return deg
}

// Reactive cache for dynamically fetched hiking trail geometries
const dynamicTrailRoutes = ref<Record<string, Array<[number, number]>>>({})

async function fetchDynamicHikingTrail(selectedId: string, from: [number, number], to: [number, number]) {
  if (dynamicTrailRoutes.value[selectedId]) return
  try {
    const url = `https://routing.openstreetmap.de/routed-foot/route/v1/foot/${to[0]},${to[1]};${from[0]},${from[1]}?overview=full&geometries=geojson`
    const res = await fetch(url)
    if (!res.ok) return
    const data = await res.json()
    if (data.code === 'Ok' && data.routes?.[0]?.geometry?.coordinates?.length) {
      dynamicTrailRoutes.value[selectedId] = data.routes[0].geometry.coordinates
      if (map && map.getSource('nitf-trailhead-link')) {
        setSourceData('nitf-trailhead', buildTrailheadGeoJSON(props.trailhead))
        setSourceData('nitf-trailhead-link', buildTrailheadLinkGeoJSON(props.trailhead))
      }
    }
  } catch (_) {
    // Graceful fallback to pre-mapped or direct link
  }
}

/**
 * Trailhead parking point + a single midpoint feature carrying the distance annotation.
 * (A `line-center` label on the link would be duplicated wherever the line crosses tile boundaries.)
 */
function buildTrailheadGeoJSON(trailhead?: MapTrailhead | null) {
  const from = getSelectedCoords()
  if (!trailhead || !from) return EMPTY_FC
  const to: [number, number] = [trailhead.lng, trailhead.lat]

  const cachedRoute = props.selectedId ? dynamicTrailRoutes.value[props.selectedId] : null
  const trail = trailhead.trailGeometry || cachedRoute

  let mid: [number, number] = [(from[0] + to[0]) / 2, (from[1] + to[1]) / 2]
  let rotation = segmentTextRotation(to, from)
  let dist = haversineKm(from, to)

  if (trail && trail.length >= 2) {
    dist = 0
    for (let i = 1; i < trail.length; i++) {
      dist += haversineKm(trail[i - 1], trail[i])
    }
    const halfDist = dist / 2
    let accumulated = 0
    for (let i = 1; i < trail.length; i++) {
      const seg = haversineKm(trail[i - 1], trail[i])
      if (accumulated + seg >= halfDist) {
        mid = trail[i]
        rotation = segmentTextRotation(trail[i - 1], trail[i])
        break
      }
      accumulated += seg
    }
  }

  return {
    type: 'FeatureCollection' as const,
    features: [
      {
        type: 'Feature' as const,
        properties: { kind: 'parking', name: trailhead.name, type: 'trailhead' },
        geometry: { type: 'Point' as const, coordinates: to }
      },
      {
        type: 'Feature' as const,
        properties: {
          kind: 'distance',
          distanceLabel: formatDistance(dist),
          rotation: rotation
        },
        geometry: { type: 'Point' as const, coordinates: mid }
      }
    ]
  }
}

function buildTrailheadLinkGeoJSON(trailhead?: MapTrailhead | null) {
  const from = getSelectedCoords()
  if (!trailhead || !from) return EMPTY_FC
  const to: [number, number] = [trailhead.lng, trailhead.lat]

  const cachedRoute = props.selectedId ? dynamicTrailRoutes.value[props.selectedId] : null
  const trail = trailhead.trailGeometry || cachedRoute

  let coords: Array<[number, number]> = [to, from]

  if (trail && trail.length >= 2) {
    const startDistToTrailhead = haversineKm(trail[0], to)
    const endDistToTrailhead = haversineKm(trail[trail.length - 1], to)

    const oriented = [...trail]
    if (startDistToTrailhead > endDistToTrailhead) {
      oriented.reverse()
    }
    // Snap exact start to trailhead and end to location
    oriented[0] = to
    oriented[oriented.length - 1] = from
    coords = oriented
  }

  return {
    type: 'FeatureCollection' as const,
    features: [
      {
        type: 'Feature' as const,
        properties: {
          isHikingTrail: !!trail
        },
        geometry: { type: 'LineString' as const, coordinates: coords }
      }
    ]
  }
}

function handleResize() {
  if (map) {
    map.resize()
  }
}

onMounted(() => {
  if (!mapContainer.value) return

  // Parchment / Cartographic OpenTopo + Satellite styles with native GeoJSON map layers
  map = new maplibregl.Map({
    container: mapContainer.value,
    style: {
      version: 8,
      glyphs: 'https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf',
      sources: {
        'topo-source': {
          type: 'raster',
          tiles: [
            'https://a.tile.opentopomap.org/{z}/{x}/{y}.png',
            'https://b.tile.opentopomap.org/{z}/{x}/{y}.png',
            'https://c.tile.opentopomap.org/{z}/{x}/{y}.png'
          ],
          tileSize: 256,
          attribution: '© OpenStreetMap contributors, OpenTopoMap'
        },
        'satellite-source': {
          type: 'raster',
          tiles: [
            'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
          ],
          tileSize: 256,
          attribution: '© Esri, Maxar, Earthstar Geographics'
        },
        'nitf-waypoints': {
          type: 'geojson',
          data: buildWaypointsGeoJSON(props.waypoints, props.selectedId),
          cluster: true,
          clusterMaxZoom: 12,
          clusterRadius: 50,
          clusterProperties: {
            hasSelected: ['any', ['==', ['get', 'isSelected'], true]]
          }
        },
        'nitf-user-location': {
          type: 'geojson',
          data: buildUserLocationGeoJSON(props.userLocation)
        },
        'nitf-trailhead': {
          type: 'geojson',
          data: buildTrailheadGeoJSON(props.trailhead)
        },
        'nitf-trailhead-link': {
          type: 'geojson',
          data: buildTrailheadLinkGeoJSON(props.trailhead)
        }
      },
      layers: [
        // 1. BASE MAP LAYER: Topographic Contours (desaturated tactile vintage tone)
        {
          id: 'topo-layer',
          type: 'raster',
          source: 'topo-source',
          minzoom: 0,
          maxzoom: 18,
          layout: {
            visibility: props.activeLayer === 'satellite' ? 'none' : 'visible'
          },
          paint: {
            'raster-opacity': 0.92,
            'raster-saturation': -0.3,
            'raster-contrast': 0.15
          }
        },
        // 2. BASE MAP LAYER: High-Resolution Satellite
        {
          id: 'satellite-layer',
          type: 'raster',
          source: 'satellite-source',
          minzoom: 0,
          maxzoom: 18,
          layout: {
            visibility: props.activeLayer === 'satellite' ? 'visible' : 'none'
          },
          paint: {
            'raster-opacity': 0.95
          }
        },
        // 3a. MAP LAYER: Trailhead approach link — parchment casing under the dashed line
        {
          id: 'nitf-trailhead-link-casing',
          type: 'line',
          source: 'nitf-trailhead-link',
          layout: { 'line-cap': 'round', 'line-join': 'round' },
          paint: {
            'line-color': '#fef9ed',
            'line-width': 6,
            'line-opacity': 0.85
          }
        },
        // 3b. MAP LAYER: Trailhead approach link — dashed beacon line
        {
          id: 'nitf-trailhead-link',
          type: 'line',
          source: 'nitf-trailhead-link',
          layout: { 'line-cap': 'round', 'line-join': 'round' },
          paint: {
            'line-color': '#d9531e',
            'line-width': 2.5,
            'line-dasharray': [2, 1.5]
          }
        },
        // 3c. MAP LAYER: Distance annotation at the link midpoint, rotated along the line
        {
          id: 'nitf-trailhead-link-label',
          type: 'symbol',
          source: 'nitf-trailhead',
          filter: ['==', ['get', 'kind'], 'distance'],
          layout: {
            'text-field': ['get', 'distanceLabel'],
            'text-font': ['Noto Sans Regular'],
            'text-size': 12,
            'text-letter-spacing': 0.1,
            'text-rotate': ['get', 'rotation'],
            'text-rotation-alignment': 'map',
            'text-offset': [0, -1.0],
            'text-allow-overlap': true,
            'text-ignore-placement': true
          },
          paint: {
            'text-color': props.activeLayer === 'satellite' ? '#ffffff' : '#0c1811',
            'text-halo-color': props.activeLayer === 'satellite' ? '#0c1811' : '#ffffff',
            'text-halo-width': 3.5,
            'text-halo-blur': 0.5
          }
        },
        // 3d. MAP LAYER: Trailhead parking sign
        {
          id: 'nitf-trailhead-icon',
          type: 'symbol',
          source: 'nitf-trailhead',
          filter: ['==', ['get', 'kind'], 'parking'],
          layout: {
            'icon-image': ['concat', MARKER_IMAGE_PREFIX, ['get', 'type']],
            'icon-anchor': 'center',
            'icon-allow-overlap': true,
            'icon-ignore-placement': true,
            'text-field': ['get', 'name'],
            'text-font': ['Noto Sans Regular'],
            'text-size': 10,
            'text-offset': [0, 1.4],
            'text-anchor': 'top',
            'text-allow-overlap': true
          },
          paint: {
            'text-color': props.activeLayer === 'satellite' ? '#ffffff' : '#1f4f8f',
            'text-halo-color': props.activeLayer === 'satellite' ? '#061910' : '#fef9ed',
            'text-halo-width': 2
          }
        },
        // 4a. MAP LAYER: Waypoint Clusters (Tactile Nordic badges when zoomed out)
        {
          id: 'nitf-cluster-circle',
          type: 'circle',
          source: 'nitf-waypoints',
          filter: ['has', 'point_count'],
          paint: {
            'circle-color': [
              'case',
              ['==', ['get', 'hasSelected'], true],
              '#d9531e',
              '#1b2e24'
            ],
            'circle-radius': [
              'step',
              ['get', 'point_count'],
              16,
              5, 19,
              10, 23
            ],
            'circle-stroke-width': 2.5,
            'circle-stroke-color': props.activeLayer === 'satellite' ? '#ffffff' : '#fef9ed',
            'circle-opacity': 0.95
          }
        },
        // 4b. MAP LAYER: Waypoint Clusters Count
        {
          id: 'nitf-cluster-count',
          type: 'symbol',
          source: 'nitf-waypoints',
          filter: ['has', 'point_count'],
          layout: {
            'text-field': ['get', 'point_count_abbreviated'],
            'text-font': ['Noto Sans Regular'],
            'text-size': 12,
            'text-allow-overlap': true,
            'text-ignore-placement': true
          },
          paint: {
            'text-color': '#ffffff'
          }
        },
        // 4c. MAP LAYER: Category-stylized waypoint pins (unclustered individual points)
        {
          id: 'nitf-waypoints-icon',
          type: 'symbol',
          source: 'nitf-waypoints',
          filter: ['!', ['has', 'point_count']],
          layout: {
            'icon-image': [
              'case',
              ['==', ['get', 'isSelected'], true],
              ['concat', MARKER_IMAGE_PREFIX, ['get', 'type'], '-selected'],
              ['concat', MARKER_IMAGE_PREFIX, ['get', 'type']]
            ],
            'icon-anchor': 'bottom',
            'icon-allow-overlap': true,
            'icon-ignore-placement': true,
            // Draw the selected pin above its neighbours
            'symbol-sort-key': ['case', ['==', ['get', 'isSelected'], true], 1, 0]
          }
        },
        // 5a. MAP LAYER: Selected Waypoint Text Label (always visible when selected, high contrast)
        {
          id: 'nitf-waypoints-selected-label',
          type: 'symbol',
          source: 'nitf-waypoints',
          filter: ['all', ['!', ['has', 'point_count']], ['==', ['get', 'isSelected'], true]],
          layout: {
            'text-field': ['get', 'title'],
            'text-font': ['Noto Sans Regular'],
            'text-size': [
              'interpolate',
              ['linear'],
              ['zoom'],
              10, 11,
              15, 12.5
            ],
            'text-offset': [0, 0.4],
            'text-anchor': 'top',
            'text-allow-overlap': true,
            'text-ignore-placement': true,
            'symbol-sort-key': 2
          },
          paint: {
            'text-color': props.activeLayer === 'satellite' ? '#ffffff' : '#1b2e24',
            'text-halo-color': props.activeLayer === 'satellite' ? '#061910' : '#fef9ed',
            'text-halo-width': 2.5
          }
        },
        // 5b. MAP LAYER: Waypoint Text Label (zoom-gated at zoom >= 12.8, de-duplicated without text overlap)
        {
          id: 'nitf-waypoints-label',
          type: 'symbol',
          source: 'nitf-waypoints',
          minzoom: 12.8,
          filter: ['all', ['!', ['has', 'point_count']], ['!=', ['get', 'isSelected'], true]],
          layout: {
            'text-field': ['get', 'title'],
            'text-font': ['Noto Sans Regular'],
            'text-size': [
              'interpolate',
              ['linear'],
              ['zoom'],
              12.8, 10,
              15, 12
            ],
            'text-offset': [0, 0.4],
            'text-anchor': 'top',
            'text-allow-overlap': false,
            'text-ignore-placement': false,
            'text-optional': true,
            'symbol-sort-key': 1
          },
          paint: {
            'text-color': props.activeLayer === 'satellite' ? '#ffffff' : '#1b2e24',
            'text-halo-color': props.activeLayer === 'satellite' ? '#061910' : '#fef9ed',
            'text-halo-width': 2
          }
        },
        // 8. MAP LAYER: User Current Location Outer Pulse Halo
        {
          id: 'nitf-user-halo',
          type: 'circle',
          source: 'nitf-user-location',
          paint: {
            'circle-radius': 16,
            'circle-color': '#2563eb',
            'circle-opacity': 0.25,
            'circle-stroke-width': 0
          }
        },
        // 9. MAP LAYER: User Current Location Blue Dot
        {
          id: 'nitf-user-beacon',
          type: 'circle',
          source: 'nitf-user-location',
          paint: {
            'circle-radius': 7,
            'circle-color': '#2563eb',
            'circle-stroke-width': 2.5,
            'circle-stroke-color': '#ffffff'
          }
        }
      ]
    },
    center: props.center,
    zoom: props.zoom,
    attributionControl: false
  })

  map.on('load', () => {
    map?.resize()
  })

  // Rasterise category pin images on demand (covers every waypoint type, incl. unknown ones)
  map.on('styleimagemissing', (e) => {
    const parsed = parseMarkerImageId(e.id)
    if (!map || !parsed || map.hasImage(e.id)) return
    const pixelRatio = Math.max(2, Math.ceil(window.devicePixelRatio || 1))
    const image = createMarkerImage(parsed.type, parsed.selected, pixelRatio)
    if (image) map.addImage(e.id, image, { pixelRatio })
  })

  // Layer click handlers directly attached to map layer features.
  // Camera framing is handled by the parent once the selection propagates.
  map.on('click', 'nitf-waypoints-icon', (e) => {
    const feature = e.features?.[0]
    if (feature?.properties?.id) {
      emit('select-waypoint', feature.properties.id)
    }
  })

  map.on('click', 'nitf-waypoints-label', (e) => {
    const feature = e.features?.[0]
    if (feature?.properties?.id) {
      emit('select-waypoint', feature.properties.id)
    }
  })

  map.on('click', 'nitf-waypoints-selected-label', (e) => {
    const feature = e.features?.[0]
    if (feature?.properties?.id) {
      emit('select-waypoint', feature.properties.id)
    }
  })

  // Cluster click: zoom in to expand the cluster
  const handleClusterClick = async (e: any) => {
    const features = map?.queryRenderedFeatures(e.point, {
      layers: ['nitf-cluster-circle', 'nitf-cluster-count']
    })
    const feature = features?.[0]
    if (!feature || !map) return
    const clusterId = feature.properties?.cluster_id
    const source = map.getSource('nitf-waypoints') as maplibregl.GeoJSONSource
    if (source && clusterId != null) {
      try {
        const zoom = await source.getClusterExpansionZoom(clusterId)
        if (!map) return
        const coords = (feature.geometry as any).coordinates
        map.stop()
        map.setPadding({ top: 0, bottom: 0, left: 0, right: 0 })
        map.easeTo({
          center: coords,
          zoom: Math.max(zoom || 13, 13),
          duration: 600
        })
      } catch {
        const coords = (feature.geometry as any).coordinates
        map.stop()
        map.setPadding({ top: 0, bottom: 0, left: 0, right: 0 })
        map.easeTo({
          center: coords,
          zoom: 13,
          duration: 600
        })
      }
    }
  }

  map.on('click', 'nitf-cluster-circle', handleClusterClick)
  map.on('click', 'nitf-cluster-count', handleClusterClick)

  // Canvas background click
  map.on('click', (e) => {
    const features = map?.queryRenderedFeatures(e.point, {
      layers: [
        'nitf-waypoints-icon',
        'nitf-waypoints-label',
        'nitf-waypoints-selected-label',
        'nitf-trailhead-icon',
        'nitf-cluster-circle',
        'nitf-cluster-count'
      ]
    })
    if (!features || features.length === 0) {
      emit('map-click')
    }
  })

  // Pointer cursor on hover over interactive map layers
  const setPointer = () => { if (map) map.getCanvas().style.cursor = 'pointer' }
  const resetPointer = () => { if (map) map.getCanvas().style.cursor = '' }

  map.on('mouseenter', 'nitf-waypoints-icon', setPointer)
  map.on('mouseleave', 'nitf-waypoints-icon', resetPointer)
  map.on('mouseenter', 'nitf-waypoints-label', setPointer)
  map.on('mouseleave', 'nitf-waypoints-label', resetPointer)
  map.on('mouseenter', 'nitf-waypoints-selected-label', setPointer)
  map.on('mouseleave', 'nitf-waypoints-selected-label', resetPointer)
  map.on('mouseenter', 'nitf-cluster-circle', setPointer)
  map.on('mouseleave', 'nitf-cluster-circle', resetPointer)
  map.on('mouseenter', 'nitf-cluster-count', setPointer)
  map.on('mouseleave', 'nitf-cluster-count', resetPointer)

  window.addEventListener('resize', handleResize)
  
  nextTick(() => {
    setTimeout(() => {
      map?.resize()
    }, 100)
  })

  if (typeof window !== 'undefined') {
    (window as any).__map = map
  }
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
  if (map) {
    map.remove()
    map = null
  }
})

function setSourceData(id: string, data: any) {
  const source = map?.getSource(id) as maplibregl.GeoJSONSource | undefined
  source?.setData(data)
}

function updateMapLayersData() {
  if (!map) return
  if (props.selectedId && props.trailhead && !props.trailhead.trailGeometry) {
    const from = getSelectedCoords()
    if (from) {
      fetchDynamicHikingTrail(props.selectedId, from, [props.trailhead.lng, props.trailhead.lat])
    }
  }
  setSourceData('nitf-waypoints', buildWaypointsGeoJSON(props.waypoints, props.selectedId))
  setSourceData('nitf-user-location', buildUserLocationGeoJSON(props.userLocation))
  setSourceData('nitf-trailhead', buildTrailheadGeoJSON(props.trailhead))
  setSourceData('nitf-trailhead-link', buildTrailheadLinkGeoJSON(props.trailhead))
}

function flyToWaypoint(lng: number, lat: number) {
  if (!map) return
  map.stop()
  map.setPadding({ top: 0, bottom: 0, left: 0, right: 0 })
  map.flyTo({
    center: [lng, lat],
    zoom: 13.5,
    duration: 1200,
    essential: true
  })
}

function flyToCoordinates(lng: number, lat: number, zoom = 14) {
  if (!map) return
  map.stop()
  map.setPadding({ top: 0, bottom: 0, left: 0, right: 0 })
  map.flyTo({
    center: [lng, lat],
    zoom,
    duration: 1200,
    essential: true
  })
}

/**
 * Frames the given [lng, lat] points within the visible part of the map.
 * `padding` (px) reserves space for overlays such as the top console and the peek card.
 * A single point is flown to using viewport offset (preserving zero transform padding);
 * multiple points are fitted via fitBounds.
 */
function focusOn(points: Array<[number, number]>, padding?: Partial<MapFocusPadding>) {
  if (!map || points.length === 0) return
  map.stop()
  map.setPadding({ top: 0, bottom: 0, left: 0, right: 0 })

  const pad: MapFocusPadding = { top: 0, bottom: 0, left: 0, right: 0, ...padding }

  // Never let padding exceed the canvas, or MapLibre refuses to fit
  const canvas = map.getCanvas()
  const w = canvas.clientWidth
  const h = canvas.clientHeight
  if (pad.left + pad.right > w - 40) pad.left = pad.right = Math.max(0, (w - 40) / 2)
  if (pad.top + pad.bottom > h - 40) {
    const scale = Math.max(0, h - 40) / (pad.top + pad.bottom)
    pad.top = Math.round(pad.top * scale)
    pad.bottom = Math.round(pad.bottom * scale)
  }

  if (points.length === 1) {
    const offset: [number, number] = [
      Math.round((pad.left - pad.right) / 2),
      Math.round((pad.top - pad.bottom) / 2)
    ]
    map.flyTo({
      center: points[0],
      zoom: 13.5,
      offset,
      duration: 1200,
      essential: true
    })
    return
  }

  const bounds = points.reduce(
    (b, p) => b.extend(p),
    new maplibregl.LngLatBounds(points[0], points[0])
  )
  map.fitBounds(bounds, { padding: pad, maxZoom: 14.5, duration: 1200, essential: true })
}

function zoomIn() {
  if (!map) return
  map.zoomIn({ duration: 300 })
}

function zoomOut() {
  if (!map) return
  map.zoomOut({ duration: 300 })
}

function resetNorth() {
  if (!map) return
  map.resetNorth({ duration: 500 })
}

function centerOnSelected() {
  if (!map || !props.selectedId) return
  const wp = props.waypoints.find(w => w.id === props.selectedId)
  if (wp) flyToWaypoint(wp.lng, wp.lat)
}

defineExpose({
  zoomIn,
  zoomOut,
  resetNorth,
  centerOnSelected,
  flyToWaypoint,
  flyToCoordinates,
  focusOn
})

// Watch activeLayer prop to switch raster base map layers and theme colors
watch(() => props.activeLayer, (newLayer) => {
  if (!map) return
  const isSatellite = newLayer === 'satellite'
  if (map.getLayer('topo-layer')) {
    map.setLayoutProperty('topo-layer', 'visibility', isSatellite ? 'none' : 'visible')
  }
  if (map.getLayer('satellite-layer')) {
    map.setLayoutProperty('satellite-layer', 'visibility', isSatellite ? 'visible' : 'none')
  }
  if (map.getLayer('nitf-waypoints-label')) {
    map.setPaintProperty('nitf-waypoints-label', 'text-color', isSatellite ? '#ffffff' : '#1b2e24')
    map.setPaintProperty('nitf-waypoints-label', 'text-halo-color', isSatellite ? '#061910' : '#fef9ed')
  }
  if (map.getLayer('nitf-waypoints-selected-label')) {
    map.setPaintProperty('nitf-waypoints-selected-label', 'text-color', isSatellite ? '#ffffff' : '#1b2e24')
    map.setPaintProperty('nitf-waypoints-selected-label', 'text-halo-color', isSatellite ? '#061910' : '#fef9ed')
  }
  if (map.getLayer('nitf-trailhead-icon')) {
    map.setPaintProperty('nitf-trailhead-icon', 'text-color', isSatellite ? '#ffffff' : '#1f4f8f')
    map.setPaintProperty('nitf-trailhead-icon', 'text-halo-color', isSatellite ? '#061910' : '#fef9ed')
  }
  if (map.getLayer('nitf-trailhead-link-label')) {
    map.setPaintProperty('nitf-trailhead-link-label', 'text-color', isSatellite ? '#ffffff' : '#0c1811')
    map.setPaintProperty('nitf-trailhead-link-label', 'text-halo-color', isSatellite ? '#0c1811' : '#ffffff')
  }
  if (map.getLayer('nitf-cluster-circle')) {
    map.setPaintProperty('nitf-cluster-circle', 'circle-stroke-color', isSatellite ? '#ffffff' : '#fef9ed')
  }
})

// Watch userLocation changes to update GeoJSON source
watch(() => props.userLocation, () => {
  if (!map || !map.isStyleLoaded()) return
  const userSource = map.getSource('nitf-user-location') as maplibregl.GeoJSONSource
  if (userSource) {
    userSource.setData(buildUserLocationGeoJSON(props.userLocation))
  }
})

// Watch selection, waypoints and trailhead to refresh the GeoJSON map layers.
// Camera framing on selection is owned by the parent via `focusOn` (it knows the peek card's size).
watch([() => props.selectedId, () => props.waypoints, () => props.trailhead], () => {
  updateMapLayersData()
})
</script>

<template>
  <div class="map-canvas-wrapper">
    <div ref="mapContainer" class="map-container" />
  </div>
</template>

<style scoped>
.map-canvas-wrapper {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  background-color: var(--color-surface);
}

.map-container {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

:deep(.maplibregl-ctrl-top-right) {
  top: 80px; /* Position below floating top console */
  right: 16px;
}

:deep(.maplibregl-ctrl-group) {
  background-color: var(--color-surface);
  border: 1px solid var(--color-outline-variant);
  border-radius: 0.125rem;
  box-shadow: 0 4px 12px rgba(6, 25, 16, 0.1);
  overflow: hidden;
}

:deep(.maplibregl-ctrl-group button) {
  border-bottom: 1px solid var(--color-outline-variant);
}
</style>
