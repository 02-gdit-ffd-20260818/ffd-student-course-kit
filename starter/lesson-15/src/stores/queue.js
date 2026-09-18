import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { addUnique, moveItem, nextIndex, removeAt } from './queueCore.js'

export const useQueueStore = defineStore('queue', () => {
  const items = ref([])
  const currentIndex = ref(-1)
  const playerState = ref('idle')
  const locked = ref(false)
  const activityLog = ref([])
  const current = computed(() => items.value[currentIndex.value] ?? null)
  function log(action, detail) { activityLog.value.unshift({ id: `${Date.now()}-${activityLog.value.length}`, at: new Date().toLocaleTimeString('zh-CN', { hour12: false }), action, detail }); activityLog.value = activityLog.value.slice(0, 12) }
  function add(item) { if (locked.value) return false; const result = addUnique(items.value, item); items.value = result.queue; if (result.added && currentIndex.value === -1) currentIndex.value = 0; if (result.added) log('点歌', `${item.requester} · ${item.title}`); return result.added }
  function remove(index) { const title = items.value[index]?.title; const result = removeAt(items.value, index, currentIndex.value); items.value = result.queue; currentIndex.value = result.currentIndex; playerState.value = current.value ? 'paused' : 'idle'; if (title) log('移除', title) }
  function next() { const previous = current.value?.title; currentIndex.value = nextIndex(items.value.length, currentIndex.value); playerState.value = current.value ? 'loading' : 'idle'; if (previous) log('切歌', `${previous} → ${current.value?.title || '空队列'}`) }
  function move(from, to) { const activeId = current.value?.id; items.value = moveItem(items.value, from, to); currentIndex.value = activeId ? items.value.findIndex((item) => item.id === activeId) : -1; log('排序', `${from + 1} → ${to + 1}`) }
  function toggleLock() { locked.value = !locked.value; log(locked.value ? '锁定' : '开放', '点歌队列') }
  function clear() { items.value = []; currentIndex.value = -1; playerState.value = 'idle'; log('清空', '播放队列') }
  function restore(snapshot) { if (!Array.isArray(snapshot?.items)) return; items.value = snapshot.items.slice(0, 30); currentIndex.value = Math.min(Math.max(Number(snapshot.currentIndex) || 0, 0), Math.max(items.value.length - 1, 0)); if (!items.value.length) currentIndex.value = -1; playerState.value = current.value ? 'paused' : 'idle' }
  return { items, currentIndex, current, playerState, locked, activityLog, add, remove, next, move, toggleLock, clear, restore }
})
