# CI/CD 与部署配置（全课程共用）

> 项目 1—5 都会用到这一页。第一次讲 CI/CD 时完整讲一遍，后面各课只讲本项目特有的部分。
>
> **第一次接触 CI/CD 的同学**，先完成
> [小白从空文件夹到公网：完整操作手册](<02_小白从空文件夹到公网_完整操作手册.md>)
> 的第 4、6、7、9 节，再回来看这一页。
>
> 本页第九节的几份配置**不是双击运行的软件**，而是复制到项目仓库后
> 由 GitHub 或服务器使用的模板。

## 一、先说清楚 CI/CD 是什么

学生零基础，先别讲定义，讲场景：

> 你改完代码，本地跑起来是好的，推到 GitHub 上。同组同学拉下来跑，报错。
> 你说"在我电脑上是好的"。
>
> **CI 就是为了让这句话失效。**

|词|中文|它到底做什么|
|---|---|---|
|CI|持续集成|每次推代码，自动在一台**干净的机器**上装依赖、跑测试、构建。坏了立刻告诉你|
|CD|持续部署|CI 通过之后，自动把新版本发布到线上|

本课程**重点讲 CI**，CD 只做到"一键/自动部署到 Netlify 或服务器"这一层，不做灰度、回滚那些生产级内容。

## 二、GitHub Actions 的运行方式

```text
你 git push
   ↓
GitHub 发现仓库里有 .github/workflows/*.yml
   ↓
临时租一台全新的 Ubuntu 机器（跑完就销毁）
   ↓
按 yml 里写的步骤一步步执行
   ↓
全部成功 → 提交旁边一个绿色 ✓
任何一步失败 → 红色 ✗ + 邮件通知
```

三件事要反复强调：

1. **那台机器是全新的。** 你电脑上装过什么、改过什么配置，它都不知道。它只有仓库里的代码。
2. **它只认提交上去的东西。** 忘了 `git add` 的文件，CI 里就不存在。这是"本地好的、CI 红的"最常见原因。
3. **免费额度有限。** 公开仓库目前免费，私有仓库有分钟数限制。别写死循环。

## 三、目录和文件名不能错

```text
你的仓库/
└─ .github/
   └─ workflows/
      └─ ci.yml        ← 文件名可以自己起，目录名一个字都不能错
```

- `.github` 前面有一个点。
- 必须是 `workflows`（复数）。
- 文件扩展名 `.yml` 或 `.yaml` 都行。

**Actions 页面是空的，九成是这个路径写错了。**

## 四、一个最小可用的工作流，逐行看懂

```yaml
name: classroom-check          # 流水线名字，显示在 Actions 页面

on: [push, pull_request]       # 触发条件：推代码、开 PR

jobs:
  verify:                      # 任务 id，自己起名
    runs-on: ubuntu-latest     # 在哪种机器上跑
    steps:
      - uses: actions/checkout@v4      # 把仓库代码拉到那台机器上
      - uses: actions/setup-node@v4    # 安装 Node
        with:
          node-version: '24'           # 与全课程统一
          cache: npm                   # 缓存依赖，第二次快很多
      - run: npm ci                    # 按 lock 文件严格安装
      - run: npm test                  # 跑测试
      - run: npm run build             # 构建
```

| 写法 | 含义 |
|---|---|
| `uses:` | 用别人写好的动作（action），`@v4` 是版本号，钉住版本更稳 |
| `run:` | 在那台机器上执行一条命令，和你在终端里敲的一样 |
| 步骤顺序 | 从上往下，**任何一步失败，后面的都不再执行** |

### `npm ci` 和 `npm install` 的区别（必讲）

| | `npm install` | `npm ci` |
|---|---|---|
| 依据 | `package.json`，可能装到新版本 | 严格按 `package-lock.json` |
| 已有 node_modules | 增量更新 | **先删光再装** |
| 会不会改 lock 文件 | 可能会 | 绝不会 |
| 用在哪 | 本地开发 | **CI、服务器部署** |

**CI 里必须用 `npm ci`**，这样今天和三个月后装出来的依赖完全一样，构建结果才可复现。

必然的前提：**`package-lock.json` 一定要提交进仓库。** 很多学生把它当成"自动生成的垃圾"删掉，CI 就会失败。

## 五、课堂上一定要做的两个演示

