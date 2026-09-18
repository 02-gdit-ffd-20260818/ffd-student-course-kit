<script setup>
import { computed } from 'vue'
import ArticleDetail from '../components/ArticleDetail.vue'
import { useArticles } from '../composables/useArticles.js'

const props = defineProps({ id: { type: String, required: true } })
const { store } = useArticles()
const article = computed(() => store.byId(props.id))
</script>

<template>
  <p class="preview-banner">管理预览：草稿也会显示，但不会出现在公开阅读端。</p>
  <ArticleDetail :article="article" />
</template>
