import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'About — Nerd in the Forest',
  description: 'A Finnish nature adventure blog covering trails, forests, lakes, and outdoor life.',
}

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-2xl px-5 py-10">
      <p
        className="text-[10px] uppercase tracking-[0.2em] text-stone mb-3"
        style={{ fontFamily: 'var(--font-mono)' }}
      >
        About
      </p>

      <h1
        className="text-3xl sm:text-4xl text-bark mb-10"
        style={{ fontFamily: 'var(--font-display)' }}
      >
        Nerd in the Forest
      </h1>

      <div className="space-y-5 text-bark leading-relaxed">
        <p>
          Finland has more than 180,000 lakes, 74 national parks and protected areas, and a
          tradition of <em>jokamiehen oikeudet</em> — every&shy;man&apos;s rights — that lets
          anyone roam, camp, and forage freely in the wilderness. This blog exists because
          that kind of freedom deserves to be mapped.
        </p>
        <p>
          Every post is pinned to the place it describes. Click a marker on the map, read
          the story, follow the trail.
        </p>
        <p>
          The writing covers day hikes and multi-day routes, lakeside fire recipes, gear
          reviews from someone who actually carries it, and the occasional observation about
          being a nerd who happens to love forests.
        </p>
      </div>

      <div
        className="mt-12 pt-8 border-t border-rule"
        style={{ fontFamily: 'var(--font-mono)' }}
      >
        <a
          href="https://instagram.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-water hover:text-bark transition-colors"
        >
          Instagram ↗
        </a>
      </div>
    </div>
  )
}
