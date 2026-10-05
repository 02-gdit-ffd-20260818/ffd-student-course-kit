# 第 4 课教师答案

教师完整答案文件：`app.js`。

```js
const navLinks = document.querySelectorAll('nav a');
function updateNavigation() {
  const currentSection = window.location.hash || '#about';
  navLinks.forEach(function (link) {
    const isCurrent = link.getAttribute('href') === currentSection;
    link.classList.toggle('is-current', isCurrent);
    if (isCurrent) {
      link.setAttribute('aria-current', 'location');
    } else {
      link.removeAttribute('aria-current');
    }
  });
}
window.addEventListener('hashchange', updateNavigation);
updateNavigation();
```

成功标志：点击、后退或直接打开 `#skills` 时始终只高亮一个栏目。
