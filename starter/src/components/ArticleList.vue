<script setup>
import ArticleCard from './ArticleCard.vue'

defineProps({
  articles: { type: Array, required: true },
  status: { type: String, required: true },
  errorMessage: { type: String, default: '' },
})
defineEmits(['open', 'filter-tag', 'retry'])
</script>

<template>
  <section aria-labelledby="article-list-title" aria-live="polite">
    <div class="section-heading">
      <p class="eyebrow">阅读路径</p>
      <h1 id="article-list-title">文章列表</h1>
    </div>
    <p v-if="status === 'loading'" class="state-card">正在装订文章……</p>
    <div v-else-if="status === 'error'" class="state-card state-error">
      <p>文章暂时没有加载成功：{{ errorMessage }}</p>
      <button type="button" @click="$emit('retry')">重新加载</button>
    </div>
    <p v-else-if="status === 'empty' || articles.length === 0" class="state-card">这里还没有文章，稍后再来看看。</p>
    <div v-else class="article-grid">
      <ArticleCard
        v-for="article in articles"
        :key="article.id"
        :article="article"
        @open="$emit('open', $event)"
        @filter-tag="$emit('filter-tag', $event)"
      />
    </div>
  </section>
</template>
