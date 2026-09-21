<script setup>
import { reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth.js'
const publicPreview=import.meta.env.VITE_PUBLIC_PREVIEW==='1'
const auth=useAuthStore(), router=useRouter()
const form=reactive({username:'',displayName:'',password:''})
async function submit(){ if(await auth.register(form)) router.replace('/') }
</script>
<template>
 <section class="form-card login-card"><p class="eyebrow">一起记录学习</p><h1>创建账号</h1>
 <p>注册后即可在文章下留下评论。</p>
 <form @submit.prevent="submit">
 <p v-if="auth.errorMessage" class="field-error" role="alert">{{auth.errorMessage}}</p>
 <label class="field">用户名<input v-model.trim="form.username" autocomplete="username" pattern="[A-Za-z0-9_]{3,24}" minlength="3" maxlength="24" required /><small>3—24位英文字母、数字或下划线</small></label>
 <label class="field">昵称<input v-model.trim="form.displayName" maxlength="24" required /></label>
 <label class="field">密码<input v-model="form.password" type="password" autocomplete="new-password" minlength="12" maxlength="128" required /><small>至少12个字符</small></label>
 <button :disabled="publicPreview || auth.status==='loading'">{{auth.status==='loading'?'正在注册…':'注册并登录'}}</button>
 </form><p>已有账号？<RouterLink to="/login">去登录</RouterLink></p></section>
</template>