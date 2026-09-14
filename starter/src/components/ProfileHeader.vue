<script setup>
defineProps({ theme: { type: String, required: true } })
defineEmits(['toggle-theme'])
</script>

<template>
  <header class="site-header" data-version="p1-v2.0">
    <p class="eyebrow">Frontend Learner</p>
    <h1>你好，我是林晓</h1>
    <p class="lead">我用清晰、可靠的网页，帮助人们更轻松地获取信息。</p>
    <button
      class="theme-toggle"
      type="button"
      :aria-pressed="theme === 'dark'"
      @click="$emit('toggle-theme')"
    >
      {{ theme === 'dark' ? '切换浅色主题' : '切换深色主题' }}
    </button>
  </header>
</template>
