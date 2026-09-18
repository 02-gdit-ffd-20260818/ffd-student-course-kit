<script setup>
import { computed, reactive, ref } from 'vue'
import { downloadExport, importCsv, listReviewMembers, login, previewCsv, reviewMember, submitMember } from '../services/api.js'

const session = ref(null)
const credentials = reactive({ username: '', password: '' })
const message = ref('')
const busy = ref(false)
const reviewItems = ref([])
const form = reactive({ name: '', role: '', email: '', cohort: '2026 秋季班', location: '', bio: '', skills: '', interests: '', avatar: '' })
const csv = ref('name,role,email,skills\n新成员,前端开发,new@example.com,Vue|CSS')
const preview = ref(null)
const isReviewer = computed(() => session.value?.user.role === 'reviewer')

async function signIn() {
  busy.value = true; message.value = ''
  try { session.value = await login(credentials); message.value = `已登录：${session.value.user.displayName}`; if (isReviewer.value) await refreshReviews() }
  catch { message.value = '登录失败，请核对账号密码。' }
  finally { busy.value = false }
}
function signOut() { session.value = null; reviewItems.value = []; preview.value = null; message.value = '已退出。' }
async function sendSubmission() {
  busy.value = true
  try { await submitMember(form, session.value.token); message.value = '资料已提交，等待审核。'; Object.assign(form, { name: '', role: '', email: '', cohort: '2026 秋季班', location: '', bio: '', skills: '', interests: '', avatar: '' }) }
  catch (error) { message.value = error.status === 400 ? '请检查姓名、角色、邮箱和字段长度。' : '提交失败，请稍后重试。' }
  finally { busy.value = false }
}
async function refreshReviews() { reviewItems.value = await listReviewMembers(session.value.token) }
async function decide(id, status) {
  busy.value = true
  try { await reviewMember(id, status, '课堂审核', session.value.token); await refreshReviews(); message.value = status === 'approved' ? '审核通过。' : '已驳回。' }
  catch (error) { message.value = error.code === 'INVALID_TRANSITION' ? '当前状态不能重复审批。' : '审核失败。' }
  finally { busy.value = false }
}
async function checkCsv() {
  try { preview.value = await previewCsv(csv.value, session.value.token); message.value = `预览通过：${preview.value.rows.length} 行。` }
  catch (error) { preview.value = { rows: [], errors: error.details?.rows ?? [] }; message.value = 'CSV 有错误，未写入数据库。' }
}
async function commitCsv() {
  busy.value = true
  try { const result = await importCsv(csv.value, session.value.token); message.value = `成功导入 ${result.imported} 行，等待审核。`; await refreshReviews() }
  catch (error) { message.value = error.status === 409 ? '数据库中已有相同邮箱，整批未导入。' : '导入失败，整批未写入。' }
  finally { busy.value = false }
}
async function exportCsv() {
  const blob = await downloadExport(session.value.token)
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a'); link.href = url; link.download = 'p3-members.csv'; link.click(); URL.revokeObjectURL(url)
}
</script>

<template>
  <section id="collaborate" class="collaboration" aria-labelledby="collaboration-title">
    <div class="collaboration-intro">
      <p class="eyebrow">CONTROLLED WORKFLOW</p><h2 id="collaboration-title">提交、审核，再公开。</h2>
      <p>前端按钮不是权限边界；服务器会识别角色、校验状态并用事务保护批量导入。</p>
    </div>
    <div class="workspace">
      <form v-if="!session" class="login-form" @submit.prevent="signIn">
        <h3>登录协同工作台</h3>
        <label>用户名<input v-model.trim="credentials.username" autocomplete="username" required /></label>
        <label>密码<input v-model="credentials.password" type="password" autocomplete="current-password" required /></label>
        <button class="primary-button" :disabled="busy">登录</button>
      </form>
      <template v-else>
        <div class="session-bar"><p><strong>{{ session.user.displayName }}</strong><span>{{ session.user.role }}</span></p><button type="button" class="reset-button" @click="signOut">退出</button></div>
        <form v-if="!isReviewer" class="submission-form" @submit.prevent="sendSubmission">
          <h3>提交我的公开资料</h3>
          <label>姓名<input v-model.trim="form.name" required minlength="2" maxlength="40" /></label>
          <label>协作角色<input v-model.trim="form.role" required minlength="2" maxlength="60" /></label>
          <label>联系邮箱（不公开）<input v-model.trim="form.email" type="email" required /></label>
          <label>技能（逗号分隔）<input v-model="form.skills" /></label>
          <label class="wide">公开介绍<textarea v-model="form.bio" maxlength="300"></textarea></label>
          <button class="primary-button" :disabled="busy">提交审核</button>
        </form>
        <div v-else class="review-workspace">
          <section>
            <div class="workspace-heading"><h3>待审核成员</h3><button type="button" class="text-button" @click="refreshReviews">刷新</button></div>
            <ul class="review-list"><li v-for="item in reviewItems" :key="item.id"><div><strong>{{ item.name }}</strong><span>{{ item.role }} · {{ item.status }}</span></div><div v-if="item.status === 'submitted'" class="review-actions"><button type="button" @click="decide(item.id, 'approved')">通过</button><button type="button" @click="decide(item.id, 'rejected')">驳回</button></div></li></ul>
          </section>
          <section class="csv-panel">
            <h3>CSV 预览与事务导入</h3><textarea v-model="csv" aria-label="CSV 内容"></textarea>
            <div class="review-actions"><button type="button" @click="checkCsv">仅预览</button><button type="button" :disabled="!preview || preview.errors?.length" @click="commitCsv">确认整批导入</button><button type="button" @click="exportCsv">下载脱敏 CSV</button></div>
            <ul v-if="preview?.errors?.length" class="csv-errors"><li v-for="error in preview.errors" :key="error.line">第 {{ error.line }} 行：{{ error.message || JSON.stringify(error.fields) }}</li></ul>
          </section>
        </div>
      </template>
      <p class="workspace-message" aria-live="polite">{{ message }}</p>
    </div>
  </section>
</template>
