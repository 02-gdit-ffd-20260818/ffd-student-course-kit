import { defineStore } from 'pinia'
import { articleApi } from '../services/articleApi.js'
import { validateArticle } from '../services/articleEditorService.js'

export const useArticleStore = defineStore('articles', {
  state: () => ({ items: [], ready: false, status: 'idle', errorMessage: '' }),
  getters: {
    published: (state) => state.items.filter((article) => article.status === 'published'),
    byId: (state) => (id) => state.items.find((article) => article.id === Number(id)) ?? null,
  },
  actions: {
    async fetchAll(api = articleApi) {
      this.status = 'loading'
      this.errorMessage = ''
      try {
        this.items = await api.list()
        this.ready = true
        this.status = this.items.length ? 'success' : 'empty'
      } catch (error) {
        this.status = 'error'
        this.errorMessage = error.message
      }
    },
    async save(input, api = articleApi) {
      const errors = validateArticle(input)
      if (Object.keys(errors).length) return { ok: false, errors }
      try {
        const article = input.id ? await api.update(input.id, input) : await api.create(input)
        const index = this.items.findIndex((item) => item.id === article.id)
        if (index >= 0) this.items.splice(index, 1, article)
        else this.items.push(article)
        return { ok: true, errors: {}, article }
      } catch (error) {
        return { ok: false, errors: error.fields || {}, formError: error.message }
      }
    },
    async remove(id, api = articleApi) {
      try {
        await api.remove(id)
        this.items = this.items.filter((article) => article.id !== Number(id))
        return true
      } catch (error) {
        this.errorMessage = error.message
        return false
      }
    },
  },
})
