// Pinia store：全场共享的播放队列状态。
//
// 这个文件和 queueCore.js 是**分工**关系，一定要分清：
//   queueCore.js  纯函数，只回答"队列应该变成什么样"，不知道 Vue 的存在
//   queue.js（本文件）  管响应式状态、记操作日志、被界面调用
//
// 所以下面每个函数几乎都是同一个套路：
//   调用 queueCore 的纯函数算出新队列 → 赋值给 ref → 记一条日志
// 规则错了改 queueCore，界面行为错了改这里，两边不会互相牵连。

import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { addUnique, moveItem, nextIndex, removeAt } from './queueCore.js'

// defineStore 的第一个参数 'queue' 是这个 store 的唯一名字（调试工具里靠它区分）。
// 第二个参数写成函数，就是"组合式"写法：ref 是状态，computed 是派生值，function 是操作。
export const useQueueStore = defineStore('queue', () => {
  // ref 包起来的值才是响应式的：改了它，用到它的界面会自动重新渲染。
  // 注意在 JS 里读写要加 .value，在模板里不用加。
  const items = ref([])
  // 正在播放第几首，-1 表示没有
  const currentIndex = ref(-1)
  // 播放器状态：idle 空闲 / loading 加载中 / paused 暂停
  const playerState = ref('idle')
  // 主持人可以锁定队列，锁上之后谁都不能再点歌
  const locked = ref(false)
  const activityLog = ref([])
  // computed 是"算出来的值"：items 或 currentIndex 一变，它自动跟着变，
  // 而且会缓存——依赖没变就不重新计算。
  // 这里不能写成普通函数，否则每次渲染都要重算一遍。
  const current = computed(() => items.value[currentIndex.value] ?? null)
  // 操作日志。unshift 插到最前面（最新的在上），只留最近 12 条免得越积越多。
  function log(action, detail) {
    activityLog.value.unshift({
      id: `${Date.now()}-${activityLog.value.length}`,
      at: new Date().toLocaleTimeString('zh-CN', { hour12: false }),
      action,
      detail,
    })
    activityLog.value = activityLog.value.slice(0, 12)
  }
  // 点歌
  function add(item) {
    if (locked.value) return false
    const result = addUnique(items.value, item)
    items.value = result.queue
    // 队列原来是空的，加进第一首之后自动开始播它
    if (result.added && currentIndex.value === -1) currentIndex.value = 0
    if (result.added) log('点歌', `${item.requester} · ${item.title}`)
    return result.added
  }
  // 移除某一首。谁该接着播由 queueCore.removeAt 算，这里只负责把结果装回去。
  function remove(index) {
    const title = items.value[index]?.title
    const result = removeAt(items.value, index, currentIndex.value)
    items.value = result.queue
    currentIndex.value = result.currentIndex
    playerState.value = current.value ? 'paused' : 'idle'
    if (title) log('移除', title)
  }
  // 切下一首
  function next() {
    const previous = current.value?.title
    currentIndex.value = nextIndex(items.value.length, currentIndex.value)
    playerState.value = current.value ? 'loading' : 'idle'
    if (previous) log('切歌', `${previous} → ${current.value?.title || '空队列'}`)
  }
  // 拖动排序。难点：排序之后"正在播放的那首"下标会变，
  // 所以先记住它的 id，排完再按 id 找回它现在排第几。
  function move(from, to) {
    const activeId = current.value?.id
    items.value = moveItem(items.value, from, to)
    currentIndex.value = activeId ? items.value.findIndex(item => item.id === activeId) : -1
    log('排序', `${from + 1} → ${to + 1}`)
  }
  function toggleLock() {
    locked.value = !locked.value
    log(locked.value ? '锁定' : '开放', '点歌队列')
  }
  function clear() {
    items.value = []
    currentIndex.value = -1
    playerState.value = 'idle'
    log('清空', '播放队列')
  }
  // 从快照恢复（比如刷新页面后）。**外面来的数据一律不能信**，
  // 所以下面每一项都要夹逼回合法范围：最多 30 首，下标不能越界。
  function restore(snapshot) {
    // 连 items 都不是数组，直接不恢复，总比把界面弄崩好
    if (!Array.isArray(snapshot?.items)) return
    items.value = snapshot.items.slice(0, 30)
    currentIndex.value = Math.min(
      Math.max(Number(snapshot.currentIndex) || 0, 0),
      Math.max(items.value.length - 1, 0),
    )
    if (!items.value.length) currentIndex.value = -1
    playerState.value = current.value ? 'paused' : 'idle'
  }
  return {
    items,
    currentIndex,
    current,
    playerState,
    locked,
    activityLog,
    add,
    remove,
    next,
    move,
    toggleLock,
    clear,
    restore,
  }
})
