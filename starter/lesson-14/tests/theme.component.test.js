import { describe, expect, it } from 'vitest'
import { findTheme, themes } from '../src/data/themes.js'

describe('card themes', () => {
  it('offers three distinct teaching templates', () => {
    expect(themes).toHaveLength(3)
    expect(new Set(themes.map((item) => item.id)).size).toBe(3)
  })

  it('falls back to the default template for an unknown id', () => {
    expect(findTheme('missing').id).toBe('rose')
  })
})
