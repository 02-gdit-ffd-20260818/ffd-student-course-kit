async function request(kind, credentials, fetcher = fetch) {
  const response = await fetcher('/api/auth/' + kind, { method: 'POST', headers: {'content-type':'application/json'}, body: JSON.stringify(credentials) })
  const body = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(body.error?.message || '操作失败，请重试')
  return body.data
}
export const loginRequest = (credentials, fetcher) => request('login', credentials, fetcher)
export const registerRequest = (credentials, fetcher) => request('register', credentials, fetcher)
