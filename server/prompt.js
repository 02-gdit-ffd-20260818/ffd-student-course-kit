// 输入校验 + 提示词拼装 + 不依赖任何外部服务的兜底文案。
//
// 这个文件里没有一行网络代码，全是纯函数——所以它最好测，
// 也最适合放"到底什么样的输入才算合法"这条规矩。

import { composeGreeting } from '../src/shared/greetingTemplates.js'

export const PROMPT_VERSION = 'greeting-card-v1.3'
// 场景和语气都用**白名单**。为什么不是"检查有没有坏词"：坏词永远列不完，
// 白名单只有这么几项，列不全的风险为零。
export const OCCASIONS = ['生日', '毕业', '新年', '感谢', '乔迁', '通用']
export const TONES = ['真诚', '温暖', '活泼', '典雅', '简洁']

const LIMITS = { receiver: 20, details: 180 }
// 白名单管不住自由输入的那两个字段，所以再加一道明显不适合的词的拦截。
// 它不追求滴水不漏，只负责挡住最直接的情况。
const unsafePattern = /(自杀|伤害自己|炸弹|杀死|仇恨|色情|赌博)/i

// 所有字段进来先洗一遍：去掉尖括号（防止被当成 HTML 标签）、
// 把连续空白压成一个空格、去掉首尾空格。
function clean(value) {
  return String(value ?? '')
    .replace(/[<>]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

// 校验并规整输入。**这道校验必须在服务端做**：
// 前端的下拉框只是方便用户，任何人都能用 curl 绕过页面直接打接口。
//
// 每个错误都带 status 和 code 两样东西：status 给 HTTP 用，
// code 是给程序看的稳定代号（错误文案改了它也不变）。
export function normalizeCardInput(input = {}) {
  const receiver = clean(input.receiver)
  const details = clean(input.details)
  const occasion = clean(input.occasion)
  const tone = clean(input.tone)
  if (!receiver)
    throw Object.assign(new Error('请填写收礼人称呼'), { status: 400, code: 'INVALID_RECEIVER' })
  if (receiver.length > LIMITS.receiver)
    throw Object.assign(new Error('称呼不能超过 20 个字'), {
      status: 400,
      code: 'INVALID_RECEIVER',
    })
  if (!OCCASIONS.includes(occasion))
    throw Object.assign(new Error('请选择有效场景'), { status: 400, code: 'INVALID_OCCASION' })
  if (!TONES.includes(tone))
    throw Object.assign(new Error('请选择有效语气'), { status: 400, code: 'INVALID_TONE' })
  if (details.length > LIMITS.details)
    throw Object.assign(new Error('补充信息不能超过 180 个字'), {
      status: 400,
      code: 'DETAILS_TOO_LONG',
    })
  if (unsafePattern.test(`${receiver} ${details}`))
    throw Object.assign(new Error('内容不适合用于祝福卡片，请调整后重试'), {
      status: 422,
      code: 'UNSAFE_CONTENT',
    })
  return { receiver, occasion, tone, details }
}

// 拼提示词。PROMPT_VERSION 一起发出去，将来发现某一版效果不好，
// 靠这个版本号就能定位是哪一版生成的。
export function buildPrompt(input) {
  return {
    instructions: `你是中文贺卡文案助手。只创作健康、尊重、适合公开分享的祝福语。输出 45 到 90 个汉字，不使用 Markdown，不编造事实。Prompt 版本：${PROMPT_VERSION}`,
    input: `收礼人：${input.receiver}\n场景：${input.occasion}\n语气：${input.tone}\n补充信息：${input.details || '无'}`,
  }
}

// 兜底文案不在这里写死了——服务端和前端共用 src/shared/greetingTemplates.js 那一份。
// 以前这里每个「场景 × 语气」只有一句，同样的输入永远得到同一句话；
// 现在是 810 种组合，每次调用换一个 seed 就换一种说法。
export function createFallbackGreeting(input, seed) {
  return composeGreeting(input, seed)
}
