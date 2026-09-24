// 歌词解析与同步的测试。
//
// 这一组是**纯函数测试的典范**：不联网、不渲染、不播歌，
// 传一段文本进去、传一个时间进去，断言结果。毫秒级跑完。

import test from 'node:test'
import assert from 'node:assert/strict'
import { activeLineIndex, parseLrc, parseLrcMeta } from '../src/services/lyrics.js'

const SAMPLE = `[ti:测试歌曲]
[ar:课堂乐队]
[00:00.00] 作词 : 某某
[00:14.85]冷空气的气味
[00:17.28]掺杂些许心碎
[00:20.00][01:30.00]副歌重复这一句
[00:25.00]
[01:00.5]半拍写法也要认`

test('解析出时间和文字，元信息行不算歌词', () => {
  const lines = parseLrc(SAMPLE)
  // [ti:] [ar:] 不该进来
  assert.ok(lines.every(line => !line.text.startsWith('ti:')))
  assert.equal(lines[1].text, '冷空气的气味')
  assert.equal(lines[1].time, 14.85)
})

test('一行有多个时间戳时要拆成多条，并按时间排好', () => {
  const lines = parseLrc(SAMPLE)
  const repeats = lines.filter(line => line.text === '副歌重复这一句')
  assert.equal(repeats.length, 2)
  assert.equal(repeats[0].time, 20)
  assert.equal(repeats[1].time, 90)
  // 整体是升序的
  for (let i = 1; i < lines.length; i += 1) assert.ok(lines[i].time >= lines[i - 1].time)
})

test('时间戳后面是空的（间奏）要丢掉，否则界面上出现空行', () => {
  assert.ok(parseLrc(SAMPLE).every(line => line.text.length > 0))
})

test('两位和一位的百分秒都要认', () => {
  assert.equal(parseLrc('[01:00.5]半拍')[0].time, 60.5)
  assert.equal(parseLrc('[01:00.50]半拍')[0].time, 60.5)
  assert.equal(parseLrc('[01:00.500]半拍')[0].time, 60.5)
})

test('空输入和坏输入都不能炸', () => {
  assert.deepEqual(parseLrc(''), [])
  assert.deepEqual(parseLrc(null), [])
  assert.deepEqual(parseLrc('这一行没有时间戳'), [])
})

test('按时间找到当前是第几句', () => {
  const lines = parseLrc(SAMPLE)
  // 还没唱到第一句
  assert.equal(activeLineIndex(lines, 0), 0) // 00:00 那一行就是第一条
  assert.equal(lines[activeLineIndex(lines, 15)].text, '冷空气的气味')
  assert.equal(lines[activeLineIndex(lines, 17.3)].text, '掺杂些许心碎')
  // 时间超过最后一句，停在最后一句
  assert.equal(activeLineIndex(lines, 9999), lines.length - 1)
})

test('时间早于第一句时返回 -1，界面据此不高亮任何一行', () => {
  const lines = parseLrc('[00:10.00]第一句')
  assert.equal(activeLineIndex(lines, 3), -1)
})

test('空歌词也要安全', () => {
  assert.equal(activeLineIndex([], 10), -1)
})

test('二分查找和逐个遍历结果必须一致', () => {
  // 造 500 行，逐个时间点比对两种算法——
  // **重构成二分之后，正确性由这条测试兜底。**
  const lines = Array.from({ length: 500 }, (_, i) => ({ time: i * 2, text: `第${i}句` }))
  const naive = (list, time) => {
    let found = -1
    for (let i = 0; i < list.length; i += 1) if (list[i].time <= time) found = i
    return found
  }
  for (const time of [0, 1, 2, 3.5, 199, 500.5, 998, 999, 5000]) {
    assert.equal(activeLineIndex(lines, time), naive(lines, time), `time=${time}`)
  }
})

test('元信息能取出来', () => {
  const meta = parseLrcMeta(SAMPLE)
  assert.equal(meta.ti, '测试歌曲')
  assert.equal(meta.ar, '课堂乐队')
})
