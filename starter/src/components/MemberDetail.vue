<script setup>
import { normalizeMember } from '../domain/member.js'

const props = defineProps({ member: { type: Object, required: true } })
defineEmits(['close'])
const item = normalizeMember(props.member)
</script>

<template>
  <aside class="detail-panel" aria-labelledby="detail-title">
    <button type="button" class="close-button" aria-label="关闭成员详情" @click="$emit('close')">×</button>
    <p class="eyebrow">公开成员资料</p>
    <h2 id="detail-title">{{ item.name }}</h2>
    <p class="detail-role">{{ item.role }}</p>
    <dl>
      <div><dt>所在班级</dt><dd>{{ item.cohort || '未公开' }}</dd></div>
      <div><dt>所在城市</dt><dd>{{ item.location }}</dd></div>
      <div><dt>技能方向</dt><dd>{{ item.skills.join('、') || '待补充' }}</dd></div>
      <div><dt>兴趣连接</dt><dd>{{ item.interests.join('、') || '未公开' }}</dd></div>
    </dl>
    <p class="detail-note">本页只展示完成成员发现任务所需、且已获得授权的字段。</p>
  </aside>
</template>
