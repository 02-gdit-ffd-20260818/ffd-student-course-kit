import { normalizeArticles } from './articleService.js'

export async function loadArticles(fetcher, url = '/articles.json') {
  try {
    const response = await fetcher(url)
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const articles = normalizeArticles(await response.json())
    return { status: articles.length ? 'success' : 'empty', articles, message: '' }
  } catch (error) {
    return {
      status: 'error',
      articles: [],
      message: error instanceof Error ? error.message : '文章加载失败',
    }
  }
}
