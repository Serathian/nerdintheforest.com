<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { calculateReadTime, formatDispatchDateRange } from '~/utils/formatters'
import { haversineKm, formatDistance, polylineDistanceKm, splitRouteWithRemainder } from '~/utils/geo'
import type { Dispatch, Location, Loadout } from '~/types/models'

const route = useRoute()
const router = useRouter()
const slug = computed(() => String(route.params.slug || ''))

const { dispatches, locations, loadouts, fetchLocationBySlug, fetchDispatchBySlug, fetchPosts, fetchWaypoints, fetchLoadouts } = useNitfCms()

const { data: asyncDispatch } = await useAsyncData(
  `dispatch-article-${slug.value}`,
  async () => {
    await Promise.all([
      fetchPosts(),
      fetchWaypoints(),
      fetchLoadouts()
    ])
    return await fetchDispatchBySlug(slug.value)
  },
  { watch: [slug] }
)

const currentDispatch = computed<Dispatch | null>(() => {
  return asyncDispatch.value || dispatches.value.find(d => d.slug === slug.value || d.id === slug.value) || null
})

const linkedLoadout = computed<Loadout | null>(() => {
  const lRef = currentDispatch.value?.loadout
  if (!lRef) return null
  if (typeof lRef === 'object' && lRef !== null) {
    return lRef as Loadout
  }
  const refStr = String(lRef)
  return (
    loadouts.value.find(l => l.slug === refStr || String(l.id) === refStr) ||
    null
  )
})

// Resolve linked locations visited on this outing
const linkedLocations = computed<Location[]>(() => {
  if (!currentDispatch.value || !Array.isArray(currentDispatch.value.locations)) return []
  const result: Location[] = []

  for (const locRef of currentDispatch.value.locations) {
    const locId = typeof locRef === 'object' && locRef !== null ? (locRef.slug || locRef.id) : String(locRef)
    const found = locations.value.find(
      l => l.slug === locId || l.id === locId || (locRef?.cmsId && l.id === locRef.cmsId)
    )
    if (found) {
      result.push(found)
    } else if (typeof locRef === 'object' && locRef !== null && (locRef.name || locRef.title)) {
      result.push({
        id: String(locRef.slug || locRef.id),
        slug: String(locRef.slug || locRef.id),
        name: locRef.name || locRef.title,
        area: locRef.area || 'pirkanmaa',
        category: (locRef.category || 'shelter').toLowerCase() as any,
        latitude: locRef.latitude ?? 61.4,
        longitude: locRef.longitude ?? 23.9,
        elevation: locRef.elevation,
        summary: locRef.summary || '',
        amenities: []
      })
    }
  }

  return result
})

interface DispatchLegItem {
  index: number
  letter: string
  distanceKm: number
  distanceFormatted: string
}

const dispatchRouteSplit = computed(() => {
  const rawGeom: Array<[number, number]> | undefined =
    currentDispatch.value?.trailGeometry || (currentDispatch.value as any)?.trail_geometry
  const hasGpx = Array.isArray(rawGeom) && rawGeom.length >= 2
  const wpCoords = linkedLocations.value.map(l => ({ lng: l.longitude ?? 0, lat: l.latitude ?? 0 }))
  const split = splitRouteWithRemainder(hasGpx ? rawGeom : undefined, wpCoords)
  return { hasGpx, ...split }
})

const dispatchPrefixLeg = computed<DispatchLegItem | null>(() => {
  if (linkedLocations.value.length === 0) return null
  const { hasGpx, prefix } = dispatchRouteSplit.value
  if (!hasGpx || !prefix || prefix.length < 2) return null
  const distKm = polylineDistanceKm(prefix)
  if (distKm < 0.05) return null
  return {
    index: -1,
    letter: 'START',
    distanceKm: distKm,
    distanceFormatted: formatDistance(distKm)
  }
})

const dispatchLegs = computed<DispatchLegItem[]>(() => {
  const list: DispatchLegItem[] = []
  if (linkedLocations.value.length < 2) return list

  const { hasGpx, legs: splitLegs } = dispatchRouteSplit.value

  for (let i = 0; i < linkedLocations.value.length - 1; i++) {
    const from = linkedLocations.value[i]
    const to = linkedLocations.value[i + 1]
    let distKm = 0
    if (hasGpx && splitLegs[i] && splitLegs[i].length >= 2) {
      distKm = polylineDistanceKm(splitLegs[i])
    } else if (from.longitude != null && from.latitude != null && to.longitude != null && to.latitude != null) {
      distKm = haversineKm([from.longitude, from.latitude], [to.longitude, to.latitude])
    }
    list.push({
      index: i,
      letter: String.fromCharCode(65 + i),
      distanceKm: distKm,
      distanceFormatted: formatDistance(distKm)
    })
  }
  return list
})

const dispatchSuffixLeg = computed<DispatchLegItem | null>(() => {
  if (linkedLocations.value.length === 0) return null
  const { hasGpx, suffix } = dispatchRouteSplit.value
  if (!hasGpx || !suffix || suffix.length < 2) return null
  const distKm = polylineDistanceKm(suffix)
  if (distKm < 0.05) return null
  const lastIdx = linkedLocations.value.length - 1
  return {
    index: lastIdx,
    letter: String.fromCharCode(65 + lastIdx),
    distanceKm: distKm,
    distanceFormatted: formatDistance(distKm)
  }
})

