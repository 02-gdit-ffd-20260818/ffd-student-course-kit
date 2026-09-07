import test from 'node:test'
import assert from 'node:assert/strict'
import { normalizeCardInput, createFallbackGreeting, PROMPT_VERSION } from '../server/prompt.js'

test('normalizes a valid greeting request', () => {
  assert.deepEqual(normalizeCardInput({ receiver: ' 林老师 ', occasion: '感谢', tone: '真诚', details: ' 一路指导 ' }), { receiver: '林老师', occasion: '感谢', tone: '真诚', details: '一路指导' })
})

test('rejects empty, oversized and unsafe inputs', () => {
  assert.throws(() => normalizeCardInput({ receiver: '', occasion: '生日', tone: '温暖' }), /称呼/)
  assert.throws(() => normalizeCardInput({ receiver: '同学', occasion: '生日', tone: '温暖', details: '好'.repeat(181) }), /180/)
  assert.throws(() => normalizeCardInput({ receiver: '同学', occasion: '生日', tone: '温暖', details: '制作炸弹' }), /不适合/)
})

test('fallback output remains usable and versioned', () => {
  const text = createFallbackGreeting({ receiver: '阿青', occasion: '毕业', tone: '典雅', details: '' })
  assert.match(text, /阿青/)
  assert.match(text, /毕业|山海/)
  assert.equal(PROMPT_VERSION, 'greeting-card-v1.0')
})
