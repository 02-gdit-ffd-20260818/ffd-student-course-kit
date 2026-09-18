import crypto from 'node:crypto'
import express from 'express'
import { createAccessToken, readBearerToken, verifyAccessToken, verifyPassword } from './auth.js'
import { exportMembersCsv, parseMemberCsv } from './csv.js'
import { createMemoryRepository } from './memoryRepository.js'
import { publicMember, toMemberRecord, validateMemberInput } from './memberInput.js'
import { assertTransition } from './workflow.js'

export function createApp({ repository = createMemoryRepository(), userRepository, tokenSecret = process.env.SESSION_SECRET || '', allowedOrigin = process.env.ALLOWED_ORIGIN || 'http://127.0.0.1:5173', logger = console } = {}) {
  const app = express()
  app.disable('x-powered-by')
  app.use(express.json({ limit: '250kb' }))
  app.use((req, res, next) => {
    const requestId = req.get('x-request-id') || crypto.randomUUID()
    res.set('x-request-id', requestId)
    res.set('access-control-allow-origin', allowedOrigin)
    res.set('access-control-allow-headers', 'content-type,x-request-id,authorization')
    res.set('access-control-allow-methods', 'GET,POST,PATCH,OPTIONS')
    if (req.method === 'OPTIONS') return res.sendStatus(204)
    const startedAt = Date.now()
    res.on('finish', () => logger.info?.(JSON.stringify({ requestId, method: req.method, path: req.path, status: res.statusCode, durationMs: Date.now() - startedAt })))
    next()
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

  app.get('/health', (req, res) => res.json({ ok: true, service: 'p3-community-api' }))
  app.post('/api/auth/login', async (req, res) => {
    const username = String(req.body?.username ?? '').trim()
    const password = String(req.body?.password ?? '')
    const user = username && userRepository ? await userRepository.findByUsername(username) : null
    if (!user || !verifyPassword(password, user.passwordSalt, user.passwordHash)) return res.status(401).json({ error: { code: 'INVALID_CREDENTIALS', message: 'invalid username or password' } })
    res.json({ data: { token: createAccessToken(user, tokenSecret), user: { id: user.id, username: user.username, displayName: user.displayName, role: user.role } } })
  })

  app.get('/api/members', async (req, res) => res.json({ data: (await repository.listPublic()).map(publicMember) }))
  app.post('/api/members', requireRole('member', 'reviewer'), async (req, res) => {
    const errors = validateMemberInput(req.body)
    if (Object.keys(errors).length) return res.status(400).json({ error: { code: 'VALIDATION_ERROR', fields: errors } })
    res.status(201).json({ data: await repository.create({ ...toMemberRecord(req.body, req.user.sub), status: 'submitted' }) })
  })
  app.get('/api/review/members', requireRole('reviewer'), async (req, res) => res.json({ data: await repository.listAll() }))
  app.patch('/api/review/members/:id/status', requireRole('reviewer'), async (req, res) => {
    const existing = await repository.find(req.params.id)
    if (!existing) return res.status(404).json({ error: { code: 'MEMBER_NOT_FOUND' } })
    assertTransition(existing.status, req.body?.status, req.user.role)
    res.json({ data: await repository.transition(req.params.id, req.body.status, { reviewerId: req.user.sub, note: String(req.body?.note ?? '').slice(0, 300) }) })
  })
  app.post('/api/import/preview', requireRole('reviewer'), (req, res) => {
    const result = parseMemberCsv(req.body?.csv)
    if (result.errors.length) return res.status(400).json({ error: { code: 'CSV_VALIDATION_ERROR', rows: result.errors } })
    res.json({ data: result })
  })
  app.post('/api/import', requireRole('reviewer'), async (req, res) => {
    const result = parseMemberCsv(req.body?.csv)
    if (result.errors.length) return res.status(400).json({ error: { code: 'CSV_VALIDATION_ERROR', rows: result.errors } })
    try { res.status(201).json({ data: { imported: (await repository.importBatch(result.rows, req.user.sub)).length } }) }
    catch (error) { if (error.code === 'DUPLICATE_EMAIL') return res.status(409).json({ error: { code: error.code } }); throw error }
  })
  app.get('/api/export', requireRole('reviewer'), async (req, res) => {
    res.type('text/csv').attachment('p3-members.csv').send(`\uFEFF${exportMembersCsv(await repository.listAll())}`)
  })
  app.use((req, res) => res.status(404).json({ error: { code: 'ROUTE_NOT_FOUND' } }))
  app.use((error, req, res, next) => {
    logger.error?.(JSON.stringify({ requestId: res.get('x-request-id'), code: error.code, message: error.message }))
    if (error instanceof SyntaxError) return res.status(400).json({ error: { code: 'INVALID_JSON', message: 'invalid JSON' } })
    res.status(error.status || 500).json({ error: { code: error.code || 'INTERNAL_ERROR', message: error.status ? error.message : 'internal error' } })
  })
  return app
}
