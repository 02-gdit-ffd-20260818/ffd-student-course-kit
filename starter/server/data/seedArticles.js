export const seedArticles = [
  {
    id: 1,
    slug: 'first-vue-component',
    title: '从第一个 Vue 组件开始',
    summary: '把一整页拆成职责明确、可以独立验证的小组件。',
    content: ['组件不是为了把文件拆得更多，而是为了让数据来源和用户意图更清楚。'],
    tags: ['Vue', '组件'], status: 'published', publishedAt: '2026-08-20', author: '林晓',
  },
  {
    id: 2,
    slug: 'four-ui-states',
    title: '数据页面不能只有成功态',
    summary: '阅读端同时处理加载、空列表、失败和文章不存在。',
    content: ['空数据和请求失败代表不同问题，也应该提供不同的下一步。'],
    tags: ['测试', '用户体验'], status: 'published', publishedAt: '2026-08-24', author: '林晓',
  },
  {
    id: 3,
    slug: 'evidence-before-release',
    title: '发布之前先留下证据',
    summary: '用自动测试、构建产物和公开 URL 证明版本可交付。',
    content: ['每个版本都保存测试结果、CI 记录、Release 和可匿名访问的链接。'],
    tags: ['CI/CD', '发布'], status: 'draft', publishedAt: '2026-08-28', author: '林晓',
  },
]
