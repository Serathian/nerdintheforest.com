<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import {
  mockLoadoutKits,
  mockGearInsights,
  type LoadoutKit,
  type GearInsight
} from '~/data/mockGearData'

useHead({
  title: 'Backcountry Gear Ledger — Nerd in the Forest',
  meta: [
    {
      name: 'description',
      content: 'Tested equipment loadouts, seasonal Nordic kits, durability observations, and field survival gear insights.'
    },
    { property: 'og:title', content: 'Backcountry Gear Ledger — Nerd in the Forest' },
    { property: 'og:description', content: 'Surveyed equipment kits, weights, and seasonal packing lists.' }
  ]
})

const route = useRoute()
const router = useRouter()

// Two Main Ledger Tabs: 'insights' vs 'loadouts'
type MainTab = 'insights' | 'loadouts'
const activeMainTab = ref<MainTab>('insights')

// INSIGHTS TAB STATE
const selectedInsightCategory = ref('ALL')
const insightCategories = [
  { id: 'ALL', label: 'All Insights' },
  { id: 'DURABILITY', label: 'Durability & Wear' },
  { id: 'THERMAL', label: 'Thermal Dynamics' },
  { id: 'MAINTENANCE', label: 'Maintenance & Care' },
  { id: 'PHILOSOPHY', label: 'Surveyor Philosophy' }
]

const filteredInsights = computed<GearInsight[]>(() => {
  if (selectedInsightCategory.value === 'ALL') {
    return mockGearInsights
  }
  return mockGearInsights.filter(i => i.category === selectedInsightCategory.value)
})

// Full Review Reader Modal State
const selectedInsight = ref<GearInsight | null>(null)
const isInsightReaderOpen = ref(false)

function openInsight(insight: GearInsight) {
  selectedInsight.value = insight
  isInsightReaderOpen.value = true
  if (typeof window !== 'undefined') {
    router.replace({ query: { ...route.query, insight: insight.id } })
  }
}

function closeInsight() {
  isInsightReaderOpen.value = false
  selectedInsight.value = null
  if (typeof window !== 'undefined') {
    const q = { ...route.query }
    delete q.insight
    router.replace({ query: q })
  }
}

onMounted(() => {
  if (route.query.insight) {
    const match = mockGearInsights.find(i => i.id === route.query.insight)
    if (match) {
      openInsight(match)
    }
  }
})

function getInsightForItem(item: any): GearInsight | undefined {
  if (item.insightId) {
    return mockGearInsights.find(i => i.id === item.insightId)
  }
  const lowerName = item.name.toLowerCase()
  return mockGearInsights.find(i => {
    const equip = i.equipmentTested.toLowerCase()
    return (
      (lowerName.includes('akto') && equip.includes('akto')) ||
      (lowerName.includes('trangia') && equip.includes('trangia')) ||
      (lowerName.includes('xtherm') && equip.includes('xtherm')) ||
      (lowerName.includes('garberg') && equip.includes('garberg')) ||
      (lowerName.includes('vandra') && equip.includes('vandra')) ||
      (lowerName.includes('repair') && equip.includes('repair'))
    )
  })
}

function openReviewForItem(item: any) {
  const insight = getInsightForItem(item)
  if (insight) {
    openInsight(insight)
  }
}

// LOADOUTS TAB: 4-STOP SEASONAL CONTINUUM (Values Above Slider)
interface SeasonStop {
  id: 'SPRING' | 'SUMMER' | 'AUTUMN' | 'WINTER'
  name: string
  sub: string
  icon: string
}

const seasonStops: SeasonStop[] = [
  { id: 'SPRING', name: 'Spring', sub: 'THAW', icon: 'eco' },
  { id: 'SUMMER', name: 'Summer', sub: 'BOREAL', icon: 'wb_sunny' },
  { id: 'AUTUMN', name: 'Autumn', sub: 'TAIGA', icon: 'forest' },
  { id: 'WINTER', name: 'Winter', sub: 'SUB-ZERO', icon: 'ac_unit' }
]

