import greetingHandler from '../netlify/functions/greeting.js'
import cardHandler from '../netlify/functions/card.js'
import viewHandler from '../netlify/functions/view.js'
import { createFileCardStore } from './card-store.js'
import express from 'express'
import { randomUUID } from 'node:crypto'
import { normalizeCardInput, PROMPT_VERSION } from './prompt.js'
import { generateGreeting } from './provider.js'

// 从请求里读 seed。外面传什么都可能，所以只认有限的正整数，其余一律当"没传"。
function readSeed(req) {
  const value = Number(req.body?.seed)
  return Number.isFinite(value) && value > 0 ? Math.floor(value) : Date.now()
}

export function createApp(options = {}) {
  const env = options.env ?? process.env
  // seed 一路传到兜底文案库：前端点"换一个说法"就是换一个 seed 再请求一次。
  // 它只影响挑哪一句模板，不进提示词，也不做任何校验之外的用途。
  const generate = options.generate ?? ((input, seed) => generateGreeting(input, { env, seed }))
  const app = express()
  const hits = new Map()
  app.disable('x-powered-by')
  app.use(express.json({ limit: '20kb' }))
  app.use((req, res, next) => {
    const allowed = String(env.APP_ORIGINS || '')
      .split(',')
      .map(item => item.trim())
      .filter(Boolean)
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
    const current =
      !item || now - item.start >= windowMs
        ? { start: now, count: 1 }
        : { ...item, count: item.count + 1 }
    hits.set(key, current)
    if (current.count > max)
      return res
        .status(429)
        .json({ error: { code: 'RATE_LIMITED', message: '请求过于频繁，请稍后再试' } })
    next()
  })
  app.get('/health', (_req, res) =>
    res.json({
      status: 'ok',
      project: 'ffd-p4-greeting-card',
      promptVersion: PROMPT_VERSION,
      providerConfigured: env.AI_PROVIDER === 'openai' && Boolean(env.OPENAI_API_KEY),
    }),
  )
  // 共用 Web Request/Response 处理函数，让学生的 TODO 同时作用于本地和平台部署。
  const cardStore = options.cardStore ?? createFileCardStore(env.CARD_STORAGE_PATH || './var/cards')
  const adapt = handler => async (req, res, next) => {
    try {
      const request = new Request('http://127.0.0.1' + req.originalUrl, {
        method: req.method,
        headers: { 'content-type': 'application/json' },
        ...(['GET', 'HEAD'].includes(req.method) ? {} : { body: JSON.stringify(req.body ?? {}) }),
      })
      // Express 已解码路径参数；函数按平台格式再解码一次，因此传入重新编码后的值。
      const response = await handler(request, { cardStore, env, params: { slug: encodeURIComponent(req.params.slug || '') } })
      res.status(response.status)
      response.headers.forEach((value, name) => res.set(name, value))
      res.send(Buffer.from(await response.arrayBuffer()))
    } catch (error) { next(error) }
  }
  app.all('/api/greeting', adapt(greetingHandler))
  app.all('/api/card', adapt(cardHandler))
  app.get('/c/:slug', adapt(viewHandler))
  app.post('/api/greetings/generate', async (req, res) => {
    try {
      const input = normalizeCardInput(req.body)
      const result = await generate(input, readSeed(req))
      res.json({
        ...result,
        promptVersion: PROMPT_VERSION,
        requestId: randomUUID(),
        requiresHumanReview: true,
      })
    } catch (error) {
      res
        .status(error.status || 500)
        .json({
          error: {
            code: error.code || 'INTERNAL_ERROR',
            message: error.status ? error.message : '服务暂时不可用',
          },
        })
    }
  })
  app.post('/api/greetings/stream', async (req, res) => {
    let input
    try {
      input = normalizeCardInput(req.body)
    } catch (error) {
      return res
        .status(error.status || 400)
        .json({ error: { code: error.code || 'INVALID_INPUT', message: error.message } })
    }
    res.set({
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    })
    res.flushHeaders()
    const send = (event, data) => res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`)
    try {
      const result = await generate(input, readSeed(req))
      send('meta', {
        mode: result.mode,
        reason: result.reason,
        promptVersion: PROMPT_VERSION,
        requiresHumanReview: true,
      })
      // 这里必须用 [\s\S] 而不是 .——正则里的 . **不匹配换行符**，
      // 用 . 的话多行祝福在分片时会把换行整个吃掉，收到的就是挤成一坨的一段话。
      const chunks = result.text.match(/[\s\S]{1,8}/gu) ?? []
      for (const chunk of chunks) send('delta', { text: chunk })
      send('done', { requestId: randomUUID() })
    } catch {
      send('error', { code: 'INTERNAL_ERROR', message: '服务暂时不可用，请重试' })
    } finally {
      res.end()
    }
  })
  app.use((error, _req, res, _next) => {
    if (error?.type === 'entity.too.large')
      return res.status(413).json({ error: { code: 'PAYLOAD_TOO_LARGE', message: '请求内容过大' } })
    res.status(400).json({ error: { code: 'INVALID_JSON', message: '请求格式不正确' } })
  })
  return app
}
