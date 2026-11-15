<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'
import {
  type LoadoutKit,
  type GearInsight
} from '~/data/mockGearData'
import { useNitfCms } from '~/composables/useNitfCms'

const { gearItems, gearInsights, loadoutKits, gearCategories, error: cmsError, fetchGear } = useNitfCms()

await useAsyncData('nitf-gear-ledger', () => fetchGear())

useHead({
  title: 'Backcountry Gear Ledger — Nerd in the Forest',
  meta: [
    {
      name: 'description',
      content: 'Tested equipment inventory, seasonal Nordic kits, durability observations, and field survival gear insights.'
    },
    { property: 'og:title', content: 'Backcountry Gear Ledger — Nerd in the Forest' },
    { property: 'og:description', content: 'Surveyed equipment inventory, weights, and field gear reviews.' }
  ]
})

const route = useRoute()
const router = useRouter()

// Two Main Ledger Tabs: 'insights' (Reviews) vs 'loadouts' (My Gear)
type MainTab = 'insights' | 'loadouts'
const activeMainTab = ref<MainTab>('insights')

// INSIGHTS TAB STATE
const selectedInsightCategory = ref('ALL')
const insightSearchQuery = ref('')
const selectedGearItemFilter = ref<string | null>(null)
const highlightedGearItemId = ref<string | null>(null)
const DEFAULT_GEAR_HERO_IMAGE = 'https://images.unsplash.com/photo-1510312305653-8ed496efae75?auto=format&fit=crop&w=1000&q=80'

const insightCategories = [
  { id: 'ALL', label: 'All Gear' },
  { id: 'SHELTER & SLEEP', label: 'Tents, Bags & Sleep' },
  { id: 'COOK & WATER', label: 'Stoves, Cook & Water' },
  { id: 'NAVIGATION & TOOLS', label: 'Tools & Navigation' },
  { id: 'PACK & APPAREL', label: 'Packs & Apparel' },
  { id: 'FIELD REPAIR & HYGIENE', label: 'Repair & Hygiene' }
]

const CATEGORY_KEYWORDS: Record<string, string[]> = {
  'SHELTER & SLEEP': ['tent', 'tents', 'shelter', 'bag', 'bags', 'sleeping', 'quilt', 'pad', 'mat', 'mattress', 'bivy', 'tarp', 'stake', 'peg'],
  'COOK & WATER': ['stove', 'stoves', 'burner', 'cook', 'cooking', 'pot', 'kettle', 'water', 'filter', 'purifier', 'bottle', 'flask', 'fuel'],
  'NAVIGATION & TOOLS': ['tool', 'tools', 'knife', 'knives', 'blade', 'saw', 'axe', 'compass', 'gps', 'navigation', 'map', 'headlamp', 'flashlight', 'light', 'lantern'],
  'PACK & APPAREL': ['pack', 'packs', 'backpack', 'rucksack', 'bag', 'bags', 'drybag', 'jacket', 'shell', 'coat', 'pants', 'trousers', 'boots', 'gloves', 'hat', 'layer', 'wool', 'apparel', 'clothing'],
  'FIELD REPAIR & HYGIENE': ['repair', 'patch', 'tape', 'glue', 'seam', 'kit', 'first aid', 'medical', 'hygiene', 'trowel', 'soap', 'multi-tool']
}

function getInsightGearCategory(insight: GearInsight): string {
  if (insight.gearCategoryLabel) return insight.gearCategoryLabel
  const catTelemetry = insight.telemetry?.find(t => t.label === 'CATEGORY')
  return catTelemetry?.value || ''
}

const selectedGearItemFilterName = computed(() => {
  if (!selectedGearItemFilter.value) return null
  const foundItem = gearItems.value.find(i => String(i.id) === String(selectedGearItemFilter.value))
  if (foundItem) return `${foundItem.brand} ${foundItem.name}`.trim()
  const foundInsight = gearInsights.value.find(i => String(i.gearItemId) === String(selectedGearItemFilter.value))
  return foundInsight?.gearItemName || 'Selected Gear'
})

