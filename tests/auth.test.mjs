import test from 'node:test'
import assert from 'node:assert/strict'
import { createAccessToken, hashPassword, readBearerToken, verifyAccessToken, verifyPassword } from '../server/services/auth.js'

const secret = '0123456789abcdef0123456789abcdef'

test('scrypt 密码哈希使用 salt 且可验证', () => {
  const record = hashPassword('safe-password-123', 'aabbccddeeff00112233445566778899')
  assert.equal(verifyPassword('safe-password-123', record.salt, record.hash), true)
  assert.equal(verifyPassword('wrong-password', record.salt, record.hash), false)
  assert.equal(record.hash.includes('safe-password-123'), false)
})

test('访问令牌可验证且篡改后失效', () => {
  const user = { id: 7, username: 'teacher', role: 'admin' }
  const token = createAccessToken(user, secret, 1_000_000)
  assert.equal(verifyAccessToken(token, secret, 1_000_001).sub, 7)
  assert.equal(verifyAccessToken(`${token}x`, secret, 1_000_001), null)
})

test('过期令牌和非 Bearer 头被拒绝', () => {
  const token = createAccessToken({ id: 1, username: 'a', role: 'author' }, secret, 0)
  assert.equal(verifyAccessToken(token, secret, 40_000_000), null)
  assert.equal(readBearerToken(`Bearer ${token}`), token)
  assert.equal(readBearerToken(`Basic ${token}`), '')
})
