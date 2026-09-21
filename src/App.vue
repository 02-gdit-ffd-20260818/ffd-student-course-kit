<script setup>
import { storeToRefs } from 'pinia'
import AppShell from './components/AppShell.vue'
import { useAuthStore } from './stores/auth.js'

const auth = useAuthStore()
const { loggedIn, user } = storeToRefs(auth)
</script>

<template>
  <a class="skip-link" href="#main-content">跳到主要内容</a>
  <AppShell>
    <template #navigation>
      <RouterLink to="/">文章</RouterLink>
      <RouterLink to="/about">关于</RouterLink>
      <RouterLink to="/admin/articles">管理</RouterLink>
      <span v-if="loggedIn" class="auth-summary">{{ user.displayName }} <button type="button" @click="auth.logout">退出</button></span>
      <RouterLink v-else to="/login">登录</RouterLink>
    </template>
    <RouterView />
  </AppShell>
</template>
