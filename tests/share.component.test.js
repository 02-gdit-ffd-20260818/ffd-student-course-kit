import { describe, expect, it } from 'vitest'
import { createShareHash, readShareHash } from '../src/services/share.js'

describe('share URL fragment', () => {
  it('round-trips Chinese card content without a database', () => {
    const card = { receiver: '林老师', occasion: '感谢', tone: '真诚', message: '谢谢一路照亮。', themeId: 'forest' }
    expect(readShareHash(createShareHash(card))).toEqual(card)
  })

  it('rejects malformed or oversized fragments', () => {
    expect(readShareHash('#card=broken')).toBeNull()
    expect(readShareHash(`#card=${'a'.repeat(1900)}`)).toBeNull()
  })
})
