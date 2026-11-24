<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { ETHOS_HERO_IMAGE, ETHOS_PRINCIPLES, getEthosTelemetry } from '~/utils/ethos'

useHead({
  title: 'Why I Go Into the Woods — Field Ethos | Nerd in the Forest',
  meta: [
    {
      name: 'description',
      content:
        'The personal story and Nordic field ethos behind Nerd in the Forest: balancing weekday software work with quiet woods, wild-camping respect, and honest gear insights.'
    },
    { property: 'og:title', content: 'Why I Go Into the Woods — Nerd in the Forest' },
    {
      property: 'og:description',
      content: 'Personal field ethos, mapping principles, and Nordic backcountry notes from Nerd in the Forest.'
    },
    { property: 'og:image', content: ETHOS_HERO_IMAGE }
  ]
})

const { dispatches, mapWaypoints, error: cmsError, fetchWaypoints, fetchPosts } = useNitfCms()
const telemetryError = useState<string | null>('nitf-ethos-telemetry-error', () => null)

async function loadTelemetry() {
  let latestError: string | null = null
  await fetchWaypoints()
  if (cmsError.value) {
    latestError = cmsError.value
  }
  await fetchPosts()
  if (cmsError.value) {
    latestError = cmsError.value
  }
  telemetryError.value = latestError
}

await useAsyncData('nitf-ethos-telemetry', async () => {
  await loadTelemetry()
  return {
    dispatches: dispatches.value.length,
    waypoints: mapWaypoints.value.length,
    error: telemetryError.value
  }
})

onMounted(async () => {
  if (telemetryError.value || dispatches.value.length === 0 || mapWaypoints.value.length === 0) {
    await loadTelemetry()
  }
})

const telemetry = computed(() =>
  getEthosTelemetry({
    dispatchCount: dispatches.value.length,
    waypointCount: mapWaypoints.value.length,
    cmsError: telemetryError.value
  })
)
</script>

<template>
  <div class="ethos-page">
    <div class="ethos-container">
      <!-- Page Header & Personal Intro -->
      <header class="ethos-header">
        <div class="header-pre font-mono">
          <span class="header-beacon" />
          <span>NERD IN THE FOREST // FIELD ETHOS</span>
        </div>

        <h1 class="ethos-title font-serif">
          Why I Go Into the Woods
        </h1>

        <div class="ethos-hero-frame">
          <img
            :src="ETHOS_HERO_IMAGE"
            alt="Nerd in the Forest in Seitseminen National Park, Finland"
            fetchpriority="high"
            decoding="async"
            class="ethos-hero-img"
          />
        </div>

        <div class="ethos-intro-copy font-serif">
          <p class="ethos-intro">
            Most weekdays I’m building software and staring at screens. Heading into the Nordic forest is how I reset: less noise, fresh air, and quiet nights outside without a schedule.
          </p>
          <p class="ethos-intro">
            Nerd in the Forest is where those two sides meet—a map-first field log of trails, public shelters, and nights spent wild camping, backed by GPX tracks and practical gear notes.
          </p>
        </div>
      </header>

      <!-- Live Atlas Telemetry & Quick Links -->
      <section class="telemetry-section" aria-label="Live Atlas Summary">
        <div class="telemetry-grid">
          <NuxtLink to="/ledger" class="telemetry-card">
            <span class="telemetry-label font-mono">LOGGED DISPATCHES</span>
            <div class="telemetry-value-row">
              <span class="telemetry-value font-serif">{{ telemetry.dispatchesLabel }}</span>
              <span class="material-symbols-outlined telemetry-arrow" aria-hidden="true">arrow_forward</span>
            </div>
          </NuxtLink>

          <NuxtLink to="/" class="telemetry-card">
            <span class="telemetry-label font-mono">SURVEYED WAYPOINTS</span>
            <div class="telemetry-value-row">
              <span class="telemetry-value font-serif">{{ telemetry.waypointsLabel }}</span>
              <span class="material-symbols-outlined telemetry-arrow" aria-hidden="true">arrow_forward</span>
            </div>
          </NuxtLink>
        </div>

        <div class="explore-links font-mono">
          <span class="explore-prefix">EXPLORE //</span>
          <NuxtLink to="/" class="explore-link">Atlas Map</NuxtLink>
          <span class="explore-sep" aria-hidden="true">·</span>
          <NuxtLink to="/ledger" class="explore-link">Field Ledger</NuxtLink>
          <span class="explore-sep" aria-hidden="true">·</span>
          <NuxtLink to="/gear" class="explore-link">Gear Locker</NuxtLink>
        </div>

        <p v-if="telemetry.isOffline" class="telemetry-offline font-mono">
          Basecamp CMS unreachable — live counts offline.
        </p>
      </section>

      <!-- 4 Personal Principles -->
      <section class="pillars-section">
        <h2 class="section-title font-mono">
          <span>FIELD PRINCIPLES</span>
          <span class="pillar-count font-mono">4 NOTES</span>
        </h2>

        <div class="pillars-grid">
          <article
            v-for="pillar in ETHOS_PRINCIPLES"
            :key="pillar.id"
            class="pillar-card"
          >
            <div class="pillar-card-header">
              <div class="pillar-meta">
                <span class="pillar-num font-mono">{{ pillar.number }}</span>
                <div>
                  <h3 class="pillar-name font-serif">{{ pillar.title }}</h3>
                  <div class="pillar-sub font-mono">{{ pillar.subtitle }}</div>
                </div>
              </div>
            </div>

            <p class="pillar-summary font-serif">
              {{ pillar.summary }}
            </p>

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

      <!-- Footer -->
      <footer class="ethos-footer font-mono">
        <span class="footer-dot" aria-hidden="true">●</span>
        <span>NERD IN THE FOREST // NORDIC FIELD ATLAS</span>
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
}

