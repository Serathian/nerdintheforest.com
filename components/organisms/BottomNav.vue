<script setup lang="ts">
import { computed } from 'vue'

const route = useRoute()

const tabs = [
  { id: 'atlas', path: '/', label: 'Atlas', icon: 'explore' },
  { id: 'ledger', path: '/ledger', label: 'Ledger', icon: 'menu_book' },
  { id: 'gear', path: '/gear', label: 'Gear', icon: 'backpack' },
  { id: 'ethos', path: '/ethos', label: 'Ethos', icon: 'forest' }
]

function isTabActive(path: string) {
  if (path === '/') {
    return route.path === '/'
  }
  return route.path.startsWith(path)
}
</script>

<template>
  <nav class="bottom-nav">
    <div class="bottom-nav-container">
      <NuxtLink
        v-for="tab in tabs"
        :key="tab.id"
        :to="tab.path"
        :class="[
          'nav-item',
          isTabActive(tab.path) ? 'active' : ''
        ]"
      >
        <span
          class="material-symbols-outlined nav-icon"
          :style="isTabActive(tab.path) ? 'font-variation-settings: \'FILL\' 1;' : ''"
        >
          {{ tab.icon }}
        </span>
        <span class="nav-label font-mono">
          {{ tab.label }}
        </span>
      </NuxtLink>
    </div>
  </nav>
</template>

<style scoped>
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  width: 100%;
  height: 68px;
  z-index: 50;
  background: transparent;
  pointer-events: none;
  display: flex;
  justify-content: center;
  align-items: flex-end;
  overflow: visible;
}

.bottom-nav-container {
  display: flex;
  justify-content: center;
  align-items: flex-end;
  height: 72px;
  width: 100%;
  max-width: 500px;
  margin: 0 auto;
  padding: 0 10px;
  pointer-events: auto;
  overflow: visible;
}

.nav-item {
  position: relative;
  flex: 1 1 0;
  min-width: 72px;
  max-width: 114px;
  height: 56px;
  margin-left: -8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  text-decoration: none;
  border-top-left-radius: 12px;
  border-top-right-radius: 12px;
  border-bottom-left-radius: 0;
  border-bottom-right-radius: 0;
  border: 1px solid rgba(115, 120, 116, 0.45);
  border-bottom: none;
  background: linear-gradient(180deg, #d8c8a8 0%, #cdbe9e 100%);
  color: #48524a;
  box-shadow: 0 -2px 6px rgba(27, 46, 36, 0.08);
  cursor: pointer;
  user-select: none;
  transition: transform 0.22s cubic-bezier(0.16, 1, 0.3, 1), background 0.2s ease, box-shadow 0.22s ease, color 0.15s ease;
  z-index: 1;
  padding-top: 8px;
  padding-bottom: 12px;
  margin-bottom: -10px;
}

.nav-item:first-child {
  margin-left: 0;
}

.nav-item:hover:not(.active) {
  transform: translateY(-4px);
  background: linear-gradient(180deg, #e0d0b0 0%, #d4c4a4 100%);
  color: var(--color-primary);
  z-index: 3;
}

.nav-item.active {
  transform: translateY(-10px);
  background: linear-gradient(180deg, #faf4e8 0%, #f4ebd8 100%);
  border: 1.5px solid rgba(115, 120, 116, 0.55);
  border-bottom: none;
  color: var(--color-primary);
  box-shadow: 0 -6px 18px rgba(27, 46, 36, 0.18);
  padding-top: 10px;
  padding-bottom: 22px;
  z-index: 10;
}

/* Continuous skirt that completely eliminates any gap beneath the tab */
.nav-item.active::after {
  content: '';
  position: absolute;
  left: -1px;
  right: -1px;
  bottom: -16px;
  height: 20px;
  background: #f4ebd8;
  z-index: 10;
  border-left: 1.5px solid rgba(115, 120, 116, 0.55);
  border-right: 1.5px solid rgba(115, 120, 116, 0.55);
}

/* Color index tab marker at top of active ledger tab */
.nav-item.active::before {
  content: '';
  position: absolute;
  top: 0;
  left: 14px;
  right: 14px;
  height: 3.5px;
  background-color: var(--color-secondary);
  border-radius: 0 0 3px 3px;
}

.nav-item.active .nav-label {
  color: var(--color-primary);
  font-weight: 700;
}

.nav-icon {
  font-size: 20px;
  line-height: 1;
}

.nav-label {
  font-size: 9.5px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  font-weight: 600;
}

/* Floor seal strip to anchor bottom edge */
.bottom-nav::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 8px;
  background-color: #cdbe9e;
  z-index: 0;
  border-top: 1px solid rgba(115, 120, 116, 0.3);
}
</style>
