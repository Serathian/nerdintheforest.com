# Agents.md — nerdintheforest.com Frontend Handoff

> **For any agent picking up this work:** Read this entire file before touching any code.
> It contains the full design spec, architecture decisions, and precise implementation tasks.

---

## Project Overview

**nerdintheforest.com** is a Finnish nature blog where every post is geo-located and displayed on
an interactive map of Finland. The map is the star feature — it is the homepage, and content is
accessible via a draggable bottom sheet (mobile) or fixed sidebar (desktop).

**Live CMS:** `https://cms.jake-reddy.com` — Payload CMS v3 + PostgreSQL 16 + PostGIS 3.4

**Repo location:** `c:\Repositories\droplet-stack\nerdintheforest.com\`

**Stack:** Next.js 16.1.6, React 19, Tailwind CSS v4, TypeScript, MapLibre GL JS v5

---

## What's Already Built

| Item | File | Status |
|---|---|---|
| Next.js scaffold | `package.json`, `tsconfig.json`, etc. | Done |
| Global theme + CSS | `src/app/globals.css` | Done |
| Root layout + fonts | `src/app/layout.tsx` | Done |
| Type definitions | `src/types/index.ts` | Done |
| CMS API client | `src/lib/api.ts` | Done |
| Formatters | `src/lib/format.ts` | Done |
| GPX to GeoJSON converter | `src/lib/gpx.ts` | Done |
| Media query hook | `src/lib/use-media-query.ts` | Done |
| Map route group layout | `src/app/(map)/layout.tsx` | Done |
| Content route group layout | `src/app/(content)/layout.tsx` | Done |
| Floating map header | `src/components/layout/map-header.tsx` | Done |
| Content nav | `src/components/layout/content-nav.tsx` | Done |
| Footer | `src/components/layout/footer.tsx` | Done |

**Everything else is still to be built.** `src/app/page.tsx` is still the default Next.js
template and needs to be deleted. No component under `src/components/map/`,
`src/components/feed/`, or `src/components/post/` exists yet.

---

## Design System — Mandatory Reference

All components must follow these rules exactly. No deviation.

### Colors (use CSS variables, not raw hex)

| Token | CSS var | Hex | Use |
|---|---|---|---|
| Bark | `var(--color-bark)` | `#3d2e1f` | Headings, primary text |
| Lichen | `var(--color-lichen)` | `#6b7c5e` | Active states, accent |
| Stone | `var(--color-stone)` | `#94897c` | Muted text, meta |
| Parchment | `var(--color-parchment)` | `#f5f0e8` | Page background, surfaces |
| Blaze | `var(--color-blaze)` | `#c4541a` | CTA — one per visible screen |
| Water | `var(--color-water)` | `#4a7c8f` | Links, interactive, water features |
| Rule | `var(--color-rule)` | `#d4cec5` | Borders, dividers |
| Contour | `var(--color-contour)` | `#c9c1b4` | Subtle borders, drag handle |

### Typography (set `fontFamily` style or use CSS vars)

| Role | CSS var | Font | Weight |
|---|---|---|---|
| Display | `var(--font-display)` | Instrument Serif | 400 |
| Body | `var(--font-body)` | Source Serif 4 | 400, 600 |
| Mono | `var(--font-mono)` | IBM Plex Mono | 400, 600 |

Because Tailwind v4 resolves font families from CSS vars, in JSX use inline style:
```tsx
<h1 style={{ fontFamily: 'var(--font-display)' }}>Title</h1>
<span style={{ fontFamily: 'var(--font-mono)' }} className="text-xs text-stone">meta</span>
```

### Design Rules (never violate these)

- No gradients anywhere
- No colored section backgrounds — color lives in text, borders, markers only
- No `shadow-lg` or `shadow-xl` — use `1px solid var(--color-rule)` borders
- No `rounded-2xl` — use `rounded-sm` for the technical/map aesthetic
- One Blaze CTA per visible screen
- No animation libraries — CSS transitions and keyframes only (already defined in globals.css)

### Post type to color mapping (used by markers and badges)

```typescript
const TYPE_COLORS: Record<PostType, string> = {
  adventure: 'var(--color-lichen)',
  tips:       'var(--color-water)',
  recipe:     'var(--color-blaze)',
  review:     'var(--color-stone)',
  general:    'var(--color-bark)',
}
```

