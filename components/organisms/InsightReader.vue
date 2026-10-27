<script setup lang="ts">
import type { GearInsight } from '~/data/mockGearData'

interface Props {
  insight: GearInsight | null
  isOpen: boolean
  relatedInsights?: GearInsight[]
}

const props = defineProps<Props>()
const DEFAULT_GEAR_HERO_IMAGE = 'https://images.unsplash.com/photo-1510312305653-8ed496efae75?auto=format&fit=crop&w=1000&q=80'

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'view-gear', gearItemId: string): void
  (e: 'select-insight', insight: GearInsight): void
}>()

function copyShareUrl() {
  if (typeof window !== 'undefined') {
    navigator.clipboard.writeText(window.location.href)
  }
}
</script>

<template>
  <Teleport to="body">
    <Transition name="fade-slide">
      <div
        v-if="isOpen && insight"
        class="insight-reader-overlay"
      >
        <!-- Top Sticky Surveyor Navigation Bar -->
        <nav class="reader-header font-mono">
          <button
            class="reader-back-btn"
            type="button"
            @click="emit('close')"
          >
            <span class="material-symbols-outlined text-[16px]">arrow_back</span>
            <span>GEAR LEDGER</span>
          </button>

          <div class="reader-header-tag">
            <span>{{ insight.tag }} // {{ insight.category }}</span>
          </div>

          <button
            class="reader-share-btn"
            type="button"
            title="Copy link"
            @click="copyShareUrl"
          >
            <span class="material-symbols-outlined text-[15px]">share</span>
            <span class="share-label">SHARE</span>
          </button>
        </nav>

        <!-- Scrollable Article Content -->
        <main class="reader-content-scroll">
          <article class="reader-article">
            <!-- Hero Image Banner -->
            <div class="reader-hero">
              <img
                :src="insight.image || DEFAULT_GEAR_HERO_IMAGE"
                :alt="insight.title"
                class="reader-hero-img"
              />
              <div class="reader-hero-overlay" />
              <div class="reader-hero-stamp font-mono">
                <span class="hero-stamp-equip">{{ insight.equipmentTested }}</span>
                <span class="hero-stamp-sep">•</span>
                <span>{{ insight.duration }}</span>
              </div>
            </div>

            <!-- Article Header -->
            <header class="article-header">
              <div class="article-metadata font-mono">
                <span class="meta-date">{{ insight.date }}</span>
                <span class="meta-dot">/</span>
                <span class="meta-readtime">{{ insight.readTime }}</span>
                <span class="meta-dot">/</span>
                <span class="meta-tag">{{ insight.category }}</span>
              </div>

              <h1 class="article-title font-serif">
                {{ insight.title }}
              </h1>

              <p class="article-lead font-serif">
                {{ insight.summary }}
              </p>

              <!-- Telemetry Metrics Dashboard (Important Information Widgets) -->
              <div class="telemetry-dashboard font-mono">
                <div
                  v-for="t in insight.telemetry"
                  :key="t.label"
                  class="dashboard-tile"
                >
                  <span class="tile-label">{{ t.label }}</span>
                  <span class="tile-value">{{ t.value }}</span>
                </div>
              </div>

              <!-- Test Context Metadata Box -->
              <div class="test-context-box font-mono">
                <div class="context-entry context-entry-between">
                  <div class="context-entry-main">
                    <span class="context-key">TESTED EQUIPMENT:</span>
                    <span class="context-val">{{ insight.equipmentTested }}</span>
                  </div>
                  <button
                    v-if="insight.gearItemId"
                    type="button"
                    class="view-gear-inline-btn font-mono"
                    @click="emit('view-gear', insight.gearItemId)"
                  >
                    <span>VIEW IN MY GEAR</span>
                    <span class="material-symbols-outlined text-[13px]">arrow_forward</span>
                  </button>
                </div>
                <div class="context-entry">
                  <span class="context-key">TEST DURATION:</span>
                  <span class="context-val">{{ insight.duration }}</span>
                </div>
              </div>

              <div class="article-divider" />
            </header>

            <!-- Field Observations & Evidence Section -->
            <section class="observations-section">
              <h2 class="section-heading font-mono">
                <span class="material-symbols-outlined text-[16px] text-secondary">fact_check</span>
                <span>FIELD OBSERVATIONS & EVIDENCE</span>
              </h2>

              <ul class="obs-full-list">
                <li
                  v-for="(obs, idx) in insight.observations"
                  :key="idx"
                  class="obs-full-item font-serif"
                >
                  <span class="obs-bullet">•</span>
                  <p class="obs-text">{{ obs }}</p>
                </li>
              </ul>
            </section>

            <!-- Surveyor Verdict Callout -->
            <section class="verdict-section">
              <div class="verdict-callout-card">
                <div class="verdict-bar" />
                <div class="verdict-body font-mono">
                  <span class="verdict-heading">
                    <span class="material-symbols-outlined text-[15px] text-secondary">verified</span>
                    SURVEYOR VERDICT & RECOMMENDATION //
                  </span>
                  <p class="verdict-content">{{ insight.verdict }}</p>
                </div>
              </div>
            </section>

            <!-- Sibling Reviews for the Same Gear Item -->
            <section
              v-if="relatedInsights && relatedInsights.length > 0"
              class="sibling-reviews-section"
            >
              <h2 class="section-heading font-mono">
                <span class="material-symbols-outlined text-[16px] text-secondary">library_books</span>
                <span>MORE REVIEWS FOR {{ (insight.gearItemName || 'THIS GEAR').toUpperCase() }} ({{ relatedInsights.length }})</span>
              </h2>
              <div class="sibling-reviews-list">
                <button
                  v-for="rel in relatedInsights"
                  :key="rel.id"
                  type="button"
                  class="sibling-review-card"
                  @click="emit('select-insight', rel)"
                >
                  <div class="sibling-review-meta font-mono">
                    <span class="sibling-review-tag">{{ rel.category }}</span>
                    <span>•</span>
                    <span>{{ rel.date }}</span>
                  </div>
                  <div class="sibling-review-title font-serif">{{ rel.title }}</div>
                </button>
              </div>
            </section>

            <!-- Article Footer Signoff -->
            <footer class="article-footer font-mono">
              <div class="footer-signoff">
                <span>NERD IN THE FOREST // GEAR LEDGER FIELD REVIEWS</span>
                <span>SUB-ARCTIC TAIGA & BOREAL FIELD TESTING</span>
              </div>

              <button
                class="footer-back-btn"
                type="button"
                @click="emit('close')"
              >
                <span class="material-symbols-outlined text-[16px]">arrow_back</span>
                <span>RETURN TO GEAR LEDGER</span>
              </button>
            </footer>
          </article>
        </main>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.insight-reader-overlay {
  position: fixed;
  inset: 0;
  z-index: 100;
  background-color: var(--color-surface);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* TOP STICKY BAR */
.reader-header {
  position: sticky;
  top: 0;
  height: 52px;
  background-color: rgba(244, 236, 218, 0.95);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(115, 120, 116, 0.35);
  padding: 0 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  z-index: 10;
  flex-shrink: 0;
}

.reader-back-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: transparent;
  border: none;
  color: var(--color-primary);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.06em;
  cursor: pointer;
  padding: 6px 0;
  transition: color 0.15s ease;
}

