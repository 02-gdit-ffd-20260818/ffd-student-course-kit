import test from 'node:test'
import assert from 'node:assert/strict'
import { generateGreeting } from '../server/provider.js'

const input = { receiver: '小满', occasion: '生日', tone: '温暖', details: '' }

test('uses fallback when provider is not configured', async () => {
  const result = await generateGreeting(input, { env: { AI_PROVIDER: 'fallback' } })
  assert.equal(result.mode, 'fallback')
  assert.equal(result.reason, 'provider_not_configured')
})

test('reads output_text from Responses API without leaking the key', async () => {
  let request
  const result = await generateGreeting(input, {
    env: { AI_PROVIDER: 'openai', OPENAI_API_KEY: 'unit-test-placeholder', OPENAI_MODEL: 'example-model' },
    fetchImpl: async (_url, init) => { request = init; return { ok: true, json: async () => ({ output_text: '生日快乐，愿你日日有光。' }) } }
  })
  assert.equal(result.mode, 'ai')
  assert.match(result.text, /生日快乐/)
  assert.doesNotMatch(request.body, /unit-test-placeholder/)
  assert.match(request.headers.Authorization, /^Bearer /)
})

test('falls back when the upstream fails', async () => {
  const result = await generateGreeting(input, {
    env: { AI_PROVIDER: 'openai', OPENAI_API_KEY: 'unit-test-placeholder' },
    fetchImpl: async () => ({ ok: false, status: 503 })
  })
  assert.equal(result.mode, 'fallback')
  assert.equal(result.reason, 'upstream_unavailable')
})
