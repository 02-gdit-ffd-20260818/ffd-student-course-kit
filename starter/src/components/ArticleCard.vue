<script setup>
defineProps({ article: { type: Object, required: true } })
defineEmits(['open', 'filter-tag'])
</script>

<template>
  <article class="article-card">
    <p class="article-meta">{{ article.publishedAt }} · {{ article.author }}</p>
    <h2>{{ article.title }}</h2>
    <p>{{ article.summary }}</p>
    <ul class="tag-list" aria-label="文章标签">
      <li v-for="tag in article.tags" :key="tag">
        <button class="tag" type="button" @click="$emit('filter-tag', tag)">{{ tag }}</button>
      </li>
    </ul>
    <button class="text-link" type="button" @click="$emit('open', article.slug)">阅读全文<span class="sr-only">：{{ article.title }}</span></button>
  </article>
</template>
