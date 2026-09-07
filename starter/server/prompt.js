export const PROMPT_VERSION = 'greeting-card-v1.0'
export const OCCASIONS = ['生日', '毕业', '新年', '感谢', '乔迁', '通用']
export const TONES = ['真诚', '温暖', '活泼', '典雅', '简洁']

const LIMITS = { receiver: 20, details: 180 }
const unsafePattern = /(自杀|伤害自己|炸弹|杀死|仇恨|色情|赌博)/i

function clean(value) {
  return String(value ?? '').replace(/[<>]/g, '').replace(/\s+/g, ' ').trim()
}

export function normalizeCardInput(input = {}) {
  const receiver = clean(input.receiver)
  const details = clean(input.details)
  const occasion = clean(input.occasion)
  const tone = clean(input.tone)
  if (!receiver) throw Object.assign(new Error('请填写收礼人称呼'), { status: 400, code: 'INVALID_RECEIVER' })
  if (receiver.length > LIMITS.receiver) throw Object.assign(new Error('称呼不能超过 20 个字'), { status: 400, code: 'INVALID_RECEIVER' })
  if (!OCCASIONS.includes(occasion)) throw Object.assign(new Error('请选择有效场景'), { status: 400, code: 'INVALID_OCCASION' })
  if (!TONES.includes(tone)) throw Object.assign(new Error('请选择有效语气'), { status: 400, code: 'INVALID_TONE' })
  if (details.length > LIMITS.details) throw Object.assign(new Error('补充信息不能超过 180 个字'), { status: 400, code: 'DETAILS_TOO_LONG' })
  if (unsafePattern.test(`${receiver} ${details}`)) throw Object.assign(new Error('内容不适合用于祝福卡片，请调整后重试'), { status: 422, code: 'UNSAFE_CONTENT' })
  return { receiver, occasion, tone, details }
}

export function buildPrompt(input) {
  return {
    instructions: `你是中文贺卡文案助手。只创作健康、尊重、适合公开分享的祝福语。输出 45 到 90 个汉字，不使用 Markdown，不编造事实。Prompt 版本：${PROMPT_VERSION}`,
    input: `收礼人：${input.receiver}\n场景：${input.occasion}\n语气：${input.tone}\n补充信息：${input.details || '无'}`
  }
}

const openings = { 真诚: '愿这份心意轻轻抵达', 温暖: '把温柔的祝愿写进今天', 活泼: '好日子要配上大大的欢喜', 典雅: '一笺清意，遥寄安然', 简洁: '祝福虽短，心意很长' }
const wishes = { 生日: '愿新一岁常有热爱相伴，所行皆坦途，所得皆欢喜。', 毕业: '愿你带着勇气奔赴山海，在新的旅程里遇见更好的自己。', 新年: '愿新岁有光、有梦、有从容，每一天都值得期待。', 感谢: '谢谢你一直以来的真诚与照亮，愿所有善意都有回响。', 乔迁: '愿新居盛满清风与笑语，三餐四季皆安稳明亮。', 通用: '愿平凡日子自带光芒，心有所向，步履从容。' }

export function createFallbackGreeting(input) {
  const detail = input.details ? `也愿“${input.details.slice(0, 36)}”成为值得珍藏的记忆。` : ''
  return `${input.receiver}，${openings[input.tone]}。${wishes[input.occasion]}${detail}`
}
