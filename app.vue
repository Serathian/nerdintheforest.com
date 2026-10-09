<script setup lang="ts">
// Global layout shell hosting persistent Apple notch, routed views, and bottom navigation
</script>

<template>
  <div class="nordic-mobile-viewport">
    <!-- Top Center Brand Notch (Apple-style attached notch) -->
    <div class="brand-notch font-mono">
      <span class="notch-dot" />
      <span class="notch-title">Nerd in the Forest</span>
      <span class="notch-sep">//</span>
      <span class="notch-subtitle">Adventure Atlas</span>
    </div>

    <!-- Routed View -->
    <NuxtPage />

    <!-- Persistent Bottom Tab Navigation (fixed at bottom: 0) -->
    <BottomNav />
  </div>
</template>

<style scoped>
.nordic-mobile-viewport {
  position: relative;
  min-height: 100vh;
  min-height: 100dvh;
  width: 100%;
  background-color: var(--color-surface);
}

/* TOP CENTER BRAND NOTCH (Apple-style attached notch) */
.brand-notch {
  position: fixed;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  z-index: 30;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 6px 20px 8px;
  border-top-left-radius: 0;
  border-top-right-radius: 0;
  border-bottom-left-radius: 16px;
  border-bottom-right-radius: 16px;
  background-color: rgba(250, 244, 232, 0.98);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  border-top: none;
  border-left: 1px solid rgba(115, 120, 116, 0.4);
  border-right: 1px solid rgba(115, 120, 116, 0.4);
  border-bottom: 1.5px solid rgba(115, 120, 116, 0.4);
  box-shadow: 0 4px 16px rgba(27, 46, 36, 0.16);
  white-space: nowrap;
  pointer-events: auto;
}

.notch-dot {
  width: 6px;
  height: 6px;
  border-radius: 9999px;
  background-color: var(--color-secondary);
  flex-shrink: 0;
}

.notch-title {
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--color-primary);
  line-height: 1;
}

.notch-sep {
  font-family: var(--font-mono);
  font-size: 10px;
  color: rgba(115, 120, 116, 0.5);
  font-weight: 400;
  line-height: 1;
}

.notch-subtitle {
  font-family: var(--font-mono);
  font-size: 10px;
  font-weight: 500;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: var(--color-on-surface-variant);
  line-height: 1;
}
</style>
