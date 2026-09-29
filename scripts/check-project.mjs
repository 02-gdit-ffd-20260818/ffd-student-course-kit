// 工程结构自检：确认那些"必须成立"的事情还成立。
//
// 不是测功能（那是 tests/ 的事），而是防止改着改着把关键约束改掉了。
// 每一条都对应课堂上讲过的一个知识点。

import { readFile } from 'node:fs/promises'

const read = path => readFile(path, 'utf8')
const [app, adapter, endpoints, queue, policy, lyrics, playMode, html, ci, netlify, css] =
  await Promise.all(
  [
    'src/App.vue',
    'src/adapters/musicAdapter.js',
    'src/services/endpoints.js',
    'src/stores/queueCore.js',
    'src/services/requestPolicy.js',
    'src/services/lyrics.js',
    'src/services/playMode.js',
    'index.html',
    '.github/workflows/ci.yml',
    'netlify.toml',
    'src/styles.css',
  ].map(read),
)

const checks = [
  // ---- 架构 ----
  ['Adapter 契约', adapter.includes('class MusicAdapter')],
  ['五个音源都登记在 SOURCES 里', (adapter.match(/Adapter: \w+Adapter/g) ?? []).length === 5],
  ['界面按 SOURCES 渲染，加音源不用改界面', app.includes('SOURCES.map')],
  ['队列去重', queue.includes('addUnique')],
  ['空队列安全', queue.includes('return -1')],
  ['Pinia 队列', app.includes('useQueueStore')],

  // ---- 容错：这一课的重点 ----
  ['多镜像故障转移', endpoints.includes('raceMirrors') && endpoints.includes('METING_MIRRORS')],
  ['请求有超时', endpoints.includes('AbortController') && endpoints.includes('clearTimeout')],
  ['fetch 要自己看 ok', endpoints.includes('response.ok')],
  ['搜索失败会换音源', adapter.includes('searchWithFailover')],
  ['最后一道防线不联网', adapter.includes('createToneDataUrl')],
  ['全挂了也不抛错给界面', adapter.includes('safeSearch')],
  ['音源健康状态看得见', endpoints.includes('healthSnapshot') && app.includes('healthSnapshot')],
  ['搜索有竞态保护', app.includes('searchToken')],
  ['搜索镜像与播放镜像分开', endpoints.includes('search:') && endpoints.includes('play:')],
  ['不同镜像的字段要归一化', adapter.includes('static normalize')],
  ['多平台搜索', endpoints.includes('METING_SERVERS')],
  ['点歌分「立即播放」和「排队」', app.includes('playNow')],
  ['播放失败自动跳下一首', app.includes('onError')],

  // ---- 歌词 ----
  ['歌词解析是纯函数', lyrics.includes('export function parseLrc') && !lyrics.includes('fetch(')],
  ['一行多个时间戳要拆开', lyrics.includes('matchAll')],
  ['当前行用二分查找', lyrics.includes('low <= high')],
  ['界面显示歌词并能点句跳转', app.includes('lyric-lines') && app.includes('seekToLine')],
  ['歌词四态', app.includes('lyricState')],
  ['歌词有竞态保护', app.includes('lyricToken')],

  // ---- 播放模式 ----
  ['四种播放模式', (playMode.match(/key: '/g) ?? []).length === 4],
  ['模式规则是纯函数，可注入随机数以便测试', playMode.includes('random = Math.random')],
  ['随机不会挑到当前这首', playMode.includes('pick >= current')],
  ['顺序播完返回 -1 表示停止', playMode.includes('auto ? -1 : 0')],
  ['界面只用一个按钮切模式', app.includes('cyclePlayMode')],

  // ---- 页面元信息 ----
  ['有 SVG 图标', html.includes('favicon.svg') && html.includes('image/svg+xml')],
  ['深浅色各有主题色', (html.match(/name="theme-color"/g) ?? []).length === 2],
  ['分享预览标签', html.includes('og:title')],

  // ---- 系统集成 ----
  ['接了系统媒体控制', app.includes('mediaSession') && app.includes('MediaMetadata')],
  ['用前先判断浏览器支不支持', app.includes("'mediaSession' in navigator")],

  // ---- 状态与交互 ----
  ['五态播放器', app.includes('playerState')],
  ['搜索四态', app.includes('searchState')],
  ['点歌限流', app.includes('checkRequestRate') && policy.includes('windowMs')],
  ['主持控制与日志', app.includes('hostMode') && app.includes('activityLog')],
  ['队列本地持久化', app.includes('localStorage')],
  ['音量与播放模式也记住', app.includes('p5-volume') && app.includes('p5-mode')],
  ['一键加入有上限，防止淹掉别人的队列', app.includes('slice(0, 10)')],
  ['键盘快捷键', app.includes('onKey')],
  ['进度可拖动', app.includes('function seek')],
  ['音量与静音', app.includes('muted')],

  // ---- 版权与合规：这个项目的底线 ----
  ['每个音源都写明 license', (adapter.match(/license:/g) ?? []).length >= 5],
  ['公版来源带许可页链接', adapter.includes('LicensedMusicAdapter') && adapter.includes('sourceUrl')],
  ['页面上说明不抓取不缓存', app.includes('不抓取') && app.includes('不缓存')],
  ['试听片段有标注', app.includes('30 秒试听')],

  // ---- 界面 ----
  ['颜色写成变量，深色模式只改变量', css.includes(':root') && css.includes("[data-theme='dark']")],
  ['尊重减少动效偏好', css.includes('prefers-reduced-motion')],
  ['响应式断点', css.includes('@media (max-width: 620px)')],

  // ---- 交付 ----
  ['CI 测试与构建', ci.includes('npm test') && ci.includes('npm run build')],
  ['Netlify SPA fallback', netlify.includes('/index.html')],
]

for (const [name, ok] of checks) console.log(`${ok ? '✓' : '✗'} ${name}`)

const failed = checks.filter(([, ok]) => !ok)
if (failed.length) {
  console.error(`\n结构检查未通过：${failed.length} 项。上面打 ✗ 的就是。`)
  process.exit(1)
}
console.log(`\n结构检查通过：${checks.length} 项。`)
