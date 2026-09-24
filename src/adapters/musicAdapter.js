// 音源适配器：本课的核心设计。
//
// 问题：这个应用同时接了五种来源——苹果的公开搜索、网易云的公开代理、
// 去中心化的 Audius、维基共享资源的公版录音，还有浏览器现场合成的声音。
// 它们返回的数据**长得完全不一样**：字段名不同、封面地址的拿法不同、
// 有的给整首、有的只给 30 秒。
//
// 如果界面里到处写 if (来源 === 'xxx')，每加一个来源就要翻遍整个项目改一遍。
//
// 适配器模式的做法：先约定一个统一的"插头形状"（下面的 MusicAdapter），
// 每个来源各自实现这个形状。界面只认插头，不关心插头后面接的是什么。
// 换来源 = 换一个适配器对象，界面一行都不用改。
//
// 下面五个适配器，每一个的 search 和 toQueueItem 签名都**完全一样**。
// 这就是适配器模式想要的效果。

import { createToneDataUrl } from '../services/tone.js'
import {
  AUDIUS_HOSTS,
  ITUNES_ENDPOINT,
  METING_MIRRORS,
  METING_PLAYLISTS,
  METING_SERVERS,
  fetchJson,
  raceMirrors,
} from '../services/endpoints.js'

// 统一的插头形状。它自己什么也不做，两个方法都直接抛错——
// 这是故意的：谁继承了却忘记实现，一调用就立刻报错，而不是悄悄返回 undefined。
export class MusicAdapter {
  // 给界面看的名字
  static label = '未命名音源'
  // 一句话说明这个源的特点和代价
  static note = ''
  // 按关键词搜歌，返回这个来源自己格式的原始数据
  async search() {
    throw new Error('not implemented')
  }
  // 把这个来源的原始数据，翻译成播放队列统一认识的格式。
  // "翻译"就是适配器最关键的那一步。
  toQueueItem() {
    throw new Error('not implemented')
  }
}

// 队列里每一首歌的统一形状，五个适配器都要翻译成这个样子：
//   { id, title, artist, cover, previewUrl, lrcUrl, duration,
//     sourceName, license, sourceUrl, full, requester, status }
// full 表示是不是完整曲目（false 就是 30 秒试听）。

const clean = value => String(value ?? '').trim()
const lower = value => clean(value).toLowerCase()

// ============================================================
// 来源一：iTunes 公开搜索 —— 主力
// ============================================================
// 苹果官方接口，不需要密钥，跨域开放，**任何歌手都搜得到**，还自带高清封面。
// 代价：只给 30 秒试听（这正是苹果公开允许直接使用的那一段）。
export class ItunesAdapter extends MusicAdapter {
  static label = '全球曲库'
  static note = '苹果官方公开搜索 · 30 秒试听 · 任何歌手都搜得到'

  async search(keyword, { signal } = {}) {
    const q = clean(keyword)
    if (!q) return []
    if (q === '断网') throw new Error('simulated_network_error')
    const url = `${ITUNES_ENDPOINT}?term=${encodeURIComponent(q)}&media=music&entity=song&limit=24`
    const data = await fetchJson(url, { signal })
    return (data?.results ?? []).filter(item => item.previewUrl)
  }

  toQueueItem(raw, requester = '匿名同学') {
    return {
      id: `itunes-${raw.trackId}`,
      title: raw.trackName,
      artist: raw.artistName,
      album: raw.collectionName ?? '',
      // 接口默认给 100×100 的小图，把地址里的尺寸换掉就能拿到大图。
      // **这类"接口没写在文档里但很实用"的细节，是对接第三方时的常见收获。**
      cover: String(raw.artworkUrl100 ?? '').replace('100x100', '400x400'),
      previewUrl: raw.previewUrl,
      // iTunes 不提供歌词。**字段留着但给空值**，队列项的形状才是统一的——
      // 界面就不用写 if (有没有这个字段)，只要判断它是不是空。
      lrcUrl: '',
      duration: raw.trackTimeMillis ? Math.round(raw.trackTimeMillis / 1000) : 0,
      full: false,
      sourceName: 'Apple iTunes',
      license: '官方公开试听片段（30 秒）',
      sourceUrl: raw.trackViewUrl ?? '',
      requester: clean(requester).slice(0, 12) || '匿名同学',
      status: 'waiting',
    }
  }
}

