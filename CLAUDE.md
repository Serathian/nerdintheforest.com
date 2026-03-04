# CLAUDE.md — nerdintheforest.com

> Context file for AI assistants. Read this before making any changes.

---

## Project Overview

**nerdintheforest.com** (abbrev. **NITF**) is a Finnish nature adventure blog / trail guide with a map-first UX. Every post is pinned on an interactive map; readers can explore content geographically before clicking through to read.

**Live domain:** `https://nerdintheforest.com`
**CMS API:** `https://cms.jake-reddy.com` (PayloadCMS, read-only from the frontend)

### Core Goals

1. Map-first homepage — full-bleed MapLibre GL JS map with post markers.
2. Geo-tagged posts covering Finnish nature: adventures, trails, tips, recipes, reviews.
3. Fast static delivery via Next.js ISR / `revalidate`.
4. Elegant "field journal" aesthetic: serif typography, nature-themed palette, topo-contour texture.
5. Mobile-first, accessible, Finnish character support (ä, ö via `latin-ext`).

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| React | React 19 |
| Language | TypeScript 5 (strict mode) |
| Styling | Tailwind CSS v4 (`@import "tailwindcss"`) |
| Map | MapLibre GL JS (`maplibre-gl` ^5) |
| CMS | PayloadCMS (external, `cms.jake-reddy.com`) |
| Fonts | Google Fonts via `next/font` |
| Deploy | Vercel (inferred from project structure) |

---

## Repository Structure

```
nerdintheforest.com/
├── public/                    # Static assets (SVGs, images)
├── src/
│   ├── app/
│   │   ├── layout.tsx         # Root layout — fonts, metadata, <html>/<body>
│   │   ├── page.tsx           # Homepage (currently scaffold; will become MapView)
│   │   ├── globals.css        # Global styles, Tailwind v4 theme, base rules
│   │   ├── favicon.ico
│   │   ├── (map)/             # Route group: full-bleed map pages (no nav/footer)
│   │   │   └── layout.tsx     # Fixed 100dvh container, overflow hidden
│   │   └── (content)/         # Route group: article/blog pages
│   │       └── layout.tsx     # ContentNav + main + Footer
│   ├── components/
│   │   └── layout/
│   │       ├── map-header.tsx  # Floating header for map view (wordmark + nav + mobile drawer)
│   │       ├── content-nav.tsx # Sticky breadcrumb nav for content pages (← Map / title / NITF)
│   │       └── footer.tsx      # Simple footer with copyright + Instagram + About links
│   ├── lib/
│   │   ├── api.ts             # All CMS fetch functions (posts, locations, waypoints, nearby)
│   │   ├── format.ts          # Display formatters: date, distance, duration, coords
│   │   ├── gpx.ts             # GPX → GeoJSON LineString converter for MapLibre
│   │   └── use-media-query.ts # SSR-safe `useMediaQuery` hook ('use client')
│   └── types/
│       └── index.ts           # All shared TypeScript interfaces and union types
├── next.config.ts             # Next.js config (currently minimal)
├── postcss.config.mjs         # PostCSS with @tailwindcss/postcss
├── tsconfig.json              # Strict TS, path alias @/* → ./src/*
└── package.json
```

---

## Route Groups

Next.js route groups (parenthesis folders) control which layout wraps pages:

- **`(map)/`** — Full-bleed map pages. Layout is `position: fixed; inset: 0; height: 100dvh`. No nav or footer. `MapHeader` lives inside the page component itself.
- **`(content)/`** — Article/blog pages. Layout includes `ContentNav` (sticky top) and `Footer`.

The root `app/layout.tsx` applies to **all** routes: sets fonts, metadata, `<html lang="en">`, and `<body>`.

---

## Design System

### Color Palette (defined in `globals.css` `@theme`)

| Token | Hex | Usage |
|---|---|---|
| `--color-bark` | `#3d2e1f` | Primary text, dark elements |
| `--color-lichen` | `#6b7c5e` | Accents, hover states, nav underline |
| `--color-stone` | `#94897c` | Secondary text, labels |
| `--color-parchment` | `#f5f0e8` | Page background |
| `--color-blaze` | `#c4541a` | CTAs, warnings, highlight |
| `--color-water` | `#4a7c8f` | Links, map water features |
| `--color-rule` | `#d4cec5` | Borders, dividers |
| `--color-contour` | `#c9c1b4` | Subtle UI elements, drag handles |

