import assert from 'node:assert/strict'
import { after, before, test } from 'node:test'
import { createApp } from '../server/app.js'
import { hashPassword } from '../server/auth.js'
import { createMemoryRepository } from '../server/memoryRepository.js'
import { createMemoryUserRepository } from '../server/userRepository.js'

const secret = 'test-secret-that-is-longer-than-32-characters'
const memberPassword = 'member-pass-123'
const reviewerPassword = 'reviewer-pass-123'
const memberHash = hashPassword(memberPassword)
const reviewerHash = hashPassword(reviewerPassword)
const users = [
  { id: 1, username: 'student', displayName: '学生成员', role: 'member', passwordSalt: memberHash.salt, passwordHash: memberHash.hash },
  { id: 2, username: 'teacher', displayName: '课程审核员', role: 'reviewer', passwordSalt: reviewerHash.salt, passwordHash: reviewerHash.hash },
]
const repository = createMemoryRepository([{ id: 1, name: '已公开成员', role: '前端开发', email: 'public@example.com', skills: ['Vue'], interests: [], status: 'approved', version: 1 }])
const app = createApp({ repository, userRepository: createMemoryUserRepository(users), tokenSecret: secret, logger: { info() {}, error() {} } })
let server
let baseUrl
let memberToken
let reviewerToken

async function request(path, { token, body, ...options } = {}) {
  return fetch(`${baseUrl}${path}`, { ...options, headers: { ...(body ? { 'content-type': 'application/json' } : {}), ...(token ? { authorization: `Bearer ${token}` } : {}) }, body: body && JSON.stringify(body) })
}

before(async () => {
  await new Promise((resolve) => { server = app.listen(0, '127.0.0.1', resolve) })
  baseUrl = `http://127.0.0.1:${server.address().port}`
  for (const [role, username, password] of [['member', 'student', memberPassword], ['reviewer', 'teacher', reviewerPassword]]) {
    const response = await request('/api/auth/login', { method: 'POST', body: { username, password } })
    const token = (await response.json()).data.token
    if (role === 'member') memberToken = token; else reviewerToken = token
  }
})
after(() => new Promise((resolve) => server.close(resolve)))

test('健康检查和公开列表无需登录', async () => {
  assert.equal((await request('/health')).status, 200)
  const response = await request('/api/members'); const body = await response.json()
  assert.equal(response.status, 200); assert.equal(body.data.length, 1); assert.equal('email' in body.data[0], false)
})

test('错误密码统一返回 401', async () => {
  assert.equal((await request('/api/auth/login', { method: 'POST', body: { username: 'teacher', password: 'wrong' } })).status, 401)
})

test('未登录不能提交，成员可以提交', async () => {
  const input = { name: '待审成员', role: '后端开发', email: 'pending@example.com', skills: ['Node.js'] }
  assert.equal((await request('/api/members', { method: 'POST', body: input })).status, 401)
  assert.equal((await request('/api/members', { method: 'POST', body: input, token: memberToken })).status, 201)
})

test('成员不能查看审核列表或审批', async () => {
  assert.equal((await request('/api/review/members', { token: memberToken })).status, 403)
  assert.equal((await request('/api/review/members/2/status', { method: 'PATCH', body: { status: 'approved' }, token: memberToken })).status, 403)
})

test('审核员审批后成员进入公开列表且邮箱不公开', async () => {
  const reviewed = await request('/api/review/members/2/status', { method: 'PATCH', body: { status: 'approved' }, token: reviewerToken })
  assert.equal(reviewed.status, 200)
  const body = await (await request('/api/members')).json()
  assert.equal(body.data.length, 2); assert.equal(body.data.some((item) => 'email' in item), false)
})

test('重复审批被状态机拒绝', async () => {
  const response = await request('/api/review/members/2/status', { method: 'PATCH', body: { status: 'rejected' }, token: reviewerToken })
  assert.equal(response.status, 400); assert.equal((await response.json()).error.code, 'INVALID_TRANSITION')
})

test('错误 CSV 预览返回行号且不写数据库', async () => {
  const beforeCount = (await repository.listAll()).length
  const response = await request('/api/import/preview', { method: 'POST', body: { csv: 'name,role,email,skills\nX,前端,bad,Vue' }, token: reviewerToken })
  assert.equal(response.status, 400); assert.equal((await response.json()).error.rows[0].line, 2); assert.equal((await repository.listAll()).length, beforeCount)
})

test('正确 CSV 整批导入并保持待审核状态', async () => {
  const csv = 'name,role,email,skills\n批量甲,前端开发,batch-a@example.com,Vue|CSS\n批量乙,后端开发,batch-b@example.com,Node|API'
  const response = await request('/api/import', { method: 'POST', body: { csv }, token: reviewerToken })
  assert.equal(response.status, 201); assert.equal((await response.json()).data.imported, 2)
  assert.equal((await repository.listAll()).filter((item) => item.status === 'submitted').length, 2)
})

test('重复数据库邮箱导致整批导入失败', async () => {
  const beforeCount = (await repository.listAll()).length
  const csv = 'name,role,email,skills\n重复成员,前端开发,batch-a@example.com,Vue\n新成员二,后端开发,new-b@example.com,Node'
  assert.equal((await request('/api/import', { method: 'POST', body: { csv }, token: reviewerToken })).status, 409)
  assert.equal((await repository.listAll()).length, beforeCount)
})

test('导出仅审核员可用并隐藏完整邮箱', async () => {
  assert.equal((await request('/api/export', { token: memberToken })).status, 403)
  const response = await request('/api/export', { token: reviewerToken }); const csv = await response.text()
  assert.equal(response.status, 200); assert.match(csv, /p\*\*\*@example\.com/); assert.doesNotMatch(csv, /pending@example\.com/)
})
