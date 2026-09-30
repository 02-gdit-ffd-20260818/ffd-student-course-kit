#!/usr/bin/env node
/**
 * 路线 A 续课工具：从上一课个人仓库创建下一课仓库。
 * 默认只预演；显式传入 --apply 才会写入新的目标目录。
 * 原仓库永远只读，所有操作先在临时目录完成。
 */

import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync, renameSync, rmSync, writeFileSync } from 'node:fs'
import { basename, dirname, join, resolve } from 'node:path'

// 正式课堂使用公开仓库；自动化测试可通过环境变量换成本地镜像。
const COURSE_REPOSITORY = process.env.FFD_COURSE_REPOSITORY
  || 'https://github.com/02-gdit-ffd-20260818/ffd-student-course-kit.git'

const args = process.argv.slice(2)
const valueOf = (name) => {
  const index = args.indexOf(name)
  return index >= 0 ? args[index + 1] : undefined
}
const has = (name) => args.includes(name)
const next = valueOf('--next')
const targetArg = valueOf('--target')
const newOrigin = valueOf('--origin')
const apply = has('--apply')
const preview = has('--preview') || !apply
const source = resolve(valueOf('--source') || process.cwd())

const fail = (message) => {
  console.error(`\n[X] ${message}`)
  process.exit(1)
}
const run = (command, commandArgs, options = {}) => execFileSync(command, commandArgs, {
  cwd: options.cwd || source,
  encoding: 'utf8',
  stdio: options.capture ? ['ignore', 'pipe', 'pipe'] : 'inherit',
})
const capture = (command, commandArgs, cwd = source) => run(command, commandArgs, { cwd, capture: true }).trim()

if (!next || !targetArg) {
  fail('用法：node continue-lesson.mjs --next <分支> --target <新目录> [--origin <新仓库URL>] --preview|--apply')
}
if (preview && apply) fail('--preview 和 --apply 不能同时使用')
if (!existsSync(join(source, '.git'))) fail(`上一课目录不是 Git 仓库：${source}`)
if (capture('git', ['status', '--porcelain'], source)) fail('上一课还有未提交改动；先提交或撤销，再续课')

const target = resolve(source, targetArg)
if (target === source || target.startsWith(source + '\\') || target.startsWith(source + '/')) {
  fail('新课目录必须位于上一课目录之外')
}
if (existsSync(target)) fail(`目标目录已经存在：${target}`)

let previousOrigin = ''
try { previousOrigin = capture('git', ['remote', 'get-url', 'origin'], source) } catch {}
try {
  capture('git', ['ls-remote', '--exit-code', '--heads', COURSE_REPOSITORY, next], source)
} catch {
  fail(`课程仓库不存在分支 ${next}，或当前网络无法访问 GitHub`)
}

console.log('\n=== 路线 A 续课计划 ===')
console.log(`上一课（只读）：${source}`)
console.log(`下一课分支：    ${next}`)
console.log(`新课目录：      ${target}`)
console.log(`上一课远端：    ${previousOrigin || '未配置'}`)
console.log(`本课新远端：    ${newOrigin || '暂不配置，完成后按手册添加'}`)

if (preview) {
  console.log('\n[预演完成] 没有修改任何文件。确认后把 --preview 改成 --apply。')
  process.exit(0)
}

const temporary = `${target}.course-tmp-${process.pid}`
if (existsSync(temporary)) fail(`临时目录已存在：${temporary}`)
mkdirSync(dirname(target), { recursive: true })

try {
  run('git', ['clone', '--no-hardlinks', source, temporary], { cwd: dirname(target) })
  const git = (...commandArgs) => run('git', commandArgs, { cwd: temporary })
  const text = (...commandArgs) => capture('git', commandArgs, temporary)

  git('remote', 'remove', 'origin')
  if (previousOrigin) git('remote', 'add', 'previous', previousOrigin)
  git('remote', 'add', 'course', COURSE_REPOSITORY)
  git('fetch', '--depth', '1', 'course', next)

  const manifestText = text('show', `course/${next}:course-manifest.json`)
  const manifest = JSON.parse(manifestText)
  if (manifest.branch !== next) throw new Error(`分支清单不匹配：期望 ${next}，实际 ${manifest.branch}`)

  if (manifest.mode === 'stage') {
    const preserve = {
      'lesson-13': 'backend/db.json',
      'lesson-14': 'backend/data/seed.json',
      'lesson-15': 'backend/db.json',
    }[next]
    const saved = preserve && existsSync(join(temporary, preserve)) ? join(temporary, preserve) : null
    const savedCopy = saved ? readFileSync(saved) : null
    git('rm', '-r', '-q', '--ignore-unmatch', '.')
    git('checkout', `course/${next}`, '--', '.')
    if (savedCopy) {
      const dataDir = join(temporary, '课堂资料', '上一课数据')
      mkdirSync(dataDir, { recursive: true })
      const filename = basename(preserve)
      writeFileSync(join(dataDir, filename), savedCopy)
    }
  } else {
    const paths = ['课堂资料', 'course-tools', 'course-manifest.json', ...(manifest.add_paths || [])]
    for (const path of paths) git('checkout', `course/${next}`, '--', path)
  }

  if (newOrigin) git('remote', 'add', 'origin', newOrigin)
  git('add', '-A')
  const changed = text('status', '--porcelain')
  if (changed) {
    git('-c', 'user.name=课程续课工具', '-c', 'user.email=noreply@example.com',
      'commit', '-m', `chore: 准备 ${next} 课堂工程`)
  }
  renameSync(temporary, target)
  console.log(`\n[OK] 新课目录已经准备好：${target}`)
  console.log(`[OK] 上一课目录未修改：${source}`)
  console.log('下一步：进入新目录，阅读 课堂资料/本课操作手册.md；确认后再手动 push。')
} catch (error) {
  try { rmSync(temporary, { recursive: true, force: true }) } catch {}
  fail(`续课失败，已清理临时目录：${error.message}`)
}
