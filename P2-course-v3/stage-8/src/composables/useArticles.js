import { onMounted, ref } from 'vue'
import { useArticleStore } from '../stores/articles.js'
import { loadArticles } from '../services/articleLoader.js'

export function useArticles() {
  const store = useArticleStore()
  const status = ref(store.ready ? 'success' : 'loading')
  const errorMessage = ref('')

  async function refresh() {
    status.value = 'loading'
    const params = new URLSearchParams(window.location.search)
    if (params.has('fail')) {
      const result = await loadArticles(async () => ({ ok: false, status: 503 }))
      status.value = result.status
      errorMessage.value = result.message
      return
    }
    if (params.has('empty')) {
      status.value = 'empty'
      return
    }
    const result = await loadArticles(fetch, `${import.meta.env.BASE_URL}articles.json`)
    if (result.status === 'success') store.hydrate(result.articles)
    status.value = store.published.length ? 'success' : result.status
    errorMessage.value = result.message
  }

  onMounted(refresh)
  return { store, status, errorMessage, refresh }
}
