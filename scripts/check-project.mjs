// 工程结构自检：确认 v2.0 那些"必须成立"的事情还成立。
//
// 这个脚本的作用不是测功能（那是 tests/ 的事），而是防止**改着改着把关键约束改掉了**。
// 每一条都对应课堂上讲过的一个知识点，括号里标了是哪一课的哪个 TODO。
//
// 它在 npm run check 里跑，CI 里也跑。有任何一条不过就退出码 1。

import { readFile } from 'node:fs/promises'

const read = (path) => readFile(path, 'utf8')

const [app, prompt, minimax, greeting, card, view, slug, themes, env, netlify, ci, gitignore] =
  await Promise.all([
    read('src/App.vue'),
    read('server/prompt.js'),
    read('src/shared/minimax.js'),
    read('netlify/functions/greeting.js'),
    read('netlify/functions/card.js'),
    read('netlify/functions/view.js'),
    read('src/shared/slug.js'),
    read('src/data/themes.js'),
    read('.env.example'),
    read('netlify.toml'),
    read('.github/workflows/ci.yml'),
    read('.gitignore'),
  ])

const checks = [
  // ---- 第 1 课：前端 ----
  // 注意这里只有三种状态，没有 'error'：本产品的设计是**任何失败都降级出稿**，
  // 所以压根不存在"错误界面"。少一个状态是有意的，不是漏了。
  ['三种界面状态齐全，且确实没有错误态（P4-01）',
    ['idle', 'loading', 'ready'].every((s) => app.includes(`'${s}'`)) &&
      !app.includes("status.value = 'error'")],
  ['卡面按 id 查找并有兜底（P4-01 TODO 01）',
    themes.includes('themes.find') && themes.includes('?? themes[0]')],
  ['提交按钮受 computed 控制（P4-01 TODO 02）',
    app.includes('canSubmit') && app.includes(":disabled=\"!canSubmit\"")],
  ['选中态用 aria-pressed 表达（P4-01 TODO 07）', app.includes(':aria-pressed=')],

  // ---- 第 2 课：后端与 AI ----
  ['场景与语气用白名单校验（P4-02 TODO 01）',
    prompt.includes('OCCASIONS.includes') && prompt.includes('TONES.includes')],
  ['输入先归一化再校验（P4-02 TODO 02）', prompt.includes("replace(/[<>]/g")],
  ['用的是 MiniMax-M3', minimax.includes("MINIMAX_MODEL = 'MiniMax-M3'")],
  ['检查 HTTP 状态码（P4-02 TODO 03）', minimax.includes('!response.ok')],
  ['检查业务状态码 base_resp（P4-02 TODO 04）', minimax.includes('base_resp')],
  ['清洗模型输出（P4-02 TODO 05）', minimax.includes('cleanOutput')],
  ['外部请求有超时（P4-02 TODO 06）',
    minimax.includes('AbortController') && minimax.includes('clearTimeout')],
  ['失败降级并如实说明原因（P4-02 TODO 07）',
    greeting.includes('no_api_key') && greeting.includes('ai_timeout') && greeting.includes("mode: 'fallback'")],
  ['密钥只在服务端读，前端代码里没有',
    greeting.includes('process.env.MINIMAX_API_KEY') && !app.includes('MINIMAX_API_KEY')],
  ['minimax.js 自己不读环境变量（好测、可复用）', !minimax.includes('process.env')],

  // ---- 第 3 课：上线 ----
  ['短链接由称呼和日期拼成（P4-03 TODO 01）', slug.includes('candidateSlugs')],
  ['随机码去掉了易混字符 0/o/1/l/i（P4-03 TODO 02）',
    /const ALPHABET = '[^']+'/.test(slug) &&
      !/const ALPHABET = '[^']*[0o1liI][^']*'/.test(slug)],
  ['slug 进存储前有校验（P4-03 TODO 03）', slug.includes('isSafeSlug')],
  ['存贺卡时字段走白名单（P4-03 TODO 04）', card.includes('function sanitize')],
  ['撞名时换一个而不是覆盖（P4-03 TODO 05）',
    card.includes('candidateSlugs') && card.includes('if (taken) continue')],
  ['分享页对用户内容转义，且 & 第一个换（P4-03 TODO 06）',
    view.includes('&amp;') && view.includes('&lt;') && view.includes('&#39;') &&
      view.indexOf('&amp;') < view.indexOf('&lt;')],
  ['分享页可被 CDN 缓存（P4-03 TODO 07）', view.includes('s-maxage=')],
  ['生成接口不缓存（和分享页正好相反）', greeting.includes("'no-store'")],

  // ---- 产品定位：分享页必须干净 ----
  ['分享页模板里没有 script / button / a 标签',
    (() => {
      const start = view.indexOf('return `<!doctype html>')
      const body = start === -1 ? '' : view.slice(start)
      return start !== -1 && !/<script[\s>]/i.test(body) &&
        !/<button[\s>]/i.test(body) && !/<a[\s>]/i.test(body)
    })()],

  // ---- 配置与安全 ----
  ['.env.example 里没有真实密钥', /^MINIMAX_API_KEY=\s*$/m.test(env)],
  ['.env 不会被提交', gitignore.includes('.env')],
  ['netlify.toml 指定了函数目录和 Node 24',
    netlify.includes('directory = "netlify/functions"') && netlify.includes('NODE_VERSION = "24"')],
  ['单页应用兜底重定向在最后一条', netlify.includes('to = "/index.html"')],
  ['配了安全响应头', netlify.includes('X-Content-Type-Options')],
  ['CI 包含密钥扫描', ci.includes('check:secrets')],
]

for (const [name, ok] of checks) console.log(`${ok ? '✓' : '✗'} ${name}`)

const failed = checks.filter(([, ok]) => !ok)
if (failed.length) {
  console.error(`\n结构检查未通过：${failed.length} 项。上面打 ✗ 的就是。`)
  process.exit(1)
}
console.log(`\n结构检查通过：${checks.length} 项。`)
