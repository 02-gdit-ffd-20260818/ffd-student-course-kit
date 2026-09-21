import test from 'node:test'
import assert from 'node:assert/strict'
import { parseHash } from '../src/services/routeService.js'

test('正常：解析首页、文章和标签路径', () => {
  assert.deepEqual(parseHash('#/'), { name: 'home', param: '' })
  assert.deepEqual(parseHash('#/articles/hello'), { name: 'article', param: 'hello' })
  assert.deepEqual(parseHash('#/tags/%E7%BB%84%E4%BB%B6'), { name: 'tag', param: '组件' })
})

test('失败：未知路径进入 not-found', () => {
  assert.deepEqual(parseHash('#/unknown'), { name: 'not-found', param: 'unknown' })
})
