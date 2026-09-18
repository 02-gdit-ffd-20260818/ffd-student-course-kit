import assert from 'node:assert/strict'
import test from 'node:test'
import { aggregateSkills, filterMembers, initials, normalizeMember, publicMembers, skillOptions, toPublicMember } from '../src/domain/member.js'

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

const searchable = [
  { name: '林晓', role: '前端开发', location: '广州', skills: ['Vue', 'CSS'], interests: ['摄影'] },
  { name: '陈一帆', role: '后端开发', location: '佛山', skills: ['Node.js', 'API'], interests: [] },
  { name: '陆星河', role: '质量保障', location: '惠州', skills: ['测试', 'API'], interests: ['骑行'] },
]

test('正常：关键字可匹配姓名、角色、城市、技能和兴趣', () => {
  assert.equal(filterMembers(searchable, { query: '广州' }).length, 1)
  assert.equal(filterMembers(searchable, { query: 'api' }).length, 2)
  assert.equal(filterMembers(searchable, { query: '摄影' })[0].name, '林晓')
})

test('正常：关键字与技能条件同时生效', () => {
  assert.deepEqual(filterMembers(searchable, { query: '开发', skill: 'Vue' }).map((item) => item.name), ['林晓'])
})

test('边界：空条件返回全部，无匹配返回空数组', () => {
  assert.equal(filterMembers(searchable).length, 3)
  assert.deepEqual(filterMembers(searchable, { query: '不存在' }), [])
})

test('聚合：技能来自同一成员数据并按人数降序', () => {
  const result = aggregateSkills(searchable)
  assert.deepEqual(result[0], { name: 'API', count: 2 })
  assert.deepEqual(result.find((item) => item.name === 'CSS'), { name: 'CSS', count: 1 })
  assert.ok(result.every((item, index) => index === 0 || result[index - 1].count >= item.count))
})

test('边界：技能选项去重并按中文环境排序', () => {
  const options = skillOptions(searchable)
  assert.equal(options.filter((item) => item === 'API').length, 1)
  assert.ok(options.includes('测试'))
})
