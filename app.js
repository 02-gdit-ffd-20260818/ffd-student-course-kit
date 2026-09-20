// 第 4 课任务：补全选中状态与事件；HTML 锚点仍可正常跳转。
const navLinks = document.querySelectorAll('nav a');
function updateNavigation() {
  const currentSection = window.location.hash || '#about';
  navLinks.forEach(function (link) {
    // TODO-JS-A：在这里补全“判断当前链接并更新状态”的代码。
    // link 代表 forEach 当前遍历到的一个导航链接；getAttribute('href') 读取它原始的 href，例如“#skills”。
    // === 是严格相等比较：两边的值和类型都相同才得到 true，否则得到 false。
    // currentSection 保存地址栏中的 hash；const isCurrent 把本次比较结果保存为布尔值 true 或 false。
    // classList.toggle('is-current', isCurrent) 在 true 时添加类，在 false 时删除类，由 CSS 决定高亮外观。
    // aria-current='page' 向屏幕阅读器说明当前位置；非当前链接要 removeAttribute 删除该说明。
    // 操作前：链接可以跳转但没有当前项高亮；操作后：只有地址栏 hash 对应的链接高亮。
  });
}
// TODO-JS-B：在这里增加事件监听，并主动执行一次 updateNavigation()。
// window 是当前浏览器窗口；addEventListener 用来登记“事件发生后执行哪个函数”。
// hashchange 是 #about、#skills 等地址片段改变时触发的事件；这里只写函数名，表示事件发生后再调用。
// 最后一行 updateNavigation() 带括号，表示现在立刻执行一次，以便页面第一次打开时也有正确高亮。
// 操作前：函数虽然已经定义，但从未运行；操作后：点击、刷新、前进和后退都会更新高亮。
