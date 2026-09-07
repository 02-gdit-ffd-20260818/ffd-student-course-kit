import assert from 'node:assert/strict'
import test from 'node:test'
import { initials, normalizeMember, publicMembers, toPublicMember } from '../src/domain/member.js'

test('正常：标准成员资料被规范化', () => {
  const member = normalizeMember({ id: 7, name: ' 林晓 ', role: ' 前端 ', skills: ['Vue', 'Vue', ' CSS '] })
  assert.equal(member.id, '7')
  assert.equal(member.name, '林晓')
  assert.deepEqual(member.skills, ['Vue', 'CSS'])
})

test('边界：空字段得到可解释的展示值', () => {
  const member = normalizeMember({ skills: [], interests: [] })
  assert.equal(member.name, '未命名成员')
  assert.equal(member.location, '地点未公开')
  assert.match(member.bio, /暂未填写/)
})

test('边界：姓名缩写兼容空值和长姓名', () => {
  assert.equal(initials('欧阳星河'), '星河')
  assert.equal(initials(''), '成员')
})

test('隐私：没有资料授权的记录不会公开', () => {
  assert.equal(toPublicMember({ id: 1, name: '测试', profileConsent: false }), null)
  assert.equal(publicMembers([{ profileConsent: false }, { id: 2, name: '可见', profileConsent: true }]).length, 1)
})

test('隐私：公开对象不泄露联系方式与授权元数据', () => {
  const member = toPublicMember({ id: 1, name: '林晓', email: 'private@example.com', profileConsent: true, retentionUntil: '2027-01-01' })
  assert.equal('email' in member, false)
  assert.equal('profileConsent' in member, false)
  assert.equal('retentionUntil' in member, false)
})
