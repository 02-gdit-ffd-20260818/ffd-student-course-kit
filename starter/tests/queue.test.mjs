import test from 'node:test'
import assert from 'node:assert/strict'
import { addUnique, nextIndex, removeAt } from '../src/stores/queueCore.js'

test('adds unique tracks and rejects duplicate ids', () => {
  const first = addUnique([], { id: 'a' })
  assert.equal(first.added, true)
  const duplicate = addUnique(first.queue, { id: 'a' })
  assert.equal(duplicate.added, false)
  assert.equal(duplicate.queue.length, 1)
})
test('next wraps and empty queue remains safe', () => { assert.equal(nextIndex(2, 1), 0); assert.equal(nextIndex(0, -1), -1) })
test('remove keeps current index valid', () => {
  assert.deepEqual(removeAt([{ id: 'a' }, { id: 'b' }], 0, 1), { queue: [{ id: 'b' }], currentIndex: 0 })
  assert.deepEqual(removeAt([{ id: 'a' }], 0, 0), { queue: [], currentIndex: -1 })
})
