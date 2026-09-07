<script setup>
import { computed, reactive, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useArticles } from '../composables/useArticles.js'

const props = defineProps({ id: { type: String, default: '' } })
const router = useRouter()
const { store } = useArticles()
const saved = ref(false)
const errors = ref({})
const existing = computed(() => store.byId(props.id))
const form = reactive({ id: '', title: '', slug: '', summary: '', content: '', tags: '', status: 'draft', author: '林晓', publishedAt: '' })

watch(existing, (article) => {
  if (!article) return
  Object.assign(form, article, { content: article.content.join('\n\n'), tags: article.tags.join(', ') })
}, { immediate: true })

function submit() {
  const result = store.save(form)
  errors.value = result.errors
  if (!result.ok) return
  saved.value = true
  router.push('/admin/articles')
}
</script>

<template>
  <section class="form-card">
    <p class="eyebrow">{{ id ? '编辑' : '新建' }}</p>
    <h1>文章表单</h1>
    <form novalidate @submit.prevent="submit">
      <label class="field">标题<input v-model.trim="form.title" maxlength="60" /><span v-if="errors.title" class="field-error">{{ errors.title }}</span></label>
      <label class="field">摘要<textarea v-model.trim="form.summary" maxlength="160" rows="3" /><span v-if="errors.summary" class="field-error">{{ errors.summary }}</span></label>
      <label class="field">正文<textarea v-model="form.content" rows="8" /></label>
      <label class="field">标签（逗号分隔）<input v-model="form.tags" /></label>
      <label class="field">状态<select v-model="form.status"><option value="draft">草稿</option><option value="published">发布</option></select></label>
      <span v-if="errors.status" class="field-error">{{ errors.status }}</span>
      <div class="row-actions"><button type="submit">保存文章</button><RouterLink to="/admin/articles">取消</RouterLink></div>
    </form>
    <p v-if="saved">保存成功。</p>
  </section>
</template>
