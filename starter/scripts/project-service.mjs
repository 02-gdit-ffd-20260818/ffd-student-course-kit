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
  if (!Array.isArray(items)) return []
  return items.map(normalizeProject)
}

export function filterProjects(items, skill = 'all') {
  // TODO-L4: all 返回副本，其他技能返回匹配项目。
  return [...items]
}

export function sortProjects(items, order = 'asc') {
  // TODO-L4: 复制数组后按名称排序，支持 asc 与 desc。
  return [...items]
}

export function collectSkills(items) {
  const skills = (Array.isArray(items) ? items : []).flatMap(project => project.skills)
  return [...new Set(skills)].sort((a, b) => a.localeCompare(b, 'zh-CN'))
}

export function isPublicWebUrl(value) {
  try {
    const url = new URL(value)
    return url.protocol === 'https:' || url.protocol === 'http:'
  } catch {
    return false
  }
}
