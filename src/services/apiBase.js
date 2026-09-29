const apiBase = String(import.meta.env?.VITE_API_BASE_URL || '').replace(/\/$/, '')

export function apiUrl(path) {
  return `${apiBase}${path}`
}
