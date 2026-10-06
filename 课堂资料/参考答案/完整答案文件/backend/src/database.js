const fs = require('fs');
const path = require('path');
// Node.js 24 内置 SQLite 驱动，不需要安装第三方数据库依赖，也不需要本机编译环境。
// DatabaseSync 是同步版数据库对象，prepare/run/all/get 的写法与课堂讲解一一对应。
const { DatabaseSync } = require('node:sqlite');

const backendRoot = path.resolve(__dirname, '..');
require('dotenv').config({ path: path.join(backendRoot, '.env'), quiet: true });

const seedDataPath = path.join(backendRoot, 'data', 'seed.json');
const configuredDbPath = process.env.DATABASE_PATH || path.join('data', 'persona-link.sqlite');
const sqlitePath = path.isAbsolute(configuredDbPath)
  ? configuredDbPath
  : path.resolve(backendRoot, configuredDbPath);

let sqlite = null;
let sharedData = null;

const collectionDefaults = () => ({
  classes: [],
  users: [],
  standard_hobbies: [],
  synonymGroups: []
});

const parseJson = (value, fallback) => {
  if (value === null || value === undefined || value === '') return fallback;

  try {
    return JSON.parse(value);
  } catch (error) {
    console.warn('忽略无法解析的数据库 JSON 字段:', error.message);
    return fallback;
  }
};

const omit = (object, keys) => Object.fromEntries(
  Object.entries(object).filter(([key]) => !keys.includes(key))
);

const addOptional = (target, key, value) => {
  if (value !== null && value !== undefined) target[key] = value;
};

const initializeSchema = (database) => {
  // PRAGMA 是 SQLite 自己的开关语句，用 exec 直接执行。
  database.exec('PRAGMA journal_mode = WAL');
  database.exec('PRAGMA foreign_keys = ON');
  database.exec('PRAGMA busy_timeout = 5000');
  database.exec('PRAGMA synchronous = NORMAL');

  const schemaSql = `
    CREATE TABLE IF NOT EXISTS metadata (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS classes (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      description TEXT NOT NULL DEFAULT '',
      teacher TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL,
      updated_at TEXT,
      extra_json TEXT NOT NULL DEFAULT '{}'
    );

    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY NOT NULL,
      username TEXT,
      name TEXT,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      avatar TEXT,
      bio TEXT,
      hobbies_json TEXT,
      role TEXT,
      class_id TEXT REFERENCES classes(id) ON DELETE RESTRICT,
      profile_json TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT,
      extra_json TEXT NOT NULL DEFAULT '{}'
    );

    CREATE INDEX IF NOT EXISTS idx_users_class_id ON users(class_id);
    CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

    CREATE TABLE IF NOT EXISTS standard_hobbies (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      extra_json TEXT NOT NULL DEFAULT '{}'
    );

    CREATE TABLE IF NOT EXISTS synonym_groups (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      synonyms_json TEXT NOT NULL,
      extra_json TEXT NOT NULL DEFAULT '{}'
    );
  `;
  // 教师提供的启动保护：先在内存中解析本阶段的建表语句，再比较已有 users 表。
  // CREATE IF NOT EXISTS 不会修改旧表；结构不同必须停止，不能把旧表当新表验收。
  const expected = new DatabaseSync(':memory:');
  try {
    expected.exec(schemaSql);
    const existing = database.prepare("SELECT sql FROM sqlite_master WHERE type='table' AND name='users'").get();
    const wanted = expected.prepare("SELECT sql FROM sqlite_master WHERE type='table' AND name='users'").get();
    const normalize = sql => sql.replace(/--[^\n]*/g, '').replace(/\s+/g, '').toLowerCase();
    if (existing && normalize(existing.sql) !== normalize(wanted.sql)) {
      throw new Error('[LESSON13_SCHEMA_MISMATCH] users 旧表与当前代码不同。原数据已保留：' + sqlitePath +
        '。课堂实验请停止后端，在 backend/.env 将 DATABASE_PATH 改为未使用的新文件路径；真实数据需先备份再迁移。');
    }
  } finally { expected.close(); }
  database.exec(schemaSql);
};

