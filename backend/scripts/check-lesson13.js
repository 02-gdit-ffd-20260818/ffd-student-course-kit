// 检查实际 DATABASE_PATH 对应的文件；所有试写都在 SAVEPOINT 内回滚，不留实验数据。
const assert = require('node:assert/strict');
const { randomUUID } = require('node:crypto');
const { DatabaseSync } = require('node:sqlite');
const { getDatabaseInfo, closeDB } = require('../src/database');
const stage = Number(process.argv[2]);
if (!Number.isInteger(stage) || stage < 0 || stage > 4) throw new Error('用法：node scripts/check-lesson13.js 0（最后数字是已完成任务数，0—4）');
let info;
try { info = getDatabaseInfo(); } finally { closeDB(); }
console.log('实际检查文件：' + info.path);
const db = new DatabaseSync(info.path);
db.exec('PRAGMA foreign_keys = ON');
db.exec('PRAGMA busy_timeout = 5000');
db.exec('SAVEPOINT lesson13_check');
try {
  const suffix = randomUUID();
  const classId = 'class-' + suffix;
  db.prepare('INSERT INTO classes(id,name,created_at) VALUES(?,?,?)').run(classId, classId, '2026-01-01');
  const insert = db.prepare('INSERT INTO users(id,email,password,class_id,created_at) VALUES(?,?,?,?,?)');
  const id = 'user-' + suffix, email = suffix + '@example.test';
  insert.run(id, email, 'test-only', classId, '2026-01-01');
  const probe = (name, shouldReject, action) => {
    db.exec('SAVEPOINT one_probe');
    try {
      if (shouldReject) assert.throws(action, /constraint|UNIQUE|NOT NULL|FOREIGN KEY/i, name);
      else assert.doesNotThrow(action, name);
      console.log('PASS ' + name + '：' + (shouldReject ? '数据库拒绝' : '起点允许'));
    } finally { db.exec('ROLLBACK TO one_probe'); db.exec('RELEASE one_probe'); }
  };
  probe('重复邮箱', stage >= 1, () => insert.run('new-' + suffix, email, 'test-only', classId, '2026-01-01'));
  probe('重复主键', stage >= 1, () => insert.run(id, 'another-' + email, 'test-only', classId, '2026-01-01'));
  probe('空主键', stage >= 1, () => insert.run(null, 'null-id-' + email, 'test-only', classId, '2026-01-01'));
  probe('空邮箱', stage >= 1, () => insert.run('null-email-' + suffix, null, 'test-only', classId, '2026-01-01'));
  probe('空密码', stage >= 1, () => insert.run('null-password-' + suffix, 'null-password-' + email, null, classId, '2026-01-01'));
  probe('不存在的班级', stage >= 2, () => insert.run('missing-class-' + suffix, 'missing-class-' + email, 'test-only', 'missing-' + suffix, '2026-01-01'));
  probe('删除有学生的班级', stage >= 2, () => db.prepare('DELETE FROM classes WHERE id=?').run(classId));
  assert.equal(info.journalMode, stage >= 4 ? 'wal' : 'unknown', '日志模式报告');
  console.log('PASS 阶段 ' + stage + '；试写即将全部回滚。TODO03 的表格显示还需运行 npm run db:status 检查。');
} finally {
  try { db.exec('ROLLBACK TO lesson13_check'); db.exec('RELEASE lesson13_check'); }
  finally { db.close(); }
}
