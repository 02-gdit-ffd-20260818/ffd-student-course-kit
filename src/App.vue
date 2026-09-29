<script setup>
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { MetingAdapter, SOURCES, createAdapter, searchWithFailover } from './adapters/musicAdapter.js'
import { useQueueStore } from './stores/queue.js'
import { checkRequestRate } from './services/requestPolicy.js'
import { fetchText, healthSnapshot } from './services/endpoints.js'
import { activeLineIndex, parseLrc } from './services/lyrics.js'
import { PLAY_MODES, cyclePlayMode, describeMode, nextIndexByMode, prevIndexByMode } from './services/playMode.js'

/* ---------------- 状态 ---------------- */
const sourceKey = ref('itunes')
const keyword = ref('')
const requester = ref('')
const results = ref([])
const searchState = ref('idle') // idle | loading | success | empty | error
const notice = ref('搜一位你喜欢的歌手，比如 Lady Gaga、周杰伦、五月天。')
const searchedSource = ref('')
const fellBack = ref(false)

const queue = useQueueStore()
const audio = ref(null)
const currentTime = ref(0)
const duration = ref(0)
const volume = ref(0.8)
const muted = ref(false)
const playMode = ref('list') // order | list | one | shuffle
const hostMode = ref(false)
const theme = ref('light')
const showHealth = ref(false)
const history = ref([])
const requestHistory = new Map()
let searchToken = 0

/* 歌词 */
const lyrics = ref([])
const lyricState = ref('none') // none | loading | ready | missing
let lyricToken = 0

const HOT_WORDS = ['Lady Gaga', '周杰伦', '五月天', 'Taylor Swift', '林俊杰', '热歌', '古典']

const sourceList = SOURCES.map(item => ({
  key: item.key,
  label: item.Adapter.label,
  note: item.Adapter.note,
}))
const currentSource = computed(() => sourceList.find(item => item.key === sourceKey.value))

const stateLabel = computed(
  () =>
    ({ idle: '待播放', loading: '缓冲中', playing: '播放中', paused: '已暂停', error: '播放失败' })[
      queue.playerState
    ],
)
const progress = computed(() => (duration.value ? (currentTime.value / duration.value) * 100 : 0))
const modeInfo = computed(() => describeMode(playMode.value))
// 队列总时长：只有已知时长的才算得出来，所以顺便说明还有几首没读到时长
const queueStats = computed(() => {
  const known = queue.items.filter(item => item.duration > 0)
  const total = known.reduce((sum, item) => sum + item.duration, 0)
  return { total, known: known.length, unknown: queue.items.length - known.length }
})
const health = computed(() => healthSnapshot())

const activeLine = computed(() => activeLineIndex(lyrics.value, currentTime.value))
const lyricBox = ref(null)
let activeLineEl = null

// 当前这一句变了，就把它滚到可视区中间。
// **注意 block: 'center' 而不是默认的 'start'**：歌词滚到最顶上很难读，
// 人眼习惯盯着中间那一行。
// ============ P5 第3课 任务 TODO 02（极简单）：歌词自动滚动 ============
// 页面上看得到的结果：当前那句已经高亮了，但**唱到后面就看不见了**，
// 要自己手动往下滚。做完之后它自己滚，当前句一直在中间。
//
// TODO：
//   watch(activeLine, () => {
//     if (!activeLineEl || !lyricBox.value) return
//     activeLineEl.scrollIntoView({ block: 'center', behavior: 'smooth' })
//   })
//
// **`block: 'center'` 是关键**。默认值是 'start'，那样当前句会滚到最顶上——
// 人眼习惯盯着中间那一行，滚到顶上反而不好读。**这一个参数的差别，体验差很多。**
//
// `behavior: 'smooth'` 是平滑滚动。注意样式表里配套写了
// @media (prefers-reduced-motion: reduce) 把它关掉——
// **有些人对动效敏感，系统里设置了"减少动态效果"，我们要尊重这个设置。**
// ==========================================================

