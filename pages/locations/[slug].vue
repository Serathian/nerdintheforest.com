<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  getLocationVisits,
  getLocationMediaArchive,
  getAmenityMeta,
  formatCoordinates,
  calculateReadTime
} from '~/utils/formatters'
import type { Location, Dispatch } from '~/types/models'
import ElevationProfile from '~/components/atoms/ElevationProfile.vue'

const route = useRoute()
const router = useRouter()
const slug = computed(() => String(route.params.slug || ''))

const { locations, dispatches, areas, fetchWaypoints, fetchPosts, fetchAreas, fetchLocationBySlug } = useNitfCms()

const { data: asyncLocation } = await useAsyncData(
  `location-dossier-${slug.value}`,
  async () => {
    await Promise.all([
      fetchAreas(),
      fetchPosts(),
      fetchWaypoints()
    ])
    return await fetchLocationBySlug(slug.value)
  },
  { watch: [slug] }
)

const currentLocation = computed<Location | null>(() => {
  return asyncLocation.value || locations.value.find(l => l.slug === slug.value || l.id === slug.value) || null
})

const areaName = computed(() => {
  if (!currentLocation.value) return 'Nordic Wilderness'
  const areaKey = typeof currentLocation.value.area === 'object' && currentLocation.value.area !== null
    ? (currentLocation.value.area.id || currentLocation.value.area.slug)
    : String(currentLocation.value.area || '')
  const found = areas.value.find(a => a.id === areaKey || a.slug === areaKey)
  return found?.name || areaKey || 'Nordic Region'
})

const visitData = computed(() => {
  if (!currentLocation.value) return { isVisited: false, visitCount: 0, dispatches: [] }
  return getLocationVisits(currentLocation.value, dispatches.value)
})

const photoArchive = computed(() => {
  if (!currentLocation.value) return []
  return getLocationMediaArchive(currentLocation.value, dispatches.value)
})

const activePhotoIndex = ref<number | null>(null)
const shareNotification = ref<string | null>(null)

function copyShareUrl() {
  if (typeof window !== 'undefined') {
    navigator.clipboard.writeText(window.location.href)
    shareNotification.value = 'URL copied to clipboard'
    setTimeout(() => {
      shareNotification.value = null
    }, 2500)
  }
}

function handleNavigateTrailhead() {
  const th = currentLocation.value?.trailhead
  if (!th) return
  const lat = typeof th === 'object' ? th.latitude : null
  const lng = typeof th === 'object' ? th.longitude : null
  if (lat == null || lng == null) return

  if (typeof window !== 'undefined') {
    const isApple = /Mac|iPhone|iPad|iPod/.test(navigator.userAgent)
    const url = isApple
      ? `maps://maps.apple.com/?daddr=${lat},${lng}&dirflg=d`
      : `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`
    window.open(url, '_blank')
  }
}

function openInAtlasMap() {
  router.push(`/?location=${slug.value}`)
}

// SEO & Structured Data (JSON-LD)
const pageTitle = computed(() => {
  if (!currentLocation.value) return 'Survey Waypoint — Nerd in the Forest'
  return `${currentLocation.value.name} — ${areaName.value} Field Survey | Nerd in the Forest`
})

const pageDescription = computed(() => {
  if (!currentLocation.value) return 'Tactile Scandinavian topographical survey notes and backcountry waypoint dossier.'
  const elev = currentLocation.value.elevation ? `at ${currentLocation.value.elevation}m elevation` : ''
  return `${currentLocation.value.name} in ${areaName.value} ${elev}. ${currentLocation.value.summary || 'Backcountry surveyed waypoint, amenities, coordinates, and seasonal field photos.'}`
})

const coverImageUrl = computed(() => {
  return currentLocation.value?.coverImage?.url ||
    (photoArchive.value.length > 0 ? photoArchive.value[0].url : 'https://images.unsplash.com/photo-1510312305653-8ed496efae75?auto=format&fit=crop&w=1200&q=80')
})

