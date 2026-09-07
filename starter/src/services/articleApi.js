const apiBase = String(import.meta.env?.VITE_API_BASE_URL || '').replace(/\/$/, '')

async function request(path, options = {}, fetcher = fetch) {
  const response = await fetcher(`${apiBase}${path}`, {
    ...options,
    headers: { 'content-type': 'application/json', ...options.headers },
  })
  if (response.status === 204) return null
  const body = await response.json().catch(() => ({}))
  if (!response.ok) {
    const error = new Error(body.error?.message || `HTTP ${response.status}`)
    error.status = response.status
    error.fields = body.error?.fields || {}
    throw error
  }
  return body.data
}

export const articleApi = {
  list(fetcher) { return request('/api/articles', {}, fetcher) },
  get(id, fetcher) { return request(`/api/articles/${id}`, {}, fetcher) },
  create(article, fetcher) { return request('/api/articles', { method: 'POST', body: JSON.stringify(article) }, fetcher) },
  update(id, article, fetcher) { return request(`/api/articles/${id}`, { method: 'PUT', body: JSON.stringify(article) }, fetcher) },
  remove(id, fetcher) { return request(`/api/articles/${id}`, { method: 'DELETE' }, fetcher) },
}
