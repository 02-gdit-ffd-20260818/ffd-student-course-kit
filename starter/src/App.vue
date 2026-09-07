<script setup>
import { computed, nextTick, ref } from 'vue'
import { MockMusicAdapter, safeSearch } from './adapters/musicAdapter.js'
import { useQueueStore } from './stores/queue.js'

const adapter = new MockMusicAdapter()
const queue = useQueueStore()
const keyword = ref('音乐')
const requester = ref('')
const results = ref([])
const searchState = ref('idle')
const notice = ref('搜索课堂合成音，开始第一轮点歌。')
const audio = ref(null)
const progress = ref(0)
const stateLabel = computed(() => ({ idle: '等待点歌', loading: '载入中', playing: '播放中', paused: '已暂停', error: '播放失败' })[queue.playerState])

async function search() {
  const clean = keyword.value.trim()
  if (!clean) { results.value = []; searchState.value = 'empty'; notice.value = '请输入关键词'; return }
  searchState.value = 'loading'
  const response = await safeSearch(adapter, clean)
  results.value = response.items
  searchState.value = response.error ? 'error' : response.items.length ? 'success' : 'empty'
  notice.value = response.error || (response.items.length ? `找到 ${response.items.length} 首课堂样例` : '没有找到结果，换个关键词试试')
}

function requestTrack(track) {
  const added = queue.add(adapter.toQueueItem(track, requester.value || '匿名同学'))
  notice.value = added ? `“${track.title}”已加入队列` : '这首歌已经在队列中'
}

async function playCurrent() {
  if (!queue.current) return
  queue.playerState = 'loading'
  await nextTick()
  try { await audio.value.play() } catch { queue.playerState = 'error'; notice.value = '浏览器阻止了播放，请再次点击播放' }
}

async function playNext() { queue.next(); await nextTick(); if (queue.current) playCurrent() }
function updateProgress(event) { progress.value = event.target.duration ? event.target.currentTime / event.target.duration * 100 : 0 }
search()
</script>

<template>
  <main class="shell">
    <header><p class="eyebrow">P5 · v1.0 · MOCK QUEUE</p><h1>星声音乐站</h1><p>让每一次点歌都有秩序，让每一种声音都有出处。</p></header>
    <section class="now-playing">
      <div><p class="eyebrow">NOW PLAYING</p><h2>{{ queue.current?.title || '等待第一首歌' }}</h2><p>{{ queue.current ? `${queue.current.artist} · 点歌：${queue.current.requester}` : '从搜索结果加入播放队列' }}</p></div>
      <div class="player-controls"><button type="button" :disabled="!queue.current" @click="playCurrent">▶ 播放</button><button type="button" :disabled="!queue.current" @click="audio?.pause()">Ⅱ 暂停</button><button type="button" :disabled="!queue.current" @click="playNext">下一首 →</button></div>
      <div class="status"><span>{{ stateLabel }}</span><div><i :style="{ width: `${progress}%` }"></i></div></div>
      <audio ref="audio" :src="queue.current?.previewUrl" @play="queue.playerState='playing'" @pause="queue.playerState = queue.current ? 'paused' : 'idle'" @ended="playNext" @error="queue.playerState='error'" @timeupdate="updateProgress" />
    </section>
    <section class="grid">
      <article class="panel search-panel"><p class="eyebrow">01 · SEARCH</p><h2>搜索与点歌</h2><form @submit.prevent="search"><input v-model="keyword" maxlength="40" aria-label="搜索音乐" placeholder="输入“音乐”"><input v-model="requester" maxlength="12" aria-label="点歌人" placeholder="你的名字（可选）"><button>搜索</button></form><p class="notice" aria-live="polite">{{ searchState === 'loading' ? '搜索中…' : notice }}</p><ul class="results"><li v-for="track in results" :key="track.id"><div><strong>{{ track.title }}</strong><small>{{ track.artist }}</small></div><button type="button" @click="requestTrack(track)">＋ 点歌</button></li></ul></article>
      <article class="panel queue-panel"><div class="panel-title"><div><p class="eyebrow">02 · QUEUE</p><h2>播放队列</h2></div><button class="text-button" type="button" :disabled="!queue.items.length" @click="queue.clear">清空</button></div><p v-if="!queue.items.length" class="empty">队列还是空的，先点一首歌吧。</p><ol><li v-for="(track,index) in queue.items" :key="track.id" :class="{current:index===queue.currentIndex}"><span>{{ String(index+1).padStart(2,'0') }}</span><div><strong>{{ track.title }}</strong><small>{{ track.artist }} · {{ track.requester }}</small></div><button type="button" aria-label="移除" @click="queue.remove(index)">×</button></li></ol></article>
    </section>
    <footer>课堂默认音源为浏览器即时生成的合成音 · 不抓取、不缓存、不传播未授权内容</footer>
  </main>
</template>
