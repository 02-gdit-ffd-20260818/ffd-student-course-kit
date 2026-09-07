# START HERE｜课堂起步检查点

本目录是学生开课时拿到的可运行基线，不是本课最终交付。教师保留同课次 `solution`，默认不向学生分发。

## 本课目标

P1 v2.0：保留旧版回归基线，迁移为 Vue 组件门户

## 先确认基线

```powershell
# 按锁文件精确安装 Vue 项目依赖。
npm ci
# 运行迁移后的回归测试。
npm test
# 生成 Vue 生产构建。
npm run build
```

命令能运行后先创建 Issue 和个人分支，再按操作手册完成自己的内容与验收。禁止直接复制教师 solution；提交必须包含个人 commit、正常/边界/失败测试、CI 和线上 URL。
