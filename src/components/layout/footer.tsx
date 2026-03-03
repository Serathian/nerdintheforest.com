import Link from 'next/link'

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer
      className="mt-24 py-8 px-5 border-t border-rule flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10"
    >
      <p
        className="font-mono text-xs text-stone"
        style={{ fontFamily: 'var(--font-mono)' }}
      >
        Nerd in the Forest &copy; {year}
      </p>

      <nav className="flex items-center gap-5">
        <a
          href="https://instagram.com"
          target="_blank"
          rel="noopener noreferrer"
          className="font-mono text-xs text-stone hover:text-water transition-colors"
          style={{ fontFamily: 'var(--font-mono)' }}
        >
          Instagram ↗
        </a>
        <Link
          href="/about"
          className="font-mono text-xs text-stone hover:text-water transition-colors"
          style={{ fontFamily: 'var(--font-mono)' }}
        >
          About
        </Link>
      </nav>
    </footer>
  )
}
