import assert from 'node:assert/strict'
import test from 'node:test'
import { inspectStyles, validateStyles } from '../scripts/style-rules.mjs'

const validCss = `
.list { display: grid; }
a:focus-visible { outline: 3px solid orange; }
@media (min-width: 700px) { .list { grid-template-columns: 1fr 1fr; } }
@media print { .card { break-inside: avoid; } }
`

test('正常：响应式和打印规则全部通过', () => {
  assert.deepEqual(validateStyles(validCss), [])
})

test('边界：Flex 也属于有效布局', () => {
  const result = inspectStyles(validCss.replace('display: grid', 'display: flex'))
  assert.equal(result.hasFlexOrGrid, true)
})

test('失败：缺少打印规则时给出明确错误', () => {
  const cssWithoutPrint = validCss.replace('@media print { .card { break-inside: avoid; } }', '')
  assert.deepEqual(validateStyles(cssWithoutPrint), [
    '缺少打印样式',
    '打印时没有防止卡片跨页断开',
  ])
})
