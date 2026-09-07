# START HERE｜课堂起步检查点

本目录是学生开课时拿到的可运行基线，不是本课最终交付。教师保留同课次 `solution`，默认不向学生分发。

## 本课目标

第 16 次：执行全链接巡检、恢复演练和 Final Release

## 先确认基线

```powershell
# 按锁文件精确安装 Final 验收依赖。
npm ci
# 检查 P1—P5 已登记的生产 URL 与 API health；失败时记录第一个失败入口。
npm run smoke:production
```

命令能运行后先创建 Issue 和个人分支，再按操作手册完成自己的内容与验收。禁止直接复制教师 solution；提交必须包含个人 commit、正常/边界/失败测试、CI 和线上 URL。
