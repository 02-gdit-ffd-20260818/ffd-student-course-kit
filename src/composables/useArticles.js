import { computed, onMounted } from 'vue'
import { useArticleStore } from '../stores/articles.js'

export function useArticles() {
  const store = useArticleStore()
  const status = computed(() => store.status)
  const errorMessage = computed(() => store.errorMessage)

  async function refresh() {
    const params = new URLSearchParams(window.location.search)
    if (params.has('fail')) {
      store.status = 'error'
      store.errorMessage = 'HTTP 503（课堂模拟）'
      return
    }
    if (params.has('empty')) {
      store.status = 'empty'
      return
    }
    await store.fetchAll()
  }

  onMounted(refresh)
  return { store, status, errorMessage, refresh }
}