const loadData = (database) => {
  const data = collectionDefaults();

  data.classes = database.prepare('SELECT * FROM classes ORDER BY rowid').all().map(row => {
    const item = {
      ...parseJson(row.extra_json, {}),
      id: row.id,
      name: row.name,
      description: row.description,
      teacher: row.teacher,
      createdAt: row.created_at
    };
    addOptional(item, 'updatedAt', row.updated_at);
    return item;
  });

  data.users = database.prepare('SELECT * FROM users ORDER BY rowid').all().map(row => {
    const item = {
      ...parseJson(row.extra_json, {}),
      id: row.id,
      email: row.email,
      password: row.password,
      classId: row.class_id,
      createdAt: row.created_at
    };
    addOptional(item, 'username', row.username);
    addOptional(item, 'name', row.name);
    addOptional(item, 'avatar', row.avatar);
    addOptional(item, 'bio', row.bio);
    addOptional(item, 'hobbies', parseJson(row.hobbies_json, null));
    addOptional(item, 'role', row.role);
    addOptional(item, 'profile', parseJson(row.profile_json, null));
    addOptional(item, 'updatedAt', row.updated_at);
    return item;
  });

  data.standard_hobbies = database.prepare('SELECT * FROM standard_hobbies ORDER BY id').all().map(row => ({
    ...parseJson(row.extra_json, {}),
    id: row.id,
    name: row.name,
    category: row.category
  }));

  data.synonymGroups = database.prepare('SELECT * FROM synonym_groups ORDER BY rowid').all().map(row => ({
    ...parseJson(row.extra_json, {}),
    id: row.id,
    name: row.name,
    category: row.category,
    synonyms: parseJson(row.synonyms_json, [])
  }));

  return data;
};

const persistData = (database, data) => {
  const insertClass = database.prepare(`
    INSERT INTO classes (id, name, description, teacher, created_at, updated_at, extra_json)
    VALUES (@id, @name, @description, @teacher, @createdAt, @updatedAt, @extraJson)
  `);
  const insertUser = database.prepare(`
    INSERT INTO users (
      id, username, name, email, password, avatar, bio, hobbies_json, role,
      class_id, profile_json, created_at, updated_at, extra_json
    ) VALUES (
      @id, @username, @name, @email, @password, @avatar, @bio, @hobbiesJson, @role,
      @classId, @profileJson, @createdAt, @updatedAt, @extraJson
    )
  `);
  const insertHobby = database.prepare(`
    INSERT INTO standard_hobbies (id, name, category, extra_json)
    VALUES (@id, @name, @category, @extraJson)
  `);
  const insertSynonymGroup = database.prepare(`
    INSERT INTO synonym_groups (id, name, category, synonyms_json, extra_json)
    VALUES (@id, @name, @category, @synonymsJson, @extraJson)
  `);

  // 事务：把下面的写操作打包成一次提交；中途出错就整体回滚，不会留下写了一半的数据。
  const writeTransaction = () => {
    database.exec('BEGIN');
    try {
      database.prepare('DELETE FROM users').run();
      database.prepare('DELETE FROM classes').run();
      database.prepare('DELETE FROM standard_hobbies').run();
      database.prepare('DELETE FROM synonym_groups').run();

      for (const item of data.classes || []) {
        insertClass.run({
          id: String(item.id),
          name: item.name,
          description: item.description || '',
          teacher: item.teacher || '',
          createdAt: item.createdAt || new Date().toISOString(),
          updatedAt: item.updatedAt || null,
          extraJson: JSON.stringify(omit(item, [
            'id', 'name', 'description', 'teacher', 'createdAt', 'updatedAt'
          ]))
        });
      }

      for (const item of data.users || []) {
        insertUser.run({
          id: String(item.id),
          username: item.username ?? null,
          name: item.name ?? null,
          email: item.email,
          password: item.password,
          avatar: item.avatar ?? null,
          bio: item.bio ?? null,
          hobbiesJson: item.hobbies === undefined ? null : JSON.stringify(item.hobbies),
          role: item.role ?? null,
          classId: item.classId || null,
          profileJson: item.profile === undefined ? null : JSON.stringify(item.profile),
          createdAt: item.createdAt || new Date().toISOString(),
          updatedAt: item.updatedAt || null,
          extraJson: JSON.stringify(omit(item, [
            'id', 'username', 'name', 'email', 'password', 'avatar', 'bio', 'hobbies',
            'role', 'classId', 'profile', 'createdAt', 'updatedAt'
          ]))
        });
      }

      for (const item of data.standard_hobbies || []) {
        insertHobby.run({
          id: Number(item.id),
          name: item.name,
          category: item.category,
          extraJson: JSON.stringify(omit(item, ['id', 'name', 'category']))
        });
      }

      for (const item of data.synonymGroups || []) {
        insertSynonymGroup.run({
          id: String(item.id),
          name: item.name,
          category: item.category,
          synonymsJson: JSON.stringify(item.synonyms || []),
          extraJson: JSON.stringify(omit(item, ['id', 'name', 'category', 'synonyms']))
        });
      }
      database.exec('COMMIT');
    } catch (error) {
      database.exec('ROLLBACK');
      throw error;
    }
  };

  writeTransaction();
};