---

## Architecture

### Route Groups

```
src/app/
  (map)/          → Full-bleed map. Layout: position:fixed, inset:0, height:100dvh.
    layout.tsx    Done
    page.tsx      MISSING — server component that fetches posts + locations,
                  renders <MapView>. Also DELETE src/app/page.tsx (default template).

  (content)/      → Nav + footer wrapper.
    layout.tsx    Done
    about/
      page.tsx    MISSING
    posts/[slug]/
      page.tsx    MISSING
```

### Component Tree (what to build)

```
<MapView>                           CLIENT orchestrator, owns all shared state
  <MapHeader>                       Done
  <MapContainer ref={mapRef}>       MapLibre GL map
    <PostMarker> (per post)
    <LocationMarker> (per location, zoom >= 8 only)
    <MapPopup>
  </MapContainer>
  <MapControls>                     zoom in/out/locate-me buttons

  {isDesktop ? (
    <Sidebar>
      <FilterBar>
      <PostFeed>
        <PostCard> (per post)
    </Sidebar>
  ) : (
    <BottomSheet snapState={...}>
      <FilterBar>
      <PostFeed>
        <PostCard> (per post)
    </BottomSheet>
  )}
</MapView>
```

### State (in MapView)

```typescript
const [activePostId, setActivePostId] = useState<number | null>(null)
const [activeType, setActiveType]     = useState<PostType | 'all'>('all')
const [snapState, setSnapState]       = useState<'peek' | 'half' | 'full'>('half')
const mapRef = useRef<MapHandle>(null)
const isDesktop = useMediaQuery('(min-width: 1024px)')
```

**Map to Feed sync:** Click pin → set `activePostId`, scroll feed to card, snap sheet to `'half'`
**Feed to Map sync:** Click card → set `activePostId`, `mapRef.current.flyTo(lon, lat, 12)`, snap sheet to `'peek'`
**Filter sync:** Change filter → recompute `filteredPosts`, update both map markers and feed

---

## Remaining Tasks (in order)

### TASK 1 — Map Components (`src/components/map/`)

#### 1a. `map-container.tsx` (Client component)

```
Props:
  posts: NitfPostGeo[]
  locations: NitfLocation[]
  activePostId: number | null
  onPostSelect: (id: number) => void

Ref handle (useImperativeHandle):
  flyTo(lon: number, lat: number, zoom: number): void
  getMap(): maplibregl.Map | null

Implementation:
  - Use React.forwardRef
  - Initialize MapLibre Map in useEffect with mapContainerRef
  - Map style: https://api.maptiler.com/maps/outdoor/style.json?key=${NEXT_PUBLIC_MAPTILER_KEY}
  - Initial center: [26.0, 64.5] (Finland), zoom: 5
  - Render PostMarker for each post with lat/lon
  - Render LocationMarker for each location
  - On unmount: map.remove()
  - Container div: position absolute, inset 0
  - Import: import 'maplibre-gl/dist/maplibre-gl.css'
```

#### 1b. `post-marker.tsx` (Client component)

```
Props:
  post: NitfPostGeo
  map: maplibregl.Map
  isActive: boolean
  onClick: (id: number) => void

Implementation:
  - MapLibre Marker with custom HTML element
  - Element: 12px circle (16px when active), colored by post.type via TYPE_COLORS
  - Active state: add className 'marker-active' (pulse ring defined in globals.css)
  - onClick: fire onClick(post.id)
  - Cleanup marker.remove() on unmount
```

#### 1c. `location-marker.tsx` (Client component)

```
Props:
  location: NitfLocation
  map: maplibregl.Map
  visible: boolean   (passed from MapContainer based on zoom >= 8)

Implementation:
  - 8px diamond shape: div with transform: rotate(45deg), border bark, bg contour
  - Small SVG icon inside per marker_type (inline SVG, single path):
      camp/camp-paid/laavu → triangle (tent silhouette)
      cabin/cabin-paid     → square + triangle (house)
      motorhome            → wide rectangle (van)
      trailhead            → flag pole + flag
      viewpoint/day-visit  → simple eye outline
      other                → filled dot
  - visible=false: marker.getElement().style.display = 'none'
  - Cleanup marker.remove() on unmount
```

#### 1d. `map-popup.tsx` (Client component)

