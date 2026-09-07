import { createSSRApp, h } from 'vue'
import { renderToString } from '@vue/server-renderer'
import { describe, expect, it } from 'vitest'
import MemberCard from './MemberCard.vue'
import MemberDetail from './MemberDetail.vue'
import MemberFilters from './MemberFilters.vue'
import MemberGrid from './MemberGrid.vue'
import SkillChart from './SkillChart.vue'

const member = { id: 'm1', name: '林晓', role: '前端开发', cohort: '2026 秋季班', location: '', bio: '', skills: ['Vue'], interests: [] }

async function render(component, props) {
  return renderToString(createSSRApp({ render: () => h(component, props) }))
}

describe('成员画像组件', () => {
  it('卡片展示姓名、技能和图片替代文本', async () => {
    const html = await render(MemberCard, { member })
    expect(html).toContain('林晓')
    expect(html).toContain('Vue')
    expect(html).toContain('查看公开详情')
  })

  it('空列表展示授权提示而不是空白页', async () => {
    const html = await render(MemberGrid, { members: [] })
    expect(html).toContain('还没有可公开的成员')
    expect(html).toContain('核对资料授权')
  })

  it('详情页为空字段提供明确回退', async () => {
    const html = await render(MemberDetail, { member })
    expect(html).toContain('地点未公开')
    expect(html).toContain('未公开')
  })

  it('筛选器提供搜索、技能选项和结果数', async () => {
    const html = await render(MemberFilters, { query: '', skill: '', skills: ['Vue', 'CSS'], resultCount: 2 })
    expect(html).toContain('搜索成员')
    expect(html).toContain('全部技能')
    expect(html).toContain('找到 <strong>2</strong> 位成员')
  })

  it('图表组件在服务端输出标题和文本摘要', async () => {
    const html = await render(SkillChart, { members: [member] })
    expect(html).toContain('当前结果的技能分布')
    expect(html).toContain('Vue 1 人')
  })
})
