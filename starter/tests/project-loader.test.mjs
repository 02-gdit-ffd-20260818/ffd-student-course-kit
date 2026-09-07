import assert from 'node:assert/strict'
import test from 'node:test'
import { loadProjects } from '../scripts/project-loader.mjs'

test('正常：读取项目数组', async () => {
  const fetcher = async () => ({ ok: true, json: async () => [{ id: 1 }] })
  assert.deepEqual(await loadProjects(fetcher, '/projects.json'), {
    state: 'success', items: [{ id: 1 }], error: null,
  })
})

test('边界：空数组得到 empty 状态', async () => {
  const fetcher = async () => ({ ok: true, json: async () => [] })
  assert.deepEqual(await loadProjects(fetcher, '/projects.json'), {
    state: 'empty', items: [], error: null,
  })
})

test('失败：HTTP 错误转为可恢复 error 状态', async () => {
  const fetcher = async () => ({ ok: false, status: 503 })
  assert.deepEqual(await loadProjects(fetcher, '/projects.json'), {
    state: 'error', items: [], error: 'HTTP 503',
  })
})
