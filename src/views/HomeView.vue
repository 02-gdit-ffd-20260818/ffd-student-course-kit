<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import ArticleList from '../components/ArticleList.vue'
import { useArticles } from '../composables/useArticles.js'
import { filterArticlesByTag } from '../services/articleService.js'

const props = defineProps({ tag: { type: String, default: '' } })
const router = useRouter()
const { store, status, errorMessage, refresh } = useArticles()
const visibleArticles = computed(() => filterArticlesByTag(store.published, props.tag))
</script>

<template>
  <p v-if="tag" class="filter-note">当前标签：{{ tag }} · <RouterLink to="/">清除筛选</RouterLink></p>
  <ArticleList
    :articles="visibleArticles"
    :status="status"
    :error-message="errorMessage"
    @open="router.push({ name: 'article', params: { slug: $event } })"
    @filter-tag="router.push({ name: 'tag', params: { tag: $event } })"
    @retry="refresh"
  />
</template>
