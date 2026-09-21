<script setup>
import { watch } from 'vue'
import { useArticleStore } from './stores/articles.js'
import { storeToRefs } from 'pinia'
import AppShell from './components/AppShell.vue'
import { useAuthStore } from './stores/auth.js'

const interactive = Number(import.meta.env.VITE_STAGE || 11) >= 11
const articles = useArticleStore()
const auth = useAuthStore()
watch(() => auth.session, () => { articles.items=[];articles.ready=false;articles.fetchAll() })
const { loggedIn, user } = storeToRefs(auth)
</script>

<template>
  <a class="skip-link" href="#main-content">跳到主要内容</a>
  <AppShell>
    <template #navigation>
      <RouterLink to="/">文章</RouterLink>
      <RouterLink to="/about">关于</RouterLink>
      <RouterLink v-if="user?.role==='admin'" to="/admin/articles">管理</RouterLink>
      <span v-if="interactive && loggedIn" class="auth-summary">{{ user.displayName }} <button type="button" @click="auth.logout">退出</button></span>
      <template v-else-if="interactive"><RouterLink to="/login">登录</RouterLink><RouterLink to="/register">注册</RouterLink></template>
    </template>
    <RouterView />
  </AppShell>
</template>
