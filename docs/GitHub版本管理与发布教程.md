# GitHub 版本管理与发布教程

> 本文出现的 `npm ci`、`npm run build` 等命令，统一术语说明见 npm 命令词典与命名故事。

本教程用于把一个“当前可用”的 PersonaLink 版本固定下来，并让后续开发可以安全回退。适用场景是：你准备继续增加功能，但希望随时回到已验证可用的版本。

## 核心概念

| 概念 | 作用 | 是否用于回退 |
| --- | --- | --- |
| Commit（提交） | 记录一次代码和文档改动 | 是 |
| Branch（分支） | 在不影响主线的情况下开发新功能 | 是 |
| Tag（标签） | 给某一个精确提交起稳定版本名，如 `v1.0.0` | 是，最关键 |
| GitHub Release | 基于 Tag 的版本说明页，可附发布说明和文件 | 间接；实际锚点仍是 Tag |

一句话：**先提交，再打 Tag；Release 是给人看的正式说明，Tag 才是 Git 的精确版本锚点。**

## 发布稳定版本

在项目根目录执行。先确认没有遗漏文件：

```powershell
git status
```

如果列表中是这次准备发布的改动，执行：

```powershell
git add .
git commit -m "feat: complete class management and project documentation"
git push origin master
```

然后为刚才的提交创建带说明的标签并推送：

```powershell
git tag -a v1.0.0 -m "v1.0.0：班级管理、班级照片墙与完整项目文档"
git push origin v1.0.0
```

推送完成后，在 GitHub 仓库的 **Releases** 页面选择 **Draft a new release**，选择 `v1.0.0`，填写标题“v1.0.0 稳定可用版本”和本次功能摘要，再点击 **Publish release**。

## 下载指定发布版本：给自己或同学的三种方法

发布页上的 `v1.1.0` 不是另一份单独的代码。它指向 Git 的 `v1.1.0` 标签，而标签又指向一个不可变的提交。因此，**下载指定 Release 的正确做法，是让 Git 取回该标签所指向的代码快照**。

本项目仓库地址为：

```text
https://github.com/Abner199/PersonaLink_NoDB_20260828.git
```

### 方法一：先完整克隆，再切换版本（最适合学习）

这会把仓库历史和全部标签一起下载下来，之后可在 `v1.0.0`、`v1.1.0` 和最新 `master` 之间切换。

```powershell
git clone https://github.com/Abner199/PersonaLink_NoDB_20260828.git
cd PersonaLink_NoDB_20260828
git switch --detach v1.1.0
```

`--detach` 的意思是“只查看这个固定快照，不把它当作正在开发的分支”。现在目录中的文件就是 Release `v1.1.0` 对应的文件。需要别的版本时，将最后一行中的标签改为 `v1.0.0` 等即可。

### 方法二：克隆时直接指定版本（下载更精简）

如果确定只需要一个版本，可在克隆时指定标签：

```powershell
git clone --branch v1.1.0 --single-branch https://github.com/Abner199/PersonaLink_NoDB_20260828.git
cd PersonaLink_NoDB_20260828
```

`--branch v1.1.0` 告诉 Git 使用这个标签；`--single-branch` 表示只取这个目标相关的分支历史。它适合课堂发放固定材料或部署固定版本。想下载 `v1.0.0`，只把命令中的 `v1.1.0` 替换为 `v1.0.0`。

### 方法三：只想拿源码压缩包，不使用 Git

打开对应的 GitHub Release 页面，在 **Assets** 区域下载 **Source code (zip)**。这是一个静态源码快照，适合只想解压阅读的人；但它没有完整 Git 历史，不能方便地切换、比较或提交版本。因此教学和后续开发优先使用前两种方法。

### 如何知道有哪些可下载的版本

不克隆仓库也能查看远端标签：

```powershell
git ls-remote --tags https://github.com/Abner199/PersonaLink_NoDB_20260828.git
```

输出中形如 `refs/tags/v1.1.0` 的部分就是可指定的版本名。进入已克隆仓库后，也可以使用：

```powershell
git tag
```

### “查看版本”和“从版本继续开发”是两件事

| 你的目的 | 推荐命令 | 为什么 |
| --- | --- | --- |
| 运行、演示、学习某个稳定版 | `git switch --detach v1.1.0` | 不会误把稳定版本的历史改乱 |
| 从稳定版修复问题或开发新功能 | `git switch -c feature/功能名称 v1.1.0` | 创建新分支，原标签仍保持不动 |
| 回到仓库最新开发主线 | `git switch master` | 回到持续变化的主线 |

> **容易混淆：**Tag 是固定的路标，`master` 是会继续向前走的开发线。不要在“detached HEAD”状态下直接开展长期开发；需要改代码时先创建分支。

## 继续开发

日常开发仍在 `master` 上提交即可：

```powershell
git add .
git commit -m "feat: 新增某功能"
git push origin master
```

较大的功能建议使用独立分支：

```powershell
git switch -c feature/功能名称
```

完成后可合并回 `master`。分支不会改变 `v1.0.0` 标签指向的内容。

## 回退与查看旧版本

只想查看、构建或运行稳定版本，不改变现有分支：

```powershell
git switch --detach v1.0.0
```

结束后回到最新开发线：

```powershell
git switch master
```

如果要从稳定版本重新开始一项修复或实验：

```powershell
git switch -c fix/问题名称 v1.0.0
```

不要在不了解影响时使用 `git reset --hard` 回退 `master`：它会改写本地历史，并可能丢失未提交改动。优先用 Tag 查看旧版、用新分支从旧版继续工作。

## 发布前检查清单

- [ ] `git status` 中没有不应发布的文件。
- [ ] 前端执行 `cd frontend; npm run build` 成功。
- [ ] 按 [测试计划](./test-plan.md) 完成本版本关键人工回归。
- [ ] `master` 已推送成功，Tag 已推送成功。
- [ ] GitHub Release 说明只陈述已实现、已验证的功能。
