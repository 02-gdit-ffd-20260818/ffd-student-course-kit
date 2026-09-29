import test from 'node:test'
import assert from 'node:assert/strict'
import { filterArticlesByTag, findArticleBySlug, normalizeArticle, normalizeArticles } from '../src/services/articleService.js'

const sample = { id: 1, slug: 'hello', title: '  第一篇  ', tags: ['Vue', 'Vue', ''] }

test('正常：规范化文章并去重标签', () => {
  assert.deepEqual(normalizeArticle(sample), {
    summary: '暂无摘要', content: ['正文正在整理。'], author: '匿名作者', publishedAt: '',
    id: 1, slug: 'hello', title: '第一篇', tags: ['Vue'],
  })
})

test('边界：非数组和无效文章得到安全空列表', () => {
  assert.deepEqual(normalizeArticles(null), [])
  assert.deepEqual(normalizeArticles([{ id: 0, title: '', slug: '' }]), [])
})

test('边界：过滤空正文并在全部无效时使用默认正文', () => {
  assert.deepEqual(normalizeArticle({ ...sample, content: ['', '  正文  ', null] }).content, ['正文'])
  assert.deepEqual(normalizeArticle({ ...sample, content: ['', null] }).content, ['正文正在整理。'])
})

test('查找：正确返回文章或 null', () => {
  const articles = [normalizeArticle(sample)]
  assert.equal(findArticleBySlug(articles, 'hello')?.id, 1)
  assert.equal(findArticleBySlug(articles, 'missing'), null)
})

test('标签：筛选不修改原数组', () => {
  const articles = [normalizeArticle(sample), normalizeArticle({ id: 2, slug: 'css', title: 'CSS', tags: ['CSS'] })]
  const result = filterArticlesByTag(articles, 'Vue')
  assert.deepEqual(result.map((item) => item.id), [1])
  assert.equal(articles.length, 2)
})
