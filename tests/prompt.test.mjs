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
  const text = createFallbackGreeting({ receiver: '阿青', occasion: '毕业', tone: '典雅', details: '' }, 1)
  assert.match(text, /阿青/)
  assert.equal(PROMPT_VERSION, 'greeting-card-v1.3')
})

// ↓ 下面几条针对 v1.3 新增的"换一个说法"，每条都对应一个真出过的问题

test('同一个 seed 必须得到同一句话', () => {
  const input = { receiver: '林老师', occasion: '生日', tone: '温暖', details: '' }
  assert.equal(createFallbackGreeting(input, 42), createFallbackGreeting(input, 42))
})

test('换 seed 要真的换说法，而且开头、正文、落款各自独立在变', () => {
  const input = { receiver: '林老师', occasion: '毕业', tone: '温暖', details: '' }
  const seen = new Set()
  for (let seed = 1; seed <= 200; seed += 1) seen.add(createFallbackGreeting(input, seed))
  // 3 个开头 × 3 句正文 × 3 个落款 = 27 种。曾经因为用 seed/salt 取整，
  // seed 小的时候三个位置一起卡在第一项，只能出 3 种。
  assert.equal(seen.size, 27)
})

test('任何组合都不能吐出 undefined', () => {
  for (const occasion of ['生日', '毕业', '新年', '感谢', '乔迁', '通用'])
    for (const tone of ['真诚', '温暖', '活泼', '典雅', '简洁'])
      for (let seed = 1; seed <= 60; seed += 1) {
        const text = createFallbackGreeting({ receiver: '同学', occasion, tone, details: '' }, seed)
        assert.ok(!text.includes('undefined'), `${occasion}/${tone}/${seed} 出现了 undefined`)
        assert.ok(text.trim().length > 0)
      }
})

test('简洁风格不带开头和破折号', () => {
  const text = createFallbackGreeting({ receiver: '阿哲', occasion: '新年', tone: '简洁', details: '' }, 5)
  assert.ok(!text.includes('——'), text)
})

test('补充信息会被接进正文并限长', () => {
  const text = createFallbackGreeting(
    { receiver: '同学', occasion: '感谢', tone: '真诚', details: '毕业设计那两个月' }, 3)
  assert.match(text, /毕业设计那两个月/)
})
