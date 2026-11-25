<script setup lang="ts">
import { watch } from 'vue'

export interface ActiveInspection {
  dispatchId: string
  slug: string
  title: string
  locationsCount?: number
}

const route = useRoute()
const config = useRuntimeConfig()
const siteUrl = ((config.public?.siteUrl as string) || 'https://nerdintheforest.com').replace(/\/$/, '')

useHead(() => {
  const canonical = `${siteUrl}${route.path}`
  return {
    link: [{ rel: 'canonical', href: canonical }],
    meta: [
      { property: 'og:site_name', content: 'Nerd in the Forest' },
      { property: 'og:url', content: canonical },
    ],
  }
})

const activeInspection = useState<ActiveInspection | null>('activeDispatchInspection', () => null)

watch(
  () => route.fullPath,
  () => {
    if (route.path !== '/' || (!route.query.dispatch && !route.query.story)) {
      activeInspection.value = null
    }
  }
)
</script>

<template>
  <div class="nordic-mobile-viewport">
    <!-- Top Center Brand Notch (Apple-style attached notch) -->
    <ClientOnly>
      <div v-if="activeInspection && route.path === '/'" class="brand-notch inspection font-mono">
        <span class="notch-title inspection-label">DISPATCH INSPECTION</span>
      </div>
      <div v-else class="brand-notch font-mono">
        <span class="notch-title">Nerd in the Forest</span>
        <span class="notch-sep">//</span>
        <span class="notch-subtitle">Adventure Atlas</span>
      </div>
      <template #fallback>
        <div class="brand-notch font-mono">
          <span class="notch-title">Nerd in the Forest</span>
          <span class="notch-sep">//</span>
          <span class="notch-subtitle">Adventure Atlas</span>
        </div>
      </template>
    </ClientOnly>

    <!-- Routed View -->
    <NuxtPage />

    <!-- Global Trailhead Navigation Modal -->
    <NavigateModal />

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

.brand-notch.inspection {
  background-color: rgba(254, 249, 237, 0.98);
}

.inspection-label {
  color: var(--color-secondary) !important;
}
</style>
