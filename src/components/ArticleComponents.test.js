import { createSSRApp, h } from 'vue'
import { renderToString } from '@vue/server-renderer'
import { describe, expect, it } from 'vitest'
import ArticleCard from './ArticleCard.vue'
import ArticleDetail from './ArticleDetail.vue'
import ArticleList from './ArticleList.vue'

const article = { id: 1, slug: 'hello', title: '第一篇', summary: '摘要', tags: ['Vue'], author: '林晓', publishedAt: '2026-08-20', content: ['正文'] }

describe('阅读端组件', () => {
  it('ArticleCard 输出标题、标签和可辨识按钮', async () => {
    const html = await renderToString(createSSRApp({ render: () => h(ArticleCard, { article }) }))
    expect(html).toContain('第一篇')
    expect(html).toContain('Vue')
    expect(html).toContain('阅读全文')
  })

  it('ArticleList 空数组输出明确空态', async () => {
    const html = await renderToString(createSSRApp({ render: () => h(ArticleList, { articles: [], status: 'empty' }) }))
    expect(html).toContain('还没有文章')
  })

  it('ArticleDetail 缺少文章时给出恢复入口', async () => {
    const html = await renderToString(createSSRApp({ render: () => h(ArticleDetail, { article: null }) }))
    expect(html).toContain('没有找到')
    expect(html).toContain('返回文章列表')
  })
})
