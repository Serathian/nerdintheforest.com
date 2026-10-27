<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'
import {
  type LoadoutKit,
  type GearInsight
} from '~/data/mockGearData'
import { useNitfCms } from '~/composables/useNitfCms'

const { gearItems, gearInsights, loadoutKits, gearCategories, fetchGear } = useNitfCms()

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
          <p class="empty-title">NO GEAR REVIEWS MATCH CURRENT FILTER</p>
          <p class="empty-sub font-serif">
            Try searching for another item type (e.g. tent, stove, knife, pack) or reset the equipment filter.
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
        <!-- Dual-Mode Switcher: Equipment Locker vs Field Loadouts Browser -->
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
          <div class="insights-header-card locker-header-card">
            <div class="insights-telemetry-banner">
              <div class="banner-stat">
                <span class="banner-stat-value font-mono">{{ totalLockerItemsCount }}</span>
                <span class="banner-stat-label font-mono">GEAR ITEMS</span>
              </div>
              <div class="banner-divider" />
              <div class="banner-stat">
                <span class="banner-stat-value font-mono">{{ lockerTotalWeightKg }} <small class="text-[9px]">KG</small></span>
                <span class="banner-stat-label font-mono">CATALOG WEIGHT</span>
              </div>
              <div class="banner-divider" />
              <div class="banner-stat">
                <span class="banner-stat-value font-mono text-secondary">{{ lockerReviewedCount }}</span>
                <span class="banner-stat-label font-mono">REVIEWED</span>
              </div>
              <div class="banner-divider" />
              <div class="banner-stat">
                <span class="banner-stat-value font-mono">{{ loadoutKits.length }}</span>
                <span class="banner-stat-label font-mono">FIELD KITS</span>
              </div>
            </div>

            <div class="header-card-divider" />

            <!-- Search Bar for Equipment Locker -->
            <div class="insight-search-bar">
              <span class="material-symbols-outlined search-icon">search</span>
              <input
                v-model="lockerSearchQuery"
                type="search"
                class="insight-search-input font-mono"
                placeholder="Search equipment locker by item, brand, or type (e.g. tent, stove, tool)..."
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

            <!-- Category Filter Chips with Subtle Edge Fade & Whisper Chevron -->
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
          <div class="kits-list">
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
                <span class="category-item-count">
                  {{ cat.items.length }} {{ cat.items.length === 1 ? 'ITEM' : 'ITEMS' }}
                </span>
              </div>

              <div class="items-table">
                <div
                  v-for="item in cat.items"
                  :id="`gear-item-${item.id}`"
                  :key="item.id"
                  :class="['gear-item-row', { 'gear-item-highlighted': highlightedGearItemId === String(item.id) }]"
                >
                  <div class="item-primary">
                    <div class="item-name-row">
                      <span class="item-name font-serif">{{ item.name }}</span>
                      <span
                        v-if="item.loadouts && item.loadouts.length > 0"
                        class="status-chip font-mono packed"
                      >
                        PACKED
                      </span>
                    </div>
                    <div class="item-spec font-mono">{{ item.spec }}</div>
                    <p class="item-note font-serif">{{ item.note }}</p>

                    <!-- Compact Collapsible Loadouts & Reviews Bar -->
                    <div
                      v-if="(item.loadouts && item.loadouts.length > 0) || getInsightsForItem(item).length > 1"
                      class="item-linked-loadouts"
                    >
                      <div class="compact-badges-bar">
                        <button
                          v-if="item.loadouts && item.loadouts.length > 0"
                          type="button"
                          :class="['loadout-collapse-toggle font-mono', { active: isItemLoadoutsExpanded(item.id) }]"
                          :aria-expanded="isItemLoadoutsExpanded(item.id)"
                          @click="toggleItemLoadouts(item.id)"
                        >
                          <span class="material-symbols-outlined icon-xs text-secondary">backpack</span>
                          <span>
                            PACKED IN {{ item.loadouts.length }} {{ item.loadouts.length === 1 ? 'LOADOUT' : 'LOADOUTS' }}
                          </span>
                          <span
                            :class="['material-symbols-outlined chevron-xs', { rotated: isItemLoadoutsExpanded(item.id) }]"
                          >
                            expand_more
                          </span>
                        </button>

                        <button
                          v-for="rev in (getInsightsForItem(item).length > 1 ? getInsightsForItem(item) : [])"
                          :key="rev.id"
                          type="button"
                          class="linked-review-pill font-mono"
                          @click="openInsight(rev)"
                        >
                          <span class="pill-topic">{{ rev.category }}</span>
                          <span class="pill-sep">//</span>
                          <span class="pill-title">{{ rev.title }}</span>
                          <span class="material-symbols-outlined icon-xs">arrow_outward</span>
                        </button>
                      </div>

                      <div
                        v-if="item.loadouts && item.loadouts.length > 0 && isItemLoadoutsExpanded(item.id)"
                        class="linked-loadouts-chips"
                      >
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
                      </div>
                    </div>
                  </div>

                  <div class="item-side">
                    <div class="item-weight font-mono">
                      {{ item.weight }}
                    </div>
                    <button
                      v-if="getInsightsForItem(item).length === 1"
                      type="button"
                      class="read-action font-mono"
                      title="Read field review & observations"
                      @click="openReviewForItem(item)"
                    >
                      READ REVIEW <span class="material-symbols-outlined" style="font-size: 14px;">arrow_forward</span>
                    </button>
                    <button
                      v-else-if="getInsightsForItem(item).length > 1"
                      type="button"
                      class="read-action font-mono"
                      title="View all reviews for this gear item"
                      @click="openReviewForItem(item)"
                    >
                      {{ getInsightsForItem(item).length }} REVIEWS <span class="material-symbols-outlined" style="font-size: 14px;">arrow_forward</span>
                    </button>
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
          <!-- Season Filter + Multi-Loadout Browser -->
          <div class="season-selector-widget">
            <div class="season-selector-header font-mono">
              <span class="selector-header-title">
                <span class="selector-beacon" />
                <span>FILTER LOADOUTS BY SEASON</span>
              </span>
              <span class="selector-header-active text-secondary">
                {{ filteredLoadoutKits.length }} {{ filteredLoadoutKits.length === 1 ? 'LOADOUT' : 'LOADOUTS' }}
              </span>
            </div>

            <!-- Season Filter Buttons -->
            <div class="season-selector-buttons" role="radiogroup" aria-label="Filter loadouts by season">
              <button
                v-for="s in loadoutSeasonFilters"
                :key="s.id"
                :class="['season-value-node font-mono', { active: selectedLoadoutSeason === s.id }]"
                type="button"
                role="radio"
                :aria-checked="selectedLoadoutSeason === s.id"
                @click="selectLoadoutSeason(s.id)"
              >
                <span class="material-symbols-outlined value-icon">{{ s.icon }}</span>
                <span class="value-name">{{ s.name }}</span>
                <span class="value-sub font-mono">{{ getLoadoutCountBySeason(s.id) }} KITS</span>
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
                    <span>{{ kit.baseWeightKg.toFixed(2) }} KG</span>
                    <span>•</span>
                    <span>{{ getKitItemsCount(kit) }} PCS</span>
                    <template v-if="kit.dispatches && kit.dispatches.length > 0">
                      <span>•</span>
                      <span class="text-secondary">
                        {{ kit.dispatches.length }} {{ kit.dispatches.length === 1 ? 'TRIP' : 'TRIPS' }}
                      </span>
                    </template>
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
          </div>

          <!-- Active Loadout Manifest Card -->
          <div v-if="activeLoadout" class="manifest-card">
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
                <span class="stat-value">{{ activeLoadout.baseWeightKg.toFixed(2) }} <span class="stat-unit">KG</span></span>
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
                <span class="stat-label">SEASON</span>
                <span class="stat-value text-success">{{ activeLoadout.season }}</span>
              </div>
            </div>

            <!-- Terrain Stamp -->
            <div class="terrain-stamp font-mono">
              <span class="material-symbols-outlined text-[13px] text-secondary">terrain</span>
              <span>TERRAIN: {{ activeLoadout.terrain }}</span>
            </div>

            <!-- Field Dispatches Where This Loadout Was Carried -->
            <div
              v-if="activeLoadout.dispatches && activeLoadout.dispatches.length > 0"
              class="loadout-dispatches-box font-mono"
            >
              <div class="loadout-dispatches-header">
                <span class="material-symbols-outlined text-[14px] text-secondary">hiking</span>
                <span>CARRIED ON FIELD DISPATCHES ({{ activeLoadout.dispatches.length }})</span>
              </div>
              <div class="loadout-dispatches-links">
                <NuxtLink
                  v-for="disp in activeLoadout.dispatches"
                  :key="disp.slug"
                  :to="`/dispatches/${disp.slug}`"
                  class="loadout-dispatch-link"
                >
                  <span class="font-serif">{{ disp.title }}</span>
                  <span class="material-symbols-outlined text-[13px]">arrow_forward</span>
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
                        v-if="item.status"
                        :class="['status-chip font-mono', item.status.toLowerCase()]"
                      >
                        {{ item.status }}
                      </span>
                    </div>
                    <div class="item-spec font-mono">{{ item.spec }}</div>
                    <p class="item-note font-serif">{{ item.note }}</p>

                    <!-- Linked Reviews List (compact inline pills) -->
                    <div
                      v-if="getInsightsForItem(item).length > 0"
                      class="item-linked-reviews"
                    >
                      <div class="linked-reviews-pills">
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

                  <div class="item-side">
                    <div class="item-weight font-mono">
                      {{ item.weight }}
                    </div>
                    <button
                      type="button"
                      class="read-action font-mono"
                      title="Locate in Equipment Locker"
                      @click="navigateToGearItem(item.id)"
                    >
                      IN LOCKER <span class="material-symbols-outlined" style="font-size: 14px;">inventory_2</span>
                    </button>
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

