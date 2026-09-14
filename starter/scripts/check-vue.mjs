import { readFile } from 'node:fs/promises'

const files = {
  index: await readFile(new URL('../index.html', import.meta.url), 'utf8'),
  app: await readFile(new URL('../src/App.vue', import.meta.url), 'utf8'),
  header: await readFile(new URL('../src/components/ProfileHeader.vue', import.meta.url), 'utf8'),
  controls: await readFile(new URL('../src/components/ProjectControls.vue', import.meta.url), 'utf8'),
  card: await readFile(new URL('../src/components/ProjectCard.vue', import.meta.url), 'utf8'),
}

const rules = [
  ['index 包含 Vue 挂载点', files.index.includes('id="app"')],
  ['App 使用语义化 main/section', /<main\b/.test(files.app) && /<section\b/.test(files.app)],
  ['App 组合项目组件', files.app.includes('<ProjectControls') && files.app.includes('<ProjectList')],
  ['Header 声明并触发 emit', files.header.includes("defineEmits(['toggle-theme'])") && files.header.includes("$emit('toggle-theme')")],
  ['Controls 使用 props 与 emits', files.controls.includes('defineProps') && files.controls.includes('defineEmits')],
  ['ProjectCard 使用 props 与 emits', files.card.includes('defineProps') && files.card.includes('defineEmits')],
]

const failures = rules.filter(([, passed]) => !passed).map(([name]) => name)
if (failures.length > 0) {
  console.error('Vue 结构检查失败：')
  failures.forEach(item => console.error(`- ${item}`))
  process.exitCode = 1
} else {
  console.log('Vue 结构检查通过：挂载点、语义结构、组件组合及 props/emit 符合 v2.0 要求。')
}
