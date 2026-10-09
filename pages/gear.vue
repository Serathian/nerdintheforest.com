<script setup lang="ts">
import { ref, computed } from 'vue'

useHead({
  title: 'Backcountry Gear Ledger — Nerd in the Forest',
  meta: [
    {
      name: 'description',
      content: 'Tested equipment loadouts, seasonal Nordic kits, durability observations, and field survival gear.'
    },
    { property: 'og:title', content: 'Backcountry Gear Ledger — Nerd in the Forest' },
    { property: 'og:description', content: 'Surveyed equipment kits, weights, and seasonal packing lists.' }
  ]
})

const activeSeason = ref('AUTUMN')

const seasonalKits = [
  { id: 'AUTUMN', label: 'Autumn / Taiga' },
  { id: 'WINTER', label: 'Winter / Sub-Zero' },
  { id: 'SPRING', label: 'Spring Thaw' },
  { id: 'SUMMER', label: 'Summer Boreal' }
]

const gearList = [
  {
    id: 'gear-1',
    category: 'SHELTER & SLEEP',
    season: 'AUTUMN',
    items: [
      { name: 'Hilleberg Akto 1P Tent', spec: 'Kerlon 1200 • 1.7 kg', status: 'PACKED', weight: '1,700g', note: 'Proven in gale winds on high ridges.' },
      { name: 'Western Mountaineering Antelope MF', spec: '850+ Fill Goose Down • -10°C', status: 'PACKED', weight: '1,105g', note: 'Microfiber shell sheds frost effortlessly.' },
      { name: 'Therm-a-Rest NeoAir XTherm NXT', spec: 'R-Value 7.3 • 439g', status: 'PACKED', weight: '439g', note: 'Unmatched warmth-to-weight ratio.' }
    ]
  },
  {
    id: 'gear-2',
    category: 'COOK & WATER',
    season: 'AUTUMN',
    items: [
      { name: 'Trangia 27-1 UL Hard Anodized', spec: 'Spirit Burner Kit • 690g', status: 'PACKED', weight: '690g', note: 'Dead-reliable in freezing weather with bio-ethanol.' },
      { name: 'Katadyn BeFree 1.0L Filter', spec: '0.1 Micron Hollow Fiber', status: 'PACKED', weight: '63g', note: 'Fast flow rate from cold glacial tarns.' },
      { name: 'Kuksa Birch Burl Cup', spec: 'Hand-carved Lapland birch • 180ml', status: 'PACKED', weight: '110g', note: 'Traditional morning coffee vessel.' }
    ]
  },
  {
    id: 'gear-3',
    category: 'NAVIGATION & TOOLS',
    season: 'AUTUMN',
    items: [
      { name: 'Silva Expedition S Compass', spec: 'Global Needle • Mirror Sight', status: 'ESSENTIAL', weight: '86g', note: 'Built-in clinometer and 1:25k romer scales.' },
      { name: 'Nordmarka 1:25,000 Topo Map', spec: 'Tyvek Waterproof Synthetic', status: 'ESSENTIAL', weight: '45g', note: 'Hand-annotated shelter waypoints.' },
      { name: 'Morakniv Garberg Carbon Knife', spec: 'Full Tang • 3.2mm Carbon Steel', status: 'ESSENTIAL', weight: '272g', note: 'Batoning birch firewood and sparks.' }
    ]
  },
  {
    id: 'gear-4',
    category: 'WINTER ESSENTIALS',
    season: 'WINTER',
    items: [
      { name: 'Åsnes Nansen Mountain Skis', spec: 'Steel Edge • 67mm Tip • Skinlock', status: 'READY', weight: '2,050g', note: 'X-country flotation in deep uncrusted powder.' },
      { name: 'MSR XGK EX Multi-Fuel Stove', spec: 'White Gas / Kerosene', status: 'READY', weight: '384g', note: 'Melting dense drift snow into water.' },
      { name: 'Black Diamond Evac 7 Shovel', spec: 'Anodized Aluminum • Hoe Mode', status: 'READY', weight: '794g', note: 'Emergency snow cave and windbreak digging.' }
    ]
  }
]

const currentKit = computed(() => {
  return gearList.filter(g => g.season === activeSeason.value || activeSeason.value === 'ALL')
})

