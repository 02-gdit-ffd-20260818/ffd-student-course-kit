# 第05课：六个任务参考答案

完整答案为 `works-data.js` 和 `works-render.js`。每次只替换本任务范围，不覆盖自己的作品数据。

|任务|文件与位置|操作|
|---|---|---|
|01|works-data.js第一个对象|填title、description、image、url、year、tags六个字段|
|02|同一works数组|添加三个对象，使总数为四；对象之间保留逗号|
|03|works-render.js的createWorkCard|设置link.href、image.src/image.alt、title.textContent、description.textContent，按完整同名函数核对|
|04|renderWorks中items.length===0分支|创建提示li，加入fragment，见下方|
|05|getVisibleWorks|按activeTag筛选；全部标签不筛选|
|06|getVisibleWorks及排序按钮回调|复制后排序、切换newestFirst、更新按钮文字并重新渲染|

任务04（放在空数组分支内部）：
```js
const empty = document.createElement('li')
empty.className = 'works-empty'
empty.textContent = '这个标签下还没有作品。'
fragment.append(empty)
```

任务05、06合并完成后的getVisibleWorks函数体：
```js
const filtered =
  activeTag === '全部' ? works : works.filter(work => work.tags.includes(activeTag))
return [...filtered].sort((a, b) => (newestFirst ? b.year - a.year : a.year - b.year))
```

任务06的排序按钮回调体：
```js
newestFirst = !newestFirst
sortButton.textContent = newestFirst ? '按年份：新→旧' : '按年份：旧→新'
renderWorks()
```

renderWorks不接收参数，而是读取当前筛选/排序状态；不要照旧说明写renderWorks(works)。验证四张卡片、按标签筛选、反向排序、空数组提示，以及反复操作不会重复增加卡片。测试结束恢复个人数据。