```
Props:
  post: NitfPostGeo
  map: maplibregl.Map
  onClose: () => void

Implementation:
  - MapLibre Popup at [post.longitude, post.latitude]
  - React portal: createRoot into popup.getElement(), render popup content
  - Width 240px, no shadow, border: 1px solid var(--color-rule), rounded-sm
  - Cover image: next/image 240x120 object-cover, or gray placeholder
  - Title: font-display text-sm text-bark, 2-line clamp
  - Type + date row: font-mono text-[10px] text-stone
  - "Read post" link: font-mono text-xs text-blaze, href /posts/{post.slug}
  - Cleanup popup.remove() and React root on close / unmount
```

#### 1e. `map-controls.tsx` (Client component)

```
Props:
  onZoomIn: () => void
  onZoomOut: () => void
  onLocate: (lat: number, lon: number) => void

Implementation:
  - position: absolute; bottom: 96px; right: 12px; z-index: 20
  - Three buttons stacked vertically, gap-1:
      Zoom in:  + symbol
      Zoom out: − symbol
      Locate:   target/crosshair SVG icon, calls navigator.geolocation.getCurrentPosition
  - Each button: 36x36px, bg-parchment, text-bark, border border-rule, rounded-sm
  - Hover: border-lichen, text-lichen
```

#### 1f. `mini-map.tsx` (Client component)

```
Props:
  latitude: number
  longitude: number
  zoom?: number (default 12)
  trailGpxUrl?: string

Implementation:
  - Fixed 240px height container, border border-rule, rounded-sm, relative overflow-hidden, my-6
  - MapLibre map, same style URL as main map
  - scrollZoom.disable(), dragPan.disable() initially
  - "Make interactive" button (absolute bottom-right z-10, font-mono text-xs):
      onClick: scrollZoom.enable(), dragPan.enable(), hide button
  - If trailGpxUrl: fetchGpxAsGeoJson() on mount, add as GeoJSON source + line layer:
      line-color: var(--color-lichen) (#6b7c5e), line-width: 3, line-dasharray: [2, 2]
  - Single marker at [longitude, latitude]
  - Import maplibre-gl/dist/maplibre-gl.css
```

---

### TASK 2 — Bottom Sheet (`src/components/feed/bottom-sheet.tsx`)

```
Props:
  snapState: 'peek' | 'half' | 'full'
  onSnapChange: (s: 'peek' | 'half' | 'full') => void
  children: React.ReactNode

Snap points (as translateY from bottom):
  'peek' → calc(100% - 120px)   shows ~120px
  'half' → 50vh                 shows half viewport
  'full' → 10vh                 shows 90% of viewport

Styles:
  position: fixed; bottom: 0; left: 0; right: 0; z-index: 50
  border-radius: 16px 16px 0 0
  background: var(--color-parchment)
  box-shadow: 0 -4px 24px rgba(0,0,0,0.08)
  transform: translateY(computed)
  transition: transform 0.3s cubic-bezier(0.25, 1, 0.5, 1)

Drag gesture (on drag handle area only):
  onTouchStart: record startY, startTranslate
  onTouchMove: update translateY directly (no transition during drag, use state for live pos)
  onTouchEnd: compute velocity (deltaY / deltaTime), snap to nearest of 3 points
  touch-action: none on drag handle, touch-action: pan-y on children scroll area

Render:
  <div className="lg:hidden"> (only mobile)
    <div className="drag-handle-area" onTouchStart/Move/End>
      <div className="drag-handle" /> {/* 40x4px centered bar from globals.css */}
    </div>
    <div style={{ overflowY: 'auto', flex: 1 }}>
      {children}
    </div>
  </div>
```

---

### TASK 3 — Sidebar (`src/components/feed/sidebar.tsx`)

```
Props:
  children: React.ReactNode

Implementation:
  - Only render on desktop: className="hidden lg:block"
  - position: fixed; top: 0; left: 0; bottom: 0; width: 420px
  - border-right: 1px solid var(--color-rule)
  - background: var(--color-parchment)
  - overflow-y: auto
  - z-index: 40
  - Display flex column: MapHeader area (fixed height) + scrollable children below
```

---

### TASK 4 — Feed Components

#### 4a. `filter-bar.tsx` (Client component)

