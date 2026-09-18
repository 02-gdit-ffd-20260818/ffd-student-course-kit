<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { streamGreeting } from './services/greetingApi.js'
import { findTheme, themes } from './data/themes.js'
import { createShareHash, readShareHash } from './services/share.js'

const form = reactive({ receiver: '', occasion: '生日', tone: '温暖', details: '' })
const state = ref('empty')
const message = ref('')
const themeId = ref('rose')
const notice = ref('填写信息后，让一笺心意为你起草祝福。')
const canSubmit = computed(() => form.receiver.trim() && state.value !== 'loading')
const theme = computed(() => findTheme(themeId.value))
const cardStyle = computed(() => ({ background: `linear-gradient(145deg, ${theme.value.colors[0]}, ${theme.value.colors[1]})` }))

async function submit() {
  state.value = 'loading'
  message.value = ''
  notice.value = '正在生成，请稍候…'
  try {
    let mode = 'success'
    await streamGreeting(form, {
      meta(data) { mode = data.mode; state.value = data.mode === 'fallback' ? 'fallback' : 'loading'; notice.value = data.mode === 'fallback' ? 'AI 暂未配置，正在使用教学回退文案。' : 'AI 正在逐字生成…' },
      delta(data) { message.value += data.text },
      done() { state.value = mode === 'fallback' ? 'fallback' : 'success'; notice.value = mode === 'fallback' ? '已使用教学回退文案。请人工确认后再分享。' : '文案已生成，请人工确认并按需修改。' }
    })
  } catch (error) {
    state.value = 'error'
    notice.value = error.message
  }
}

async function shareCard() {
  const hash = createShareHash({ ...form, message: message.value, themeId: themeId.value })
  history.replaceState(null, '', `${location.pathname}${location.search}${hash}`)
  await navigator.clipboard.writeText(location.href)
  notice.value = '分享链接已复制。链接使用 URL 片段，不上传或保存卡片内容。'
}

async function copyMessage() {
  await navigator.clipboard.writeText(message.value)
  notice.value = '文案已复制。分享前请再次人工确认。'
}

function printCard() {
  window.print()
}

onMounted(() => {
  const shared = readShareHash(location.hash)
  if (!shared) return
  form.receiver = shared.receiver
  form.occasion = shared.occasion || '通用'
  form.tone = shared.tone || '真诚'
  message.value = shared.message
  themeId.value = shared.themeId || 'rose'
  state.value = 'success'
  notice.value = '已从分享链接打开贺卡，请确认内容来源。'
})
</script>

<template>
  <main class="shell">
    <header class="hero"><p class="eyebrow">P4 · v1.2</p><h1>一笺心意</h1><p>让技术退后一步，让祝福靠近一点。</p></header>
    <section class="workspace">
      <form class="panel form" @submit.prevent="submit">
        <h2>写下祝福线索</h2>
        <label>收礼人称呼<input v-model="form.receiver" maxlength="20" placeholder="例如：亲爱的林老师" required /></label>
        <label>祝福场景<select v-model="form.occasion"><option v-for="item in ['生日','毕业','新年','感谢','乔迁','通用']" :key="item">{{ item }}</option></select></label>
        <label>文案语气<select v-model="form.tone"><option v-for="item in ['真诚','温暖','活泼','典雅','简洁']" :key="item">{{ item }}</option></select></label>
        <label>补充信息 <span>{{ form.details.length }}/180</span><textarea v-model="form.details" maxlength="180" rows="4" placeholder="可选：共同回忆、想表达的谢意…" /></label>
        <fieldset><legend>选择贺卡模板</legend><div class="theme-list"><button v-for="item in themes" :key="item.id" type="button" class="theme-button" :aria-pressed="themeId === item.id" @click="themeId = item.id"><span>{{ item.icon }}</span>{{ item.name }}</button></div></fieldset>
        <button :disabled="!canSubmit">{{ state === 'loading' ? '正在生成…' : '生成祝福' }}</button>
      </form>
      <article class="panel preview" :style="cardStyle" aria-live="polite">
        <p class="card-mark">{{ theme.icon }}</p><p class="eyebrow">{{ theme.name }} · 贺卡预览</p><h2>{{ form.occasion || '一份祝福' }}</h2>
        <p class="message">{{ message || '你的祝福文案将在这里出现。' }}</p>
        <p class="notice" :data-state="state">{{ notice }}</p>
        <textarea v-if="message" v-model="message" aria-label="编辑祝福文案" rows="5" />
        <div v-if="message" class="card-actions"><button type="button" @click="copyMessage">复制文案</button><button type="button" @click="shareCard">复制分享链接</button><button type="button" @click="printCard">打印</button></div>
      </article>
    </section>
    <footer>模型输出仅作草稿 · 分享前请人工确认 · 密钥只保存在服务端</footer>
  </main>
</template>
