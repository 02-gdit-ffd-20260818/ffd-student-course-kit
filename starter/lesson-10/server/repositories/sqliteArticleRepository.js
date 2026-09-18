function toArticle(row) {
  if (!row) return null
  return {
    id: Number(row.id),
    slug: row.slug,
    title: row.title,
    summary: row.summary,
    content: JSON.parse(row.content_json),
    tags: JSON.parse(row.tags_json),
    status: row.status,
    author: row.author,
    publishedAt: row.published_at,
  }
}

export function createSqliteArticleRepository(database) {
  const selectColumns = 'id, slug, title, summary, content_json, tags_json, status, author, published_at'
  return {
    list({ status, query = '', page = 1, pageSize = 20 } = {}) {
      const where = []
      const params = []
      if (status) { where.push('status = ?'); params.push(status) }
      if (query) {
        where.push("lower(title || ' ' || summary || ' ' || tags_json) LIKE lower(?)")
        params.push(`%${query}%`)
      }
      const clause = where.length ? `WHERE ${where.join(' AND ')}` : ''
      const total = Number(database.prepare(`SELECT COUNT(*) AS count FROM articles ${clause}`).get(...params).count)
      const offset = (page - 1) * pageSize
      const items = database.prepare(`SELECT ${selectColumns} FROM articles ${clause} ORDER BY published_at DESC, id DESC LIMIT ? OFFSET ?`).all(...params, pageSize, offset).map(toArticle)
      return { items, total }
    },
    find(id) {
      return toArticle(database.prepare(`SELECT ${selectColumns} FROM articles WHERE id = ?`).get(Number(id)))
    },
    create(input) {
      const result = database.prepare(`INSERT INTO articles
        (slug, title, summary, content_json, tags_json, status, author, published_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`).run(input.slug, input.title, input.summary, JSON.stringify(input.content), JSON.stringify(input.tags), input.status, input.author, input.publishedAt)
      return this.find(result.lastInsertRowid)
    },
    update(id, input) {
      const result = database.prepare(`UPDATE articles SET slug = ?, title = ?, summary = ?, content_json = ?, tags_json = ?, status = ?, author = ?, published_at = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`).run(input.slug, input.title, input.summary, JSON.stringify(input.content), JSON.stringify(input.tags), input.status, input.author, input.publishedAt, Number(id))
      return result.changes ? this.find(id) : null
    },
    remove(id) {
      return database.prepare('DELETE FROM articles WHERE id = ?').run(Number(id)).changes > 0
    },
  }
}
