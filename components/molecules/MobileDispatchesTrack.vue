<script setup lang="ts">
import type { LinkedDispatch } from '../../types/fieldNotes'

interface Props {
  dispatches: LinkedDispatch[]
}

defineProps<Props>()

const emit = defineEmits<{
  (e: 'read-dispatch', dispatch: LinkedDispatch): void
}>()
</script>

<template>
  <div class="dispatches-track-container">
    <div v-if="dispatches.length > 0" class="dispatches-scroll-track scroll-hint-x">
      <article v-for="disp in dispatches" :key="disp.id" class="dispatch-card">
        <div class="dispatch-card-top">
          <div class="dispatch-card-title-row">
            <h4 class="dispatch-card-title font-serif">
              {{ disp.title }}
            </h4>
            <span class="dispatch-time-meta font-mono">
              {{ disp.readTime }}
            </span>
          </div>

          <p v-if="disp.excerpt" class="dispatch-card-excerpt">
            {{ disp.excerpt }}
          </p>

          <div class="dispatch-card-meta font-mono">
            <span class="meta-date">{{ disp.date }}</span>
          </div>
        </div>

        <div class="dispatch-card-footer">
          <button class="dispatch-read-btn font-mono" type="button" @click.stop="emit('read-dispatch', disp)">
            <span class="material-symbols-outlined text-[13px]">menu_book</span>
            <span>READ DISPATCH</span>
          </button>
        </div>
      </article>
    </div>

    <!-- Empty state when no dispatches exist (unvisited) -->
    <div v-else class="dispatches-empty-container font-mono">
      <span class="material-symbols-outlined text-[18px] text-on-surface-variant/50">draw_abstract</span>
      <div class="empty-msg-col">
        <span class="empty-msg-headline">NO DISPATCHES FILED YET</span>
        <span class="empty-msg-sub">Editorial dispatches require on-site field observation</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.dispatches-track-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 10px 10px;
  box-sizing: border-box;
  overflow: hidden;
  background-color: var(--color-surface-container-high, #e5d6b8);
}

.dispatches-scroll-track {
  display: flex;
  gap: 10px;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  scroll-snap-type: x mandatory;
  padding: 2px 2px 4px;
  height: 100%;
  align-items: stretch;
}

.dispatch-card {
  flex: 0 0 215px;
  width: 215px;
  min-width: 215px;
  scroll-snap-align: start;
  background-color: var(--color-card-bg);
  border: 1px solid rgba(115, 120, 116, 0.28);
  border-radius: 6px;
  padding: 7px 10px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  box-shadow: 0 1px 3px rgba(27, 46, 36, 0.06);
  box-sizing: border-box;
}

.dispatches-scroll-track:has(> .dispatch-card:only-child) .dispatch-card {
  flex: 1 1 auto;
  width: 100%;
  min-width: 0;
}

.dispatch-card-top {
  display: flex;
  flex-direction: column;
  gap: 2px;
  margin-bottom: 4px;
}

.dispatch-card-title-row {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 6px;
}

.dispatch-time-meta {
  font-size: 8px;
  color: var(--color-lichen-slate);
  font-weight: 600;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  white-space: nowrap;
  flex-shrink: 0;
  opacity: 0.85;
}

.dispatch-card-title {
  font-size: 12px;
  line-height: 1.25;
  color: var(--color-primary);
  font-weight: 600;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.dispatch-card-excerpt {
  font-family: var(--font-serif);
  font-size: 9.5px;
  line-height: 1.35;
  color: var(--color-on-surface-variant);
  margin: 2px 0 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  opacity: 0.85;
}

.dispatch-card-meta {
  font-size: 8px;
  color: var(--color-lichen-slate);
  text-transform: uppercase;
  letter-spacing: 0.04em;
  margin-top: 3px;
}

.dispatch-card-footer {
  margin-top: auto;
}

.dispatch-read-btn {
  width: 100%;
  height: 24px;
  border-radius: 4px;
  background-color: var(--color-primary);
  color: #faf4e8;
  border: 1px solid rgba(27, 46, 36, 0.8);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  box-shadow: 0 1px 2px rgba(27, 46, 36, 0.1);
  cursor: pointer;
  transition: all 0.15s ease;
}

.dispatch-read-btn:hover {
  background-color: #264032;
  box-shadow: 0 2px 6px rgba(27, 46, 36, 0.2);
}

.dispatch-read-btn:active {
  transform: scale(0.98);
}

.dispatches-empty-container {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 16px;
  color: var(--color-on-surface-variant);
  font-size: 10px;
}

.empty-msg-col {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.empty-msg-headline {
  font-weight: 700;
  letter-spacing: 0.06em;
  color: var(--color-primary);
}

.empty-msg-sub {
  font-size: 8.5px;
  opacity: 0.75;
}
</style>
