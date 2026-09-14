import { projects } from './data.js'
import {
  collectSkills,
  filterProjects,
  normalizeProjects,
  sortProjects,
} from './scripts/project-service.mjs'

const projectList = document.querySelector('#project-list')
const projectStatus = document.querySelector('#project-status')
const skillFilter = document.querySelector('#skill-filter')
const sortOrder = document.querySelector('#sort-order')
const allProjects = normalizeProjects(projects)

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

for (const skill of collectSkills(allProjects)) {
  const option = document.createElement('option')
  option.value = skill
  option.textContent = skill
  skillFilter.append(option)
}

skillFilter.addEventListener('change', updateView)
sortOrder.addEventListener('change', updateView)
updateView()
