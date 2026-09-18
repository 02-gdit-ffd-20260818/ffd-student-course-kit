const base = String(import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '')
const endpoint = (path) => `${base}${path}`

async function request(path, { token, ...options } = {}) {
  const headers = { ...(options.body ? { 'content-type': 'application/json' } : {}), ...(token ? { authorization: `Bearer ${token}` } : {}), ...options.headers }
  const response = await fetch(endpoint(path), { ...options, headers })
  if (!response.ok) {
    const body = await response.json().catch(() => ({}))
    const error = new Error(body.error?.message || `request failed: ${response.status}`)
    error.status = response.status
    error.code = body.error?.code
    error.details = body.error
    throw error
  }
  return response
}

export async function login(credentials) { return (await (await request('/api/auth/login', { method: 'POST', body: JSON.stringify(credentials) })).json()).data }
export async function listPublicMembers() { return (await (await request('/api/members')).json()).data }
export async function submitMember(data, token) { return (await (await request('/api/members', { method: 'POST', body: JSON.stringify(data), token })).json()).data }
export async function listReviewMembers(token) { return (await (await request('/api/review/members', { token })).json()).data }
export async function reviewMember(id, status, note, token) { return (await (await request(`/api/review/members/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status, note }), token })).json()).data }
export async function previewCsv(csv, token) { return (await (await request('/api/import/preview', { method: 'POST', body: JSON.stringify({ csv }), token })).json()).data }
export async function importCsv(csv, token) { return (await (await request('/api/import', { method: 'POST', body: JSON.stringify({ csv }), token })).json()).data }
export async function downloadExport(token) { return (await request('/api/export', { token })).blob() }