.ethos-title {
  font-size: 32px;
  font-weight: 500;
  line-height: 1.15;
  color: var(--color-primary);
  margin-bottom: 14px;
}

.ethos-hero-frame {
  width: 100%;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid var(--color-card-border);
  background-color: var(--color-surface-container);
  box-shadow: var(--color-card-shadow);
  margin-bottom: 16px;
}

.ethos-hero-img {
  width: 100%;
  height: auto;
  max-height: 380px;
  object-fit: cover;
  object-position: center 25%;
  display: block;
}

.ethos-intro-copy {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.ethos-intro {
  font-size: 14.5px;
  line-height: 1.55;
  color: var(--color-on-surface-variant);
}

/* Telemetry Strip */
.telemetry-section {
  margin-bottom: 24px;
}

.telemetry-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
  margin-bottom: 10px;
}

.telemetry-card {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 12px 14px;
  background-color: var(--color-card-bg);
  border: 1px solid var(--color-card-border);
  border-radius: 8px;
  box-shadow: var(--color-card-shadow);
  text-decoration: none;
  transition: transform 0.15s ease, border-color 0.15s ease;
}

.telemetry-card:hover {
  transform: translateY(-1px);
  border-color: var(--color-secondary);
}

.telemetry-card:focus-visible,
.explore-link:focus-visible {
  outline: 2px solid var(--color-secondary);
  outline-offset: 2px;
}

.telemetry-label {
  font-size: 9.5px;
  letter-spacing: 0.08em;
  color: var(--color-outline);
  font-weight: 600;
}

.telemetry-value-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.telemetry-value {
  font-size: 24px;
  font-weight: 600;
  line-height: 1.1;
  color: var(--color-primary);
}

.telemetry-arrow {
  font-size: 16px;
  color: var(--color-secondary);
}

.explore-links {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
  font-size: 10px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--color-outline);
}

.explore-prefix {
  color: var(--color-secondary);
  font-weight: 700;
}

.explore-link {
  color: var(--color-primary);
  text-decoration: none;
  font-weight: 600;
  border-bottom: 1px dashed rgba(27, 46, 36, 0.35);
}

.explore-link:hover {
  color: var(--color-secondary);
  border-bottom-color: var(--color-secondary);
}

.explore-sep {
  opacity: 0.5;
}

.telemetry-offline {
  margin-top: 6px;
  font-size: 9.5px;
  letter-spacing: 0.05em;
  color: var(--color-outline);
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

.pillar-summary {
  font-size: 13.5px;
  line-height: 1.5;
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
  margin-top: 2px;
}

.rule-text {
  font-size: 12.5px;
  line-height: 1.45;
  color: var(--color-on-surface-variant);
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