// ============================================================
// 来源二：meting 公开代理 —— 整首播放
// ============================================================
// 这个适配器是全项目最麻烦、也最值得读的一个，因为它要摆平三件现实问题：
//
//   1. **两个镜像的字段名不一样**：一个给 name/artist，另一个给 title/author。
//      → 归一化（normalize）负责抹平，外面看到的永远是同一种形状。
//   2. **支持搜索的那个镜像，给的播放地址对付费曲目会 404**。
//      → 所以搜索用 A 镜像，播放地址从 B 镜像重新拼。实测这样 8/8 都能播。
//   3. **万一搜索镜像也挂了**，就退回"把公开歌单整个拉下来再本地筛"。
//
// 三层降级：真搜索 → 换平台再搜 → 本地歌单筛选。
// **每一层都是上一层失败时的备胎，而不是重复劳动。**
export class MetingAdapter extends MusicAdapter {
  static label = '流行热歌'
  static note = '网易云 / QQ 音乐公开代理 · 完整曲目 · 搜索与播放走不同镜像'

  // 歌单缓存：所有实例共用一份，切来切去不用重复拉
  static cache = { list: [], loadedAt: 0, endpoint: null }

  // 把不同镜像的字段统一成一种形状。**这就是适配器最核心的那一步。**
  static normalize(raw) {
    const url = raw.url ?? ''
    // 播放地址里带着歌曲 id，把它抠出来，好换一个镜像重新拼播放地址
    const id = String(url).match(/[?&]id=(\w+)/)?.[1] ?? ''
    const server = String(url).match(/[?&]server=(\w+)/)?.[1] ?? 'netease'
    return {
      songId: id,
      server,
      // 两套字段名都认，谁有用谁
      name: raw.name ?? raw.title ?? '未知曲目',
      artist: raw.artist ?? raw.author ?? '未知艺术家',
      pic: raw.pic ?? '',
      lrc: raw.lrc ?? '',
      rawUrl: url,
      playlist: raw.playlist ?? '',
    }
  }

  // 播放地址统一从"播放镜像"重新拼，不直接用搜索结果里给的那个
  static playUrl(item) {
    if (!item.songId) return item.rawUrl
    return `${METING_MIRRORS.play[0]}?server=${item.server}&type=url&id=${item.songId}`
  }

  // 歌词地址同理
  static lrcUrl(item) {
    if (item.lrc) return item.lrc
    if (!item.songId) return ''
    return `${METING_MIRRORS.play[0]}?server=${item.server}&type=lrc&id=${item.songId}`
  }

  /** 第一层：真正的关键词搜索 */
  static async remoteSearch(keyword, { signal } = {}) {
    for (const server of METING_SERVERS) {
      const result = await raceMirrors(
        METING_MIRRORS.search,
        base => `${base}?server=${server}&type=search&id=${encodeURIComponent(keyword)}`,
        data => (Array.isArray(data) ? data : []),
        { signal, timeoutMs: 9000 },
      )
      if (result.items.length) return result.items.map(MetingAdapter.normalize)
    }
    return []
  }

  /** 第三层：把公开歌单整个拉下来，之后在本地筛 */
  static async load({ force = false, signal } = {}) {
    const fresh = Date.now() - MetingAdapter.cache.loadedAt < 10 * 60 * 1000
    if (!force && fresh && MetingAdapter.cache.list.length) return MetingAdapter.cache

    const all = []
    let usedEndpoint = null
    for (const playlist of METING_PLAYLISTS) {
      const result = await raceMirrors(
        METING_MIRRORS.playlist,
        base => `${base}?server=${playlist.server}&type=playlist&id=${playlist.id}`,
        data => (Array.isArray(data) ? data : []),
        { signal, timeoutMs: 9000 },
      )
      if (result.endpoint) usedEndpoint = result.endpoint
      for (const raw of result.items) {
        const item = MetingAdapter.normalize({ ...raw, playlist: playlist.name })
        // 歌单之间会有重复，按歌曲 id 去重
        if (!item.songId || all.some(x => x.songId === item.songId)) continue
        all.push(item)
      }
    }
    MetingAdapter.cache = { list: all, loadedAt: Date.now(), endpoint: usedEndpoint }
    return MetingAdapter.cache
  }

  async search(keyword, { signal } = {}) {
    const q = clean(keyword)
    if (!q) return []
    if (q === '断网') throw new Error('simulated_network_error')

    // 第一、二层：远程搜索（内部已经试过多个平台）
    const remote = await MetingAdapter.remoteSearch(q, { signal })
    if (remote.length) return remote.slice(0, 40)

    // 第三层：本地歌单筛选
    const { list } = await MetingAdapter.load({ signal })
    if (!list.length) throw new Error('meting_unavailable')
    const lowered = q.toLowerCase()
    const hit = list.filter(item => `${item.name}${item.artist}`.toLowerCase().includes(lowered))
    if (!hit.length && ['热歌', '榜单', '流行', 'top'].includes(lowered)) return list.slice(0, 40)
    return hit.slice(0, 40)
  }

