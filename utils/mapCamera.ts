export const CAMERA_STORAGE_KEY = 'nitf_map_camera_v1'

export interface SavedCameraState {
  center: [number, number]
  zoom: number
  bearing?: number
  pitch?: number
}

function getStorage() {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage
    }
    if (typeof localStorage !== 'undefined' && localStorage && typeof localStorage.getItem === 'function') {
      return localStorage
    }
  } catch {
    // Access denied / restricted
  }
  return null
}

export function loadSavedCamera(storage?: any): SavedCameraState | null {
  const store = storage || getStorage()
  if (!store) return null
  try {
    const saved = store.getItem(CAMERA_STORAGE_KEY)
    if (!saved) return null
    const parsed = JSON.parse(saved)
    if (
      Array.isArray(parsed.center) &&
      parsed.center.length === 2 &&
      typeof parsed.zoom === 'number'
    ) {
      const [lng, lat] = parsed.center
      if (
        Number.isFinite(lng) &&
        Number.isFinite(lat) &&
        Number.isFinite(parsed.zoom) &&
        lng >= -180 &&
        lng <= 180 &&
        lat >= -90 &&
        lat <= 90 &&
        parsed.zoom >= 0 &&
        parsed.zoom <= 24
      ) {
        return {
          center: [lng, lat],
          zoom: parsed.zoom,
          bearing: parsed.bearing || 0,
          pitch: parsed.pitch || 0
        }
      }
    }
  } catch {
    // Ignore storage parse error
  }
  return null
}

export function saveCameraState(mapInstance?: any, storage?: any) {
  const store = storage || getStorage()
  if (!store || !mapInstance) return
  try {
    const center = mapInstance.getCenter?.()
    const zoom = mapInstance.getZoom?.()
    const bearing = mapInstance.getBearing?.()
    const pitch = mapInstance.getPitch?.()
    if (!center || zoom == null) return

    const state: SavedCameraState = {
      center: [Number(center.lng.toFixed(5)), Number(center.lat.toFixed(5))],
      zoom: Number(zoom.toFixed(2)),
      bearing: Math.round(bearing || 0),
      pitch: Math.round(pitch || 0)
    }
    store.setItem(CAMERA_STORAGE_KEY, JSON.stringify(state))
  } catch {
    // Storage quota or private browsing mode
  }
}

export function hasSavedCamera(storage?: any): boolean {
  return loadSavedCamera(storage) !== null
}

export function clearSavedCamera(storage?: any): void {
  const store = storage || getStorage()
  if (!store) return
  try {
    store.removeItem(CAMERA_STORAGE_KEY)
  } catch {
    // Ignore error
  }
}
