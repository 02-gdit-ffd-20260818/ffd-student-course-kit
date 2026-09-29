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
// ============ P5 第2课 任务 TODO 02（简单）：同一首歌不能进两次 ============
// 页面上看得到的结果：同一首歌连点两次 ＋，现在队列里会出现两条一模一样的。
// 做完之后第二次会提示"已经在队列里了（第 N 位）"。
//
// TODO 两件事：
//   1) 用 queue.some(track => track.id === item.id) 判断是不是已经有了
//   2) **用 [...queue, item] 生成新数组，不要用 queue.push(item)**
//
// 第 2 点是这一课的主线。为什么不用 push：
//   push 会**改掉传进来的那个数组**。调用方拿着同一个数组，
//   在不知情的情况下内容变了——这类 bug 极难查。
//   `[...queue, item]` 生成一个新数组，原来那个一动没动。
//
// 返回值里带 added，是为了让调用方知道**到底加没加**，好给用户不同的提示。
// ================================================================
export function addUnique(queue, item) {
  queue.push(item)
  return { queue, added: true }
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
// ============ P5 第2课 任务 TODO 04（中等）：主持人调整顺序 ============
// 页面上看得到的结果：点「主持台」，队列每一项右边出现 ↑ ↓。
// 现在点了没反应；做完之后能把某一首往前往后挪。
//
// TODO：
//   1) 下标不合法或原地不动，**原样返回**（别让一个 -1 把队列搅乱）
//   2) const copy = [...queue]  先复制再改
//   3) const [item] = copy.splice(from, 1)   取出要挪的那一首
//   4) copy.splice(to, 0, item)              插到新位置
//
// splice 的两种用法值得记一下：
//   splice(i, 1)        删掉 1 个，**返回被删掉的那些**（是个数组，所以用解构取第一个）
//   splice(i, 0, item)  删 0 个、插入 item
//
// 同样是**先复制再改**：直接在 queue 上 splice 会改掉调用方的数组。
// ============================================================
export function moveItem(queue) {
  return queue
}
