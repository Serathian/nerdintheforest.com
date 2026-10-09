<script setup lang="ts">
interface Props {
  modelValue?: string
  placeholder?: string
}

withDefaults(defineProps<Props>(), {
  modelValue: '',
  placeholder: 'Search trails, coordinates or waypoints...'
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
  (e: 'search', value: string): void
}>()

function onInput(e: Event) {
  const target = e.target as HTMLInputElement
  emit('update:modelValue', target.value)
}

function onKeyDown(e: KeyboardEvent) {
  if (e.key === 'Enter') {
    const target = e.target as HTMLInputElement
    emit('search', target.value)
  }
}
</script>

<template>
  <div class="search-input-wrap">
    <span class="search-icon">🔍</span>
    <input
      type="text"
      :value="modelValue"
      :placeholder="placeholder"
      class="search-input font-mono"
      @input="onInput"
      @keydown="onKeyDown"
    />
  </div>
</template>

<style scoped>
.search-input-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
  background-color: var(--color-surface-bg);
  border: 1px solid var(--color-outline-variant);
  border-radius: var(--radius-base);
  padding: 8px 12px;
  width: 100%;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}

.search-input-wrap:focus-within {
  border-color: var(--color-pine-primary);
  box-shadow: 0 0 0 2px rgba(27, 46, 36, 0.1);
}

.search-icon {
  font-size: 13px;
  opacity: 0.6;
}

.search-input {
  border: none;
  background: transparent;
  outline: none;
  width: 100%;
  font-size: 12px;
  line-height: 16px;
  color: var(--color-pine-primary);
}

.search-input::placeholder {
  color: var(--color-lichen-slate);
  opacity: 0.8;
}
</style>
