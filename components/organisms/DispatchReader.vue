<script setup lang="ts">
import type { MockFieldNote } from '~/data/mockNordicTrail'

interface Props {
  note: MockFieldNote | null
  isOpen: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'back-to-map'): void
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
        v-if="isOpen && note"
        class="dispatch-reader-overlay"
      >
      <!-- Top Sticky Surveyor Navigation Bar -->
      <nav class="reader-header">
        <button
          class="reader-back-btn font-mono"
          type="button"
          @click="emit('back-to-map')"
        >
          <span class="material-symbols-outlined text-[16px]">arrow_back</span>
          <span>ATLAS MAP</span>
        </button>

        <div class="reader-header-tag font-mono">
          <span>{{ note.numberTag }}</span>
        </div>

        <button
          class="reader-share-btn font-mono"
          type="button"
          title="Copy link"
          @click="copyShareUrl"
        >
          <span class="material-symbols-outlined text-[15px]">share</span>
          <span class="share-label">SHARE</span>
        </button>
      </nav>

      <!-- Scrollable Editorial Story -->
      <main class="reader-content-scroll">
        <article class="reader-article">
          <!-- Hero Image Banner -->
          <div class="reader-hero">
            <img
              :src="note.heroImage"
              :alt="note.title"
              class="reader-hero-img"
            />
            <div class="reader-hero-overlay" />
            <div class="reader-hero-stamp font-mono">
              <span>[{{ note.latitude.toFixed(4) }}°N • {{ note.longitude.toFixed(4) }}°E]</span>
              <span v-if="note.area">• {{ note.area }}</span>
              <span v-if="note.elevation">• {{ note.elevation }}M ELEV</span>
            </div>
          </div>

          <!-- Article Header -->
          <header class="article-header">
            <div class="article-metadata font-mono">
              <span class="meta-date">{{ note.date }}</span>
              <span class="meta-dot">/</span>
              <span class="meta-readtime">{{ note.readTime }}</span>
              <span class="meta-dot">/</span>
              <span class="meta-weather">{{ note.weather }}</span>
            </div>

            <h1 class="article-title font-serif">
              {{ note.title }}
            </h1>

            <p class="article-lead font-serif">
              {{ note.description }}
            </p>

            <!-- Amenities Chips -->
            <div class="amenities-row">
              <span
                v-for="(amenity, idx) in note.amenities"
                :key="idx"
                class="amenity-chip font-mono"
              >
                <span class="material-symbols-outlined chip-icon">{{ amenity.icon }}</span>
                <span>{{ amenity.label }}</span>
              </span>
            </div>

            <!-- Link to Location Dossier -->
            <div class="location-link-row font-mono">
              <span class="location-link-label">SURVEY POINT:</span>
              <NuxtLink
                :to="`/locations/${note.slug || note.id}`"
                class="location-dossier-pill"
              >
                <span>{{ note.title }}</span>
                <span class="material-symbols-outlined text-[13px]">open_in_new</span>
              </NuxtLink>
            </div>

            <div class="article-divider" />
          </header>

          <!-- Rich Narrative Body -->
          <div class="article-body font-serif">
            <p
              v-for="(paragraph, pIdx) in note.content"
              :key="pIdx"
              class="body-paragraph"
            >
              {{ paragraph }}
            </p>
          </div>

          <!-- Photo Gallery (if available) -->
          <section
            v-if="note.gallery && note.gallery.length > 0"
            class="article-gallery"
          >
            <h2 class="gallery-title font-mono">
              SURVEYOR FIELD CAPTURES
            </h2>
            <div class="gallery-grid">
              <figure
                v-for="(item, gIdx) in note.gallery"
                :key="gIdx"
                class="gallery-item"
              >
                <img
                  :src="item.url"
                  :alt="item.caption"
                  class="gallery-img"
                />
                <figcaption class="gallery-caption font-mono">
                  {{ item.caption }}
                </figcaption>
              </figure>
            </div>
          </section>

          <!-- Surveyor Footer / Back to Map Anchor -->
          <footer class="article-footer">
            <div class="footer-signoff font-mono">
              <span>NERD IN THE FOREST // FIELD NOTES ARCHIVE</span>
              <span>OSLO BOREAL HIGHLANDS • 2026</span>
            </div>

            <button
              class="footer-back-btn font-mono"
              type="button"
              @click="emit('back-to-map')"
            >
              <span class="material-symbols-outlined text-[16px]">map</span>
              <span>RETURN TO ATLAS MAP</span>
            </button>
          </footer>
        </article>
      </main>
    </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.dispatch-reader-overlay {
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
  background-color: rgba(248, 243, 231, 0.95);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(194, 200, 194, 0.4);
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
  font-weight: 600;
  letter-spacing: 0.05em;
  cursor: pointer;
  padding: 6px 0;
}

