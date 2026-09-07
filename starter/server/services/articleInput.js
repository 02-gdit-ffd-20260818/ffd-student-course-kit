export function validateArticleInput(input) {
  const errors = {}
  if (!input || typeof input !== 'object') return { body: 'JSON object required' }
  const title = typeof input.title === 'string' ? input.title.trim() : ''
  const summary = typeof input.summary === 'string' ? input.summary.trim() : ''
  if (!title) errors.title = 'title required'
  else if (title.length > 60) errors.title = 'title too long'
  if (!summary) errors.summary = 'summary required'
  else if (summary.length > 160) errors.summary = 'summary too long'
  if (!['draft', 'published'].includes(input.status)) errors.status = 'status invalid'
  return errors
}

export function toArticleRecord(input, existing = {}, now = new Date()) {
  const title = input.title.trim()
  return {
    ...existing,
    slug: input.slug?.trim() || existing.slug || title.toLocaleLowerCase('zh-CN').replace(/\s+/g, '-'),
    title,
    summary: input.summary.trim(),
    content: Array.isArray(input.content) ? input.content : [String(input.content || '').trim()].filter(Boolean),
    tags: Array.isArray(input.tags) ? [...new Set(input.tags.map((tag) => String(tag).trim()).filter(Boolean))] : [],
    status: input.status,
    author: input.author?.trim() || existing.author || '林晓',
    publishedAt: input.publishedAt || existing.publishedAt || now.toISOString().slice(0, 10),
  }
}
