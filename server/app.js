import crypto from 'node:crypto'
import express from 'express'
import { seedArticles } from './data/seedArticles.js'
import { createMemoryArticleRepository } from './repositories/memoryArticleRepository.js'
import { toArticleRecord, validateArticleInput } from './services/articleInput.js'
import { createAccessToken, readBearerToken, verifyAccessToken, verifyPassword } from './services/auth.js'

export function createApp({ repository = createMemoryArticleRepository(seedArticles), userRepository = null, tokenSecret = process.env.SESSION_SECRET || '', allowedOrigin = process.env.ALLOWED_ORIGIN || 'http://127.0.0.1:5173', logger = console } = {}) {
  const app = express()
  app.disable('x-powered-by')
  app.use(express.json({ limit: '100kb' }))
  app.use((req, res, next) => {
    const requestId = req.get('x-request-id') || crypto.randomUUID()
    res.set('x-request-id', requestId)
    res.set('access-control-allow-origin', allowedOrigin)
    res.set('access-control-allow-headers', 'content-type,x-request-id,authorization')
    res.set('access-control-allow-methods', 'GET,POST,PUT,DELETE,OPTIONS')
    if (req.method === 'OPTIONS') return res.sendStatus(204)
    const startedAt = Date.now()
    res.on('finish', () => logger.info?.(JSON.stringify({ requestId, method: req.method, path: req.path, status: res.statusCode, durationMs: Date.now() - startedAt })))
    next()
  })

  app.get('/health', (req, res) => res.json({ ok: true, service: 'p2-blog-api' }))

  app.post('/api/auth/login', async (req, res) => {
    const username = String(req.body?.username || '').trim()
    const password = String(req.body?.password || '')
    if (!username || username.length > 80 || !password || password.length > 200) return res.status(401).json({ error: { code: 'INVALID_CREDENTIALS', message: 'invalid username or password' } })
    const user = userRepository ? await userRepository.findByUsername(username) : null
    if (!user || !verifyPassword(password, user.passwordSalt, user.passwordHash)) return res.status(401).json({ error: { code: 'INVALID_CREDENTIALS', message: 'invalid username or password' } })
    const token = createAccessToken(user, tokenSecret)
    res.json({ data: { token, user: { id: user.id, username: user.username, displayName: user.displayName, role: user.role } } })
  })

  function requireRole(...roles) {
    return (req, res, next) => {
      const claims = verifyAccessToken(readBearerToken(req.get('authorization')), tokenSecret)
      if (!claims) return res.status(401).json({ error: { code: 'AUTH_REQUIRED', message: 'login required' } })
      if (!roles.includes(claims.role)) return res.status(403).json({ error: { code: 'FORBIDDEN', message: 'forbidden' } })
      req.user = claims
      next()
    }
  }

  app.get('/api/articles', async (req, res) => {
    const status = req.query.status
    const query = String(req.query.q || '').trim().toLocaleLowerCase('zh-CN')
    const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1)
    const pageSize = Math.min(50, Math.max(1, Number.parseInt(req.query.pageSize, 10) || 20))
    const { items, total } = await repository.list({ status, query, page, pageSize })
    res.json({ data: items, total, page, pageSize })
  })

  app.get('/api/articles/:id', async (req, res) => {
    const article = await repository.find(req.params.id)
    if (!article) return res.status(404).json({ error: { code: 'ARTICLE_NOT_FOUND', message: 'article not found' } })
    res.json({ data: article })
  })

  app.post('/api/articles', requireRole('author', 'admin'), async (req, res) => {
    const errors = validateArticleInput(req.body)
    if (Object.keys(errors).length) return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'invalid article', fields: errors } })
    res.status(201).json({ data: await repository.create(toArticleRecord(req.body)) })
  })

  app.put('/api/articles/:id', requireRole('author', 'admin'), async (req, res) => {
    const existing = await repository.find(req.params.id)
    if (!existing) return res.status(404).json({ error: { code: 'ARTICLE_NOT_FOUND', message: 'article not found' } })
    const errors = validateArticleInput(req.body)
    if (Object.keys(errors).length) return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'invalid article', fields: errors } })
    res.json({ data: await repository.update(req.params.id, toArticleRecord(req.body, existing)) })
  })

  app.delete('/api/articles/:id', requireRole('admin'), async (req, res) => {
    if (!await repository.remove(req.params.id)) return res.status(404).json({ error: { code: 'ARTICLE_NOT_FOUND', message: 'article not found' } })
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