光讲没用，这两个演示做完学生才会真的懂。

### 演示 1：红 → 绿

```cmd
REM 1. 故意改坏一个测试的断言，提交推送
git add . && git commit -m "演示：故意弄坏一个测试" && git push

REM 2. 打开 GitHub 仓库 → Actions 标签 → 看到红叉 → 点进去看日志
REM 3. 改回来，再推一次 → 变绿
```

<!-- COMMAND_HELP:BEGIN -->
**本段命令怎么读**

`git` 管理版本；`status` 查看改动；`diff` 查看逐行差异；`add` 选择待提交文件；`commit -m` 创建本地版本并写说明；`push` 发到远端；`clone` 下载仓库，`--branch` 选择分支，`--single-branch` 只取该分支历史；`remote` 管理远端别名，`fetch` 只取回记录。命令中的 `.` 表示当前目录，`--` 后面是文件路径。推送前用 `git remote -v` 核实 origin 是自己的仓库。
<!-- COMMAND_HELP:END -->


让学生看清楚：**红叉里能直接看到是哪条测试、期望什么、实际什么。**

### 演示 2：本地好的、CI 红的

```cmd
REM 1. 新建一个文件并在代码里 import 它，本地跑得好好的
REM 2. 提交时故意不 add 这个新文件
git commit -am "只提交了引用，没提交新文件"
git push
```

CI 会因为找不到模块而失败。**这一下就把"CI 只认仓库里的代码"讲透了。**

## 六、怎么看懂失败日志

1. 仓库页面 → **Actions** 标签。
2. 点最上面那一条运行记录。
3. 左边是任务名，点进去看右边的步骤列表。
4. **红色 ✗ 的那一步点开**，从**第一条**报错开始看，不要直接翻到最后。
5. 常见关键词：
   - `Cannot find module` → 文件没提交，或路径大小写不对（Linux 区分大小写，Windows 不区分！）
   - `npm ci can only install packages when …` → `package-lock.json` 和 `package.json` 对不上
   - `Process completed with exit code 1` → 上面那条命令自己失败了，往上翻

**大小写问题在课堂上一定会遇到**：Windows 上 `import './Utils.js'` 引用 `utils.js` 能跑，Linux 上直接失败。这是 CI 帮你抓到的第一类真 bug。

## 七、各项目里 CI 的落点

| 项目 | CI 里跑什么 | 主讲的课次 |
|---|---|---|
| 项目 1 个人主页 | 构建静态站 + 链接检查 | 第 6 课（发布前） |
| 项目 2 内容发布平台 | 装依赖 + 后端测试 + 构建 | 第 11 课（生产版） |
| 项目 3 群像云图 | 装依赖 + 数据库测试 + 构建 | 第 14、15 课（MySQL 与容器化） |
| 项目 4 一笺心意 | 自检 + 测试 + 构建 + **密钥扫描** | P4-03 |
| 项目 5 星声音乐站 | 自检 + 单元测试 + 构建 | P5-03 |

密钥扫描是项目 4 特有的一步，因为只有它要用到外部 AI 的密钥。

## 八、密钥和 Secrets

**永远不要把密钥写进仓库。** 需要在 CI 里用到密钥时：

1. 仓库页面 → Settings → Secrets and variables → Actions → New repository secret。
2. 填名字（比如项目 4 用的 `MINIMAX_API_KEY`）和值。
3. 在工作流里这样用：

```yaml
      - run: npm test
        env:
          MINIMAX_API_KEY: ${{ secrets.MINIMAX_API_KEY }}
```

GitHub 会在日志里把这个值自动打码。

**本课程的课堂练习不需要配 Secrets**，项目 4 在没有密钥时会走回退逻辑，CI 照样能通过。这本身就是良好设计的体现。

## 九、可以直接抄的四份配置

下面四份是**模板，不是成品**。

> **任何一份都要和项目实际的 `package.json`、构建目录、API 路径对齐，
> 不能不看内容直接复制。**

使用顺序：**先保证本地测试和构建通过，再复制模板**；
提交到分支上观察 Actions 跑没跑通；最后才配置 Pages / Netlify / Ubuntu。