useHead({
  title: pageTitle,
  meta: [
    { name: 'description', content: pageDescription },
    { property: 'og:title', content: pageTitle },
    { property: 'og:description', content: pageDescription },
    { property: 'og:image', content: coverImageUrl },
    { property: 'og:type', content: 'place' },
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: pageTitle },
    { name: 'twitter:description', content: pageDescription },
    { name: 'twitter:image', content: coverImageUrl }
  ],
  script: computed(() => {
    if (!currentLocation.value) return []
    const jsonLd = {
      '@context': 'https://schema.org',
      '@type': 'Place',
      'name': currentLocation.value.name,
      'description': currentLocation.value.summary,
      'geo': {
        '@type': 'GeoCoordinates',
        'latitude': currentLocation.value.latitude,
        'longitude': currentLocation.value.longitude,
        'elevation': currentLocation.value.elevation
      },
      'amenityFeature': (currentLocation.value.amenities || []).map(a => ({
        '@type': 'LocationFeatureSpecification',
        'name': getAmenityMeta(a).label,
        'value': true
      })),
      'photo': photoArchive.value.map(p => ({
        '@type': 'ImageObject',
        'contentUrl': p.url,
        'caption': p.caption || p.alt
      }))
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
  <div class="location-page">
    <!-- Top Sticky Surveyor Navigation Bar -->
    <header class="location-nav">
      <div class="nav-container">
        <button
          class="nav-back-btn font-mono"
          type="button"
          @click="openInAtlasMap"
        >
          <span class="material-symbols-outlined text-[16px]">arrow_back</span>
          <span>ATLAS MAP</span>
        </button>

        <div class="nav-breadcrumbs font-mono">
          <span class="crumb-dim">EXPEDITION</span>
          <span class="crumb-sep">/</span>
          <span class="crumb-dim">{{ areaName.toUpperCase() }}</span>
          <span class="crumb-sep">/</span>
          <span class="crumb-active">{{ currentLocation?.name || 'SURVEY' }}</span>
        </div>

        <button
          class="nav-share-btn font-mono"
          type="button"
          title="Share Location"
          @click="copyShareUrl"
        >
          <span class="material-symbols-outlined text-[15px]">share</span>
          <span class="share-text">SHARE</span>
        </button>
      </div>
    </header>

    <!-- Main Content Container -->
    <main v-if="currentLocation" class="location-body">
      <!-- Hero Topographic Banner -->
      <section class="hero-section">
        <div class="hero-media-wrapper">
          <img
            :src="coverImageUrl"
            :alt="currentLocation.name"
            class="hero-image"
          />
          <div class="hero-overlay" />

          <!-- Surveyor Telemetry Overlay Stamp -->
          <div class="hero-telemetry-stamp font-mono">
            <span class="stamp-pill">
              {{ formatCoordinates(currentLocation.latitude, currentLocation.longitude) }}
            </span>
            <span v-if="currentLocation.elevation" class="stamp-pill">
              {{ currentLocation.elevation }}M ELEV
            </span>
            <span class="stamp-pill bg-primary/80">
              {{ areaName.toUpperCase() }}
            </span>
          </div>
        </div>

        <!-- Hero Header Card -->
        <div class="hero-content-card">
          <div class="tag-row font-mono">
            <span class="category-tag">
              #{{ (currentLocation.category || 'SHELTER').toUpperCase() }}
            </span>
            <span v-if="visitData.isVisited" class="visit-tag visited">
              <span class="material-symbols-outlined text-[13px]">check_circle</span>
              VISITED {{ visitData.visitCount }}X
            </span>
            <span v-else class="visit-tag unvisited">
              <span class="material-symbols-outlined text-[13px]">radio_button_unchecked</span>
              PENDING FIELD VISIT
            </span>
          </div>

          <h1 class="location-title font-serif">
            {{ currentLocation.name }}
          </h1>

          <p class="location-summary font-serif">
            {{ currentLocation.summary || 'Tactile surveyed backcountry waypoint with field amenities and trail access.' }}
          </p>

          <!-- Action Bar: View on Map + Navigate to Trailhead -->
          <div class="actions-bar">
            <button
              class="primary-action-btn font-mono"
              type="button"
              @click="openInAtlasMap"
            >
              <span class="material-symbols-outlined text-[16px]">map</span>
              <span>VIEW ON ATLAS MAP</span>
            </button>

            <button
              v-if="currentLocation.trailhead"
              class="secondary-action-btn font-mono"
              type="button"
              @click="handleNavigateTrailhead"
            >
              <span class="material-symbols-outlined text-[16px]">directions_car</span>
              <span>TRAILHEAD PARKING</span>
            </button>
          </div>
        </div>
      </section>

      <!-- Grid: Telemetry Specs & Verified Amenities -->
      <section class="dossier-grid">
        <!-- Verified Amenities Panel -->
        <div class="dossier-panel amenities-panel">
          <div class="panel-header font-mono">
            <span class="material-symbols-outlined panel-icon">verified</span>
            <h2>VERIFIED SITE AMENITIES</h2>
          </div>

          <div v-if="currentLocation.amenities && currentLocation.amenities.length > 0" class="amenities-list">
            <div
              v-for="(amenity, idx) in currentLocation.amenities"
              :key="idx"
              class="amenity-item"
            >
              <div class="amenity-icon-wrapper">
                <span class="material-symbols-outlined">{{ getAmenityMeta(amenity).icon }}</span>
              </div>
              <div class="amenity-details">
                <span class="amenity-name font-mono">{{ getAmenityMeta(amenity).label }}</span>
                <span class="amenity-status font-mono">CONFIRMED FIELD READY</span>
              </div>
            </div>
          </div>
          <div v-else class="amenities-empty font-mono">
            <span class="material-symbols-outlined">info</span>
            <span>UNVERIFIED AMENITIES — PENDING PHYSICAL FIELD SURVEY</span>
          </div>
        </div>

        <!-- Trailhead Access & Elevation Profile -->
        <div class="dossier-panel access-panel">
          <div class="panel-header font-mono">
            <span class="material-symbols-outlined panel-icon">hiking</span>
            <h2>TRAILHEAD ACCESS & TOPOGRAPHY</h2>
          </div>

          <div v-if="currentLocation.trailhead && typeof currentLocation.trailhead === 'object'" class="trailhead-box font-mono">
            <div class="th-row">
              <span class="th-label">STARTING TRAILHEAD:</span>
              <span class="th-val">{{ currentLocation.trailhead.name }}</span>
            </div>
            <div class="th-row">
              <span class="th-label">COORDINATES:</span>
              <span class="th-val">{{ formatCoordinates(currentLocation.trailhead.latitude, currentLocation.trailhead.longitude) }}</span>
            </div>
            <div v-if="currentLocation.elevationGain" class="th-row">
              <span class="th-label">ASCENT / DESCENT:</span>
              <span class="th-val">+{{ currentLocation.elevationGain }}m / -{{ currentLocation.elevationLoss || 0 }}m</span>
            </div>
          </div>

          <!-- Topographic Elevation Profile Graph -->
          <div v-if="currentLocation.trailhead && typeof currentLocation.trailhead === 'object' && currentLocation.elevationGain" class="elevation-profile-container">
            <ElevationProfile
              :start-elevation="currentLocation.trailhead.elevationGain ? (currentLocation.elevation || 300) - currentLocation.elevationGain : 240"
              :destination-elevation="currentLocation.elevation || 340"
              :elevation-gain="currentLocation.elevationGain || 0"
              :elevation-loss="currentLocation.elevationLoss || 0"
              :distance-km="2.0"
              :trailhead-name="currentLocation.trailhead.name"
              :destination-name="currentLocation.name"
            />
          </div>
          <div v-else class="trailhead-hint font-mono">
            <span class="material-symbols-outlined">explore</span>
            <span>Direct backcountry cross-country coordinates. Consult topographic map for off-trail approaches.</span>
          </div>
        </div>
      </section>

      <!-- Living Photo Archive (Seasonal Photographic Record) -->
      <section class="photo-archive-section">
        <div class="section-title-row font-mono">
          <div class="flex items-center gap-2">
            <span class="material-symbols-outlined text-secondary">photo_camera</span>
            <h2>SURVEY PHOTO ARCHIVE ({{ photoArchive.length }})</h2>
          </div>
          <span class="text-xs text-muted">DOCUMENTED ACROSS EXPEDITIONS</span>
        </div>

        <div v-if="photoArchive.length > 0" class="photo-grid">
          <div
            v-for="(photo, idx) in photoArchive"
            :key="idx"
            class="photo-card"
            @click="activePhotoIndex = idx"
          >
            <div class="photo-img-wrapper">
              <img
                :src="photo.url"
                :alt="photo.alt"
                loading="lazy"
                class="photo-img"
              />
              <div class="photo-card-overlay">
                <span class="material-symbols-outlined zoom-icon">zoom_in</span>
              </div>
            </div>

            <div class="photo-caption-block font-mono">
              <p class="photo-caption">{{ photo.caption || photo.alt }}</p>
              <div class="photo-meta">
                <span class="meta-trip">{{ photo.dispatchTitle }}</span>
                <span class="meta-date">{{ photo.publishedAt ? new Date(photo.publishedAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'Field Survey' }}</span>
              </div>
            </div>
          </div>
        </div>
        <div v-else class="photo-empty font-mono">
          <span class="material-symbols-outlined">image_not_supported</span>
          <p>No field photos cataloged for this location yet. New photos automatically appear when linked in dispatches.</p>
        </div>
      </section>

      <!-- Field Dispatches & Expedition History -->
      <section class="dispatches-history-section">
        <div class="section-title-row font-mono">
          <div class="flex items-center gap-2">
            <span class="material-symbols-outlined text-secondary">menu_book</span>
            <h2>FIELD DISPATCH LOG ({{ visitData.dispatches.length }})</h2>
          </div>
          <span class="text-xs text-muted">CHRONOLOGICAL ENTRIES PASSING THIS SPOT</span>
        </div>

        <div v-if="visitData.dispatches.length > 0" class="dispatches-grid">
          <article
            v-for="dispatch in visitData.dispatches"
            :key="dispatch.id"
            class="dispatch-entry-card"
          >
            <div class="dispatch-header font-mono">
              <span class="dispatch-date">{{ new Date(dispatch.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) }}</span>
              <span class="dispatch-weather">{{ dispatch.weather || '4°C • MIST' }}</span>
            </div>

            <h3 class="dispatch-title font-serif">
              <NuxtLink :to="`/dispatches/${dispatch.slug}`">
                {{ dispatch.title }}
              </NuxtLink>
            </h3>

            <p class="dispatch-excerpt font-serif">
              {{ dispatch.excerpt }}
            </p>

            <div class="dispatch-footer font-mono">
              <NuxtLink :to="`/dispatches/${dispatch.slug}`" class="read-link">
                <span>READ DISPATCH</span>
                <span class="material-symbols-outlined text-[14px]">arrow_forward</span>
              </NuxtLink>
            </div>
          </article>
        </div>
        <div v-else class="dispatch-empty font-mono">
          <span class="material-symbols-outlined">history_edu</span>
          <p>No written dispatches recorded for this location yet.</p>
        </div>
      </section>

      <!-- Bottom Direct CTA -->
      <section class="bottom-cta-banner">
        <div class="cta-inner font-mono">
          <span class="cta-stamp">READY FOR BACKCOUNTRY EXPLORATION?</span>
          <h2 class="cta-headline font-serif">Open {{ currentLocation.name }} in the Interactive Atlas</h2>
          <button
            class="cta-btn font-mono"
            type="button"
            @click="openInAtlasMap"
          >
            <span class="material-symbols-outlined">explore</span>
            <span>LAUNCH ATLAS MAP CANVAS</span>
          </button>
        </div>
      </section>
    </main>

    <!-- Fallback if location not found -->
    <div v-else class="not-found-state font-mono">
      <span class="material-symbols-outlined text-[48px] text-secondary">explore_off</span>
      <h1 class="font-serif text-2xl mt-3 text-on-surface">Waypoint Survey Not Found</h1>
      <p class="text-sm text-on-surface-variant max-w-md mt-2">
        The coordinates or location slug "{{ slug }}" could not be retrieved from the cartographic registry.
      </p>
      <NuxtLink to="/" class="primary-action-btn font-mono mt-6 inline-flex">
        <span class="material-symbols-outlined text-[16px]">arrow_back</span>
        <span>RETURN TO ATLAS MAP</span>
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
        v-if="activePhotoIndex !== null && photoArchive[activePhotoIndex]"
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

        <div class="lightbox-content" @click.stop>
          <img
            :src="photoArchive[activePhotoIndex].url"
            :alt="photoArchive[activePhotoIndex].alt"
            class="lightbox-image"
          />
          <div class="lightbox-caption font-mono">
            <p class="caption-text font-serif">{{ photoArchive[activePhotoIndex].caption || photoArchive[activePhotoIndex].alt }}</p>
            <span class="caption-sub">{{ photoArchive[activePhotoIndex].dispatchTitle }} • {{ photoArchive[activePhotoIndex].publishedAt ? new Date(photoArchive[activePhotoIndex].publishedAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'Field Survey' }}</span>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.location-page {
  min-height: 100vh;
  background-color: var(--color-surface, #fef9ed);
  color: var(--color-on-surface, #1d1c14);
  padding-bottom: 80px;
}

/* TOP NAV */
.location-nav {
  position: sticky;
  top: 0;
  z-index: 50;
  background-color: rgba(254, 249, 237, 0.95);
  backdrop-filter: blur(8px);
  border-bottom: 1px solid var(--color-outline-variant, #c2c8c2);
}

.nav-container {
  max-width: 1080px;
  margin: 0 auto;
  padding: 12px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.nav-back-btn,
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
.location-body {
  max-width: 1080px;
  margin: 0 auto;
  padding: 24px 20px;
}

.hero-section {
  display: flex;
  flex-direction: column;
  background-color: var(--color-surface-container-low, #f8f3e7);
  border: 1px solid var(--color-outline-variant, #c2c8c2);
  border-radius: 6px;
  overflow: hidden;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);
  margin-bottom: 32px;
}

@media (min-width: 768px) {
  .hero-section {
    flex-direction: row;
  }
}

.hero-media-wrapper {
  position: relative;
  width: 100%;
  height: 280px;
  background-color: #1b2e24;
}

@media (min-width: 768px) {
  .hero-media-wrapper {
    width: 48%;
    height: auto;
    min-height: 380px;
  }
}

.hero-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.hero-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(27, 46, 36, 0.2) 0%, rgba(27, 46, 36, 0.7) 100%);
}

.hero-telemetry-stamp {
  position: absolute;
  bottom: 16px;
  left: 16px;
  right: 16px;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.stamp-pill {
  background-color: rgba(27, 46, 36, 0.85);
  color: #fef9ed;
  font-size: 10px;
  font-weight: 500;
  padding: 4px 8px;
  border-radius: 3px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  letter-spacing: 0.05em;
}

.hero-content-card {
  padding: 28px 24px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  flex: 1;
}

.tag-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.category-tag {
  font-size: 11px;
  font-weight: 600;
  color: var(--color-secondary, #d9531e);
  letter-spacing: 0.05em;
}

.visit-tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 10px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 3px;
}

.visit-tag.visited {
  background-color: rgba(27, 46, 36, 0.1);
  color: #1b2e24;
  border: 1px solid rgba(27, 46, 36, 0.3);
}

.visit-tag.unvisited {
  background-color: rgba(82, 96, 86, 0.1);
  color: #526056;
  border: 1px solid rgba(82, 96, 86, 0.3);
}

.location-title {
  font-size: 32px;
  line-height: 1.15;
  color: var(--color-on-surface, #1d1c14);
  margin-bottom: 12px;
}

@media (min-width: 640px) {
  .location-title {
    font-size: 40px;
  }
}

.location-summary {
  font-size: 16px;
  line-height: 1.5;
  color: var(--color-on-surface-variant, #424844);
  margin-bottom: 24px;
}

.actions-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
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
  border: none;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.primary-action-btn:hover {
  background-color: var(--color-secondary, #d9531e);
}

.secondary-action-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background-color: transparent;
  color: var(--color-on-surface, #1d1c14);
  padding: 10px 18px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
  border: 1px solid var(--color-outline, #737874);
  cursor: pointer;
  transition: all 0.2s ease;
}

.secondary-action-btn:hover {
  background-color: var(--color-surface-container, #f3ede1);
  border-color: var(--color-primary, #1b2e24);
}

/* DOSSIER GRID */
.dossier-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 24px;
  margin-bottom: 36px;
}

@media (min-width: 768px) {
  .dossier-grid {
    grid-template-columns: 1fr 1fr;
  }
}

.dossier-panel {
  background-color: var(--color-surface-container-lowest, #ffffff);
  border: 1px solid var(--color-outline-variant, #c2c8c2);
  border-radius: 6px;
  padding: 20px;
}

.panel-header {
  display: flex;
  align-items: center;
  gap: 8px;
  border-bottom: 1px dashed var(--color-outline-variant, #c2c8c2);
  padding-bottom: 12px;
  margin-bottom: 16px;
}

.panel-header h2 {
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.08em;
  color: var(--color-primary, #1b2e24);
}

.panel-icon {
  font-size: 18px;
  color: var(--color-secondary, #d9531e);
}

.amenities-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.amenity-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.amenity-icon-wrapper {
  width: 32px;
  height: 32px;
  border-radius: 4px;
  background-color: var(--color-surface-container, #f3ede1);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-primary, #1b2e24);
}

.amenity-details {
  display: flex;
  flex-direction: column;
}

.amenity-name {
  font-size: 12px;
  font-weight: 600;
  color: var(--color-on-surface, #1d1c14);
}

.amenity-status {
  font-size: 10px;
  color: #1b2e24;
  opacity: 0.7;
}

.amenities-empty,
.trailhead-hint {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 16px;
  background-color: var(--color-surface-container, #f3ede1);
  border-radius: 4px;
  font-size: 11px;
  color: var(--color-on-surface-variant, #424844);
}

.trailhead-box {
  background-color: var(--color-surface-container, #f3ede1);
  border-radius: 4px;
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
}

.th-row {
  display: flex;
  justify-content: space-between;
  font-size: 11px;
}

.th-label {
  color: var(--color-tertiary, #526056);
}

.th-val {
  font-weight: 600;
  color: var(--color-on-surface, #1d1c14);
}

/* PHOTO ARCHIVE */
.photo-archive-section,
.dispatches-history-section {
  margin-bottom: 40px;
}

.section-title-row {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  border-bottom: 1px solid var(--color-outline-variant, #c2c8c2);
  padding-bottom: 8px;
  margin-bottom: 20px;
}

.section-title-row h2 {
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.05em;
  color: var(--color-primary, #1b2e24);
}

.photo-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
}

@media (min-width: 640px) {
  .photo-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1024px) {
  .photo-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

.photo-card {
  background-color: var(--color-surface-container-lowest, #ffffff);
  border: 1px solid var(--color-outline-variant, #c2c8c2);
  border-radius: 4px;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.photo-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08);
}

.photo-img-wrapper {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 10;
  background-color: #1b2e24;
  overflow: hidden;
}

.photo-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.photo-card:hover .photo-img {
  transform: scale(1.03);
}

.photo-card-overlay {
  position: absolute;
  inset: 0;
  background-color: rgba(27, 46, 36, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.photo-card:hover .photo-card-overlay {
  opacity: 1;
}

.zoom-icon {
  color: #ffffff;
  font-size: 28px;
}

.photo-caption-block {
  padding: 12px;
}

.photo-caption {
  font-size: 12px;
  line-height: 1.4;
  color: var(--color-on-surface, #1d1c14);
  margin-bottom: 6px;
}

.photo-meta {
  display: flex;
  justify-content: space-between;
  font-size: 10px;
  color: var(--color-tertiary, #526056);
}

.photo-empty,
.dispatch-empty {
  display: flex;
  align-items: center;
  gap: 12px;
  background-color: var(--color-surface-container-low, #f8f3e7);
  border: 1px dashed var(--color-outline-variant, #c2c8c2);
  border-radius: 4px;
  padding: 24px;
  font-size: 12px;
  color: var(--color-tertiary, #526056);
}

/* DISPATCHES GRID */
.dispatches-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
}

@media (min-width: 768px) {
  .dispatches-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

.dispatch-entry-card {
  background-color: var(--color-surface-container-lowest, #ffffff);
  border: 1px solid var(--color-outline-variant, #c2c8c2);
  border-radius: 4px;
  padding: 20px;
  display: flex;
  flex-direction: column;
}

.dispatch-header {
  display: flex;
  justify-content: space-between;
  font-size: 10px;
  color: var(--color-secondary, #d9531e);
  margin-bottom: 8px;
}

.dispatch-title {
  font-size: 20px;
  line-height: 1.25;
  margin-bottom: 10px;
}

.dispatch-title a {
  color: var(--color-primary, #1b2e24);
  text-decoration: none;
}

.dispatch-title a:hover {
  color: var(--color-secondary, #d9531e);
}

.dispatch-excerpt {
  font-size: 14px;
  line-height: 1.5;
  color: var(--color-on-surface-variant, #424844);
  margin-bottom: 16px;
  flex: 1;
}

.dispatch-footer {
  display: flex;
  justify-content: flex-end;
  border-top: 1px dashed var(--color-outline-variant, #c2c8c2);
  padding-top: 10px;
}

.read-link {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  font-weight: 600;
  color: var(--color-secondary, #d9531e);
  text-decoration: none;
}

.read-link:hover {
  text-decoration: underline;
}

/* BOTTOM CTA */
.bottom-cta-banner {
  background-color: var(--color-primary, #1b2e24);
  color: #fef9ed;
  border-radius: 6px;
  padding: 36px 24px;
  text-align: center;
  margin-top: 24px;
}

.cta-inner {
  max-width: 600px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.cta-stamp {
  font-size: 10px;
  letter-spacing: 0.1em;
  color: #d9531e;
  font-weight: 600;
}

.cta-headline {
  font-size: 28px;
  color: #ffffff;
  line-height: 1.2;
}

.cta-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background-color: var(--color-secondary, #d9531e);
  color: #ffffff;
  border: none;
  border-radius: 4px;
  padding: 12px 24px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  margin-top: 8px;
  transition: background-color 0.2s ease;
}

.cta-btn:hover {
  background-color: #fef9ed;
  color: #1b2e24;
}

/* NOT FOUND STATE */
.not-found-state {
  max-width: 600px;
  margin: 120px auto;
  text-align: center;
  padding: 40px 20px;
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

.caption-text {
  font-size: 15px;
  margin-bottom: 4px;
}

.caption-sub {
  font-size: 11px;
  opacity: 0.7;
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
