import test from 'node:test'
import assert from 'node:assert/strict'
import { createApp } from '../server/app.js'
import { createMemoryArticleRepository } from '../server/repositories/memoryArticleRepository.js'

const seed = [{ id: 1, slug: 'one', title: '第一篇', summary: '摘要', content: ['正文'], tags: ['Vue'], status: 'published', author: '林晓', publishedAt: '2026-09-01' }]
const validInput = { title: '新文章', summary: '新摘要', content: ['正文'], tags: ['REST'], status: 'draft' }

async function withApi(run) {
  const app = createApp({ repository: createMemoryArticleRepository(seed), logger: { info() {}, error() {} } })
  const server = await new Promise((resolve) => {
    const listener = app.listen(0, '127.0.0.1', () => resolve(listener))
  })
  const { port } = server.address()
  try { await run(`http://127.0.0.1:${port}`) }
  finally { await new Promise((resolve) => server.close(resolve)) }
}

test('健康检查不泄露配置', () => withApi(async (base) => {
  const response = await fetch(`${base}/health`)
  assert.equal(response.status, 200)
  assert.deepEqual(await response.json(), { ok: true, service: 'p2-blog-api' })
  assert.equal(response.headers.get('x-powered-by'), null)
}))

test('GET 列表支持状态和关键词查询', () => withApi(async (base) => {
  const response = await fetch(`${base}/api/articles?status=published&q=Vue`)
  const body = await response.json()
  assert.equal(response.status, 200)
  assert.equal(body.total, 1)
}))

test('POST 正常创建并可再次读取', () => withApi(async (base) => {
  const created = await fetch(`${base}/api/articles`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(validInput) })
  assert.equal(created.status, 201)
  const article = (await created.json()).data
  const found = await fetch(`${base}/api/articles/${article.id}`)
  assert.equal((await found.json()).data.title, '新文章')
}))

test('POST 边界输入返回稳定 400 字段错误', () => withApi(async (base) => {
  const response = await fetch(`${base}/api/articles`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ ...validInput, title: '' }) })
  const body = await response.json()
  assert.equal(response.status, 400)
  assert.equal(body.error.code, 'VALIDATION_ERROR')
  assert.equal(body.error.fields.title, 'title required')
}))

test('PUT 更新不存在文章返回 404', () => withApi(async (base) => {
  const response = await fetch(`${base}/api/articles/999`, { method: 'PUT', headers: { 'content-type': 'application/json' }, body: JSON.stringify(validInput) })
  assert.equal(response.status, 404)
  assert.equal((await response.json()).error.code, 'ARTICLE_NOT_FOUND')
}))

test('DELETE 删除后再次读取返回 404', () => withApi(async (base) => {
  assert.equal((await fetch(`${base}/api/articles/1`, { method: 'DELETE' })).status, 204)
  assert.equal((await fetch(`${base}/api/articles/1`)).status, 404)
}))

test('损坏 JSON 返回 400 而不是 500', () => withApi(async (base) => {
  const response = await fetch(`${base}/api/articles`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: '{bad' })
  assert.equal(response.status, 400)
  assert.equal((await response.json()).error.code, 'INVALID_JSON')
}))

test('OPTIONS 返回 CORS 许可', () => withApi(async (base) => {
  const response = await fetch(`${base}/api/articles`, { method: 'OPTIONS' })
  assert.equal(response.status, 204)
  assert.match(response.headers.get('access-control-allow-methods'), /POST/)
}))
