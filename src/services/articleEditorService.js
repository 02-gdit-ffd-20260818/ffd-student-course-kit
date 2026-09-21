import { normalizeArticles } from './articleService.js'

export function validateArticle(input) {
  const errors = {}
  const title = typeof input.title === 'string' ? input.title.trim() : ''
  const summary = typeof input.summary === 'string' ? input.summary.trim() : ''
  if (!title) errors.title = '标题不能为空'
  else if (title.length > 60) errors.title = '标题不能超过 60 个字符'
  if (!summary) errors.summary = '摘要不能为空'
  else if (summary.length > 160) errors.summary = '摘要不能超过 160 个字符'
  if (!['draft', 'published'].includes(input.status)) errors.status = '文章状态无效'
  return errors
}

export function saveArticle(items, input, now = Date.now()) {
  const errors = validateArticle(input)
  if (Object.keys(errors).length) return { ok: false, errors, items }
  const id = Number(input.id) || now
  const article = {
    id,
    slug: input.slug?.trim() || `article-${id}`,
    title: input.title.trim(),
    summary: input.summary.trim(),
    content: Array.isArray(input.content)
      ? input.content
      : String(input.content || '').split(/\n\s*\n/).map((paragraph) => paragraph.trim()).filter(Boolean),
    tags: Array.isArray(input.tags) ? input.tags : String(input.tags || '').split(',').map((tag) => tag.trim()).filter(Boolean),
    status: input.status,
    author: input.author?.trim() || '林晓',
    publishedAt: input.publishedAt || new Date(now).toISOString().slice(0, 10),
  }
  const index = items.findIndex((item) => item.id === id)
  const next = [...items]
  if (index >= 0) next.splice(index, 1, article)
  else next.push(article)
  return { ok: true, errors: {}, article, items: next }
}

export function removeArticle(items, id) {
  return items.filter((article) => article.id !== Number(id))
}

export function searchArticles(items, query) {
  const keyword = query.trim().toLocaleLowerCase('zh-CN')
  if (!keyword) return [...items]
  return items.filter((article) => `${article.title} ${article.summary} ${article.tags.join(' ')}`.toLocaleLowerCase('zh-CN').includes(keyword))
}

export function loadStoredArticles(storage, fallback = []) {
  try {
    const value = storage.getItem('p2-articles')
    if (!value) return normalizeArticles(fallback)
    return normalizeArticles(JSON.parse(value))
  } catch {
    return normalizeArticles(fallback)
  }
}

export function persistArticles(storage, articles) {
  try {
    storage.setItem('p2-articles', JSON.stringify(articles))
    return true
  } catch {
    return false
  }
}
