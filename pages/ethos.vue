<script setup lang="ts">
import { ref } from 'vue'

useHead({
  title: 'Backcountry Ethos & Philosophy — Nerd in the Forest',
  meta: [
    {
      name: 'description',
      content: 'Nordic wilderness philosophy, Allemannsretten (Right to Roam) principles, Leave No Trace ethics, and field solitude.'
    },
    { property: 'og:title', content: 'Backcountry Ethos & Philosophy — Nerd in the Forest' },
    { property: 'og:description', content: 'Nordic wilderness stewardship, freedom to roam, and the surveyor code.' }
  ]
})

const activePillar = ref<string | null>(null)

function togglePillar(id: string) {
  if (activePillar.value === id) {
    activePillar.value = null
  } else {
    activePillar.value = id
  }
}

const pillars = [
  {
    id: 'allemannsretten',
    number: '01',
    title: 'Allemannsretten',
    subtitle: 'The Right to Roam & Ancient Reciprocity',
    summary: 'Codified in the Norwegian Outdoor Recreation Act of 1957, the public right to roam grants unhindered passage through uncultivated land (utmark).',
    rules: [
      { tag: 'DISTANCE', text: 'Pitch camp at least 150 meters away from the nearest inhabited house or mountain cabin.' },
      { tag: 'DURATION', text: 'Remain no more than two nights in the same backcountry spot without landholder consent.' },
      { tag: 'LAND STATUS', text: 'Freely traverse open taiga, lakes, and fells year-round; cross cultivated fields only when frozen and snow-covered.' },
      { tag: 'FORAGING', text: 'Wild cloudberries, bilberries, chanterelles, and dry fallen kindling belong to all wanderers.' }
    ]
  },
  {
    id: 'sporlos',
    number: '02',
    title: 'Sporløs Ferdsel',
    subtitle: 'Leave No Trace & Silent Disappearance',
    summary: 'The mark of a true surveyor is leaving the forest indistinguishable from how it was found before your boots crossed the moss.',
    rules: [
      { tag: 'PACK-OUT', text: 'Carry out every gram of food packaging, wax paper, and micro-refuse. Nothing is burned into dirt.' },
      { tag: 'HEARTHS', text: 'Strict ban on open forest fires between April 15 and September 15. Utilize existing stone rings only.' },
      { tag: 'LIVING WOOD', text: 'Never strip bark from standing living birch trees. Dead and down pine knots provide all needed tinder.' },
      { tag: 'WATERWAYS', text: 'Wash cookware and body at least 50 meters away from tarns and headwaters using biodegradable sand scrubs.' }
    ]
  },
  {
    id: 'stilhet',
    number: '03',
    title: 'Stilhet & Ro',
    subtitle: 'Acoustic Sanctuary & Backcountry Solitude',
    summary: 'In an era of relentless sensory static, the Nordic taiga remains one of Europe’s last sanctuaries of pure acoustic silence.',
    rules: [
      { tag: 'NO NOISE', text: 'Silence amplified speakers and mechanical devices. Let the wind in the spruce boughs remain uninterrupted.' },
      { tag: 'DRONE BAN', text: 'Zero unmanned aerial overflights. Drones disrupt nesting golden eagles and shatter human stillness.' },
      { tag: 'WILDLIFE', text: 'Give wide berth to reindeer herds, moose, and capercaillie leks. Never corner foraging animals.' },
      { tag: 'DUSK MANNERS', text: 'Lower voices to a whisper when approaching communal gapahuks or lean-tos after sundown.' }
    ]
  },
  {
    id: 'surveyor',
    number: '04',
    title: 'The Surveyor’s Pact',
    subtitle: 'Shelter Kinship & Mutual Aid',
    summary: 'Backcountry shelters survive only through the quiet, unspoken cooperation of consecutive travelers crossing harsh territory.',
    rules: [
      { tag: 'DRY KINDLING', text: 'Always leave split birch firewood and dry shavings in the shelter firewood box for whoever arrives next.' },
      { tag: 'SWEEP HEARTH', text: 'Sweep the shelter floor and clear damp moss debris before packing your rucksack at dawn.' },
      { tag: 'HAZARDS', text: 'Note and report washed-out bog bridges, windthrow trail blockages, or rotten footings in trail ledger.' },
      { tag: 'OPEN DOORS', text: 'Never turn away a storm-bound traveler from an emergency gapahuk, regardless of how crowded.' }
    ]
  }
]

const pledgeItems = ref([
  { id: 'refuse', text: 'I will pack out every trace of trash, wax, and tape.', checked: true },
  { id: 'distance', text: 'I will maintain the 150-meter setback from rural dwellings.', checked: true },
  { id: 'wood', text: 'I will leave dry birch kindling inside every shelter I inhabit.', checked: true },
  { id: 'fire', text: 'I will respect seasonal fire bans and douse embers stone-cold.', checked: true },
  { id: 'silence', text: 'I will honor the acoustic stillness of the boreal night.', checked: true }
])

