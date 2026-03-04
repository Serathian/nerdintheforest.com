'use client'

import { useSyncExternalStore } from 'react'

/**
 * Returns true when the given CSS media query matches.
 * SSR-safe: returns false on the server.
 */
export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (callback) => {
      const mq = window.matchMedia(query)
      mq.addEventListener('change', callback)
      return () => mq.removeEventListener('change', callback)
    },
    () => window.matchMedia(query).matches,
    () => false,
  )
}
