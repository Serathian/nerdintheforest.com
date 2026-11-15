<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { calculateReadTime, formatDispatchDateRange } from '~/utils/formatters'
import type { Dispatch, Location } from '~/types/models'

useHead({
  title: 'Field Ledger & Dispatches — Nerd in the Forest',
  meta: [
    {
      name: 'description',
      content: 'Chronological expedition field notes, backcountry shelter observations, and Nordic trail dispatches.'
    },
    { property: 'og:title', content: 'Field Ledger & Dispatches — Nerd in the Forest' },
    { property: 'og:description', content: 'Surveyed expedition archives and backcountry observations.' }
  ]
})

const router = useRouter()
const { dispatches, locations, areas, error: cmsError, fetchAreas, fetchWaypoints, fetchPosts } = useNitfCms()

await useAsyncData('nitf-ledger-dispatches', async () => {
  await Promise.all([
    fetchAreas(),
    fetchWaypoints(),
    fetchPosts()
  ])
  return dispatches.value
})

onMounted(async () => {
  await Promise.all([
    fetchAreas(),
    fetchWaypoints(),
    fetchPosts()
  ])
})

const searchQuery = ref('')
const selectedCategory = ref('ALL')

const categories = [
  { id: 'ALL', label: 'All Dispatches' },
  { id: 'SHELTER', label: 'Shelters' },
  { id: 'HEARTH', label: 'Hearths' },
  { id: 'SPRINGHEAD', label: 'Springs' },
  { id: 'VIEWPOINT', label: 'Viewpoints' }
]

const defaultHeroImages = [
  'https://images.unsplash.com/photo-1510312305653-8ed496efae75?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=1200&q=80'
]

function resolveDispatchLocations(dispatch: Dispatch): Array<{ id: string; slug: string; name: string; category: string; areaName: string; elevation?: number }> {
  if (!Array.isArray(dispatch.locations)) return []
  return dispatch.locations.map((locRef: any) => {
    const refId = typeof locRef === 'object' && locRef !== null ? (locRef.slug || locRef.id) : String(locRef)
    const found = locations.value.find(
      l => l.slug === refId || l.id === refId || (locRef?.cmsId && l.id === locRef.cmsId)
    )
    const name = found?.name || (typeof locRef === 'object' && locRef !== null ? (locRef.name || locRef.title) : refId) || 'Surveyed Waypoint'
    const category = (found?.category || (typeof locRef === 'object' && locRef !== null ? locRef.category : 'shelter') || 'shelter').toUpperCase()
    const rawArea = found?.area || (typeof locRef === 'object' && locRef !== null ? locRef.area : '')
    const areaKey = typeof rawArea === 'object' && rawArea !== null ? (rawArea.slug || rawArea.id) : String(rawArea || '')
    const areaObj = areas.value.find(a => a.slug === areaKey || a.id === areaKey)
    const areaName = areaObj?.name || (typeof rawArea === 'string' && rawArea ? rawArea : (areas.value[0]?.name || 'Pirkanmaa'))
    const elevation = found?.elevation ?? (typeof locRef === 'object' && locRef !== null ? locRef.elevation : undefined)

    return {
      id: found?.id || refId,
      slug: found?.slug || refId,
      name,
      category,
      areaName,
      elevation
    }
  })
}

function getCategoryIcon(cat: string): string {
  const c = (cat || '').toLowerCase()
  if (c.includes('shelter')) return 'cabin'
  if (c.includes('hearth') || c.includes('fire')) return 'outdoor_grill'
  if (c.includes('spring') || c.includes('water')) return 'water_drop'
  if (c.includes('view') || c.includes('vista') || c.includes('summit')) return 'landscape'
  return 'explore'
}

const enrichedDispatches = computed(() => {
  return [...dispatches.value]
    .sort((a, b) => new Date(b.publishedAt || 0).getTime() - new Date(a.publishedAt || 0).getTime())
    .map((d) => {
      const resolvedLocs = resolveDispatchLocations(d)
      const rawHero = typeof d.heroImage === 'object' && d.heroImage !== null ? d.heroImage.url : d.heroImage
      const heroImage = rawHero || ''
      const primaryArea = resolvedLocs[0]?.areaName || areas.value[0]?.name || 'Pirkanmaa'
      const dateLabel = formatDispatchDateRange(d.startDate, d.endDate, d.publishedAt)
      const readTime = calculateReadTime(d.content?.length ? d.content : d.excerpt)
      const loadoutTitle = typeof d.loadout === 'object' && d.loadout !== null ? d.loadout.title : undefined

      return {
        ...d,
        resolvedLocs,
        heroImage,
        primaryArea,
        dateLabel,
        readTime,
        loadoutTitle
      }
    })
})

