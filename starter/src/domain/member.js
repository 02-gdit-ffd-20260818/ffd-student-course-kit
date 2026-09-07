const publicKeys = ['id', 'name', 'role', 'cohort', 'location', 'bio', 'skills', 'interests', 'avatar']

export function initials(name = '') {
  const chars = [...String(name).trim()]
  return chars.slice(-2).join('') || '成员'
}

export function normalizeMember(member = {}) {
  return {
    id: String(member.id ?? '').trim(),
    name: String(member.name ?? '').trim() || '未命名成员',
    role: String(member.role ?? '').trim() || '角色待补充',
    cohort: String(member.cohort ?? '').trim(),
    location: String(member.location ?? '').trim() || '地点未公开',
    bio: String(member.bio ?? '').trim() || '这位成员暂未填写公开介绍。',
    skills: [...new Set((member.skills ?? []).map((item) => String(item).trim()).filter(Boolean))],
    interests: [...new Set((member.interests ?? []).map((item) => String(item).trim()).filter(Boolean))],
    avatar: String(member.avatar ?? '').trim(),
  }
}

export function toPublicMember(member) {
  if (!member?.profileConsent) return null
  const normalized = normalizeMember(member)
  return Object.fromEntries(publicKeys.map((key) => [key, normalized[key]]))
}

export function publicMembers(records = []) {
  return records.map(toPublicMember).filter(Boolean)
}
