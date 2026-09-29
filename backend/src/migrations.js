const fs = require('node:fs/promises');
const path = require('node:path');
const { withTransaction } = require('./database');

const migrationsDirectory = path.resolve(__dirname, '..', 'migrations');

const runMigrations = async () => withTransaction(async client => {
  await client.query(`CREATE TABLE IF NOT EXISTS schema_migrations (
    name text PRIMARY KEY,
    applied_at timestamptz NOT NULL DEFAULT now()
  )`);
  await client.query("SELECT pg_advisory_xact_lock(hashtext('personalink_schema_migrations'))");
  const files = (await fs.readdir(migrationsDirectory)).filter(file => file.endsWith('.sql')).sort();
  const applied = await client.query('SELECT name FROM schema_migrations');
  const names = new Set(applied.rows.map(row => row.name));

  for (const file of files) {
    if (names.has(file)) continue;
    await client.query(await fs.readFile(path.join(migrationsDirectory, file), 'utf8'));
    await client.query('INSERT INTO schema_migrations (name) VALUES ($1)', [file]);
    console.log(`Applied migration: ${file}`);
  }
});

module.exports = { runMigrations };