const activeSeasonId = ref<'SPRING' | 'SUMMER' | 'AUTUMN' | 'WINTER'>('AUTUMN')

const activeSeasonIndex = computed(() => {
  const idx = seasonStops.findIndex(s => s.id === activeSeasonId.value)
  return idx >= 0 ? idx : 2
})

function selectSeason(id: 'SPRING' | 'SUMMER' | 'AUTUMN' | 'WINTER') {
  activeSeasonId.value = id
}

function onSeasonKeydown(e: KeyboardEvent) {
  if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
    e.preventDefault()
    const nextIdx = Math.min(seasonStops.length - 1, activeSeasonIndex.value + 1)
    activeSeasonId.value = seasonStops[nextIdx].id
  } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
    e.preventDefault()
    const prevIdx = Math.max(0, activeSeasonIndex.value - 1)
    activeSeasonId.value = seasonStops[prevIdx].id
  }
}

const activeLoadout = computed<LoadoutKit>(() => {
  return mockLoadoutKits.find(k => k.id === activeSeasonId.value) || mockLoadoutKits[0]
})

const totalPackedItems = computed(() => {
  let count = 0
  activeLoadout.value.categories.forEach(cat => {
    count += cat.items.length
  })
  return count
})

const computedTotalWeightKg = computed(() => {
  let grams = 0
  activeLoadout.value.categories.forEach(cat => {
    cat.items.forEach(item => {
      grams += item.weightGrams
    })
  })
  return (grams / 1000).toFixed(2)
})

const copyNotification = ref(false)
async function copyLoadoutManifest() {
  if (typeof window === 'undefined') return
  const lines = [
    `# NERD IN THE FOREST — LOADOUT MANIFEST: ${activeLoadout.value.title}`,
    `Season: ${activeLoadout.value.label} // Temp: ${activeLoadout.value.tempRange}`,
    `Terrain: ${activeLoadout.value.terrain}`,
    `Base Weight: ${computedTotalWeightKg.value} KG // Total Items: ${totalPackedItems.value}`,
    ''
  ]
  activeLoadout.value.categories.forEach(cat => {
    lines.push(`## ${cat.name}`)
    cat.items.forEach(item => {
      lines.push(`- [${item.status}] ${item.name} (${item.weight}) — ${item.spec}`)
    })
    lines.push('')
  })

  try {
    if (navigator && navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(lines.join('\n'))
    }
  } catch (_) {
    // Graceful fallback for environments without clipboard permissions
  }

  copyNotification.value = true
  setTimeout(() => {
    copyNotification.value = false
  }, 2400)
}
</script>

