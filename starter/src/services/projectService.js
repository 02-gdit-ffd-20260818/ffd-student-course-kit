export function normalizeProject(project, index = 0) {
  const name = String(project?.name ?? '').trim()
  const summary = String(project?.summary ?? '').trim()
  const skills = Array.isArray(project?.skills)
    ? project.skills.map(skill => String(skill).trim()).filter(Boolean)
    : []
  return {
    id: String(project?.id ?? `project-${index + 1}`),
    name: name || '未命名项目',
    summary: summary || '暂时没有项目简介。',
    skills,
    status: String(project?.status ?? '未标记'),
    url: isPublicWebUrl(project?.url) ? project.url : null,
  }
}

export function normalizeProjects(items) {
  return Array.isArray(items) ? items.map(normalizeProject) : []
}

export function filterProjects(items, skill = 'all') {
  const source = Array.isArray(items) ? items : []
  return skill === 'all' ? [...source] : source.filter(project => project.skills.includes(skill))
}

export function sortProjects(items, order = 'asc') {
  const direction = order === 'desc' ? -1 : 1
  return [...(Array.isArray(items) ? items : [])].sort((a, b) =>
    a.name.localeCompare(b.name, 'zh-CN') * direction
  )
}

export function collectSkills(items) {
  const skills = (Array.isArray(items) ? items : []).flatMap(project => project.skills)
  return [...new Set(skills)].sort((a, b) => a.localeCompare(b, 'zh-CN'))
}

function isPublicWebUrl(value) {
  try {
    const url = new URL(value)
    return ['https:', 'http:'].includes(url.protocol)
  } catch {
    return false
  }
}
