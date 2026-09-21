<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import AppShell from './components/AppShell.vue'
import ArticleDetail from './components/ArticleDetail.vue'
import ArticleList from './components/ArticleList.vue'
import { loadArticles } from './services/articleLoader.js'
import { filterArticlesByTag, findArticleBySlug } from './services/articleService.js'
import { parseHash } from './services/routeService.js'

const articles = ref([])
const status = ref('loading')
const errorMessage = ref('')
const route = ref(parseHash(window.location.hash))

const visibleArticles = computed(() => route.value.name === 'tag'
  ? filterArticlesByTag(articles.value, route.value.param)
  : articles.value)
const selectedArticle = computed(() => findArticleBySlug(articles.value, route.value.param))

function updateRoute() {
  route.value = parseHash(window.location.hash)
}

function openArticle(slug) {
  window.location.hash = `/articles/${encodeURIComponent(slug)}`
}

function filterTag(tag) {
  window.location.hash = `/tags/${encodeURIComponent(tag)}`
}

async function refresh() {
  status.value = 'loading'
  errorMessage.value = ''
  const params = new URLSearchParams(window.location.search)
  if (params.has('fail')) {
    const result = await loadArticles(async () => ({ ok: false, status: 503 }))
    status.value = result.status
    errorMessage.value = result.message
    return
  }
  if (params.has('empty')) {
    articles.value = []
    status.value = 'empty'
    return
  }
  const result = await loadArticles(fetch, `${import.meta.env.BASE_URL}articles.json`)
  articles.value = result.articles
  status.value = result.status
  errorMessage.value = result.message
}

onMounted(() => {
  window.addEventListener('hashchange', updateRoute)
  refresh()
})
onBeforeUnmount(() => window.removeEventListener('hashchange', updateRoute))
</script>

<template>
  <a class="skip-link" href="#main-content">跳到主要内容</a>
  <AppShell>
    <template #navigation>
      <a href="#/">文章</a>
      <a href="#/about">关于</a>
    </template>

    <ArticleList
      v-if="route.name === 'home' || route.name === 'tag'"
      :articles="visibleArticles"
      :status="status"
      :error-message="errorMessage"
      @open="openArticle"
      @filter-tag="filterTag"
      @retry="refresh"
    />
    <ArticleDetail v-else-if="route.name === 'article'" :article="selectedArticle" />
    <section v-else-if="route.name === 'about'" class="prose-card">
      <p class="eyebrow">关于</p>
      <h1>为什么写“长风成卷”</h1>
      <p>这里保存前端学习中的真实问题、代码选择和发布证据。</p>
    </section>
    <section v-else class="state-card">
      <h1>页面不存在</h1>
      <a href="#/">返回文章列表</a>
    </section>
  </AppShell>
</template>