.reader-header-tag {
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.1em;
  color: var(--color-secondary);
}

.reader-share-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: transparent;
  border: 1px solid rgba(115, 120, 116, 0.3);
  padding: 4px 8px;
  border-radius: 4px;
  color: var(--color-lichen-slate);
  font-size: 10px;
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
  height: 280px;
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
  background: linear-gradient(180deg, rgba(6, 25, 16, 0.1) 0%, rgba(6, 25, 16, 0.6) 100%);
}

.reader-hero-stamp {
  position: absolute;
  bottom: 12px;
  left: 16px;
  right: 16px;
  color: #ffffff;
  font-size: 10px;
  letter-spacing: 0.08em;
  opacity: 0.95;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.6);
  display: flex;
  gap: 8px;
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

.meta-dot {
  opacity: 0.4;
}

.article-title {
  font-size: 32px;
  font-weight: 500;
  line-height: 1.15;
  color: var(--color-primary);
  margin-bottom: 14px;
  letter-spacing: -0.015em;
}

.article-lead {
  font-size: 17px;
  line-height: 1.6;
  color: var(--color-on-surface-variant);
  font-style: italic;
  margin-bottom: 18px;
}

.amenities-row {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 20px;
}

.amenity-chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 8px;
  background-color: var(--color-surface-container);
  border: 1px solid rgba(194, 200, 194, 0.6);
  border-radius: 4px;
  font-size: 10px;
  color: var(--color-primary);
}

.chip-icon {
  font-size: 12px;
  color: var(--color-secondary);
}

.location-link-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 14px;
  margin-bottom: 4px;
  font-size: 11px;
}

.location-link-label {
  color: var(--color-tertiary, #526056);
  font-weight: 500;
  letter-spacing: 0.05em;
}

.location-dossier-pill {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background-color: var(--color-surface-container, #f3ede1);
  border: 1px solid var(--color-outline-variant, #c2c8c2);
  border-radius: 4px;
  padding: 3px 8px;
  color: var(--color-secondary, #d9531e);
  font-weight: 600;
  text-decoration: none;
  transition: all 0.15s ease;
}

.location-dossier-pill:hover {
  background-color: var(--color-primary, #1b2e24);
  color: #ffffff;
  border-color: var(--color-primary, #1b2e24);
}

.article-divider {
  width: 100%;
  height: 1px;
  background-color: rgba(194, 200, 194, 0.4);
}

/* BODY COPY */
.article-body {
  padding: 0 20px 24px;
}

.body-paragraph {
  font-size: 16px;
  line-height: 1.75;
  color: var(--color-on-surface);
  margin-bottom: 18px;
}

.body-paragraph:first-child::first-letter {
  font-size: 42px;
  line-height: 1;
  float: left;
  margin-right: 8px;
  font-weight: 500;
  color: var(--color-secondary);
}

/* GALLERY */
.article-gallery {
  padding: 0 20px 32px;
}

.gallery-title {
  font-size: 10px;
  letter-spacing: 0.1em;
  color: var(--color-lichen-slate);
  margin-bottom: 12px;
  padding-bottom: 6px;
  border-bottom: 1px solid rgba(194, 200, 194, 0.4);
}

.gallery-grid {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.gallery-item {
  margin: 0;
  border-radius: 4px;
  overflow: hidden;
  border: 1px solid rgba(194, 200, 194, 0.5);
  background-color: var(--color-surface-container-low);
}

.gallery-img {
  width: 100%;
  height: 220px;
  object-fit: cover;
  display: block;
}

.gallery-caption {
  padding: 8px 12px;
  font-size: 10px;
  color: var(--color-lichen-slate);
  background-color: var(--color-surface-container-low);
}

/* FOOTER */
.article-footer {
  padding: 32px 20px;
  border-top: 1px solid rgba(194, 200, 194, 0.4);
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
  font-weight: 600;
  letter-spacing: 0.05em;
  cursor: pointer;
  transition: all 0.15s ease;
}

.footer-back-btn:hover {
  background-color: var(--color-secondary);
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
</style>
