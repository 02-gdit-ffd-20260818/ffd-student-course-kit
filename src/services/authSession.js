const key = 'ffd-p2-auth'

function storage() {
  return typeof sessionStorage === 'undefined' ? null : sessionStorage
}

export function readAuthSession() {
  try { return JSON.parse(storage()?.getItem(key) || 'null') }
  catch { return null }
}

export function saveAuthSession(session) {
  storage()?.setItem(key, JSON.stringify(session))
}

export function clearAuthSession() {
  storage()?.removeItem(key)
}

export function getAccessToken() {
  return readAuthSession()?.token || ''
}
