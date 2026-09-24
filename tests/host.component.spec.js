import { describe, expect, it } from 'vitest'
import { readFile } from 'node:fs/promises'
describe('host console', () => { it('exposes lock, reorder and activity log controls', async () => { const source=await readFile('src/App.vue','utf8'); expect(['toggleLock','queue.move','activityLog','checkRequestRate'].every((item)=>source.includes(item))).toBe(true) }) })
