import { describe, expect, it } from 'vitest'
import { findTheme, themes } from '../src/data/themes.js'

describe('card themes', () => {
  it('每套卡面都有独立 id，并且字段齐全', () => {
    expect(themes.length).toBeGreaterThanOrEqual(3)
    expect(new Set(themes.map(item => item.id)).size).toBe(themes.length)
    // ink 和 page 是 v2.0 新增的：分享页要用它们决定文字色和整页底色，
    // 少一个就会出现"深底配深字"这种看不清的卡片
    for (const item of themes) {
      expect(item.colors).toHaveLength(2)
      expect(item.ink).toMatch(/^#[0-9a-fA-F]{6}$/)
      expect(item.page).toMatch(/^#[0-9a-fA-F]{6}$/)
      expect(item.name).toBeTruthy()
    }
  })

  it('id 不认识时退回第一套卡面，而不是崩掉', () => {
    expect(findTheme('missing').id).toBe(themes[0].id)
    expect(findTheme(undefined).id).toBe(themes[0].id)
  })
})
