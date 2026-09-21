export function createMemoryArticleRepository(seed = []) {
  let articles = structuredClone(seed)
  let nextId = Math.max(0, ...articles.map((item) => item.id)) + 1

  return {
    list() { return structuredClone(articles) },
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
