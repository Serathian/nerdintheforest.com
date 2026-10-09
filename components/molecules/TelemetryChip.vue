<script setup lang="ts">
interface Props {
  label: string
  value: string | number
  unit?: string
}

defineProps<Props>()
</script>

<template>
  <div class="telemetry-chip">
    <span class="telemetry-label">{{ label }}</span>
    <span class="telemetry-value">
      {{ value }}<span v-if="unit" class="telemetry-unit">{{ unit }}</span>
    </span>
  </div>
</template>

<style scoped>
.telemetry-chip {
  display: flex;
  flex-direction: column;
  background-color: var(--color-surface-container-high);
  border: 1px solid var(--color-surface-container-highest);
  border-radius: var(--radius-base);
  padding: 6px 10px;
  min-width: 80px;
}

.telemetry-label {
  font-family: var(--font-mono);
  font-size: 9px;
  line-height: 12px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--color-lichen-slate);
}

.telemetry-value {
  font-family: var(--font-mono);
  font-size: 13px;
  font-weight: 500;
  line-height: 18px;
  color: var(--color-pine-primary);
  font-feature-settings: 'tnum' 1;
}

.telemetry-unit {
  font-size: 11px;
  color: var(--color-on-surface-variant);
  margin-left: 2px;
}
</style>