function togglePledge(item: any) {
  item.checked = !item.checked
}
</script>

<template>
  <div class="ethos-page">
    <div class="ethos-container">
      <!-- Page Header -->
      <header class="ethos-header">
        <div class="header-pre font-mono">
          <span class="header-beacon" />
          <span>FRILUFTSLIV // FIELD CREED</span>
        </div>
        <h1 class="ethos-title font-serif">
          The Backcountry Ethos
        </h1>
        <p class="ethos-intro font-serif">
          The Nordic boreal forest is not an obstacle course to conquer, but an ancient host demanding reverence, solitude, and meticulous stewardship.
        </p>

        <!-- Quote Banner -->
        <blockquote class="quote-card font-serif">
          <span class="material-symbols-outlined quote-icon">format_quote</span>
          <p class="quote-text">
            “Nature is not a place to visit. It is home. We wander not to leave our mark, but to let the forest erase our restless vanity.”
          </p>
          <cite class="quote-author font-mono">— FRILUFTSLIV ARCHIVE BENCHMARK</cite>
        </blockquote>
      </header>

      <!-- 4 Pillars Section -->
      <section class="pillars-section">
        <h2 class="section-title font-mono">
          <span>FOUR PILLARS OF CONDUCT</span>
          <span class="pillar-count font-mono">4 ARTICLES</span>
        </h2>

        <div class="pillars-grid">
          <article
            v-for="pillar in pillars"
            :key="pillar.id"
            class="pillar-card"
            :class="{ 'expanded': activePillar === pillar.id }"
          >
            <div
              class="pillar-card-header"
              @click="togglePillar(pillar.id)"
            >
              <div class="pillar-meta">
                <span class="pillar-num font-mono">{{ pillar.number }}</span>
                <div>
                  <h3 class="pillar-name font-serif">{{ pillar.title }}</h3>
                  <div class="pillar-sub font-mono">{{ pillar.subtitle }}</div>
                </div>
              </div>
              <span class="material-symbols-outlined toggle-chevron font-mono">
                {{ activePillar === pillar.id ? 'expand_less' : 'expand_more' }}
              </span>
            </div>

            <p class="pillar-summary font-serif">
              {{ pillar.summary }}
            </p>

            <!-- Rules list -->
            <div class="rules-list">
              <div
                v-for="(rule, idx) in pillar.rules"
                :key="idx"
                class="rule-item"
              >
                <span class="rule-tag font-mono">{{ rule.tag }}</span>
                <span class="rule-text font-serif">{{ rule.text }}</span>
              </div>
            </div>
          </article>
        </div>
      </section>

      <!-- Field Pledge Checklist -->
      <section class="pledge-section">
        <div class="pledge-header">
          <span class="material-symbols-outlined pledge-icon">verified_user</span>
          <div>
            <h3 class="pledge-title font-serif">Surveyor’s Compact</h3>
            <p class="pledge-sub font-mono">FIVE FIELD PRINCIPLES BEFORE CROSSING THE TREELINE</p>
          </div>
        </div>

        <div class="pledge-list">
          <div
            v-for="item in pledgeItems"
            :key="item.id"
            class="pledge-item"
            :class="{ 'is-checked': item.checked }"
            @click="togglePledge(item)"
          >
            <div class="pledge-checkbox">
              <span
                v-if="item.checked"
                class="material-symbols-outlined checkmark"
              >
                check
              </span>
            </div>
            <span class="pledge-text font-serif">{{ item.text }}</span>
          </div>
        </div>
      </section>

      <!-- Footer benchmark note -->
      <footer class="ethos-footer font-mono">
        <span class="footer-dot">●</span>
        <span>NORDIC WILDERNESS ATLAS // RECORDED IN NORDMARKA</span>
      </footer>
    </div>
  </div>
</template>

<style scoped>
.ethos-page {
  min-height: 100vh;
  min-height: 100dvh;
  padding-top: 56px;
  padding-bottom: 96px;
  background-color: var(--color-surface);
}

.ethos-container {
  max-width: 600px;
  margin: 0 auto;
  padding: 16px;
}

