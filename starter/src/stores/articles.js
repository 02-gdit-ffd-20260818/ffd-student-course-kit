import { defineStore } from 'pinia'
import { loadStoredArticles, persistArticles, removeArticle, saveArticle } from '../services/articleEditorService.js'

export const useArticleStore = defineStore('articles', {
  state: () => ({ items: [], ready: false }),
  getters: {
    published: (state) => state.items.filter((article) => article.status !== 'draft'),
    byId: (state) => (id) => state.items.find((article) => article.id === Number(id)) ?? null,
  },
  actions: {
    hydrate(seed, storage = window.localStorage) {
      if (!this.ready) this.items = loadStoredArticles(storage, seed)
      this.ready = true
    },
    save(input, storage = window.localStorage) {
      const result = saveArticle(this.items, input)
      if (result.ok) {
        this.items = result.items
        persistArticles(storage, this.items)
      }
      return result
    },
    remove(id, storage = window.localStorage) {
      this.items = removeArticle(this.items, id)
      persistArticles(storage, this.items)
    },
  },
})
