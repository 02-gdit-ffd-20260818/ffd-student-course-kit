const defaultArticle = Object.freeze({
  summary: '暂无摘要',
  content: ['正文正在整理。'],
  tags: [],
  author: '匿名作者',
  publishedAt: '',
})

export function normalizeArticle(input) {
  if (!input || typeof input !== 'object') return null
  const id = Number(input.id)
  const title = typeof input.title === 'string' ? input.title.trim() : ''
  const slug = typeof input.slug === 'string' ? input.slug.trim() : ''
  if (!Number.isInteger(id) || id <= 0 || !title || !slug) return null

  const content = Array.isArray(input.content)
    ? input.content.filter((item) => typeof item === 'string' && item.trim()).map((item) => item.trim())
    : []

  return {
    ...defaultArticle,
    ...input,
    id,
    title,
    slug,
    summary: typeof input.summary === 'string' && input.summary.trim()
      ? input.summary.trim()
      : defaultArticle.summary,
    content: content.length ? content : defaultArticle.content,
    tags: Array.isArray(input.tags)
      ? [...new Set(input.tags.filter((tag) => typeof tag === 'string' && tag.trim()).map((tag) => tag.trim()))]
      : [],
  }
}

export function normalizeArticles(input) {
  if (!Array.isArray(input)) return []
  return input.map(normalizeArticle).filter(Boolean)
}

export function findArticleBySlug(articles, slug) {
  return articles.find((article) => article.slug === slug) ?? null
}

export function filterArticlesByTag(articles, tag) {
  if (!tag) return [...articles]
  return articles.filter((article) => article.tags.includes(tag))
}
