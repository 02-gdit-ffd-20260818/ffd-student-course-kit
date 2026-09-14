import assert from 'node:assert/strict'
import test from 'node:test'
import { inspectHtml, validateHtml } from '../scripts/site-rules.mjs'

const validHtml = `<!doctype html><html><body>
  <header><h1>姓名</h1></header>
  <main><section></section><section></section><section><img src="avatar.png" alt="姓名头像"></section></main>
  <footer></footer>
</body></html>`

test('正常页面通过全部规则', () => {
  assert.deepEqual(validateHtml(validHtml), [])
})

test('边界：没有图片时不误报 alt 错误', () => {
  const result = inspectHtml(validHtml.replace('<img src="avatar.png" alt="姓名头像">', ''))
  assert.equal(result.imagesHaveAlt, true)
})

test('失败：识别多个 h1、空 alt 和本机路径', () => {
  const invalid = validHtml
    .replace('</header>', '<h1>重复标题</h1></header>')
    .replace('alt="姓名头像"', 'alt=""')
    .replace('avatar.png', 'C:\\Users\\student\\avatar.png')
  const failures = validateHtml(invalid)
  assert.equal(failures.length, 3)
})
