import crypto from 'node:crypto'

const TOKEN_TTL_SECONDS = 8 * 60 * 60

export function hashPassword(password, salt = crypto.randomBytes(16).toString('hex')) {
  if (typeof password !== 'string' || password.length < 12) throw new Error('password must contain at least 12 characters')
  return { salt, hash: crypto.scryptSync(password, salt, 64).toString('hex') }
}

export function verifyPassword(password, salt, expectedHash) {
  if (!password || !salt || !expectedHash) return false
  const actual = crypto.scryptSync(password, salt, 64)
  const expected = Buffer.from(expectedHash, 'hex')
  return actual.length === expected.length && crypto.timingSafeEqual(actual, expected)
}

export function createAccessToken(user, secret, now = Date.now()) {
  if (!secret || secret.length < 32) throw new Error('SESSION_SECRET must contain at least 32 characters')
  const payload = Buffer.from(JSON.stringify({ sub: user.id, role: user.role, username: user.username, exp: Math.floor(now / 1000) + TOKEN_TTL_SECONDS })).toString('base64url')
  const signature = crypto.createHmac('sha256', secret).update(payload).digest('base64url')
  return `${payload}.${signature}`
}

export function verifyAccessToken(token, secret, now = Date.now()) {
  if (!token || !secret) return null
  const [payload, signature, extra] = token.split('.')
  if (!payload || !signature || extra) return null
  const expected = crypto.createHmac('sha256', secret).update(payload).digest()
  const actual = Buffer.from(signature, 'base64url')
  if (expected.length !== actual.length || !crypto.timingSafeEqual(expected, actual)) return null
  try {
    const claims = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'))
    return claims.exp > Math.floor(now / 1000) ? claims : null
  } catch { return null }
}

export function readBearerToken(header = '') {
  const match = /^Bearer\s+(.+)$/i.exec(header)
  return match?.[1] || ''
}
