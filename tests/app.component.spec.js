// 真正把 App.vue 挂载起来渲染一遍。
//
// 这一组和 tests/*.test.mjs 的区别：
//   纯函数测试不需要浏览器，用 node --test 跑；
//   这里要渲染组件、要有 DOM，所以用 vitest + jsdom。
//
// **它能抓住纯函数测试抓不住的问题**：模板写错、setup 里引用了不存在的变量、
// 组件挂载时就抛错——这些都只在真的渲染一次时才暴露。

import { mount } from '@vue/test-utils'
import { createPinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import App from '../src/App.vue'

// 不让测试真的去访问公开 API：既慢又不稳定，还会因为别人的服务器挂了而红。
// **测试不该依赖外部网络**——要测的是我们自己的逻辑。
beforeEach(() => {
  localStorage.clear()
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => ({ ok: true, status: 200, json: async () => ({ results: [], data: [] }) })),
  )
  // jsdom 没有实现播放，不打桩的话会报 "Not implemented: HTMLMediaElement.play"
  window.HTMLMediaElement.prototype.play = vi.fn(async () => {})
  window.HTMLMediaElement.prototype.pause = vi.fn()
})

const mountApp = () => mount(App, { global: { plugins: [createPinia()] } })

describe('星声音乐站界面', () => {
  it('挂载后关键区块都在', () => {
    const wrapper = mountApp()
    const text = wrapper.text()
    for (const part of ['星声音乐站', '播放队列', '搜索', '主持台', '音源状态']) {
      expect(text).toContain(part)
    }
  })

  it('五个音源都渲染成了可切换的按钮', () => {
    const wrapper = mountApp()
    const chips = wrapper.findAll('.chip')
    expect(chips.length).toBe(5)
    // 默认选中第一个
    expect(chips[0].attributes('aria-selected')).toBe('true')
  })

  it('队列为空时播放键是禁用的，不会点了没反应', () => {
    const wrapper = mountApp()
    expect(wrapper.find('.ctl.play').attributes('disabled')).toBeDefined()
    expect(wrapper.text()).toContain('等待第一首歌')
  })

  it('主持台默认不显示，点开才出现', async () => {
    const wrapper = mountApp()
    expect(wrapper.find('.host-actions').exists()).toBe(false)
    await wrapper.findAll('.ghost')[1].trigger('click')
    expect(wrapper.find('.host-actions').exists()).toBe(true)
  })

  it('深色模式切换会写到 html 上，刷新后还在', async () => {
    const wrapper = mountApp()
    await wrapper.find('.ghost.icon').trigger('click')
    expect(document.documentElement.dataset.theme).toBe('dark')
    expect(localStorage.getItem('p5-theme')).toBe('dark')
  })

  it('页面上写明了不抓取不缓存', () => {
    expect(mountApp().text()).toContain('不抓取')
  })

  it('播放模式按钮点一下就换一种，转一圈回到起点', async () => {
    const wrapper = mountApp()
    const button = wrapper.find('.ctl.mode')
    const seen = []
    for (let i = 0; i < 5; i += 1) {
      seen.push(button.text())
      await button.trigger('click')
    }
    // 四种模式各出现一次，第五次回到第一种
    expect(new Set(seen.slice(0, 4)).size).toBe(4)
    expect(seen[4]).toBe(seen[0])
  })

  it('播放模式会记到本地，下次打开还是它', async () => {
    const wrapper = mountApp()
    await wrapper.find('.ctl.mode').trigger('click')
    expect(localStorage.getItem('p5-mode')).toBeTruthy()
  })

  it('空队列时给的是引导而不是一句空话', () => {
    expect(mountApp().text()).toContain('点整行立刻播放')
  })
})
