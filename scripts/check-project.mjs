import { readFile } from 'node:fs/promises'

const files = {
  database: await readFile('server/database.js', 'utf8'),
  migration: await readFile('database/migrations/001_initial.sql', 'utf8'),
  articleRepository: await readFile('server/repositories/sqliteArticleRepository.js', 'utf8'),
  userRepository: await readFile('server/repositories/sqliteUserRepository.js', 'utf8'),
  lesson11: await readFile('docs/lesson-11-teacher-guide.md', 'utf8'),
}

const checks = [
  ['SQLite开启外键', /foreign_keys\s*=\s*ON/i.test(files.database)],
  ['SQLite包含用户、文章和评论表', /CREATE TABLE IF NOT EXISTS users/i.test(files.migration) && /CREATE TABLE IF NOT EXISTS articles/i.test(files.migration) && /CREATE TABLE IF NOT EXISTS comments/i.test(files.migration)],
  ['文章仓库使用参数化SQL', /prepare\(/.test(files.articleRepository)],
  ['用户仓库保存密码摘要', /password/i.test(files.userRepository) && /hash/i.test(files.userRepository)],
  ['第11课指南包含401、403、Nginx和回滚', /401/.test(files.lesson11) && /403/.test(files.lesson11) && /Nginx/.test(files.lesson11) && /回滚/.test(files.lesson11)],
]

let failed = false
for (const [name, passed] of checks) {
  console.log(`${passed ? 'PASS' : 'FAIL'} ${name}`)
  if (!passed) failed = true
}
if (failed) process.exitCode = 1