async function loadLyrics(track) {
  const token = ++lyricToken
  lyrics.value = []
  if (!track?.lrcUrl) {
    lyricState.value = 'none'
    return
  }
  lyricState.value = 'loading'
  try {
    const text = await fetchText(track.lrcUrl)
    if (token !== lyricToken) return
    const parsed = parseLrc(text)
    lyrics.value = parsed
    lyricState.value = parsed.length ? 'ready' : 'missing'
  } catch {
    if (token !== lyricToken) return
    lyricState.value = 'missing'
  }
}

// 点歌词那一行，直接跳到那个时间点——这是播放器里最实用的小功能之一
function seekToLine(line) {
  if (audio.value && Number.isFinite(line.time)) {
    audio.value.currentTime = line.time
    if (queue.playerState !== 'playing') playCurrent()
  }
}

function fmt(seconds) {
  if (!Number.isFinite(seconds) || seconds <= 0) return '0:00'
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${String(s).padStart(2, '0')}`
}

/* ---------------- 搜索 ---------------- */
async function search(word) {
  if (word !== undefined) keyword.value = word
  const clean = keyword.value.trim()
  if (!clean) {
    results.value = []
    searchState.value = 'empty'
    notice.value = '先输入一个关键词'
    return
  }
  const token = ++searchToken
  searchState.value = 'loading'
  fellBack.value = false

  const response = await searchWithFailover(sourceKey.value, clean)
  // 用户可能已经又搜了别的，旧请求的结果直接丢掉。
  // **不做这一步的话，慢的那次请求回来会把新结果覆盖掉**，这叫竞态。
  if (token !== searchToken) return

  results.value = response.items
  searchedSource.value = response.adapter?.constructor.label ?? ''
  fellBack.value = Boolean(response.fellBack)

  if (response.items.length) {
    searchState.value = 'success'
    notice.value = response.fellBack
      ? `「${currentSource.value.label}」这会儿不可用，已自动换成「${searchedSource.value}」，找到 ${response.items.length} 首`
      : `在「${searchedSource.value}」找到 ${response.items.length} 首`
    if (response.fellBack) sourceKey.value = response.key
    remember(clean)
  } else if (response.tried.some(item => item.reason)) {
    searchState.value = 'error'
    notice.value = '几个音源都没响应，试试「课堂合成音」，它不联网也能用'
  } else {
    searchState.value = 'empty'
    notice.value = '没有找到，换个关键词试试'
  }
}

function remember(word) {
  history.value = [word, ...history.value.filter(item => item !== word)].slice(0, 8)
  localStorage.setItem('p5-history', JSON.stringify(history.value))
}

function switchSource(key) {
  sourceKey.value = key
  if (keyword.value.trim()) search()
}

/* ---------------- 点歌 ---------------- */
const titleOf = track => track.title ?? track.trackName ?? track.name ?? '这首歌'

/**
 * 点歌。playNow 为真时**立刻播这一首**，否则排到队尾。
 *
 * 为什么要分两种：之前只有"加入队列"一个动作，
 * 队列里已经有歌时点一首新的，**界面上什么动静都没有**，
 * 用户会以为坏了。现在点整行就是立刻播，点 ＋ 才是排队。
 */
function requestTrack(track, playNow = false) {
  if (queue.locked) {
    notice.value = '主持人已暂停点歌'
    return
  }
  const rate = checkRequestRate(requestHistory, requester.value)
  if (!rate.allowed) {
    notice.value = `${rate.key} 点歌过于频繁，${Math.ceil(rate.retryAfterMs / 1000)} 秒后再试`
    return
  }
    // ============ P5 第2课 任务 TODO 03（简单）：点歌要有反馈 ============
  // 页面上看得到的结果：现在点搜索结果，**界面上什么动静都没有**，
  // 用户会以为坏了。做完之后：点整行立刻播放，点 ＋ 提示"已排到第 N 位"。
  //
  // 这个任务没有新语法，但它是**产品意识**的训练：
  // **每一次点击都必须有看得见的回应**，哪怕只是一行字。
  //
  // TODO：
  //   1) 用适配器把原始数据翻译成队列项，加进队列
  //   2) 用 findIndex 找出它排在第几位
  //   3) playNow 为真 → 直接 playAt(index) 播它
  //      否则 → 提示排在第几位；已经在队列里也要说清楚（连位置一起说）
  //
  // 想一想：为什么"已经在队列里了"也要告诉用户位置？
  // 因为用户下一个动作多半是去队列里找它——**直接告诉他在哪，省一次翻找。**
  // ==========================================================
  const adapter = createAdapter(sourceKey.value)
  const item = adapter.toQueueItem(track, requester.value || '匿名同学')
  queue.add(item)
  const index = 0
  // 队列本来是空的，点第一首就直接开播，省掉一次点击
  if (added && queue.items.length === 1) playCurrent()
}

/** 把这一页搜索结果全部排进队列。课堂上"先把歌都备好再放"很常用。 */
function addAll() {
  if (queue.locked) {
    notice.value = '主持人已暂停点歌'
    return
  }
  const adapter = createAdapter(sourceKey.value)
  const before = queue.items.length
  // 一次只加 10 首：**不做限制的话一键就能把别人的队列淹掉**
  for (const track of results.value.slice(0, 10)) {
    queue.add(adapter.toQueueItem(track, requester.value || '匿名同学'))
  }
  const added = queue.items.length - before
  notice.value = added ? `加了 ${added} 首到队列` : '这些歌都已经在队列里了'
  if (before === 0 && queue.items.length) playCurrent()
}

/* ---------------- 播放 ---------------- */
async function playCurrent() {
  if (!queue.current) return
  queue.playerState = 'loading'
  await nextTick()
  try {
    await audio.value.play()
  } catch {
    queue.playerState = 'error'
    notice.value = '浏览器拦住了自动播放，点一下播放键即可'
  }
}

function togglePlay() {
  if (!queue.current) return
  if (queue.playerState === 'playing') audio.value?.pause()
  else playCurrent()
}

async function playAt(index) {
  queue.currentIndex = index
  await nextTick()
  playCurrent()
}

async function playNext(auto = false) {
  const index = nextIndexByMode(playMode.value, queue.items.length, queue.currentIndex, auto)
  if (index === -1) {
    // 顺序播放放到底了：停下来，但不要把队列清掉
    queue.playerState = 'paused'
    if (auto) notice.value = '队列播完了。想循环的话，把播放模式切成「列表循环」'
    return
  }
  // 单曲循环碰上"就是这一首"：直接从头再放，不用重新加载资源
  if (index === queue.currentIndex && audio.value) {
    audio.value.currentTime = 0
    playCurrent()
    return
  }
  playAt(index)
}

async function playPrev() {
  if (!queue.items.length) return
  // 播了 3 秒以上就先回到本曲开头，这是播放器的通用习惯
  if (currentTime.value > 3 && audio.value) {
    audio.value.currentTime = 0
    return
  }
  playAt(prevIndexByMode(queue.items.length, queue.currentIndex))
}

// ============ P5 第3课 任务 TODO 04（中等）：进度条要能点着跳 ============
// 页面上看得到的结果：进度条现在只能看，点它没反应。
// 做完之后点哪里跳到哪里。
//
// 要解决的问题是：**用户点的是像素位置，播放器要的是秒数**。
//
// TODO：
//   1) event.currentTarget.getBoundingClientRect() 拿到进度条在屏幕上的位置和宽度
//   2) (event.clientX - box.left) / box.width  算出点击位置占全长的比例
//   3) 用 Math.min(1, Math.max(0, ...)) 把比例夹在 0~1 之间
//   4) audio.currentTime = 比例 × 总时长
//
// 第 3 步不能省：**用户可能点在进度条边缘之外一两个像素**，
// 算出来是 -0.01 或 1.02，直接赋值给 currentTime 会报错或跳到奇怪的地方。
//
// 这个"夹取"的写法很常用，记住这个形状：
//   Math.min(上限, Math.max(下限, 值))
// ================================================================
function seek() {
  /* 待实现 */
}

function onTimeUpdate(event) {
  currentTime.value = event.target.currentTime
  duration.value = event.target.duration || queue.current?.duration || 0
}

// ============ P5 第3课 任务 TODO 01（极简单）：一首播不出来，别卡在那儿 ============
// 页面上看得到的结果：公开音源里总有几首是失效的。
// 现在碰上就**卡住不动**，用户得自己去点下一首。
// 做完之后：提示一句，然后自动跳过。
//
// TODO：
//   queue.playerState = 'error'
//   notice.value = '这一首播不出来（音源可能失效了），已自动跳到下一首'
//   setTimeout(() => playNext(true), 800)
//
// **为什么要等 800 毫秒再跳**：立刻跳的话用户根本看不清发生了什么，
// 会觉得"歌自己乱换"。留一点时间让提示被看见。
//
// 这个函数接在 <audio> 的 @error 上。顺便记一下 audio 元素的几个事件：
//   play / pause     开始播 / 暂停
//   ended            自然播完
//   timeupdate       播放进度变了（每秒好几十次）
//   loadedmetadata   时长等信息拿到了
//   error            加载或解码失败
// ====================================================================
function onError() {
  queue.playerState = 'error'
}

watch(volume, value => {
  if (audio.value) audio.value.volume = value
})
watch(muted, value => {
  if (audio.value) audio.value.muted = value
})
watch(
  () => queue.current?.id,
  () => {
    currentTime.value = 0
    duration.value = 0
    loadLyrics(queue.current)
    syncMediaSession(queue.current)
  },
)

/* ---------------- 系统媒体控制（Media Session） ---------------- */
// 浏览器原生 API：把当前歌曲告诉操作系统。
// 于是**手机锁屏界面、Windows 音量弹窗、耳机上的按键**都能看到歌名封面、能控制播放。
//
// 这类 API 的特点是：**不是所有浏览器都有**，所以每一处都要先判断存在再用。
// 判断一次就够了，不用每首歌都判断——但也不能不判断，否则在 Safari 老版本上直接报错。
const hasMediaSession = typeof navigator !== 'undefined' && 'mediaSession' in navigator

function syncMediaSession(track) {
  if (!hasMediaSession || !track) return
  navigator.mediaSession.metadata = new window.MediaMetadata({
    title: track.title,
    artist: track.artist,
    album: track.album || '星声音乐站',
    artwork: track.cover ? [{ src: track.cover, sizes: '400x400', type: 'image/jpeg' }] : [],
  })
  // 把系统按键接到我们自己的函数上
  const actions = {
    play: () => playCurrent(),
    pause: () => audio.value?.pause(),
    previoustrack: () => playPrev(),
    nexttrack: () => playNext(),
  }
  for (const [name, handler] of Object.entries(actions)) {
    // 有的浏览器不支持某个动作，setActionHandler 会抛错，包一层就好
    try {
      navigator.mediaSession.setActionHandler(name, handler)
    } catch {
      /* 这个动作不支持，跳过 */
    }
  }
}

watch(
  () => queue.playerState,
  state => {
    if (!hasMediaSession) return
    navigator.mediaSession.playbackState =
      state === 'playing' ? 'playing' : state === 'paused' ? 'paused' : 'none'
  },
)

/* ---------------- 键盘快捷键 ---------------- */
// ============ P5 第3课 任务 TODO 03（简单）：键盘快捷键 ============
// 页面上看得到的结果：现在按空格没反应。
// 做完之后：空格播放/暂停、← → 快退快进、Shift+← → 切歌、M 静音、R 换播放模式。
//
// TODO：补上第一行那个判断——
//   const tag = event.target.tagName
//   if (tag === 'INPUT' || tag === 'TEXTAREA') return
//
// **不加这三行会出大问题**：用户在搜索框里打一个空格，歌就暂停了。
// **全局快捷键必须先判断焦点在哪里**，这是很常见的疏漏。
//
// 还要注意 event.preventDefault()：空格在页面上的默认行为是**向下滚动**，
// 不拦住的话按一次空格，歌暂停了、页面也跳了。
//
// 最后看一眼 onUnmounted 里的 removeEventListener：
// **加了监听就要在组件销毁时摘掉**，否则组件没了监听还在，这叫内存泄漏。
// ==========================================================
function onKey(event) {
  if (event.code === 'Space') {
    event.preventDefault()
    togglePlay()
  } else if (event.code === 'ArrowRight' && event.shiftKey) playNext()
  else if (event.code === 'ArrowLeft' && event.shiftKey) playPrev()
  else if (event.code === 'ArrowRight' && audio.value) audio.value.currentTime += 5
  else if (event.code === 'ArrowLeft' && audio.value) audio.value.currentTime -= 5
  else if (event.code === 'KeyM') muted.value = !muted.value
  else if (event.code === 'KeyR') {
    playMode.value = cyclePlayMode(playMode.value)
    notice.value = `播放模式：${describeMode(playMode.value).label}`
  }
}

/* ---------------- 持久化 ---------------- */
try {
  queue.restore(JSON.parse(localStorage.getItem('p5-queue') || 'null'))
  history.value = JSON.parse(localStorage.getItem('p5-history') || '[]')
  theme.value = localStorage.getItem('p5-theme') || 'light'
  const savedVolume = Number(localStorage.getItem('p5-volume'))
  if (Number.isFinite(savedVolume) && savedVolume >= 0 && savedVolume <= 1) volume.value = savedVolume
  const savedMode = localStorage.getItem('p5-mode')
  if (PLAY_MODES.some(mode => mode.key === savedMode)) playMode.value = savedMode
} catch {
  localStorage.removeItem('p5-queue')
}
// ============ P5 第2课 任务 TODO 01（极简单）：刷新页面队列还在 ============
// 页面上看得到的结果：点几首歌，按 F5 刷新——
// 现在队列空了；做完之后还在，连播到第几首都记得。
//
// TODO：
//   watch(
//     () => ({ items: queue.items, currentIndex: queue.currentIndex }),
//     value => localStorage.setItem('p5-queue', JSON.stringify(value)),
//     { deep: true },
//   )
//
// **{ deep: true } 是关键**：不加的话，只有整个对象被替换才触发；
// 队列里加一首、删一首这种"内部变化"监听不到。
//
// 代价是 deep 监听**每次变化都要遍历整个对象**，队列很长时有开销。
// 这里几十首歌无所谓，但要知道它不是免费的。
//
// 顺便看一眼上面 restore 那几行：读回来是用 try/catch 包着的，
// 因为 **localStorage 里的东西随时可能是坏的**
//（用户手改过、上一版格式不同、写到一半断电），
// JSON.parse 一炸整个应用就起不来了。
// ==============================================================
watch(theme, value => {
  localStorage.setItem('p5-theme', value)
  document.documentElement.dataset.theme = value
})
// 音量和播放模式也记住。**这类"上次怎么设的下次还怎么样"的小事，
// 用户说不出来，但每次都要重设会很烦。**
watch(volume, value => localStorage.setItem('p5-volume', String(value)))
watch(playMode, value => localStorage.setItem('p5-mode', value))

onMounted(() => {
  document.documentElement.dataset.theme = theme.value
  window.addEventListener('keydown', onKey)
  // 先把流行歌单在后台拉起来，等用户想搜的时候就是秒出
  MetingAdapter.load().catch(() => {})
  search('Lady Gaga')
})
onUnmounted(() => window.removeEventListener('keydown', onKey))
</script>

<template>
  <div class="app">
    <!-- ============ 顶栏 ============ -->
    <header class="topbar">
      <div class="brand">
        <span class="logo" aria-hidden="true"></span>
        <div>
          <h1>星声音乐站</h1>
          <p>让每一次点歌都有秩序，让每一种声音都有出处</p>
        </div>
      </div>
      <div class="topbar-actions">
        <button class="ghost" type="button" :aria-pressed="showHealth" @click="showHealth = !showHealth">
          音源状态
        </button>
        <button class="ghost" type="button" :aria-pressed="hostMode" @click="hostMode = !hostMode">
          {{ hostMode ? '退出主持台' : '主持台' }}
        </button>
        <button
          class="ghost icon"
          type="button"
          :aria-label="theme === 'light' ? '切换到深色' : '切换到浅色'"
          @click="theme = theme === 'light' ? 'dark' : 'light'"
        >
          {{ theme === 'light' ? '☾' : '☀' }}
        </button>
      </div>
    </header>

    <!-- ============ 音源状态面板 ============ -->
    <section v-if="showHealth" class="health card">
      <h2>音源状态</h2>
      <p class="hint">
        这些都是**公开的第三方接口，随时可能挂掉**。
        任何一个不可用，搜索会自动换到下一个；最后一道是课堂合成音，它不联网也能响。
      </p>
      <ul>
        <li v-for="item in health" :key="item.endpoint">
          <span class="dot" :class="item.ok ? 'ok' : 'bad'"></span>
          <code>{{ item.endpoint }}</code>
          <span class="ms">{{ item.ms }}ms</span>
          <span class="note">{{ item.ok ? '正常' : item.note }}</span>
        </li>
        <li v-if="!health.length" class="muted">还没有发过请求</li>
      </ul>
    </section>

    <div class="layout">
      <!-- ============ 左：搜索与结果 ============ -->
      <section class="card search">
        <div class="sources" role="tablist" aria-label="音源">
          <button
            v-for="item in sourceList"
            :key="item.key"
            class="chip"
            type="button"
            role="tab"
            :aria-selected="sourceKey === item.key"
            :title="item.note"
            @click="switchSource(item.key)"
          >
            {{ item.label }}
          </button>
        </div>
        <p class="source-note">{{ currentSource.note }}</p>

        <form class="search-form" @submit.prevent="search()">
          <label class="field grow">
            <span class="sr-only">搜索音乐</span>
            <input v-model="keyword" maxlength="40" placeholder="歌手或歌名，比如 周杰伦" />
          </label>
          <label class="field">
            <span class="sr-only">点歌人</span>
            <input v-model="requester" maxlength="12" placeholder="你的名字" />
          </label>
          <button class="primary" type="submit">搜索</button>
        </form>

        <div class="hotwords">
          <button v-for="word in HOT_WORDS" :key="word" class="tag" type="button" @click="search(word)">
            {{ word }}
          </button>
        </div>
        <div v-if="history.length" class="hotwords history">
          <span class="tiny">最近搜过</span>
          <button v-for="word in history" :key="word" class="tag ghosted" type="button" @click="search(word)">
            {{ word }}
          </button>
        </div>

        <div class="notice-row">
          <p class="notice" :class="{ warn: fellBack, bad: searchState === 'error' }" aria-live="polite">
            {{ searchState === 'loading' ? '搜索中…' : notice }}
          </p>
          <button
            v-if="searchState === 'success' && results.length > 1"
            class="tag"
            type="button"
            @click="addAll"
          >
            全部加入（最多 10 首）
          </button>
        </div>

        <ul v-if="searchState === 'loading'" class="results">
          <li v-for="n in 5" :key="n" class="skeleton"><span class="sk-cover"></span><span class="sk-line"></span></li>
        </ul>
        <ul v-else class="results">
          <li v-for="track in results" :key="track.trackId ?? track.songId ?? track.id ?? track.url">
            <button
              class="row"
              type="button"
              :aria-label="`立即播放 ${titleOf(track)}`"
              @click="requestTrack(track, true)"
            >
              <img
                v-if="track.artworkUrl100 || track.pic || track.artwork"
                class="cover"
                :src="track.artworkUrl100 || track.pic || track.artwork?.['150x150']"
                :alt="`${titleOf(track)} 封面`"
                loading="lazy"
              />
              <span v-else class="cover placeholder" aria-hidden="true">♪</span>
              <span class="meta">
                <strong>{{ titleOf(track) }}</strong>
                <small>{{ track.artistName ?? track.artist ?? track.author ?? track.user?.name }}</small>
              </span>
              <span class="play-hint" aria-hidden="true">▶ 立即播放</span>
            </button>
            <button class="add" type="button" :aria-label="`把 ${titleOf(track)} 排到队尾`" title="排到队尾" @click="requestTrack(track)">＋</button>
          </li>
        </ul>
      </section>

      <!-- ============ 右：播放器与队列 ============ -->
      <section class="right">
        <div class="card player">
          <!-- 用当前封面做一层极淡的模糊背景，让播放器跟着歌换气氛。
               aria-hidden 是因为它纯装饰，读屏软件不该念它。 -->
          <div
            v-if="queue.current?.cover"
            class="player-backdrop"
            :style="{ backgroundImage: `url(${queue.current.cover})` }"
            aria-hidden="true"
          ></div>
          <div class="disc" :class="{ spinning: queue.playerState === 'playing' }">
            <img v-if="queue.current?.cover" :src="queue.current.cover" :alt="`${queue.current.title} 封面`" />
            <span v-else aria-hidden="true">♪</span>
          </div>
          <div class="now">
            <p class="eyebrow">{{ stateLabel }}</p>
            <h2>{{ queue.current?.title || '等待第一首歌' }}</h2>
            <p class="sub">
              {{ queue.current ? `${queue.current.artist} · 点歌：${queue.current.requester}` : '从左边搜索并点歌' }}
            </p>
            <p v-if="queue.current" class="license">
              {{ queue.current.sourceName }} · {{ queue.current.license }}
              <a v-if="queue.current.sourceUrl" :href="queue.current.sourceUrl" target="_blank" rel="noopener">来源</a>
              <em v-if="!queue.current.full">30 秒试听</em>
            </p>
          </div>

          <div class="bar">
            <span class="time">{{ fmt(currentTime) }}</span>
            <div class="track" role="slider" :aria-valuenow="Math.round(progress)" aria-label="播放进度" tabindex="0" @click="seek">
              <i :style="{ width: `${progress}%` }"></i>
            </div>
            <span class="time">{{ fmt(duration) }}</span>
          </div>

          <div class="controls">
            <button
              class="ctl mode"
              type="button"
              :aria-label="`播放模式：${modeInfo.label}。${modeInfo.hint}`"
              :title="`${modeInfo.label} · ${modeInfo.hint}`"
              @click="playMode = cyclePlayMode(playMode)"
            >
              <span aria-hidden="true">{{ modeInfo.icon }}</span>
              <em>{{ modeInfo.label }}</em>
            </button>
            <button class="ctl" type="button" :disabled="!queue.items.length" aria-label="上一首" @click="playPrev">⏮</button>
            <button class="ctl play" type="button" :disabled="!queue.current" :aria-label="queue.playerState === 'playing' ? '暂停' : '播放'" @click="togglePlay">
              {{ queue.playerState === 'playing' ? '❚❚' : '▶' }}
            </button>
            <button class="ctl" type="button" :disabled="!queue.items.length" aria-label="下一首" @click="playNext()">⏭</button>
            <div class="volume">
              <button class="ctl small" type="button" :aria-label="muted ? '取消静音' : '静音'" @click="muted = !muted">
                {{ muted || volume === 0 ? '🔇' : '🔊' }}
              </button>
              <input v-model.number="volume" type="range" min="0" max="1" step="0.01" aria-label="音量" />
            </div>
          </div>
          <p class="tiny keys">
            空格 播放/暂停 · ← → 快退快进 5 秒 · Shift+← → 切歌 · M 静音 · R 换播放模式
          </p>

          <audio
            ref="audio"
            :src="queue.current?.previewUrl"
            @play="queue.playerState = 'playing'"
            @pause="queue.playerState = queue.current ? 'paused' : 'idle'"
            @ended="playNext(true)"
            @error="onError"
            @timeupdate="onTimeUpdate"
            @loadedmetadata="onTimeUpdate"
          />
        </div>

        <div class="card lyrics">
          <div class="lyrics-head">
            <h2>歌词</h2>
            <span v-if="lyricState === 'ready'" class="tiny">点某一句可以跳到那里</span>
          </div>
          <p v-if="lyricState === 'none'" class="muted">
            这个音源不提供歌词。「流行热歌」里的曲目大多带歌词。
          </p>
          <p v-else-if="lyricState === 'loading'" class="muted">歌词加载中…</p>
          <p v-else-if="lyricState === 'missing'" class="muted">这一首没有找到歌词。</p>
          <ol v-else class="lyric-lines" ref="lyricBox">
            <li
              v-for="(line, index) in lyrics"
              :key="`${line.time}-${index}`"
              :class="{ on: index === activeLine }"
              :ref="el => { if (index === activeLine) activeLineEl = el }"
            >
              <button type="button" @click="seekToLine(line)">{{ line.text }}</button>
            </li>
          </ol>
        </div>

        <div class="card queue">
          <div class="queue-head">
            <h2>
              播放队列 <span class="count">{{ queue.items.length }}</span>
              <span v-if="queueStats.total" class="tiny total">
                共 {{ fmt(queueStats.total) }}<template v-if="queueStats.unknown">（另 {{ queueStats.unknown }} 首时长未知）</template>
              </span>
            </h2>
            <div v-if="hostMode" class="host-actions">
              <button class="ghost" type="button" @click="queue.toggleLock">
                {{ queue.locked ? '开放点歌' : '暂停点歌' }}
              </button>
              <button class="ghost" type="button" :disabled="!queue.items.length" @click="queue.clear">清空</button>
            </div>
          </div>
          <p v-if="queue.locked" class="lock">队列已锁定，当前只允许主持人操作</p>
          <div v-if="!queue.items.length" class="empty-state">
            <p class="muted">队列还是空的。</p>
            <p class="tiny">
              在左边搜一位歌手 → <strong>点整行立刻播放</strong>，点 ＋ 排到队尾。
            </p>
          </div>
          <ol>
            <li v-for="(track, index) in queue.items" :key="track.id" :class="{ current: index === queue.currentIndex }">
              <button class="idx" type="button" :aria-label="`播放 ${track.title}`" @click="playAt(index)">
                {{ index === queue.currentIndex && queue.playerState === 'playing' ? '♪' : String(index + 1).padStart(2, '0') }}
              </button>
              <div class="meta">
                <strong>{{ track.title }}</strong>
                <small>{{ track.artist }} · {{ track.requester }}</small>
              </div>
              <span v-if="hostMode" class="reorder">
                <button type="button" :disabled="index === 0" aria-label="上移" @click="queue.move(index, index - 1)">↑</button>
                <button type="button" :disabled="index === queue.items.length - 1" aria-label="下移" @click="queue.move(index, index + 1)">↓</button>
              </span>
              <button class="del" type="button" :aria-label="`移除 ${track.title}`" @click="queue.remove(index)">×</button>
            </li>
          </ol>

          <div v-if="hostMode" class="activity">
            <p class="eyebrow">操作日志</p>
            <p v-if="!queue.activityLog.length" class="muted">暂无操作</p>
            <ul>
              <li v-for="entry in queue.activityLog" :key="entry.id">
                <time>{{ entry.at }}</time><span>{{ entry.action }}</span><small>{{ entry.detail }}</small>
              </li>
            </ul>
          </div>
        </div>
      </section>
    </div>

    <footer>
      音频全部来自第三方公开接口，**本站只做直链播放，不抓取、不缓存、不转存**；
      公版条目链接至许可页 · 课堂合成音由浏览器实时生成
    </footer>
  </div>
</template>
