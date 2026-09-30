import { describe, expect, it } from 'vitest'
import { readFile } from 'node:fs/promises'
describe('P5 UI contract', () => { it('shows search, queue and player states', async () => { const source = await readFile('src/App.vue','utf8'); expect(['searchState','playerState','播放队列','合成音'].every((item)=>source.includes(item))).toBe(true) }) })
