import assert from 'node:assert/strict'
import test from 'node:test'
import { nextTheme, readTheme, writeTheme } from '../src/services/themeService.js'

test('正常：读取、切换并保存主题', () => {
  const values = new Map([['p1-theme', 'dark']])
  const storage = {
    getItem: key => values.get(key),
    setItem: (key, value) => values.set(key, value),
  }
  assert.equal(readTheme(storage), 'dark')
  assert.equal(nextTheme('dark'), 'light')
  assert.deepEqual(writeTheme(storage, 'light'), { theme: 'light', saved: true })
  assert.equal(values.get('p1-theme'), 'light')
})

test('边界：未知主题回退为浅色', () => {
  assert.equal(readTheme({ getItem: () => 'neon' }), 'light')
  assert.equal(nextTheme('neon'), 'dark')
})

test('失败：存储不可用时页面仍可继续', () => {
  const brokenStorage = {
    getItem: () => { throw new Error('blocked') },
    setItem: () => { throw new Error('blocked') },
  }
  assert.equal(readTheme(brokenStorage), 'light')
  assert.deepEqual(writeTheme(brokenStorage, 'dark'), { theme: 'dark', saved: false })
})
