export interface TrailheadNavTarget {
  trailheadName: string
  locationName?: string
  lat: number
  lng: number
}

export function useTrailheadNav() {
  const navTarget = useState<TrailheadNavTarget | null>('trailheadNavTarget', () => null)

  function openTrailheadModal(target: TrailheadNavTarget) {
    navTarget.value = target
  }

  function closeTrailheadModal() {
    navTarget.value = null
  }

  return {
    navTarget,
    openTrailheadModal,
    closeTrailheadModal
  }
}
