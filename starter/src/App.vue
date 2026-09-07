<script setup>
import AppShell from './components/AppShell.vue'
</script>

<template>
  <a class="skip-link" href="#main-content">跳到主要内容</a>
  <AppShell>
    <template #navigation>
      <RouterLink to="/">文章</RouterLink>
      <RouterLink to="/about">关于</RouterLink>
      <RouterLink to="/admin/articles">管理</RouterLink>
    </template>
    <RouterView />
  </AppShell>
</template>
