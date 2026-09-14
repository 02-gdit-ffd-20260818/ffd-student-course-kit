export async function loadProjects(fetcher, url) {
  try {
    const response = await fetcher(url)
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const data = await response.json()
    if (!Array.isArray(data)) throw new Error('项目数据必须是数组')
    return { state: data.length === 0 ? 'empty' : 'success', items: data, error: null }
  } catch (error) {
    return { state: 'error', items: [], error: error.message }
  }
}
