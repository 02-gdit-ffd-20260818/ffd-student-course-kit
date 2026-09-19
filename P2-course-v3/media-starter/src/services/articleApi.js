import { getAccessToken } from './authSession.js'

const apiBase = String(import.meta.env?.VITE_API_BASE_URL || '').replace(/\/$/, '')

async function request(path, options = {}, fetcher = fetch) {
  if (import.meta.env.VITE_PUBLIC_PREVIEW === '1') {
    if(path==='/api/articles' && !options.method){ const response=await fetcher(import.meta.env.BASE_URL+'articles.json');if(!response.ok)throw new Error('预览文章无法加载');return response.json() }
    throw new Error('在线写入尚未接通，请运行本机完整工程。')
  }
  const token = getAccessToken()
  const response = await fetcher(`${apiBase}${path}`, {
    ...options,
    headers: { 'content-type': 'application/json', ...(token ? { authorization: `Bearer ${token}` } : {}), ...options.headers },
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
