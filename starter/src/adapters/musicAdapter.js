import { createToneDataUrl } from '../services/tone.js'

export class MusicAdapter {
  async search() { throw new Error('not implemented') }
  toQueueItem() { throw new Error('not implemented') }
}

const mockTracks = [
  { id: 'tone-dawn', title: '晨光练习曲', artist: '课堂合成音', frequency: 392 },
  { id: 'tone-breeze', title: '晚风练习曲', artist: '课堂合成音', frequency: 523 },
  { id: 'tone-stars', title: '星河练习曲', artist: '课堂合成音', frequency: 659 }
]

export class MockMusicAdapter extends MusicAdapter {
  async search(keyword) {
    const clean = String(keyword || '').trim().toLowerCase()
    if (!clean) return []
    if (clean === '断网') throw new Error('mock_network_error')
    await new Promise((resolve) => setTimeout(resolve, 120))
    return mockTracks.filter((item) => `${item.title}${item.artist}`.toLowerCase().includes(clean) || clean === '音乐')
  }
  toQueueItem(raw, requester = '匿名同学') {
    return { id: raw.id, title: raw.title, artist: raw.artist, requester: requester.slice(0, 12), previewUrl: createToneDataUrl(raw.frequency), sourceName: '课堂合成音', license: '本项目实时生成，不含第三方录音', sourceUrl: '', status: 'waiting' }
  }
}

export async function safeSearch(adapter, keyword) {
  try { return { items: await adapter.search(keyword), error: null } } catch { return { items: [], error: '音乐来源暂不可用，请稍后重试', retryable: true } }
}
