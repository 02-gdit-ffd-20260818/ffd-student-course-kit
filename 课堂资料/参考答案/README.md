# 第04课：五个任务参考答案

只修改 `app.js` 指定位置；完整答案为本目录同名文件。不要用另一套函数名整体替换。

1. TODO01：在toTopButton的click回调内加入 `window.scrollTo({ top: 0, behavior: 'smooth' })`，保留其后的历史地址同步代码。
2. TODO02：在handleScroll中使用 `toTopButton.classList.toggle('is-visible', window.scrollY > window.innerHeight * 0.6)`。六成屏高后显示，回到顶部隐藏。
3. TODO03：在updateProgress内保留scrollable和ratio计算，把宽度改成下面的模板字符串。
4. TODO04：showCurrent内用Map取得栏目名，并根据isCurrent切换类；保留aria-current逻辑。
5. TODO05：文件中加入hashchange监听和首次调用。前者管变化，后者管直接打开带锚点网址。

任务03：
```js
progressBar.style.width = `${ratio * 100}%`
```

任务04的两个位置：
```js
indicator.textContent = sectionNames.get(current) || ''
// 下一行放在navLinks.forEach回调中，isCurrent定义之后：
link.classList.toggle('is-current', isCurrent)
```

任务05：
```js
window.addEventListener('hashchange', () => showCurrent(location.hash))
showCurrent(location.hash)
```

逐项验证：滚动出现返回顶部按钮；点击回顶；进度条随滚动变化；导航点击、浏览器后退、直接打开#skills时同步高亮。IntersectionObserver两段保留，不属于新增任务。
