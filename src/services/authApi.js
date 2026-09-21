export async function loginRequest(credentials, fetcher = fetch) {
  const response = await fetcher('/api/auth/login', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(credentials),
  })
  const body = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(body.error?.message || '登录失败')
  return body.data
}
