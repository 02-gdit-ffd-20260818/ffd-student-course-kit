# 第 18 次课｜P1-P5 Final｜工程答辩操作手册

> 本课成果：现场证明代码可追溯、项目可复现、测试可运行、系统可观测、发布可回滚，并完成一个最小修改。

## 先学知识点

| 知识点 | 小白理解 | 答辩证据 |
|---|---|---|
| 可追溯 | 能从需求找到分支、提交、PR 和版本 | Git 历史与 Issue |
| 可复现 | 换一台电脑也能按 README 跑起来 | 干净 clone + `npm ci` |
| 自动测试 | 用代码反复检查预期 | 正常、边界、失败用例 |
| CI | 提交后由服务器自动把关 | 绿色流水线 |
| 可观测 | 出问题时有状态、日志和请求线索 | `/health` 与脱敏日志 |
| 回滚 | 新版失败时恢复稳定版 | 上一 Tag 与演练记录 |

工程答辩的核心不是背命令，而是能根据输出判断“哪一步失败、为什么、下一步查什么”。

## 课前准备

准备仓库 URL、干净目录、绿色 CI、测试报告、生产 URL、Release/Tag、回滚记录和 Agent 决策日志。确认所有成员都能独立解释一个 commit。

## 分步操作

1. 用 Git 图说明 `Issue → 分支 → commit → PR → Release` 追溯链。
2. 从干净 clone 执行安装、lint、test 和 build；保留完整输出。
3. 演示正常、边界和失败测试各一个，并解释防止的回归。
4. 从浏览器请求追到 API、数据库和日志；环境变量只展示名称，不展示值。
5. 根据抽签任务复述验收，建分支，做一个最小改动并补测试。
6. 展示 diff，运行测试，提交 commit；不要直接在 main 上修改。
7. 展示一条 Agent 建议的采纳或拒绝记录，解释判断依据。
8. 执行健康检查，说明回滚条件、操作路径与数据恢复的区别。

## 跟做代码

先新建一个不依赖第三方库的 `health.mjs`：

```js
import http from 'node:http'

const server = http.createServer((request, response) => {
  if (request.url === '/health') {
    response.writeHead(200, { 'content-type': 'application/json; charset=utf-8' })
    response.end(JSON.stringify({ status: 'ok', version: 'final' }))
    return
  }
  response.writeHead(404)
  response.end('Not Found')
})

server.listen(3000, () => console.log('http://localhost:3000/health'))
```

终端 1 启动服务，终端 2 检查状态：

```powershell
# 运行当前目录的 health 脚本，检查前端和 API 入口状态。
node health.mjs
```

```powershell
# 请求本机 3000 端口的 health 接口并保存响应对象。
$response = Invoke-WebRequest http://localhost:3000/health
# 显示 HTTP 状态码；正常通常为 200。
$response.StatusCode
# 显示 health 响应正文，核对服务和版本字段。
$response.Content
```

看到状态码 `200` 和 `{"status":"ok"...}` 即通过。然后执行工程证据命令：

```powershell
# 图形化显示最近 10 次提交，检查分支与合并历史是否可解释。
git log --oneline --graph -10
# 确认答辩仓库没有未提交文件。
git status --short
# 根据锁文件在干净环境安装依赖。
npm ci
# 运行全套自动测试。
npm test
# 生成生产构建。
npm run build
# 检查空格错误和冲突标记等补丁格式问题。
git diff --check
```

若任何命令失败，保留输出，先定位再修复；不要删除测试或关闭 CI 来获得绿色结果。

## 检查与提交

- 干净 clone 能按 README 完成安装、测试和构建。
- 最小修改有独立分支、测试、diff 和 commit。
- 健康检查、CI、部署版本和回滚证据互相对应。
- 提交工程证据包、现场修改 commit/PR、测试结果、smoke test 和个人解释记录。

## 常见故障

- **`npm ci` 报锁文件错误**：在开发分支用 `npm install` 同步锁文件，审核后再提交。
- **端口 3000 被占用**：结束占用进程或将示例端口改为 3001，两处地址同步修改。
- **测试偶尔失败**：记录复现条件，检查时间、网络和共享状态，不简单重复运行掩盖问题。
- **现场修改失败**：说明假设、排查顺序和下一步，保留错误输出作为工程判断证据。

## 开课即做（2026-09-06 校正）

- 教师发放：`10_教师实施包/Final_P1-P5/第16-18次课_starter`。
- 现场打开：`docs/lesson-18-engineering-defense-guide.md`。
- 先运行：`git switch -c defense/<name>; npm test`。
- 预期结果：现场小改→测试→commit→CI 闭环可解释。
- 生产入口：<https://02-gdit-ffd-20260818.github.io/ffd-p1-portfolio/>。
- 已验证 CI：<https://github.com/02-gdit-ffd-20260818/ffd-p1-portfolio/actions/runs/34003171619>。
- 只演示一个垂直切片；结果出现后由学生接手，完成个人变体、三类测试、commit、CI、URL 与 Release。