const filteredDispatches = computed(() => {
  return enrichedDispatches.value.filter(d => {
    if (selectedCategory.value !== 'ALL') {
      const matchesCat = d.resolvedLocs.some(loc => loc.category.includes(selectedCategory.value))
      if (!matchesCat) return false
    }
    if (searchQuery.value.trim()) {
      const q = searchQuery.value.toLowerCase().trim()
      const searchable = [
        d.title,
        d.excerpt,
        d.weather,
        d.primaryArea,
        d.loadoutTitle,
        ...(d.content || []),
        ...d.resolvedLocs.map(l => `${l.name} ${l.category} ${l.areaName}`)
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
      if (!q.split(/\s+/).every(term => searchable.includes(term))) return false
    }
    return true
  })
})

const primaryArchiveAreaLabel = computed(() => {
  return (areas.value[0]?.name || 'NORDIC ARCHIVE').toUpperCase()
})

function openDispatch(dispatch: { slug: string; id: string }) {
  router.push(`/dispatches/${dispatch.slug || dispatch.id}`)
}
</script>

<template>
  <div class="ledger-page">
    <div class="ledger-container">
      <!-- Section Header -->
      <header class="ledger-header">
        <div class="header-pre font-mono">
          <span class="header-beacon" />
          <span>EXPEDITION ARCHIVE // {{ primaryArchiveAreaLabel }}</span>
        </div>
        <h1 class="ledger-title font-serif">Field Ledger</h1>
        <p class="ledger-intro font-serif">
          Chronological field dispatches, cabin observations, and Nordic route surveys written in the backcountry.
        </p>

        <!-- Search Bar -->
        <div class="ledger-search-bar">
          <span class="material-symbols-outlined search-icon">search</span>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search dispatches, locations, weather, or gear..."
            class="ledger-search-input font-mono"
          />
          <button
            v-if="searchQuery"
            class="clear-btn"
            type="button"
            @click="searchQuery = ''"
          >
            <span class="material-symbols-outlined" style="font-size: 14px;">close</span>
          </button>
        </div>

        <!-- Filter Chips -->
        <div class="filter-chips-row scroll-hint-x">
          <button
            v-for="cat in categories"
            :key="cat.id"
            :class="['filter-chip font-mono', { active: selectedCategory === cat.id }]"
            type="button"
            @click="selectedCategory = cat.id"
          >
            {{ cat.label }}
          </button>
        </div>
      </header>

      <!-- Entries Stream -->
      <main class="entries-stream">
        <div v-if="filteredDispatches.length === 0" class="empty-state font-mono">
          <span class="material-symbols-outlined" style="font-size: 28px; color: var(--color-outline);">travel_explore</span>
          <p>
            {{
              dispatches.length === 0
                ? (cmsError
                    ? 'Unable to load field dispatches while Basecamp CMS is unreachable.'
                    : 'No field dispatches published yet.')
                : 'No field dispatches match current query.'
            }}
          </p>
        </div>

        <article
          v-for="(dispatch, idx) in filteredDispatches"
          :key="dispatch.id"
          class="ledger-card"
          @click="openDispatch(dispatch)"
        >
          <!-- Card Thumbnail Hero -->
          <div class="card-hero-wrap">
            <img :src="dispatch.heroImage || defaultHeroImages[idx % defaultHeroImages.length]" :alt="dispatch.title" class="card-hero-img" loading="lazy" />
            <div v-if="dispatch.primaryArea" class="hero-overlay-tag font-mono">
              {{ dispatch.primaryArea }}
            </div>
          </div>

          <!-- Card Body -->
          <div class="card-content">
            <div class="meta-row font-mono">
              <span class="meta-date">{{ dispatch.dateLabel }}</span>
              <span class="meta-sep">•</span>
              <span class="meta-read">{{ dispatch.readTime }}</span>
              <template v-if="dispatch.weather">
                <span class="meta-sep">•</span>
                <span class="meta-weather">{{ dispatch.weather }}</span>
              </template>
            </div>

            <h2 class="card-headline font-serif">{{ dispatch.title }}</h2>

            <p class="card-excerpt font-serif">
              {{ dispatch.excerpt }}
            </p>

            <!-- Visited Locations & Loadout Tags -->
            <div class="card-tags-row">
              <span
                v-for="loc in dispatch.resolvedLocs.slice(0, 4)"
                :key="loc.id"
                class="tag-pill font-mono"
              >
                <span class="material-symbols-outlined tag-icon">{{ getCategoryIcon(loc.category) }}</span>
                {{ loc.name }}
              </span>
              <span
                v-if="dispatch.resolvedLocs.length > 4"
                class="tag-pill font-mono"
              >
                +{{ dispatch.resolvedLocs.length - 4 }} MORE
              </span>
              <span
                v-if="dispatch.loadoutTitle"
                class="tag-pill font-mono"
              >
                <span class="material-symbols-outlined tag-icon">backpack</span>
                {{ dispatch.loadoutTitle }}
              </span>
            </div>

            <!-- Footer Action -->
            <div class="card-footer">
              <span class="coord-tag font-mono">
                {{ dispatch.resolvedLocs.length }} {{ dispatch.resolvedLocs.length === 1 ? 'WAYPOINT' : 'WAYPOINTS' }}
              </span>
              <span class="read-action font-mono">
                READ DISPATCH <span class="material-symbols-outlined" style="font-size: 14px;">arrow_forward</span>
              </span>
            </div>
          </div>
        </article>
      </main>
    </div>
  </div>
</template>

<style scoped>
.ledger-page {
  min-height: 100vh;
  min-height: 100dvh;
  padding-top: 56px;
  padding-bottom: 96px;
  background-color: var(--color-surface);
}

.ledger-container {
  max-width: 600px;
  margin: 0 auto;
  padding: 16px;
}

.ledger-header {
  margin-bottom: 24px;
}

.header-pre {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 10px;
  letter-spacing: 0.1em;
  color: var(--color-secondary);
  font-weight: 700;
  margin-bottom: 6px;
}

.header-beacon {
  width: 6px;
  height: 6px;
  border-radius: 9999px;
  background-color: var(--color-secondary);
}

.ledger-title {
  font-size: 32px;
  font-weight: 500;
  line-height: 1.15;
  color: var(--color-primary);
  margin-bottom: 6px;
}

.ledger-intro {
  font-size: 14px;
  line-height: 1.5;
  color: var(--color-on-surface-variant);
  margin-bottom: 16px;
}

.ledger-search-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  background-color: var(--color-card-bg);
  border: 1px solid rgba(115, 120, 116, 0.4);
  border-radius: 9999px;
  padding: 8px 14px;
  margin-bottom: 12px;
  box-shadow: 0 1px 4px rgba(27, 46, 36, 0.08);
}

