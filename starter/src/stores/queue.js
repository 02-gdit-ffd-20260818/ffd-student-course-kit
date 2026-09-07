import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { addUnique, nextIndex, removeAt } from './queueCore.js'

export const useQueueStore = defineStore('queue', () => {
  const items = ref([])
  const currentIndex = ref(-1)
  const playerState = ref('idle')
  const current = computed(() => items.value[currentIndex.value] ?? null)
  function add(item) { const result = addUnique(items.value, item); items.value = result.queue; if (result.added && currentIndex.value === -1) currentIndex.value = 0; return result.added }
  function remove(index) { const result = removeAt(items.value, index, currentIndex.value); items.value = result.queue; currentIndex.value = result.currentIndex; playerState.value = current.value ? 'paused' : 'idle' }
  function next() { currentIndex.value = nextIndex(items.value.length, currentIndex.value); playerState.value = current.value ? 'loading' : 'idle' }
  function clear() { items.value = []; currentIndex.value = -1; playerState.value = 'idle' }
  return { items, currentIndex, current, playerState, add, remove, next, clear }
})
