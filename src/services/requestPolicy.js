// 点歌限流：同一个人在一段时间内最多点几首。
//
// 这是"滑动窗口"限流最朴素的写法——记下每个人最近几次点歌的时间戳，
// 每次来先把过期的扔掉，剩下的还超额就拒绝。
//
// 它也是纯函数风格的：所有状态都在调用方传进来的 history 里，
// 换个 Map 就是换一套独立的计数，测试时可以随便造数据。

/**
 * @param history  Map，key 是点歌人，value 是这个人最近几次点歌的时间戳数组
 * @param requester 点歌人的名字
 * @param now      当前时间。**默认值是 Date.now()，但测试时会传一个固定值进来**，
 *                 这样"一分钟后"不用真的等一分钟，直接 now + 60000 就行
 * @param options  windowMs 窗口长度（默认 60 秒），max 窗口内最多几次（默认 2 次）
 */
export function checkRequestRate(history, requester, now = Date.now(), options = {}) {
  // ?? 是空值合并：只有左边是 null / undefined 才用右边的默认值。
  // 这里不能用 ||，否则调用方传 max: 0（一次都不许点）会被当成"没传"。
  const windowMs = options.windowMs ?? 60000
  const max = options.max ?? 2

  // 名字统一处理一下再当 key：去首尾空格、最多留 12 个字、空的算"匿名同学"。
  // 不做这一步的话，"小明" 和 "小明 " 会被算成两个人，限流就形同虚设。
  const key =
    String(requester || '匿名同学')
      .trim()
      .slice(0, 12) || '匿名同学'

  // 取出这个人的历史记录（没有就当空数组），只留下还在窗口内的
  const active = (history.get(key) ?? []).filter(time => now - time < windowMs)

  // 窗口内已经点满了 → 拒绝，并告诉对方还要等多久：
  // 最早那次点歌 active[0] 什么时候滑出窗口，就是什么时候能再点
  if (active.length >= max)
    return { allowed: false, key, retryAfterMs: windowMs - (now - active[0]) }

  // 放行，并把这一次也记上
  history.set(key, [...active, now])
  return { allowed: true, key, retryAfterMs: 0 }
}
