import type { LocationEntry } from '@/types'
import { formatDate, formatCoords } from '@/lib/format'

interface LocationsListProps {
  locations: LocationEntry[]
}

export default function LocationsList({ locations }: LocationsListProps) {
  return (
    <div className="my-6 border-t border-rule pt-4">
      <p
        className="text-xs uppercase tracking-wider text-stone mb-4"
        style={{ fontFamily: 'var(--font-mono)' }}
      >
        Visited locations
      </p>
      {locations.map((entry, i) => (
        <div
          key={entry.location.id}
          className={`flex gap-3 pb-4 ${
            i < locations.length - 1 ? 'border-b border-rule' : ''
          }`}
        >
          {/* Diamond marker */}
          <div className="flex-shrink-0 mt-1">
            <div
              style={{
                width: 8,
                height: 8,
                transform: 'rotate(45deg)',
                backgroundColor: 'var(--color-contour)',
                border: '1px solid var(--color-bark)',
              }}
            />
          </div>

          {/* Info */}
          <div>
            <p
              className="text-sm text-bark"
              style={{ fontFamily: 'var(--font-body)' }}
            >
              {entry.location.name}
            </p>
            <p
              className="text-[10px] text-stone"
              style={{ fontFamily: 'var(--font-mono)' }}
            >
              {entry.location.place_type} &middot; {entry.location.marker_type}
            </p>
            {entry.visit_date && (
              <p
                className="text-[10px] text-stone"
                style={{ fontFamily: 'var(--font-mono)' }}
              >
                {formatDate(entry.visit_date)}
              </p>
            )}
            <p
              className="text-[10px] text-contour"
              style={{ fontFamily: 'var(--font-mono)' }}
            >
              {formatCoords(entry.location.latitude, entry.location.longitude)}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}
