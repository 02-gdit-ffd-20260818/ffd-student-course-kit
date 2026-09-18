<script setup>
import MemberCard from './MemberCard.vue'

defineProps({ members: { type: Array, required: true } })
defineEmits(['select'])
</script>

<template>
  <div v-if="members.length" class="member-grid">
    <MemberCard
      v-for="member in members"
      :key="member.id"
      :member="member"
      @select="$emit('select', $event)"
    />
  </div>
  <div v-else class="empty-state" role="status">
    <span aria-hidden="true">○</span>
    <h2>还没有可公开的成员</h2>
    <p>请先核对资料授权，不要为了填满页面而公开未经同意的数据。</p>
  </div>
</template>
