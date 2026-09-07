# START HERE｜课堂起步检查点

本目录是学生开课时拿到的可运行基线，不是本课最终交付。教师保留同课次 `solution`，默认不向学生分发。

## 本课目标

P4 v1.0—v1.2：从安全 fallback 垂直切片继续完成模板、SSE、限流和分享

## 先确认基线

```powershell
# 按锁文件精确安装 P4 前后端依赖。
npm ci
# 运行 Prompt、代理、安全拒绝和 fallback 测试。
npm test
# 启动前端开发服务器；API 需按 README 在另一个终端启动。
npm run dev
```

命令能运行后先创建 Issue 和个人分支，再按操作手册完成自己的内容与验收。禁止直接复制教师 solution；提交必须包含个人 commit、正常/边界/失败测试、CI 和线上 URL。
