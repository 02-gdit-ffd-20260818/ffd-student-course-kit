import { describe, expect, it } from 'vitest'

describe('P4 v1.0 component baseline', () => {
  it('keeps the five UI states explicit', async () => {
    const source = await import('node:fs/promises').then((fs) => fs.readFile('src/App.vue', 'utf8'))
    expect(['loading', 'success', 'empty', 'error', 'fallback'].every((state) => source.includes(state))).toBe(true)
  })
})