function getCategoryIcon(cat?: string): string {
  const c = (cat || '').toLowerCase()
  if (c.includes('shelter')) return 'cabin'
  if (c.includes('hearth') || c.includes('fire')) return 'outdoor_grill'
  if (c.includes('spring') || c.includes('water')) return 'water_drop'
  if (c.includes('view') || c.includes('vista') || c.includes('summit')) return 'landscape'
  if (c.includes('trailhead') || c.includes('parking')) return 'directions_car'
  return 'explore'
}

const readTime = computed(() => {
  if (!currentDispatch.value) return '3 MIN READ'
  return calculateReadTime(currentDispatch.value.content)
})

const publishedDateFormatted = computed(() => {
  if (!currentDispatch.value?.publishedAt) return 'RECENT'
  return new Date(currentDispatch.value.publishedAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
})

const expeditionDateSpanFormatted = computed(() => {
  if (!currentDispatch.value) return ''
  return formatDispatchDateRange(
    currentDispatch.value.startDate,
    currentDispatch.value.endDate,
    currentDispatch.value.publishedAt
  )
})

const heroImageUrl = computed(() => {
  if (!currentDispatch.value) return ''
  const img = currentDispatch.value.heroImage
  if (typeof img === 'object' && img !== null) {
    return img.url
  }
  return String(img || 'https://images.unsplash.com/photo-1510312305653-8ed496efae75?auto=format&fit=crop&w=1200&q=80')
})

const shareNotification = ref<string | null>(null)
const activePhotoIndex = ref<number | null>(null)
const dispatchGalleryRef = ref<HTMLElement | null>(null)

function scrollDispatchGallery(direction: 'prev' | 'next') {
  const el = dispatchGalleryRef.value
  if (!el) return
  const cardWidth = el.querySelector('.gallery-item')?.clientWidth || 320
  const scrollAmount = (cardWidth + 16) * (direction === 'next' ? 1 : -1)
  el.scrollBy({ left: scrollAmount, behavior: 'smooth' })
}

function stepLightboxPhoto(direction: 'prev' | 'next') {
  const gallery = currentDispatch.value?.gallery
  if (activePhotoIndex.value === null || !gallery || gallery.length === 0) return
  const total = gallery.length
  if (direction === 'next') {
    activePhotoIndex.value = (activePhotoIndex.value + 1) % total
  } else {
    activePhotoIndex.value = (activePhotoIndex.value - 1 + total) % total
  }
}

function copyShareUrl() {
  if (typeof window !== 'undefined') {
    navigator.clipboard.writeText(window.location.href)
    shareNotification.value = 'Dispatch link copied to clipboard'
    setTimeout(() => {
      shareNotification.value = null
    }, 2500)
  }
}

function openInAtlas() {
  if (currentDispatch.value) {
    router.push(`/?dispatch=${currentDispatch.value.slug || currentDispatch.value.id}`)
  } else {
    router.push('/')
  }
}

// SEO & Structured Data (JSON-LD)
const pageTitle = computed(() => {
  if (!currentDispatch.value) return 'Field Dispatch — Nerd in the Forest'
  return `${currentDispatch.value.title} — Backcountry Field Dispatch | Nerd in the Forest`
})

const pageDescription = computed(() => {
  if (!currentDispatch.value) return 'Nordic backcountry survey notes and field expedition dispatches.'
  return currentDispatch.value.excerpt || 'Backcountry field note written during Nordic wilderness survey.'
})

useHead({
  title: pageTitle,
  meta: [
    { name: 'description', content: pageDescription },
    { property: 'og:title', content: pageTitle },
    { property: 'og:description', content: pageDescription },
    { property: 'og:image', content: heroImageUrl },
    { property: 'og:type', content: 'article' },
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: pageTitle },
    { name: 'twitter:description', content: pageDescription },
    { name: 'twitter:image', content: heroImageUrl }
  ],
  script: computed(() => {
    if (!currentDispatch.value) return []
    const jsonLd = {
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      'headline': currentDispatch.value.title,
      'description': currentDispatch.value.excerpt,
      'image': heroImageUrl.value,
      'datePublished': currentDispatch.value.publishedAt,
      'author': {
        '@type': 'Person',
        'name': 'Jake Reddy'
      },
      'publisher': {
        '@type': 'Organization',
        'name': 'Nerd in the Forest',
        'url': 'https://nerdintheforest.com'
      }
    }
    return [
      {
        type: 'application/ld+json',
        children: JSON.stringify(jsonLd)
      }
    ]
  })
})
</script>

