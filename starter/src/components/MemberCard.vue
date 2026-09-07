<script setup>
import { ref } from 'vue'
import { initials, normalizeMember } from '../domain/member.js'

const props = defineProps({ member: { type: Object, required: true } })
defineEmits(['select'])

const item = normalizeMember(props.member)
const imageFailed = ref(!item.avatar)
</script>

<template>
  <article class="member-card">
    <div class="portrait" aria-hidden="true">
      <img
        v-if="!imageFailed"
        :src="item.avatar"
        :alt="`${item.name}的授权头像`"
        width="112"
        height="112"
        loading="lazy"
        @error="imageFailed = true"
      />
      <span v-else class="portrait-fallback">{{ initials(item.name) }}</span>
    </div>
    <div class="member-card__body">
      <p class="eyebrow">{{ item.cohort }}</p>
      <h2>{{ item.name }}</h2>
      <p class="role">{{ item.role }} · {{ item.location }}</p>
      <p class="bio">{{ item.bio }}</p>
      <ul class="tags" :aria-label="`${item.name}的技能`">
        <li v-for="skill in item.skills" :key="skill">{{ skill }}</li>
        <li v-if="item.skills.length === 0" class="tag-muted">技能待补充</li>
      </ul>
    </div>
    <button type="button" class="text-button" @click="$emit('select', item)">
      查看公开详情 <span aria-hidden="true">→</span>
    </button>
  </article>
</template>
