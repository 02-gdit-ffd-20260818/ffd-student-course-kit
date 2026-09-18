export function createMemoryUserRepository(users = []) {
  return { async findByUsername(username) { return users.find((user) => user.username === username) ?? null } }
}

export function createSqliteUserRepository(database) {
  return {
    findByUsername(username) { return database.prepare('SELECT id, username, display_name AS displayName, role, password_salt AS passwordSalt, password_hash AS passwordHash FROM users WHERE username = ?').get(username) ?? null },
    upsert(user) {
      database.prepare(`INSERT INTO users(username, display_name, role, password_salt, password_hash) VALUES (?, ?, ?, ?, ?)
        ON CONFLICT(username) DO UPDATE SET display_name=excluded.display_name, role=excluded.role, password_salt=excluded.password_salt, password_hash=excluded.password_hash`).run(user.username, user.displayName, user.role, user.passwordSalt, user.passwordHash)
      return this.findByUsername(user.username)
    },
  }
}

export function createMysqlUserRepository(pool) {
  return {
    async findByUsername(username) { const [rows] = await pool.execute('SELECT id, username, display_name AS displayName, role, password_salt AS passwordSalt, password_hash AS passwordHash FROM users WHERE username = ?', [username]); return rows[0] ?? null },
    async upsert(user) {
      await pool.execute(`INSERT INTO users(username, display_name, role, password_salt, password_hash) VALUES (?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE display_name=VALUES(display_name), role=VALUES(role), password_salt=VALUES(password_salt), password_hash=VALUES(password_hash)`, [user.username, user.displayName, user.role, user.passwordSalt, user.passwordHash])
      return this.findByUsername(user.username)
    },
  }
}
