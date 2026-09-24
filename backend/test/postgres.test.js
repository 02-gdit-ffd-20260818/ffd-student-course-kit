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
  await connectDB();
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
