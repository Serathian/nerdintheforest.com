import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'About' }

export default function AboutPage() {
  return (
    <div className="max-w-2xl mx-auto px-5 py-16 relative z-10">
      <div className="border-l-[3px] border-lichen pl-5 mb-12">
        <h1 style={{ fontFamily: 'var(--font-display)' }} className="text-4xl text-bark">
          About
        </h1>
        <p style={{ fontFamily: 'var(--font-mono)' }} className="text-sm text-stone mt-2">
          Nerd in the Forest
        </p>
      </div>

      <div className="space-y-4 leading-relaxed mb-12" style={{ fontFamily: 'var(--font-body)' }}>
        <p className="text-bark">A Finnish nature blog documenting hiking, camping, and wild places.</p>
        <p className="text-stone">Every post is pinned on the map. Every trail has its coordinates.</p>
      </div>

      {/* Stats grid */}
      <div className="border border-rule rounded-sm p-5">
        <p style={{ fontFamily: 'var(--font-mono)' }} className="text-[10px] uppercase tracking-wider text-stone mb-4">
          Field notes
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Posts', value: '\u2014' },
            { label: 'Trails', value: '\u2014' },
            { label: 'Countries', value: '1' },
            { label: 'Since', value: '2024' },
          ].map(({ label, value }) => (
            <div key={label}>
              <span style={{ fontFamily: 'var(--font-mono)' }} className="text-[10px] uppercase tracking-wider text-stone block">
                {label}
              </span>
              <span style={{ fontFamily: 'var(--font-mono)' }} className="text-base text-bark block">
                {value}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
