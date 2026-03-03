'use client'

import Link from 'next/link'
import { useState } from 'react'

export default function MapHeader() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <>
      {/* Floating header */}
      <header
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-3"
        style={{
          backgroundColor: 'color-mix(in srgb, var(--color-parchment) 90%, transparent)',
          backdropFilter: 'blur(8px)',
          borderBottom: '1px solid var(--color-rule)',
        }}
      >
        {/* Wordmark */}
        <Link
          href="/"
          className="font-mono text-[11px] uppercase tracking-[0.2em] text-bark hover:text-lichen transition-colors"
          style={{ fontFamily: 'var(--font-mono)' }}
        >
          Nerd in the Forest
        </Link>

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-6">
          <Link
            href="/about"
            className="nav-link font-mono text-xs text-stone hover:text-bark transition-colors"
            style={{ fontFamily: 'var(--font-mono)' }}
          >
            About
          </Link>
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            className="nav-link font-mono text-xs text-stone hover:text-bark transition-colors"
            style={{ fontFamily: 'var(--font-mono)' }}
          >
            Instagram ↗
          </a>
        </nav>

        {/* Mobile hamburger */}
        <button
          className="lg:hidden flex flex-col gap-1 p-2"
          onClick={() => setMenuOpen((o) => !o)}
          aria-label="Toggle menu"
        >
          <span
            className="block w-5 h-px transition-transform"
            style={{
              backgroundColor: 'var(--color-bark)',
              transform: menuOpen ? 'rotate(45deg) translateY(4px)' : undefined,
            }}
          />
          <span
            className="block w-5 h-px"
            style={{
              backgroundColor: 'var(--color-bark)',
              opacity: menuOpen ? 0 : 1,
            }}
          />
          <span
            className="block w-5 h-px transition-transform"
            style={{
              backgroundColor: 'var(--color-bark)',
              transform: menuOpen ? 'rotate(-45deg) translateY(-4px)' : undefined,
            }}
          />
        </button>
      </header>

      {/* Mobile slide-out drawer */}
      {menuOpen && (
        <div
          className="fixed inset-0 z-40 flex flex-col gap-6 pt-20 px-6"
          style={{ backgroundColor: 'var(--color-parchment)' }}
        >
          <Link
            href="/about"
            className="font-mono text-base text-bark border-b border-rule pb-4"
            style={{ fontFamily: 'var(--font-mono)' }}
            onClick={() => setMenuOpen(false)}
          >
            About
          </Link>
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-base text-bark border-b border-rule pb-4"
            style={{ fontFamily: 'var(--font-mono)' }}
            onClick={() => setMenuOpen(false)}
          >
            Instagram ↗
          </a>
        </div>
      )}
    </>
  )
}
