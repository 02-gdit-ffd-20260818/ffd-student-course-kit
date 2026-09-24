const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');

const testDirectory = fs.mkdtempSync(path.join(os.tmpdir(), 'personalink-sqlite-'));
process.env.DATABASE_PATH = path.join(testDirectory, 'test.sqlite');
process.env.SKIP_SEED_IMPORT = '1';

const { connectDB, closeDB, getDatabaseInfo } = require('../src/database');

test('persists and reloads every application collection', async () => {
  const db = await connectDB();
  const createdAt = '2026-01-01T00:00:00.000Z';

  db.data.classes.push({
    id: 'class-test',
    name: '测试班级',
    description: 'SQLite 回归测试',
    teacher: '测试老师',
    createdAt
  });
  db.data.users.push({
    id: 'user-test',
    email: 'test@example.com',
    password: 'test-password',
    classId: 'class-test',
    profile: { name: '测试用户', hometown: '上海', hobbies: ['阅读'] },
    createdAt
  });
  db.data.standard_hobbies.push({ id: 1, name: '阅读', category: '文化' });
  db.data.synonymGroups.push({
    id: 'reading',
    name: '阅读类',
    category: '文化',
    synonyms: ['阅读', '读书']
  });

  await db.write();
  closeDB();

  const reopened = await connectDB();
  assert.equal(reopened.data.classes[0].name, '测试班级');
  assert.equal(reopened.data.users[0].profile.hometown, '上海');
  assert.deepEqual(reopened.data.synonymGroups[0].synonyms, ['阅读', '读书']);
  assert.deepEqual(getDatabaseInfo().counts, {
    classes: 1,
    users: 1,
    standardHobbies: 1,
    synonymGroups: 1
  });
});

test.after(() => {
  closeDB();
  fs.rmSync(testDirectory, { recursive: true, force: true });
});