<template>
  <div class="dispatch-page">
    <!-- Top Sticky Surveyor Navigation Bar -->
    <header class="dispatch-nav">
      <div class="nav-container">
        <button
          class="nav-back-btn font-mono"
          type="button"
          @click="openInAtlas"
        >
          <span class="material-symbols-outlined text-[16px]">arrow_back</span>
          <span>ATLAS MAP</span>
        </button>

        <div class="nav-breadcrumbs font-mono">
          <span class="crumb-dim">FIELD LEDGER</span>
          <span class="crumb-sep">/</span>
          <span class="crumb-active">DISPATCH</span>
        </div>

        <div class="nav-actions">
          <button
            class="nav-map-btn font-mono"
            type="button"
            title="Explore on Interactive Map"
            @click="openInAtlas"
          >
            <span class="material-symbols-outlined text-[15px]">explore</span>
            <span class="action-text">VIEW ON MAP</span>
          </button>

          <button
            class="nav-share-btn font-mono"
            type="button"
            title="Share Dispatch"
            @click="copyShareUrl"
          >
            <span class="material-symbols-outlined text-[15px]">share</span>
            <span class="action-text">SHARE</span>
          </button>
        </div>
      </div>
    </header>

    <!-- Main Content Stream -->
    <main v-if="currentDispatch" class="dispatch-body">
      <article class="dispatch-article">
        <!-- Hero Image Banner -->
        <div v-if="heroImageUrl" class="dispatch-hero">
          <img
            :src="heroImageUrl"
            :alt="currentDispatch.title"
            class="hero-img"
          />
          <div class="hero-overlay" />
        </div>

        <!-- Article Header -->
        <header class="article-header">
          <!-- Article Publication Metadata (Publish Date & Read Time) -->
          <div class="article-meta-bar font-mono">
            <span class="meta-item">
              <span class="material-symbols-outlined meta-icon">calendar_today</span>
              <span>PUBLISHED {{ publishedDateFormatted.toUpperCase() }}</span>
            </span>
            <span class="meta-dot">•</span>
            <span class="meta-item">
              <span class="material-symbols-outlined meta-icon">schedule</span>
              <span>{{ readTime }}</span>
            </span>
          </div>

          <h1 class="article-title font-serif">
            {{ currentDispatch.title }}
          </h1>

          <!-- Dispatch Entry Field Telemetry (Expedition Date Span, Weather & Carried Loadout) -->
          <div class="dispatch-entry-badges font-mono">
            <span v-if="expeditionDateSpanFormatted" class="entry-badge expedition-dates" title="Expedition Date Span">
              <span class="material-symbols-outlined badge-icon">date_range</span>
              <span>EXPEDITION: {{ expeditionDateSpanFormatted }}</span>
            </span>
            <span v-if="currentDispatch.weather" class="entry-badge weather-cond" title="Field Weather Conditions">
              <span class="material-symbols-outlined badge-icon">partly_cloudy_day</span>
              <span>{{ currentDispatch.weather }}</span>
            </span>
            <NuxtLink
              v-if="linkedLoadout"
              :to="`/gear?tab=gear&loadout=${linkedLoadout.slug || linkedLoadout.id}`"
              class="entry-badge loadout-carried"
              :title="`Inspect ${linkedLoadout.title} loadout in Gear Ledger`"
            >
              <span class="material-symbols-outlined badge-icon">backpack</span>
              <span>LOADOUT: {{ linkedLoadout.title.toUpperCase() }}</span>
              <span class="material-symbols-outlined text-[12px]">arrow_forward</span>
            </NuxtLink>
          </div>

          <p class="article-lead font-serif">
            {{ currentDispatch.excerpt }}
          </p>

          <!-- Surveyed Locations Visited on this Outing (Dispatch Route Inspection Timeline) -->
          <div v-if="linkedLocations.length > 0" class="visited-locations-panel font-mono">
            <div class="locations-header">
              <div class="locations-title-group">
                <span class="material-symbols-outlined text-[15px] text-secondary">route</span>
                <span class="locations-label">VISITED LOCATIONS ({{ linkedLocations.length }})</span>
              </div>

              <button
                class="inspect-route-btn font-mono"
                type="button"
                title="Open Dispatch Route Inspection mode on the Atlas Map"
                @click="openInAtlas"
              >
                <span class="material-symbols-outlined text-[13px]">explore</span>
                <span>INSPECT ROUTE ON ATLAS</span>
              </button>
            </div>

            <!-- Sequential Timeline Stepper Track (matches MobileDispatchInspectionPeek) -->
            <div class="timeline-stepper-track scrollbar-none">
              <div class="timeline-row">
                <div
                  v-if="dispatchPrefixLeg"
                  class="timeline-leg-connector is-prefix font-mono"
                  role="button"
                  tabindex="0"
                  :title="`Inspect Start Leg (${dispatchPrefixLeg.distanceFormatted}) on Atlas Map`"
                  @click="openInAtlas"
                  @keydown.enter.prevent="openInAtlas"
                  @keydown.space.prevent="openInAtlas"
                >
                  <span class="leg-terminal-dot start" />
                  <span class="leg-connector-line" />
                  <span class="leg-dist-pill">
                    <span class="leg-dist-text">{{ dispatchPrefixLeg.distanceFormatted }}</span>
                  </span>
                </div>

                <template v-for="(loc, idx) in linkedLocations" :key="loc.id">
                  <!-- Waypoint Chip -->
                  <NuxtLink
                    :to="`/locations/${loc.slug || loc.id}`"
                    class="timeline-step-chip font-mono"
                    :title="`Open ${loc.name} survey dossier`"
                  >
                    <div class="step-chip-top">
                      <div class="step-chip-meta">
                        <span class="step-order-badge">{{ idx + 1 }}</span>
                        <span class="material-symbols-outlined step-cat-icon">
                          {{ getCategoryIcon(loc.category) }}
                        </span>
                      </div>
                      <span v-if="loc.elevation" class="step-elev" title="Elevation">
                        <span class="material-symbols-outlined step-elev-icon">terrain</span>
                        <span>{{ loc.elevation }}m</span>
                      </span>
                    </div>

                    <span class="step-title font-serif">
                      {{ loc.name }}
                    </span>
                  </NuxtLink>

                  <!-- Minimal Leg Connector Line between waypoints -->
                  <div
                    v-if="idx < linkedLocations.length - 1 && dispatchLegs[idx]"
                    class="timeline-leg-connector font-mono"
                    role="button"
                    tabindex="0"
                    :title="`Inspect Leg ${dispatchLegs[idx].letter} (${dispatchLegs[idx].distanceFormatted}) on Atlas Map`"
                    @click="openInAtlas"
                    @keydown.enter.prevent="openInAtlas"
                    @keydown.space.prevent="openInAtlas"
                  >
                    <span class="leg-connector-line" />
                    <span class="leg-dist-pill">
                      <span class="leg-dist-text">{{ dispatchLegs[idx].distanceFormatted }}</span>
                    </span>
                  </div>
                </template>

                <div
                  v-if="dispatchSuffixLeg"
                  class="timeline-leg-connector is-suffix font-mono"
                  role="button"
                  tabindex="0"
                  :title="`Inspect Finish Leg (${dispatchSuffixLeg.distanceFormatted}) on Atlas Map`"
                  @click="openInAtlas"
                  @keydown.enter.prevent="openInAtlas"
                  @keydown.space.prevent="openInAtlas"
                >
                  <span class="leg-connector-line" />
                  <span class="leg-dist-pill">
                    <span class="leg-dist-text">{{ dispatchSuffixLeg.distanceFormatted }}</span>
                  </span>
                  <span class="leg-terminal-dot end" />
                </div>
              </div>
            </div>
          </div>

          <div class="article-divider" />
        </header>

        <!-- Rich Narrative Body -->
        <div class="article-content font-serif">
          <template v-if="Array.isArray(currentDispatch.content)">
            <p
              v-for="(para, pIdx) in currentDispatch.content"
              :key="pIdx"
              class="content-paragraph"
            >
              {{ para }}
            </p>
          </template>
          <template v-else-if="typeof currentDispatch.content === 'string'">
            <p class="content-paragraph">{{ currentDispatch.content }}</p>
          </template>
        </div>

        <!-- Trip Gallery & Survey Captures (if available) -->
        <section
          v-if="currentDispatch.gallery && currentDispatch.gallery.length > 0"
          class="dispatch-gallery-section"
        >
          <div class="gallery-title-row font-mono">
            <div class="flex items-center gap-2">
              <span class="material-symbols-outlined text-secondary">photo_camera</span>
              <h2>EXPEDITION FIELD CAPTURES ({{ currentDispatch.gallery.length }})</h2>
            </div>

            <div v-if="currentDispatch.gallery.length > 1" class="gallery-controls">
              <button
                class="gallery-nav-btn"
                type="button"
                aria-label="Scroll photos left"
                @click="scrollDispatchGallery('prev')"
              >
                <span class="material-symbols-outlined text-[16px]">chevron_left</span>
              </button>
              <button
                class="gallery-nav-btn"
                type="button"
                aria-label="Scroll photos right"
                @click="scrollDispatchGallery('next')"
              >
                <span class="material-symbols-outlined text-[16px]">chevron_right</span>
              </button>
            </div>
          </div>

          <div ref="dispatchGalleryRef" class="gallery-track">
            <figure
              v-for="(item, gIdx) in currentDispatch.gallery"
              :key="gIdx"
              class="gallery-item"
              @click="activePhotoIndex = gIdx"
            >
              <div class="gallery-img-wrap">
                <img
                  :src="typeof item.image === 'object' && item.image ? (item.image as any).url : String(item.image)"
                  :alt="item.caption || 'Field Survey Photo'"
                  loading="lazy"
                  class="gallery-img"
                />
                <div class="gallery-overlay">
                  <span class="material-symbols-outlined zoom-icon">zoom_in</span>
                </div>
              </div>
              <figcaption class="gallery-caption font-mono">
                <span class="caption-text">{{ item.caption }}</span>
                <span v-if="item.location" class="caption-loc">
                  📍 {{ typeof item.location === 'object' ? (item.location as any).name : item.location }}
                </span>
              </figcaption>
            </figure>
          </div>
        </section>

        <!-- Bottom Action Direct Banner -->
        <div class="bottom-action-banner font-mono">
          <div class="banner-inner">
            <span class="banner-tag">EXPEDITION COMPLETE</span>
            <h3 class="banner-title font-serif">Track this route in the interactive surveyor atlas</h3>
            <button
              class="banner-btn font-mono"
              type="button"
              @click="openInAtlas"
            >
              <span class="material-symbols-outlined">explore</span>
              <span>LAUNCH ATLAS MAP</span>
            </button>
          </div>
        </div>
      </article>
    </main>

    <!-- Not Found State -->
    <div v-else class="not-found-state font-mono">
      <span class="material-symbols-outlined text-[48px] text-secondary">menu_book</span>
      <h1 class="font-serif text-2xl mt-3 text-on-surface">Dispatch Not Found</h1>
      <p class="text-sm text-on-surface-variant max-w-md mt-2">
        The expedition dispatch with slug "{{ slug }}" could not be retrieved from the field archives.
      </p>
      <NuxtLink to="/ledger" class="primary-action-btn font-mono mt-6 inline-flex">
        <span class="material-symbols-outlined text-[16px]">arrow_back</span>
        <span>RETURN TO FIELD LEDGER</span>
      </NuxtLink>
    </div>

    <!-- Toast Notification -->
    <Transition name="fade">
      <div v-if="shareNotification" class="toast-notification font-mono">
        <span class="toast-dot">●</span>
        {{ shareNotification }}
      </div>
    </Transition>

    <!-- Photo Lightbox Modal -->
    <Teleport to="body">
      <div
        v-if="activePhotoIndex !== null && currentDispatch?.gallery?.[activePhotoIndex]"
        class="lightbox-overlay"
        @click="activePhotoIndex = null"
      >
        <button
          class="lightbox-close font-mono"
          type="button"
          aria-label="Close photo"
          @click.stop="activePhotoIndex = null"
        >
          <span class="material-symbols-outlined">close</span>
        </button>

        <button
          v-if="currentDispatch.gallery.length > 1"
          class="lightbox-nav-btn prev"
          type="button"
          aria-label="Previous photo"
          @click.stop="stepLightboxPhoto('prev')"
        >
          <span class="material-symbols-outlined">chevron_left</span>
        </button>

        <div class="lightbox-content" @click.stop>
          <img
            :src="typeof currentDispatch.gallery[activePhotoIndex].image === 'object' ? (currentDispatch.gallery[activePhotoIndex].image as any).url : String(currentDispatch.gallery[activePhotoIndex].image)"
            :alt="currentDispatch.gallery[activePhotoIndex].caption || 'Field Photo'"
            class="lightbox-image"
          />
          <div class="lightbox-caption font-mono">
            <p class="caption-text font-serif">{{ currentDispatch.gallery[activePhotoIndex].caption }}</p>
            <div class="caption-sub-row">
              <span v-if="currentDispatch.gallery[activePhotoIndex].location" class="caption-sub">
                {{ typeof currentDispatch.gallery[activePhotoIndex].location === 'object'
                  ? (currentDispatch.gallery[activePhotoIndex].location as any).name
                  : currentDispatch.gallery[activePhotoIndex].location }}
              </span>
              <span v-else class="caption-sub">{{ currentDispatch.title }}</span>
              <span class="caption-sub">{{ activePhotoIndex + 1 }} / {{ currentDispatch.gallery.length }}</span>
            </div>
          </div>
        </div>

        <button
          v-if="currentDispatch.gallery.length > 1"
          class="lightbox-nav-btn next"
          type="button"
          aria-label="Next photo"
          @click.stop="stepLightboxPhoto('next')"
        >
          <span class="material-symbols-outlined">chevron_right</span>
        </button>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.dispatch-page {
  min-height: 100vh;
  background-color: var(--color-surface, #fef9ed);
  color: var(--color-on-surface, #1d1c14);
  padding-bottom: 80px;
}

/* TOP NAV */
.dispatch-nav {
  position: sticky;
  top: 0;
  z-index: 50;
  background-color: rgba(254, 249, 237, 0.95);
  backdrop-filter: blur(8px);
  border-bottom: 1px solid var(--color-outline-variant, #c2c8c2);
}

.nav-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 12px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.nav-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.nav-back-btn,
.nav-map-btn,
.nav-share-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: transparent;
  border: 1px solid var(--color-outline-variant, #c2c8c2);
  border-radius: 4px;
  padding: 6px 12px;
  font-size: 11px;
  font-weight: 500;
  color: var(--color-on-surface, #1d1c14);
  cursor: pointer;
  transition: all 0.2s ease;
}

.nav-back-btn:hover,
.nav-map-btn:hover,
.nav-share-btn:hover {
  background-color: var(--color-surface-container, #f3ede1);
  border-color: var(--color-secondary, #d9531e);
  color: var(--color-secondary, #d9531e);
}

.nav-breadcrumbs {
  font-size: 11px;
  font-weight: 500;
  display: none;
}

@media (min-width: 640px) {
  .nav-breadcrumbs {
    display: inline-flex;
    align-items: center;
    gap: 6px;
  }
}

.crumb-dim {
  color: var(--color-tertiary, #526056);
}

.crumb-sep {
  color: var(--color-outline-variant, #c2c8c2);
}

.crumb-active {
  color: var(--color-secondary, #d9531e);
  font-weight: 600;
}

/* BODY & HERO */
.dispatch-body {
  max-width: 800px;
  margin: 0 auto;
  padding: 24px 20px;
}

.dispatch-article {
  background-color: var(--color-surface-container-lowest, #ffffff);
  border: 1px solid var(--color-outline-variant, #c2c8c2);
  border-radius: 6px;
  overflow: hidden;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);
}

.dispatch-hero {
  position: relative;
  width: 100%;
  height: 320px;
  background-color: #1b2e24;
}

@media (min-width: 640px) {
  .dispatch-hero {
    height: 400px;
  }
}

.hero-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.hero-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(27, 46, 36, 0.15) 0%, rgba(27, 46, 36, 0.75) 100%);
}

/* ARTICLE HEADER */
.article-header {
  padding: 28px 24px 12px;
}

@media (min-width: 640px) {
  .article-header {
    padding: 36px 36px 16px;
  }
}

.article-meta-bar {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 0.04em;
  color: var(--color-tertiary, #526056);
  margin-bottom: 10px;
}

.meta-item {
  display: inline-flex;
  align-items: center;
  gap: 5px;
}

.meta-icon {
  font-size: 13px;
  opacity: 0.75;
}

.meta-dot {
  color: var(--color-outline-variant, #c2c8c2);
}

.article-title {
  font-size: 28px;
  line-height: 1.2;
  color: var(--color-on-surface, #1d1c14);
  margin-bottom: 14px;
}

@media (min-width: 640px) {
  .article-title {
    font-size: 38px;
  }
}

.dispatch-entry-badges {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 18px;
}

.entry-badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 10px;
  border-radius: 4px;
  font-size: 10.5px;
  font-weight: 700;
  letter-spacing: 0.05em;
}

.entry-badge.expedition-dates {
  background-color: var(--color-surface-container, #f3ede1);
  border: 1px solid var(--color-outline-variant, #c2c8c2);
  color: var(--color-primary, #1b2e24);
}

.entry-badge.expedition-dates .badge-icon {
  color: var(--color-secondary, #d9531e);
}

.entry-badge.loadout-carried {
  background-color: rgba(217, 83, 30, 0.08);
  border: 1px solid rgba(217, 83, 30, 0.35);
  color: var(--color-primary, #1b2e24);
  text-decoration: none;
  cursor: pointer;
  transition: all 0.15s ease;
}

.entry-badge.loadout-carried:hover {
  background-color: rgba(217, 83, 30, 0.15);
  border-color: var(--color-secondary, #d9531e);
  color: var(--color-secondary, #d9531e);
}

.entry-badge.loadout-carried .badge-icon {
  color: var(--color-secondary, #d9531e);
}

.entry-badge.weather-cond {
  background-color: rgba(217, 83, 30, 0.1);
  border: 1px solid rgba(217, 83, 30, 0.35);
  color: var(--color-secondary, #d9531e);
}

.badge-icon {
  font-size: 14px;
}

.article-lead {
  font-size: 17px;
  line-height: 1.55;
  color: var(--color-on-surface-variant, #424844);
  margin-bottom: 24px;
}

/* VISITED LOCATIONS PANEL */
.visited-locations-panel {
  background-color: var(--color-surface-container, #f3ede1);
  border: 1px solid var(--color-outline-variant, #c2c8c2);
  border-radius: 4px;
  padding: 14px;
  margin-bottom: 24px;
}

.locations-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: nowrap;
  gap: 8px;
  margin-bottom: 10px;
}

.locations-title-group {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  min-width: 0;
}

.locations-label {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.06em;
  color: var(--color-primary, #1b2e24);
  white-space: nowrap;
}

.inspect-route-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background-color: rgba(217, 83, 30, 0.12);
  border: 1px solid rgba(217, 83, 30, 0.4);
  color: var(--color-secondary, #d9531e);
  border-radius: 4px;
  padding: 3px 8px;
  font-size: 9.5px;
  font-weight: 700;
  letter-spacing: 0.04em;
  white-space: nowrap;
  flex-shrink: 0;
  cursor: pointer;
  transition: all 0.15s ease;
}

.inspect-route-btn:hover {
  background-color: var(--color-secondary, #d9531e);
  color: #ffffff;
  border-color: var(--color-secondary, #d9531e);
}

/* TIMELINE STEPPER (matches MobileDispatchInspectionPeek) */
.timeline-stepper-track {
  width: 100%;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  padding: 4px 0 6px;
}

.timeline-row {
  display: flex;
  align-items: center;
  gap: 0;
  min-width: min-content;
}

.timeline-step-chip {
  position: relative;
  background-color: var(--color-surface-container-low, #f8f3e7);
  border: 1px solid var(--color-outline-variant, #c2c8c2);
  border-radius: 6px;
  padding: 5px 8px;
  display: flex;
  flex-direction: column;
  gap: 3px;
  cursor: pointer;
  transition: all 0.16s ease;
  user-select: none;
  box-sizing: border-box;
  width: 132px;
  min-width: 120px;
  max-width: 148px;
  flex-shrink: 0;
  text-decoration: none;
}

.timeline-step-chip:hover {
  background-color: #fef9ed;
  border-color: var(--color-secondary, #d9531e);
  transform: translateY(-1px);
  box-shadow: 0 3px 10px rgba(217, 83, 30, 0.14);
}

.step-chip-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  gap: 4px;
}

.step-chip-meta {
  display: flex;
  align-items: center;
  gap: 4px;
}

.step-order-badge {
  background-color: var(--color-secondary, #d9531e);
  color: #ffffff;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 9px;
  flex-shrink: 0;
}

.step-cat-icon {
  font-size: 13px;
  color: var(--color-primary, #1b2e24);
  flex-shrink: 0;
}

.step-elev {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  font-size: 9px;
  font-weight: 700;
  color: var(--color-tertiary, #526056);
  flex-shrink: 0;
  background-color: rgba(82, 96, 86, 0.08);
  padding: 1px 4px;
  border-radius: 3px;
  line-height: 1;
}

.step-elev-icon {
  font-size: 11px;
  line-height: 1;
  color: var(--color-secondary, #d9531e);
}

.step-title {
  font-size: 11.5px;
  line-height: 1.25;
  color: var(--color-on-surface, #1d1c14);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 100%;
  text-align: left;
}

.timeline-leg-connector {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 44px;
  height: 44px;
  padding: 0 5px;
  cursor: pointer;
  user-select: none;
  flex-shrink: 0;
}

.leg-connector-line {
  position: absolute;
  left: 0;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  height: 0;
  border-top: 1.5px dashed var(--color-outline-variant, #c2c8c2);
  transition: all 0.16s ease;
}

.timeline-leg-connector:hover .leg-connector-line {
  border-top-color: var(--color-secondary, #d9531e);
}

.leg-dist-pill {
  position: relative;
  z-index: 4;
  display: inline-flex;
  align-items: center;
  gap: 3px;
  padding: 2px 5px;
  border-radius: 9999px;
  background-color: var(--color-surface-container-low, #f8f3e7);
  border: 1px solid var(--color-outline-variant, #c2c8c2);
  box-shadow: 0 1px 2px rgba(27, 46, 36, 0.08);
  transition: all 0.16s ease;
}

.timeline-leg-connector:hover .leg-dist-pill {
  background-color: #fef9ed;
  border-color: var(--color-secondary, #d9531e);
  transform: translateY(-1px);
  box-shadow: 0 2px 5px rgba(217, 83, 30, 0.16);
}

.leg-dist-text {
  font-size: 8.5px;
  font-weight: 700;
  letter-spacing: 0.02em;
  line-height: 1;
  color: var(--color-tertiary, #526056);
  white-space: nowrap;
  transition: color 0.15s ease;
}

.timeline-leg-connector:hover .leg-dist-text {
  color: var(--color-secondary, #d9531e);
}

.timeline-leg-connector.is-prefix {
  padding-left: 10px;
}

.timeline-leg-connector.is-suffix {
  padding-right: 10px;
}

.leg-terminal-dot {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background-color: var(--color-outline-variant, #c2c8c2);
  border: 1.5px solid var(--color-surface-container-low, #f8f3e7);
  z-index: 4;
  transition: all 0.16s ease;
}

.leg-terminal-dot.start {
  left: 0;
}

.leg-terminal-dot.end {
  right: 0;
}

.timeline-leg-connector:hover .leg-terminal-dot {
  background-color: var(--color-secondary, #d9531e);
  transform: translateY(-50%) scale(1.15);
}

.article-divider {
  width: 100%;
  height: 1px;
  background-color: var(--color-outline-variant, #c2c8c2);
  margin-top: 20px;
}

/* CONTENT BODY */
.article-content {
  padding: 12px 24px 28px;
}

@media (min-width: 640px) {
  .article-content {
    padding: 16px 36px 36px;
  }
}

.content-paragraph {
  font-size: 17px;
  line-height: 1.75;
  color: var(--color-on-surface, #1d1c14);
  margin-bottom: 20px;
}

.content-paragraph:first-child::first-letter {
  font-size: 44px;
  line-height: 1;
  float: left;
  margin-right: 8px;
  font-weight: 500;
  color: var(--color-secondary, #d9531e);
}

/* GALLERY */
.dispatch-gallery-section {
  padding: 0 24px 32px;
}

@media (min-width: 640px) {
  .dispatch-gallery-section {
    padding: 0 36px 36px;
  }
}

.gallery-title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  border-bottom: 1px solid var(--color-outline-variant, #c2c8c2);
  padding-bottom: 10px;
  margin-bottom: 18px;
}

.gallery-title-row h2 {
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.08em;
  color: var(--color-primary, #1b2e24);
}

.gallery-controls {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.gallery-nav-btn {
  width: 28px;
  height: 28px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background-color: var(--color-surface-container-low, #f8f3e7);
  border: 1px solid var(--color-outline-variant, #c2c8c2);
  border-radius: 4px;
  color: var(--color-primary, #1b2e24);
  cursor: pointer;
  transition: all 0.15s ease;
}

.gallery-nav-btn:hover {
  background-color: var(--color-surface-container, #f3ede1);
  border-color: var(--color-secondary, #d9531e);
  color: var(--color-secondary, #d9531e);
}

.gallery-track {
  display: flex;
  gap: 16px;
  overflow-x: auto;
  overscroll-behavior-x: contain;
  scroll-snap-type: x mandatory;
  -webkit-overflow-scrolling: touch;
  padding-bottom: 12px;
  scrollbar-width: thin;
  scrollbar-color: var(--color-outline-variant, #c2c8c2) transparent;
}

.gallery-track::-webkit-scrollbar {
  height: 6px;
}

.gallery-track::-webkit-scrollbar-track {
  background: transparent;
}

.gallery-track::-webkit-scrollbar-thumb {
  background-color: var(--color-outline-variant, #c2c8c2);
  border-radius: 999px;
}

.gallery-item {
  flex: 0 0 82%;
  max-width: 340px;
  scroll-snap-align: start;
  display: flex;
  flex-direction: column;
  background-color: var(--color-surface-container, #f3ede1);
  border: 1px solid var(--color-outline-variant, #c2c8c2);
  border-radius: 4px;
  overflow: hidden;
  cursor: pointer;
  margin: 0;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.gallery-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08);
}

@media (min-width: 640px) {
  .gallery-item {
    flex: 0 0 300px;
  }
}

@media (min-width: 1024px) {
  .gallery-item {
    flex: 0 0 320px;
  }
}

.zoom-icon {
  color: #ffffff;
  font-size: 28px;
}

.gallery-img-wrap {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 10;
  overflow: hidden;
  background-color: #1b2e24;
}

.gallery-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.gallery-item:hover .gallery-img {
  transform: scale(1.03);
}

.gallery-overlay {
  position: absolute;
  inset: 0;
  background-color: rgba(27, 46, 36, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  color: #ffffff;
  transition: opacity 0.2s ease;
}

.gallery-item:hover .gallery-overlay {
  opacity: 1;
}

.gallery-caption {
  padding: 10px 12px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.caption-text {
  font-size: 12px;
  color: var(--color-on-surface, #1d1c14);
}

.caption-loc {
  font-size: 10px;
  color: var(--color-secondary, #d9531e);
  font-weight: 600;
}

/* BOTTOM ACTION BANNER */
.bottom-action-banner {
  background-color: var(--color-primary, #1b2e24);
  color: #fef9ed;
  padding: 32px 24px;
  text-align: center;
  border-top: 1px solid var(--color-outline-variant, #c2c8c2);
}

.banner-inner {
  max-width: 500px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.banner-tag {
  font-size: 10px;
  letter-spacing: 0.1em;
  color: var(--color-secondary, #d9531e);
  font-weight: 600;
}

.banner-title {
  font-size: 22px;
  color: #ffffff;
  line-height: 1.25;
}

.banner-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background-color: var(--color-secondary, #d9531e);
  color: #ffffff;
  border: none;
  border-radius: 4px;
  padding: 10px 20px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  margin-top: 8px;
  transition: background-color 0.2s ease;
}

.banner-btn:hover {
  background-color: #fef9ed;
  color: #1b2e24;
}

/* NOT FOUND */
.not-found-state {
  max-width: 600px;
  margin: 120px auto;
  text-align: center;
  padding: 40px 20px;
}

.primary-action-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background-color: var(--color-primary, #1b2e24);
  color: #fef9ed;
  padding: 10px 18px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
  text-decoration: none;
}

/* LIGHTBOX */
.lightbox-overlay {
  position: fixed;
  inset: 0;
  z-index: 100;
  background-color: rgba(27, 46, 36, 0.95);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}

.lightbox-close {
  position: absolute;
  top: 24px;
  right: 24px;
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: #ffffff;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.lightbox-content {
  max-width: 900px;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
}

.lightbox-image {
  max-width: 100%;
  max-height: 70vh;
  object-fit: contain;
  border-radius: 4px;
}

.lightbox-caption {
  margin-top: 12px;
  color: #fef9ed;
}

.caption-sub-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-top: 4px;
}

.caption-sub {
  font-size: 11px;
  opacity: 0.7;
}

.lightbox-nav-btn {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(254, 249, 237, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: #ffffff;
  border-radius: 50%;
  width: 42px;
  height: 42px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color 0.15s ease, border-color 0.15s ease;
}

.lightbox-nav-btn:hover {
  background: rgba(217, 83, 30, 0.85);
  border-color: #d9531e;
}

.lightbox-nav-btn.prev {
  left: 20px;
}

.lightbox-nav-btn.next {
  right: 20px;
}

/* TOAST */
.toast-notification {
  position: fixed;
  top: 76px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 90;
  background-color: rgba(27, 46, 36, 0.95);
  color: #fef9ed;
  padding: 8px 16px;
  border-radius: 4px;
  font-size: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(217, 83, 30, 0.4);
}

.toast-dot {
  color: var(--color-secondary, #d9531e);
  margin-right: 6px;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