const normalizeSeedData = (seedData) => {
  const data = { ...collectionDefaults(), ...seedData };

  for (const key of Object.keys(collectionDefaults())) {
    if (!Array.isArray(data[key])) data[key] = [];
  }

  if (Array.isArray(data.synonyms) && data.synonyms.length > 0 && data.synonymGroups.length === 0) {
    data.synonymGroups = data.synonyms.map((synonyms, index) => ({
      id: `migrated-${index}`,
      name: `迁移的同义词组 ${index + 1}`,
      category: '未分类',
      synonyms
    }));
  }

  delete data.synonyms;
  return data;
};

const importSeedDataIfNeeded = (database) => {
  const migration = database.prepare(
    "SELECT value FROM metadata WHERE key = 'seed_data_imported'"
  ).get();
  if (migration) return;

  const tableCount = database.prepare(`
    SELECT
      (SELECT COUNT(*) FROM classes) +
      (SELECT COUNT(*) FROM users) +
      (SELECT COUNT(*) FROM standard_hobbies) +
      (SELECT COUNT(*) FROM synonym_groups) AS count
  `).get().count;

  if (tableCount === 0 && process.env.SKIP_SEED_IMPORT !== '1' && fs.existsSync(seedDataPath)) {
    const seedData = normalizeSeedData(JSON.parse(fs.readFileSync(seedDataPath, 'utf8')));
    persistData(database, seedData);
    console.log(`已将 seed.json 初始化到 SQLite：${sqlitePath}`);
  }

  database.prepare(`
    INSERT INTO metadata (key, value) VALUES ('seed_data_imported', @value)
    ON CONFLICT(key) DO UPDATE SET value = excluded.value
  `).run({ value: new Date().toISOString() });
};

const openDatabase = () => {
  if (sqlite) return sqlite;

  fs.mkdirSync(path.dirname(sqlitePath), { recursive: true });
  sqlite = new DatabaseSync(sqlitePath);
  try {
    initializeSchema(sqlite);
    importSeedDataIfNeeded(sqlite);
    sharedData = loadData(sqlite);
    return sqlite;
  } catch (error) {
    sqlite.close();
    sqlite = null;
    sharedData = null;
    throw error;
  }
};

const connectDB = async () => {
  const database = openDatabase();

  return {
    data: sharedData,
    write: async () => persistData(database, sharedData)
  };
};

const closeDB = () => {
  if (!sqlite) return;
  sqlite.close();
  sqlite = null;
  sharedData = null;
};

const getDatabaseInfo = () => {
  const database = openDatabase();
  return {
    path: sqlitePath,
    journalMode: database.prepare('PRAGMA journal_mode').get().journal_mode,
    counts: {
      classes: database.prepare('SELECT COUNT(*) AS count FROM classes').get().count,
      users: database.prepare('SELECT COUNT(*) AS count FROM users').get().count,
      standardHobbies: database.prepare('SELECT COUNT(*) AS count FROM standard_hobbies').get().count,
      synonymGroups: database.prepare('SELECT COUNT(*) AS count FROM synonym_groups').get().count
    }
  };
};

module.exports = { connectDB, closeDB, getDatabaseInfo };