```
Props:
  activeType: PostType | 'all'
  onTypeChange: (type: PostType | 'all') => void
  resultCount: number

Sticky within scroll container: sticky top-0 bg-parchment z-10
Horizontal scrollable row: overflow-x-auto, white-space nowrap, px-4 py-3
Chips for: 'all', 'adventure', 'tips', 'recipe', 'review'
  - font-mono text-xs rounded-sm px-3 py-1 border
  - Inactive: text-stone border-rule, hover text-bark border-bark
  - Active: bg-lichen text-parchment border-lichen
Result count: font-mono text-[11px] text-stone px-4 pb-2
```

#### 4b. `post-card.tsx` (Client component)

```
Props:
  post: NitfPostGeo
  isActive: boolean
  onClick: (post: NitfPostGeo) => void

Layout: flex flex-row px-4 py-3 gap-3 border-b border-rule cursor-pointer
Active state: border-l-[3px] border-lichen bg-[#efe9dd] pl-3

Left: 80x80 cover image (next/image object-cover rounded-sm flex-shrink-0)
      Gray placeholder div if no cover_image

Right (flex flex-col gap-0.5):
  1. Type badge: font-mono text-[10px] uppercase text-{type-color}
  2. Title: font-display text-base text-bark line-clamp-2
             style={{ fontFamily: 'var(--font-display)' }}
  3. Excerpt: font-body text-xs text-stone line-clamp-2 (optional, if present)
  4. Meta row: font-mono text-[11px] text-stone flex gap-2
       formatDate(post.published_at), formatReadingTime(post.reading_time_minutes)
```

#### 4c. `post-card-skeleton.tsx`

```
Same outer dimensions as PostCard.
All content replaced with animate-pulse bg-contour rounded bars:
  - 80x80 square (image placeholder)
  - 3-4 bars: w-1/3, w-full, w-2/3, w-1/2
```

#### 4d. `post-feed.tsx` (Client component)

```
Props:
  posts: NitfPostGeo[]
  activePostId: number | null
  onPostClick: (post: NitfPostGeo) => void
  loading?: boolean

overflow-y: auto, flex-1
Skeleton x5 when loading=true
Map posts to PostCard with isActive={post.id === activePostId}
Attach itemRefs[post.id] to each PostCard wrapper div
useEffect watching activePostId:
  if activePostId, itemRefs[activePostId]?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
Empty state: font-mono text-xs text-stone text-center p-8 "No posts yet."
```

---

### TASK 5 — MapView Orchestrator (`src/components/map-view.tsx`)

This is the most important component — wires the map and feed together.

```
'use client'

Props:
  posts: NitfPostGeo[]
  locations: NitfLocation[]

State:
  activePostId: number | null = null
  activeType: PostType | 'all' = 'all'
  snapState: 'peek' | 'half' | 'full' = 'half'
  mapRef: useRef<MapHandle>(null)
  isDesktop = useMediaQuery('(min-width: 1024px)')

filteredPosts = useMemo:
  activeType === 'all' ? posts : posts.filter(p => p.type === activeType)

handlePostSelect(id: number):
  setActivePostId(id)
  if (snapState === 'peek') setSnapState('half')

handleCardClick(post: NitfPostGeo):
  setActivePostId(post.id)
  if (post.longitude && post.latitude)
    mapRef.current?.flyTo(post.longitude, post.latitude, 12)
  setSnapState('peek')

handleLocate(lat: number, lon: number):
  mapRef.current?.flyTo(lon, lat, 11)

Render:
<div style={{ position: 'relative', width: '100%', height: '100%' }}>
  <MapHeader />

  {/* Map area */}
  <div style={isDesktop
    ? { position: 'absolute', top: 0, left: 420, right: 0, bottom: 0 }
    : { position: 'absolute', inset: 0 }
  }>
    <MapContainer
      ref={mapRef}
      posts={filteredPosts}
      locations={locations}
      activePostId={activePostId}
      onPostSelect={handlePostSelect}
    />
    <MapControls
      onZoomIn={() => mapRef.current?.getMap()?.zoomIn()}
      onZoomOut={() => mapRef.current?.getMap()?.zoomOut()}
      onLocate={handleLocate}
    />
  </div>

  {isDesktop ? (
    <Sidebar>
      <FilterBar ... />
      <PostFeed ... />
    </Sidebar>
  ) : (
    <BottomSheet snapState={snapState} onSnapChange={setSnapState}>
      <FilterBar ... />
      <PostFeed ... />
    </BottomSheet>
  )}
</div>
```

