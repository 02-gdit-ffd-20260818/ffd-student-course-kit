import test from 'node:test'
import assert from 'node:assert/strict'
import { MockMusicAdapter, safeSearch } from '../src/adapters/musicAdapter.js'

test('mock adapter searches and normalizes a playable item', async () => {
  const adapter = new MockMusicAdapter(); const results = await adapter.search('音乐'); const item = adapter.toQueueItem(results[0], '小满')
  assert.equal(results.length, 3); assert.match(item.previewUrl, /^data:audio\/wav;base64,/); assert.equal(item.requester, '小满')
})
test('empty search returns empty and failure is recoverable', async () => {
  const adapter = new MockMusicAdapter(); assert.deepEqual(await adapter.search(''), []); const failed = await safeSearch(adapter, '断网'); assert.equal(failed.retryable, true); assert.deepEqual(failed.items, [])
})
