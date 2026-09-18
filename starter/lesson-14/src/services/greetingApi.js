const API_BASE_URL = String(import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '')

export async function generateGreeting(payload, fetchImpl = fetch) {
  const response = await fetchImpl(`${API_BASE_URL}/api/greetings/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })
  const data = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(data?.error?.message || '生成失败，请稍后再试')
  return data
}

export async function streamGreeting(payload, handlers = {}, fetchImpl = fetch) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 12000)
  try {
    const response = await fetchImpl(`${API_BASE_URL}/api/greetings/stream`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload), signal: controller.signal })
    if (!response.ok) {
      const data = await response.json().catch(() => ({}))
      throw new Error(data?.error?.message || '生成失败，请稍后再试')
    }
    if (!response.body) throw new Error('浏览器不支持流式响应')
    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ''
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      buffer += decoder.decode(value, { stream: true })
      const frames = buffer.split('\n\n')
      buffer = frames.pop() ?? ''
      for (const frame of frames) {
        const event = frame.match(/^event: (.+)$/m)?.[1]
        const raw = frame.match(/^data: (.+)$/m)?.[1]
        if (!event || !raw) continue
        const data = JSON.parse(raw)
        if (event === 'error') throw new Error(data.message)
        handlers[event]?.(data)
      }
    }
  } catch (error) {
    if (error?.name === 'AbortError') throw new Error('生成超时，请重试')
    throw error
  } finally { clearTimeout(timer) }
}
