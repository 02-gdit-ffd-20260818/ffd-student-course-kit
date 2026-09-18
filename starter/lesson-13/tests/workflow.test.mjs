import assert from 'node:assert/strict'
import test from 'node:test'
import { exportMembersCsv, parseMemberCsv, safeSpreadsheetCell } from '../server/csv.js'
import { validateMemberInput } from '../server/memberInput.js'
import { assertTransition } from '../server/workflow.js'

test('成员输入校验覆盖必填、邮箱和长度', () => {
  const errors = validateMemberInput({ name: 'A', role: '', email: 'bad', bio: 'x'.repeat(301) })
  assert.deepEqual(Object.keys(errors).sort(), ['bio', 'email', 'name', 'role'])
})

test('合法与非法审核状态转换可区分', () => {
  assert.doesNotThrow(() => assertTransition('submitted', 'approved', 'reviewer'))
  assert.throws(() => assertTransition('approved', 'rejected', 'reviewer'), (error) => error.code === 'INVALID_TRANSITION')
})

test('普通成员不能执行审核转换', () => {
  assert.throws(() => assertTransition('submitted', 'approved', 'member'), (error) => error.status === 403)
})

test('CSV 预览报告缺表头、无效行和重复邮箱', () => {
  assert.equal(parseMemberCsv('name,email\n测试,a@example.com').errors[0].line, 1)
  const parsed = parseMemberCsv('name,role,email,skills\n测试成员,前端,a@example.com,Vue\n另一成员,后端,a@example.com,Node')
  assert.equal(parsed.rows.length, 1)
  assert.equal(parsed.errors[0].line, 3)
})

test('CSV 单元格阻止公式注入', () => {
  assert.equal(safeSpreadsheetCell('=1+1'), "'=1+1")
  assert.equal(safeSpreadsheetCell('正常'), '正常')
})

test('脱敏导出隐藏完整邮箱并清洗危险公式', () => {
  const csv = exportMembersCsv([{ name: '=HYPERLINK()', role: '前端', status: 'approved', email: 'person@example.com', skills: ['Vue'] }])
  assert.match(csv, /p\*\*\*@example\.com/)
  assert.doesNotMatch(csv, /person@example\.com/)
  assert.match(csv, /'=HYPERLINK/)
})