---

### TASK 6 — Homepage (`src/app/(map)/page.tsx`)

Replace the default template. Server component.

```typescript
import { fetchPosts, fetchLocations } from '@/lib/api'
import MapView from '@/components/map-view'
import type { Metadata } from 'next'

export const revalidate = 300

export const metadata: Metadata = {
  title: 'Map',
  description: 'Finnish nature adventures on the map.',
}

export default async function MapPage() {
  const [postsData, locations] = await Promise.all([
    fetchPosts({ limit: 200, sort: '-published_at' }),
    fetchLocations(),
  ])
  return <MapView posts={postsData.docs} locations={locations} />
}
```

Also DELETE `src/app/page.tsx` (the default scaffold). The `(map)/page.tsx` is the root route.

---

### TASK 7 — Post Page and Components

#### 7a. `src/app/(content)/posts/[slug]/page.tsx` (Server component)

```typescript
import { fetchPostBySlug, fetchAllPostSlugs } from '@/lib/api'
import { notFound } from 'next/navigation'
// import all post components

export const revalidate = 3600

export async function generateStaticParams() {
  const slugs = await fetchAllPostSlugs()
  return slugs.map((slug) => ({ slug }))
}

export async function generateMetadata({ params }) {
  const post = await fetchPostBySlug(params.slug)
  if (!post) return {}
  return {
    title: post.seo_title ?? post.title,
    description: post.seo_description ?? post.excerpt,
  }
}

export default async function PostPage({ params }) {
  const post = await fetchPostBySlug(params.slug)
  if (!post) notFound()
  return (
    <article className="max-w-2xl mx-auto px-5 py-12">
      <PostHeader post={post} />
      {post.latitude && post.longitude && (
        <MiniMap latitude={post.latitude} longitude={post.longitude}
          trailGpxUrl={post.trail?.gpx_file?.url} />
      )}
      {post.trail && <TrailCard trail={post.trail} />}
      <PostBody content={post.body} />
      {post.type === 'recipe' && post.recipe_meta && <RecipeMeta meta={post.recipe_meta} />}
      {post.type === 'review' && post.review_meta && <ReviewMeta meta={post.review_meta} />}
      {post.locations && post.locations.length > 0 && (
        <LocationsList locations={post.locations} />
      )}
      {post.latitude && post.longitude && (
        <RelatedPosts postId={post.id} latitude={post.latitude} longitude={post.longitude} />
      )}
    </article>
  )
}
```

#### 7b. `src/components/post/post-header.tsx`

```
Props: post: NitfPost

Cover image block:
  - Full-width, aspect-ratio 16/9 on mobile, 3/1 on desktop
  - next/image with priority={true}, sizes="(max-width:768px) 100vw, 768px"
  - Gradient overlay at bottom: linear-gradient(to top, rgba(61,46,31,0.7), transparent)
  - Title overlaid at bottom-left: font-display text-2xl sm:text-3xl text-parchment, p-4
  - If no cover_image: bark background div, title in parchment

Meta bar (below image):
  - py-3, flex flex-wrap gap-x-4 gap-y-1
  - All items: font-mono text-xs text-stone
  - Type badge: colored per TYPE_COLORS
  - formatDate(post.published_at)
  - formatReadingTime(post.reading_time_minutes)
  - post.author?.name

Tags row (if tags present):
  - flex flex-wrap gap-2 mt-2
  - Each: font-mono text-[10px] text-stone border border-rule rounded-sm px-2 py-0.5
```

#### 7c. `src/components/post/post-body.tsx`