.reader-back-btn:hover {
  color: var(--color-secondary);
}

.reader-header-tag {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.08em;
  color: var(--color-secondary);
  text-transform: uppercase;
}

.reader-share-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: transparent;
  border: 1px solid rgba(115, 120, 116, 0.35);
  padding: 4px 8px;
  border-radius: 4px;
  color: var(--color-lichen-slate);
  font-size: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
}

.reader-share-btn:hover {
  background-color: var(--color-surface-container);
  color: var(--color-primary);
}

/* SCROLLABLE MAIN BODY */
.reader-content-scroll {
  flex: 1;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}

.reader-article {
  max-width: 680px;
  margin: 0 auto;
  padding-bottom: 80px;
}

/* HERO BANNER */
.reader-hero {
  position: relative;
  width: 100%;
  height: 300px;
  overflow: hidden;
  background-color: var(--color-surface-container-high);
}

.reader-hero-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.reader-hero-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(6, 25, 16, 0.1) 0%, rgba(6, 25, 16, 0.7) 100%);
}

.reader-hero-stamp {
  position: absolute;
  bottom: 14px;
  left: 16px;
  right: 16px;
  color: #ffffff;
  font-size: 10.5px;
  letter-spacing: 0.07em;
  opacity: 0.95;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.hero-stamp-equip {
  font-weight: 700;
}

.hero-stamp-sep {
  opacity: 0.6;
}

/* ARTICLE HEADER */
.article-header {
  padding: 24px 20px 16px;
}

.article-metadata {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
  font-size: 10px;
  letter-spacing: 0.05em;
  color: var(--color-lichen-slate);
  margin-bottom: 10px;
}

.meta-date {
  color: var(--color-secondary);
  font-weight: 700;
}

.meta-dot {
  opacity: 0.4;
}

.meta-tag {
  color: var(--color-primary);
  font-weight: 700;
}

.article-title {
  font-size: 28px;
  font-weight: 600;
  line-height: 1.22;
  color: var(--color-primary);
  margin-bottom: 14px;
  letter-spacing: -0.015em;
}

.article-lead {
  font-size: 16px;
  line-height: 1.55;
  color: var(--color-on-surface-variant);
  margin-bottom: 20px;
}

/* TELEMETRY DASHBOARD */
.telemetry-dashboard {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  margin-bottom: 16px;
}

.dashboard-tile {
  background-color: var(--color-surface-container);
  border: 1px solid rgba(115, 120, 116, 0.3);
  border-radius: 6px;
  padding: 8px 10px;
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.tile-label {
  font-size: 8px;
  font-weight: 600;
  letter-spacing: 0.06em;
  color: var(--color-lichen-slate);
  text-transform: uppercase;
}

.tile-value {
  font-size: 12px;
  font-weight: 700;
  color: var(--color-primary);
}

/* TEST CONTEXT BOX */
.test-context-box {
  background-color: var(--color-surface-container-low);
  border: 1px solid rgba(115, 120, 116, 0.25);
  border-radius: 6px;
  padding: 10px 12px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 10px;
  margin-bottom: 20px;
}

.context-entry {
  display: flex;
  align-items: baseline;
  gap: 6px;
  flex-wrap: wrap;
}

.context-entry-between {
  justify-content: space-between;
  align-items: center;
}

.context-entry-main {
  display: flex;
  align-items: baseline;
  gap: 6px;
  flex-wrap: wrap;
}

.view-gear-inline-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: transparent;
  border: 1px solid rgba(217, 83, 30, 0.35);
  border-radius: 4px;
  padding: 3px 8px;
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.06em;
  color: var(--color-secondary);
  cursor: pointer;
  transition: all 0.15s ease;
}

.view-gear-inline-btn:hover {
  background-color: rgba(217, 83, 30, 0.1);
}

.context-key {
  color: var(--color-lichen-slate);
  font-weight: 700;
  letter-spacing: 0.05em;
  flex-shrink: 0;
}

.context-val {
  color: var(--color-primary);
  font-weight: 600;
}

.article-divider {
  width: 100%;
  height: 1px;
  background-color: rgba(115, 120, 116, 0.25);
  margin-top: 10px;
}

/* FIELD OBSERVATIONS & EVIDENCE */
.observations-section {
  padding: 20px 20px 10px;
}

.section-heading {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.08em;
  color: var(--color-primary);
  margin-bottom: 14px;
}

.obs-full-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.obs-full-item {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  font-size: 14.5px;
  line-height: 1.5;
  color: var(--color-on-surface);
}

.obs-bullet {
  color: var(--color-secondary);
  font-weight: 700;
  flex-shrink: 0;
}

.obs-text {
  margin: 0;
}

/* SURVEYOR VERDICT CALLOUT */
.verdict-section {
  padding: 16px 20px 24px;
}

.verdict-callout-card {
  display: flex;
  border-radius: 6px;
  overflow: hidden;
  background-color: rgba(27, 46, 36, 0.05);
  border: 1px solid rgba(27, 46, 36, 0.2);
}

.verdict-bar {
  width: 5px;
  background-color: var(--color-secondary);
  flex-shrink: 0;
}

.verdict-body {
  padding: 14px 16px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.verdict-heading {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.08em;
  color: var(--color-secondary);
}

.verdict-content {
  font-size: 12.5px;
  font-weight: 600;
  line-height: 1.45;
  color: var(--color-primary);
  margin: 0;
}

.sibling-reviews-section {
  padding: 0 20px 24px;
}

.sibling-reviews-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.sibling-review-card {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
  width: 100%;
  text-align: left;
  padding: 10px 14px;
  border-radius: 6px;
  border: 1px solid rgba(115, 120, 116, 0.3);
  background-color: var(--color-surface-container-low);
  cursor: pointer;
  transition: all 0.15s ease;
}

.sibling-review-card:hover {
  border-color: var(--color-secondary);
  background-color: var(--color-surface-container);
}

.sibling-review-meta {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 9.5px;
  color: var(--color-lichen-slate);
}

.sibling-review-tag {
  color: var(--color-secondary);
  font-weight: 700;
}

.sibling-review-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-primary);
}

/* FOOTER */
.article-footer {
  padding: 32px 20px;
  border-top: 1px solid rgba(115, 120, 116, 0.25);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  text-align: center;
}

.footer-signoff {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 9px;
  color: var(--color-lichen-slate);
  letter-spacing: 0.08em;
}

.footer-back-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 18px;
  background-color: var(--color-primary);
  color: #ffffff;
  border-radius: 4px;
  border: none;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.06em;
  cursor: pointer;
  transition: all 0.15s ease;
}

.footer-back-btn:hover {
  background-color: var(--color-secondary);
}

.text-secondary {
  color: var(--color-secondary);
}

/* TRANSITION */
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.25s ease;
}

.fade-slide-enter-from,
.fade-slide-leave-to {
  transform: translateY(20px);
  opacity: 0;
}

@media (max-width: 640px) {
  .telemetry-dashboard {
    grid-template-columns: 1fr;
  }

  .reader-hero {
    height: 220px;
  }

  .article-title {
    font-size: 23px;
  }
}
</style>
