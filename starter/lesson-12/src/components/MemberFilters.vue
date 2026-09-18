<script setup>
defineProps({
  query: { type: String, default: '' },
  skill: { type: String, default: '' },
  skills: { type: Array, required: true },
  resultCount: { type: Number, required: true },
})

defineEmits(['update:query', 'update:skill', 'reset'])
</script>

<template>
  <form class="filters" role="search" @submit.prevent>
    <label>
      <span>搜索成员</span>
      <input
        type="search"
        :value="query"
        placeholder="姓名、角色、城市或兴趣"
        @input="$emit('update:query', $event.target.value)"
      />
    </label>
    <label>
      <span>技能方向</span>
      <select :value="skill" @change="$emit('update:skill', $event.target.value)">
        <option value="">全部技能</option>
        <option v-for="item in skills" :key="item" :value="item">{{ item }}</option>
      </select>
    </label>
    <p aria-live="polite">找到 <strong>{{ resultCount }}</strong> 位成员</p>
    <button v-if="query || skill" type="button" class="reset-button" @click="$emit('reset')">清除条件</button>
  </form>
</template>
