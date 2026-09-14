<script setup>
import ProjectCard from './ProjectCard.vue'

defineProps({ items: { type: Array, required: true } })
defineEmits(['select'])
</script>

<template>
  <div class="project-list">
    <p v-if="items.length === 0" class="empty-state">还没有匹配项目，请更换筛选条件。</p>
    <ProjectCard
      v-for="project in items"
      v-else
      :key="project.id"
      :project="project"
      @select="$emit('select', $event)"
    />
  </div>
</template>