|这一份|用于什么|复制到哪里|
|---|---|---|
|9.1 静态站工作流|Vite 静态站的测试、构建、产物上传|项目的 `.github/workflows/`|
|9.2 后端 API 工作流|Node 后端 API 的 CI|项目的 `.github/workflows/`|
|9.3 环境变量样板|**只写名称，不写真实值**|项目根目录，改名 `.env.example`|
|9.4 Nginx 反向代理|Ubuntu 上前端 + API 同域名部署|**教师核对后**写入服务器配置|

---

### 9.1 静态站工作流（Vite）

```yaml
name: static-vite-ci
on:
  push:
  pull_request:
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 24
          cache: npm
      - run: npm ci
      - run: npm run lint --if-present
      - run: npm test --if-present
      - run: npm run build
      - uses: actions/upload-artifact@v4
        with:
          name: dist
          path: dist
```

**`--if-present` 是什么意思**：`package.json` 里没有这个脚本就跳过，不算失败。
这样同一份模板能套在"还没写测试"的项目上——
但**正式课程要求每个项目都有测试**，这只是过渡期的方便。

**最后那一步 `upload-artifact`**：把构建产物存到这次运行里，
可以在 Actions 页面直接下载。
DoD 清单里的「制品可下载」指的就是它。

---

### 9.2 后端 API 工作流（Node）

```yaml
name: node-api-ci
on:
  push:
  pull_request:
jobs:
  verify:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 24
          cache: npm
      - run: npm ci
      - run: npm run lint --if-present
      - run: npm test --if-present
      - run: npm run build --if-present
      - run: node scripts/health-check.mjs
        if: hashFiles('scripts/health-check.mjs') != ''
```

**最后两行值得看一眼**：`hashFiles(...) != ''` 的意思是
"仓库里有这个文件才执行这一步"。
比 `--if-present` 更通用——**它能用在任何命令上，不只是 npm 脚本**。

---

### 9.3 环境变量样板

```ini
PORT=3000
DATABASE_URL=replace-me
MINIMAX_API_KEY=replace-me-on-server-only
ALLOWED_ORIGIN=http://localhost:5173
```

**三条规矩**：

1. 这份文件叫 `.env.example`，**要提交进仓库**——它是给别人看"需要配哪些变量"的；
2. 真实值写在 `.env` 里，**`.env` 绝不提交**（`.gitignore` 里必须有它）；
3. 值一律写 `replace-me` 这样的占位符，**一个真实密钥字符都不能出现**。

> 每次课都要确认一次：`git check-ignore -v .env` **必须打印出一行**。
> 什么都不打印就说明它没被忽略，**立刻停下来处理**。

---

### 9.4 Nginx 反向代理（Ubuntu 部署）

```nginx
server {
  listen 80;
  server_name example.com;
  root /var/www/app/dist;
  index index.html;

  location / { try_files $uri $uri/ /index.html; }
  location /api/ {
    proxy_pass http://127.0.0.1:3000/;
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }
}
```

|这一行|在做什么|
|---|---|
|`root .../dist`|静态文件从构建产物目录读|
|`try_files $uri $uri/ /index.html`|**单页应用的关键一行**：找不到文件就交给 `index.html`，否则刷新子路由页面会 404|
|`location /api/`|以 `/api/` 开头的请求**转发给本机 3000 端口的 Node 服务**|
|`proxy_set_header X-Forwarded-*`|**把真实的来访信息带给后端**，不然后端只知道请求来自 127.0.0.1|

**这样前端和 API 在同一个域名下**，浏览器不会有跨域问题，
后端也不用对外开端口——**和项目 3 第 15 课"端口只绑本机"是同一个思路**。

**部署前必须替换**：域名、根目录、API 端口。
另外还要自己配好 **HTTPS、防火墙、日志轮转和回滚**，这四样模板里没有。

> **不要直接覆盖服务器上现有的 Nginx 配置**，
> 先 `nginx -t` 测试语法，确认无误再 `systemctl reload nginx`。

## 十、检查清单

学生完成任意一个项目的 CI 部分后，应该能做到：

- [ ] 说清楚 CI 在哪台机器上跑，为什么"本地是好的"不算数
- [ ] 找到并读懂自己仓库里的 `.github/workflows/*.yml`
- [ ] 说出 `npm ci` 和 `npm install` 的区别，以及为什么 CI 用前者
- [ ] 在 Actions 页面找到一次失败运行，指出是哪一步、哪条报错
- [ ] 提交里带一个绿勾，并能说明这个绿勾代表哪几件事通过了