<template>
  <div class="gear-page">
    <div class="gear-container">
      <!-- Section Header -->
      <header class="gear-header">
        <div class="header-pre font-mono">
          <span class="header-beacon" />
          <span>EQUIPMENT // TELEMETRY & FIELD LOGS</span>
        </div>
        <h1 class="gear-title font-serif">Gear Ledger</h1>
        <p class="gear-intro font-serif">
          Surveyed equipment manifests, seasonal loadouts, durability logs, and backcountry gear insights for Norwegian wilderness travel.
        </p>

      </header>

      <!-- TWO PRIMARY LEDGER TABS (Grown to take up full screen viewport) -->
      <nav class="primary-ledger-tabs-shelf font-mono" aria-label="Gear Ledger Navigation">
        <button
          :class="['primary-ledger-tab', { active: activeMainTab === 'insights' }]"
          type="button"
          @click="activeMainTab = 'insights'"
        >
          <div class="tab-content-wrap">
            <span class="material-symbols-outlined tab-icon">insights</span>
            <span class="tab-label">GEAR INSIGHTS</span>
            <span class="tab-badge">{{ mockGearInsights.length }}</span>
          </div>
        </button>

        <button
          :class="['primary-ledger-tab', { active: activeMainTab === 'loadouts' }]"
          type="button"
          @click="activeMainTab = 'loadouts'"
        >
          <div class="tab-content-wrap">
            <span class="material-symbols-outlined tab-icon">backpack</span>
            <span class="tab-label">MY LOADOUTS</span>
            <span class="tab-badge">{{ mockLoadoutKits.length }}</span>
          </div>
        </button>
      </nav>

      <!-- SEPARATE PAGE CONTENT AREA (Top border edge defining the page) -->
      <div class="ledger-page-content">
        <!-- ===================================================================== -->
        <!-- TAB 1: GEAR INSIGHTS VIEW                                             -->
        <!-- ===================================================================== -->
        <main v-if="activeMainTab === 'insights'" class="insights-view">
        <!-- Insights Header Card (Flush with tab shelf) -->
        <div class="insights-header-card">
          <!-- Telemetry Summary Banner -->
          <div class="insights-telemetry-banner">
            <div class="banner-stat">
              <span class="banner-stat-value font-mono">4</span>
              <span class="banner-stat-label font-mono">SEASONS LOGGED</span>
            </div>
            <div class="banner-divider" />
            <div class="banner-stat">
              <span class="banner-stat-value font-mono">350+</span>
              <span class="banner-stat-label font-mono">KM CARRIED</span>
            </div>
            <div class="banner-divider" />
            <div class="banner-stat">
              <span class="banner-stat-value font-mono">-25°C</span>
              <span class="banner-stat-label font-mono">COLD FLOOR</span>
            </div>
            <div class="banner-divider" />
            <div class="banner-stat">
              <span class="banner-stat-value font-mono text-success">0</span>
              <span class="banner-stat-label font-mono">SEAM FAILS</span>
            </div>
          </div>

          <div class="header-card-divider" />

          <!-- Category Filter Chips -->
          <div class="insight-filter-chips-row scrollbar-none">
            <button
              v-for="cat in insightCategories"
              :key="cat.id"
              :class="['insight-filter-chip font-mono', { active: selectedInsightCategory === cat.id }]"
              type="button"
              @click="selectedInsightCategory = cat.id"
            >
              {{ cat.label }}
            </button>
          </div>
        </div>

        <!-- Insights Stream List (Minimal Ledger Cards) -->
        <div class="insights-stream">
          <article
            v-for="insight in filteredInsights"
            :key="insight.id"
            class="ledger-card"
            @click="openInsight(insight)"
          >
            <!-- Card Thumbnail Hero -->
            <div class="card-hero-wrap">
              <img :src="insight.image" :alt="insight.title" class="card-hero-img" loading="lazy" />
              <div class="hero-overlay-tag font-mono">
                {{ insight.tag }}
              </div>
            </div>

            <!-- Card Body -->
            <div class="card-content">
              <div class="meta-row font-mono">
                <span class="meta-date">{{ insight.date }}</span>
                <span class="meta-sep">•</span>
                <span class="meta-read">{{ insight.readTime }}</span>
                <span class="meta-sep">•</span>
                <span class="meta-category">{{ insight.category }}</span>
              </div>

              <h2 class="card-headline font-serif">{{ insight.title }}</h2>

              <p class="card-excerpt font-serif">
                {{ insight.summary }}
              </p>

              <!-- Surveyor Tags / Key Telemetry Widgets -->
              <div class="card-tags-row">
                <span
                  v-for="t in insight.telemetry.slice(0, 2)"
                  :key="t.label"
                  class="tag-pill font-mono"
                >
                  <span class="material-symbols-outlined tag-icon">analytics</span>
                  <span>{{ t.label }}: <strong>{{ t.value }}</strong></span>
                </span>
                <span class="tag-pill font-mono">
                  <span class="material-symbols-outlined tag-icon">timer</span>
                  <span>{{ insight.duration }}</span>
                </span>
              </div>

              <!-- Footer Action -->
              <div class="card-footer">
                <span class="coord-tag font-mono">
                  {{ insight.equipmentTested.split('(')[0].trim() }}
                </span>
                <span class="read-action font-mono">
                  READ REVIEW <span class="material-symbols-outlined" style="font-size: 14px;">arrow_forward</span>
                </span>
              </div>
            </div>
          </article>
        </div>
      </main>

      <!-- ===================================================================== -->
      <!-- TAB 2: MY LOADOUTS VIEW                                               -->
      <!-- ===================================================================== -->
      <main v-else-if="activeMainTab === 'loadouts'" class="loadouts-view">
        <!-- Season Selector Buttons Widget -->
        <div class="season-selector-widget" @keydown="onSeasonKeydown">
          <!-- Widget Header Metadata -->
          <div class="season-selector-header font-mono">
            <span class="selector-header-title">
              <span class="selector-beacon" />
              <span>FIELD SEASON SELECTOR</span>
            </span>
            <span class="selector-header-active text-secondary">{{ activeLoadout.label }} LOADOUT</span>
          </div>

          <!-- 4 Season Buttons -->
          <div class="season-selector-buttons" role="radiogroup" aria-label="Select season loadout">
            <button
              v-for="(s, idx) in seasonStops"
              :key="s.id"
              :class="['season-value-node font-mono', { active: activeSeasonIndex === idx }]"
              type="button"
              role="radio"
              :aria-checked="activeSeasonIndex === idx"
              :tabindex="activeSeasonIndex === idx ? 0 : -1"
              @click="selectSeason(s.id)"
            >
              <span class="material-symbols-outlined value-icon">{{ s.icon }}</span>
              <span class="value-name">{{ s.name }}</span>
              <span class="value-sub font-mono">{{ s.sub }}</span>
            </button>
          </div>
        </div>

        <!-- Active Loadout Manifest Card -->
        <div class="manifest-card">
          <div class="manifest-top-meta">
            <div>
              <h2 class="manifest-title font-serif">{{ activeLoadout.title }}</h2>
              <p class="manifest-subtitle font-mono">{{ activeLoadout.subtitle }}</p>
            </div>
            <button
              class="copy-manifest-btn font-mono"
              type="button"
              title="Copy markdown packing manifest to clipboard"
              @click="copyLoadoutManifest"
            >
              <span class="material-symbols-outlined text-[15px]">content_copy</span>
              <span>{{ copyNotification ? 'COPIED!' : 'EXPORT' }}</span>
            </button>
          </div>

          <div class="manifest-stats-grid font-mono">
            <div class="manifest-stat">
              <span class="stat-label">BASE WEIGHT</span>
              <span class="stat-value">{{ computedTotalWeightKg }} <span class="stat-unit">KG</span></span>
            </div>
            <div class="manifest-divider" />
            <div class="manifest-stat">
              <span class="stat-label">TOTAL ITEMS</span>
              <span class="stat-value">{{ totalPackedItems }} <span class="stat-unit">PCS</span></span>
            </div>
            <div class="manifest-divider" />
            <div class="manifest-stat">
              <span class="stat-label">TEMP LIMIT</span>
              <span class="stat-value text-secondary">{{ activeLoadout.tempRange }}</span>
            </div>
            <div class="manifest-divider" />
            <div class="manifest-stat">
              <span class="stat-label">STATUS</span>
              <span class="stat-value text-success">FIELD READY</span>
            </div>
          </div>

          <!-- Terrain Stamp -->
          <div class="terrain-stamp font-mono">
            <span class="material-symbols-outlined text-[13px] text-secondary">terrain</span>
            <span>TERRAIN: {{ activeLoadout.terrain }}</span>
          </div>
        </div>

        <!-- Categorized Equipment Inventory Sections -->
        <div class="kits-list">
          <section
            v-for="cat in activeLoadout.categories"
            :key="cat.name"
            class="kit-category-section"
          >
            <div class="category-header font-mono">
              <div class="category-header-left">
                <span class="category-indicator" />
                <h3 class="category-title">{{ cat.name }}</h3>
              </div>
              <span class="category-item-count">
                {{ cat.items.length }} {{ cat.items.length === 1 ? 'ITEM' : 'ITEMS' }}
              </span>
            </div>

            <div class="items-table">
              <div
                v-for="item in cat.items"
                :key="item.id"
                class="gear-item-row"
              >
                <div class="item-primary">
                  <div class="item-name-row">
                    <span class="item-name font-serif">{{ item.name }}</span>
                    <span
                      :class="['status-chip font-mono', item.status.toLowerCase()]"
                    >
                      {{ item.status }}
                    </span>
                  </div>
                  <div class="item-spec font-mono">{{ item.spec }}</div>
                  <p class="item-note font-serif">{{ item.note }}</p>
                </div>

                <div class="item-side">
                  <div class="item-weight font-mono">
                    {{ item.weight }}
                  </div>
                  <button
                    v-if="getInsightForItem(item)"
                    type="button"
                    class="read-action font-mono"
                    title="Read field review & observations"
                    @click="openReviewForItem(item)"
                  >
                    READ REVIEW <span class="material-symbols-outlined" style="font-size: 14px;">arrow_forward</span>
                  </button>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  </div>

  <!-- Insight Full Item Review Modal -->
  <InsightReader
    :insight="selectedInsight"
    :is-open="isInsightReaderOpen"
    @close="closeInsight"
  />
