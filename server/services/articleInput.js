import { validateMedia, normalizeMedia } from '../../src/shared/media.js'

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
  const mediaError=validateMedia(input.media);if(mediaError)errors.media=mediaError
  if(!Array.isArray(input.content)&&typeof input.content!=='string')errors.content='正文格式不正确'
  if(typeof input.slug==='string' && input.slug.trim() && !/^[a-z0-9][a-z0-9-]{0,99}$/.test(input.slug.trim()))errors.slug='链接名称仅用英文字母、数字和短横线'
  if(Array.isArray(input.content)&&(!input.content.every(p=>typeof p==='string')||input.content.length>200))errors.content='正文最多200个文字段落'
  if(input.author!==undefined&&typeof input.author!=='string')errors.author='作者应为文字'
  return errors
}

export function toArticleRecord(input, existing = {}, now = new Date()) {
  const title = input.title.trim()
  return {
    ...existing,
    slug: input.slug?.trim() || existing.slug || `article-${Date.now()}`,
    title,
    media: normalizeMedia(input.media),
    summary: input.summary.trim(),
    content: Array.isArray(input.content) ? input.content : String(input.content || '').split(/\n\s*\n/).map(p=>p.trim()).filter(Boolean),
    tags: [...new Set((Array.isArray(input.tags)?input.tags:String(input.tags||'').split(',')).map(tag=>String(tag).trim()).filter(Boolean))],
    status: input.status,
    author: input.author?.trim() || existing.author || '林晓',
    publishedAt: input.publishedAt || existing.publishedAt || now.toISOString().slice(0, 10),
  }
}