```
Props: content?: string

The body field is plain text or simple markdown (textarea type in Payload CMS schema).

For rendering, install: npm install remark remark-html
Use remark to parse markdown to an HTML string server-side, then render as
React elements by splitting on block-level tags and mapping to styled components.

IMPORTANT: Do NOT use dangerouslySetInnerHTML with user-generated content.
Instead, install: npm install rehype-react rehype-parse unified
and use the unified pipeline to convert HTML to React elements safely.
This avoids XSS entirely as no raw HTML is injected into the DOM.

Example pipeline:
  unified()
    .use(remarkParse)
    .use(remarkRehype)
    .use(rehypeReact, { createElement: React.createElement, components: { ... } })
    .processSync(content)
    .result

Custom components for rehype-react:
  p   → <p className="mb-4 leading-relaxed font-body text-bark">
  h2  → <h2 style={{ fontFamily: 'var(--font-display)' }} className="text-xl mt-8 mb-3 text-bark">
  h3  → same pattern, text-lg
  a   → <a className="text-water underline underline-offset-2">
  blockquote → <blockquote className="border-l-[3px] border-lichen pl-4 italic text-stone my-4">
  code → <code className="font-mono text-sm bg-bark/5 rounded-sm px-1">
  pre  → <pre className="font-mono text-sm bg-bark/5 rounded-sm p-4 overflow-x-auto my-4">

If content is empty/undefined: return null.
```

#### 7d. `src/components/post/trail-card.tsx`

```
Props: trail: NitfTrail

Field-notebook card:
  Container: border border-rule rounded-sm p-5 my-6
  Title: font-display text-lg text-bark mb-4
  Data grid: grid grid-cols-2 sm:grid-cols-4 gap-4
    Each cell:
      label: font-mono text-[10px] uppercase tracking-wider text-stone block
      value: font-mono text-base text-bark block
    Cells: Distance, Elevation up (formatMetres), Elevation down, Duration, Difficulty, Type, Season, Region
  Difficulty badge colors:
    easy → text-lichen, moderate → text-water, hard → text-blaze, expert → text-bark
  GPX download link (if trail.gpx_file):
    font-mono text-xs text-water mt-4 block, use <a href download>
```

#### 7e. `src/components/post/recipe-meta.tsx`

```
Props: meta: RecipeMetaData

Same card style as trail-card.
Title: "Recipe"
Grid: Prep time, Cook time, Servings, Difficulty
Equipment list: font-mono text-xs text-stone, bullet list below grid
```

#### 7f. `src/components/post/review-meta.tsx`

```
Props: meta: ReviewMetaData

Same card style.
Title: meta.subject or "Review"
Rating: row of 5 circles — filled (bg-lichen) for rating, outline (border-rule) for remainder
Pros: text-lichen "+" prefix, font-body text-sm
Cons: text-stone "−" prefix, font-body text-sm
Verdict: font-body italic text-stone mt-4 border-t border-rule pt-4
```

#### 7g. `src/components/post/locations-list.tsx`

```
Props: locations: LocationEntry[]

Vertical timeline, my-6 border-t border-rule pt-4
Title: "Visited locations" font-mono text-xs uppercase tracking-wider text-stone mb-4
Each entry: flex gap-3 pb-4 border-b border-rule, last:border-0
  Left: 8px diamond (div rotated 45deg, bg-contour border border-bark)
  Right:
    Name: font-body text-sm text-bark
    place_type + marker_type: font-mono text-[10px] text-stone
    formatDate(entry.visit_date): font-mono text-[10px] text-stone
    formatCoords(entry.location.latitude, entry.location.longitude): font-mono text-[10px] text-contour
```

#### 7h. `src/components/post/related-posts.tsx` (Server component)

```
Props: postId: number, latitude: number, longitude: number

Fetch fetchNearbyPosts(latitude, longitude, 25000) server-side.
Filter out current post (postId). Take first 3.

If no results: return null.

Layout:
  Container: my-12 border-t border-rule pt-8
  Title: font-mono text-xs uppercase tracking-wider text-stone mb-4 "Nearby on the map"
  Grid: grid grid-cols-1 sm:grid-cols-3 gap-4
  Each card:
    Link to /posts/{slug}
    Cover image (aspect-4/3 object-cover rounded-sm) or bark placeholder
    Type badge + title (font-display text-sm text-bark)
    Distance: font-mono text-xs text-stone (formatDistance(distance_m / 1000))
```

---

### TASK 8 — About Page (`src/app/(content)/about/page.tsx`)

Static page. Hardcode content for now.

```typescript
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

      {/* Stats grid — same pattern as TrailCard */}
      <div className="border border-rule rounded-sm p-5">
        <p style={{ fontFamily: 'var(--font-mono)' }} className="text-[10px] uppercase tracking-wider text-stone mb-4">
          Field notes
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Posts', value: '—' },
            { label: 'Trails', value: '—' },
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
```

---

### TASK 9 — next.config.ts and Environment

#### `next.config.ts`