</div>
</template>

<style scoped>
.gear-page {
  min-height: 100vh;
  min-height: 100dvh;
  padding-top: 56px;
  padding-bottom: 96px;
  background-color: var(--color-surface);
}

.gear-container {
  max-width: 680px;
  margin: 0 auto;
  padding: 16px;
}

.gear-header {
  margin-bottom: 20px;
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
  box-shadow: 0 0 6px rgba(217, 83, 30, 0.6);
}

.gear-title {
  font-size: 32px;
  font-weight: 500;
  line-height: 1.15;
  color: var(--color-primary);
  margin-bottom: 6px;
}

.gear-intro {
  font-size: 14px;
  line-height: 1.5;
  color: var(--color-on-surface-variant);
  margin-bottom: 18px;
}

/* ========================================================================= */
/* TWO PRIMARY LEDGER TABS (GEAR INSIGHTS vs MY LOADOUTS)                     */
/* Full-viewport tactile archival ledger tabs spanning the top edge          */
/* ========================================================================= */
.primary-ledger-tabs-shelf {
  display: flex;
  align-items: flex-end;
  height: 48px;
  margin: 0 -16px;
  padding: 0;
  gap: 0;
  position: relative;
  overflow: visible;
}

.primary-ledger-tab {
  position: relative;
  flex: 1 1 0;
  min-width: 0;
  height: 42px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  border-top-left-radius: 10px;
  border-top-right-radius: 10px;
  border-bottom-left-radius: 0;
  border-bottom-right-radius: 0;
  border: 1px solid rgba(115, 120, 116, 0.45);
  border-bottom: none;
  background: linear-gradient(180deg, #d8c8a8 0%, #cdbe9e 100%);
  color: #48524a;
  box-shadow: 0 -2px 6px rgba(27, 46, 36, 0.08);
  cursor: pointer;
  user-select: none;
  transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1), background 0.2s ease, box-shadow 0.2s ease, color 0.15s ease, height 0.2s ease;
  z-index: 1;
  padding: 0 8px;
}

