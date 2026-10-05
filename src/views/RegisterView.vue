<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth.js'
const auth = useAuthStore(), router = useRouter()
const created = ref(false)
const form = reactive({ username: '', displayName: '', password: '' })
async function submit() {
  created.value = false
  if (!(await auth.register(form))) return
  // 201 表示账号创建成功；有没有 token 才决定是否登录。两件事不能混为一谈。
  if (auth.loggedIn) router.replace('/')
  else created.value = true
}
</script>
<template>
  <section class="form-card login-card">
    <p class="eyebrow">一起记录学习</p><h1>创建账号</h1>
    <p>第07课：先创建账号，完成 TODO 04 后体验注册即登录。</p>
    <p v-if="created" role="status">账号已创建，但尚未自动登录。可以继续本课任务，或点击下方“去登录”；不要把这个成功提示当成错误重复注册。</p>
    <form @submit.prevent="submit">
      <p v-if="auth.errorMessage" class="field-error" role="alert">{{ auth.errorMessage }}</p>
      <label class="field">用户名<input v-model.trim="form.username" autocomplete="username" pattern="[A-Za-z0-9_]{3,24}" minlength="3" maxlength="24" required /><small>3—24位英文字母、数字或下划线</small></label>
      <label class="field">昵称<input v-model.trim="form.displayName" maxlength="24" required /></label>
      <label class="field">密码<input v-model="form.password" type="password" autocomplete="new-password" minlength="12" maxlength="128" required /><small>至少12个字符</small></label>
      <button :disabled="auth.status === 'loading'">{{ auth.status === 'loading' ? '正在提交…' : '创建账号' }}</button>
    </form>
    <p>已有账号？<RouterLink to="/login">去登录</RouterLink></p>
  </section>
</template>
