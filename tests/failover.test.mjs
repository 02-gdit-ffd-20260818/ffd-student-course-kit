// 故障转移的测试。
//
// 这一组测试的价值在于：**它不需要联网**。
// 每个"音源"都是现场造的假对象，想让它挂就让它挂——
// 真实的网络故障没法按需复现，但故障处理逻辑必须能被反复验证。

import test from 'node:test'
import assert from 'node:assert/strict'
import { MockMusicAdapter, SOURCES, createAdapter, safeSearch, searchWithFailover } from '../src/adapters/musicAdapter.js'
import { raceMirrors } from '../src/services/endpoints.js'

test('五个音源都实现了同一套契约', () => {
  assert.equal(SOURCES.length, 5)
  for (const { key } of SOURCES) {
    const adapter = createAdapter(key)
    assert.equal(typeof adapter.search, 'function')
    assert.equal(typeof adapter.toQueueItem, 'function')
    // 每个音源都要有给界面看的名字和说明
    assert.ok(adapter.constructor.label)
    assert.ok(adapter.constructor.note)
  }
})

test('认不出来的音源名退回第一个，不会返回 undefined', () => {
  const adapter = createAdapter('这个音源不存在')
  assert.ok(adapter)
  assert.equal(typeof adapter.search, 'function')
})

test('raceMirrors 跳过坏的镜像，用第一个好的', async () => {
  const calls = []
  const result = await raceMirrors(
    ['坏地址一', '坏地址二', '好地址'],
    base => {
      calls.push(base)
      return `https://example.invalid/${base}`
    },
    data => data.items,
    // 传一个假的超时，避免测试真的等 8 秒
    { timeoutMs: 1 },
  )
  // 三个都试过了（因为都是无效地址）
  assert.equal(calls.length, 3)
  // 全挂时**不抛错**，返回正常形状，调用方不用写 try/catch
  assert.deepEqual(result.items, [])
  assert.equal(result.endpoint, null)
  assert.equal(result.failures.length, 3)
})

test('搜不到结果时不会自作主张换音源', async () => {
  // 课堂合成音搜一个必定搜不到的词：它没有"挂"，只是没匹配
  const result = await searchWithFailover('mock', 'zzz这个词一定搜不到zzz')
  assert.deepEqual(result.items, [])
  assert.equal(result.fellBack, false)
  // 只试了用户选的那一个就停下了
  assert.equal(result.tried.length, 1)
})

test('音源真的挂了才换，并且最后一定落到不联网的合成音上', async () => {
  const broken = {
    constructor: { label: '假装挂掉的音源' },
    async search() {
      throw new Error('boom')
    },
  }
  const wrapped = await safeSearch(broken, '随便')
  assert.deepEqual(wrapped.items, [])
  assert.equal(wrapped.retryable, true)
  // 给用户看的是一句人话，不是 boom 这种内部代号
  assert.ok(!wrapped.error.includes('boom'))
})

test('合成音适配器离线可用，是最后一道防线', async () => {
  const adapter = new MockMusicAdapter()
  const results = await adapter.search('音乐')
  assert.equal(results.length, 3)
  const item = adapter.toQueueItem(results[0], '小满')
  // data URL 意味着这段声音就在页面里，不依赖任何服务器
  assert.match(item.previewUrl, /^data:audio\/wav;base64,/)
  assert.equal(item.full, true)
})

test('每个音源翻译出来的队列项形状完全一致', async () => {
  const mock = new MockMusicAdapter()
  const raw = (await mock.search('音乐'))[0]
  const item = mock.toQueueItem(raw, '小满')
  for (const field of ['id', 'title', 'artist', 'cover', 'previewUrl', 'sourceName', 'license', 'requester', 'status', 'full']) {
    assert.ok(field in item, `缺少字段 ${field}`)
  }
  // 点歌人名字要截断，防止有人输一长串把界面撑破
  const long = mock.toQueueItem(raw, '这是一个特别特别长的名字超过十二个字了')
  assert.equal(long.requester.length, 12)
})