const totalWeight = computed(() => {
  let grams = 0
  currentKit.value.forEach(group => {
    group.items.forEach(item => {
      const g = parseInt(item.weight.replace(/[^0-9]/g, '')) || 0
      grams += g
    })
  })
  return (grams / 1000).toFixed(2)
})
</script>

<template>
  <div class="gear-page">
    <div class="gear-container">
      <!-- Header -->
      <header class="gear-header">
        <div class="header-pre font-mono">
          <span class="header-beacon" />
          <span>LOADOUT // TELEMETRY & KITS</span>
        </div>
        <h1 class="gear-title font-serif">Gear Ledger</h1>
        <p class="gear-intro font-serif">
          Tested backcountry equipment, weight manifests, and seasonal kit manifests for Norwegian wilderness travel.
        </p>

        <!-- Manifest Telemetry Bar -->
        <div class="manifest-card">
          <div class="manifest-stat">
            <span class="stat-label font-mono">BASE WEIGHT</span>
            <span class="stat-value font-mono">{{ totalWeight }} <span class="stat-unit">KG</span></span>
          </div>
          <div class="manifest-divider" />
          <div class="manifest-stat">
            <span class="stat-label font-mono">SEASON</span>
            <span class="stat-value font-mono">{{ activeSeason }}</span>
          </div>
          <div class="manifest-divider" />
          <div class="manifest-stat">
            <span class="stat-label font-mono">STATUS</span>
            <span class="stat-value font-mono text-success">FIELD READY</span>
          </div>
        </div>

        <!-- Season Selector -->
        <div class="season-tabs-row">
          <button
            v-for="s in seasonalKits"
            :key="s.id"
            :class="['season-tab font-mono', { active: activeSeason === s.id }]"
            type="button"
            @click="activeSeason = s.id"
          >
            {{ s.label }}
          </button>
        </div>
      </header>

      <!-- Kit Categories List -->
      <main class="kits-list">
        <section
          v-for="category in currentKit"
          :key="category.id"
          class="kit-category-section"
        >
          <div class="category-header font-mono">
            <span class="category-indicator" />
            <h2 class="category-title">{{ category.category }}</h2>
          </div>

          <div class="items-table">
            <div
              v-for="item in category.items"
              :key="item.name"
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

              <div class="item-weight font-mono">
                {{ item.weight }}
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
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
  max-width: 600px;
  margin: 0 auto;
  padding: 16px;
}

.gear-header {
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
  margin-bottom: 16px;
}

.manifest-card {
  display: flex;
  align-items: center;
  justify-content: space-around;
  background-color: var(--color-handle-bg);
  border: 1px solid rgba(115, 120, 116, 0.4);
  border-radius: 8px;
  padding: 12px 8px;
  margin-bottom: 16px;
  box-shadow: 0 2px 8px rgba(27, 46, 36, 0.06);
}

.manifest-stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
}

.stat-label {
  font-size: 9px;
  color: var(--color-on-surface-variant);
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.stat-value {
  font-size: 13px;
  font-weight: 700;
  color: var(--color-primary);
}

.stat-unit {
  font-size: 9px;
  color: var(--color-secondary);
}

.text-success {
  color: #047857;
}

.manifest-divider {
  width: 1px;
  height: 24px;
  background-color: rgba(115, 120, 116, 0.25);
}

.season-tabs-row {
  display: flex;
  gap: 6px;
  overflow-x: auto;
  scrollbar-width: none;
  padding: 2px 0;
}

.season-tabs-row::-webkit-scrollbar {
  display: none;
}

.season-tab {
  flex-shrink: 0;
  padding: 6px 14px;
  border-radius: 9999px;
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  background-color: var(--color-handle-bg);
  border: 1px solid rgba(115, 120, 116, 0.35);
  color: var(--color-on-surface);
  cursor: pointer;
  transition: all 0.15s ease;
}

.season-tab.active {
  background-color: var(--color-primary);
  color: #ffffff;
  border-color: var(--color-primary);
}

.kits-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
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
  gap: 8px;
  padding: 10px 14px;
  background-color: var(--color-handle-bg);
  border-bottom: 1px solid rgba(115, 120, 116, 0.25);
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

.items-table {
  display: flex;
  flex-direction: column;
}

.gear-item-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 12px 14px;
  border-bottom: 1px solid rgba(115, 120, 116, 0.15);
  gap: 12px;
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
</style>
