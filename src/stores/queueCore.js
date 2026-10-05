// 播放队列的四个核心操作，全部写成**纯函数**。
//
// 什么叫纯函数：同样的输入永远得到同样的输出，并且**不修改传进来的参数**。
// 注意下面每个函数都用 [...queue] 或 filter/map 生成新数组，而不是
// queue.push(...) / queue.splice(...) 直接改原数组。
//
// 为什么这一课要这么写：
//   1. 纯函数不依赖 Vue、不依赖浏览器，测试里直接传数组进去就能验，
//      不用启动页面、不用点鼠标（对照 tests/queue.test.mjs）。
//   2. 界面状态由 Vue 管、队列规则由这里管，两边分开，改规则不会弄坏界面。
//
// 这个文件里没有任何一处出现 ref / reactive / store，这是故意的。

// 往队列末尾加一首，已经在队列里就不重复加。
// 返回值带 added，让调用方知道到底加没加，好给用户不同的提示。
export function addUnique(queue, item) {
  // some：数组里只要有一个满足条件就返回 true
  if (queue.some(track => track.id === item.id)) return { queue, added: false }
  // [...queue, item]：展开原数组再接上新元素 = 一个新数组，原数组没被动过
  return { queue: [...queue, item], added: true }
}

// 删掉第 index 首。麻烦的地方在于：删完之后"正在播放的是第几首"可能要跟着变。
// currentIndex 是当前正在播放的下标，-1 表示没有在播放。
export function removeAt(queue, index, currentIndex) {
  // 下标越界就原样返回，不要让调用方传个 -1 进来就把队列删坏
  if (index < 0 || index >= queue.length) return { queue, currentIndex }
  // filter 保留下标不等于 index 的元素，得到新数组
  const next = queue.filter((_, itemIndex) => itemIndex !== index)

  // 删空了：没有正在播放的歌了
  if (!next.length) return { queue: [], currentIndex: -1 }
  // 删的是当前播放位置**前面**的歌：当前这首整体往前挪了一格
  if (index < currentIndex) return { queue: next, currentIndex: currentIndex - 1 }
  // 删的正好是**正在播放**的那首：位置不动，自动轮到原来的下一首；
  // 但如果删的是最后一首，下标会超出新数组，用 Math.min 拉回到最后一个
  if (index === currentIndex)
    return { queue: next, currentIndex: Math.min(currentIndex, next.length - 1) }
  // 删的是当前位置**后面**的歌：跟正在播放的没关系，下标不用变
  return { queue: next, currentIndex }
}

// 下一首是第几个。% 取余让它到末尾自动绕回第 0 首，实现"列表循环播放"。
export function nextIndex(length, currentIndex) {
  if (!length) return -1
  return (currentIndex + 1) % length
}

// 把第 from 首拖到第 to 首的位置（拖动排序）。
export function moveItem(queue, from, to) {
  // 任何一个下标不合法、或者原地不动，都直接返回原队列
  if (from < 0 || to < 0 || from >= queue.length || to >= queue.length || from === to) return queue
  // 先复制一份再改，保证不动原数组
  const copy = [...queue]
  // splice(from, 1) 删掉一个元素并**返回被删掉的那些**，用解构取出第一个
  const [item] = copy.splice(from, 1)
  // splice(to, 0, item)：在 to 的位置删 0 个、插入 item
  copy.splice(to, 0, item)
  return copy
}