Use these tokens via Tailwind utilities (`text-bark`, `bg-parchment`, `border-rule`, etc.) or CSS variables.

### Typography

Three fonts loaded via `next/font/google`, exposed as CSS variables on `<html>`:

| Variable | Font | Use |
|---|---|---|
| `--font-display` | Instrument Serif 400 | Headlines, display text |
| `--font-body` | Source Serif 4 400/600 | Body copy (`font-family` on `body`) |
| `--font-mono` | IBM Plex Mono 400/600 | UI labels, nav, metadata, wordmark |

Apply fonts inline with `style={{ fontFamily: 'var(--font-mono)' }}` alongside Tailwind classes (the Tailwind theme registers `font-display`, `font-body`, `font-mono` utilities).

### Visual Texture

A topographic contour SVG pattern is applied at 4% opacity via `body::before` (fixed, pointer-events: none, z-index: 0). Content sits at `relative z-10` or above.

### Animations

Global CSS classes for entry animations (respect `prefers-reduced-motion`):
- `.animate-fade-up` — slides up + fades in over 0.7s
- `.animate-fade-in` — fades in over 0.5s
- `.marker-active::before` — pulsing ring for active map markers

---

## CMS API (`src/lib/api.ts`)

The CMS base URL is read from `NEXT_PUBLIC_CMS_URL` (falls back to `https://cms.jake-reddy.com`).

### Available Functions

```typescript
fetchPosts(params?)           // Paginated slim posts (NitfPostGeo) for map/feed
fetchPostBySlug(slug)         // Single full post (NitfPost), depth=2
fetchAllPostSlugs()           // All slugs for generateStaticParams
fetchLocations()              // All NitfLocation records
fetchTrailWaypoints(trailId)  // Ordered waypoints for a trail
fetchNearbyPosts(lat, lon, radius?) // PostGIS nearby posts (default 25 km)
```

All functions use Next.js `fetch` with `{ next: { revalidate: N } }`:
- Feed/map data: 300 s (5 min)
- Individual posts: 3600 s (1 h)
- Slugs/waypoints: 3600 s

### CMS Collections (endpoints)

| Endpoint | Type | Purpose |
|---|---|---|
| `/api/nitf_posts` | Payload | Blog posts with geo data |
| `/api/nitf_locations` | Payload | Named places/markers |
| `/api/nitf_waypoints` | Payload | Trail waypoints |
| `/api/nitf-posts/nearby` | Custom | PostGIS proximity search |

---

## Type System (`src/types/index.ts`)

All types are centralized. Import from `@/types`.

### Key Types

```typescript
PostType     = 'adventure' | 'tips' | 'recipe' | 'review' | 'general'
PostStatus   = 'draft' | 'published' | 'archived'
PlaceType    = 'forest' | 'lake' | 'park' | 'viewpoint' | 'summit' | ...
MarkerType   = 'camp' | 'cabin' | 'cabin-paid' | 'laavu' | 'trailhead' | ...
TrailDifficulty = 'easy' | 'moderate' | 'hard' | 'expert'
TrailType    = 'loop' | 'out-and-back' | 'point-to-point'
```

### Key Interfaces

- `NitfPost` — Full post with all relations (trail, locations, author, tags, cover image)
- `NitfPostGeo` — Slim post for map markers (id, title, slug, type, lat/lon, cover)
- `NitfLocation` — Named place with lat/lon and marker/place type
- `NitfTrail` — Trail with GPX file, distance, elevation, difficulty, bounding box
- `NitfWaypoint` — Individual point on a trail
- `PaginatedResponse<T>` — Payload pagination envelope

---

## Utility Library (`src/lib/`)

### `format.ts`

```typescript
formatDate(iso)          // "12 Jun 2025"
formatDateShort(iso)     // "Jun 2025"
formatDistance(km)       // "12.4 km"
formatMetres(m)          // "340 m"
formatDuration(hours)    // "4 h 30 min" / "45 min"
formatReadingTime(min)   // "8 min"
formatCoords(lat, lon)   // "60.1695° N, 24.9354° E"
```

### `gpx.ts`

```typescript
fetchGpxAsGeoJson(gpxUrl)     // Fetch + parse GPX URL → GeoJSON LineString | null
parseGpxToGeoJson(gpxText)    // Parse GPX XML string → GeoJSON LineString | null
```

