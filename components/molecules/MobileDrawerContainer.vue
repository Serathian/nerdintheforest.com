<script setup lang="ts">
interface Props {
  isOpen: boolean
  tabTitle: string
  tabIcon: string
  tabCount?: number
  drawerHeight?: string
  backdrop?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  tabCount: undefined,
  drawerHeight: '388px',
  backdrop: true
})

const emit = defineEmits<{
  (e: 'update:isOpen', value: boolean): void
  (e: 'toggle'): void
}>()

function toggle() {
  const next = !props.isOpen
  emit('update:isOpen', next)
  emit('toggle')
}

function close() {
  if (props.isOpen) {
    emit('update:isOpen', false)
  }
}
</script>

<template>
  <div class="mobile-drawer-shell">
    <!-- Viewport Backdrop: Smooth fade dismiss catcher on map click -->
    <Transition name="fade-backdrop">
      <div v-if="backdrop && isOpen" class="drawer-backdrop" aria-label="Collapse drawer" @click="close" />
    </Transition>

    <div class="drawer-dock-container">
      <!-- ===================================================================== -->
      <!-- SECTION 1: MAIN SECTION (Always visible at rest, sitting above tab)   -->
      <!-- ===================================================================== -->
      <div class="main-section-card">
        <slot name="main" />
      </div>

      <!-- ===================================================================== -->
      <!-- SECTION 2: COLLAPSIBLE DRAWER SHEET (Tab at bottom; rises over main)  -->
      <!-- ===================================================================== -->
      <div :class="['collapsible-drawer-sheet', { 'is-open': isOpen }]" :style="{ '--drawer-height': drawerHeight }">
        <!-- Asymmetric 2/3 Ledger Tab Row -->
        <div class="tab-shelf-row">
          <button class="ledger-tab-btn font-mono" type="button" :aria-expanded="isOpen"
            :aria-label="isOpen ? `Collapse ${tabTitle}` : `Open ${tabTitle}`" @click.stop="toggle">
            <div class="tab-main-info">
              <span class="material-symbols-outlined tab-icon">{{ tabIcon }}</span>
              <span class="tab-text">{{ tabTitle }}</span>
              <span v-if="tabCount != null && tabCount > 0" class="tab-badge">
                {{ tabCount }}
              </span>
            </div>
            <div class="tab-arrow-wrap">
              <span class="material-symbols-outlined tab-chevron">
                {{ isOpen ? 'keyboard_arrow_down' : 'keyboard_arrow_up' }}
              </span>
            </div>
          </button>

          <!-- Right 1/3 shoulder: Completely empty transparent space when collapsed -->
          <div class="tab-right-shoulder" @click.stop="toggle" />
        </div>

        <!-- Drawer Content Body (Revealed as sheet rises up from below) -->
        <div class="drawer-content-body">
          <slot name="drawer" />
        </div>
      </div>

      <!-- Spacer for 68px BottomNav -->
      <div class="bottom-nav-dock-spacer" />
    </div>
  </div>
</template>

<style scoped>
.mobile-drawer-shell {
  position: static;
}

/* Translucent backdrop behind drawer for outside dismiss */
.drawer-backdrop {
  position: fixed;
  inset: 0;
  z-index: 25;
  background: transparent;
  pointer-events: auto;
}

.fade-backdrop-enter-active,
.fade-backdrop-leave-active {
  transition: opacity 0.25s ease;
}

.fade-backdrop-enter-from,
.fade-backdrop-leave-to {
  opacity: 0;
}

/* Fixed Dock Container at bottom of viewport */
.drawer-dock-container {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  margin: 0 auto;
  max-width: 600px;
  z-index: 40;
  pointer-events: none;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
}

/* Spacer ensuring the main section and tab clear the 68px bottom nav */
.bottom-nav-dock-spacer {
  height: 68px;
  width: 100%;
  pointer-events: none;
  flex-shrink: 0;
}

