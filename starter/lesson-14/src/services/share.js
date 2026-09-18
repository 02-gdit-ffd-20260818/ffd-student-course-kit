const MAX_FRAGMENT_LENGTH = 1800

function toBase64Url(text) {
  const bytes = new TextEncoder().encode(text)
  let binary = ''
  for (const byte of bytes) binary += String.fromCharCode(byte)
  return btoa(binary).replaceAll('+', '-').replaceAll('/', '_').replace(/=+$/g, '')
}

function fromBase64Url(value) {
  const normalized = value.replaceAll('-', '+').replaceAll('_', '/')
  const binary = atob(normalized + '='.repeat((4 - normalized.length % 4) % 4))
  return new TextDecoder().decode(Uint8Array.from(binary, (char) => char.charCodeAt(0)))
}

export function createShareHash(card) {
  const safe = { receiver: String(card.receiver || '').slice(0, 20), occasion: String(card.occasion || '').slice(0, 10), tone: String(card.tone || '').slice(0, 10), message: String(card.message || '').slice(0, 260), themeId: 'rose' /* TODO-A：保留主题 */ }
  const hash = `#card=${toBase64Url(JSON.stringify(safe))}`
  if (hash.length > MAX_FRAGMENT_LENGTH) throw new Error('分享内容过长，请精简文案')
  return hash
}

export function readShareHash(hash) {
  if (!hash?.startsWith('#card=') || hash.length > MAX_FRAGMENT_LENGTH) return null
  try {
    const value = JSON.parse(fromBase64Url(hash.slice(6)))
    // TODO-B：校验并恢复分享内容
    if (true) return null
    return value
  } catch { return null }
}
