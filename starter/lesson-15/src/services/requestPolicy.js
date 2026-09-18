export function checkRequestRate(history, requester, now = Date.now(), options = {}) {
  const windowMs = options.windowMs ?? 60000
  const max = options.max ?? 2
  const key = String(requester || '匿名同学').trim().slice(0, 12) || '匿名同学'
  const active = (history.get(key) ?? []).filter((time) => now - time < windowMs)
  if (active.length >= max) return { allowed: false, key, retryAfterMs: windowMs - (now - active[0]) }
  history.set(key, [...active, now])
  return { allowed: true, key, retryAfterMs: 0 }
}
