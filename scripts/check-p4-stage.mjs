// 用法：node scripts/check-p4-stage.mjs . 1 6
// 检查 Vue 渲染或本机 HTTP，使用临时存储与模型替身，不读取个人 .env。
import assert from 'node:assert/strict'
import { readFile, mkdtemp } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import { createRequire } from 'node:module'
import vm from 'node:vm'
const [directory, lessonArg, stageArg] = process.argv.slice(2)
assert.ok(directory, '请传入工程根目录、课次和阶段，例如 . 1 6')
const root = path.resolve(directory)
const lesson = Number(lessonArg), stage = Number(stageArg)
assert.ok([1, 2, 3].includes(lesson) && Number.isInteger(stage) && stage >= 0 && stage <= (lesson === 1 ? 6 : 5), '请传入有效的课次和已完成的任务数')
const load = file => import(pathToFileURL(path.join(root, file)).href)
const nativeFetch = globalThis.fetch
if (lesson === 1) {
  const require = createRequire(path.join(root, 'package.json'))
  const { createServer } = await import(pathToFileURL(require.resolve('vite')).href)
  const { createSSRApp } = require('vue')
  const { renderToString } = require('vue/server-renderer')
  const vite = await createServer({ root, server: { middlewareMode: true }, appType: 'custom', optimizeDeps: { noDiscovery: true, include: [] } })
  try {
    const { default: App } = await vite.ssrLoadModule('/src/App.vue')
    const html = (await renderToString(createSSRApp(App))).replace(/<!--[\s\S]*?-->/g, '')
    assert.equal(html.includes('class="glyph"'), stage >= 1)
    assert.equal(/<em>[^<]+<\/em>/.test(html), stage >= 2)
    assert.equal(html.includes('class="count"'), stage >= 3)
    assert.equal(/class="pick"[^>]*aria-pressed="true"/.test(html), stage >= 4)
    const { findTheme, themes } = await load('src/data/themes.js')
    assert.equal(findTheme(themes[1].id).id, stage >= 5 ? themes[1].id : themes[0].id)
    assert.equal(findTheme('missing').id, themes[0].id)
    const source = await readFile(path.join(root, 'src/App.vue'), 'utf8')
    const line = source.split('\n').find(line => line.startsWith('const canSubmit = computed('))
    for (const [receiver, status, expected] of [[' ', 'idle', false], ['同学', 'loading', false], ['同学', 'idle', true]]) {
      const result = vm.runInNewContext(line + '\ncanSubmit', { computed: fn => fn(), form: { receiver }, status: { value: status } })
      assert.equal(result, stage >= 6 ? expected : true)
    }
  } finally { await vite.close() }
} else {
  const { createApp } = await load('server/app.js')
  const storePath = await mkdtemp(path.join(tmpdir(), 'ffd-p4-cards-'))
  const app = createApp({ env: { MINIMAX_API_KEY: lesson === 2 ? 'test-not-a-real-key' : '', CARD_STORAGE_PATH: storePath, RATE_LIMIT_MAX: '200' } })
  const server = app.listen(0, '127.0.0.1')
  await new Promise(resolve => server.once('listening', resolve))
  const base = `http://127.0.0.1:${server.address().port}`
  const request = async (route, data) => {
    const response = await nativeFetch(base + route, data ? { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) } : {})
    return { status: response.status, text: await response.text() }
  }
  try {
    if (lesson === 2) {
      const { normalizeCardInput } = await load('server/prompt.js')
      const input = { receiver: '林老师', occasion: '感谢', tone: '真诚', details: '' }
      globalThis.fetch = async () => { throw Object.assign(new Error('test timeout'), { name: 'AbortError' }) }
      const bad = await request('/api/greeting', { ...input, occasion: '不存在的场景' })
      assert.equal(bad.status, stage >= 1 ? 400 : 200)
      assert.equal(normalizeCardInput({ ...input, receiver: '  林   老师  <b> ' }).receiver, stage >= 2 ? '林 老师 b' : '  林   老师  <b> ')
      const fallback = JSON.parse((await request('/api/greeting', input)).text)
      assert.equal(fallback.mode, 'fallback')
      assert.equal(fallback.reason, stage >= 3 ? 'ai_timeout' : 'ai_unavailable')
      const { generateWithMiniMax, cleanOutput } = await load('src/shared/minimax.js')
      await assert.rejects(generateWithMiniMax(input, { apiKey: 'test', fetchImpl: async () => new Response('{}', { status: 500 }) }), error => error.code === (stage >= 4 ? 'UPSTREAM_ERROR' : 'UPSTREAM_EMPTY'))
      assert.equal(cleanOutput('祝福语：“愿你平安”'), stage >= 5 ? '愿你平安' : '祝福语：“愿你平安”')
    } else {
      const { candidateSlugs, shortCode, isSafeSlug } = await load('src/shared/slug.js')
      const candidates = candidateSlugs('林老师', new Date(2026, 8, 22))
      assert.equal(candidates[0], stage >= 1 ? '林老师-20260922' : 'card')
      assert.equal(shortCode(3).length, stage >= 2 ? 3 : 0)
      assert.equal(isSafeSlug('a/b'), stage >= 4 ? false : true)
      const data = { receiver: '林老师', occasion: '感谢', tone: '真诚', message: '<b>祝福</b>', themeId: 'moon', extra: '不应保存' }
      const first = await request('/api/card', data)
      assert.equal(first.status, 200)
      const slug = JSON.parse(first.text).slug
      const stored = JSON.parse((await request('/api/card?slug=' + encodeURIComponent(slug))).text).card
      assert.equal(Object.hasOwn(stored, 'extra'), stage < 3)
      const page = await request('/c/' + encodeURIComponent(slug))
      assert.equal(page.status, 200)
      assert.equal(page.text.includes('&lt;b&gt;祝福&lt;/b&gt;'), stage >= 5)
      assert.equal((await request('/api/card?slug=a%2Fb')).status, stage >= 4 ? 400 : 404)
      const second = await request('/api/card', { ...data, message: '第二张' })
      assert.equal(second.status, stage >= 1 ? 200 : 409)
      assert.equal(JSON.parse((await request('/api/card?slug=' + encodeURIComponent(slug))).text).card.message, data.message)
      if (stage === 5) {
        // 模拟平台原子写入竞争：查询为空，但写入被另一请求抢先占位。
        const { default: cardHandler } = await load('netlify/functions/card.js')
        let attempts = 0
        const atomicStore = {
          get: async () => null,
          setJSON: async (_key, _value, options) => {
            assert.equal(options.onlyIfNew, true)
            return { modified: ++attempts > 1 }
          },
        }
        const atomicResponse = await cardHandler(new Request(base + '/api/card', {
          method: 'POST', body: JSON.stringify(data), headers: { 'Content-Type': 'application/json' },
        }), { cardStore: atomicStore })
        assert.equal(atomicResponse.status, 200)
        assert.equal(attempts, 2)
        const responses = await Promise.all(Array.from({ length: 5 }, () => request('/api/card', data)))
        assert.ok(responses.every(r => r.status === 200))
        assert.equal(new Set(responses.map(r => JSON.parse(r.text).slug)).size, 5)
        const { createFileCardStore } = await load('server/card-store.js')
        assert.equal((await createFileCardStore(storePath).get(slug)).message, data.message)
      }
    }
  } finally {
    globalThis.fetch = nativeFetch
    server.closeAllConnections()
    await new Promise(resolve => server.close(resolve))
  }
}
console.log(`[PASS] P4 第${lesson}课阶段${stage}：${lesson === 1 ? 'Vue SSR渲染及派生状态' : '真实课堂接口与隔离存储'}。`)
