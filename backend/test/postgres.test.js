const assert = require('node:assert/strict');
const test = require('node:test');
const { randomUUID } = require('node:crypto');
const bcrypt = require('bcryptjs');

process.env.JWT_SECRET ||= 'test-secret-that-is-long-enough-for-ci';
process.env.AUTO_SEED = '0';

const app = require('../src/app');
const { closeDB, connectDB, query } = require('../src/database');
const { runMigrations } = require('../src/migrations');
const repository = require('../src/repository');

let server;
let baseUrl;

test.before(async () => {
  // 下方会清空表：必须显式选择独立测试库，不能直接对课堂作品库运行 npm test。
  // 先验证运行模式，再查询实际连接的库名（DATABASE_URL 的优先级高于 POSTGRES_DB）。
  assert.equal(process.env.NODE_ENV, 'test', '数据库测试必须设置 NODE_ENV=test，且使用独立测试库');
  await connectDB();
  const actualDatabase = (await query('SELECT current_database() AS name')).rows[0].name;
  assert.match(actualDatabase, /^[a-z][a-z0-9_]*_test$/, '只允许操作以 _test 结尾的独立数据库');
  assert.equal(process.env.ALLOW_DATABASE_RESET, actualDatabase, '必须将 ALLOW_DATABASE_RESET 显式设置为实际测试库名');
  await runMigrations();
  await query('TRUNCATE audit_logs,users,classes,standard_hobbies,synonym_groups RESTART IDENTITY CASCADE');
  await repository.createClass({ id: 'class-test', name: '测试班级', description: 'PostgreSQL regression test', createdAt: new Date() });
  await repository.createUser({
    id: randomUUID(), name: '管理员', email: 'admin@test.local', password: await bcrypt.hash('admin-pass-123', 4),
    role: 'admin', createdAt: new Date()
  });
  await new Promise(resolve => { server = app.listen(0, '127.0.0.1', resolve); });
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

test('PostgreSQL persistence and authenticated API preserve frontend contracts', async () => {
  const registration = await fetch(`${baseUrl}/api/users/register`, {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ name: '测试用户', email: 'person@test.local', password: 'user-pass-123', classId: 'class-test' })
  });
  assert.equal(registration.status, 201);
  const registered = await registration.json();
  assert.equal(registered.email, 'person@test.local');
  assert.equal(typeof registered.token, 'string');
  assert.equal(Object.hasOwn(registered, 'password'), false);
  assert.equal(registered.className, '测试班级');

  const login = await fetch(`${baseUrl}/api/users/login`, {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email: 'person@test.local', password: 'user-pass-123' })
  });
  assert.equal(login.status, 200);
  const loggedIn = await login.json();

  const wall = await fetch(`${baseUrl}/api/photowall`, { headers: { authorization: `Bearer ${loggedIn.token}` } });
  assert.equal(wall.status, 200);
  const wallData = await wall.json();
  assert.equal(wallData.success, true);
  assert.equal(wallData.data.length, 1);
  assert.equal(Object.hasOwn(wallData.data[0], 'password'), false);

  const counts = (await query('SELECT count(*)::int AS count FROM audit_logs')).rows[0];
  assert.equal(counts.count >= 2, true);
});

test.after(async () => {
  if (server) await new Promise(resolve => server.close(resolve));
  await closeDB();
});
