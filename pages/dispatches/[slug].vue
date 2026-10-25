<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { calculateReadTime } from '~/utils/formatters'
import type { Dispatch, Location } from '~/types/models'

const route = useRoute()
const router = useRouter()
const slug = computed(() => String(route.params.slug || ''))

const { dispatches, locations, fetchLocationBySlug, fetchDispatchBySlug, fetchPosts, fetchWaypoints } = useNitfCms()

const { data: asyncDispatch } = await useAsyncData(
  `dispatch-article-${slug.value}`,
  async () => {
    await Promise.all([
      fetchPosts(),
      fetchWaypoints()
    ])
    return await fetchDispatchBySlug(slug.value)
  },
  { watch: [slug] }
)

const currentDispatch = computed<Dispatch | null>(() => {
  return asyncDispatch.value || dispatches.value.find(d => d.slug === slug.value || d.id === slug.value) || null
})

// Resolve linked locations visited on this outing
const linkedLocations = computed<Location[]>(() => {
  if (!currentDispatch.value || !Array.isArray(currentDispatch.value.locations)) return []
  const result: Location[] = []

  for (const locRef of currentDispatch.value.locations) {
    const locId = typeof locRef === 'object' && locRef !== null ? (locRef.slug || locRef.id) : String(locRef)
    const found = locations.value.find(l => l.slug === locId || l.id === locId)
    if (found) {
      result.push(found)
    }
  }

  return result
})

const readTime = computed(() => {
  if (!currentDispatch.value) return '3 MIN READ'
  return calculateReadTime(currentDispatch.value.content)
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
    router.push(`/?story=${currentDispatch.value.slug || currentDispatch.value.id}`)
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

          <!-- Surveyor Telemetry Overlay Stamp -->
          <div class="hero-stamp font-mono">
            <span class="stamp-pill">
              {{ new Date(currentDispatch.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase() }}
            </span>
            <span v-if="currentDispatch.weather" class="stamp-pill">
              {{ currentDispatch.weather }}
            </span>
            <span class="stamp-pill">
              {{ readTime }}
            </span>
          </div>
        </div>

        <!-- Article Header -->
        <header class="article-header">
          <div class="metadata-row font-mono">
            <span class="meta-item">{{ new Date(currentDispatch.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) }}</span>
            <span class="meta-dot">/</span>
            <span class="meta-item">{{ readTime }}</span>
            <span v-if="currentDispatch.weather" class="meta-dot">/</span>
            <span v-if="currentDispatch.weather" class="meta-item weather">{{ currentDispatch.weather }}</span>
          </div>

          <h1 class="article-title font-serif">
            {{ currentDispatch.title }}
          </h1>

          <p class="article-lead font-serif">
            {{ currentDispatch.excerpt }}
          </p>

          <!-- Surveyed Locations Visited on this Outing -->
          <div v-if="linkedLocations.length > 0" class="visited-locations-panel font-mono">
            <div class="locations-header">
              <span class="material-symbols-outlined text-[15px] text-secondary">place</span>
              <span class="locations-label">SURVEYED WAYPOINTS VISITED:</span>
            </div>
            <div class="locations-chips-row">
              <NuxtLink
                v-for="loc in linkedLocations"
                :key="loc.id"
                :to="`/locations/${loc.slug || loc.id}`"
                class="location-chip"
              >
                <span class="material-symbols-outlined chip-icon">
                  {{ loc.category === 'shelter' ? 'cabin' : loc.category === 'viewpoint' ? 'landscape' : 'explore' }}
                </span>
                <span class="chip-name">{{ loc.name }}</span>
                <span v-if="loc.elevation" class="chip-elev">{{ loc.elevation }}m</span>
                <span class="material-symbols-outlined text-[12px] opacity-60">arrow_forward</span>
              </NuxtLink>
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
            <span class="material-symbols-outlined text-secondary">photo_camera</span>
            <h2>EXPEDITION FIELD CAPTURES ({{ currentDispatch.gallery.length }})</h2>
          </div>

          <div class="gallery-grid">
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
                  <span class="material-symbols-outlined">zoom_in</span>
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

        <div class="lightbox-content" @click.stop>
          <img
            :src="typeof currentDispatch.gallery[activePhotoIndex].image === 'object' ? (currentDispatch.gallery[activePhotoIndex].image as any).url : String(currentDispatch.gallery[activePhotoIndex].image)"
            :alt="currentDispatch.gallery[activePhotoIndex].caption || 'Field Photo'"
            class="lightbox-image"
          />
          <div class="lightbox-caption font-mono">
            <p class="caption-text font-serif">{{ currentDispatch.gallery[activePhotoIndex].caption }}</p>
          </div>
        </div>
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

.hero-stamp {
  position: absolute;
  bottom: 16px;
  left: 20px;
  right: 20px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.stamp-pill {
  background-color: rgba(27, 46, 36, 0.85);
  color: #fef9ed;
  font-size: 10px;
  font-weight: 500;
  padding: 4px 10px;
  border-radius: 3px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  letter-spacing: 0.05em;
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

.metadata-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  font-size: 11px;
  color: var(--color-tertiary, #526056);
  margin-bottom: 14px;
}

.meta-dot {
  color: var(--color-outline-variant, #c2c8c2);
}

.meta-item.weather {
  color: var(--color-secondary, #d9531e);
  font-weight: 600;
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
  gap: 6px;
  margin-bottom: 10px;
}

.locations-label {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.08em;
  color: var(--color-primary, #1b2e24);
}

.locations-chips-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.location-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background-color: var(--color-surface-container-lowest, #ffffff);
  border: 1px solid var(--color-outline-variant, #c2c8c2);
  border-radius: 4px;
  padding: 6px 10px;
  font-size: 11px;
  font-weight: 600;
  color: var(--color-on-surface, #1d1c14);
  text-decoration: none;
  transition: all 0.15s ease;
}

.location-chip:hover {
  background-color: var(--color-primary, #1b2e24);
  color: #fef9ed;
  border-color: var(--color-primary, #1b2e24);
}

.chip-icon {
  font-size: 14px;
  color: var(--color-secondary, #d9531e);
}

.location-chip:hover .chip-icon {
  color: #fef9ed;
}

.chip-elev {
  font-size: 9px;
  opacity: 0.6;
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

.gallery-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
}

@media (min-width: 640px) {
  .gallery-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

.gallery-item {
  background-color: var(--color-surface-container, #f3ede1);
  border: 1px solid var(--color-outline-variant, #c2c8c2);
  border-radius: 4px;
  overflow: hidden;
  cursor: pointer;
  margin: 0;
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
