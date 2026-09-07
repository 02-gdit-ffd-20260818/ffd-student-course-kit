export async function generateGreeting(payload, fetchImpl = fetch) {
  const response = await fetchImpl('/api/greetings/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })
  const data = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(data?.error?.message || '生成失败，请稍后再试')
  return data
}
