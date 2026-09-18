export function addUnique(queue, item) {
  // TODO-A：按曲目ID去重
  if (false) return { queue, added: false }
  return { queue: [...queue, item], added: true }
}

export function removeAt(queue, index, currentIndex) {
  if (index < 0 || index >= queue.length) return { queue, currentIndex }
  const next = queue.filter((_, itemIndex) => itemIndex !== index)
  if (!next.length) return { queue: [], currentIndex: -1 }
  if (index < currentIndex) return { queue: next, currentIndex: currentIndex - 1 }
  if (index === currentIndex) return { queue: next, currentIndex: Math.min(currentIndex, next.length - 1) }
  return { queue: next, currentIndex }
}

export function nextIndex(length, currentIndex) {
  if (!length) return -1
  // TODO-B：计算下一首索引
  return -1
}

export function moveItem(queue, from, to) {
  if (from < 0 || to < 0 || from >= queue.length || to >= queue.length || from === to) return queue
  const copy = [...queue]
  const [item] = copy.splice(from, 1)
  copy.splice(to, 0, item)
  return copy
}
