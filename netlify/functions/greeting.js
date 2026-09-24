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
      const reason = error?.name === 'AbortError' ? 'ai_timeout' : error?.code || 'ai_unavailable'
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
