// POST /api/greeting —— 生成祝福文案。
//
// 密钥只在这里（服务端）出现，前端永远拿不到。
// 顺序：校验输入 → 调 MiniMax → 失败就退回本地文案库，**绝不把错误抛给用户**。

import { normalizeCardInput } from '../../server/prompt.js'
import { composeGreeting } from '../../src/shared/greetingTemplates.js'
import { generateWithMiniMax, PROMPT_VERSION } from '../../src/shared/minimax.js'

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' },
  })

export default async function handler(request) {
  if (request.method !== 'POST') return json({ error: { message: '只支持 POST' } }, 405)

  let input
  let seed
  try {
    const body = await request.json()
    // 服务端必须自己校验一遍。前端的下拉框只是方便用户，
    // 任何人都能用 curl 绕过页面直接打这个接口。
    input = normalizeCardInput(body)
    seed = Number(body?.seed) > 0 ? Math.floor(Number(body.seed)) : Date.now()
  } catch (error) {
    return json({ error: { code: error.code || 'INVALID_INPUT', message: error.message } }, error.status || 400)
  }

  const apiKey = process.env.MINIMAX_API_KEY
  if (apiKey) {
    try {
      const result = await generateWithMiniMax(input, { apiKey })
      return json({ ...result, promptVersion: PROMPT_VERSION, requiresHumanReview: true })
    } catch (error) {
      // 超时、限流、上游故障，都走下面的本地文案库。
      // reason 如实告诉前端，界面才能诚实地说明这次是谁写的。
            // ============ P4 第2课 任务 TODO 03（简单）：失败了也要出稿，并说清是谁写的 ============
      // 页面上看得到的结果：卡片下面那行"本次文案来自 · ……"，
      // 现在不管发生什么都只会显示"本地文案库"，看不出到底出了什么事。
      // 做完之后能分别显示"模型响应超时""未配置模型密钥"等等。
      //
      // TODO：把失败原因如实传给前端：
      //   const reason = error?.name === 'AbortError' ? 'ai_timeout'
      //                : error?.code || 'ai_unavailable'
      //
      // 这一段体现本课两条重要原则：
      //   1) **降级要静默，但不能欺骗。** 模型挂了照样出贺卡（用户要的是
      //      一张卡，不是一条报错），但界面要老实说这次是本地文案库写的。
      //   2) **错误要分类。** 超时、没配密钥、上游拒绝是三件不同的事，
      //      合并成一句"失败了"，排查时就完全不知道从哪查起。
      //
      // 顺便想一想：为什么 reason 用 'ai_timeout' 这种代号，而不是直接
      // 写中文"模型响应超时"？**因为文案会改，代号不会。**
      // 前端拿代号去查中文，改文案不用动后端。
      // ======================================================================
      const reason = 'ai_unavailable'
      return json({
        text: composeGreeting(input, seed),
        mode: 'fallback',
        reason,
        promptVersion: PROMPT_VERSION,
        requiresHumanReview: true,
      })
    }
  }

  return json({
    text: composeGreeting(input, seed),
    mode: 'fallback',
    reason: 'no_api_key',
    promptVersion: PROMPT_VERSION,
    requiresHumanReview: true,
  })
}

export const config = { path: '/api/greeting' }