.ethos-header {
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

.ethos-title {
  font-size: 32px;
  font-weight: 500;
  line-height: 1.15;
  color: var(--color-primary);
  margin-bottom: 6px;
}

.ethos-intro {
  font-size: 14px;
  line-height: 1.5;
  color: var(--color-on-surface-variant);
  margin-bottom: 16px;
}

/* Quote banner */
.quote-card {
  position: relative;
  background-color: var(--color-card-bg);
  border-left: 3.5px solid var(--color-secondary);
  border-radius: 0 8px 8px 0;
  padding: 14px 14px 12px 16px;
  margin-top: 12px;
  border-top: 1px solid var(--color-card-border);
  border-right: 1px solid var(--color-card-border);
  border-bottom: 1px solid var(--color-card-border);
  box-shadow: var(--color-card-shadow);
}

.quote-icon {
  font-size: 20px;
  color: var(--color-secondary);
  opacity: 0.6;
  margin-bottom: 4px;
  display: block;
}

.quote-text {
  font-size: 14px;
  font-style: italic;
  line-height: 1.45;
  color: var(--color-primary);
  margin-bottom: 6px;
}

.quote-author {
  font-size: 9px;
  letter-spacing: 0.08em;
  color: var(--color-on-surface-variant);
}

/* Pillars */
.pillars-section {
  margin-bottom: 24px;
}

.section-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 11px;
  letter-spacing: 0.08em;
  color: var(--color-outline);
  margin-bottom: 12px;
  padding-bottom: 6px;
  border-bottom: 1px solid rgba(194, 200, 194, 0.5);
}

.pillar-count {
  font-size: 10px;
  color: var(--color-secondary);
}

.pillars-grid {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.pillar-card {
  background-color: var(--color-card-bg);
  border: 1px solid var(--color-card-border);
  border-radius: 8px;
  padding: 14px;
  box-shadow: var(--color-card-shadow);
}

.pillar-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  user-select: none;
}

.pillar-meta {
  display: flex;
  align-items: center;
  gap: 10px;
}

.pillar-num {
  font-size: 14px;
  font-weight: 700;
  color: var(--color-secondary);
  background-color: rgba(217, 83, 30, 0.1);
  padding: 4px 6px;
  border-radius: 4px;
  line-height: 1;
}

.pillar-name {
  font-size: 17px;
  font-weight: 600;
  color: var(--color-primary);
  line-height: 1.2;
}

.pillar-sub {
  font-size: 10px;
  color: var(--color-on-surface-variant);
  letter-spacing: 0.04em;
  margin-top: 1px;
}

.toggle-chevron {
  font-size: 20px;
  color: var(--color-outline);
}

.pillar-summary {
  font-size: 13px;
  line-height: 1.45;
  color: var(--color-on-surface);
  margin-top: 10px;
  margin-bottom: 12px;
}

.rules-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding-top: 8px;
  border-top: 1px dashed rgba(115, 120, 116, 0.25);
}

.rule-item {
  display: flex;
  align-items: flex-start;
  gap: 8px;
}

.rule-tag {
  font-size: 8.5px;
  font-weight: 700;
  letter-spacing: 0.06em;
  color: var(--color-primary);
  background-color: rgba(27, 46, 36, 0.08);
  padding: 2px 5px;
  border-radius: 3px;
  flex-shrink: 0;
  margin-top: 1px;
}

.rule-text {
  font-size: 12.5px;
  line-height: 1.4;
  color: var(--color-on-surface-variant);
}

/* Pledge section */
.pledge-section {
  background-color: var(--color-handle-bg);
  border: 1px solid rgba(115, 120, 116, 0.4);
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 24px;
  box-shadow: 0 2px 8px rgba(27, 46, 36, 0.06);
}

.pledge-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 14px;
  padding-bottom: 10px;
  border-bottom: 1px solid rgba(115, 120, 116, 0.25);
}

.pledge-icon {
  font-size: 24px;
  color: var(--color-secondary);
}

.pledge-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--color-primary);
  line-height: 1.2;
}

.pledge-sub {
  font-size: 9px;
  letter-spacing: 0.08em;
  color: var(--color-on-surface-variant);
}

.pledge-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.pledge-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  background-color: var(--color-surface-container-lowest);
  border: 1px solid rgba(194, 200, 194, 0.6);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.15s ease;
  user-select: none;
}

.pledge-item:hover {
  background-color: #fff;
  border-color: var(--color-secondary);
}

.pledge-checkbox {
  width: 18px;
  height: 18px;
  border: 1.5px solid var(--color-outline);
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  background-color: transparent;
  transition: all 0.15s ease;
}

.pledge-item.is-checked .pledge-checkbox {
  background-color: var(--color-secondary);
  border-color: var(--color-secondary);
}

.checkmark {
  font-size: 13px;
  color: #fff;
  font-weight: bold;
}

.pledge-text {
  font-size: 12.5px;
  line-height: 1.35;
  color: var(--color-primary);
}

.pledge-item.is-checked .pledge-text {
  color: var(--color-primary);
}

/* Footer */
.ethos-footer {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 9.5px;
  letter-spacing: 0.08em;
  color: var(--color-outline);
  padding: 12px 0;
}

.footer-dot {
  font-size: 6px;
  color: var(--color-secondary);
}
</style>