Supports `<trkpt>` (track segments) with fallback to `<rtept>` (route points). Includes elevation (Z coordinate) when available.

### `use-media-query.ts`

```typescript
useMediaQuery(query: string): boolean
```

SSR-safe: returns `false` on server, subscribes to `MediaQueryList` on client. Mark consuming components `'use client'`.

---

## Development Workflow

### Commands

```bash
npm run dev      # Start dev server at http://localhost:3000
npm run build    # Production build
npm run start    # Serve production build
```

No test runner or linter is currently configured. TypeScript strict mode (`tsc --noEmit`) acts as the primary quality gate.

### Environment Variables

| Variable | Default | Required |
|---|---|---|
| `NEXT_PUBLIC_CMS_URL` | `https://cms.jake-reddy.com` | No (falls back) |

Create `.env.local` to override locally. This file is gitignored.

### Path Aliases

`@/*` resolves to `./src/*`. Always use `@/` imports rather than relative paths for anything outside the same directory.

---

## Coding Conventions

### General

- **TypeScript strict mode** — no `any`, no type assertions without good reason.
- **Functional components only** — no class components.
- **Server components by default** — only add `'use client'` when needed (event handlers, browser APIs, hooks).
- **No test files yet** — don't add test infrastructure unless explicitly requested.
- **No comments on self-evident code** — only add comments where logic is non-obvious.

### Imports

```typescript
// 1. React/Next (no import needed for React in Next.js 13+)
import type { Metadata } from 'next'
import Link from 'next/link'

// 2. Third-party
import maplibregl from 'maplibre-gl'

// 3. Internal types
import type { NitfPost } from '@/types'

// 4. Internal lib
import { fetchPostBySlug } from '@/lib/api'
import { formatDate } from '@/lib/format'

// 5. Internal components
import ContentNav from '@/components/layout/content-nav'
```

### Styling

- Use Tailwind utility classes first.
- Use `style={{ ... }}` for CSS variables (e.g., `style={{ fontFamily: 'var(--font-mono)' }}`).
- Never hardcode hex colors — use the design token variables.
- Tailwind v4: no `tailwind.config.js`; theme tokens live in `globals.css` `@theme {}`.

### Components

- One component per file, file name matches component name in kebab-case.
- Props interfaces at top of file, named `ComponentNameProps`.
- Default exports for page/layout components; named exports for utilities.
- Place shared layout components in `src/components/layout/`.
- Place page-specific components co-located in the page's directory.

### Data Fetching

- Use `src/lib/api.ts` functions — do not write inline `fetch` calls in components.
- Server components fetch data directly (async component functions).
- Set appropriate `revalidate` values: 300 for frequently-updated data, 3600 for static-ish data.
- Never expose the CMS admin token in client-side code.

### MapLibre GL

- MapLibre components must be `'use client'` (uses browser APIs).
- Use `useEffect` to initialize the map; clean up with `map.remove()` on unmount.
- GPX data should be converted via `src/lib/gpx.ts` before passing to MapLibre.
- Map tile sources: use a free, attribution-appropriate tile provider (OpenFreeMap, MapTiler, etc.).

---

## Pages to Build (Planned)

The app is in early scaffold state. Pages to implement:

| Route | Group | Description |
|---|---|---|
| `/` | `(map)` | Full-bleed map with post markers; clicking opens post drawer/panel |
| `/posts/[slug]` | `(content)` | Individual post page (article layout) |
| `/trails/[id]` | `(content)` | Trail detail with map, elevation, waypoints |
| `/about` | `(content)` | About page |
| `/tags/[tag]` | `(content)` | Posts filtered by tag |

The homepage map is the product's core — prioritize it.

---

## Git Workflow

- Default branch: `master`
- Feature work on `claude/` branches (e.g., `claude/create-claude-md-LuSE6`)
- Commit messages follow conventional format: `feat:`, `fix:`, `chore:`, `style:`, `refactor:`
- Push with `git push -u origin <branch-name>`

---

## Known Constraints

- No linter (ESLint) configured yet — keep code clean manually.
- No test framework — TypeScript strict mode is the quality gate.
- `src/app/page.tsx` is still the Next.js scaffold placeholder — replace with real MapView.
- The `(map)` and `(content)` route group directories exist but have no pages inside them yet.
- `postcss.config.mjs` uses `@tailwindcss/postcss` (Tailwind v4 PostCSS plugin).
