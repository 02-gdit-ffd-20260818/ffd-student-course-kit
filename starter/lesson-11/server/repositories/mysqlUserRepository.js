export function createMysqlUserRepository(pool) {
  return {
    async findByUsername(username) {
      const [rows] = await pool.execute('SELECT id, username, display_name AS displayName, role, password_salt AS passwordSalt, password_hash AS passwordHash FROM users WHERE username = ?', [username])
      return rows[0] ?? null
    },
    async upsert({ username, displayName, role, passwordSalt, passwordHash }) {
      await pool.execute(`INSERT INTO users(username, display_name, role, password_salt, password_hash)
        VALUES (?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE display_name = VALUES(display_name), role = VALUES(role), password_salt = VALUES(password_salt), password_hash = VALUES(password_hash)`, [username, displayName, role, passwordSalt, passwordHash])
      return this.findByUsername(username)
    },
  }
}
