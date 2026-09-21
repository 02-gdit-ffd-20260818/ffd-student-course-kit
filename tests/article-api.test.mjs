import test from 'node:test'
import assert from 'node:assert/strict'
import { articleApi } from '../src/services/articleApi.js'

test('前端 API 客户端读取 data 字段', async () => {
  const data = await articleApi.list(async () => ({ ok: true, status: 200, json: async () => ({ data: [{ id: 1 }] }) }))
  assert.deepEqual(data, [{ id: 1 }])
})

test('前端 API 客户端发送 POST JSON', async () => {
  let captured
  await articleApi.create({ title: '文章' }, async (url, options) => {
    captured = { url, options }
    return { ok: true, status: 201, json: async () => ({ data: { id: 2 } }) }
  })
  assert.equal(captured.url, '/api/articles')
  assert.equal(captured.options.method, 'POST')
  assert.equal(JSON.parse(captured.options.body).title, '文章')
})

test('前端 API 客户端保留状态码和字段错误', async () => {
  await assert.rejects(
    () => articleApi.create({}, async () => ({ ok: false, status: 400, json: async () => ({ error: { message: 'invalid article', fields: { title: 'title required' } } }) })),
    (error) => error.status === 400 && error.fields.title === 'title required',
  )
})

test('登录后写请求自动携带 Bearer 令牌', async () => {
  globalThis.sessionStorage = {
    getItem: () => JSON.stringify({ token: 'signed-token' }),
    setItem() {},
    removeItem() {},
  }
  let authorization
  try {
    await articleApi.create({ title: '文章' }, async (url, options) => {
      authorization = options.headers.authorization
      return { ok: true, status: 201, json: async () => ({ data: { id: 2 } }) }
    })
    assert.equal(authorization, 'Bearer signed-token')
  } finally { delete globalThis.sessionStorage }
})
