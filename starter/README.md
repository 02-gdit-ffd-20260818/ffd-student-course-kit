# P1 v1.0 教师完整参考实现

这是第 1 次课的教师 solution，不直接作为学生最终答案发放。示例身份和联系方式均为虚构信息，正式使用时仍应避免公开学生隐私。

## 5 分钟本地验收

```powershell
# 按锁文件精确安装依赖。
npm ci
# 检查响应式和打印资源是否齐全。
npm run check
# 运行自动测试。
npm test
# 生成生产构建。
npm run build
# 用系统默认浏览器打开本地构建首页。
Start-Process .\dist\index.html
```

预期结果：HTML 检查通过、3 个自动测试通过、生成 `dist`，浏览器显示四个内容区块。

## 部署

1. 将本目录内容复制到独立 GitHub 仓库根目录。
2. 推送到 `main`。
3. 在仓库 `Settings → Pages → Build and deployment` 中选择 `GitHub Actions`。
4. 打开 Actions，确认 `verify` 和 `deploy` 均为绿色。
5. 用无登录浏览器打开 Pages URL。
6. 将 URL、commit SHA、Actions 运行链接和检查时间写入测试记录。

教师基准部署：<https://02-gdit-ffd-20260818.github.io/ffd-p1-portfolio/>

已验证 Release：<https://github.com/02-gdit-ffd-20260818/ffd-p1-portfolio/releases/tag/p1-v1.0.1>

## 课堂故障演示

- 将 `styles.css` 改为 `Styles.css`，演示 Windows 本地正常但 Linux/Pages 大小写路径失败。
- 增加第二个 `h1`，运行 `npm run check`，观察 CI 如何在部署前阻止错误版本。
- 将链接写成本机 `C:\Users\...` 路径，观察自动检查失败。

## 发布

验收通过后创建 `p1-v1.0` Tag 和同名 Release，不使用含糊的 `final`、`最新版`作为版本名。
