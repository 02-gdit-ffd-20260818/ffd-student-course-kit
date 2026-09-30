// 调用 AI 生成祝福语；**任何一种失败都退回本地兜底文案，绝不把错误抛给用户**。
//
// 注意函数返回值里的 mode 和 reason：mode 告诉界面这次是 AI 写的还是兜底的，
// reason 说明为什么兜底。界面据此给出诚实的提示，而不是假装一切正常。

import { buildPrompt, createFallbackGreeting } from './prompt.js'

// 从上游返回的 JSON 里把文本抠出来。写得这么啰嗦是因为**响应格式可能有两种**：
// 有的直接给 output_text，有的要从 output 数组里层层取。
// 对接外部服务时这种防御性写法很常见。
function extractOutputText(payload) {
  if (typeof payload?.output_text === 'string') return payload.output_text.trim()
  return (payload?.output ?? [])
    .flatMap(item => item?.content ?? [])
    .filter(part => part?.type === 'output_text' && typeof part.text === 'string')
    .map(part => part.text)
    .join('')
    .trim()
}

// options 里可以传 env 和 fetchImpl，默认用真实的环境变量和 fetch。
// **留这两个口子是为了测试**：测试时传一个假的 fetchImpl 进来，
// 就能模拟超时、500、空响应，不用真的联网。
export async function generateGreeting(input, options = {}) {
  const env = options.env ?? process.env
  const fetchImpl = options.fetchImpl ?? fetch
  // seed 只给兜底文案库用，决定挑哪一句模板
  const seed = options.seed
  // 没配密钥就直接兜底，**连网络都不碰**。
  // 这样没有密钥的同学也能完整做完这个项目。
  if (env.AI_PROVIDER !== 'openai' || !env.OPENAI_API_KEY) {
    return {
      text: createFallbackGreeting(input, seed),
      mode: 'fallback',
      reason: 'provider_not_configured',
    }
  }

  // 超时控制：上游卡住不能让用户一直等。AbortController 配合下面的
  // signal 参数，时间一到就主动掐断这次请求。
  const controller = new AbortController()
  const timeoutMs = Number(env.AI_TIMEOUT_MS || 8000)
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const prompt = buildPrompt(input)
    const response = await fetchImpl(
      `${env.OPENAI_BASE_URL || 'https://api.openai.com/v1'}/responses`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: env.OPENAI_MODEL || 'gpt-5.4-mini',
          instructions: prompt.instructions,
          input: prompt.input,
          max_output_tokens: 180,
          store: false,
        }),
        signal: controller.signal,
      },
    )
    // fetch 有个反直觉的地方：**服务器返回 500 它也算"成功"**，不会自动抛错，
    // 必须自己检查 response.ok。
    if (!response.ok) throw new Error(`upstream_${response.status}`)
    const text = extractOutputText(await response.json())
    // 返回了但内容是空的，也算失败，照样走兜底
    if (!text) throw new Error('upstream_empty')
    // 上游返回多长都截到 260 字，界面的排版才不会被撑坏
    return { text: text.slice(0, 260), mode: 'ai', reason: null }
  } catch (error) {
    // 超时和其它故障分开记，排查时能一眼看出是慢还是坏
    const reason = error?.name === 'AbortError' ? 'upstream_timeout' : 'upstream_unavailable'
    return { text: createFallbackGreeting(input, seed), mode: 'fallback', reason }
  } finally {
    // 不管成功失败都要清掉定时器，否则进程会被它拖着不退出
    clearTimeout(timer)
  }
}
