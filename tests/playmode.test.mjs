import test from 'node:test'
import assert from 'node:assert/strict'
import { PLAY_MODES, cyclePlayMode, nextIndexByMode, prevIndexByMode } from '../src/services/playMode.js'

test('四种模式转一圈回到起点', () => {
  let mode = 'order'
  const seen = []
  for (let i = 0; i < PLAY_MODES.length; i += 1) {
    seen.push(mode)
    mode = cyclePlayMode(mode)
  }
  assert.deepEqual(seen, ['order', 'list', 'one', 'shuffle'])
  assert.equal(mode, 'order')
})

test('顺序播放：最后一首放完就停，返回 -1', () => {
  assert.equal(nextIndexByMode('order', 3, 0), 1)
  assert.equal(nextIndexByMode('order', 3, 2), -1)
})

test('顺序播放：手动点下一首会绕回开头，不能让按钮看起来坏了', () => {
  assert.equal(nextIndexByMode('order', 3, 2, false), 0)
})

test('列表循环：最后一首回到第一首', () => {
  assert.equal(nextIndexByMode('list', 3, 2), 0)
})

test('单曲循环：自然放完重复这首，手动点则往后走', () => {
  assert.equal(nextIndexByMode('one', 3, 1, true), 1)
  assert.equal(nextIndexByMode('one', 3, 1, false), 2)
})

test('随机播放：永远不会挑到当前这首', () => {
  // 注入固定随机数，逐个覆盖取值范围
  for (const value of [0, 0.25, 0.5, 0.75, 0.999]) {
    for (let current = 0; current < 5; current += 1) {
      const next = nextIndexByMode('shuffle', 5, current, true, () => value)
      assert.notEqual(next, current, `random=${value} current=${current}`)
      assert.ok(next >= 0 && next < 5)
    }
  }
})

test('随机播放：每个位置都取得到，不会有取不到的死角', () => {
  const hit = new Set()
  for (let i = 0; i < 100; i += 1) hit.add(nextIndexByMode('shuffle', 4, 1, true, () => i / 100))
  assert.deepEqual([...hit].sort(), [0, 2, 3])
})

test('队列只有一首时的四种模式', () => {
  assert.equal(nextIndexByMode('order', 1, 0), -1) // 放完就停
  assert.equal(nextIndexByMode('list', 1, 0), 0)
  assert.equal(nextIndexByMode('one', 1, 0), 0)
  assert.equal(nextIndexByMode('shuffle', 1, 0), 0)
})

test('空队列所有模式都返回 -1，不能崩', () => {
  for (const mode of PLAY_MODES) assert.equal(nextIndexByMode(mode.key, 0, -1), -1)
  assert.equal(prevIndexByMode(0, -1), -1)
})

test('上一首会绕回队尾', () => {
  assert.equal(prevIndexByMode(3, 0), 2)
  assert.equal(prevIndexByMode(3, 2), 1)
})
