import { notFound } from 'next/navigation'
import type { Metadata } from 'next'

import { fetchTrail, fetchAllTrailIds, fetchTrailWaypoints } from '@/lib/api'
import { formatDistance, formatDuration, formatMetres } from '@/lib/format'
import TrailMap from '@/components/trail/trail-map'

export const revalidate = 3600

interface TrailPageProps {
  params: Promise<{ id: string }>
}

export async function generateStaticParams() {
  const ids = await fetchAllTrailIds()
  return ids.map((id) => ({ id: String(id) }))
}

export async function generateMetadata({ params }: TrailPageProps): Promise<Metadata> {
  const { id } = await params
  const trail = await fetchTrail(Number(id))
  if (!trail) return {}
  return { title: `${trail.title} — Nerd in the Forest` }
}

const DIFFICULTY_LABEL = {
  easy: 'Easy',
  moderate: 'Moderate',
  hard: 'Hard',
  expert: 'Expert',
}

const TRAIL_TYPE_LABEL = {
  loop: 'Loop',
  'out-and-back': 'Out & Back',
  'point-to-point': 'Point to Point',
}

export default async function TrailPage({ params }: TrailPageProps) {
  const { id } = await params
  const numId = Number(id)
  if (isNaN(numId)) notFound()

  const [trail, waypoints] = await Promise.all([
    fetchTrail(numId),
    fetchTrailWaypoints(numId),
  ])
  if (!trail) notFound()

  return (
    <article>
      {/* Map */}
      <div className="w-full h-64 sm:h-80 md:h-96 relative z-0">
        <TrailMap trail={trail} waypoints={waypoints} />
      </div>

      <div className="mx-auto max-w-2xl px-5 py-10">
        <p
          className="text-[10px] uppercase tracking-[0.2em] text-stone mb-3"
          style={{ fontFamily: 'var(--font-mono)' }}
        >
          Trail
        </p>

        <h1
          className="text-3xl sm:text-4xl leading-tight text-bark mb-6"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          {trail.title}
        </h1>

        {/* Stats grid */}
        <div
          className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8 p-5 rounded-xl border border-rule"
          style={{ backgroundColor: 'rgba(107,124,94,0.05)' }}
        >
          {trail.distance_km != null && (
            <div>
              <p className="text-[10px] uppercase tracking-widest text-stone mb-1" style={{ fontFamily: 'var(--font-mono)' }}>Distance</p>
              <p className="text-lg text-bark" style={{ fontFamily: 'var(--font-display)' }}>{formatDistance(trail.distance_km)}</p>
            </div>
          )}
          {trail.duration_hours != null && (
            <div>
              <p className="text-[10px] uppercase tracking-widest text-stone mb-1" style={{ fontFamily: 'var(--font-mono)' }}>Duration</p>
              <p className="text-lg text-bark" style={{ fontFamily: 'var(--font-display)' }}>{formatDuration(trail.duration_hours)}</p>
            </div>
          )}
          {trail.elevation_gain_m != null && (
            <div>
              <p className="text-[10px] uppercase tracking-widest text-stone mb-1" style={{ fontFamily: 'var(--font-mono)' }}>Elevation ↑</p>
              <p className="text-lg text-bark" style={{ fontFamily: 'var(--font-display)' }}>{formatMetres(trail.elevation_gain_m)}</p>
            </div>
          )}
          {trail.difficulty && (
            <div>
              <p className="text-[10px] uppercase tracking-widest text-stone mb-1" style={{ fontFamily: 'var(--font-mono)' }}>Difficulty</p>
              <p className="text-lg text-bark" style={{ fontFamily: 'var(--font-display)' }}>{DIFFICULTY_LABEL[trail.difficulty]}</p>
            </div>
          )}
        </div>

        {/* Secondary metadata */}
        {(trail.trail_type || trail.region || (trail.season_start && trail.season_end)) && (
          <div
            className="flex flex-wrap gap-x-6 gap-y-2 text-xs text-stone mb-8 border-b border-rule pb-6"
            style={{ fontFamily: 'var(--font-mono)' }}
          >
            {trail.trail_type && <span>{TRAIL_TYPE_LABEL[trail.trail_type]}</span>}
            {trail.region && <span>{trail.region}</span>}
            {trail.season_start && trail.season_end && (
              <span>{trail.season_start} – {trail.season_end}</span>
            )}
          </div>
        )}

        {/* Waypoints */}
        {waypoints.length > 0 && (
          <section>
            <h2
              className="text-sm uppercase tracking-widest text-stone mb-4"
              style={{ fontFamily: 'var(--font-mono)' }}
            >
              Waypoints
            </h2>
            <ol className="space-y-4">
              {waypoints.map((wp, i) => (
                <li key={wp.id} className="flex gap-4 items-start">
                  <span
                    className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-[10px]"
                    style={{
                      backgroundColor: 'var(--color-lichen)',
                      color: 'var(--color-parchment)',
                      fontFamily: 'var(--font-mono)',
                    }}
                  >
                    {i + 1}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-bark">{wp.name}</p>
                    {wp.description && (
                      <p className="text-xs text-stone mt-0.5">{wp.description}</p>
                    )}
                    {wp.altitude_m != null && (
                      <p className="text-[11px] text-stone mt-0.5" style={{ fontFamily: 'var(--font-mono)' }}>
                        {formatMetres(wp.altitude_m)}
                      </p>
                    )}
                  </div>
                </li>
              ))}
            </ol>
          </section>
        )}
      </div>
    </article>
  )
}
