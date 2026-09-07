export function parseHash(hash = '') {
  const path = hash.replace(/^#\/?/, '').replace(/\/$/, '')
  if (!path) return { name: 'home', param: '' }
  if (path === 'about') return { name: 'about', param: '' }
  if (path.startsWith('articles/')) {
    return { name: 'article', param: decodeURIComponent(path.slice('articles/'.length)) }
  }
  if (path.startsWith('tags/')) {
    return { name: 'tag', param: decodeURIComponent(path.slice('tags/'.length)) }
  }
  return { name: 'not-found', param: path }
}
