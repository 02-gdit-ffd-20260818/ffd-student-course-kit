// 本课小交互：让导航显示当前选中的栏目。
// HTML 的锚点本身负责跳转，JavaScript 只负责选中状态。

// 1. 查找 DOM：拿到导航中的全部链接。
const navLinks = document.querySelectorAll('nav a');

// 2. 定义函数：读取网址中的 #栏目ID，逐一更新链接。
function updateNavigation() {
  const currentSection = window.location.hash || '#about';

  navLinks.forEach(function (link) {
    const isCurrent = link.getAttribute('href') === currentSection;
    link.classList.toggle('is-current', isCurrent);

    // aria-current 同时向屏幕阅读器说明哪个栏目被选中。
    if (isCurrent) {
      link.setAttribute('aria-current', 'location');
    } else {
      link.removeAttribute('aria-current');
    }
  });
}

// 3. 监听事件：点击锚点、浏览器前进或后退改变 # 时，重新更新。
window.addEventListener('hashchange', updateNavigation);

// 4. 首次打开也执行一次，支持直接访问带 # 的链接。
updateNavigation();
