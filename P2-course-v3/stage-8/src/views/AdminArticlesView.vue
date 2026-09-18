<script setup>
import { computed, ref } from 'vue'
import { useArticles } from '../composables/useArticles.js'
import { searchArticles } from '../services/articleEditorService.js'

const query = ref('')
const { store } = useArticles()
const results = computed(() => searchArticles(store.items, query.value))

function confirmRemove(article) {
  if (window.confirm(`确认删除《${article.title}》？此操作无法撤销。`)) store.remove(article.id)
}
</script>

<template>
  <section>
    <div class="admin-heading">
      <div><p class="eyebrow">管理端</p><h1>文章管理</h1></div>
      <RouterLink class="button-link" to="/admin/articles/new">新建文章</RouterLink>
    </div>
    <label class="field">搜索文章<input v-model.trim="query" type="search" placeholder="标题、摘要或标签" /></label>
    <p v-if="results.length === 0" class="state-card">没有匹配的文章。</p>
    <div v-else class="admin-list">
      <article v-for="article in results" :key="article.id" class="admin-row">
        <div><strong>{{ article.title }}</strong><span class="status-badge">{{ article.status === 'draft' ? '草稿' : '已发布' }}</span></div>
        <div class="row-actions">
          <RouterLink :to="`/admin/articles/${article.id}/preview`">预览</RouterLink>
          <RouterLink :to="`/admin/articles/${article.id}/edit`">编辑</RouterLink>
          <button type="button" @click="confirmRemove(article)">删除</button>
        </div>
      </article>
    </div>
  </section>
</template>
