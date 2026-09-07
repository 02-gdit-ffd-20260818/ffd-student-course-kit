import assert from 'node:assert/strict'
import test from 'node:test'
import {
  collectSkills,
  filterProjects,
  normalizeProject,
  normalizeProjects,
  sortProjects,
} from '../scripts/project-service.mjs'

test('正常：规范化完整项目数据', () => {
  const result = normalizeProject({
    id: 1,
    name: '  示例项目  ',
    summary: ' 简介 ',
    skills: [' HTML ', '', 'CSS'],
    status: '完成',
    url: 'https://example.com/project',
  })
  assert.deepEqual(result, {
    id: '1',
    name: '示例项目',
    summary: '简介',
    skills: ['HTML', 'CSS'],
    status: '完成',
    url: 'https://example.com/project',
  })
})

test('边界：空数组得到可渲染的空列表', () => {
  assert.deepEqual(normalizeProjects([]), [])
  assert.deepEqual(normalizeProjects(null), [])
})

test('失败数据：补充安全默认值并拒绝本机路径', () => {
  const result = normalizeProject({ name: '', url: 'C:\\secret\\demo.html' }, 2)
  assert.equal(result.id, 'project-3')
  assert.equal(result.name, '未命名项目')
  assert.equal(result.summary, '暂时没有项目简介。')
  assert.equal(result.url, null)
})

const projectList = [
  { id: '2', name: '站点', skills: ['CSS', 'Vue'] },
  { id: '1', name: '博客', skills: ['Vue', 'API'] },
]

test('筛选：全部返回新数组，单技能和无匹配结果正确', () => {
  const all = filterProjects(projectList, 'all')
  assert.deepEqual(all, projectList)
  assert.notEqual(all, projectList)
  assert.deepEqual(filterProjects(projectList, 'API').map(item => item.id), ['1'])
  assert.deepEqual(filterProjects(projectList, '不存在'), [])
})

test('排序：升降序正确且不修改原数组', () => {
  const before = projectList.map(item => item.id)
  assert.deepEqual(sortProjects(projectList, 'asc').map(item => item.name), ['博客', '站点'])
  assert.deepEqual(sortProjects(projectList, 'desc').map(item => item.name), ['站点', '博客'])
  assert.deepEqual(projectList.map(item => item.id), before)
})

test('技能：收集、去重并排序', () => {
  assert.deepEqual(collectSkills(projectList), ['API', 'CSS', 'Vue'])
})
