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
            // ====== P5 第1课 任务 TODO 01（极简单）：把封面换成高清的 ======
      // 页面上看得到的结果：现在封面是 100×100 的小图，放到唱片位置很糊。
      // 做完之后是 400×400，清清楚楚。
      //
      // TODO：String(raw.artworkUrl100 ?? '').replace('100x100', '400x400')
      //
      // 这个技巧**文档里没写**：iTunes 的封面地址里直接带着尺寸，
      // 把它替换掉就能要到任意尺寸。对接第三方接口时，
      // **多看几眼返回的数据，常能发现文档没提的用法。**
      // 注意外面套一层 String(... ?? '')：万一这个字段不存在，
      // 直接 .replace 会报 "Cannot read properties of undefined"。
      // ====================================================
      cover: raw.artworkUrl100 ?? '',
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
    // ============ P5 第1课 任务 TODO 02（简单）：把两套字段名抹平 ============
  // 页面上看得到的结果：现在搜"周杰伦"，结果全是「未知曲目 / 未知艺术家」。
  // 做完之后歌名和歌手都正常显示。
  //
  // 为什么会这样：**两个 meting 镜像返回的字段名不一样**——
  //   api.injahow.cn  给的是  { name, artist }
  //   api.i-meto.com  给的是  { title, author }
  // 我们要从这两个镜像分别拿搜索和播放，所以必须先统一成一种形状。
  //
  // TODO 三件事：
  //   1) 用 raw.name ?? raw.title 同时认两套字段名（artist / author 同理）
  //   2) 用正则从 url 里抠出 id 和 server：/[?&]id=(\w+)/
  //   3) 都取不到时给一个兜底值，**不要让 undefined 流到界面上**
  //
  // 这一步就是**适配器模式最核心的那一下**：
  // 外面的世界五花八门，进了这扇门就只有一种形状。
  // ==============================================================
  static normalize(raw) {
    return { songId: '', server: 'netease', name: '未知曲目', artist: '未知艺术家',
      pic: '', lrc: '', rawUrl: raw.url ?? '', playlist: '' }
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
// ============ P5 第1课 任务 TODO 03（中等）：音源挂了也不能白屏 ============
// 页面上看得到的结果：搜索框里输入 **断网** 两个字（这是课堂用的故障开关，
// 适配器里写好了遇到它就抛错）。
// 现在：整个页面白屏，Console 里一个未捕获异常。
// 做完之后：出现一句人话提示，再搜别的照常能用。
//
// TODO：用 try/catch 把 adapter.search 包起来，**让这个函数永远不抛异常**：
//   成功 → { items: 结果, error: null, source: 音源名 }
//   失败 → { items: [], error: '这个音源暂时不可用…', retryable: true, source: 音源名 }
//
// 两个设计要点：
//   1) **返回形状固定**，调用方只要判断 error 有没有值，不用写 try/catch；
//   2) **给用户看的是人话**，不是 mock_network_error 这种内部代号——
//      内部代号写进日志给开发者看，提示语写给用户看，两者不是一回事。
// ==================================================================
export async function safeSearch(adapter, keyword, options = {}) {
  const items = await adapter.search(keyword, options)
  return { items, error: null, source: adapter.constructor.label }
}

/**
 * 搜索的故障转移：先用用户选的音源，它不行就按顺序试其它的。
 *
 * **这是本项目"一个服务器挂了，另一个顶上"的总入口。**
 * 注意最后一个永远是课堂合成音——它不联网，所以**一定会成功**。
 * 这样界面就永远不会出现"什么都没有"的绝望状态。
 */
export async function searchWithFailover(preferredKey, keyword, options = {}) {
    // ============ P5 第1课 任务 TODO 04（中等）：换源的顺序 ============
  // 页面上看得到的结果：把网线拔了（或者在浏览器 F12 → Network 里选 Offline），
  // 再搜一次——**最后一定会落到「课堂合成音」，出三首歌**，而不是空白。
  //
  // TODO：拼出尝试顺序——用户选的那个排第一，其余的按登记顺序跟在后面：
  //   const order = [preferredKey, ...SOURCES.map(i => i.key).filter(k => k !== preferredKey)]
  //
  // **为什么课堂合成音一定要排在 SOURCES 的最后一个**：
  // 它是浏览器现场用数学公式算出来的声音，**不联网也能响**。
  // 把它放在最后，就保证了"所有网络音源都挂了"时仍然有东西可放。
  //
  // 这叫**优雅降级**：不追求永远最好，只保证永远可用。
  // ==========================================================
  const order = [preferredKey]
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
