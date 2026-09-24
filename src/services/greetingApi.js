// 前端和自己后端之间的两个调用。
//
// 注意这里**没有任何模型密钥**——前端只认识 /api/greeting 和 /api/card，
// 至于后端拿什么模型、用什么密钥去生成，前端不知道也不需要知道。
// 这是"密钥只放服务端"最直接的体现：把浏览器打开开发者工具翻遍也翻不到。

const API_BASE = String(import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '')

async function post(path, payload, timeoutMs) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const response = await fetch(`${API_BASE}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal,
    })
    // fetch 不会因为 4xx/5xx 抛错，必须自己判断
    const data = await response.json().catch(() => ({}))
    if (!response.ok) throw new Error(data?.error?.message || '请求失败，请稍后再试')
    return data
  } finally {
    clearTimeout(timer)
  }
}

// 生成文案。25 秒是留给大模型的余量——后端自己有 20 秒超时并会退回本地文案库，
// 前端这一层只是最后一道保险，正常不会触发。
export function requestGreeting(payload) {
  return post('/api/greeting', payload, 25000)
}

// 保存贺卡，换回一条 /c/林老师-20260922 形式的短链接。
// 返回完整网址，调用方直接复制就能发出去。
export async function saveCard(card) {
  const data = await post('/api/card', card, 12000)
  return { slug: data.slug, url: `${location.origin}${data.path}` }
}
