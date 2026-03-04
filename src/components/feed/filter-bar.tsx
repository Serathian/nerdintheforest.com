'use client'

import type { PostType } from '@/types'

interface FilterBarProps {
  activeType: PostType | 'all'
  onTypeChange: (type: PostType | 'all') => void
  resultCount: number
}

const FILTERS: (PostType | 'all')[] = ['all', 'adventure', 'tips', 'recipe', 'review']

export default function FilterBar({ activeType, onTypeChange, resultCount }: FilterBarProps) {
  return (
    <div className="sticky top-0 z-10" style={{ backgroundColor: 'var(--color-parchment)' }}>
      <div
        className="flex gap-2 px-4 py-3 overflow-x-auto"
        style={{ whiteSpace: 'nowrap' }}
      >
        {FILTERS.map((type) => {
          const isActive = type === activeType
          return (
            <button
              key={type}
              onClick={() => onTypeChange(type)}
              className={`px-3 py-1 border rounded-sm text-xs cursor-pointer transition-colors ${
                isActive
                  ? 'text-parchment border-lichen'
                  : 'text-stone border-rule hover:text-bark hover:border-bark'
              }`}
              style={{
                fontFamily: 'var(--font-mono)',
                backgroundColor: isActive ? 'var(--color-lichen)' : 'transparent',
              }}
            >
              {type === 'all' ? 'All' : type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          )
        })}
      </div>
      <p
        className="text-[11px] text-stone px-4 pb-2"
        style={{ fontFamily: 'var(--font-mono)' }}
      >
        {resultCount} {resultCount === 1 ? 'post' : 'posts'}
      </p>
    </div>
  )
}
