import { createSSRApp, h } from 'vue'
import { renderToString } from '@vue/server-renderer'
import { describe, expect, it } from 'vitest'
import ProjectCard from './ProjectCard.vue'

const project = {
  id: 'p1',
  name: '一页知我',
  summary: '个人作品门户',
  status: '进行中',
  skills: ['Vue', 'CI/CD'],
  url: 'https://example.com/p1',
}

describe('ProjectCard', () => {
  it('根据 prop 渲染项目内容和链接', async () => {
    const html = await renderToString(createSSRApp({
      render: () => h(ProjectCard, { project }),
    }))
    expect(html).toContain('<h3>一页知我</h3>')
    expect(html).toContain('href="https://example.com/p1"')
    expect(html).toContain('Vue · CI/CD')
  })

  it('声明必需的 project prop 和 select 事件', () => {
    expect(ProjectCard.props.project.required).toBe(true)
    expect(ProjectCard.emits).toContain('select')
  })
})
