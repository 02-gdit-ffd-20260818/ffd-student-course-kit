// 歌词：解析 LRC，并按播放进度找出"现在唱到哪一行"。
//
// 这个文件是**纯函数**——不碰网络、不碰 DOM、不依赖 Vue。
// 所以它能被直接测试：传一段文本进去，断言解析结果；
// 传一个时间进去，断言选中了第几行。不用启动页面、不用真的播歌。

/**
 * LRC 是什么：每行前面带一个时间戳的纯文本。
 *
 *   [00:14.85]冷空气的气味
 *   [ 分:秒.百分秒 ]歌词
 *
 * 还有三种要处理的情况：
 *   1. 开头几行是 [ar:歌手] [ti:标题] 这类元信息，不是歌词；
 *   2. 同一行可能有**多个时间戳**（副歌重复时常见）：[00:20.00][01:30.00]同一句；
 *   3. 有的行时间戳后面是空的（间奏），要丢掉，否则界面上会出现空行。
 */
const TIME_TAG = /\[(\d{1,2}):(\d{1,2})(?:[.:](\d{1,3}))?\]/g

export function parseLrc(text) {
  const lines = []
  for (const raw of String(text || '').split('\n')) {
    // 先把这一行所有的时间戳都找出来
    const stamps = [...raw.matchAll(TIME_TAG)]
    if (!stamps.length) continue
    // 去掉所有时间戳，剩下的才是歌词本身
    const content = raw.replace(TIME_TAG, '').trim()
    if (!content) continue
    for (const stamp of stamps) {
      const minute = Number(stamp[1])
      const second = Number(stamp[2])
      // 百分秒可能是 2 位也可能是 3 位：.85 是 850 毫秒，.850 也是 850 毫秒
      const fraction = stamp[3] ? Number(stamp[3].padEnd(3, '0')) : 0
      lines.push({ time: minute * 60 + second + fraction / 1000, text: content })
    }
  }
  // 多个时间戳拆开之后顺序会乱，按时间排一遍
  return lines.sort((a, b) => a.time - b.time)
}

/**
 * 当前时间对应第几行。
 *
 * 朴素写法是从头遍历一遍。这里用**二分查找**，原因不是"歌词能有多长"，
 * 而是：**这个函数每秒会被调用好几十次**（跟着 timeupdate 事件走）。
 * 一首歌 100 行的话，遍历要比较 100 次，二分只要 7 次。
 *
 * 这是课堂上讲"为什么要关心算法复杂度"最合适的一个例子——
 * 不是因为数据大，而是因为**调用频繁**。
 */
export function activeLineIndex(lines, time) {
  if (!lines.length) return -1
  // 还没到第一句
  if (time < lines[0].time) return -1
  let low = 0
  let high = lines.length - 1
  let found = 0
  while (low <= high) {
    const mid = (low + high) >> 1 // 等价于 Math.floor((low+high)/2)，但更快
    if (lines[mid].time <= time) {
      found = mid
      low = mid + 1
    } else {
      high = mid - 1
    }
  }
  return found
}

/** 把歌词里的元信息行（[ar:] [ti:] 之类）挑出来，界面上可以显示歌手和标题 */
export function parseLrcMeta(text) {
  const meta = {}
  for (const match of String(text || '').matchAll(/\[(ar|ti|al|by):([^\]]*)\]/g)) {
    meta[match[1]] = match[2].trim()
  }
  return meta
}
