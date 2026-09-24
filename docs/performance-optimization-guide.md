# PersonaLink 动画性能优化指南

> 启动命令中的 **`dev` = development（开发模式）**；`npm ci` 的含义与命名背景见 npm 命令词典与命名故事。

本指南面向第一次分析网页动画性能的同学，介绍 PersonaLink 中的动画工具、监控面板和浏览器排查方法。建议先启动项目，再对一个页面做小范围修改，观察修改前后的差异。

## 1. 开始前：启动开发环境

如果项目还没有启动，分别在两个终端执行：

```bash
# 终端一：进入后端目录
cd backend

# 按锁文件安装依赖；npm ci 不会主动修改 package-lock.json
npm ci

# 启动后端服务，默认使用 3003 端口
npm start
```

```bash
# 终端二：从项目根目录进入前端目录
cd frontend

# 按锁文件安装前端依赖
npm ci

# 启动 Vite 开发服务器，默认使用 3000 端口
npm run dev
```

浏览器访问 <http://localhost:3000>。代码块中的 `#` 是解释文字，不需要执行。

## 2. 项目中有哪些性能工具

PersonaLink 包含以下工具：

1. `frontend/src/utils/animationOptimization.js`：检测设备能力、生成动画配置，并提供过渡、滚动、加载、节流和防抖工具。
2. `frontend/src/utils/performanceMonitor.js`：记录帧率、帧时间、内存和动画持续时间。
3. `frontend/src/composables/useOptimizedAnimations.js`：以 Vue Composition API 的方式调用动画能力，并在组件卸载时清理动画。
4. `frontend/src/components/PerformanceMonitor.vue`：开发环境中的可视化监控面板。

其中，`requestAnimationFrame` 用来把动画更新安排到浏览器下一次绘制前；`throttle`（节流）限制连续事件的触发频率；`debounce`（防抖）等待事件停止一段时间后再执行，适合窗口大小变化等场景。

## 3. 在组件中使用滚动动画

下面是一个简化示例。`ref` 保存 DOM 元素，`onMounted` 确保组件已经挂载，`nextTick` 确保 Vue 更新完 DOM 后再开始观察：

```vue
<template>
  <!-- ref 名称要与脚本中的 cardElement 对应 -->
  <div ref="cardElement" class="user-card">
    用户卡片内容
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { useOptimizedAnimations } from '@/composables/useOptimizedAnimations'

const cardElement = ref(null)
const { animateOnScroll } = useOptimizedAnimations()

onMounted(() => {
  // 等 Vue 完成一次 DOM 更新后再查找和观察元素
  nextTick(() => {
    if (cardElement.value) {
      // 元素进入视口时执行动画；duration 的单位是毫秒
      animateOnScroll(cardElement.value, {
        duration: 600,
        threshold: 0.1
      })
    }
  })
})
</script>

<style scoped>
.user-card {
  /* transform 和 opacity 通常比修改布局属性更省性能 */
  will-change: transform;
  transform: translateZ(0);
  transition: transform 0.3s ease;
}

.user-card:hover {
  /* translate3d 可以明确使用 transform；不代表所有设备都一定更快 */
  transform: translate3d(0, -2px, 0);
}
</style>
```

`will-change` 只应添加到确实会变化的元素上，并在不需要时移除。给大量元素永久设置 `will-change` 可能增加内存和合成层开销，反而变慢。

## 4. 使用性能监控面板

在开发环境中，按 `Ctrl+Shift+P`（macOS 使用 `Cmd+Shift+P`）切换面板。这个快捷键由 `PerformanceMonitor.vue` 注册，不是浏览器 DevTools 的快捷键。

面板可以查看：

- 平均帧率和最低帧率；一般 60 FPS 体验较流畅，低于 30 FPS 通常能明显感到卡顿。
- JavaScript 堆内存使用情况；部分浏览器不支持 `performance.memory`，此项可能没有数据。
- 已记录的动画数量和持续时间。
- 工具检测到的低帧率、长帧时间等问题。

排查时建议先点击“清除数据”，只操作一个页面或一个动画，再点击“刷新”，避免旧数据影响判断。需要留档时点击“导出报告”下载 JSON 文件。

## 5. 在代码中检测问题

```javascript
import { useOptimizedAnimations } from '@/composables/useOptimizedAnimations'

const { detectPerformanceIssues } = useOptimizedAnimations()

// 只在开发环境中检查；生产环境会返回空数组
const issues = detectPerformanceIssues()

if (issues.length > 0) {
  // 每个问题通常包含 type、severity、message 和 suggestion
  console.warn('检测到性能问题:', issues)
}
```

不要只看一个瞬时 FPS 就下结论。最好在相同页面、相同操作和相同浏览器下比较优化前后的平均帧率、帧时间和内存趋势。

## 6. 推荐的动画属性

### 6.1 优先使用 `transform` 和 `opacity`

动画中优先改变 `transform`、`opacity`，尽量避免不断修改会影响布局的 `width`、`height`、`top`、`left`、`margin` 和 `padding`。布局属性可能引起重排，重排后浏览器还可能需要重绘其他元素。

