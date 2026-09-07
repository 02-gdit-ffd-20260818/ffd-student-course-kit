import { projects } from './data.js'
import { normalizeProjects } from './scripts/project-service.mjs'

const projectList = document.querySelector('#project-list')
const projectStatus = document.querySelector('#project-status')

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
  const normalized = normalizeProjects(items)
  projectList.replaceChildren()

  if (normalized.length === 0) {
    const empty = document.createElement('p')
    empty.className = 'empty-state'
    empty.textContent = '还没有项目，先完成第一个作品吧。'
    projectList.append(empty)
    projectStatus.textContent = '项目数量：0'
    return
  }

  for (const project of normalized) {
    projectList.append(createProjectCard(project))
  }
  projectStatus.textContent = `项目数量：${normalized.length}`
}

renderProjects(projects)
