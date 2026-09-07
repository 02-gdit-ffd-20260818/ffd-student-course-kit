import { projects } from './data.js'
import { loadProjects } from './scripts/project-loader.mjs'
import {
  collectSkills,
  filterProjects,
  normalizeProjects,
  sortProjects,
} from './scripts/project-service.mjs'
import { nextTheme, readTheme, writeTheme } from './scripts/theme-service.mjs'

const projectList = document.querySelector('#project-list')
const projectStatus = document.querySelector('#project-status')
const skillFilter = document.querySelector('#skill-filter')
const sortOrder = document.querySelector('#sort-order')
const retryButton = document.querySelector('#retry-projects')
const themeToggle = document.querySelector('#theme-toggle')
let allProjects = []

function createProjectCard(project) {
  const article = document.createElement('article')
  article.className = 'project-card'

  const title = document.createElement('h3')
  title.textContent = project.name

  const summary = document.createElement('p')
  summary.textContent = project.summary

  const meta = document.createElement('p')
  meta.className = 'project-meta'
  meta.textContent = `${project.status} · ${project.skills.join(' · ') || '技能待补充'}`

  article.append(title, summary, meta)
  if (project.url) {
    const link = document.createElement('a')
    link.href = project.url
    link.textContent = '查看项目'
    link.rel = 'noreferrer'
    article.append(link)
  }
  return article
}

function renderProjects(items) {
  projectList.replaceChildren()

  if (items.length === 0) {
    const empty = document.createElement('p')
    empty.className = 'empty-state'
    empty.textContent = '还没有项目，先完成第一个作品吧。'
    projectList.append(empty)
    projectStatus.textContent = '项目数量：0'
    return
  }

  for (const project of items) {
    projectList.append(createProjectCard(project))
  }
  projectStatus.textContent = `显示 ${items.length} / ${allProjects.length} 个项目`
}

function updateView() {
  const filtered = filterProjects(allProjects, skillFilter.value)
  renderProjects(sortProjects(filtered, sortOrder.value))
}

function updateSkillOptions() {
  skillFilter.replaceChildren(new Option('全部技能', 'all'))
  for (const skill of collectSkills(allProjects)) {
    skillFilter.append(new Option(skill, skill))
  }
}

async function refreshProjects() {
  projectStatus.textContent = '正在读取项目数据……'
  retryButton.hidden = true
  const query = new URLSearchParams(location.search)
  const source = query.has('fail') ? './missing-projects.json' : './projects.json'
  const result = query.has('empty')
    ? { state: 'empty', items: [], error: null }
    : await loadProjects(fetch, source)

  let fallbackMessage = null
  if (result.state === 'error') {
    allProjects = normalizeProjects(projects)
    fallbackMessage = `读取失败，正在显示内置数据：${result.error}`
    retryButton.hidden = false
  } else {
    allProjects = normalizeProjects(result.items)
  }
  updateSkillOptions()
  updateView()
  if (fallbackMessage) projectStatus.textContent = fallbackMessage
}

function applyTheme(theme) {
  document.documentElement.dataset.theme = theme
  themeToggle.setAttribute('aria-pressed', String(theme === 'dark'))
  themeToggle.textContent = theme === 'dark' ? '切换浅色主题' : '切换深色主题'
}

skillFilter.addEventListener('change', updateView)
sortOrder.addEventListener('change', updateView)
retryButton.addEventListener('click', refreshProjects)
themeToggle.addEventListener('click', () => {
  const result = writeTheme(localStorage, nextTheme(document.documentElement.dataset.theme))
  applyTheme(result.theme)
})

applyTheme(readTheme(localStorage))
refreshProjects()
