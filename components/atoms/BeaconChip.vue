<script setup lang="ts">
interface Props {
  label: string
  active?: boolean
  variant?: 'default' | 'beacon' | 'slate'
  interactive?: boolean
}

withDefaults(defineProps<Props>(), {
  active: false,
  variant: 'default',
  interactive: true
})

const emit = defineEmits<{
  (e: 'click'): void
}>()
</script>

<template>
  <button
    :type="interactive ? 'button' : undefined"
    :class="[
      'beacon-chip',
      `variant-${variant}`,
      { active, interactive }
    ]"
    @click="interactive ? emit('click') : undefined"
  >
    <span v-if="active" class="active-dot" />
    <span class="chip-label">{{ label }}</span>
  </button>
</template>

<style scoped>
.beacon-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: var(--radius-pill);
  font-family: var(--font-mono);
  font-size: 11px;
  line-height: 16px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  background-color: var(--color-surface-container-high);
  border: 1px solid var(--color-surface-container-highest);
  color: var(--color-on-surface-variant);
  transition: all 0.15s ease;
  user-select: none;
}

.beacon-chip.interactive {
  cursor: pointer;
}

.beacon-chip.interactive:hover {
  background-color: var(--color-surface-container-highest);
  color: var(--color-pine-primary);
}

.beacon-chip.active {
  background-color: var(--color-pine-primary);
  border-color: var(--color-pine-primary);
  color: #ffffff;
}

.active-dot {
  width: 6px;
  height: 6px;
  border-radius: var(--radius-pill);
  background-color: var(--color-beacon-secondary);
  display: inline-block;
  flex-shrink: 0;
}

/* Variant Accents */
.variant-beacon {
  border-color: var(--color-beacon-secondary);
  color: var(--color-beacon-secondary);
}

.variant-slate {
  background-color: var(--color-surface-container-low);
  color: var(--color-lichen-slate);
}
</style>
