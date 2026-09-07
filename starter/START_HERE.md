# START HERE｜课堂起步检查点

本目录是学生开课时拿到的可运行基线，不是本课最终交付。教师保留同课次 `solution`，默认不向学生分发。

## 本课目标

P2 v2.1：从内存仓储切换到 SQLite，并完成备份恢复

## 先确认基线

```powershell
# 按锁文件精确安装依赖。
npm ci
# 在本地测试数据库执行结构迁移。
npm run db:migrate
# 写入课程确定性测试数据。
npm run db:seed
# 核对表、记录数和关键查询。
npm run db:verify
```

命令能运行后先创建 Issue 和个人分支，再按操作手册完成自己的内容与验收。禁止直接复制教师 solution；提交必须包含个人 commit、正常/边界/失败测试、CI 和线上 URL。
