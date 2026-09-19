<script setup>
import ArticleMedia from './ArticleMedia.vue'
defineProps({ article: { type: Object, default: null } })
</script>

<template>
  <article v-if="article" class="article-detail">
    <RouterLink to="/">← 返回文章列表</RouterLink>
    <p class="eyebrow">{{ article.publishedAt }} · {{ article.author }}</p>
    <h1>{{ article.title }}</h1>
    <template v-for="(paragraph,index) in article.content" :key="index">
      <p>{{ paragraph }}</p>
      <ArticleMedia v-for="(item,i) in (article.media||[]).filter(m=>m.afterParagraph===index+1)" :key="i" :item="item" />
    </template>
    <ArticleMedia v-for="(item,i) in (article.media||[]).filter(m=>!m.afterParagraph||m.afterParagraph>article.content.length)" :key="i" :item="item" />
  </article>
  <section v-else class="state-card">
    <h1>没有找到这篇文章</h1>
    <p>文章可能已移动，或者链接输入有误。</p>
    <RouterLink to="/">返回文章列表</RouterLink>
  </section>
</template>
