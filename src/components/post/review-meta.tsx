import type { ReviewMetaData } from '@/types'

interface ReviewMetaProps {
  meta: ReviewMetaData
}

export default function ReviewMeta({ meta }: ReviewMetaProps) {
  const rating = meta.rating ?? 0

  return (
    <div className="border border-rule rounded-sm p-5 my-6">
      <h3
        className="text-lg text-bark mb-4"
        style={{ fontFamily: 'var(--font-display)' }}
      >
        {meta.subject || 'Review'}
      </h3>

      {/* Rating circles */}
      <div className="flex gap-1.5 mb-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="w-4 h-4 rounded-full"
            style={
              i < rating
                ? { backgroundColor: 'var(--color-lichen)' }
                : { border: '1.5px solid var(--color-rule)' }
            }
          />
        ))}
      </div>

      {/* Pros */}
      {meta.pros && meta.pros.length > 0 && (
        <ul className="space-y-1 mb-3">
          {meta.pros.map((pro, i) => (
            <li key={i} className="text-sm" style={{ fontFamily: 'var(--font-body)' }}>
              <span style={{ color: 'var(--color-lichen)' }}>+</span>{' '}
              <span className="text-bark">{pro}</span>
            </li>
          ))}
        </ul>
      )}

      {/* Cons */}
      {meta.cons && meta.cons.length > 0 && (
        <ul className="space-y-1 mb-3">
          {meta.cons.map((con, i) => (
            <li key={i} className="text-sm" style={{ fontFamily: 'var(--font-body)' }}>
              <span style={{ color: 'var(--color-stone)' }}>&minus;</span>{' '}
              <span className="text-bark">{con}</span>
            </li>
          ))}
        </ul>
      )}

      {/* Verdict */}
      {meta.verdict && (
        <p
          className="italic text-stone mt-4 border-t border-rule pt-4 text-sm"
          style={{ fontFamily: 'var(--font-body)' }}
        >
          {meta.verdict}
        </p>
      )}
    </div>
  )
}
