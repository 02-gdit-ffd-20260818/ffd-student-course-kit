// 工程根目录：node scripts/check-lesson.mjs 2 1（第2课，刚完成任务1）。
// 不请求外部音源，不修改源码；测试中的 localStorage 属于隔离模拟浏览器。
import { spawn } from 'node:child_process'
import { fileURLToPath } from 'node:url'
const lesson = Number(process.argv[2]), stage = Number(process.argv[3])
if (![1, 2, 3].includes(lesson) || !Number.isInteger(stage) || stage < 0 || stage > (lesson === 2 ? 5 : 4)) {
  console.error('参数：课次 1/2/3，阶段 0..4（第2课为0..5）；0是未修改起点。')
  process.exit(1)
}
const root = fileURLToPath(new URL('../', import.meta.url))
const child = spawn(process.execPath, [fileURLToPath(new URL('../node_modules/vitest/vitest.mjs', import.meta.url)), 'run', 'tests/course-stage.spec.js'], {
  cwd: root, stdio: 'inherit', env: { ...process.env, P5_LESSON: String(lesson), P5_STAGE: String(stage) },
})
child.on('error', error => { console.error(error.message); process.exitCode = 1 })
child.on('exit', code => { process.exitCode = code ?? 1 })
