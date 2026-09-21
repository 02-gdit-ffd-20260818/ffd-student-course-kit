<script setup>
import { computed } from 'vue'
import ArticleComments from '../components/ArticleComments.vue'
import ArticleDetail from '../components/ArticleDetail.vue'
import { useArticles } from '../composables/useArticles.js'
import { findArticleBySlug } from '../services/articleService.js'

const interactive = Number(import.meta.env.VITE_STAGE || 11) >= 11
const props = defineProps({ slug: { type: String, required: true } })
const { store, status } = useArticles()
const article = computed(() => findArticleBySlug(store.published, props.slug))
</script>

<template>
  <p v-if="status === 'loading'" class="state-card">正在装订文章……</p>
  <template v-else><ArticleDetail :article="article" /><ArticleComments v-if="article && interactive" :article-id="article.id" /></template>
</template>
