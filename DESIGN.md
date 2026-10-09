# Nordic Field Notes & Cartography — Design System & Stitch Inventory

> **Source:** Stitch MCP — Project `Nordic Trail Field Notes` (`projects/2793969659911941977`)  
> **Domain:** `nerdintheforest.com`  
> ** CMS Integration:** Payload CMS (`nitf_posts`, `nitf_trails`, `nitf_waypoints`, `nitf_locations`)

---

## 1. Brand & Style Concept

This design system channels the tactile precision of vintage Scandinavian topographical surveys, surveyor field notebooks, and rugged orienteering culture. It balances functional outdoor utility with editorial elegance, serving adventurers, cartography enthusiasts, and backcountry travelers.

### Core Aesthetic Pillars
- **Parchment and Craft Foundation:** Surfaces emulate high-grade weatherproof surveyor stock, unbleached kraft paper, and pressed botanical sheets (`#fef9ed`).
- **Topographical Utility:** Deliberate line weights, hairline contour elevation vectors, coordinate stamps (`[68°25'N • 018°39'E]`), and subtle dashed trail paths evoke hand-annotated field journals.
- **Orienteering Precision:** Crisp iconography and technical metadata ground rich narrative prose with surveyor accuracy.
- **Typography Contrast:** Editorial serif (`Newsreader`) narrative dispatches combined with technical monospace (`JetBrains Mono`) coordinate and telemetry readouts.

---

## 2. Color Palette & Tokens

### Primary & Accent Colors
| Token | Hex | Name | Application |
|---|---|---|---|
| `primary` / `primary-container` | `#1b2e24` | Nordic Deep Pine | Anchor hue, high-contrast typography, solid primary buttons, rule lines, dark map overlays. |
| `secondary` | `#d9531e` (`#ab3600`) | Orienteering Beacon Orange | High-visibility technical accent for active waypoints, current routes, live GPS pings, selected states, urgent notifications. |
| `tertiary` | `#526056` (`#0c1811`) | Lichen Slate | Desaturated mineral green-gray for topo vector contour lines, secondary metadata labels, muted borders, elevation grid indices. |

### Surface Hierarchy & Backgrounds
| Token | Hex | Role |
|---|---|---|
| `surface` / `background` / `surface-bright` | `#fef9ed` | Primary canvas backdrop simulating weather-treated cotton-rag parchment paper. |
| `surface-container-lowest` | `#ffffff` | Pure white highlight panels and inset content cards. |
| `surface-container-low` | `#f8f3e7` | Tonal substrate level 1. |
| `surface-container` | `#f3ede1` | Card & container surface. |
| `surface-container-high` | `#ede8dc` | Sheet panels, sidebars, drawer bases. |
| `surface-container-highest` / `surface-variant` | `#e7e2d6` | Recessed headers, chip backgrounds, tonal dividers. |
| `surface-dim` | `#dedace` | Muted background state. |

### Text & Outline Tokens
| Token | Hex | Role |
|---|---|---|
| `on-surface` | `#1d1c14` | Primary body text on light surface. |
| `on-surface-variant` | `#424844` | Secondary text, captions, author metadata. |
| `outline` | `#737874` | Standard structural borders. |
| `outline-variant` | `#c2c8c2` | Subtle hairline dividers and card outlines. |
| `on-primary` | `#ffffff` | Text on Nordic Deep Pine background. |
| `on-primary-container` | `#819689` | Muted pine tag text. |

---

## 3. Typography Specification

| Role | Font Family | Size | Weight | Line Height | Tracking | Usage |
|---|---|---|---|---|---|---|
| `headline-xl` | Newsreader | 48px (mob: 34px) | 400 | 56px (mob: 42px) | -0.02em | Hero titles, trail dossier titles |
| `headline-lg` | Newsreader | 36px (mob: 28px) | 400 | 44px (mob: 36px) | -0.015em | Major section headers, dispatch titles |
| `headline-md` | Newsreader | 26px | 500 | 34px | Normal | Card titles, modal headers |
| `headline-sm` | Newsreader | 20px | 500 | 28px | Normal | Subsection titles, drawer labels |
| `body-lg` | Newsreader | 19px | 400 | 30px | Normal | Lead paragraph in dispatches |
| `body-md` | Newsreader | 16px | 400 | 26px | Normal | Standard editorial body text |
| `body-sm` | Newsreader | 14px | 400 | 22px | Normal | Footnotes, secondary copy |
| `label-lg` | JetBrains Mono | 13px | 500 | 18px | 0.05em (UPPER) | Telemetry chips, action buttons |
| `label-md` | JetBrains Mono | 11px | 500 | 16px | 0.08em (UPPER) | Filter tags, waypoint markers |
| `label-sm` | JetBrains Mono | 10px | 400 | 14px | 0.10em (UPPER) | Coordinate stamps `[68°25'N • 018°39'E]`, spatial index |

---

## 4. Spacing & Layout System

