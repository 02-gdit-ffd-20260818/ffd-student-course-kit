import test from 'node:test'
import assert from 'node:assert/strict'
import { buildUserPrompt, cleanOutput, generateWithMiniMax, SYSTEM_PROMPT } from '../src/shared/minimax.js'
import { candidateSlugs, isSafeSlug } from '../src/shared/slug.js'

const input = { receiver: '林老师', occasion: '毕业', tone: '温暖', details: '一起熬过的晚自习' }
const ok = text => async () => ({
  ok: true,
  json: async () => ({ content: [{ type: 'text', text }], base_resp: { status_code: 0 } }),
})

test('提示词把四项信息都带上了', () => {
  const prompt = buildUserPrompt(input)
  for (const part of ['林老师', '毕业', '温暖', '一起熬过的晚自习']) assert.match(prompt, new RegExp(part))
  assert.match(SYSTEM_PROMPT, /不得编造/)
})

test('模型带上前缀或引号时要擦干净', () => {
  assert.equal(cleanOutput('祝福语：愿你前程似锦。'), '愿你前程似锦。')
  assert.equal(cleanOutput('“愿你前程似锦。”'), '愿你前程似锦。')
  assert.equal(cleanOutput('  愿你前程似锦。  '), '愿你前程似锦。')
})

test('没有密钥直接报错，绝不带着空密钥去请求', async () => {
  await assert.rejects(() => generateWithMiniMax(input, { apiKey: '' }), /missing_api_key/)
})

test('密钥只出现在请求头里，不会进请求体', async () => {
  let seen
  await generateWithMiniMax(input, {
    apiKey: 'sk-test-123',
    fetchImpl: async (url, options) => {
      seen = options
      return ok('愿你前程似锦，归来仍是少年。')()
    },
  })
  assert.equal(seen.headers.Authorization, 'Bearer sk-test-123')
  assert.ok(!seen.body.includes('sk-test-123'), '密钥不能出现在请求体里')
})

test('上游返回 500 要抛错，交给调用方去兜底', async () => {
  await assert.rejects(
    () => generateWithMiniMax(input, { apiKey: 'k', fetchImpl: async () => ({ ok: false, status: 500, text: async () => '' }) }),
    /upstream_500/,
  )
})

test('HTTP 200 但 base_resp 报错，同样算失败', async () => {
  await assert.rejects(
    () => generateWithMiniMax(input, {
      apiKey: 'k',
      fetchImpl: async () => ({ ok: true, json: async () => ({ base_resp: { status_code: 1008, status_msg: '余额不足' } }) }),
    }),
    /余额不足/,
  )
})

test('短链接优先用 名字-日期，重名时才加随机码', () => {
  const list = candidateSlugs('林老师', new Date('2026-09-22T10:00:00'))
  assert.equal(list[0], '林老师-20260922')
  assert.match(list[1], /^林老师-20260922-[a-z2-9]{3}$/)
  // 空称呼也要能生成，不能出现以 - 开头的链接
  assert.equal(candidateSlugs('', new Date('2026-09-22T10:00:00'))[0], 'card-20260922')
})

test('称呼里的空格和标点不进网址', () => {
  const [slug] = candidateSlugs('亲爱的 林老师！', new Date('2026-09-22T10:00:00'))
  assert.equal(slug, '亲爱的林老师-20260922')
})

test('带斜杠或问号的 slug 一律拒绝', () => {
  assert.ok(isSafeSlug('林老师-20260922'))
  assert.ok(!isSafeSlug('../secret'))
  assert.ok(!isSafeSlug('a?b'))
  assert.ok(!isSafeSlug(''))
})
