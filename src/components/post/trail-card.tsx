import type { NitfTrail, TrailDifficulty } from '@/types'
import { formatDistance, formatMetres, formatDuration } from '@/lib/format'

const DIFFICULTY_COLORS: Record<TrailDifficulty, string> = {
  easy: 'var(--color-lichen)',
  moderate: 'var(--color-water)',
  hard: 'var(--color-blaze)',
  expert: 'var(--color-bark)',
}

interface TrailCardProps {
  trail: NitfTrail
}

function Cell({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span
        className="text-[10px] uppercase tracking-wider text-stone block"
        style={{ fontFamily: 'var(--font-mono)' }}
      >
        {label}
      </span>
      <span
        className="text-base text-bark block"
        style={{ fontFamily: 'var(--font-mono)' }}
      >
        {value}
      </span>
    </div>
  )
}

export default function TrailCard({ trail }: TrailCardProps) {
  return (
    <div className="border border-rule rounded-sm p-5 my-6">
      <h3
        className="text-lg text-bark mb-4"
        style={{ fontFamily: 'var(--font-display)' }}
      >
        {trail.title}
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {trail.distance_km != null && (
          <Cell label="Distance" value={formatDistance(trail.distance_km)} />
        )}
        {trail.elevation_gain_m != null && (
          <Cell label="Elevation up" value={formatMetres(trail.elevation_gain_m)} />
        )}
        {trail.elevation_loss_m != null && (
          <Cell label="Elevation down" value={formatMetres(trail.elevation_loss_m)} />
        )}
        {trail.duration_hours != null && (
          <Cell label="Duration" value={formatDuration(trail.duration_hours)} />
        )}
        {trail.difficulty && (
          <div>
            <span
              className="text-[10px] uppercase tracking-wider text-stone block"
              style={{ fontFamily: 'var(--font-mono)' }}
            >
              Difficulty
            </span>
            <span
              className="text-base block"
              style={{
                fontFamily: 'var(--font-mono)',
                color: DIFFICULTY_COLORS[trail.difficulty],
              }}
            >
              {trail.difficulty}
            </span>
          </div>
        )}
        {trail.trail_type && <Cell label="Type" value={trail.trail_type} />}
        {trail.season_start && trail.season_end && (
          <Cell label="Season" value={`${trail.season_start}–${trail.season_end}`} />
        )}
        {trail.region && <Cell label="Region" value={trail.region} />}
      </div>
      {trail.gpx_file?.url && (
        <a
          href={trail.gpx_file.url}
          download
          className="text-xs text-water mt-4 block"
          style={{ fontFamily: 'var(--font-mono)' }}
        >
          Download GPX &darr;
        </a>
      )}
    </div>
  )
}