.search-icon {
  font-size: 18px;
  color: var(--color-secondary);
}

.ledger-search-input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  font-size: 12px;
  color: var(--color-primary);
}

.clear-btn {
  background: none;
  border: none;
  color: var(--color-on-surface-variant);
  cursor: pointer;
  padding: 2px;
  display: flex;
  align-items: center;
}

.filter-chips-row {
  display: flex;
  gap: 6px;
  overflow-x: auto;
  padding: 2px 16px 2px 0;
}

.filter-chip {
  flex-shrink: 0;
  padding: 5px 12px;
  border-radius: 9999px;
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  background-color: var(--color-handle-bg);
  border: 1px solid rgba(115, 120, 116, 0.35);
  color: var(--color-on-surface);
  cursor: pointer;
  transition: all 0.15s ease;
}

.filter-chip.active {
  background-color: var(--color-primary);
  color: #ffffff;
  border-color: var(--color-primary);
}

.entries-stream {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 48px 16px;
  text-align: center;
  color: var(--color-on-surface-variant);
  font-size: 12px;
}

.ledger-card {
  background-color: var(--color-card-bg);
  border: 1px solid var(--color-card-border);
  border-radius: 8px;
  overflow: hidden;
  box-shadow: var(--color-card-shadow);
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
}

.ledger-card:hover {
  transform: translateY(-2px);
  border-color: var(--color-secondary);
  box-shadow: 0 8px 24px rgba(27, 46, 36, 0.14);
}

.card-hero-wrap {
  position: relative;
  width: 100%;
  height: 160px;
  overflow: hidden;
  background-color: var(--color-surface-container);
}

.card-hero-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.ledger-card:hover .card-hero-img {
  transform: scale(1.03);
}

.hero-overlay-tag {
  position: absolute;
  top: 10px;
  left: 10px;
  background-color: rgba(27, 46, 36, 0.88);
  backdrop-filter: blur(6px);
  color: #ffffff;
  padding: 3px 8px;
  border-radius: 4px;
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.card-content {
  padding: 16px;
}

.meta-row {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 10px;
  color: var(--color-on-surface-variant);
  margin-bottom: 6px;
  flex-wrap: wrap;
}

.meta-date {
  color: var(--color-secondary);
  font-weight: 600;
}

.meta-sep {
  opacity: 0.5;
}

.card-headline {
  font-size: 20px;
  font-weight: 500;
  line-height: 1.25;
  color: var(--color-primary);
  margin-bottom: 8px;
}

.card-excerpt {
  font-size: 13px;
  line-height: 1.5;
  color: var(--color-on-surface-variant);
  margin-bottom: 12px;
}

.card-tags-row {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 14px;
}

.tag-pill {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 3px 8px;
  background-color: rgba(231, 226, 214, 0.7);
  border: 1px solid rgba(194, 200, 194, 0.4);
  border-radius: 4px;
  font-size: 9px;
  text-transform: uppercase;
  color: var(--color-primary);
}

.tag-icon {
  font-size: 12px;
  color: var(--color-secondary);
}

.card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  border-top: 1px solid rgba(115, 120, 116, 0.15);
  padding-top: 10px;
  margin-top: 6px;
}

.read-action {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  margin-left: auto;
  white-space: nowrap;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.06em;
  color: var(--color-secondary);
  transition: transform 0.15s ease;
}

.ledger-card:hover .read-action {
  transform: translateX(2px);
}

.coord-tag {
  font-size: 9px;
  color: rgba(115, 120, 116, 0.7);
  letter-spacing: 0.05em;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
