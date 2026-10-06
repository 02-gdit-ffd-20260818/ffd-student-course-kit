// 教师提供的备份工具：源文件必须存在，目标必须是新文件；不会删除或覆盖原库。
const fs = require('node:fs');
const path = require('node:path');
const { DatabaseSync } = require('node:sqlite');
const backendRoot = path.resolve(__dirname, '..');
require('dotenv').config({ path: path.join(backendRoot, '.env'), quiet: true });
const source = path.resolve(backendRoot, process.env.DATABASE_PATH || 'data/persona-link.sqlite');
const destinationArg = process.argv[2];
if (!destinationArg) throw new Error('用法：node scripts/backup-sqlite.js data/backup-01.sqlite（目标文件不能已存在）');
const destination = path.resolve(backendRoot, destinationArg);
if (!fs.existsSync(source)) throw new Error('源数据库不存在，停止；不会创建空库：' + source);
if (source === destination || fs.existsSync(destination)) throw new Error('目标必须是未使用的新路径，不允许覆盖：' + destination);
fs.mkdirSync(path.dirname(destination), { recursive: true });
const database = new DatabaseSync(source, { readOnly: true });
try {
  database.exec('PRAGMA busy_timeout = 5000');
  // VACUUM INTO 让 SQLite 自己生成一致的单文件副本，包含已提交的 WAL 数据。
  // ? 是参数占位符，绑定文件路径，不把路径拼接成 SQL。
  database.prepare('VACUUM INTO ?').run(destination);
} finally { database.close(); }
const copy = new DatabaseSync(destination, { readOnly: true });
try {
  const check = copy.prepare('PRAGMA integrity_check').get().integrity_check;
  if (check !== 'ok') throw new Error('备份完整性检查失败：' + check);
  const count = copy.prepare('SELECT COUNT(*) AS total FROM users').get().total;
  console.log('备份完成：' + destination);
  console.log('integrity_check: ok；users 行数：' + count);
  console.log('原数据库保留。可用 Navicat 打开此副本进行恢复演练。');
} finally { copy.close(); }
