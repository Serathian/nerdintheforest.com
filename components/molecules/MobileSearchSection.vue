<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

interface Props {
  searchQuery?: string
  activeFilterCount?: number
}

const props = withDefaults(defineProps<Props>(), {
  searchQuery: '',
  activeFilterCount: 0
})

const emit = defineEmits<{
  (e: 'update:searchQuery', query: string): void
  (e: 'open-filters'): void
}>()

const isSearchOpen = ref(false)
const searchContainerRef = ref<HTMLElement | null>(null)

function toggleSearch() {
  isSearchOpen.value = !isSearchOpen.value
}

function handleSearchInput(e: Event) {
  const target = e.target as HTMLInputElement
  emit('update:searchQuery', target.value)
}

function clearSearch() {
  emit('update:searchQuery', '')
  isSearchOpen.value = false
}

function handleClickOutside(event: Event) {
  if (!isSearchOpen.value) return
  const target = event.target as Node | null
  if (searchContainerRef.value && !searchContainerRef.value.contains(target)) {
    isSearchOpen.value = false
  }
}

function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape' && isSearchOpen.value) {
    isSearchOpen.value = false
  }
}

onMounted(() => {
  if (typeof window !== 'undefined') {
    window.addEventListener('pointerdown', handleClickOutside)
    window.addEventListener('keydown', handleKeydown)
  }
})

onUnmounted(() => {
  if (typeof window !== 'undefined') {
    window.removeEventListener('pointerdown', handleClickOutside)
    window.removeEventListener('keydown', handleKeydown)
  }
})
</script>

<template>
  <div class="search-filter-section">
    <div class="search-filter-row">
      <!-- Search Pill / Inline Field -->
      <div v-if="!isSearchOpen" class="search-pill" @click="toggleSearch">
        <span class="material-symbols-outlined search-icon">search</span>
        <span class="search-label">
          {{ searchQuery ? searchQuery : 'Search locations, areas, coordinates...' }}
        </span>
      </div>

      <div v-else ref="searchContainerRef" class="search-input-active">
        <span class="material-symbols-outlined search-icon">search</span>
        <input
          :value="searchQuery"
          placeholder="Search locations, areas, coordinates..."
          autofocus
          class="search-field"
          @input="handleSearchInput"
        />
        <button class="search-close-btn" type="button" aria-label="Clear search" @click="clearSearch">
          <span class="material-symbols-outlined" style="font-size: 15px;">close</span>
        </button>
      </div>

      <!-- Open Filter Modal Button -->
      <button
        :class="['filter-btn', { compact: isSearchOpen }]"
        type="button"
        :title="isSearchOpen ? 'Filter' : undefined"
        @click="emit('open-filters')"
      >
        <span class="material-symbols-outlined" style="font-size: 15px; color: var(--color-secondary);">tune</span>
        <span v-if="!isSearchOpen" class="filter-btn-text">Filter</span>
        <span v-if="activeFilterCount > 0" class="filter-badge font-mono">
          {{ activeFilterCount }}
        </span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.search-filter-section {
  width: 100%;
  padding: 10px 16px 4px;
  background-color: var(--color-floating-bg);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  box-sizing: border-box;
}

.search-filter-row {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
}

.search-pill {
  flex: 1 1 auto;
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 9999px;
  background-color: var(--color-card-bg);
  border: 1px solid rgba(115, 120, 116, 0.4);
  color: var(--color-on-surface);
  cursor: pointer;
  box-shadow: 0 1px 4px rgba(27, 46, 36, 0.08);
  transition: all 0.2s ease;
}

.search-pill:hover {
  border-color: var(--color-secondary);
}

.search-icon {
  font-size: 16px;
  color: var(--color-secondary);
  flex-shrink: 0;
}

.search-label {
  font-family: var(--font-serif);
  font-size: 12px;
  color: rgba(66, 72, 68, 0.85);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
}

.search-input-active {
  flex: 1 1 auto;
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 5px 10px;
  border-radius: 9999px;
  background-color: var(--color-surface-container-highest);
  border: 1px solid var(--color-secondary);
  transition: all 0.2s ease;
}

.search-field {
  flex: 1;
  min-width: 0;
  background: transparent;
  border: none;
  outline: none;
  font-family: var(--font-mono);
  font-size: 12px;
  color: var(--color-primary);
}

.search-close-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 2px;
  border-radius: 9999px;
  display: flex;
  align-items: center;
  color: var(--color-on-surface-variant);
  flex-shrink: 0;
}

.filter-btn {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  padding: 6px 12px;
  border-radius: 9999px;
  background-color: var(--color-card-bg);
  border: 1px solid rgba(115, 120, 116, 0.4);
  color: var(--color-primary);
  box-shadow: 0 1px 4px rgba(27, 46, 36, 0.08);
  cursor: pointer;
  transition: all 0.2s ease;
}

.filter-btn.compact {
  padding: 6px 10px;
}

.filter-btn:hover {
  border-color: var(--color-secondary);
}

.filter-btn-text {
  font-family: var(--font-mono);
  font-size: 11px;
  text-transform: uppercase;
  font-weight: 600;
  letter-spacing: 0.05em;
  white-space: nowrap;
}

.filter-badge {
  width: 16px;
  height: 16px;
  border-radius: 9999px;
  background-color: var(--color-secondary);
  color: #ffffff;
  font-size: 9px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
</style>
