export function createSqliteUserRepository(database) {
  return {
    findByUsername(username) {
      return database.prepare('SELECT id, username, display_name AS displayName, role, password_salt AS passwordSalt, password_hash AS passwordHash FROM users WHERE username = ?').get(username) ?? null
    },
    upsert({ username, displayName, role, passwordSalt, passwordHash }) {
      database.prepare(`INSERT INTO users(username, display_name, role, password_salt, password_hash)
        VALUES (?, ?, ?, ?, ?)
        ON CONFLICT(username) DO UPDATE SET display_name = excluded.display_name, role = excluded.role, password_salt = excluded.password_salt, password_hash = excluded.password_hash`).run(username, displayName, role, passwordSalt, passwordHash)
      return this.findByUsername(username)
    },
  }
}
