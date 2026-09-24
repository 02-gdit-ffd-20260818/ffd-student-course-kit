import test from 'node:test'
import assert from 'node:assert/strict'
import { loadStoredArticles, persistArticles, removeArticle, saveArticle, searchArticles, validateArticle } from '../src/services/articleEditorService.js'

const input = { title: '新文章', summary: '摘要', content: '正文', tags: 'Vue, 测试', status: 'draft' }

test('正常：新建文章并保留源数组', () => {
  const source = []
  const result = saveArticle(source, input, 101)
  assert.equal(result.ok, true)
  assert.equal(result.article.id, 101)
  assert.deepEqual(result.article.tags, ['Vue', '测试'])
  assert.equal(source.length, 0)
})

test('正常：按 id 更新文章而不增加数量', () => {
  const source = [{ ...input, id: 1, slug: 'old', tags: [], content: [] }]
  const result = saveArticle(source, { ...input, id: 1, title: '已更新' })
  assert.equal(result.items.length, 1)
  assert.equal(result.items[0].title, '已更新')
})

test('边界：标题和摘要校验给出字段错误', () => {
  const errors = validateArticle({ title: '', summary: 'x'.repeat(161), status: 'unknown' })
  assert.equal(errors.title, '标题不能为空')
  assert.match(errors.summary, /160/)
  assert.equal(errors.status, '文章状态无效')
})

test('搜索：空查询复制列表，关键词匹配标签', () => {
  const items = [{ title: '文章', summary: '摘要', tags: ['Vue'] }]
  assert.notEqual(searchArticles(items, ''), items)
  assert.equal(searchArticles(items, 'vue').length, 1)
  assert.equal(searchArticles(items, 'CSS').length, 0)
})

test('删除：只删除指定 id', () => {
  assert.deepEqual(removeArticle([{ id: 1 }, { id: 2 }], 1), [{ id: 2 }])
})

test('刷新恢复：可读存储；损坏存储回退 seed', () => {
  const valid = { getItem: () => JSON.stringify([{ id: 1, slug: 'one', title: '文章' }]) }
  assert.equal(loadStoredArticles(valid).length, 1)
  const broken = { getItem: () => '{bad json' }
  assert.equal(loadStoredArticles(broken, [{ id: 2, slug: 'seed', title: '种子' }])[0].id, 2)
})

test('失败：存储不可用时返回 false', () => {
  const storage = { setItem: () => { throw new Error('quota') } }
  assert.equal(persistArticles(storage, []), false)
})
