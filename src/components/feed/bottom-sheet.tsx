'use client'

import { useRef, useCallback } from 'react'

interface BottomSheetProps {
  snapState: 'peek' | 'half' | 'full'
  onSnapChange: (s: 'peek' | 'half' | 'full') => void
  children: React.ReactNode
}

const SNAP_TRANSLATE: Record<string, string> = {
  peek: 'calc(100% - 120px)',
  half: '50vh',
  full: '10vh',
}

const SNAP_ORDER: ('peek' | 'half' | 'full')[] = ['full', 'half', 'peek']
const SNAP_PERCENT: Record<string, number> = { full: 10, half: 50, peek: 85 }

export default function BottomSheet({ snapState, onSnapChange, children }: BottomSheetProps) {
  const startY = useRef(0)
  const startTime = useRef(0)
  const sheetRef = useRef<HTMLDivElement>(null)

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    startY.current = e.touches[0].clientY
    startTime.current = Date.now()
    if (sheetRef.current) {
      sheetRef.current.style.transition = 'none'
    }
  }, [])

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    if (!sheetRef.current) return
    const dy = e.touches[0].clientY - startY.current
    const currentPercent = SNAP_PERCENT[sheetRef.current.dataset.snap ?? 'half']
    const newPercent = currentPercent + (dy / window.innerHeight) * 100
    const clamped = Math.max(5, Math.min(90, newPercent))
    sheetRef.current.style.transform = `translateY(${clamped}vh)`
  }, [])

  const onTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (!sheetRef.current) return
      const dy = e.changedTouches[0].clientY - startY.current
      const dt = Date.now() - startTime.current
      const velocity = dy / dt

      sheetRef.current.style.transition = 'transform 0.3s cubic-bezier(0.25, 1, 0.5, 1)'

      // Velocity-based snap
      if (Math.abs(velocity) > 0.5) {
        const direction = velocity > 0 ? 1 : -1 // down = 1, up = -1
        const currentIdx = SNAP_ORDER.indexOf(snapState)
        const nextIdx = Math.max(0, Math.min(2, currentIdx + direction))
        onSnapChange(SNAP_ORDER[nextIdx])
        return
      }

      // Position-based snap: find nearest
      const currentTranslate =
        SNAP_PERCENT[snapState] + (dy / window.innerHeight) * 100
      let nearest: 'peek' | 'half' | 'full' = 'half'
      let minDist = Infinity
      for (const snap of SNAP_ORDER) {
        const dist = Math.abs(currentTranslate - SNAP_PERCENT[snap])
        if (dist < minDist) {
          minDist = dist
          nearest = snap
        }
      }
      onSnapChange(nearest)
    },
    [snapState, onSnapChange],
  )

  return (
    <div
      ref={sheetRef}
      data-snap={snapState}
      className="lg:hidden"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        borderRadius: '16px 16px 0 0',
        backgroundColor: 'var(--color-parchment)',
        boxShadow: '0 -4px 24px rgba(0,0,0,0.08)',
        transform: `translateY(${SNAP_TRANSLATE[snapState]})`,
        transition: 'transform 0.3s cubic-bezier(0.25, 1, 0.5, 1)',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div
        className="flex-shrink-0 py-3 cursor-grab"
        style={{ touchAction: 'none' }}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <div className="drag-handle" />
      </div>
      <div style={{ overflowY: 'auto', flex: 1, touchAction: 'pan-y' }}>
        {children}
      </div>
    </div>
  )
}