### Grid System
- **Desktop (≥ 1024px):** Asymmetric split view. Fixed interactive 60% viewport map canvas paired with a 40% scrollable editorial field guide/sidebar, or 12-column grid with 24px gutters (`gutter-desktop`) and 48px outer margins (`margin-desktop`).
- **Tablet (768px – 1023px):** 8-column grid with 16px gutters and 32px side margins. Map overlays collapse into bottom floating sheet drawers.
- **Mobile (< 768px):** Single-column stacked or map-anchored viewport with an expandable bottom sheet drawer at 16px margins (`margin`).

### Spacing Scale
- `space-xs`: `0.25rem` (4px) — Telemetry chips, coordinate stamp padding.
- `space-sm`: `0.5rem` (8px) — Tag spacing, inline icon gaps.
- `space-md`: `1.0rem` (16px) — Card internal padding, component gaps.
- `space-lg`: `1.5rem` (24px) — Section spacing, panel padding.
- `space-xl`: `2.5rem` (40px) — Layout section dividers, hero margins.

---

## 5. Shapes & Elevation

- **Base Radius (`rounded` / 4px / `0.25rem`):** Applied to cards, technical inputs, waypoints, and image frames. Soft paper-cut precision.
- **Pill Radius (`rounded-full` / `9999px`):** Reserved for orienteering beacon tags, elevation badges, and floating status chips.
- **Elevation & Depth:**
  - Standard depth uses paper-tone contrast and hairline borders (`1px solid #c2c8c2`).
  - Active overlays use framed borders in `#1b2e24` (15% opacity) with warm ambient shadow (`box-shadow: 0 4px 12px rgba(27, 46, 36, 0.08)`).
  - Background contours feature faint SVG topo lines (`#526056` at 18% opacity).
  - Dashed path lines use `1px dashed #526056` (40% opacity).

---

## 6. Components Specification

1. **Summit Action Buttons (Primary):** Solid Nordic Pine (`#1b2e24`) background with parchment (`#f6f3eb`) text in uppercase `JetBrains Mono`.
2. **Trail Accent Buttons (Secondary):** Solid Orienteering Orange (`#d9531e`) for high-priority navigational cues ("Download GPX", "Start Route").
3. **Surveyor Utility Buttons (Outline):** Transparent background, 1px border (`#1b2e24` or `#526056`), monospaced text.
4. **Orienteering Filter Chips:** Pill geometry (`label-md` JetBrains Mono). Default `#ede8dc` surface with `#dfd7c5` outline. Active: `#1b2e24` background, `#f6f3eb` text, with an active dot in `#d9531e`.
5. **Elevation Cards & Field Dossiers:** Framed in `#ede8dc` with 1px `#dfd7c5` borders, faint topo background lines, and upper-right monospaced coordinate stamps.
6. **Surveyor Coordinate Stamp:** Monospaced coordinate pair boxed in square brackets: `[68°25'12.4"N 18°39'44.2"E]`.
7. **Elevation Sparkline / Profile:** Vector line (`#1b2e24`) with an amber beacon waypoint dot indicating current trail position.

---

## 7. Stitch Screen Inventory

| Screen Title | Device | Stitch Screen ID | Description |
|---|---|---|---|
| **Nordic Atlas - Browse Mode** | Desktop | `a93cc7f0c2754204a827ca61b9faeec6` | Main interactive map canvas (60%) with collapsed search & filter console (40%). |
| **Nordic Atlas - Docked Sidebar Dossier Card** | Desktop | `769ed1fdce9c4e7f9217667254ae0b9f` | Interactive map view with location dossier preview card docked on the right sidebar. |
| **Field Dossier - Panoramic Hero & 3-Column Field Gallery** | Desktop | `61e99a6692c74630a9eb37e5140c80f9` | Full trail/location dossier page with elevation profile, waypoints timeline, gallery grid, and dispatches. |
| **Backcountry Gear Ledger** | Desktop | `e1c382e0132748d78924ea6302aa4427` | Gear index and equipment ledger categorized by season and terrain type. |
| **Field Dispatches & Dossier Archive** | Desktop | `6de42457de594382b82fb4518182b3c7` | Blog posts archive, field notes list, search bar, and tag filter chips. |
| **Nordic Atlas Mobile - Peeking Recent Tray** | Mobile | `5aa410902c584116a8582521266216ea` | Mobile map view with a peeking bottom tray of recent waypoints and bottom action bar. |
| **Nordic Atlas Mobile - Standardized Dossier Sheet** | Mobile | `b7a4400204a147c7911131436f96a414` | Expanded mobile bottom sheet drawer containing location details and elevation profile. |
| **Mobile Field Dossier** | Mobile | `c63f2fb3d2a546769a60d0449592d7ee` | Single-column mobile trail dossier with hero banner, interactive waypoints, and photo grid. |
| **Nordic Atlas Mobile - Active Filter Sheet Modal** | Mobile | `047b6464e21d492293074570a324b062` | Mobile filter drawer modal for filtering trails by difficulty, distance, and terrain type. |
| **Mobile Backcountry Gear Ledger** | Mobile | `2bdb5a55a52b4f8fbf3d9426d274ebcd` | Mobile gear ledger view with collapsible seasonal sections. |
