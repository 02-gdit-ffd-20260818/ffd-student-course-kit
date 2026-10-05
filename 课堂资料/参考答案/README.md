# 第 3 课 · 5 个 TODO 教师答案

上课前同时打开：

- 学生任务文件：`学生起步/lesson-03/lesson-03-task.css`
- 教师完整答案：`教师答案/lesson-03/lesson-03-task.css`
- 本答案页：`教师答案/lesson-03/第03课_5个TODO教师答案.md`

课堂只修改下面 5 行。建议每改一行就按 `Ctrl+S`，回到浏览器按 `Ctrl+R` 看变化。

## TODO A1：启用 Grid

学生起步代码：

```css
display: block;
```

教师答案：

```css
display: grid;
```

课堂解释：`grid` 让作品列表进入网格布局；只写列数但没有 `display: grid` 时，两列不会生效。

## TODO A2：桌面端两列

学生起步代码：

```css
grid-template-columns: 1fr;
```

教师答案：

```css
grid-template-columns: repeat(2, minmax(0, 1fr));
```

课堂解释：`repeat(2, ...)` 表示重复两列；`1fr` 表示两列平分可用宽度；`minmax(0, 1fr)` 允许列缩小，减少横向溢出。

完成 A1、A2 后先保存刷新。成功标志：四个作品卡片显示为 2×2。

## TODO B1：增加过渡

学生起步代码：

```css
transition: none;
```

教师答案：

```css
transition: transform 180ms ease, box-shadow 180ms ease;
```

课堂解释：卡片位置和阴影在 180 毫秒内平滑变化。

## TODO B2：卡片轻微上移

学生起步代码：

```css
transform: none;
```

教师答案：

```css
transform: translateY(-4px);
```

课堂解释：Y 轴负值表示向上移动，`-4px` 是轻微反馈。

## TODO B3：手机端一列

学生起步代码：

```css
grid-template-columns: repeat(2, minmax(0, 1fr));
```

教师答案：

```css
grid-template-columns: 1fr;
```

这行必须保留在下面的媒体查询内部：

```css
@media (max-width: 640px) {
  .portfolio-list {
    grid-template-columns: 1fr;
  }
}
```

课堂解释：浏览器宽度不超过 640 像素时，内部规则把两列覆盖为一列。

## 教师投屏时可直接对照的完整关键代码

```css
.portfolio-list {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 30px;
}

.work-card {
  transition: transform 180ms ease, box-shadow 180ms ease;
}

.work-card:hover,
.work-card:focus-within {
  transform: translateY(-4px);
}

@media (max-width: 640px) {
  .portfolio-list {
    grid-template-columns: 1fr;
  }
}
```

## 教师演示顺序

1. 搜索 `TODO A1`，把 `block` 改为 `grid`。
2. 搜索 `TODO A2`，改为两列。
3. 保存刷新，确认出现 2×2。
4. 搜索 `TODO B1`，补过渡。
5. 搜索 `TODO B2`，补上移。
6. 搜索 `TODO B3`，把手机端改成一列。
7. 按 `F12`、`Ctrl+Shift+M`，检查手机布局。

## 演示出错时的快速恢复

不要在课堂上临时重新写整份 CSS。直接用教师完整答案覆盖演示文件，再继续讲：

```bat
REM 按从上到下的顺序执行；每条命令的具体作用结合本节文字说明理解。
copy /Y "教师答案\lesson-03\lesson-03-task.css" "学生起步\lesson-03\lesson-03-task.css"
```

<!-- COMMAND_HELP:BEGIN -->
**本段命令怎么读**

`copy`（CMD）/ `Copy-Item`（PowerShell）把第一个路径的文件复制到第二个路径。只在目标配置尚不存在时复制模板；已有 .env 时直接打开并检查所需项，避免覆盖已经填写的值。
<!-- COMMAND_HELP:END -->


如果正在学生自己的工程中演示，把第二个路径改成实际工程，例如：

```bat
REM 按从上到下的顺序执行；每条命令的具体作用结合本节文字说明理解。
copy /Y "教师答案\lesson-03\lesson-03-task.css" "%USERPROFILE%\Desktop\web-work\p1-lesson-03\lesson-03-task.css"
```

恢复后检查：桌面两列、手机一列、鼠标移入卡片轻微上移。