const filteredInsights = computed<GearInsight[]>(() => {
  const query = insightSearchQuery.value.trim().toLowerCase()
  return gearInsights.value.filter(i => {
    const itemCat = getInsightGearCategory(i)
    const matchesCategory =
      selectedInsightCategory.value === 'ALL' ||
      itemCat === selectedInsightCategory.value ||
      i.category === selectedInsightCategory.value
    const matchesGearItem = !selectedGearItemFilter.value || String(i.gearItemId) === String(selectedGearItemFilter.value)

    if (!matchesCategory || !matchesGearItem) return false
    if (!query) return true

    const keywords = CATEGORY_KEYWORDS[itemCat] || []
    const searchableText = [
      i.title,
      i.gearItemName,
      i.equipmentTested,
      i.summary,
      i.verdict,
      itemCat,
      i.category,
      ...(i.observations || []),
      ...keywords
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()

    return query.split(/\s+/).every(term => searchableText.includes(term))
  })
})

function resetInsightFilters() {
  selectedInsightCategory.value = 'ALL'
  insightSearchQuery.value = ''
  selectedGearItemFilter.value = null
}

const insightFilterRowRef = ref<HTMLElement | null>(null)
const lockerFilterRowRef = ref<HTMLElement | null>(null)
const loadoutCardsRowRef = ref<HTMLElement | null>(null)
const insightScrollPos = ref<'start' | 'mid' | 'end'>('start')
const lockerScrollPos = ref<'start' | 'mid' | 'end'>('start')
const loadoutScrollPos = ref<'start' | 'mid' | 'end'>('start')

function updateScrollPos(el: HTMLElement | null, target: 'insight' | 'locker' | 'loadout') {
  if (!el) return
  const maxScroll = el.scrollWidth - el.clientWidth
  let state: 'start' | 'mid' | 'end' = 'start'
  if (maxScroll <= 4) {
    state = 'end'
  } else if (el.scrollLeft <= 6) {
    state = 'start'
  } else if (el.scrollLeft >= maxScroll - 6) {
    state = 'end'
  } else {
    state = 'mid'
  }
  if (target === 'insight') insightScrollPos.value = state
  else if (target === 'locker') lockerScrollPos.value = state
  else loadoutScrollPos.value = state
}

function nudgeHorizontalScroll(el: HTMLElement | null, direction: 'left' | 'right' = 'right', target?: 'insight' | 'locker' | 'loadout') {
  if (!el || typeof el.scrollBy !== 'function') return
  const amount = direction === 'right' ? 200 : -200
  el.scrollBy({ left: amount, behavior: 'smooth' })
  if (target) {
    setTimeout(() => updateScrollPos(el, target), 220)
  }
}

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

onMounted(async () => {
  await fetchGear()
  if (route.query.tab === 'gear') {
    activeMainTab.value = 'loadouts'
  }
  if (route.query.loadout) {
    activeMainTab.value = 'loadouts'
    gearSubMode.value = 'loadouts'
    selectLoadoutById(String(route.query.loadout))
  }
  if (route.query.insight) {
    const match = gearInsights.value.find(i => i.id === route.query.insight)
    if (match) {
      openInsight(match)
    }
  }
})

/**
 * Returns ALL reviews linked to a given gear item (one item can have several reviews)
 */
function getInsightsForItem(item: any): GearInsight[] {
  const itemIdStr = String(item.id)
  const byId = gearInsights.value.filter(i => {
    if (i.gearItemId && String(i.gearItemId) === itemIdStr) return true
    if (Array.isArray(item.insightIds) && item.insightIds.includes(i.id)) return true
    if (item.insightId && i.id === item.insightId) return true
    return false
  })
  if (byId.length > 0) return byId

  const lowerName = (item.name || '').toLowerCase()
  return gearInsights.value.filter(i => {
    const equip = (i.equipmentTested || '').toLowerCase()
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

function getRelatedInsights(insight: GearInsight | null): GearInsight[] {
  if (!insight || !insight.gearItemId) return []
  return gearInsights.value.filter(
    i => String(i.gearItemId) === String(insight.gearItemId) && i.id !== insight.id
  )
}

function openReviewForItem(item: any) {
  const insights = getInsightsForItem(item)
  if (insights.length === 1) {
    openInsight(insights[0])
  } else if (insights.length > 1) {
    selectedGearItemFilter.value = String(item.id)
    selectedInsightCategory.value = 'ALL'
    activeMainTab.value = 'insights'
  }
}

// =========================================================================
// MY GEAR TAB: DUAL-MODE (EQUIPMENT LOCKER vs FIELD LOADOUTS BROWSER)
// =========================================================================
type GearSubMode = 'locker' | 'loadouts'
const gearSubMode = ref<GearSubMode>('locker')

// 1. EQUIPMENT LOCKER STATE (Master Gear Catalog with Category Filter & Search)
const selectedLockerCategory = ref('ALL')
const lockerSearchQuery = ref('')
const expandedItemLoadouts = ref<Record<string, boolean>>({})

function toggleItemLoadouts(itemId: string | number) {
  const key = String(itemId)
  expandedItemLoadouts.value[key] = !expandedItemLoadouts.value[key]
}

function isItemLoadoutsExpanded(itemId: string | number): boolean {
  return Boolean(expandedItemLoadouts.value[String(itemId)])
}

function getCategoryWeightFormatted(items: any[]): string {
  const grams = (items || []).reduce((sum, item) => sum + (Number(item.weightGrams) || 0), 0)
  if (grams >= 1000) {
    return `${(grams / 1000).toFixed(2)} KG`
  }
  return `${Math.round(grams)} G`
}
const lockerCategoryFilters = [
  { id: 'ALL', label: 'All Gear' },
  { id: 'PACKED', label: 'Packed' },
  { id: 'SHELTER & SLEEP', label: 'Tents, Bags & Sleep' },
  { id: 'COOK & WATER', label: 'Stoves, Cook & Water' },
  { id: 'NAVIGATION & TOOLS', label: 'Tools & Navigation' },
  { id: 'PACK & APPAREL', label: 'Packs & Apparel' },
  { id: 'FIELD REPAIR & HYGIENE', label: 'Repair & Hygiene' }
]

const filteredLockerCategories = computed(() => {
  const query = lockerSearchQuery.value.trim().toLowerCase()
  const isPackedFilter = selectedLockerCategory.value === 'PACKED'
  const baseCats = (selectedLockerCategory.value === 'ALL' || isPackedFilter)
    ? gearCategories.value
    : gearCategories.value.filter(cat => cat.name === selectedLockerCategory.value)

  if (!query && !isPackedFilter) return baseCats

  return baseCats
    .map(cat => {
      const keywords = CATEGORY_KEYWORDS[cat.name] || []
      const matchedItems = cat.items.filter(item => {
        if (isPackedFilter && !(item.loadouts && item.loadouts.length > 0) && item.status !== 'PACKED') {
          return false
        }
        if (!query) return true
        const text = [
          item.name,
          item.brand,
          item.spec,
          item.note,
          item.status,
          cat.name,
          ...keywords
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()
        return query.split(/\s+/).every(term => text.includes(term))
      })
      return { ...cat, items: matchedItems }
    })
    .filter(cat => cat.items.length > 0)
})

const totalLockerItemsCount = computed(() => {
  let count = 0
  filteredLockerCategories.value.forEach(cat => {
    count += cat.items.length
  })
  return count
})

const lockerReviewedCount = computed(() => {
  let count = 0
  filteredLockerCategories.value.forEach(cat => {
    cat.items.forEach(item => {
      if (getInsightsForItem(item).length > 0) count += 1
    })
  })
  return count
})

const lockerTotalWeightKg = computed(() => {
  let grams = 0
  filteredLockerCategories.value.forEach(cat => {
    cat.items.forEach(item => {
      grams += item.weightGrams || 0
    })
  })
  return (grams / 1000).toFixed(2)
})

async function navigateToGearItem(gearItemId?: string) {
  if (!gearItemId) return
  closeInsight()
  activeMainTab.value = 'loadouts'
  gearSubMode.value = 'locker'
  selectedLockerCategory.value = 'ALL'
  expandedItemLoadouts.value[String(gearItemId)] = true
  highlightedGearItemId.value = String(gearItemId)
  await nextTick()
  if (typeof document !== 'undefined') {
    const el = document.getElementById(`gear-item-${gearItemId}`)
    if (el && typeof el.scrollIntoView === 'function') {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }
  setTimeout(() => {
    if (highlightedGearItemId.value === String(gearItemId)) {
      highlightedGearItemId.value = null
    }
  }, 2600)
}

// 2. FIELD LOADOUTS BROWSER STATE (Multi-Loadout per Season)
type LoadoutSeasonFilter = 'ALL' | 'SPRING' | 'SUMMER' | 'AUTUMN' | 'WINTER'
interface SeasonFilterStop {
  id: LoadoutSeasonFilter
  name: string
  icon: string
}

const loadoutSeasonFilters: SeasonFilterStop[] = [
  { id: 'ALL', name: 'All Seasons', icon: 'layers' },
  { id: 'SPRING', name: 'Spring', icon: 'eco' },
  { id: 'SUMMER', name: 'Summer', icon: 'wb_sunny' },
  { id: 'AUTUMN', name: 'Autumn', icon: 'forest' },
  { id: 'WINTER', name: 'Winter', icon: 'ac_unit' }
]

const selectedLoadoutSeason = ref<LoadoutSeasonFilter>('ALL')
const selectedLoadoutId = ref<string>('')

function getLoadoutCountBySeason(season: LoadoutSeasonFilter): number {
  if (season === 'ALL') return loadoutKits.value.length
  return loadoutKits.value.filter(k => k.season === season).length
}

const filteredLoadoutKits = computed<LoadoutKit[]>(() => {
  if (selectedLoadoutSeason.value === 'ALL') {
    return loadoutKits.value
  }
  return loadoutKits.value.filter(k => k.season === selectedLoadoutSeason.value)
})

function selectLoadoutSeason(season: LoadoutSeasonFilter) {
  selectedLoadoutSeason.value = season
  const matches = season === 'ALL'
    ? loadoutKits.value
    : loadoutKits.value.filter(k => k.season === season)
  if (matches.length > 0 && !matches.some(k => k.id === selectedLoadoutId.value)) {
    selectedLoadoutId.value = matches[0].id
  }
}

function selectLoadoutById(loadoutIdOrSlug: string) {
  gearSubMode.value = 'loadouts'
  const match = loadoutKits.value.find(
    k => k.id === loadoutIdOrSlug || k.slug === loadoutIdOrSlug
  )
  if (match) {
    selectedLoadoutSeason.value = 'ALL'
    selectedLoadoutId.value = match.id
    if (typeof window !== 'undefined') {
      router.replace({ query: { ...route.query, tab: 'gear', loadout: match.slug || match.id } })
    }
  }
}

const activeLoadout = computed<LoadoutKit | null>(() => {
  const list = filteredLoadoutKits.value.length > 0 ? filteredLoadoutKits.value : loadoutKits.value
  if (list.length === 0) return null
  return list.find(k => k.id === selectedLoadoutId.value || k.slug === selectedLoadoutId.value) || list[0]
})

function getKitItemsCount(kit: LoadoutKit): number {
  if (kit.totalItemsCount != null) return kit.totalItemsCount
  let count = 0
  kit.categories.forEach(c => {
    count += c.items.length
  })
  return count
}

const totalPackedItems = computed(() => {
  if (!activeLoadout.value) return 0
  return getKitItemsCount(activeLoadout.value)
})

const computedTotalWeightKg = computed(() => {
  if (!activeLoadout.value) return '0.00'
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
  if (typeof window === 'undefined' || !activeLoadout.value) return
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
          Surveyed backcountry equipment, seasonal kits, durability logs, and field reviews linked directly to every piece of gear carried.
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
            <span class="tab-badge">{{ gearInsights.length }}</span>
          </div>
        </button>

        <button
          :class="['primary-ledger-tab', { active: activeMainTab === 'loadouts' }]"
          type="button"
          @click="activeMainTab = 'loadouts'"
        >
          <div class="tab-content-wrap">
            <span class="material-symbols-outlined tab-icon">backpack</span>
            <span class="tab-label">MY GEAR</span>
            <span class="tab-badge">{{ gearItems.length }}</span>
          </div>
        </button>
      </nav>

      <!-- SEPARATE PAGE CONTENT AREA (Top border edge defining the page) -->
      <div class="ledger-page-content">
        <!-- ===================================================================== -->
        <!-- TAB 1: GEAR INSIGHTS VIEW (REVIEWS)                                   -->
        <!-- ===================================================================== -->
        <main v-if="activeMainTab === 'insights'" class="insights-view">
        <!-- Insights Header Card (Flush with tab shelf) -->
        <div class="insights-header-card">
          <!-- Telemetry Summary Banner -->
          <div class="insights-telemetry-banner">
            <div class="banner-stat">
              <span class="banner-stat-value font-mono">{{ gearInsights.length }}</span>
              <span class="banner-stat-label font-mono">REVIEWS LOGGED</span>
            </div>
            <div class="banner-divider" />
            <div class="banner-stat">
              <span class="banner-stat-value font-mono">{{ gearItems.length }}</span>
              <span class="banner-stat-label font-mono">GEAR ITEMS</span>
            </div>
          </div>

          <div class="header-card-divider" />

          <!-- Search Bar for Gear Reviews -->
          <div class="insight-search-bar">
            <span class="material-symbols-outlined search-icon">search</span>
            <input
              v-model="insightSearchQuery"
              type="search"
              class="insight-search-input font-mono"
              placeholder="Search tents, sleeping bags, stoves, packs, tools, or brands..."
              aria-label="Search gear reviews"
            />
            <button
              v-if="insightSearchQuery"
              type="button"
              class="insight-search-clear"
              aria-label="Clear search"
              @click="insightSearchQuery = ''"
            >
              <span class="material-symbols-outlined text-[15px]">close</span>
            </button>
          </div>

          <!-- Equipment Category Filter Chips with Subtle Edge Fade & Whisper Chevron -->
          <div class="filter-scroll-shell">
            <button
              v-if="insightScrollPos !== 'start'"
              type="button"
              class="filter-edge-hint left"
              aria-label="Scroll filters left"
              @click="nudgeHorizontalScroll(insightFilterRowRef, 'left', 'insight')"
            >
              <span class="material-symbols-outlined">chevron_left</span>
            </button>
            <div
              ref="insightFilterRowRef"
              :class="[
                'insight-filter-chips-row scroll-hint-x',
                {
                  'scrolled-mid': insightScrollPos === 'mid',
                  'scrolled-end': insightScrollPos === 'end'
                }
              ]"
              @scroll="updateScrollPos(insightFilterRowRef, 'insight')"
            >
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
            <button
              v-if="insightScrollPos !== 'end'"
              type="button"
              class="filter-edge-hint right"
              aria-label="Scroll filters right"
              @click="nudgeHorizontalScroll(insightFilterRowRef, 'right', 'insight')"
            >
              <span class="material-symbols-outlined">chevron_right</span>
            </button>
          </div>

          <!-- Active Gear Item Filter Banner (when viewing all reviews for a specific gear item) -->
          <div
            v-if="selectedGearItemFilter"
            class="active-gear-filter-banner font-mono"
          >
            <div class="filter-banner-left">
              <span class="material-symbols-outlined text-[14px] text-secondary">filter_alt</span>
              <span>SHOWING REVIEWS FOR: <strong>{{ selectedGearItemFilterName }}</strong></span>
            </div>
            <button
              type="button"
              class="clear-gear-filter-btn font-mono"
              @click="selectedGearItemFilter = null"
            >
              <span>SHOW ALL REVIEWS</span>
              <span class="material-symbols-outlined text-[13px]">close</span>
            </button>
          </div>
        </div>

        <!-- Empty State when no reviews match search/filter -->
        <div v-if="filteredInsights.length === 0" class="insights-empty-state font-mono">
          <span class="material-symbols-outlined empty-icon">manage_search</span>
          <p class="empty-title">
            {{
              gearInsights.length === 0
                ? (cmsError ? 'UNABLE TO REACH BASECAMP CMS' : 'NO GEAR REVIEWS PUBLISHED YET')
                : 'NO GEAR REVIEWS MATCH CURRENT FILTER'
            }}
          </p>
          <p class="empty-sub font-serif">
            {{
              gearInsights.length === 0
                ? (cmsError
                    ? 'Long-term gear reports will load once CMS connectivity is restored.'
                    : 'Long-term equipment field reports will appear here once published.')
                : 'Try searching for another item type (e.g. tent, stove, knife, pack) or reset the equipment filter.'
            }}
          </p>
          <button
            type="button"
            class="reset-filter-btn font-mono"
            @click="resetInsightFilters"
          >
            RESET SEARCH & FILTERS
          </button>
        </div>

        <!-- Insights Stream List (Minimal Ledger Cards) -->
        <div v-else class="insights-stream">
          <article
            v-for="insight in filteredInsights"
            :key="insight.id"
            class="ledger-card"
            @click="openInsight(insight)"
          >
            <!-- Card Thumbnail Hero -->
            <div class="card-hero-wrap">
              <img :src="insight.image || DEFAULT_GEAR_HERO_IMAGE" :alt="insight.title" class="card-hero-img" loading="lazy" />
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

              <!-- Footer Action: Linked Gear Item + Read Review -->
              <div class="card-footer">
                <button
                  type="button"
                  class="coord-tag gear-link-chip font-mono"
                  title="View this item in My Gear"
                  @click.stop="navigateToGearItem(insight.gearItemId)"
                >
                  <span class="material-symbols-outlined text-[13px]">backpack</span>
                  <span>{{ insight.gearItemName || insight.equipmentTested.split('(')[0].trim() }}</span>
                </button>
                <span class="read-action font-mono">
                  READ REVIEW <span class="material-symbols-outlined" style="font-size: 14px;">arrow_forward</span>
                </span>
              </div>
            </div>
          </article>
        </div>
      </main>

      <!-- ===================================================================== -->
      <!-- TAB 2: MY GEAR VIEW (EQUIPMENT LOCKER & MULTI-LOADOUT BROWSER)        -->
      <!-- ===================================================================== -->
      <main v-else-if="activeMainTab === 'loadouts'" class="loadouts-view">
        <!-- Dual-Mode Segmented Switcher: Equipment Locker vs Field Loadouts -->
        <div class="gear-submode-bar font-mono" role="tablist" aria-label="My Gear View Mode">
          <button
            type="button"
            role="tab"
            :aria-selected="gearSubMode === 'locker'"
            :class="['gear-submode-btn', { active: gearSubMode === 'locker' }]"
            @click="gearSubMode = 'locker'"
          >
            <span class="material-symbols-outlined text-[16px]">inventory_2</span>
            <span>EQUIPMENT LOCKER</span>
            <span class="submode-count">{{ gearItems.length }}</span>
          </button>

          <button
            type="button"
            role="tab"
            :aria-selected="gearSubMode === 'loadouts'"
            :class="['gear-submode-btn', { active: gearSubMode === 'loadouts' }]"
            @click="gearSubMode = 'loadouts'"
          >
            <span class="material-symbols-outlined text-[16px]">checklist_rtl</span>
            <span>FIELD LOADOUTS</span>
            <span class="submode-count">{{ loadoutKits.length }}</span>
          </button>
        </div>

        <!-- =============================================================== -->
        <!-- SUB-MODE A: EQUIPMENT LOCKER (MASTER CATALOG & CATEGORY FILTER) -->
        <!-- =============================================================== -->
        <template v-if="gearSubMode === 'locker'">
          <div class="locker-controls-card">
            <!-- Top Row: Search Bar + Concise Summary Pill -->
            <div class="locker-search-row">
              <div class="insight-search-bar locker-search-bar">
                <span class="material-symbols-outlined search-icon">search</span>
                <input
                  v-model="lockerSearchQuery"
                  type="search"
                  class="insight-search-input font-mono"
                  placeholder="Search gear by name, brand, or spec..."
                  aria-label="Search equipment locker"
                />
                <button
                  v-if="lockerSearchQuery"
                  type="button"
                  class="insight-search-clear"
                  aria-label="Clear locker search"
                  @click="lockerSearchQuery = ''"
                >
                  <span class="material-symbols-outlined text-[15px]">close</span>
                </button>
              </div>

              <div class="locker-summary-pill font-mono">
                <strong>{{ totalLockerItemsCount }}</strong> ITEMS
                <span class="pill-dot">•</span>
                <strong>{{ lockerTotalWeightKg }}</strong> KG
              </div>
            </div>

            <!-- Category Filter Chips -->
            <div class="filter-scroll-shell">
              <button
                v-if="lockerScrollPos !== 'start'"
                type="button"
                class="filter-edge-hint left"
                aria-label="Scroll filters left"
                @click="nudgeHorizontalScroll(lockerFilterRowRef, 'left', 'locker')"
              >
                <span class="material-symbols-outlined">chevron_left</span>
              </button>
              <div
                ref="lockerFilterRowRef"
                :class="[
                  'insight-filter-chips-row scroll-hint-x',
                  {
                    'scrolled-mid': lockerScrollPos === 'mid',
                    'scrolled-end': lockerScrollPos === 'end'
                  }
                ]"
                @scroll="updateScrollPos(lockerFilterRowRef, 'locker')"
              >
                <button
                  v-for="cat in lockerCategoryFilters"
                  :key="cat.id"
                  :class="['insight-filter-chip font-mono', { active: selectedLockerCategory === cat.id }]"
                  type="button"
                  @click="selectedLockerCategory = cat.id"
                >
                  {{ cat.label }}
                </button>
              </div>
              <button
                v-if="lockerScrollPos !== 'end'"
                type="button"
                class="filter-edge-hint right"
                aria-label="Scroll filters right"
                @click="nudgeHorizontalScroll(lockerFilterRowRef, 'right', 'locker')"
              >
                <span class="material-symbols-outlined">chevron_right</span>
              </button>
            </div>
          </div>

          <!-- Categorized Master Equipment Inventory -->
          <div v-if="filteredLockerCategories.length === 0" class="insights-empty-state font-mono">
            <span class="material-symbols-outlined empty-icon">inventory_2</span>
            <p class="empty-title">
              {{
                gearItems.length === 0
                  ? (cmsError ? 'UNABLE TO REACH BASECAMP CMS' : 'NO EQUIPMENT ITEMS CATALOGED YET')
                  : 'NO GEAR MATCHES CURRENT FILTER'
              }}
            </p>
            <p class="empty-sub font-serif">
              {{
                gearItems.length === 0
                  ? (cmsError
                      ? 'Master locker inventory will sync when Basecamp CMS is online.'
                      : 'Master locker equipment items will appear here once published.')
                  : 'Try clearing your locker search or switching to ALL CATEGORIES.'
              }}
            </p>
          </div>
          <div v-else class="kits-list">
            <section
              v-for="cat in filteredLockerCategories"
              :key="cat.name"
              class="kit-category-section"
            >
              <div class="category-header font-mono">
                <div class="category-header-left">
                  <span class="category-indicator" />
                  <h3 class="category-title">{{ cat.name }}</h3>
                </div>
                <div class="category-header-right">
                  <span class="category-weight-badge">{{ getCategoryWeightFormatted(cat.items) }}</span>
                  <span class="category-item-count">
                    {{ cat.items.length }} {{ cat.items.length === 1 ? 'ITEM' : 'ITEMS' }}
                  </span>
                </div>
              </div>

              <div class="items-table">
                <div
                  v-for="item in cat.items"
                  :id="`gear-item-${item.id}`"
                  :key="item.id"
                  :class="[
                    'gear-item-row is-interactive',
                    {
                      'gear-item-highlighted': highlightedGearItemId === String(item.id),
                      'is-expanded': isItemLoadoutsExpanded(item.id)
                    }
                  ]"
                  role="button"
                  tabindex="0"
                  :aria-expanded="isItemLoadoutsExpanded(item.id)"
                  @click="toggleItemLoadouts(item.id)"
                  @keydown.enter.prevent="toggleItemLoadouts(item.id)"
                  @keydown.space.prevent="toggleItemLoadouts(item.id)"
                >
                  <div class="gear-row-main">
                    <div class="item-primary">
                      <div class="item-name-row">
                        <span class="item-name font-serif">{{ item.name }}</span>
                        <span
                          v-if="item.loadouts && item.loadouts.length > 0"
                          class="status-chip font-mono packed"
                        >
                          IN {{ item.loadouts.length }} {{ item.loadouts.length === 1 ? 'KIT' : 'KITS' }}
                        </span>
                      </div>
                      <div class="item-spec font-mono">{{ item.spec }}</div>
                    </div>

                    <div class="item-side">
                      <button
                        v-if="getInsightsForItem(item).length > 0"
                        type="button"
                        class="review-quick-btn font-mono"
                        title="Read field review"
                        @click.stop="openReviewForItem(item)"
                      >
                        <span class="material-symbols-outlined text-[13px]">rate_review</span>
                        <span>{{ getInsightsForItem(item).length > 1 ? `${getInsightsForItem(item).length} REVIEWS` : 'REVIEW' }}</span>
                      </button>

                      <div class="item-weight font-mono">
                        {{ item.weight }}
                      </div>

                      <span
                        :class="['material-symbols-outlined row-expand-chevron', { rotated: isItemLoadoutsExpanded(item.id) }]"
                      >
                        expand_more
                      </span>
                    </div>
                  </div>

                  <!-- Progressive Disclosure: Expanded Field Notes, Loadout Links & Reviews -->
                  <div
                    v-if="isItemLoadoutsExpanded(item.id)"
                    class="item-expanded-drawer"
                    @click.stop
                  >
                    <p v-if="item.note" class="item-note font-serif">
                      {{ item.note }}
                    </p>

                    <div class="expanded-actions-row">
                      <template v-if="item.loadouts && item.loadouts.length > 0">
                        <span class="expanded-meta-label font-mono">PACKED IN:</span>
                        <button
                          v-for="ld in item.loadouts"
                          :key="ld.id"
                          type="button"
                          class="linked-loadout-chip font-mono"
                          :title="`Open ${ld.title} loadout`"
                          @click="selectLoadoutById(ld.id)"
                        >
                          <span class="pill-topic">{{ ld.season }}</span>
                          <span class="pill-sep">·</span>
                          <span class="pill-title">{{ ld.title }}</span>
                          <span class="material-symbols-outlined icon-xs">arrow_forward</span>
                        </button>
                      </template>

                      <button
                        v-for="rev in getInsightsForItem(item)"
                        :key="rev.id"
                        type="button"
                        class="linked-review-pill font-mono"
                        @click="openInsight(rev)"
                      >
                        <span class="material-symbols-outlined icon-xs text-secondary">rate_review</span>
                        <span class="pill-topic">{{ rev.category }}</span>
                        <span class="pill-sep">·</span>
                        <span class="pill-title">{{ rev.title }}</span>
                        <span class="material-symbols-outlined icon-xs">arrow_outward</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </template>

        <!-- =============================================================== -->
        <!-- SUB-MODE B: FIELD LOADOUTS BROWSER (MULTIPLE KITS PER SEASON)   -->
        <!-- =============================================================== -->
        <template v-else>
          <!-- Streamlined Season Filter + Kit Selector Card -->
          <div class="season-selector-widget">
            <!-- Compact Inline Season Pills -->
            <div class="season-pills-bar font-mono" role="radiogroup" aria-label="Filter loadouts by season">
              <button
                v-for="s in loadoutSeasonFilters"
                :key="s.id"
                :class="['season-pill-btn', { active: selectedLoadoutSeason === s.id }]"
                type="button"
                role="radio"
                :aria-checked="selectedLoadoutSeason === s.id"
                @click="selectLoadoutSeason(s.id)"
              >
                <span class="material-symbols-outlined season-pill-icon">{{ s.icon }}</span>
                <span>{{ s.name }}</span>
                <span class="season-pill-count">{{ getLoadoutCountBySeason(s.id) }}</span>
              </button>
            </div>

            <!-- Selectable Loadout Cards Single-Row Horizontal Strip -->
            <div v-if="filteredLoadoutKits.length > 0" class="loadout-cards-scroll-shell">
              <button
                v-if="loadoutScrollPos !== 'start'"
                type="button"
                class="filter-edge-hint left"
                aria-label="Scroll loadouts left"
                @click="nudgeHorizontalScroll(loadoutCardsRowRef, 'left', 'loadout')"
              >
                <span class="material-symbols-outlined">chevron_left</span>
              </button>
              <div
                ref="loadoutCardsRowRef"
                :class="[
                  'loadout-browser-cards scroll-hint-x',
                  {
                    'scrolled-mid': loadoutScrollPos === 'mid',
                    'scrolled-end': loadoutScrollPos === 'end'
                  }
                ]"
                @scroll="updateScrollPos(loadoutCardsRowRef, 'loadout')"
              >
                <button
                  v-for="kit in filteredLoadoutKits"
                  :key="kit.id"
                  type="button"
                  :class="['loadout-browser-card', { active: activeLoadout?.id === kit.id }]"
                  @click="selectLoadoutById(kit.id)"
                >
                  <div class="loadout-card-top font-mono">
                    <span class="loadout-card-season">{{ kit.season }}</span>
                    <span class="loadout-card-temp">{{ kit.tempRange }}</span>
                  </div>
                  <div class="loadout-card-title font-serif">{{ kit.title }}</div>
                  <div class="loadout-card-meta font-mono">
                    <strong>{{ kit.baseWeightKg.toFixed(2) }} KG</strong>
                    <span>•</span>
                    <span>{{ getKitItemsCount(kit) }} ITEMS</span>
                  </div>
                </button>
              </div>
              <button
                v-if="loadoutScrollPos !== 'end' && filteredLoadoutKits.length > 2"
                type="button"
                class="filter-edge-hint right"
                aria-label="Scroll loadouts right"
                @click="nudgeHorizontalScroll(loadoutCardsRowRef, 'right', 'loadout')"
              >
                <span class="material-symbols-outlined">chevron_right</span>
              </button>
            </div>
            <div v-else class="insights-empty-state font-mono">
              <span class="material-symbols-outlined empty-icon">backpack</span>
              <p class="empty-title">
                {{
                  loadoutKits.length === 0
                    ? (cmsError ? 'UNABLE TO REACH BASECAMP CMS' : 'NO FIELD LOADOUTS PUBLISHED YET')
                    : 'NO LOADOUTS MATCH SELECTED SEASON'
                }}
              </p>
              <p class="empty-sub font-serif">
                {{
                  loadoutKits.length === 0
                    ? (cmsError
                        ? 'Expedition packing manifests will sync once CMS connectivity returns.'
                        : 'Seasonal packing manifests will appear here once published.')
                    : 'Select ALL SEASONS to view available packing manifests.'
                }}
              </p>
            </div>
          </div>

          <!-- High-Contrast Dark Pine Active Loadout Hero Banner -->
          <div v-if="activeLoadout" class="manifest-hero-card">
            <div class="manifest-top-meta">
              <div class="manifest-title-block">
                <div class="manifest-kicker font-mono">
                  <span class="kicker-season-badge">{{ activeLoadout.season }}</span>
                  <span class="kicker-sep">•</span>
                  <span>{{ activeLoadout.subtitle }}</span>
                </div>
                <h2 class="manifest-title font-serif">{{ activeLoadout.title }}</h2>
              </div>
              <button
                class="copy-manifest-btn font-mono"
                type="button"
                title="Copy markdown packing manifest to clipboard"
                @click="copyLoadoutManifest"
              >
                <span class="material-symbols-outlined text-[14px]">content_copy</span>
                <span>{{ copyNotification ? 'COPIED!' : 'EXPORT' }}</span>
              </button>
            </div>

            <div class="manifest-stats-strip font-mono">
              <div class="manifest-stat-item">
                <span class="stat-label">BASE WEIGHT</span>
                <span class="stat-value">{{ activeLoadout.baseWeightKg.toFixed(2) }} <small>KG</small></span>
              </div>
              <div class="manifest-stat-sep" />
              <div class="manifest-stat-item">
                <span class="stat-label">PACKED ITEMS</span>
                <span class="stat-value">{{ totalPackedItems }} <small>PCS</small></span>
              </div>
              <div class="manifest-stat-sep" />
              <div class="manifest-stat-item">
                <span class="stat-label">TEMP RATING</span>
                <span class="stat-value accent">{{ activeLoadout.tempRange }}</span>
              </div>
            </div>

            <!-- Field Dispatches Where This Loadout Was Carried -->
            <div
              v-if="activeLoadout.dispatches && activeLoadout.dispatches.length > 0"
              class="manifest-dispatches-row font-mono"
            >
              <span class="dispatches-row-label">
                <span class="material-symbols-outlined text-[13px]">hiking</span>
                <span>FIELD TESTED ON:</span>
              </span>
              <div class="loadout-dispatches-links">
                <NuxtLink
                  v-for="disp in activeLoadout.dispatches"
                  :key="disp.slug"
                  :to="`/dispatches/${disp.slug}`"
                  class="loadout-dispatch-link"
                >
                  <span class="font-serif">{{ disp.title }}</span>
                  <span class="material-symbols-outlined text-[12px]">arrow_forward</span>
                </NuxtLink>
              </div>
            </div>
          </div>

          <!-- Categorized Equipment Inventory Sections for Selected Loadout -->
          <div v-if="activeLoadout" class="kits-list">
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
                <div class="category-header-right">
                  <span class="category-weight-badge">{{ getCategoryWeightFormatted(cat.items) }}</span>
                  <span class="category-item-count">
                    {{ cat.items.length }} {{ cat.items.length === 1 ? 'ITEM' : 'ITEMS' }}
                  </span>
                </div>
              </div>

              <div class="items-table">
                <div
                  v-for="item in cat.items"
                  :key="item.id"
                  :class="['gear-item-row is-interactive', { 'is-expanded': isItemLoadoutsExpanded(`kit-${activeLoadout.id}-${item.id}`) }]"
                  role="button"
                  tabindex="0"
                  :aria-expanded="isItemLoadoutsExpanded(`kit-${activeLoadout.id}-${item.id}`)"
                  @click="toggleItemLoadouts(`kit-${activeLoadout.id}-${item.id}`)"
                  @keydown.enter.prevent="toggleItemLoadouts(`kit-${activeLoadout.id}-${item.id}`)"
                  @keydown.space.prevent="toggleItemLoadouts(`kit-${activeLoadout.id}-${item.id}`)"
                >
                  <div class="gear-row-main">
                    <div class="item-primary">
                      <div class="item-name-row">
                        <span class="item-name font-serif">{{ item.name }}</span>
                        <span
                          v-if="item.status && item.status !== 'PACKED'"
                          :class="['status-chip font-mono', item.status.toLowerCase()]"
                        >
                          {{ item.status }}
                        </span>
                      </div>
                      <div class="item-spec font-mono">{{ item.spec }}</div>
                    </div>

                    <div class="item-side">
                      <button
                        v-if="getInsightsForItem(item).length > 0"
                        type="button"
                        class="review-quick-btn font-mono"
                        title="Read field review"
                        @click.stop="openReviewForItem(item)"
                      >
                        <span class="material-symbols-outlined text-[13px]">rate_review</span>
                        <span>REVIEW</span>
                      </button>

                      <div class="item-weight font-mono">
                        {{ item.weight }}
                      </div>

                      <span
                        :class="['material-symbols-outlined row-expand-chevron', { rotated: isItemLoadoutsExpanded(`kit-${activeLoadout.id}-${item.id}`) }]"
                      >
                        expand_more
                      </span>
                    </div>
                  </div>

                  <!-- Progressive Disclosure: Note, Review Pills, & Locker Link -->
                  <div
                    v-if="isItemLoadoutsExpanded(`kit-${activeLoadout.id}-${item.id}`)"
                    class="item-expanded-drawer"
                    @click.stop
                  >
                    <p v-if="item.note" class="item-note font-serif">
                      {{ item.note }}
                    </p>

                    <div class="expanded-actions-row">
                      <button
                        type="button"
                        class="linked-loadout-chip font-mono"
                        title="Locate in Equipment Locker"
                        @click="navigateToGearItem(item.id)"
                      >
                        <span class="material-symbols-outlined icon-xs">inventory_2</span>
                        <span>VIEW IN EQUIPMENT LOCKER</span>
                      </button>

                      <button
                        v-for="rev in getInsightsForItem(item)"
                        :key="rev.id"
                        type="button"
                        class="linked-review-pill font-mono"
                        @click="openInsight(rev)"
                      >
                        <span class="material-symbols-outlined icon-xs text-secondary">rate_review</span>
                        <span class="pill-topic">{{ rev.category }}</span>
                        <span class="pill-sep">·</span>
                        <span class="pill-title">{{ rev.title }}</span>
                        <span class="material-symbols-outlined icon-xs">arrow_outward</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </template>
      </main>
    </div>
  </div>

  <!-- Insight Full Item Review Modal -->
  <InsightReader
    :insight="selectedInsight"
    :is-open="isInsightReaderOpen"
    :related-insights="getRelatedInsights(selectedInsight)"
    @close="closeInsight"
    @view-gear="navigateToGearItem"
    @select-insight="openInsight"
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
  height: 45px;
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

.insight-search-bar {
  position: relative;
  display: flex;
  align-items: center;
  background-color: var(--color-surface-container-low);
  border: 1px solid rgba(115, 120, 116, 0.35);
  border-radius: 6px;
  padding: 0 10px;
  height: 36px;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}

.insight-search-bar:focus-within {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 2px rgba(27, 46, 36, 0.08);
  background-color: #ffffff;
}

.insight-search-bar .search-icon {
  font-size: 16px;
  color: var(--color-on-surface-variant);
  margin-right: 8px;
  flex-shrink: 0;
}

.insight-search-input {
  width: 100%;
  border: none;
  background: transparent;
  font-size: 11px;
  color: var(--color-primary);
  outline: none;
}

.insight-search-input::placeholder {
  color: var(--color-on-surface-variant);
  opacity: 0.75;
}

.insight-search-clear {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  border-radius: 9999px;
  border: none;
  background: rgba(27, 46, 36, 0.08);
  color: var(--color-primary);
  cursor: pointer;
  flex-shrink: 0;
  margin-left: 6px;
}

.insight-search-clear:hover {
  background: rgba(217, 83, 30, 0.15);
  color: var(--color-secondary);
}

.insights-empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 36px 20px;
  background-color: var(--color-surface-container-lowest);
  border: 1px dashed rgba(115, 120, 116, 0.4);
  border-radius: 8px;
  gap: 8px;
}

.insights-empty-state .empty-icon {
  font-size: 28px;
  color: var(--color-secondary);
}

.insights-empty-state .empty-title {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.08em;
  color: var(--color-primary);
}

.insights-empty-state .empty-sub {
  font-size: 13px;
  color: var(--color-on-surface-variant);
  max-width: 380px;
}

.reset-filter-btn {
  margin-top: 6px;
  padding: 6px 14px;
  border-radius: 9999px;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.06em;
  background-color: var(--color-primary);
  color: #ffffff;
  border: none;
  cursor: pointer;
}

.filter-scroll-shell {
  position: relative;
  display: flex;
  align-items: center;
}

.insight-filter-chips-row {
  flex: 1 1 auto;
  min-width: 0;
  display: flex;
  gap: 6px;
  overflow-x: auto;
  padding: 2px 20px 2px 0;
  scroll-behavior: smooth;
}

.filter-edge-hint {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  z-index: 2;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 28px;
  padding: 0;
  border: none;
  background: transparent;
  color: var(--color-primary);
  opacity: 0.55;
  cursor: pointer;
  transition: opacity 0.15s ease, color 0.15s ease, transform 0.15s ease;
}

.filter-edge-hint .material-symbols-outlined {
  font-size: 16px;
}

.filter-edge-hint.right {
  right: -2px;
}

.filter-edge-hint.left {
  left: -4px;
}

.filter-edge-hint:hover {
  opacity: 1;
  color: var(--color-secondary);
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

.gear-link-chip {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  background: rgba(238, 223, 197, 0.35);
  border: 1px solid rgba(115, 120, 116, 0.3);
  border-radius: 4px;
  padding: 3px 8px;
  cursor: pointer;
  color: var(--color-primary);
  font-weight: 600;
  transition: all 0.15s ease;
}

.gear-link-chip:hover {
  border-color: var(--color-secondary);
  color: var(--color-secondary);
  background: rgba(217, 83, 30, 0.08);
}

.active-gear-filter-banner {
  margin-top: 10px;
  padding: 8px 12px;
  border-radius: 6px;
  background-color: rgba(217, 83, 30, 0.08);
  border: 1px solid rgba(217, 83, 30, 0.3);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  font-size: 10px;
  color: var(--color-primary);
}

.filter-banner-left {
  display: flex;
  align-items: center;
  gap: 6px;
}

.clear-gear-filter-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: #ffffff;
  border: 1px solid rgba(115, 120, 116, 0.35);
  border-radius: 4px;
  padding: 3px 8px;
  font-size: 9px;
  font-weight: 700;
  color: var(--color-primary);
  cursor: pointer;
  transition: all 0.15s ease;
}

.clear-gear-filter-btn:hover {
  border-color: var(--color-secondary);
  color: var(--color-secondary);
}

/* ========================================================================= */
/* TAB 2: MY GEAR — STREAMLINED HIGH-CONTRAST LOCKER & LOADOUT ARCHITECTURE  */
/* ========================================================================= */
.gear-submode-bar {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6px;
  padding: 5px;
  margin-bottom: 16px;
  border-radius: 8px;
  background-color: #dfd7c5;
  border: 1px solid rgba(27, 46, 36, 0.22);
}

.gear-submode-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  padding: 10px 12px;
  border-radius: 6px;
  border: 1px solid transparent;
  background-color: transparent;
  color: #35443b;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.06em;
  cursor: pointer;
  transition: all 0.16s ease;
}

.gear-submode-btn:hover:not(.active) {
  background-color: rgba(255, 255, 255, 0.55);
  color: #111f18;
}

.gear-submode-btn.active {
  background-color: #1b2e24;
  color: #ffffff;
  border-color: #1b2e24;
  box-shadow: 0 2px 8px rgba(27, 46, 36, 0.22);
}

.submode-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 20px;
  height: 18px;
  padding: 0 6px;
  border-radius: 9999px;
  font-size: 9.5px;
  font-weight: 700;
  background-color: rgba(27, 46, 36, 0.12);
  color: inherit;
}

.gear-submode-btn.active .submode-count {
  background-color: #d9531e;
  color: #ffffff;
}

/* LOCKER COMPACT CONTROLS CARD */
.locker-controls-card {
  background-color: #ffffff;
  border: 1.5px solid rgba(27, 46, 36, 0.2);
  border-radius: 8px;
  padding: 12px 14px;
  margin-bottom: 18px;
  box-shadow: 0 2px 8px rgba(27, 46, 36, 0.06);
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.locker-search-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.locker-search-bar {
  flex: 1 1 auto;
  background-color: #f6f2e9;
  border-color: rgba(27, 46, 36, 0.24);
}

.locker-summary-pill {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  height: 36px;
  padding: 0 11px;
  border-radius: 6px;
  background-color: #1b2e24;
  color: #e8e2d5;
  font-size: 10px;
  letter-spacing: 0.04em;
  white-space: nowrap;
}

.locker-summary-pill strong {
  color: #ffffff;
  font-weight: 700;
}

.locker-summary-pill .pill-dot {
  color: #d9531e;
}

@media (max-width: 480px) {
  .locker-search-row {
    flex-direction: column;
    align-items: stretch;
  }
  .locker-summary-pill {
    justify-content: center;
    height: 30px;
  }
}

/* STREAMLINED SEASON FILTER + LOADOUT SELECTOR */
.season-selector-widget {
  background-color: #ffffff;
  border: 1.5px solid rgba(27, 46, 36, 0.2);
  border-radius: 8px;
  padding: 12px 14px;
  margin-bottom: 16px;
  box-shadow: 0 2px 8px rgba(27, 46, 36, 0.06);
}

.season-pills-bar {
  display: flex;
  align-items: center;
  gap: 6px;
  overflow-x: auto;
  padding-bottom: 2px;
}

.season-pill-btn {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  height: 32px;
  padding: 0 11px;
  border-radius: 9999px;
  border: 1px solid rgba(27, 46, 36, 0.22);
  background-color: #f5f0e5;
  color: #2f3e35;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  cursor: pointer;
  transition: all 0.15s ease;
}

.season-pill-btn:hover:not(.active) {
  background-color: #ebe3d2;
  border-color: rgba(27, 46, 36, 0.45);
  color: #111f18;
}

.season-pill-btn.active {
  background-color: #1b2e24;
  border-color: #1b2e24;
  color: #ffffff;
}

.season-pill-icon {
  font-size: 14px;
  color: #d9531e;
}

.season-pill-btn.active .season-pill-icon {
  color: #ff7a45;
}

.season-pill-count {
  font-size: 9px;
  padding: 1px 5px;
  border-radius: 9999px;
  background-color: rgba(27, 46, 36, 0.1);
  color: inherit;
}

.season-pill-btn.active .season-pill-count {
  background-color: rgba(255, 255, 255, 0.18);
  color: #ffffff;
}

.loadout-cards-scroll-shell {
  position: relative;
  display: flex;
  align-items: center;
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px solid rgba(27, 46, 36, 0.12);
}

.loadout-browser-cards {
  flex: 1 1 auto;
  min-width: 0;
  display: flex;
  flex-wrap: nowrap;
  gap: 8px;
  overflow-x: auto;
  padding: 2px 20px 2px 2px;
  scroll-behavior: smooth;
  scroll-snap-type: x proximity;
}

.loadout-browser-card {
  flex: 0 0 210px;
  width: 210px;
  scroll-snap-align: start;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
  text-align: left;
  padding: 10px 12px;
  border-radius: 6px;
  border: 1.5px solid rgba(27, 46, 36, 0.18);
  background-color: #f8f4ec;
  cursor: pointer;
  transition: all 0.16s ease;
}

.loadout-browser-card:hover:not(.active) {
  background-color: #ffffff;
  border-color: rgba(27, 46, 36, 0.45);
}

.loadout-browser-card.active {
  background-color: #fffaf2;
  border-color: #d9531e;
  box-shadow: 0 2px 8px rgba(217, 83, 30, 0.15);
}

.loadout-card-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  font-size: 9px;
}

.loadout-card-season {
  font-weight: 700;
  color: #d9531e;
  letter-spacing: 0.06em;
}

.loadout-card-temp {
  color: #3f4d44;
  font-weight: 700;
}

.loadout-card-title {
  font-size: 14px;
  font-weight: 600;
  color: #111f18;
  line-height: 1.2;
  width: 100%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.loadout-card-meta {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 9.5px;
  color: #3f4d44;
}

.loadout-card-meta strong {
  color: #111f18;
}

/* HIGH-CONTRAST DARK PINE ACTIVE LOADOUT HERO BANNER */
.manifest-hero-card {
  background: linear-gradient(145deg, #1b2e24 0%, #13221a 100%);
  color: #ffffff;
  border: 1.5px solid #0f1c15;
  border-radius: 8px;
  padding: 16px 18px;
  margin-bottom: 18px;
  box-shadow: 0 6px 18px rgba(19, 34, 26, 0.18);
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.manifest-top-meta {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.manifest-title-block {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.manifest-kicker {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
  font-size: 9.5px;
  color: #c6d1c9;
  letter-spacing: 0.05em;
}

.kicker-season-badge {
  background-color: #d9531e;
  color: #ffffff;
  padding: 2px 6px;
  border-radius: 3px;
  font-weight: 700;
  letter-spacing: 0.08em;
}

.kicker-sep {
  opacity: 0.5;
}

.manifest-title {
  font-size: 21px;
  font-weight: 600;
  color: #ffffff;
  line-height: 1.2;
  margin: 0;
}

.copy-manifest-btn {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  height: 30px;
  padding: 0 11px;
  border-radius: 5px;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.06em;
  background-color: rgba(255, 255, 255, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.28);
  color: #ffffff;
  cursor: pointer;
  transition: all 0.15s ease;
  flex-shrink: 0;
}

.copy-manifest-btn:hover {
  background-color: #d9531e;
  border-color: #d9531e;
  color: #ffffff;
}

.manifest-stats-strip {
  display: flex;
  align-items: center;
  justify-content: space-around;
  background-color: rgba(0, 0, 0, 0.24);
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: 6px;
  padding: 10px 8px;
}

.manifest-stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.manifest-stat-item .stat-label {
  font-size: 8.5px;
  color: #b4c2b8;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.manifest-stat-item .stat-value {
  font-size: 14px;
  font-weight: 700;
  color: #ffffff;
}

.manifest-stat-item .stat-value small {
  font-size: 9px;
  color: #ff8552;
  margin-left: 2px;
}

.manifest-stat-item .stat-value.accent {
  color: #ff8552;
}

.manifest-stat-sep {
  width: 1px;
  height: 24px;
  background-color: rgba(255, 255, 255, 0.16);
}

.manifest-dispatches-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  padding-top: 10px;
  border-top: 1px solid rgba(255, 255, 255, 0.14);
}

.dispatches-row-label {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.06em;
  color: #c6d1c9;
}

.loadout-dispatches-links {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.loadout-dispatch-link {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 3px 9px;
  border-radius: 4px;
  background-color: rgba(255, 255, 255, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.25);
  color: #ffffff;
  font-size: 11.5px;
  font-weight: 500;
  text-decoration: none;
  transition: all 0.15s ease;
}

.loadout-dispatch-link:hover {
  background-color: #d9531e;
  border-color: #d9531e;
  color: #ffffff;
}

/* ========================================================================= */
/* HIGH-CONTRAST CATEGORY SECTIONS & SCANNABLE GEAR ITEM ROWS                */
/* ========================================================================= */
.kits-list {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.kit-category-section {
  background-color: #ffffff;
  border: 1.5px solid rgba(27, 46, 36, 0.24);
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 3px 12px rgba(27, 46, 36, 0.07);
}

.category-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 11px 16px;
  background-color: #1b2e24;
  color: #ffffff;
  border-bottom: 2px solid #d9531e;
}

.category-header-left {
  display: flex;
  align-items: center;
  gap: 9px;
}

.category-indicator {
  width: 7px;
  height: 7px;
  border-radius: 9999px;
  background-color: #ff7a45;
  box-shadow: 0 0 6px rgba(255, 122, 69, 0.65);
}

.category-title {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.09em;
  text-transform: uppercase;
  color: #ffffff;
  margin: 0;
}

.category-header-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.category-weight-badge {
  font-size: 9.5px;
  font-weight: 700;
  color: #ffffff;
  background-color: rgba(255, 255, 255, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.24);
  padding: 2px 7px;
  border-radius: 4px;
}

.category-item-count {
  font-size: 9.5px;
  font-weight: 600;
  color: #c6d1c9;
}

.items-table {
  display: flex;
  flex-direction: column;
  background-color: #ffffff;
}

.gear-item-row {
  display: flex;
  flex-direction: column;
  padding: 12px 16px;
  border-bottom: 1px solid rgba(27, 46, 36, 0.12);
  background-color: #ffffff;
  transition: background-color 0.15s ease, box-shadow 0.15s ease;
}

.gear-item-row:last-child {
  border-bottom: none;
}

.gear-item-row.is-interactive {
  cursor: pointer;
}

.gear-item-row.is-interactive:hover {
  background-color: #faf6ee;
}

.gear-item-row.is-expanded {
  background-color: #fcf9f2;
  box-shadow: inset 3.5px 0 0 #d9531e;
}

.gear-item-row.gear-item-highlighted {
  background-color: rgba(217, 83, 30, 0.12);
  box-shadow: inset 4px 0 0 #d9531e;
}

.gear-row-main {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  width: 100%;
}

.item-primary {
  flex: 1 1 auto;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.item-name-row {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.item-name {
  font-size: 16px;
  font-weight: 600;
  color: #111f18;
  line-height: 1.25;
}

.item-spec {
  font-size: 11px;
  color: #46534b;
  line-height: 1.35;
}

.item-side {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.review-quick-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  height: 26px;
  padding: 0 8px;
  border-radius: 4px;
  font-size: 9.5px;
  font-weight: 700;
  letter-spacing: 0.05em;
  background-color: rgba(217, 83, 30, 0.1);
  border: 1px solid rgba(217, 83, 30, 0.35);
  color: #c24414;
  cursor: pointer;
  transition: all 0.15s ease;
}

.review-quick-btn:hover {
  background-color: #d9531e;
  border-color: #d9531e;
  color: #ffffff;
}

.item-weight {
  font-size: 11.5px;
  font-weight: 700;
  color: #111f18;
  white-space: nowrap;
  background-color: #eef1ee;
  border: 1px solid rgba(27, 46, 36, 0.22);
  padding: 4px 8px;
  border-radius: 4px;
  min-width: 54px;
  text-align: center;
}

.row-expand-chevron {
  font-size: 18px;
  color: #5c6960;
  transition: transform 0.18s ease, color 0.15s ease;
}

.gear-item-row:hover .row-expand-chevron {
  color: #111f18;
}

.row-expand-chevron.rotated {
  transform: rotate(180deg);
  color: #d9531e;
}

/* PROGRESSIVE DISCLOSURE DRAWER INSIDE EXPANDED ROW */
.item-expanded-drawer {
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px dashed rgba(27, 46, 36, 0.18);
  display: flex;
  flex-direction: column;
  gap: 8px;
  cursor: default;
}

.item-note {
  font-size: 13px;
  color: #26332b;
  line-height: 1.45;
  margin: 0;
  padding-left: 10px;
  border-left: 2.5px solid rgba(27, 46, 36, 0.3);
}

.expanded-actions-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
}

.expanded-meta-label {
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.06em;
  color: #46534b;
  margin-right: 2px;
}

.status-chip {
  padding: 2px 6px;
  border-radius: 3px;
  font-size: 8.5px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.status-chip.packed {
  background-color: rgba(4, 120, 87, 0.12);
  color: #046c4e;
  border: 1px solid rgba(4, 120, 87, 0.32);
}

.status-chip.essential {
  background-color: rgba(217, 83, 30, 0.14);
  color: #c24414;
  border: 1px solid rgba(217, 83, 30, 0.38);
}

.status-chip.worn,
.status-chip.ready {
  background-color: rgba(27, 46, 36, 0.1);
  color: #1b2e24;
  border: 1px solid rgba(27, 46, 36, 0.28);
}

.linked-review-pill,
.linked-loadout-chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  width: fit-content;
  max-width: 100%;
  background: #ffffff;
  border: 1px solid rgba(27, 46, 36, 0.28);
  border-radius: 4px;
  padding: 4px 8px;
  font-size: 9.5px;
  line-height: 1.2;
  color: #111f18;
  cursor: pointer;
  text-align: left;
  transition: all 0.15s ease;
}

.linked-review-pill:hover,
.linked-loadout-chip:hover {
  border-color: #d9531e;
  background: rgba(217, 83, 30, 0.08);
  color: #c24414;
}

.pill-topic {
  font-weight: 700;
  color: #d9531e;
  flex-shrink: 0;
}

.pill-sep {
  opacity: 0.45;
  flex-shrink: 0;
}

.pill-title {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-weight: 600;
}

.icon-xs {
  font-size: 12px;
  line-height: 1;
}

.text-success {
  color: #047857;
}

.text-secondary {
  color: var(--color-secondary);
}
</style>
