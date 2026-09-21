<script setup>
import { computed, reactive, ref, watch } from 'vue'
import { getAccessToken } from '../services/authSession.js'
import { apiUrl } from '../services/apiBase.js'
import { useRouter } from 'vue-router'
import { useArticles } from '../composables/useArticles.js'

const props = defineProps({ id: { type: String, default: '' } })
const router = useRouter()
const { store } = useArticles()
const uploading=ref(false)
const saved = ref(false)
const errors = ref({})
const formError = ref('')
const existing = computed(() => store.byId(props.id))
const form = reactive({ id: '', title: '', slug: '', summary: '', content: '', tags: '', status: 'draft', author: '林晓', publishedAt: '', media: [] })

watch(existing, (article) => {
  if (!article) return
  Object.assign(form, article, { content: article.content.join('\n\n'), tags: article.tags.join(', '),media:(article.media||[]).map(item=>({...item})) })
}, { immediate: true })

async function upload(event,item){
 const file=event.target.files?.[0];if(!file)return
 if(file.size>40*1024*1024){formError.value='文件不能超过40MB';return}
 uploading.value=true;formError.value=''
 try{ const data=new FormData();data.append('file',file)
  const response=await fetch(apiUrl('/api/media/upload'),{method:'POST',headers:{authorization:'Bearer '+getAccessToken()},body:data})
  const payload=await response.json();if(!response.ok)throw new Error(payload.error?.message||'上传失败')
  item.url=payload.data.url;item.type=payload.data.type
 }catch(e){formError.value=e.message}finally{uploading.value=false;event.target.value=''}
}
async function submit() {
  formError.value = ''
  const result = await store.save(form)
  errors.value = result.errors
  if (!result.ok) {
    formError.value = result.formError || ''
    return
  }
  saved.value = true
  router.push('/admin/articles')
}
</script>

<template>
  <section class="form-card">
    <p class="eyebrow">{{ id ? '编辑' : '新建' }}</p>
    <h1>文章表单</h1>
    <form novalidate @submit.prevent="submit">
      <p v-if="formError" class="field-error">{{ formError }}</p>
      <label class="field">标题<input v-model.trim="form.title" maxlength="60" /><span v-if="errors.title" class="field-error">{{ errors.title }}</span></label>
      <label class="field">摘要<textarea v-model.trim="form.summary" maxlength="160" rows="3" /><span v-if="errors.summary" class="field-error">{{ errors.summary }}</span></label>
      <label class="field">正文<textarea v-model="form.content" rows="8" /></label>
      <fieldset class="media-editor"><legend>图片、音乐与视频</legend>
        <p>可填本站资源路径或HTTPS链接，也可以上传本机文件。先做一张图片，再加入音频和视频。</p>
        <section v-for="(item,index) in form.media" :key="index" class="media-edit-row">
          <label class="field">媒体类型<select v-model="item.type"><option value="image">图片</option><option value="audio">音乐 / 音频</option><option value="video">视频</option></select></label>
          <label class="field">资源地址<input v-model.trim="item.url" placeholder="/media/course-diagram.png 或 https://…" /></label>
          <label class="field">上传文件<input type="file" accept=".png,.jpg,.jpeg,.webp,.mp3,.wav,.ogg,.mp4,.webm" :disabled="uploading" @change="upload($event,item)" /></label>
          <label v-if="item.type==='image'" class="field">图片替代文字<input v-model.trim="item.alt" maxlength="200" /></label>
          <label class="field">媒体说明<input v-model.trim="item.caption" maxlength="200" /></label>
          <label class="field">插在第几段之后（留空放文末）<input v-model.number="item.afterParagraph" type="number" min="1" max="200" @change="item.afterParagraph=item.afterParagraph||null" /></label>
          <button type="button" @click="form.media.splice(index,1)">移除此项</button>
        </section>
        <p v-if="errors.media" class="field-error">{{errors.media}}</p>
        <button type="button" :disabled="form.media.length>=6" @click="form.media.push({type:'image',url:'',alt:'',caption:'',afterParagraph:null})">添加媒体（最多6项）</button>
      </fieldset>
      <label class="field">标签（逗号分隔）<input v-model="form.tags" /></label>
      <label class="field">状态<select v-model="form.status"><option value="draft">草稿</option><option value="published">发布</option></select></label>
      <span v-if="errors.status" class="field-error">{{ errors.status }}</span>
      <div class="row-actions"><button type="submit" :disabled="uploading">保存文章</button><RouterLink to="/admin/articles">取消</RouterLink></div>
    </form>
    <p v-if="saved">保存成功。</p>
  </section>
</template>
