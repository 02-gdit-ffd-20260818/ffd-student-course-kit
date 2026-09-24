// 播放模式：四种模式的规则集中在这里，写成纯函数。
//
// 为什么单独抽一个文件：这四种模式的差别全在"**放完这首下一首是谁**"，
// 以及"**手动点下一首时又是谁**"。把它们摊开写成一张表，
// 比在组件里堆一串 if-else 清楚得多，而且能直接测试。
//
// 四种模式（和主流播放器的叫法保持一致，学生一看就懂）：
//   order   顺序播放：放到最后一首就停下
//   list    列表循环：放到最后一首回到第一首
//   one     单曲循环：一直重复当前这首
//   shuffle 随机播放：每次随机挑一首没在放的

export const PLAY_MODES = [
  { key: 'order', label: '顺序播放', icon: '→', hint: '按队列顺序播放，最后一首放完就停' },
  { key: 'list', label: '列表循环', icon: '↻', hint: '最后一首放完回到第一首' },
  { key: 'one', label: '单曲循环', icon: '↻₁', hint: '一直重复当前这首' },
  { key: 'shuffle', label: '随机播放', icon: '⤮', hint: '每次随机挑一首' },
]

/** 点一下就换下一种模式，转一圈回到第一种 */
export function cyclePlayMode(current) {
  const index = PLAY_MODES.findIndex(mode => mode.key === current)
  return PLAY_MODES[(index + 1) % PLAY_MODES.length].key
}

export function describeMode(key) {
  return PLAY_MODES.find(mode => mode.key === key) ?? PLAY_MODES[0]
}

/**
 * 下一首是第几个。返回 -1 表示**停止播放**。
 *
 * @param mode      四种模式之一
 * @param length    队列长度
 * @param current   当前下标
 * @param auto      true = 这首自然放完了；false = 用户手动点的「下一首」
 * @param random    注入的随机函数，**测试时传一个固定值进来就能断言结果**
 *
 * 这里有一个容易被忽略的区别：
 * **用户手动点「下一首」时，单曲循环不应该原地不动**——
 * 那样会让人以为按钮坏了。所以 auto 为 false 时，单曲循环按顺序走。
 */
export function nextIndexByMode(mode, length, current, auto = true, random = Math.random) {
  if (!length) return -1
  if (length === 1) return auto && mode === 'order' ? -1 : 0

  if (mode === 'one') {
    // 自然放完 → 重复这一首；手动点下一首 → 往后走
    return auto ? current : (current + 1) % length
  }

  if (mode === 'shuffle') {
    // 随机但不重复当前这首：在"除当前外"的范围里取，再映射回去。
    // 这么写比 while 循环重抽好——**重抽在队列只有两首时可能转很多次**。
    const pick = Math.floor(random() * (length - 1))
    return pick >= current ? pick + 1 : pick
  }

  const next = current + 1
  if (next < length) return next
  // 已经是最后一首
  if (mode === 'list') return 0
  // order：自然放完就停；手动点下一首则绕回开头（否则按钮像是坏的）
  return auto ? -1 : 0
}

/** 上一首。所有模式都按顺序往前退，随机模式也一样——用户要的是"回到刚才那首"的方向 */
export function prevIndexByMode(length, current) {
  if (!length) return -1
  return current <= 0 ? length - 1 : current - 1
}
