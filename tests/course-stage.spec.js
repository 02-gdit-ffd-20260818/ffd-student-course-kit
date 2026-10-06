// 配套阶段验收：真实挂载组件，外部音源用可控数据替代，不因第三方断网随机失败。
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia } from 'pinia'
import { nextTick } from 'vue'
import { beforeEach, afterEach, describe, it, expect, vi } from 'vitest'
import App from '../src/App.vue'
import { useQueueStore } from '../src/stores/queue.js'
import { ItunesAdapter, MetingAdapter, SOURCES, safeSearch, searchWithFailover } from '../src/adapters/musicAdapter.js'
import { addUnique, moveItem } from '../src/stores/queueCore.js'
import { checkRequestRate } from '../src/services/requestPolicy.js'

const lesson = Number(process.env.P5_LESSON), stage = Number(process.env.P5_STAGE)
const wrappers = []
const raw = { trackId: 1, trackName: '样例歌曲', artistName: '课堂', artworkUrl100: 'https://example.test/100x100.jpg', previewUrl: 'data:audio/wav;base64,UklGRg==', trackTimeMillis: 100000 }
const item = id => ({ id, title: id, artist: '课堂', previewUrl: raw.previewUrl, duration: 100, requester: '同学', status: 'waiting' })
function mountApp() {
  const pinia = createPinia(), wrapper = mount(App, { global: { plugins: [pinia] } })
  wrappers.push(wrapper)
  return { wrapper, vm: wrapper.vm, queue: useQueueStore(pinia) }
}
beforeEach(() => {
  localStorage.clear()
  vi.stubGlobal('fetch', vi.fn(async () => ({ ok: true, status: 200, json: async () => ({ results: [], data: [] }), text: async () => '' })))
  vi.spyOn(window.HTMLMediaElement.prototype, 'play').mockResolvedValue(undefined)
  vi.spyOn(window.HTMLMediaElement.prototype, 'pause').mockImplementation(() => {})
  window.HTMLElement.prototype.scrollIntoView = vi.fn()
})
afterEach(() => {
  for (const wrapper of wrappers.splice(0)) wrapper.unmount()
  vi.useRealTimers(); vi.restoreAllMocks(); vi.unstubAllGlobals()
})

