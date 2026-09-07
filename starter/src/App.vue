<script setup>
import { computed, onMounted, ref } from 'vue'
import ProfileHeader from './components/ProfileHeader.vue'
import ProjectControls from './components/ProjectControls.vue'
import ProjectList from './components/ProjectList.vue'
import SiteFooter from './components/SiteFooter.vue'
import { fallbackProjects } from './data/projects.js'
import { loadProjects } from './services/projectLoader.js'
import { collectSkills, filterProjects, normalizeProjects, sortProjects } from './services/projectService.js'
import { nextTheme, readTheme, writeTheme } from './services/themeService.js'

const projects = ref([])
const skill = ref('all')
const order = ref('asc')
const loadState = ref('loading')
const loadMessage = ref('正在读取项目数据……')
const selectedMessage = ref('')
const theme = ref('light')

const skills = computed(() => collectSkills(projects.value))
const visibleProjects = computed(() =>
  sortProjects(filterProjects(projects.value, skill.value), order.value)
)

async function refreshProjects() {
  loadState.value = 'loading'
  loadMessage.value = '正在读取项目数据……'
  const query = new URLSearchParams(location.search)
  const result = query.has('empty')
    ? { state: 'empty', items: [], error: null }
    : await loadProjects(fetch, query.has('fail') ? './missing-projects.json' : './projects.json')

  if (result.state === 'error') {
    projects.value = normalizeProjects(fallbackProjects)
    loadState.value = 'fallback'
    loadMessage.value = `读取失败，正在显示内置数据：${result.error}`
  } else {
    projects.value = normalizeProjects(result.items)
    loadState.value = result.state
    loadMessage.value = result.state === 'empty'
      ? '项目数量：0'
      : `显示 ${projects.value.length} 个项目`
  }
  skill.value = 'all'
}

function toggleTheme() {
  const result = writeTheme(localStorage, nextTheme(theme.value))
  theme.value = result.theme
  document.documentElement.dataset.theme = theme.value
}

function recordSelection(id) {
  const project = projects.value.find(item => item.id === id)
  selectedMessage.value = project ? `已选择：${project.name}` : '未找到项目'
}

onMounted(() => {
  theme.value = readTheme(localStorage)
  document.documentElement.dataset.theme = theme.value
  refreshProjects()
})
</script>

<template>
  <a class="skip-link" href="#main-content">跳到主要内容</a>
  <ProfileHeader :theme="theme" @toggle-theme="toggleTheme" />

  <main id="main-content">
    <section class="wide-card" aria-labelledby="about-title">
      <h2 id="about-title">关于我</h2>
      <p>这里汇集 P1—P5 的正式作品、源代码与发布证据。每个项目都有可访问入口、自动化测试和可复现部署。</p>
    </section>

    <section aria-labelledby="experience-title">
      <h2 id="experience-title">学习经历</h2>
      <ol class="timeline">
        <li><strong>2026 · 前端框架应用开发</strong><span>持续完成可访问、可测试、可部署的课程项目。</span></li>
        <li><strong>2025 · JavaScript 基础</strong><span>掌握变量、函数、对象、数组和 DOM。</span></li>
      </ol>
    </section>

    <section aria-labelledby="skills-title">
      <h2 id="skills-title">正在掌握</h2>
      <ul class="tag-list"><li>Vue 3</li><li>组件设计</li><li>Git 与 CI/CD</li></ul>
    </section>

    <section class="wide-card" aria-labelledby="project-title">
      <h2 id="project-title">作品门户</h2>
      <ProjectControls
        :skills="skills"
        :skill="skill"
        :order="order"
        @update:skill="skill = $event"
        @update:order="order = $event"
      />
      <p role="status">{{ loadMessage }}</p>
      <button v-if="loadState === 'fallback'" class="retry-button" type="button" @click="refreshProjects">重新读取项目</button>
      <ProjectList :items="visibleProjects" @select="recordSelection" />
      <p class="selection-status" aria-live="polite">{{ selectedMessage }}</p>
    </section>

    <section aria-labelledby="contact-title">
      <h2 id="contact-title">联系我</h2>
      <p><a href="mailto:linxiao@example.com">linxiao@example.com</a></p>
      <p class="privacy-note">本页只展示用于课堂演示的虚构公开信息。</p>
    </section>
  </main>

  <SiteFooter />
</template>
