const fs = require('node:fs/promises');
const path = require('node:path');
const bcrypt = require('bcryptjs');
const { query, withTransaction } = require('./database');

const insertSeedData = data => withTransaction(async client => {
  for (const item of data.classes || []) {
    await client.query(`
      INSERT INTO classes (id,name,description,teacher,created_at,updated_at)
      VALUES ($1,$2,$3,$4,$5,$6) ON CONFLICT (id) DO NOTHING
    `, [String(item.id), item.name, item.description || '', item.teacher || '', item.createdAt || new Date(), item.updatedAt || null]);
  }

  for (const item of data.users || []) {
    await client.query(`
      INSERT INTO users (id,username,name,email,password_hash,avatar,bio,hobbies,role,class_id,profile,created_at,updated_at)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13) ON CONFLICT (id) DO NOTHING
    `, [String(item.id), item.username || null, item.name || null, item.email.toLowerCase(),
      await bcrypt.hash(item.password, 12), item.avatar || null, item.bio || null, item.hobbies || null,
      item.role || 'user', item.classId || null, item.profile || null, item.createdAt || new Date(), item.updatedAt || null]);
  }

  for (const item of data.standard_hobbies || []) {
    await client.query(`
      INSERT INTO standard_hobbies (id,name,category) VALUES ($1,$2,$3) ON CONFLICT (id) DO NOTHING
    `, [Number(item.id), item.name, item.category]);
  }

  for (const item of data.synonymGroups || []) {
    await client.query(`
      INSERT INTO synonym_groups (id,name,category,synonyms) VALUES ($1,$2,$3,$4) ON CONFLICT (id) DO NOTHING
    `, [String(item.id), item.name, item.category, JSON.stringify(item.synonyms || [])]);
  }
});

const seedIfEmpty = async () => {
  const result = await query(`SELECT (SELECT count(*) FROM classes) + (SELECT count(*) FROM users) +
    (SELECT count(*) FROM standard_hobbies) + (SELECT count(*) FROM synonym_groups) AS count`);
  if (Number(result.rows[0].count) > 0) return false;
  const seed = JSON.parse(await fs.readFile(path.resolve(__dirname, '..', 'data', 'seed.json'), 'utf8'));
  const admin = seed.users.find(user => user.role === 'admin');
  if (process.env.NODE_ENV === 'production' && (
    !process.env.ADMIN_INITIAL_PASSWORD ||
    process.env.ADMIN_INITIAL_PASSWORD.startsWith('replace-') ||
    process.env.ADMIN_INITIAL_PASSWORD.length < 12
  )) {
    throw new Error('ADMIN_INITIAL_PASSWORD (12+ characters) is required for the first production start');
  }
  if (admin && process.env.ADMIN_INITIAL_PASSWORD) admin.password = process.env.ADMIN_INITIAL_PASSWORD;
  if (process.env.SEED_DEMO_USER !== '1') seed.users = seed.users.filter(user => user.role === 'admin');
  await insertSeedData(seed);
  console.log('Seeded initial PostgreSQL data');
  return true;
};
module.exports = { seedIfEmpty };
