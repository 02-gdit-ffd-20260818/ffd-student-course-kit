import express from 'express'
import { randomUUID } from 'node:crypto'
import { normalizeCardInput, PROMPT_VERSION } from './prompt.js'
import { generateGreeting } from './provider.js'

export function createApp(options = {}) {
  const env = options.env ?? process.env
  const generate = options.generate ?? ((input) => generateGreeting(input, { env }))
  const app = express()
  const hits = new Map()
  app.disable('x-powered-by')
  app.use(express.json({ limit: '20kb' }))
  app.use((req, res, next) => {
    const allowed = String(env.APP_ORIGINS || '').split(',').map((item) => item.trim()).filter(Boolean)
    const origin = req.get('origin')
    if (origin && allowed.includes(origin)) res.set('Access-Control-Allow-Origin', origin)
    res.set('Vary', 'Origin')
    res.set('X-Content-Type-Options', 'nosniff')
    res.set('Referrer-Policy', 'no-referrer')
    next()
  })
  app.use('/api/', (req, res, next) => {
    const now = Date.now()
    const windowMs = Number(env.RATE_LIMIT_WINDOW_MS || 60000)
    const max = Number(env.RATE_LIMIT_MAX || 12)
    const key = req.ip
    const item = hits.get(key)
    const current = !item || now - item.start >= windowMs ? { start: now, count: 1 } : { ...item, count: item.count + 1 }
    hits.set(key, current)
    if (current.count > max) return res.status(429).json({ error: { code: 'RATE_LIMITED', message: '请求过于频繁，请稍后再试' } })
    next()
  })
  app.get('/health', (_req, res) => res.json({ status: 'ok', project: 'ffd-p4-greeting-card', promptVersion: PROMPT_VERSION, providerConfigured: env.AI_PROVIDER === 'openai' && Boolean(env.OPENAI_API_KEY) }))
  app.post('/api/greetings/generate', async (req, res) => {
    try {
      const input = normalizeCardInput(req.body)
      const result = await generate(input)
      res.json({ ...result, promptVersion: PROMPT_VERSION, requestId: randomUUID(), requiresHumanReview: true })
    } catch (error) {
      res.status(error.status || 500).json({ error: { code: error.code || 'INTERNAL_ERROR', message: error.status ? error.message : '服务暂时不可用' } })
    }
  })
  app.use((error, _req, res, _next) => {
    if (error?.type === 'entity.too.large') return res.status(413).json({ error: { code: 'PAYLOAD_TOO_LARGE', message: '请求内容过大' } })
    res.status(400).json({ error: { code: 'INVALID_JSON', message: '请求格式不正确' } })
  })
  return app
}