/* ========================================================================= */
/* SECTION 1: MAIN SECTION                                                   */
/* Clear contrast tone: Light Floating Parchment (#faf4e8)                   */
/* Sits directly above the 38px tab shelf at rest                             */
/* ========================================================================= */
.main-section-card {
  width: 100%;
  border-top-left-radius: 16px;
  border-top-right-radius: 16px;
  background-color: var(--color-floating-bg, #faf4e8);
  border-top: 1.5px solid rgba(115, 120, 116, 0.4);
  box-shadow: 0 -8px 24px rgba(27, 46, 36, 0.16);
  pointer-events: auto;
  position: relative;
  z-index: 10;
  /* Leaves room for the 38px tab shelf below it */
  box-sizing: border-box;
  overflow: hidden;
  transition: opacity 0.25s ease, box-shadow 0.3s ease;
}

.main-section-card::after {
  content: '';
  display: block;
  left: 0;
  bottom: 0;
  height: 38px;
  width: 100%;
  background-color: var(--color-floating-bg, #faf4e8);
}

/* ========================================================================= */
/* SECTION 2: COLLAPSIBLE DRAWER SHEET                                       */
/* Clear contrast tone: Deeper Warm Tactile Kraft (#e5d6b8)                  */
/* Anchored at bottom: 0; rises up over main section on expand               */
/* ========================================================================= */
.collapsible-drawer-sheet {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 106px;
  /* 38px tab + 68px BottomNav clearance when collapsed */
  z-index: 30;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  pointer-events: none;
  background: transparent;
  overflow: hidden;
  transition: height 0.36s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.36s ease;
  will-change: height;
}

/* When expanded, the drawer rises up from below over the main section */
.collapsible-drawer-sheet.is-open {
  height: var(--drawer-height, 388px);
  pointer-events: auto;
}

/* ========================================================================= */
/* ASYMMETRIC 2/3 LEDGER TAB ROW                                             */
/* ========================================================================= */
.tab-shelf-row {
  width: 100%;
  height: 38px;
  display: flex;
  align-items: flex-end;
  position: relative;
  box-sizing: border-box;
  flex-shrink: 0;
  pointer-events: auto;
}

.ledger-tab-btn {
  position: relative;
  width: 66.7%;
  height: 100%;
  padding: 0 14px 0 16px;
  background-color: var(--color-surface-container-high, #e5d6b8);
  border: none;
  border-top: 1.5px solid rgba(115, 120, 116, 0.45);
  border-right: 1.5px solid rgba(115, 120, 116, 0.45);
  border-top-left-radius: 0;
  border-bottom-left-radius: 0;
  border-top-right-radius: 14px;
  border-bottom-right-radius: 0;
  border-bottom: none;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  user-select: none;
  box-shadow: 2px -2px 6px rgba(27, 46, 36, 0.08);
  transition: filter 0.15s ease, background-color 0.2s ease;
  z-index: 2;
  margin-bottom: -1px;
}

.ledger-tab-btn:hover {
  filter: brightness(0.97);
}

.tab-main-info {
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
}

.tab-icon {
  font-size: 16px;
  color: var(--color-secondary);
  flex-shrink: 0;
}

.tab-text {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.07em;
  color: var(--color-primary);
  text-transform: uppercase;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.tab-badge {
  font-size: 9px;
  padding: 1px 5px;
  border-radius: 9999px;
  background-color: rgba(27, 46, 36, 0.1);
  border: 1px solid rgba(115, 120, 116, 0.35);
  color: var(--color-primary);
  font-weight: 700;
  flex-shrink: 0;
}

.tab-arrow-wrap {
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

.tab-chevron {
  font-size: 18px;
  color: var(--color-secondary);
  transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

/* RIGHT 1/3 SHOULDER: Empty transparent space when collapsed */
.tab-right-shoulder {
  flex: 1;
  height: 100%;
  background: transparent;
  border: none;
  cursor: pointer;
  position: relative;
  z-index: 1;
  pointer-events: none;
  transition: background-color 0.3s ease, border-color 0.3s ease;
}

/* When expanded, the shoulder fills in to form a seamless drawer top */
.collapsible-drawer-sheet.is-open .tab-right-shoulder {
  border-bottom: 1.5px solid rgba(115, 120, 116, 0.45);
  pointer-events: auto;
}

/* ========================================================================= */
/* DRAWER CONTENT BODY                                                       */
/* ========================================================================= */
.drawer-content-body {
  width: 100%;
  flex: 1;
  background-color: var(--color-surface-container-high, #e5d6b8);
  box-shadow: 0 -4px 16px rgba(27, 46, 36, 0.12);
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  overflow: hidden;
  min-height: 0;
  opacity: 0;
  visibility: hidden;
  pointer-events: none;
  transition: opacity 0.28s ease, visibility 0.28s;
}

.collapsible-drawer-sheet.is-open .drawer-content-body {
  opacity: 1;
  visibility: visible;
  pointer-events: auto;
}
</style>
