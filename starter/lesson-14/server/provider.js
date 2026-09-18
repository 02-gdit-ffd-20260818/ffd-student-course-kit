import { buildPrompt, createFallbackGreeting } from './prompt.js'

function extractOutputText(payload) {
  if (typeof payload?.output_text === 'string') return payload.output_text.trim()
  return (payload?.output ?? [])
    .flatMap((item) => item?.content ?? [])
    .filter((part) => part?.type === 'output_text' && typeof part.text === 'string')
    .map((part) => part.text)
    .join('')
    .trim()
}

export async function generateGreeting(input, options = {}) {
  const env = options.env ?? process.env
  const fetchImpl = options.fetchImpl ?? fetch
  if (env.AI_PROVIDER !== 'openai' || !env.OPENAI_API_KEY) {
    return { text: createFallbackGreeting(input), mode: 'fallback', reason: 'provider_not_configured' }
  }

  const controller = new AbortController()
  const timeoutMs = Number(env.AI_TIMEOUT_MS || 8000)
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const prompt = buildPrompt(input)
    const response = await fetchImpl(`${env.OPENAI_BASE_URL || 'https://api.openai.com/v1'}/responses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${env.OPENAI_API_KEY}` },
      body: JSON.stringify({ model: env.OPENAI_MODEL || 'gpt-5.4-mini', instructions: prompt.instructions, input: prompt.input, max_output_tokens: 180, store: false }),
      signal: controller.signal
    })
    if (!response.ok) throw new Error(`upstream_${response.status}`)
    const text = extractOutputText(await response.json())
    if (!text) throw new Error('upstream_empty')
    return { text: text.slice(0, 260), mode: 'ai', reason: null }
  } catch (error) {
    const reason = error?.name === 'AbortError' ? 'upstream_timeout' : 'upstream_unavailable'
    return { text: createFallbackGreeting(input), mode: 'fallback', reason }
  } finally {
    clearTimeout(timer)
  }
}