describe.skipIf(![1, 2, 3].includes(lesson))(`P5 第${lesson}课阶段${stage}`, () => {
  it('阶段参数合法', () => {
    expect(Number.isInteger(stage) && stage >= 0 && stage <= (lesson === 2 ? 5 : 4)).toBe(true)
  })
  it('起点可以点歌，不依赖后面的反馈任务', async () => {
    const { vm, queue } = mountApp()
    await flushPromises()
    expect(() => vm.requestTrack(raw)).not.toThrow()
    await nextTick()
    expect(queue.items).toHaveLength(1)
  })
  it('首次访问使用默认音量，用户主动保存的静音仍然保留', async () => {
    const first = mountApp(); await flushPromises()
    expect(first.vm.volume).toBe(0.8)
    expect(first.wrapper.find('audio').element.volume).toBe(0.8)
    localStorage.setItem('p5-volume', '0')
    const muted = mountApp(); await flushPromises()
    expect(muted.vm.volume).toBe(0)
    expect(muted.wrapper.find('audio').element.volume).toBe(0)
  })
  it('合成音源无匹配结果时提示换关键词，不误报网络故障', async () => {
    const { vm } = mountApp(); await flushPromises()
    vm.sourceKey = 'mock'
    await vm.search('不存在的歌曲关键词')
    expect(vm.searchState).toBe('empty')
    expect(vm.notice).toContain('练习曲')
  })
  if (lesson === 1) {
    it('封面与字段适配按任务变化', () => {
      expect(new ItunesAdapter().toQueueItem(raw).cover).toContain(stage >= 1 ? '400x400' : '100x100')
      expect(new ItunesAdapter().toQueueItem({ trackId: 2 }).cover).toBe('')
      const normalized = MetingAdapter.normalize({ title: '另一套字段', author: '作者', url: 'https://example.test/?id=42&server=netease' })
      expect(normalized.name).toBe(stage >= 2 ? '另一套字段' : '未知曲目')
      expect(normalized.artist).toBe(stage >= 2 ? '作者' : '未知艺术家')
    })
    it('异常封装与换源是两步，不把后续能力当作当前验收', async () => {
      const broken = { constructor: { label: '测试源' }, search: async () => { throw new Error('probe_failure') } }
      if (stage < 3) await expect(safeSearch(broken, '音乐')).rejects.toThrow('probe_failure')
      else expect((await safeSearch(broken, '音乐')).retryable).toBe(true)
      // 精确模拟各网络音源异常；不发送外部网络请求。
      for (const entry of SOURCES.filter(source => source.key !== 'mock')) vi.spyOn(entry.Adapter.prototype, 'search').mockRejectedValue(new Error('offline'))
      if (stage < 3) await expect(searchWithFailover('itunes', '音乐')).rejects.toThrow('offline')
      else {
        const result = await searchWithFailover('itunes', '音乐')
        expect(result.items.length).toBe(stage >= 4 ? 3 : 0)
        expect(result.fellBack).toBe(stage >= 4)
      }
    })
  }
  if (lesson === 2) {
    it('任务1：新队列可保存，并能在重挂载后恢复', async () => {
      const { wrapper, queue } = mountApp()
      await flushPromises()
      queue.add(item('one')); await nextTick()
      expect(localStorage.getItem('p5-queue') !== null).toBe(stage >= 1)
      wrapper.unmount()
      const restored = mountApp(); await flushPromises()
      expect(restored.queue.items.length).toBe(stage >= 1 ? 1 : 0)
    })
    it('任务2和4：纯函数去重、不可变与排序', () => {
      const original = [item('one')]
      const result = addUnique(original, item('one'))
      expect(result.added).toBe(stage < 2)
      expect(original.length).toBe(stage >= 2 ? 1 : 2)
      const list = [item('one'), item('two')], moved = moveItem(list, 0, 1)
      expect(moved[0].id).toBe(stage >= 4 ? 'two' : 'one')
      expect(list[0].id).toBe('one')
      expect(moveItem(list, -1, 1)).toBe(list)
    })
    it('任务3：新加入与重复点歌的提示不同', async () => {
      const { vm, wrapper } = mountApp(); await flushPromises()
      vm.requestTrack(raw); await nextTick()
      expect(wrapper.text().includes('已排到第')).toBe(stage >= 3)
      vm.requestTrack(raw); await nextTick()
      expect(wrapper.text().includes('已经在队列里了')).toBe(stage >= 3)
    })
    it('任务5：同一人限流，到期可恢复', () => {
      const history = new Map()
      expect(checkRequestRate(history, '同学', 0).allowed).toBe(true)
      expect(checkRequestRate(history, '同学', 1).allowed).toBe(true)
      expect(checkRequestRate(history, '同学', 2).allowed).toBe(stage < 5)
      expect(checkRequestRate(history, '同学', 60001).allowed).toBe(true)
    })
  }
  if (lesson === 3) {
    it('任务1：列表循环下播放错误后跳过', async () => {
      const { vm, queue } = mountApp(); await flushPromises()
      queue.add(item('one')); queue.add(item('two')); await nextTick()
      vi.useFakeTimers()
      vm.onError(); await vi.advanceTimersByTimeAsync(801); await nextTick()
      expect(queue.currentIndex).toBe(stage >= 1 ? 1 : 0)
    })
    it('任务1：单曲循环遇到坏曲也要跳到另一首', async () => {
      const { vm, queue } = mountApp(); await flushPromises()
      queue.add(item('one')); queue.add(item('two')); await nextTick()
      vm.playMode = 'one'
      vi.useFakeTimers()
      vm.onError(); await vi.advanceTimersByTimeAsync(801); await nextTick()
      expect(queue.currentIndex).toBe(stage >= 1 ? 1 : 0)
    })
    it('任务2：歌词切换触发滚动', async () => {
      const { vm } = mountApp(); await flushPromises()
      vm.lyrics = [{ time: 0, text: '第一句' }, { time: 10, text: '第二句' }]
      vm.lyricState = 'ready'; await nextTick()
      window.HTMLElement.prototype.scrollIntoView.mockClear()
      vm.currentTime = 11; await nextTick(); await nextTick()
      expect(window.HTMLElement.prototype.scrollIntoView.mock.calls.length > 0).toBe(stage >= 2)
      if (stage >= 2) expect(window.HTMLElement.prototype.scrollIntoView.mock.instances.at(-1).textContent).toContain('第二句')
    })
    it('任务3：输入框中的空格不能触发播放快捷键', async () => {
      const { vm } = mountApp(); await flushPromises()
      const event = { code: 'Space', target: document.createElement('input'), preventDefault: vi.fn() }
      vm.onKey(event)
      expect(event.preventDefault).toHaveBeenCalledTimes(stage >= 3 ? 0 : 1)
    })
    it('任务4：点击比例换算秒数，边界夹取', async () => {
      const { vm } = mountApp(); await flushPromises()
      vm.duration = 100
      vm.seek({ clientX: 60, currentTarget: { getBoundingClientRect: () => ({ left: 10, width: 100 }) } })
      expect(vm.audio.currentTime).toBe(stage >= 4 ? 50 : 0)
      if (stage >= 4) {
        vm.seek({ clientX: -50, currentTarget: { getBoundingClientRect: () => ({ left: 10, width: 100 }) } })
        expect(vm.audio.currentTime).toBe(0)
      }
    })
  }
})