/* 5 FILTER BUTTONS (ALL GEAR + 4 SEASONS) */
.season-selector-buttons {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 6px;
}

@media (max-width: 480px) {
  .season-selector-buttons {
    grid-template-columns: repeat(3, 1fr);
  }
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

.gear-item-row.gear-item-highlighted {
  background-color: rgba(217, 83, 30, 0.1);
  box-shadow: inset 3px 0 0 var(--color-secondary);
  transition: background-color 0.4s ease;
}

.item-linked-reviews {
  margin-top: 4px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.linked-reviews-label {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 8px;
  font-weight: 700;
  letter-spacing: 0.06em;
  color: var(--color-lichen-slate);
}

.linked-reviews-pills {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.linked-review-pill {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  width: fit-content;
  max-width: 100%;
  background: rgba(238, 223, 197, 0.3);
  border: 1px solid rgba(115, 120, 116, 0.25);
  border-radius: 3px;
  padding: 2px 6px;
  font-size: 8.5px;
  line-height: 1.2;
  color: var(--color-primary);
  cursor: pointer;
  text-align: left;
  transition: all 0.15s ease;
}

.linked-review-pill:hover {
  border-color: var(--color-secondary);
  background: rgba(217, 83, 30, 0.08);
  color: var(--color-secondary);
}

.pill-topic {
  font-weight: 700;
  color: var(--color-secondary);
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

/* ========================================================================= */
/* MY GEAR DUAL-MODE SWITCHER & MULTI-LOADOUT BROWSER                        */
/* ========================================================================= */
.gear-submode-bar {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  padding: 12px 14px 4px;
}

.gear-submode-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  padding: 10px 12px;
  border-radius: 6px;
  border: 1px solid rgba(115, 120, 116, 0.35);
  background-color: var(--color-surface-container-low);
  color: var(--color-on-surface-variant);
  font-size: 10.5px;
  font-weight: 700;
  letter-spacing: 0.06em;
  cursor: pointer;
  transition: all 0.18s ease;
}

.gear-submode-btn:hover:not(.active) {
  background-color: var(--color-surface-container);
  color: var(--color-primary);
  border-color: rgba(115, 120, 116, 0.5);
}

.gear-submode-btn.active {
  background-color: var(--color-primary);
  color: #ffffff;
  border-color: var(--color-primary);
  box-shadow: 0 2px 6px rgba(27, 46, 36, 0.15);
}

.submode-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 18px;
  height: 18px;
  padding: 0 5px;
  border-radius: 9999px;
  font-size: 9px;
  background-color: rgba(27, 46, 36, 0.1);
  color: inherit;
}

.gear-submode-btn.active .submode-count {
  background-color: var(--color-secondary);
  color: #ffffff;
}

.locker-header-card {
  margin-top: 8px;
}

.item-linked-loadouts {
  margin-top: 4px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.compact-badges-bar {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 4px;
}

.loadout-collapse-toggle {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 6px;
  border-radius: 3px;
  font-size: 8.5px;
  font-weight: 700;
  letter-spacing: 0.05em;
  line-height: 1.2;
  background-color: rgba(27, 46, 36, 0.05);
  border: 1px solid rgba(115, 120, 116, 0.28);
  color: var(--color-on-surface-variant);
  cursor: pointer;
  transition: all 0.15s ease;
}

.loadout-collapse-toggle:hover,
.loadout-collapse-toggle.active {
  background-color: rgba(27, 46, 36, 0.1);
  border-color: rgba(27, 46, 36, 0.45);
  color: var(--color-primary);
}

.icon-xs {
  font-size: 11px;
  line-height: 1;
}

.chevron-xs {
  font-size: 12px;
  line-height: 1;
  transition: transform 0.18s ease;
}

.chevron-xs.rotated {
  transform: rotate(180deg);
}

.linked-loadouts-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.linked-loadout-chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: rgba(27, 46, 36, 0.05);
  border: 1px solid rgba(27, 46, 36, 0.2);
  border-radius: 3px;
  padding: 2px 6px;
  font-size: 8.5px;
  line-height: 1.2;
  color: var(--color-primary);
  cursor: pointer;
  text-align: left;
  transition: all 0.15s ease;
}

.linked-loadout-chip:hover {
  border-color: var(--color-secondary);
  background: rgba(217, 83, 30, 0.08);
  color: var(--color-secondary);
}

.loadout-cards-scroll-shell {
  position: relative;
  display: flex;
  align-items: center;
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px solid rgba(115, 120, 116, 0.2);
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
  flex: 0 0 205px;
  width: 205px;
  scroll-snap-align: start;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 3px;
  text-align: left;
  padding: 8px 10px;
  border-radius: 6px;
  border: 1px solid rgba(115, 120, 116, 0.3);
  background-color: rgba(255, 255, 255, 0.65);
  cursor: pointer;
  transition: all 0.16s ease;
}

.loadout-browser-card:hover:not(.active) {
  background-color: #ffffff;
  border-color: rgba(115, 120, 116, 0.55);
}

.loadout-browser-card.active {
  background-color: #ffffff;
  border-color: var(--color-secondary);
  box-shadow: 0 0 0 1px var(--color-secondary), 0 2px 6px rgba(27, 46, 36, 0.08);
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
  color: var(--color-secondary);
  letter-spacing: 0.06em;
}

.loadout-card-temp {
  color: var(--color-lichen-slate);
  font-weight: 600;
}

.loadout-card-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--color-primary);
  line-height: 1.2;
  width: 100%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.loadout-card-meta {
  display: flex;
  align-items: center;
  flex-wrap: nowrap;
  gap: 4px;
  font-size: 8.5px;
  color: var(--color-on-surface-variant);
  white-space: nowrap;
}

.loadout-dispatches-box {
  margin-top: 10px;
  padding: 10px 12px;
  border-radius: 6px;
  background-color: rgba(27, 46, 36, 0.04);
  border: 1px solid rgba(115, 120, 116, 0.25);
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.loadout-dispatches-header {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.06em;
  color: var(--color-lichen-slate);
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
  padding: 4px 10px;
  border-radius: 4px;
  background-color: #ffffff;
  border: 1px solid rgba(115, 120, 116, 0.3);
  color: var(--color-primary);
  font-size: 12px;
  font-weight: 500;
  text-decoration: none;
  transition: all 0.15s ease;
}

.loadout-dispatch-link:hover {
  border-color: var(--color-secondary);
  color: var(--color-secondary);
}
</style>
