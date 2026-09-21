<script setup>
import { ref, watch } from 'vue'
import { useAuthStore } from '../stores/auth.js'
import { apiUrl } from '../services/apiBase.js'
const props=defineProps({articleId:{type:Number,required:true}}),auth=useAuthStore()
const comments=ref([]),body=ref(''),error=ref(''),loading=ref(false),saving=ref(false)
let version=0
async function request(url,method='GET',data){
 const headers={};if(auth.session?.token)headers.authorization='Bearer '+auth.session.token
 if(data)headers['content-type']='application/json'
 const response=await fetch(apiUrl(url),{method,headers,body:data?JSON.stringify(data):undefined})
 const payload=response.status===204?{}:await response.json().catch(()=>({}))
 if(!response.ok)throw new Error(payload.error?.message||'评论暂时无法加载，请重试')
 return payload.data
}
async function load(){const mine=++version;loading.value=true;error.value='';try{const rows=await request('/api/articles/'+props.articleId+'/comments');if(mine===version)comments.value=rows}catch(e){if(mine===version)error.value=e.message}finally{if(mine===version)loading.value=false}}
async function submit(){saving.value=true;error.value='';try{await request('/api/articles/'+props.articleId+'/comments','POST',{body:body.value});body.value='';await load()}catch(e){error.value=e.message}finally{saving.value=false}}
async function remove(id){saving.value=true;error.value='';try{await request('/api/comments/'+id,'DELETE');await load()}catch(e){error.value=e.message}finally{saving.value=false}}
watch(()=>props.articleId,()=>{body.value='';comments.value=[];load()},{immediate:true})
</script>
<template><section class="comments-panel" aria-labelledby="comments-title"><h2 id="comments-title">文章评论</h2>
 <p v-if="error" class="field-error" role="alert">{{error}} <button type="button" @click="load">重试</button></p>
 <form v-if="auth.loggedIn" @submit.prevent="submit"><label class="field">以 {{auth.user.displayName}} 的身份留言<textarea v-model="body" rows="4" maxlength="1000" required placeholder="分享理解，或提出你的问题。" /></label><button :disabled="saving||!body.trim()">{{saving?'正在处理…':'发布评论'}}</button></form>
 <p v-else><RouterLink to="/login">登录</RouterLink>或<RouterLink to="/register">注册</RouterLink>后参与讨论。</p>
 <p v-if="loading" role="status">正在加载评论…</p><p v-else-if="!comments.length&&!error" class="muted">还没有评论，欢迎留下第一条学习记录。</p>
 <article v-for="comment in comments" :key="comment.id" class="comment-row"><div class="comment-meta"><strong>{{comment.author}}</strong><time>{{comment.createdAt}}</time><button v-if="auth.user&&(auth.user.id===comment.userId||auth.user.role==='admin')" type="button" :disabled="saving" @click="remove(comment.id)">删除</button></div><p>{{comment.body}}</p></article>
 </section></template>