  toQueueItem(raw, requester = '匿名同学') {
    const item = raw.songId ? raw : MetingAdapter.normalize(raw)
    return {
      id: `meting-${item.server}-${item.songId || item.name}`,
      title: item.name,
      artist: item.artist,
      album: item.playlist,
      cover: item.pic,
      previewUrl: MetingAdapter.playUrl(item),
      lrcUrl: MetingAdapter.lrcUrl(item),
      duration: 0,
      full: true,
      sourceName: item.server === 'tencent' ? 'QQ 音乐公开代理' : '网易云公开代理',
      license: '经由公开代理直链播放，本站不存储、不缓存、不转存音频',
      sourceUrl: '',
      requester: clean(requester).slice(0, 12) || '匿名同学',
      status: 'waiting',
    }
  }
}

// ============================================================
// 来源三：Audius —— 去中心化平台的完整曲目
// ============================================================
export class AudiusAdapter extends MusicAdapter {
  static label = '独立音乐'
  static note = 'Audius 去中心化平台 · 完整曲目 · 以独立音乐人为主'

  async search(keyword, { signal } = {}) {
    const q = clean(keyword)
    if (!q) return []
    if (q === '断网') throw new Error('simulated_network_error')
    const result = await raceMirrors(
      AUDIUS_HOSTS,
      base => `${base}/v1/tracks/search?query=${encodeURIComponent(q)}&app_name=ffd-p5&limit=20`,
      data => data?.data ?? [],
      { signal },
    )
    if (!result.items.length) throw new Error('audius_unavailable')
    return result.items
  }

  toQueueItem(raw, requester = '匿名同学') {
    const host = AUDIUS_HOSTS[0]
    return {
      id: `audius-${raw.id}`,
      title: raw.title,
      artist: raw.user?.name ?? raw.user?.handle ?? '未知艺术家',
      album: raw.genre ?? '',
      cover: raw.artwork?.['480x480'] ?? raw.artwork?.['150x150'] ?? '',
      previewUrl: `${host}/v1/tracks/${raw.id}/stream?app_name=ffd-p5`,
      lrcUrl: '',
      duration: raw.duration ?? 0,
      full: true,
      sourceName: 'Audius',
      license: raw.license || '由音乐人自行在 Audius 公开发布',
      sourceUrl: raw.permalink ? `https://audius.co${raw.permalink}` : '',
      requester: clean(requester).slice(0, 12) || '匿名同学',
      status: 'waiting',
    }
  }
}

// ============================================================
// 来源四：公版 / CC0 录音
// ============================================================
// 每一首都必须带 license 和 sourceUrl。这不是技术要求，是**作品能不能公开**的前提，
// 少了这两项就等于来源不明。
export const licensedTracks = [
  {
    id: 'commons-fur-elise',
    title: '致爱丽丝',
    artist: 'L. v. Beethoven',
    album: '公版录音',
    previewUrl: 'https://commons.wikimedia.org/wiki/Special:Redirect/file/FurElise.ogg',
    sourceName: 'Wikimedia Commons',
    license: 'CC0 1.0',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:FurElise.ogg',
  },
  {
    id: 'commons-ode-to-joy',
    title: '欢乐颂',
    artist: 'L. v. Beethoven',
    album: '公版录音',
    previewUrl: 'https://commons.wikimedia.org/wiki/Special:Redirect/file/Ode_to_Joy.ogg',
    sourceName: 'Wikimedia Commons',
    license: 'Public Domain Mark 1.0',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Ode_to_Joy.ogg',
  },
  {
    id: 'commons-game-bgm',
    title: 'Game BGM',
    artist: 'Yuyuyunoyuusuke1',
    album: '公版录音',
    previewUrl: 'https://commons.wikimedia.org/wiki/Special:Redirect/file/GameBGM.ogg',
    sourceName: 'Wikimedia Commons',
    license: 'CC0 1.0',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:GameBGM.ogg',
  },
]

export class LicensedMusicAdapter extends MusicAdapter {
  static label = '公版录音'
  static note = '维基共享资源 · 版权已过期或作者放弃权利 · 可放心公开展示'

  async search(keyword) {
    const q = lower(keyword)
    if (!q) return []
    if (q === '断网') throw new Error('simulated_network_error')
    return licensedTracks.filter(
      item =>
        `${item.title}${item.artist}`.toLowerCase().includes(q) ||
        ['音乐', '公版', 'commons', '古典'].includes(q),
    )
  }

  toQueueItem(raw, requester = '匿名同学') {
    // 这个来源的数据格式本来就接近目标格式，展开原对象再补几个字段即可。
    // 对比上面几个适配器要逐字段拼——**每个来源的翻译工作量不一样，
    // 但翻译完之后界面看到的东西完全一致**。
    return {
      ...raw,
      cover: '',
      lrcUrl: '',
      duration: 0,
      full: true,
      requester: clean(requester).slice(0, 12) || '匿名同学',
      status: 'waiting',
    }
  }
}

