<script setup lang="ts">
import { ref, computed } from 'vue'

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

const { fieldNotes } = useNitfCms()
const searchQuery = ref('')
const selectedCategory = ref('ALL')
const selectedNote = ref<any>(null)
const isReaderOpen = ref(false)

const categories = [
  { id: 'ALL', label: 'All Entries' },
  { id: 'SHELTER', label: 'Shelters' },
  { id: 'HEARTH', label: 'Hearths' },
  { id: 'SPRINGHEAD', label: 'Springs' },
  { id: 'VIEWPOINT', label: 'Viewpoints' }
]

const filteredNotes = computed(() => {
  return fieldNotes.value.filter(note => {
    if (selectedCategory.value !== 'ALL') {
      const matchCat = note.category?.toUpperCase() === selectedCategory.value
      const matchTag = note.numberTag?.toUpperCase().includes(selectedCategory.value)
      if (!matchCat && !matchTag) return false
    }
    if (searchQuery.value.trim()) {
      const q = searchQuery.value.toLowerCase().trim()
      const matchTitle = note.title.toLowerCase().includes(q)
      const matchDesc = note.description.toLowerCase().includes(q)
      const matchContent = note.content?.some(c => c.toLowerCase().includes(q))
      if (!matchTitle && !matchDesc && !matchContent) return false
    }
    return true
  })
})

function openDispatch(note: any) {
  selectedNote.value = note
  isReaderOpen.value = true
}

function closeDispatch() {
  isReaderOpen.value = false
  selectedNote.value = null
}
</script>

<template>
  <div class="ledger-page">
    <div class="ledger-container">
      <!-- Section Header -->
      <header class="ledger-header">
        <div class="header-pre font-mono">
          <span class="header-beacon" />
          <span>EXPEDITION ARCHIVE // NORDMARKA</span>
        </div>
        <h1 class="ledger-title font-serif">Field Ledger</h1>
        <p class="ledger-intro font-serif">
          Chronological field notes, cabin observations, and Nordic route surveys written in the backcountry.
        </p>

        <!-- Search Bar -->
        <div class="ledger-search-bar">
          <span class="material-symbols-outlined search-icon">search</span>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search entries, keywords, weather..."
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
        <div class="filter-chips-row">
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
        <div v-if="filteredNotes.length === 0" class="empty-state font-mono">
          <span class="material-symbols-outlined" style="font-size: 28px; color: var(--color-outline);">travel_explore</span>
          <p>No field dispatches match current query.</p>
        </div>

        <article
          v-for="note in filteredNotes"
          :key="note.id"
          class="ledger-card"
          @click="openDispatch(note)"
        >
          <!-- Card Thumbnail Hero -->
          <div v-if="note.heroImage" class="card-hero-wrap">
            <img :src="note.heroImage" :alt="note.title" class="card-hero-img" loading="lazy" />
            <div v-if="note.area" class="hero-overlay-tag font-mono">
              {{ note.area }}
            </div>
          </div>

          <!-- Card Body -->
          <div class="card-content">
            <div class="meta-row font-mono">
              <span class="meta-date">{{ note.date || note.timeAgo }}</span>
              <span class="meta-sep">•</span>
              <span class="meta-read">{{ note.readTime || '3 MIN READ' }}</span>
              <span class="meta-sep">•</span>
              <span class="meta-weather">{{ note.weather }}</span>
            </div>

            <h2 class="card-headline font-serif">{{ note.title }}</h2>

            <p class="card-excerpt font-serif">
              {{ note.description }}
            </p>

            <!-- Amenities / Surveyor Tags -->
            <div class="card-tags-row">
              <span
                v-for="amenity in note.amenities?.slice(0, 3)"
                :key="amenity.label"
                class="tag-pill font-mono"
              >
                <span class="material-symbols-outlined tag-icon">{{ amenity.icon }}</span>
                {{ amenity.label }}
              </span>
            </div>

            <!-- Footer Action -->
            <div class="card-footer">
              <span v-if="note.elevation" class="coord-tag font-mono">
                {{ note.elevation }}m ELEV
              </span>
              <span v-else-if="note.area" class="coord-tag font-mono">
                {{ note.area.toUpperCase() }}
              </span>
              <span class="read-action font-mono">
                READ DISPATCH <span class="material-symbols-outlined" style="font-size: 14px;">arrow_forward</span>
              </span>
            </div>
          </div>
        </article>
      </main>
    </div>

    <!-- Reader View -->
    <DispatchReader
      :note="selectedNote"
      :is-open="isReaderOpen"
      @close="closeDispatch"
      @back-to-map="closeDispatch"
    />
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
  scrollbar-width: none;
  padding: 2px 0;
}

.filter-chips-row::-webkit-scrollbar {
  display: none;
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
