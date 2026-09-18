<script setup>
import { reactive } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth.js'

const auth = useAuthStore()
const route = useRoute()
const router = useRouter()
const form = reactive({ username: '', password: '' })

async function submit() {
  if (await auth.login(form)) router.replace(String(route.query.redirect || '/admin/articles'))
}
</script>

<template>
  <section class="form-card login-card">
    <p class="eyebrow">管理端身份验证</p>
    <h1>登录</h1>
    <p>登录状态仅保存在当前浏览器标签页；关闭标签页后需要重新登录。</p>
    <form novalidate @submit.prevent="submit">
      <p v-if="auth.errorMessage" class="field-error" role="alert">{{ auth.errorMessage }}</p>
      <label class="field">用户名<input v-model.trim="form.username" autocomplete="username" required /></label>
      <label class="field">密码<input v-model="form.password" type="password" autocomplete="current-password" required /></label>
      <button type="submit" :disabled="auth.status === 'loading'">{{ auth.status === 'loading' ? '登录中…' : '登录' }}</button>
    </form>
  </section>
</template>