```css
.animated-element {
  /* 适合移动、缩放和淡入淡出 */
  transform: translate3d(0, 0, 0);
  opacity: 1;
}
```

3D 变换不是“加上就一定更快”的开关。请结合浏览器 Performance 面板验证；简单页面中普通 `transform: translateY(...)` 也完全可以。

### 6.2 复杂循环使用 `requestAnimationFrame`

`requestAnimationFrame` 会配合浏览器刷新节奏执行回调。动画结束或组件卸载时，要取消循环，避免内存泄漏和无意义的 CPU 消耗：

```javascript
let animationId = null

function animate() {
  // 在这里更新 transform 或 opacity
  animationId = requestAnimationFrame(animate)
}

// 开始动画
animationId = requestAnimationFrame(animate)

// 结束动画时执行；例如组件卸载或用户点击停止按钮
if (animationId !== null) {
  cancelAnimationFrame(animationId)
  animationId = null
}
```

### 6.3 用节流和防抖处理高频事件

- 滚动、鼠标移动等连续事件：使用节流，例如每约 16ms 最多处理一次。
- 搜索输入、窗口调整大小等需要等待用户停止操作的事件：使用防抖。

```javascript
import { debounce, throttle } from '@/utils/animationOptimization'

// 滚动事件不会每触发一次都执行昂贵计算
const handleScroll = throttle(() => {
  console.log('处理一次滚动')
}, 16)

// 用户停止调整大小 150ms 后再执行
const handleResize = debounce(() => {
  console.log('重新计算布局')
}, 150)
```

## 7. 尊重用户的减少动态效果设置

部分用户会在操作系统中启用“减少动态效果”。项目可以通过 CSS 和 JavaScript 同时处理：

```css
:root {
  --animation-duration: 300ms;
}

/* 用户要求减少动画时，尽量取消过渡 */
@media (prefers-reduced-motion: reduce) {
  :root {
    --animation-duration: 0ms;
  }

  *,
  *::before,
  *::after {
    scroll-behavior: auto !important;
    transition-duration: 0.01ms !important;
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
  }
}
```

项目的动画配置也会读取 `prefers-reduced-motion`，并在需要时直接应用最终状态。新增动画时不要绕过这项设置。

## 8. 查看当前动画配置

当前工具会根据设备能力和系统设置自动生成配置。可以在开发代码中打印配置，确认当前设备是否被识别为低性能设备：

```javascript
import {
  detectDevicePerformance,
  getOptimizedAnimationConfig
} from '@/utils/animationOptimization'

// 查看设备是否支持 WebGL、是否要求减少动态效果等信息
console.table(detectDevicePerformance())

// 查看当前动画时长、缓动函数和建议使用的属性
console.log(getOptimizedAnimationConfig())
```

当前版本没有提供手动设置 `low`/`high` 模式的公开 API。需要模拟低端设备时，优先使用浏览器的设备模拟功能和真实移动设备测试，不要在文档示例中调用不存在的方法。

## 9. 使用浏览器开发者工具排查

1. 打开开发者工具的 **Performance** 面板，点击录制，操作页面中的动画，再停止录制。
2. 查看长任务（Long Task）和每帧耗时；持续超过约 16.7ms 可能无法稳定达到 60 FPS。
3. 打开 **Rendering** 面板，观察 Paint flashing 或图层边界，判断是否有过多重绘或合成层。
4. 打开 **Memory** 面板，重复进入和离开页面，比较快照中对象是否持续增加。
5. 在 **Network** 面板检查图片、字体和 JavaScript 文件大小；动画卡顿不一定只由动画代码造成，也可能是资源加载过重。

## 10. 常见问题排查表

| 现象 | 先检查 | 常见处理 |
|---|---|---|
| 动画卡顿 | Performance 面板中的长任务、重排和重绘 | 减少同时运行的动画，优先使用 `transform`/`opacity` |
| 内存持续上涨 | 是否忘记移除事件监听、Observer 或 RAF | 在 `onUnmounted` 中调用清理函数 |
| 低端设备耗电快 | 是否有无限循环或隐藏页面仍在动画 | 页面不可见时暂停，减少动画频率或关闭动画 |
| 面板没有数据 | 是否为开发模式、是否先操作过动画、浏览器是否支持内存 API | 先确认 Vite 开发环境，再清除并重新采样 |
| 动画在移动端体验差 | 触摸设备和 `prefers-reduced-motion` | 使用更短动画、减少复杂阴影和大面积模糊 |

## 11. 总结

性能优化不是简单地“动画越少越好”，而是让必要的反馈及时、稳定并尊重用户设置。推荐顺序是：先用工具测量 → 找到长任务或高频更新 → 优先优化 `transform`、`opacity`、事件节流和清理逻辑 → 在桌面和移动设备上复测。

## 当前照片墙交互说明

`UserCard.vue` 的悬停效果只改变 `transform` 和 `filter`：卡片约放大至 1.115 倍，图片约放大至 1.22 倍。旧的白色径向高光层已移除，避免覆盖图片细节。若后续再次增加特效，先确认不会引入大面积 `backdrop-filter`、频繁布局读取或遮挡内容，并同时检查 `prefers-reduced-motion` 分支。
