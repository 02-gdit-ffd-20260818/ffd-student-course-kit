<script setup>
defineProps({
  skills: { type: Array, required: true },
  skill: { type: String, required: true },
  order: { type: String, required: true },
})
defineEmits(['update:skill', 'update:order'])
</script>

<template>
  <div class="project-toolbar" aria-label="项目筛选与排序">
    <label for="skill-filter">按技能筛选
      <select id="skill-filter" :value="skill" @change="$emit('update:skill', $event.target.value)">
        <option value="all">全部技能</option>
        <option v-for="item in skills" :key="item" :value="item">{{ item }}</option>
      </select>
    </label>
    <label for="sort-order">按名称排序
      <select id="sort-order" :value="order" @change="$emit('update:order', $event.target.value)">
        <option value="asc">升序</option>
        <option value="desc">降序</option>
      </select>
    </label>
  </div>
</template>
