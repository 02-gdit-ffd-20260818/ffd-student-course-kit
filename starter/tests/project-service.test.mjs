import assert from 'node:assert/strict'
import test from 'node:test'
import { normalizeProject, normalizeProjects } from '../scripts/project-service.mjs'

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
