const path = require('node:path');
const { Pool } = require('pg');

require('dotenv').config({ path: path.resolve(__dirname, '..', '.env'), quiet: true });

let pool;

const databaseUrl = () => process.env.DATABASE_URL || [
  'postgresql://', encodeURIComponent(process.env.POSTGRES_USER || 'personalink'), ':',
  encodeURIComponent(process.env.POSTGRES_PASSWORD || 'personalink'), '@',
  process.env.DB_HOST || '127.0.0.1', ':', process.env.DB_PORT || '5432', '/',
  encodeURIComponent(process.env.POSTGRES_DB || 'personalink')
].join('');

const getPool = () => {
  if (!pool) {
    pool = new Pool({
      connectionString: databaseUrl(),
      max: Number(process.env.DB_POOL_MAX || 10),
      idleTimeoutMillis: 30_000,
      connectionTimeoutMillis: Number(process.env.DB_CONNECT_TIMEOUT_MS || 5_000),
      ssl: process.env.DB_SSL === '1' ? { rejectUnauthorized: true } : false
    });
    pool.on('error', error => console.error('PostgreSQL idle client error:', error));
  }
  return pool;
};

const query = (text, params) => getPool().query(text, params);

const withTransaction = async callback => {
  const client = await getPool().connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

const connectDB = async () => {
  await query('SELECT 1');
  return getPool();
};

const checkDatabase = async () => {
  const startedAt = Date.now();
  await query('SELECT 1');
  return { ok: true, latencyMs: Date.now() - startedAt };
};

const getDatabaseInfo = async () => {
  const result = await query(`
    SELECT
      (SELECT COUNT(*)::int FROM classes) AS classes,
      (SELECT COUNT(*)::int FROM users) AS users,
      (SELECT COUNT(*)::int FROM standard_hobbies) AS standard_hobbies,
      (SELECT COUNT(*)::int FROM synonym_groups) AS synonym_groups
  `);
  return { engine: 'PostgreSQL', counts: result.rows[0] };
};

const closeDB = async () => {
  if (!pool) return;
  const current = pool;
  pool = undefined;
  await current.end();
};

module.exports = { checkDatabase, closeDB, connectDB, getDatabaseInfo, getPool, query, withTransaction };
