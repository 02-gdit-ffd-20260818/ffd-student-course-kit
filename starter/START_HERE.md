# START HERE｜课堂起步检查点

本目录是学生开课时拿到的可运行基线，不是本课最终交付。教师保留同课次 `solution`，默认不向学生分发。

## 本课目标

P1 v1.1：从已上线 v1.0 增加响应式、可访问性与打印样式

## 先确认基线

```powershell
# 按锁文件精确安装依赖。
npm ci
# 检查 Starter 必需文件和结构。
npm run check
# 运行自动测试。
npm test
# 生成生产构建，确认响应式与打印样式可以发布。
npm run build
```

命令能运行后先创建 Issue 和个人分支，再按操作手册完成自己的内容与验收。禁止直接复制教师 solution；提交必须包含个人 commit、正常/边界/失败测试、CI 和线上 URL。
