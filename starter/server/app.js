import crypto from 'node:crypto'
import express from 'express'
import { seedArticles } from './data/seedArticles.js'
import { createMemoryArticleRepository } from './repositories/memoryArticleRepository.js'
import { toArticleRecord, validateArticleInput } from './services/articleInput.js'

export function createApp({ repository = createMemoryArticleRepository(seedArticles), allowedOrigin = process.env.ALLOWED_ORIGIN || 'http://127.0.0.1:5173', logger = console } = {}) {
  const app = express()
  app.disable('x-powered-by')
  app.use(express.json({ limit: '100kb' }))
  app.use((req, res, next) => {
    const requestId = req.get('x-request-id') || crypto.randomUUID()
    res.set('x-request-id', requestId)
    res.set('access-control-allow-origin', allowedOrigin)
    res.set('access-control-allow-headers', 'content-type,x-request-id')
    res.set('access-control-allow-methods', 'GET,POST,PUT,DELETE,OPTIONS')
    if (req.method === 'OPTIONS') return res.sendStatus(204)
    const startedAt = Date.now()
    res.on('finish', () => logger.info?.(JSON.stringify({ requestId, method: req.method, path: req.path, status: res.statusCode, durationMs: Date.now() - startedAt })))
    next()
  })

  app.get('/health', (req, res) => res.json({ ok: true, service: 'p2-blog-api' }))

  app.get('/api/articles', (req, res) => {
    const status = req.query.status
    const query = String(req.query.q || '').trim().toLocaleLowerCase('zh-CN')
    const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1)
    const pageSize = Math.min(50, Math.max(1, Number.parseInt(req.query.pageSize, 10) || 20))
    const { items, total } = repository.list({ status, query, page, pageSize })
    res.json({ data: items, total, page, pageSize })
  })

  app.get('/api/articles/:id', (req, res) => {
    const article = repository.find(req.params.id)
    if (!article) return res.status(404).json({ error: { code: 'ARTICLE_NOT_FOUND', message: 'article not found' } })
    res.json({ data: article })
  })

  app.post('/api/articles', (req, res) => {
    const errors = validateArticleInput(req.body)
    if (Object.keys(errors).length) return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'invalid article', fields: errors } })
    res.status(201).json({ data: repository.create(toArticleRecord(req.body)) })
  })

  app.put('/api/articles/:id', (req, res) => {
    const existing = repository.find(req.params.id)
    if (!existing) return res.status(404).json({ error: { code: 'ARTICLE_NOT_FOUND', message: 'article not found' } })
    const errors = validateArticleInput(req.body)
    if (Object.keys(errors).length) return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'invalid article', fields: errors } })
    res.json({ data: repository.update(req.params.id, toArticleRecord(req.body, existing)) })
  })

  app.delete('/api/articles/:id', (req, res) => {
    if (!repository.remove(req.params.id)) return res.status(404).json({ error: { code: 'ARTICLE_NOT_FOUND', message: 'article not found' } })
    res.sendStatus(204)
  })

  app.use((req, res) => res.status(404).json({ error: { code: 'ROUTE_NOT_FOUND', message: 'route not found' } }))
  app.use((error, req, res, next) => {
    logger.error?.(JSON.stringify({ requestId: res.get('x-request-id'), message: error.message }))
    if (error instanceof SyntaxError) return res.status(400).json({ error: { code: 'INVALID_JSON', message: 'invalid JSON' } })
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'internal error' } })
  })
  return app
}
