const { query, withTransaction } = require('./database');

const iso = value => value instanceof Date ? value.toISOString() : value;
const mergeExtra = (row, known) => row ? ({ ...(row.extra || {}), ...known }) : null;

const mapClass = row => mergeExtra(row, {
  id: row?.id, name: row?.name, description: row?.description, teacher: row?.teacher,
  createdAt: iso(row?.created_at), ...(row?.updated_at ? { updatedAt: iso(row.updated_at) } : {})
});
const mapUser = row => mergeExtra(row, {
  id: row?.id,
  ...(row?.username ? { username: row.username } : {}),
  ...(row?.name ? { name: row.name } : {}),
  email: row?.email,
  password: row?.password_hash,
  ...(row?.avatar ? { avatar: row.avatar } : {}),
  ...(row?.bio ? { bio: row.bio } : {}),
  ...(row?.hobbies ? { hobbies: row.hobbies } : {}),
  role: row?.role || 'user', classId: row?.class_id,
  ...(row?.profile ? { profile: row.profile } : {}),
  createdAt: iso(row?.created_at),
  ...(row?.updated_at ? { updatedAt: iso(row.updated_at) } : {}),
  ...(row && Object.hasOwn(row, 'class_name') ? { className: row.class_name } : {})
});
const mapHobby = row => mergeExtra(row, { id: row?.id, name: row?.name, category: row?.category });
const mapSynonym = row => mergeExtra(row, {
  id: row?.id, name: row?.name, category: row?.category, synonyms: row?.synonyms || []
});

const userSelect = 'SELECT u.*, c.name AS class_name FROM users u LEFT JOIN classes c ON c.id = u.class_id';

const listClasses = async () => (await query('SELECT * FROM classes ORDER BY created_at, id')).rows.map(mapClass);
const getClass = async id => mapClass((await query('SELECT * FROM classes WHERE id=$1', [id])).rows[0]);
const createClass = async item => mapClass((await query(`
  INSERT INTO classes (id,name,description,teacher,created_at) VALUES ($1,$2,$3,$4,$5) RETURNING *
`, [item.id, item.name, item.description || '', item.teacher || '', item.createdAt])).rows[0]);
const updateClass = async (id, item) => mapClass((await query(`
  UPDATE classes SET name=COALESCE($2,name), description=COALESCE($3,description),
    teacher=COALESCE($4,teacher), updated_at=now() WHERE id=$1 RETURNING *
`, [id, item.name ?? null, item.description ?? null, item.teacher ?? null])).rows[0]);
const deleteClass = async id => (await query('DELETE FROM classes WHERE id=$1 RETURNING id', [id])).rowCount > 0;

const listUsers = async ({ includeAdmin = true, classId } = {}) => {
  const filters = [];
  const params = [];
  if (!includeAdmin) filters.push("u.role <> 'admin'");
  if (classId) { params.push(classId); filters.push(`u.class_id=$${params.length}`); }
  const where = filters.length ? ` WHERE ${filters.join(' AND ')}` : '';
  return (await query(`${userSelect}${where} ORDER BY u.created_at,u.id`, params)).rows.map(mapUser);
};
const getUserByEmail = async email => mapUser((await query(`${userSelect} WHERE lower(u.email)=lower($1)`, [email])).rows[0]);
const getUserById = async id => mapUser((await query(`${userSelect} WHERE u.id=$1`, [id])).rows[0]);
const createUser = async item => {
  const result = await query(`
    INSERT INTO users (id,username,name,email,password_hash,avatar,bio,hobbies,role,class_id,profile,created_at,updated_at,extra)
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14) RETURNING id
  `, [item.id, item.username || null, item.name || null, item.email.toLowerCase(), item.password,
    item.avatar || null, item.bio || null, item.hobbies || null, item.role || 'user', item.classId || null,
    item.profile || null, item.createdAt, item.updatedAt || null, item.extra || {}]);
  return getUserById(result.rows[0].id);
};
const updateUser = async (email, updates) => {
  const result = await query(`
    UPDATE users SET
      class_id=CASE WHEN $2::boolean THEN $3 ELSE class_id END,
      profile=CASE WHEN $4::boolean THEN $5::jsonb ELSE profile END,
      avatar=CASE WHEN $6::boolean THEN $7 ELSE avatar END,
      updated_at=now()
    WHERE lower(email)=lower($1) RETURNING id
  `, [email, updates.hasClassId, updates.classId || null, updates.hasProfile,
    updates.profile ? JSON.stringify(updates.profile) : null, updates.hasAvatar, updates.avatar || null]);
  return result.rowCount ? getUserById(result.rows[0].id) : null;
};
const deleteUser = async email => (await query(
  "DELETE FROM users WHERE lower(email)=lower($1) AND role <> 'admin' RETURNING id", [email]
)).rows[0] || null;

const listHobbies = async () => (await query('SELECT * FROM standard_hobbies ORDER BY id')).rows.map(mapHobby);
const listSynonyms = async () => (await query('SELECT * FROM synonym_groups ORDER BY id')).rows.map(mapSynonym);
const createSynonym = async item => mapSynonym((await query(`
  INSERT INTO synonym_groups (id,name,category,synonyms) VALUES ($1,$2,$3,$4) RETURNING *
`, [item.id, item.name, item.category, JSON.stringify(item.synonyms)])).rows[0]);
const updateSynonym = async (id, item) => mapSynonym((await query(`
  UPDATE synonym_groups SET name=$2,category=$3,synonyms=$4 WHERE id=$1 RETURNING *
`, [id, item.name, item.category, JSON.stringify(item.synonyms)])).rows[0]);
const deleteSynonym = async id => (await query('DELETE FROM synonym_groups WHERE id=$1 RETURNING id', [id])).rowCount > 0;
const replaceSynonyms = async groups => withTransaction(async client => {
  await client.query('DELETE FROM synonym_groups');
  for (const item of groups) await client.query(
    'INSERT INTO synonym_groups (id,name,category,synonyms) VALUES ($1,$2,$3,$4)',
    [item.id, item.name, item.category, JSON.stringify(item.synonyms)]
  );
});

const audit = async ({ actor, action, entityType, entityId, details = {}, ip }) => query(`
  INSERT INTO audit_logs (actor_user_id,actor_email,action,entity_type,entity_id,details,ip_address)
  VALUES ($1,$2,$3,$4,$5,$6,$7)
`, [actor?.id || actor?.sub || null, actor?.email || null, action, entityType, entityId || null, details, ip || null]);

module.exports = {
  audit, createClass, createSynonym, createUser, deleteClass, deleteSynonym, deleteUser,
  getClass, getUserByEmail, getUserById, listClasses, listHobbies, listSynonyms, listUsers,
  replaceSynonyms, updateClass, updateSynonym, updateUser
};
