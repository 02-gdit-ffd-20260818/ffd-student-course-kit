import test from 'node:test'
import assert from 'node:assert/strict'
import { loadArticles } from '../src/services/articleLoader.js'

test('正常：成功读取文章', async () => {
  const result = await loadArticles(async () => ({ ok: true, json: async () => [{ id: 1, slug: 'one', title: '文章' }] }))
  assert.equal(result.status, 'success')
  assert.equal(result.articles.length, 1)
})

test('边界：空数组进入 empty', async () => {
  const result = await loadArticles(async () => ({ ok: true, json: async () => [] }))
  assert.equal(result.status, 'empty')
})

test('失败：HTTP 错误进入可恢复 error', async () => {
  const result = await loadArticles(async () => ({ ok: false, status: 503 }))
  assert.equal(result.status, 'error')
  assert.match(result.message, /503/)
})
