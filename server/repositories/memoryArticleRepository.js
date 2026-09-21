export function createMemoryArticleRepository(seed = []) {
  let articles = structuredClone(seed)
  let nextId = Math.max(0, ...articles.map((item) => item.id)) + 1

  return {
    list({ status, query = '', page = 1, pageSize = 20 } = {}) {
      const normalizedQuery = query.toLocaleLowerCase('zh-CN')
      const filtered = articles.filter((item) => {
        if (status && item.status !== status) return false
        return !normalizedQuery || `${item.title} ${item.summary} ${item.tags.join(' ')}`.toLocaleLowerCase('zh-CN').includes(normalizedQuery)
      })
      const offset = (page - 1) * pageSize
      return { items: structuredClone(filtered.slice(offset, offset + pageSize)), total: filtered.length }
    },
    find(id) { return structuredClone(articles.find((item) => item.id === Number(id)) ?? null) },
    create(input) {
      const article = { ...structuredClone(input), id: nextId++ }
      articles.push(article)
      return structuredClone(article)
    },
    update(id, input) {
      const index = articles.findIndex((item) => item.id === Number(id))
      if (index < 0) return null
      articles[index] = { ...structuredClone(input), id: Number(id) }
      return structuredClone(articles[index])
    },
    remove(id) {
      const index = articles.findIndex((item) => item.id === Number(id))
      if (index < 0) return false
      articles.splice(index, 1)
      return true
    },
  }
}
