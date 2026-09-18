const statuses = new Set(['draft', 'submitted', 'approved', 'rejected'])

export function normalizeList(value) {
  const values = Array.isArray(value) ? value : String(value ?? '').split(/[、,，]/)
  return [...new Set(values.map((item) => String(item).trim()).filter(Boolean))]
}

export function validateMemberInput(input = {}) {
  const errors = {}
  const name = String(input.name ?? '').trim()
  const role = String(input.role ?? '').trim()
  const email = String(input.email ?? '').trim().toLowerCase()
  if (name.length < 2 || name.length > 40) errors.name = 'name must contain 2-40 characters'
  if (role.length < 2 || role.length > 60) errors.role = 'role must contain 2-60 characters'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = 'valid email is required'
  if (String(input.bio ?? '').trim().length > 300) errors.bio = 'bio must not exceed 300 characters'
  if (normalizeList(input.skills).length > 10) errors.skills = 'skills must not exceed 10 items'
  return errors
}

export function toMemberRecord(input = {}, ownerId = null) {
  return {
    name: String(input.name ?? '').trim(),
    role: String(input.role ?? '').trim(),
    cohort: String(input.cohort ?? '').trim(),
    location: String(input.location ?? '').trim(),
    bio: String(input.bio ?? '').trim(),
    skills: normalizeList(input.skills),
    interests: normalizeList(input.interests),
    avatar: String(input.avatar ?? '').trim(),
    email: String(input.email ?? '').trim().toLowerCase(),
    status: statuses.has(input.status) ? input.status : 'submitted',
    ownerId,
  }
}

export function publicMember(record) {
  const { email, ownerId, reviewNote, reviewedBy, ...safe } = record
  return safe
}
