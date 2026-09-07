export function addUnique(queue, item) {
  if (queue.some((track) => track.id === item.id)) return { queue, added: false }
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
  return (currentIndex + 1) % length
}