.primary-ledger-tab:hover:not(.active) {
  transform: translateY(-2px);
  background: linear-gradient(180deg, #e0d0b0 0%, #d4c4a4 100%);
  color: var(--color-primary);
  z-index: 3;
}

.primary-ledger-tab.active {
  height: 48px;
  transform: translateY(0);
  background: linear-gradient(180deg, #faf4e8 0%, #f4ebd8 100%);
  border: 1.5px solid rgba(115, 120, 116, 0.55);
  border-bottom: none;
  color: var(--color-primary);
  box-shadow: 0 -3px 10px rgba(27, 46, 36, 0.1);
  z-index: 10;
}

/* Continuous skirt covering shelf baseline under active tab and anchoring onto page border */
.primary-ledger-tab.active::after {
  content: '';
  position: absolute;
  left: -1px;
  right: -1px;
  bottom: -2px;
  height: 3px;
  background: #f4ebd8;
  z-index: 10;
}

.tab-content-wrap {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
}

.primary-ledger-tab .tab-icon {
  font-size: 16px;
  color: var(--color-secondary);
  transition: transform 0.2s ease;
}

.primary-ledger-tab .tab-label {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.07em;
  text-transform: uppercase;
  color: inherit;
  white-space: nowrap;
}

.primary-ledger-tab .tab-badge {
  font-size: 9px;
  font-weight: 700;
  padding: 1px 6px;
  border-radius: 9999px;
  background-color: rgba(27, 46, 36, 0.08);
  border: 1px solid rgba(115, 120, 116, 0.3);
  color: var(--color-primary);
  line-height: 1.2;
}

.primary-ledger-tab.active .tab-badge {
  background-color: rgba(217, 83, 30, 0.12);
  border-color: rgba(217, 83, 30, 0.3);
  color: var(--color-secondary);
}

/* ========================================================================= */
/* SEPARATE PAGE CONTENT AREA (Distinct top border edge across viewport)     */
/* ========================================================================= */
.ledger-page-content {
  position: relative;
  border-top: 1.5px solid rgba(115, 120, 116, 0.45);
  margin: 0 -16px;
  padding: 20px 16px 0;
}

/* ========================================================================= */
/* CARDS LIVING ON THE PAGE (INSIGHTS HEADER & LOADOUT MANIFEST)             */
/* Full standalone borders and corner radius, distinct from the page border   */
/* ========================================================================= */
.insights-header-card,
.manifest-card {
  background-color: var(--color-surface-container-lowest);
  border: 1px solid rgba(115, 120, 116, 0.35);
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(27, 46, 36, 0.05);
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.header-card-divider {
  width: 100%;
  height: 1px;
  background-color: rgba(115, 120, 116, 0.18);
}

/* ========================================================================= */
/* TAB 1: GEAR INSIGHTS STYLES                                               */
/* ========================================================================= */
.insights-telemetry-banner {
  display: flex;
  align-items: center;
  justify-content: space-around;
  background-color: var(--color-surface-container-low);
  border: 1px solid rgba(115, 120, 116, 0.2);
  border-radius: 6px;
  padding: 10px 4px;
}

.banner-stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.banner-stat-value {
  font-size: 16px;
  font-weight: 700;
  color: var(--color-primary);
  letter-spacing: -0.02em;
}

.banner-stat-label {
  font-size: 8px;
  font-weight: 600;
  color: var(--color-on-surface-variant);
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.banner-divider {
  width: 1px;
  height: 24px;
  background-color: rgba(115, 120, 116, 0.2);
}

.insight-filter-chips-row {
  display: flex;
  gap: 6px;
  overflow-x: auto;
  padding: 2px 0 14px;
}

.insight-filter-chip {
  flex-shrink: 0;
  height: 30px;
  padding: 0 12px;
  border-radius: 9999px;
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  background-color: var(--color-surface-container);
  color: var(--color-on-surface-variant);
  border: 1px solid rgba(115, 120, 116, 0.35);
  cursor: pointer;
  transition: all 0.15s ease;
}

.insight-filter-chip.active {
  background-color: var(--color-primary);
  color: #ffffff;
  border-color: var(--color-primary);
}

.insights-stream {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* ========================================================================= */
/* MINIMAL INSIGHT LEDGER CARDS (MATCHING PAGES/LEDGER.VUE ARCHITECTURE)     */
/* ========================================================================= */
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
  -webkit-backdrop-filter: blur(6px);
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

.meta-category {
  color: var(--color-primary);
  font-weight: 600;
  text-transform: uppercase;
}

.meta-sep {
  opacity: 0.5;
}

.card-headline {
  font-size: 19px;
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
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 0;
  transition: transform 0.15s ease, color 0.15s ease;
  line-height: 1.2;
}

.ledger-card:hover .read-action,
.gear-item-row:hover .read-action {
  transform: translateX(2px);
}

.read-action:hover {
  transform: translateX(3px) !important;
  color: #b84314;
}

.coord-tag {
  font-size: 9px;
  color: var(--color-lichen-slate);
  letter-spacing: 0.05em;
  max-width: 240px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* ========================================================================= */
/* TAB 2: STYLIZED 4-STOP SEASONAL SELECTOR SLIDER                           */
/* Precision field instrument slide selector with discrete station detents   */
/* ========================================================================= */
.season-selector-widget {
  background-color: var(--color-surface-container-low);
  border: 1px solid rgba(115, 120, 116, 0.35);
  border-radius: 8px;
  padding: 12px 14px 12px;
  margin-bottom: 18px;
  box-shadow: 0 1px 4px rgba(27, 46, 36, 0.04);
}

.season-selector-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
  font-size: 9.5px;
  font-weight: 700;
}

.selector-header-title {
  display: flex;
  align-items: center;
  gap: 6px;
  color: var(--color-on-surface-variant);
  letter-spacing: 0.08em;
}

.selector-beacon {
  width: 5px;
  height: 5px;
  border-radius: 9999px;
  background-color: var(--color-secondary);
  box-shadow: 0 0 5px rgba(217, 83, 30, 0.6);
}

.selector-header-active {
  color: var(--color-secondary);
  letter-spacing: 0.06em;
  font-weight: 700;
  text-transform: uppercase;
}

/* 4 SEASON BUTTONS */
.season-selector-buttons {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 6px;
}

.season-value-node {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: rgba(238, 223, 197, 0.2);
  border: 1px solid rgba(115, 120, 116, 0.25);
  border-radius: 6px;
  cursor: pointer;
  padding: 10px 6px;
  color: #556057;
  user-select: none;
  transition: all 0.18s ease;
  position: relative;
}

.season-value-node:hover:not(.active) {
  color: var(--color-primary);
  background-color: rgba(238, 223, 197, 0.45);
  border-color: rgba(115, 120, 116, 0.4);
}

.season-value-node.active {
  background-color: #ffffff;
  border-color: var(--color-secondary);
  box-shadow: 0 1px 4px rgba(27, 46, 36, 0.1);
}

.value-icon {
  font-size: 20px;
  line-height: 1;
  color: #647066;
  margin-bottom: 4px;
  transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1), color 0.15s ease;
}

.season-value-node:hover:not(.active) .value-icon {
  color: var(--color-primary);
  transform: translateY(-1px);
}

.season-value-node.active .value-icon {
  color: var(--color-secondary);
  transform: translateY(-1px) scale(1.08);
}

.value-name {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.07em;
  text-transform: uppercase;
  color: inherit;
  line-height: 1.1;
}

.season-value-node.active .value-name {
  font-weight: 700;
  color: var(--color-primary);
}

.value-sub {
  font-size: 8px;
  font-weight: 600;
  letter-spacing: 0.05em;
  color: var(--color-lichen-slate);
  margin-top: 2px;
  line-height: 1;
}

.season-value-node.active .value-sub {
  color: var(--color-secondary);
  font-weight: 700;
}

.manifest-top-meta {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.manifest-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--color-primary);
  line-height: 1.25;
}

.manifest-subtitle {
  font-size: 10px;
  color: var(--color-on-surface-variant);
  margin-top: 2px;
}

.copy-manifest-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  height: 28px;
  padding: 0 10px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.06em;
  background-color: var(--color-surface-container-high);
  border: 1px solid rgba(115, 120, 116, 0.35);
  color: var(--color-primary);
  cursor: pointer;
  transition: all 0.15s ease;
  flex-shrink: 0;
}

.copy-manifest-btn:hover {
  background-color: var(--color-primary);
  color: #ffffff;
}

.manifest-stats-grid {
  display: flex;
  align-items: center;
  justify-content: space-around;
  background-color: var(--color-surface-container-low);
  border: 1px solid rgba(115, 120, 116, 0.2);
  border-radius: 6px;
  padding: 10px 4px;
}

.manifest-stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.stat-label {
  font-size: 8px;
  color: var(--color-on-surface-variant);
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.stat-value {
  font-size: 12px;
  font-weight: 700;
  color: var(--color-primary);
}

.stat-unit {
  font-size: 8px;
  color: var(--color-secondary);
}

.manifest-divider {
  width: 1px;
  height: 20px;
  background-color: rgba(115, 120, 116, 0.25);
}

.terrain-stamp {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 10px;
  color: var(--color-on-surface-variant);
  background-color: var(--color-surface-container);
  padding: 4px 8px;
  border-radius: 4px;
  border: 1px dashed rgba(115, 120, 116, 0.3);
}

.kits-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.kit-category-section {
  background-color: var(--color-card-bg);
  border: 1px solid var(--color-card-border);
  border-radius: 8px;
  overflow: hidden;
  box-shadow: var(--color-card-shadow);
}

.category-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 14px;
  background-color: var(--color-surface-container);
  border-bottom: 1px solid rgba(115, 120, 116, 0.25);
}

.category-header-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.category-indicator {
  width: 6px;
  height: 6px;
  border-radius: 9999px;
  background-color: var(--color-secondary);
}

.category-title {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--color-primary);
}

.category-item-count {
  font-size: 9px;
  font-weight: 600;
  color: var(--color-lichen-slate);
}

.items-table {
  display: flex;
  flex-direction: column;
}

.gear-item-row {
  display: flex;
  align-items: stretch;
  justify-content: space-between;
  padding: 12px 14px;
  border-bottom: 1px solid rgba(115, 120, 116, 0.15);
  gap: 16px;
}

.gear-item-row:last-child {
  border-bottom: none;
}

.item-primary {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.item-side {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  justify-content: space-between;
  gap: 10px;
  flex-shrink: 0;
}

.item-name-row {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.item-name {
  font-size: 15px;
  font-weight: 500;
  color: var(--color-primary);
}

.status-chip {
  padding: 2px 6px;
  border-radius: 3px;
  font-size: 8px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.status-chip.packed {
  background-color: rgba(4, 120, 87, 0.12);
  color: #047857;
  border: 1px solid rgba(4, 120, 87, 0.3);
}

.status-chip.essential {
  background-color: rgba(217, 83, 30, 0.12);
  color: var(--color-secondary);
  border: 1px solid rgba(217, 83, 30, 0.3);
}

.status-chip.ready {
  background-color: rgba(66, 72, 68, 0.12);
  color: var(--color-on-surface-variant);
  border: 1px solid rgba(66, 72, 68, 0.3);
}

.item-spec {
  font-size: 10px;
  color: var(--color-on-surface-variant);
}

.item-note {
  font-size: 12px;
  color: rgba(66, 72, 68, 0.85);
  line-height: 1.4;
  margin-top: 2px;
}

.item-weight {
  font-size: 11px;
  font-weight: 600;
  color: var(--color-primary);
  white-space: nowrap;
  background-color: rgba(231, 226, 214, 0.5);
  padding: 3px 6px;
  border-radius: 4px;
}

.text-success {
  color: #047857;
}

.text-secondary {
  color: var(--color-secondary);
}
</style>
