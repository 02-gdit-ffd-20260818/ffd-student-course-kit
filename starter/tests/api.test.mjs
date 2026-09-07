import test from 'node:test'
import assert from 'node:assert/strict'
import { createApp } from '../server/app.js'

async function withServer(app, callback) {
  const server = app.listen(0, '127.0.0.1')
  await new Promise((resolve) => server.once('listening', resolve))
  try { await callback(`http://127.0.0.1:${server.address().port}`) } finally { await new Promise((resolve) => server.close(resolve)) }
}

test('health never exposes a secret', async () => {
  await withServer(createApp({ env: { AI_PROVIDER: 'openai', OPENAI_API_KEY: 'unit-test-placeholder' } }), async (base) => {
    const response = await fetch(`${base}/health`)
    const body = await response.text()
    assert.equal(response.status, 200)
    assert.doesNotMatch(body, /unit-test-placeholder/)
    assert.equal(JSON.parse(body).providerConfigured, true)
  })
})

test('generate returns a review flag and prompt version', async () => {
  await withServer(createApp({ generate: async () => ({ text: '一份祝福', mode: 'fallback', reason: 'test' }) }), async (base) => {
    const response = await fetch(`${base}/api/greetings/generate`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ receiver: '林老师', occasion: '感谢', tone: '真诚', details: '' }) })
    const data = await response.json()
    assert.equal(response.status, 200)
    assert.equal(data.requiresHumanReview, true)
    assert.equal(data.promptVersion, 'greeting-card-v1.0')
  })
})

test('generate rejects invalid input and enforces rate limit', async () => {
  await withServer(createApp({ env: { RATE_LIMIT_MAX: '1', RATE_LIMIT_WINDOW_MS: '60000' } }), async (base) => {
    const init = { method: 'POST', headers: { 'content-type': 'application/json' }, body: '{}' }
    assert.equal((await fetch(`${base}/api/greetings/generate`, init)).status, 400)
    assert.equal((await fetch(`${base}/api/greetings/generate`, init)).status, 429)
  })
})
