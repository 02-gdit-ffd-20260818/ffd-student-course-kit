import { describe, expect, it } from 'vitest'
import { LicensedMusicAdapter, licensedTracks } from '../src/adapters/musicAdapter.js'
describe('licensed adapter', () => {
  it('keeps source and license metadata on every track', () => { for (const track of licensedTracks) { expect(track.sourceUrl).toMatch(/^https:\/\/commons\.wikimedia\.org\/wiki\/File:/); expect(track.license).toBeTruthy(); expect(track.previewUrl).toMatch(/^https:/) } })
  it('normalizes public tracks into the queue contract', async () => { const adapter = new LicensedMusicAdapter(); const [raw] = await adapter.search('音乐'); const item = adapter.toQueueItem(raw,'阿青'); expect(item.requester).toBe('阿青'); expect(item.status).toBe('waiting') })
})
