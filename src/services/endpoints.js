// 音源端点清单与健康状态。
//
// 为什么单独抽出来：**公开 API 是会挂的，而且每个镜像的能力还不一样**。
// 备课时实测：四个 meting 镜像里两个是坏的（一个 522、一个已下线）；
// 剩下两个活着的，**一个支持关键词搜索、另一个不支持**；
// 更麻烦的是，支持搜索的那个返回的**字段名和另一个完全不同**
// （`title/author` vs `name/artist`），而且它给的播放地址对付费曲目会 404。
//
// 所以最终的办法是「**一个镜像负责搜索、另一个负责播放**」——
// 这不是什么高明设计，是被现实逼出来的。真实项目里这种事很常见。
//
// 这个文件只管"有哪些地址、哪个还活着"，不管怎么解析数据——那是适配器的事。

// ---------- meting：网易云等平台的公开代理 ----------
// 实测结果写在注释里，**以后再有人接手能省一小时**。
export const METING_MIRRORS = {
  // 支持 type=search，字段是 title/author；但它给的播放地址对付费曲目会 404
  search: ['https://api.i-meto.com/meting/api'],
  // 不支持 search，但 type=url 出来的直链很稳，字段是 name/artist
  play: ['https://api.injahow.cn/meting/', 'https://api.i-meto.com/meting/api'],
  // 拉歌单两个都行，排在前面的先试
  playlist: ['https://api.injahow.cn/meting/', 'https://api.i-meto.com/meting/api'],
}

// 搜索兜底：万一搜索镜像也挂了，就退回"把公开歌单整个拉下来再本地筛"。
// 这些歌单本身也是在更新的，不用手工维护曲库。
export const METING_PLAYLISTS = [
  { id: '3778678', name: '热歌榜', server: 'netease' },
  { id: '19723756', name: '飙升榜', server: 'netease' },
  { id: '2809577409', name: '欧美热歌', server: 'netease' },
  { id: '2884035', name: '华语经典', server: 'netease' },
  { id: '2250011882', name: '欧美金曲', server: 'netease' },
]

// meting 支持多个平台，一个平台搜不到可以换另一个
export const METING_SERVERS = ['netease', 'tencent']

// ---------- iTunes：苹果官方的公开搜索接口 ----------
// 不需要密钥，跨域开放，**任何歌手都搜得到**，还自带高清封面。
// 代价是只给 30 秒试听片段（这是苹果官方允许公开使用的那一段）。
export const ITUNES_ENDPOINT = 'https://itunes.apple.com/search'

// ---------- Audius：去中心化的独立音乐平台 ----------
// 完整曲目、无需密钥。曲库以独立音乐人为主，流行歌手不多。
export const AUDIUS_HOSTS = [
  'https://discoveryprovider.audius.co',
  'https://discoveryprovider2.audius.co',
  'https://discoveryprovider3.audius.co',
]

// 每个端点最近一次是成功还是失败，界面上要显示出来。
const health = new Map()

export function markHealth(endpoint, ok, ms, note = '') {
  health.set(endpoint, { ok, at: Date.now(), ms, note })
}

export function healthSnapshot() {
  return [...health.entries()].map(([endpoint, value]) => ({ endpoint, ...value }))
}

/**
 * 带超时的 fetch。
 *
 * **公开 API 最常见的故障不是报错，是「一直不回」。**
 * 不加超时的话，界面会一直转圈，用户只能刷新页面。
 * 这里统一给 8 秒，到点就放弃，换下一个镜像。
 */
export async function fetchJson(url, { timeoutMs = 8000, signal } = {}) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  // 外部想取消（比如用户又输入了新关键词），也要能连带取消这一个
  if (signal) signal.addEventListener('abort', () => controller.abort(), { once: true })
  const started = Date.now()
  try {
    const response = await fetch(url, { signal: controller.signal })
    // fetch 不会因为 4xx/5xx 抛错，必须自己看 ok（项目 4 第 2 课讲过同一个坑）
    if (!response.ok)
      throw Object.assign(new Error(`http_${response.status}`), {
        code: 'HTTP_ERROR',
        status: response.status,
      })
    const data = await response.json()
    markHealth(url.split('?')[0], true, Date.now() - started)
    return data
  } catch (error) {
    markHealth(
      url.split('?')[0],
      false,
      Date.now() - started,
      error.name === 'AbortError' ? '超时' : error.message,
    )
    throw error
  } finally {
    clearTimeout(timer)
  }
}

/** 取文本（歌词用）。和上面一样带超时，但不解析 JSON。 */
export async function fetchText(url, { timeoutMs = 6000 } = {}) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const response = await fetch(url, { signal: controller.signal })
    if (!response.ok) throw new Error(`http_${response.status}`)
    return await response.text()
  } finally {
    clearTimeout(timer)
  }
}

/**
 * 依次试一组地址，第一个成功的就返回。
 *
 * 这就是"一个服务器挂了，另一个顶上"的全部实现——
 * **十几行代码，但它是整个应用能不能用的关键。**
 *
 * @param list   候选地址数组
 * @param build  把一个地址变成完整 URL 的函数
 * @param pick   从返回数据里挑出真正要的部分；返回空数组视为这个源没用
 */
export async function raceMirrors(list, build, pick, options = {}) {
  const failures = []
  for (const base of list) {
    try {
      const data = await fetchJson(build(base), options)
      const items = pick(data)
      if (items && items.length) return { items, endpoint: base, failures }
      failures.push({ endpoint: base, reason: '返回空结果' })
    } catch (error) {
      failures.push({ endpoint: base, reason: error.message })
    }
  }
  // 全都失败了。**注意这里不抛错**，而是返回一个正常形状的结果，
  // 调用方不用写 try/catch 也不会崩——错误处理越靠近发生地越好。
  return { items: [], endpoint: null, failures }
}
