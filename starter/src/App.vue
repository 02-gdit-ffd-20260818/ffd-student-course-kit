<script setup>
import { computed, reactive, ref } from 'vue'
import { generateGreeting } from './services/greetingApi.js'

const form = reactive({ receiver: '', occasion: '生日', tone: '温暖', details: '' })
const state = ref('empty')
const message = ref('')
const notice = ref('填写信息后，让一笺心意为你起草祝福。')
const canSubmit = computed(() => form.receiver.trim() && state.value !== 'loading')

async function submit() {
  state.value = 'loading'
  notice.value = '正在生成，请稍候…'
  try {
    const result = await generateGreeting(form)
    message.value = result.text
    state.value = result.mode === 'fallback' ? 'fallback' : 'success'
    notice.value = result.mode === 'fallback' ? 'AI 暂未配置，已使用教学回退文案。请人工确认后再分享。' : '文案已生成，请人工确认并按需修改。'
  } catch (error) {
    state.value = 'error'
    notice.value = error.message
  }
}
</script>

<template>
  <main class="shell">
    <header class="hero"><p class="eyebrow">P4 · v1.0</p><h1>一笺心意</h1><p>让技术退后一步，让祝福靠近一点。</p></header>
    <section class="workspace">
      <form class="panel form" @submit.prevent="submit">
        <h2>写下祝福线索</h2>
        <label>收礼人称呼<input v-model="form.receiver" maxlength="20" placeholder="例如：亲爱的林老师" required /></label>
        <label>祝福场景<select v-model="form.occasion"><option v-for="item in ['生日','毕业','新年','感谢','乔迁','通用']" :key="item">{{ item }}</option></select></label>
        <label>文案语气<select v-model="form.tone"><option v-for="item in ['真诚','温暖','活泼','典雅','简洁']" :key="item">{{ item }}</option></select></label>
        <label>补充信息 <span>{{ form.details.length }}/180</span><textarea v-model="form.details" maxlength="180" rows="4" placeholder="可选：共同回忆、想表达的谢意…" /></label>
        <button :disabled="!canSubmit">{{ state === 'loading' ? '正在生成…' : '生成祝福' }}</button>
      </form>
      <article class="panel preview" aria-live="polite">
        <p class="eyebrow">贺卡预览</p><h2>{{ form.occasion || '一份祝福' }}</h2>
        <p class="message">{{ message || '你的祝福文案将在这里出现。' }}</p>
        <p class="notice" :data-state="state">{{ notice }}</p>
        <textarea v-if="message" v-model="message" aria-label="编辑祝福文案" rows="5" />
      </article>
    </section>
    <footer>模型输出仅作草稿 · 分享前请人工确认 · 密钥只保存在服务端</footer>
  </main>
</template>