```typescript
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'cms.jake-reddy.com' },
      { protocol: 'https', hostname: 'api.maptiler.com' },
    ],
  },
}

export default nextConfig
```

#### `.env.local.example` (create this file)

```
NEXT_PUBLIC_CMS_URL=https://cms.jake-reddy.com
NEXT_PUBLIC_MAPTILER_KEY=your_maptiler_key_here
```

MapTiler free account: maptiler.com (100k map loads/month free).
Map style URL: `https://api.maptiler.com/maps/outdoor/style.json?key={KEY}`

---

## CMS Types Package

All CMS collection types are generated from Payload CMS and published to npm as:

```
@basecamp-cms/basecamp-cms-types
```

**Do not define CMS collection types locally.** Import them from this package.

```typescript
import type { NitfPost, NitfLocation, NitfTrail } from '@basecamp-cms/basecamp-cms-types'
```

The local `src/types/index.ts` re-exports these and adds frontend-only types (e.g. `NitfPostGeo`).
Use `from '@/types'` within the project — it will resolve to the package types transitively.

---

## Key Imports Available (all pre-built)

```typescript
// Types (local re-exports from @basecamp-cms/basecamp-cms-types + frontend-only additions)
import type { NitfPost, NitfPostGeo, NitfLocation, NitfTrail, PostType } from '@/types'

// API
import { fetchPosts, fetchPostBySlug, fetchNearbyPosts, fetchLocations } from '@/lib/api'

// Formatters
import { formatDate, formatDistance, formatMetres, formatDuration, formatCoords, formatReadingTime } from '@/lib/format'

// GPX
import { fetchGpxAsGeoJson } from '@/lib/gpx'

// Hook
import { useMediaQuery } from '@/lib/use-media-query'

// MapLibre (client components only, always import CSS too)
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
```

---

## CMS Notes

- Collection slugs: `nitf_posts`, `nitf_locations`, `nitf_trails`, `nitf_waypoints`
- PostGIS endpoint: `GET /api/nitf-posts/nearby?lat=X&lon=Y&radius=Z`
  Returns: `[{ id, title, slug, latitude, longitude, distance_m }]`
- All lists return `{ docs: [...], totalDocs, totalPages, page, limit }`
- Depth: `?depth=1` populates one level of relationships (`cover_image` object)
- Filter: `?where[status][equals]=published`
- Sort: `?sort=-published_at` (descending)
- The CMS may return empty `docs: []` — all components must handle empty states gracefully

---

## Commit Milestones

```
feat: implement MapLibre map with markers, popup, and bottom sheet
feat: implement map+feed sync with filter bar, post cards, and sidebar
feat: implement individual post page with mini-map and trail data
feat: complete about page, next.config, and env setup
```

---

## Running the Project

```bash
cd c:/Repositories/droplet-stack/nerdintheforest.com
cp .env.local.example .env.local
# Edit .env.local: add real NEXT_PUBLIC_MAPTILER_KEY
npm run dev
# Opens http://localhost:3000
```

Verification checklist:
1. `npm run dev` starts with zero errors
2. Map renders Finland centred at `[26.0, 64.5]` zoom 5 with MapTiler Outdoor tiles
3. Bottom sheet snaps between peek/half/full states on mobile viewport
4. Desktop (1024px+): sidebar 420px left, map fills right
5. Clicking a map pin highlights the post card and scrolls the feed
6. Clicking a post card flies the map to that location
7. Type filter chips update map markers and feed simultaneously
8. `/about` renders without errors
9. `npm run build` — zero TypeScript errors, all pages pre-rendered

---

## Reference Files in Other Repos

| File | Purpose |
|---|---|
| `c:\Repositories\basecamp\src\collections\nerdintheforest\NitfPosts.ts` | Post schema |
| `c:\Repositories\basecamp\src\collections\nerdintheforest\NitfLocations.ts` | Location schema |
| `c:\Repositories\basecamp\src\collections\nerdintheforest\NitfTrails.ts` | Trail schema |
| `c:\Repositories\basecamp\src\payload.config.ts` | PostGIS nearby endpoint contract |
| `c:\Repositories\droplet-stack\jake-reddy.com\src\app\globals.css` | Design pattern reference |
| `c:\Repositories\droplet-stack\jake-reddy.com\src\app\layout.tsx` | Font loading reference |
