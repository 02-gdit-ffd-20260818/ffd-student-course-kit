# 第 16 次课｜P1-P5 Final｜集成发布操作手册

> 忘记仓库、CI、Pages、Netlify 或服务器检查步骤时，回到 [小白从空文件夹到公网：完整操作手册](<../../00_小白从空文件夹到公网_完整操作手册.md>) 对照操作，不凭记忆跳步。

> 本课成果：在干净目录复现构建，完成 P1—P5 全链路检查、正式发布和一次可验证的回滚演练。

## 先学知识点

| 知识点 | 小白理解 | 本课用在哪里 |
|---|---|---|
| 干净构建 | 不依赖自己电脑里残留的文件 | 新目录 clone 后重建 |
| 锁文件 | 固定依赖版本 | `npm ci` 读取 package-lock |
| CI | 服务器自动执行检查 | lint/test/build 通过才发布 |
| Tag/Release | 给可发布版本一个不可混淆的名字 | `v1.0.0` 与发布说明 |
| Smoke test | 发布后快速验证最关键功能 | 首页、登录、健康检查 |
| 回滚 | 新版本故障时恢复已知可用版本 | 回到上一 Tag |

发布不是“上传成功”就结束，而是：**可复现、可访问、可监测、可恢复**。

## 课前准备

1. 冻结新功能，收集 P1—P5 的仓库、主分支、生产 URL 和健康地址。
2. 确认工作区已提交：

```powershell
# 简洁显示当前未提交文件；没有输出表示工作区干净。
git status --short
# 显示当前项目最新 commit，记录待发布版本来源。
git log -1 --oneline
```

3. 准备一个空目录做干净克隆，避免使用原来的 `node_modules`。

## 分步操作

1. 创建发布检查单，逐项记录项目、URL、commit SHA、CI、版本和负责人。
2. 从 P1 门户逐一进入 P2—P5，检查 HTTPS、返回路径、移动端和 404。
3. 在干净目录 clone，用 `npm ci` 安装锁定依赖。
4. 依次执行 lint、test、build；项目没有某个脚本时，在检查单注明，不要伪造通过。
5. 检查 `.env.example` 是否齐全，仓库和构建产物不得包含 Secret。
6. 发布候选版本并执行 smoke test；记录时间、版本和结果。
7. 从备份恢复或回滚到上一 Tag，再重复健康检查，留下证据。
8. 更新 README 与 Release Note，最后创建正式 Tag。

## 跟做代码

下面是一套可按顺序执行的 PowerShell 示例；把地址替换成自己的仓库：

```powershell
# 询问要验收的真实 GitHub HTTPS 地址。
$releaseRepo = Read-Host '请输入待验收仓库地址，例如 https://github.com/用户名/仓库.git'
# 创建带随机后缀的临时目录，避免覆盖已有验收目录。
$work = Join-Path $env:TEMP ("p1-release-check-" + [guid]::NewGuid().ToString('N'))
# 把待验收仓库克隆到全新目录，验证不依赖本机旧文件。
git clone $releaseRepo $work
# 进入刚克隆的干净副本。
Set-Location $work
# 按锁文件安装依赖。
npm ci
# 运行代码规范检查。
npm run lint
# 运行自动测试。
npm test
# 生成生产构建。
npm run build
# 确认干净构建没有修改受 Git 管理的文件。
git status --short
```

新建 `smoke-test.mjs`：

```js
const urls = [
  'https://example.com/',
  'https://example.com/health'
]

let failed = false
for (const url of urls) {
  try {
    const response = await fetch(url)
    console.log(response.ok ? 'PASS' : 'FAIL', response.status, url)
    if (!response.ok) failed = true
  } catch (error) {
    console.error('FAIL', url, error.message)
    failed = true
  }
}
if (failed) process.exitCode = 1
```

将 URL 改成自己的地址后执行：

```powershell
# 运行 P1—P5 生产入口 smoke 脚本，全部通过后才允许打标签。
node smoke-test.mjs
# 创建带说明的课程最终发布标签 v1.0.0；若标签已存在，不要重复执行。
git tag -a v1.0.0 -m "P1-P5 final release"
# 把刚创建的标签上传到 GitHub，触发或固定 Release 流程。
git push origin v1.0.0
```

只有 smoke test 全部显示 `PASS`，并且回滚演练完成后，才能视为发布完成。

## 检查与提交

- 五个项目入口可访问；干净克隆可安装和构建；CI 为绿色。
- smoke test 有时间、URL、状态码和版本记录。
- 回滚或恢复真实执行过，不只是写了一份方案。
- 提交作品索引、Final Tag、Release Note、恢复记录和贡献清单。

## 常见故障

- **只在原电脑能运行**：README、锁文件或环境变量说明不完整。
- **`npm ci` 失败**：先确认 `package.json` 与 `package-lock.json` 同步。
- **回滚后数据不兼容**：按演练过的前向修复或备份恢复方案处理，不直接覆盖数据库。
- **发布后页面仍是旧版**：核对部署 commit，清缓存后再验证响应版本。

## 开课即做（2026-09-06 校正）

- 教师发放：`10_教师实施包/Final_P1-P5/第16-18次课_starter`。
- 现场打开：`scripts/smoke-production.mjs、最终证据索引`。
- 先运行：`npm ci; npm run smoke:production`。
- 预期结果：P1—P5 页面与 3 个健康/API 入口共 8 项为 200。
- 生产入口：<https://02-gdit-ffd-20260818.github.io/ffd-p1-portfolio/>。
- 已验证 CI：<https://github.com/02-gdit-ffd-20260818/ffd-p1-portfolio/actions/runs/34003171619>。
- 只演示一个垂直切片；结果出现后由学生接手，完成个人变体、三类测试、commit、CI、URL 与 Release。
