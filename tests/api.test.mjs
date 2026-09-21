import test from 'node:test'
import assert from 'node:assert/strict'
import { createApp } from '../server/app.js'
import { createMemoryArticleRepository } from '../server/repositories/memoryArticleRepository.js'
import { createAccessToken, hashPassword } from '../server/services/auth.js'

const seed = [{ id: 1, slug: 'one', title: '第一篇', summary: '摘要', content: ['正文'], tags: ['Vue'], status: 'published', author: '林晓', publishedAt: '2026-09-01' }]
const validInput = { title: '新文章', summary: '新摘要', content: ['正文'], tags: ['REST'], status: 'draft' }
const testSecret = 'test-session-secret-at-least-32-characters'
const credentials = { username: 'teacher', password: 'classroom-password-123' }
const passwordRecord = hashPassword(credentials.password, '00112233445566778899aabbccddeeff')
const admin = { id: 1, username: credentials.username, displayName: '教师', role: 'admin', passwordSalt: passwordRecord.salt, passwordHash: passwordRecord.hash }

async function withApi(run) {
  const app = createApp({ repository: createMemoryArticleRepository(seed), userRepository: { findByUsername: async (username) => username === admin.username ? admin : null }, tokenSecret: testSecret, logger: { info() {}, error() {} } })
  const server = await new Promise((resolve) => {
    const listener = app.listen(0, '127.0.0.1', () => resolve(listener))
  })
  const { port } = server.address()
  try { await run(`http://127.0.0.1:${port}`) }
  finally { await new Promise((resolve) => server.close(resolve)) }
}

async function login(base, input = credentials) {
  const response = await fetch(`${base}/api/auth/login`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(input) })
  return { response, body: await response.json() }
}

async function authorizedHeaders(base) {
  const { body } = await login(base)
  return { 'content-type': 'application/json', authorization: `Bearer ${body.data.token}` }
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

test('GET 列表返回受上限保护的分页元数据', () => withApi(async (base) => {
  const response = await fetch(`${base}/api/articles?page=2&pageSize=1`)
  const body = await response.json()
  assert.equal(response.status, 200)
  assert.equal(body.page, 2)
  assert.equal(body.pageSize, 1)
  assert.equal(body.total, 1)
  assert.equal(body.data.length, 0)
}))

test('POST 正常创建并可再次读取', () => withApi(async (base) => {
  const created = await fetch(`${base}/api/articles`, { method: 'POST', headers: await authorizedHeaders(base), body: JSON.stringify(validInput) })
  assert.equal(created.status, 201)
  const article = (await created.json()).data
  const found = await fetch(`${base}/api/articles/${article.id}`)
  assert.equal((await found.json()).data.title, '新文章')
}))

test('POST 边界输入返回稳定 400 字段错误', () => withApi(async (base) => {
  const response = await fetch(`${base}/api/articles`, { method: 'POST', headers: await authorizedHeaders(base), body: JSON.stringify({ ...validInput, title: '' }) })
  const body = await response.json()
  assert.equal(response.status, 400)
  assert.equal(body.error.code, 'VALIDATION_ERROR')
  assert.equal(body.error.fields.title, 'title required')
}))

test('PUT 更新不存在文章返回 404', () => withApi(async (base) => {
  const response = await fetch(`${base}/api/articles/999`, { method: 'PUT', headers: await authorizedHeaders(base), body: JSON.stringify(validInput) })
  assert.equal(response.status, 404)
  assert.equal((await response.json()).error.code, 'ARTICLE_NOT_FOUND')
}))

test('DELETE 删除后再次读取返回 404', () => withApi(async (base) => {
  assert.equal((await fetch(`${base}/api/articles/1`, { method: 'DELETE', headers: await authorizedHeaders(base) })).status, 204)
  assert.equal((await fetch(`${base}/api/articles/1`)).status, 404)
}))

test('损坏 JSON 返回 400 而不是 500', () => withApi(async (base) => {
  const response = await fetch(`${base}/api/articles`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: '{bad' })
  assert.equal(response.status, 400)
  assert.equal((await response.json()).error.code, 'INVALID_JSON')
}))

test('登录成功返回角色和签名令牌', () => withApi(async (base) => {
  const { response, body } = await login(base)
  assert.equal(response.status, 200)
  assert.equal(body.data.user.role, 'admin')
  assert.equal(body.data.token.split('.').length, 2)
}))

test('错误账号或密码统一返回 401', () => withApi(async (base) => {
  const { response, body } = await login(base, { username: 'missing', password: 'wrong-password' })
  assert.equal(response.status, 401)
  assert.equal(body.error.code, 'INVALID_CREDENTIALS')
}))

test('未登录写操作返回 401', () => withApi(async (base) => {
  const response = await fetch(`${base}/api/articles`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(validInput) })
  assert.equal(response.status, 401)
  assert.equal((await response.json()).error.code, 'AUTH_REQUIRED')
}))

test('作者可以保存但不能删除文章', () => withApi(async (base) => {
  const authorToken = createAccessToken({ id: 2, username: 'author', role: 'author' }, testSecret)
  const headers = { 'content-type': 'application/json', authorization: `Bearer ${authorToken}` }
  assert.equal((await fetch(`${base}/api/articles`, { method: 'POST', headers, body: JSON.stringify(validInput) })).status, 201)
  const response = await fetch(`${base}/api/articles/1`, { method: 'DELETE', headers })
  assert.equal(response.status, 403)
  assert.equal((await response.json()).error.code, 'FORBIDDEN')
}))

test('OPTIONS 返回 CORS 许可', () => withApi(async (base) => {
  const response = await fetch(`${base}/api/articles`, { method: 'OPTIONS' })
  assert.equal(response.status, 204)
  assert.match(response.headers.get('access-control-allow-methods'), /POST/)
}))
