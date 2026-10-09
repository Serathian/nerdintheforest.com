<script setup lang="ts">
interface Props {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  type?: 'button' | 'submit' | 'reset'
}

withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'md',
  disabled: false,
  type: 'button'
})

const emit = defineEmits<{
  (e: 'click', event: MouseEvent): void
}>()
</script>

<template>
  <button
    :type="type"
    :disabled="disabled"
    :class="['base-button', `btn-${variant}`, `btn-${size}`]"
    @click="(e) => emit('click', e)"
  >
    <span class="btn-content">
      <slot />
    </span>
  </button>
</template>

<style scoped>
.base-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-mono);
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-radius: var(--radius-base);
  border: 1px solid transparent;
  cursor: pointer;
  transition: background-color 0.15s ease, border-color 0.15s ease, color 0.15s ease, transform 0.05s ease;
  user-select: none;
  white-space: nowrap;
}

.base-button:active:not(:disabled) {
  transform: translateY(1px);
}

.base-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Sizes (Mobile First) */
.btn-sm {
  padding: 6px 12px;
  font-size: 11px;
  line-height: 14px;
}

.btn-md {
  padding: 10px 16px;
  font-size: 13px;
  line-height: 18px;
}

.btn-lg {
  padding: 14px 22px;
  font-size: 14px;
  line-height: 20px;
}

/* Variants */
.btn-primary {
  background-color: var(--color-pine-primary);
  color: #ffffff;
  border-color: var(--color-pine-primary);
}

.btn-primary:hover:not(:disabled) {
  background-color: var(--color-pine-hover);
  border-color: var(--color-pine-hover);
}

.btn-secondary {
  background-color: var(--color-beacon-secondary);
  color: #ffffff;
  border-color: var(--color-beacon-secondary);
}

.btn-secondary:hover:not(:disabled) {
  background-color: var(--color-beacon-hover);
  border-color: var(--color-beacon-hover);
}

.btn-outline {
  background-color: transparent;
  color: var(--color-pine-primary);
  border-color: var(--color-pine-primary);
}

.btn-outline:hover:not(:disabled) {
  background-color: var(--color-surface-container-high);
}

.btn-ghost {
  background-color: transparent;
  color: var(--color-lichen-slate);
  border-color: transparent;
}

.btn-ghost:hover:not(:disabled) {
  background-color: var(--color-surface-container);
  color: var(--color-pine-primary);
}

.btn-content {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}
</style>
