import Link from 'next/link'

interface ContentNavProps {
  backLabel?: string
  currentTitle?: string
}

export default function ContentNav({
  backLabel = '← Map',
  currentTitle,
}: ContentNavProps) {
  return (
    <nav
      className="sticky top-0 z-50 flex items-center gap-3 px-5 py-3 border-b border-rule"
      style={{
        backgroundColor: 'color-mix(in srgb, var(--color-parchment) 90%, transparent)',
        backdropFilter: 'blur(8px)',
      }}
    >
      <Link
        href="/"
        className="font-mono text-xs text-stone hover:text-lichen transition-colors"
        style={{ fontFamily: 'var(--font-mono)' }}
      >
        {backLabel}
      </Link>

      {currentTitle && (
        <>
          <span
            className="font-mono text-xs text-contour"
            style={{ fontFamily: 'var(--font-mono)' }}
          >
            /
          </span>
          <span
            className="font-mono text-xs text-bark truncate max-w-[200px] sm:max-w-xs"
            style={{ fontFamily: 'var(--font-mono)' }}
          >
            {currentTitle}
          </span>
        </>
      )}

      {/* Right side: wordmark */}
      <div className="ml-auto">
        <Link
          href="/"
          className="font-mono text-[10px] uppercase tracking-[0.2em] text-stone hover:text-bark transition-colors"
          style={{ fontFamily: 'var(--font-mono)' }}
        >
          NITF
        </Link>
      </div>
    </nav>
  )
}
