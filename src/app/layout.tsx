import type { Metadata } from 'next'
import { Instrument_Serif, Source_Serif_4, IBM_Plex_Mono } from 'next/font/google'
import './globals.css'

const instrumentSerif = Instrument_Serif({
  variable: '--font-instrument-serif',
  subsets: ['latin'],
  weight: ['400'],
  display: 'swap',
})

const sourceSerif4 = Source_Serif_4({
  variable: '--font-source-serif-4',
  subsets: ['latin', 'latin-ext'], // latin-ext for Finnish ä, ö
  weight: ['400', '600'],
  display: 'swap',
})

const ibmPlexMono = IBM_Plex_Mono({
  variable: '--font-ibm-plex-mono',
  subsets: ['latin'],
  weight: ['400', '600'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'Nerd in the Forest',
    template: '%s · Nerd in the Forest',
  },
  description: 'Finnish nature adventures, trails, and wild places — every post on the map.',
  metadataBase: new URL('https://nerdintheforest.com'),
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${instrumentSerif.variable} ${sourceSerif4.variable} ${ibmPlexMono.variable}`}
    >
      <body>
        {children}
      </body>
    </html>
  )
}
