<script setup>
defineProps({ project: { type: Object, required: true } })
defineEmits(['select'])
</script>

<template>
  <article class="project-card">
    <h3>{{ project.name }}</h3>
    <p>{{ project.summary }}</p>
    <p class="project-meta">{{ project.status }} · {{ project.skills.join(' · ') || '技能待补充' }}</p>
    <p class="project-actions">
      <a v-if="project.url" :href="project.url" rel="noreferrer">查看项目</a>
      <a v-if="project.repoUrl" :href="project.repoUrl" rel="noreferrer">查看代码</a>
      <button type="button" @click="$emit('select', project.id)">记录查看</button>
    </p>
  </article>
</template>
