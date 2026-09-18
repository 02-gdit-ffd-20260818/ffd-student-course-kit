function jsonValue(value) {
  return Array.isArray(value) ? value : JSON.parse(value || '[]')
}

function toArticle(row) {
  if (!row) return null
  return { id: Number(row.id), slug: row.slug, title: row.title, summary: row.summary, content: jsonValue(row.content_json), tags: jsonValue(row.tags_json), status: row.status, author: row.author, publishedAt: String(row.published_at).slice(0, 10) }
}

export function createMysqlArticleRepository(pool) {
  const columns = 'id, slug, title, summary, content_json, tags_json, status, author, published_at'
  return {
    async list({ status, query = '', page = 1, pageSize = 20 } = {}) {
      const where = []
      const params = []
      if (status) { where.push('status = ?'); params.push(status) }
      if (query) { where.push("LOWER(CONCAT(title, ' ', summary, ' ', tags_json)) LIKE LOWER(?)"); params.push(`%${query}%`) }
      const clause = where.length ? `WHERE ${where.join(' AND ')}` : ''
      const [[count]] = await pool.execute(`SELECT COUNT(*) AS total FROM articles ${clause}`, params)
      const [rows] = await pool.execute(`SELECT ${columns} FROM articles ${clause} ORDER BY published_at DESC, id DESC LIMIT ? OFFSET ?`, [...params, Number(pageSize), Number((page - 1) * pageSize)])
      return { items: rows.map(toArticle), total: Number(count.total) }
    },
    async find(id) {
      const [rows] = await pool.execute(`SELECT ${columns} FROM articles WHERE id = ?`, [Number(id)])
      return toArticle(rows[0])
    },
    async create(input) {
      const [result] = await pool.execute(`INSERT INTO articles (slug, title, summary, content_json, tags_json, status, author, published_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, [input.slug, input.title, input.summary, JSON.stringify(input.content), JSON.stringify(input.tags), input.status, input.author, input.publishedAt])
      return this.find(result.insertId)
    },
    async update(id, input) {
      const [result] = await pool.execute(`UPDATE articles SET slug = ?, title = ?, summary = ?, content_json = ?, tags_json = ?, status = ?, author = ?, published_at = ? WHERE id = ?`, [input.slug, input.title, input.summary, JSON.stringify(input.content), JSON.stringify(input.tags), input.status, input.author, input.publishedAt, Number(id)])
      return result.affectedRows ? this.find(id) : null
    },
    async remove(id) {
      const [result] = await pool.execute('DELETE FROM articles WHERE id = ?', [Number(id)])
      return result.affectedRows > 0
    },
  }
}
