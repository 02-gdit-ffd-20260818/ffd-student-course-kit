export function createMemoryRepository(seed = []) {
  let members = seed.map((item) => ({ ...item, skills: [...(item.skills ?? [])], interests: [...(item.interests ?? [])] }))
  let nextId = Math.max(0, ...members.map((item) => Number(item.id) || 0)) + 1
  return {
    async listPublic() { return members.filter((item) => item.status === 'approved') },
    async listAll() { return members.map((item) => ({ ...item })) },
    async find(id) { return members.find((item) => String(item.id) === String(id)) ?? null },
    async create(input) { const item = { ...input, id: nextId++, version: 1, reviewNote: '', reviewedBy: null }; members.push(item); return { ...item } },
    async transition(id, nextStatus, { reviewerId, note = '' }) {
      const item = members.find((record) => String(record.id) === String(id))
      if (!item) return null
      item.status = nextStatus; item.reviewedBy = reviewerId; item.reviewNote = note; item.version += 1
      return { ...item }
    },
    async importBatch(rows, ownerId) {
      const existing = new Set(members.map((item) => item.email))
      if (rows.some((row) => existing.has(row.email))) { const error = new Error('email already exists'); error.code = 'DUPLICATE_EMAIL'; throw error }
      const created = rows.map((row) => ({ ...row, id: nextId++, ownerId, status: 'submitted', version: 1, reviewNote: '', reviewedBy: null }))
      members.push(...created)
      return created
    },
  }
}
