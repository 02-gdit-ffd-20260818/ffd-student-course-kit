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

export function renderProjects(items) {
  // TODO-L3: 标准化、清空旧节点、空态、循环追加、更新数量。
  projectStatus.textContent = '请完成本课的数组渲染任务'
}

renderProjects(projects)