// ============================================================
// 来源五：课堂合成音 —— 永远可用的最后兜底
// ============================================================
// 三首曲子不是录音文件，而是由 tone.js 用数学公式**实时算出来的**声音。
// 好处是完全没有版权问题，而且**断网、所有公开 API 全挂了，它照样响**。
const mockTracks = [
  { id: 'tone-dawn', title: '晨光练习曲', artist: '课堂合成音', frequency: 392 },
  { id: 'tone-breeze', title: '晚风练习曲', artist: '课堂合成音', frequency: 523 },
  { id: 'tone-stars', title: '星河练习曲', artist: '课堂合成音', frequency: 659 },
]

export class MockMusicAdapter extends MusicAdapter {
  static label = '课堂合成音'
  static note = '浏览器现场算出来的声音 · 不联网也能响 · 零版权风险'

  async search(keyword) {
    const q = lower(keyword)
    if (!q) return []
    // 留一个专门的关键词用来**在课堂上制造失败**：搜"断网"就抛错，
    // 好当场演示容错，不用真的去拔网线。
    if (q === '断网') throw new Error('mock_network_error')
    // 故意等 120 毫秒，模拟真实网络的延迟，让"加载中"的状态能被看见
    await new Promise(resolve => setTimeout(resolve, 120))
    return mockTracks.filter(
      item => `${item.title}${item.artist}`.toLowerCase().includes(q) || q === '音乐',
    )
  }

  toQueueItem(raw, requester = '匿名同学') {
    return {
      id: raw.id,
      title: raw.title,
      artist: raw.artist,
      album: '实时合成',
      cover: '',
      // 这里是关键：把频率现场合成成一段 data:audio/wav，
      // <audio> 标签直接就能播，不需要任何音频文件
      previewUrl: createToneDataUrl(raw.frequency),
      lrcUrl: '',
      duration: 6,
      full: true,
      sourceName: '课堂合成音',
      license: '本项目实时生成，不含第三方录音',
      sourceUrl: '',
      requester: clean(requester).slice(0, 12) || '匿名同学',
      status: 'waiting',
    }
  }
}

// 所有音源登记在这里。界面上的切换按钮就是照着这个数组渲染的——
// **以后加一个新音源，只要在这里加一行，界面自动就有了。**
export const SOURCES = [
  { key: 'itunes', Adapter: ItunesAdapter },
  { key: 'meting', Adapter: MetingAdapter },
  { key: 'audius', Adapter: AudiusAdapter },
  { key: 'licensed', Adapter: LicensedMusicAdapter },
  { key: 'mock', Adapter: MockMusicAdapter },
]

export function createAdapter(key) {
  const found = SOURCES.find(item => item.key === key) ?? SOURCES[0]
  return new found.Adapter()
}

// 统一的容错包装：不管哪个适配器、不管它怎么炸，都返回同样形状的结果，
// 界面只要判断 error 有没有值就行，永远不会因为搜索失败而白屏。
export async function safeSearch(adapter, keyword, options = {}) {
  try {
    const items = await adapter.search(keyword, options)
    return { items, error: null, source: adapter.constructor.label }
  } catch {
    // 注意给用户看的是一句人话，不是 mock_network_error 这种内部代号
    return {
      items: [],
      error: '这个音源暂时不可用，已经帮你换一个试试',
      retryable: true,
      source: adapter.constructor.label,
    }
  }
}

/**
 * 搜索的故障转移：先用用户选的音源，它不行就按顺序试其它的。
 *
 * **这是本项目"一个服务器挂了，另一个顶上"的总入口。**
 * 注意最后一个永远是课堂合成音——它不联网，所以**一定会成功**。
 * 这样界面就永远不会出现"什么都没有"的绝望状态。
 */
export async function searchWithFailover(preferredKey, keyword, options = {}) {
  const order = [
    preferredKey,
    ...SOURCES.map(item => item.key).filter(key => key !== preferredKey),
  ]
  const tried = []
  for (const key of order) {
    const adapter = createAdapter(key)
    const result = await safeSearch(adapter, keyword, options)
    if (result.items.length) {
      return { ...result, key, adapter, tried, fellBack: key !== preferredKey }
    }
    tried.push({ key, label: adapter.constructor.label, reason: result.error ?? '没有匹配结果' })
    // 用户选的源只是"没搜到"而不是"挂了"，就不要自作主张换源——
    // 换了反而让人困惑（明明选的是公版录音，结果出来一堆流行歌）
    if (!result.error) break
  }
  return { items: [], error: null, key: preferredKey, tried, fellBack: false }
}
