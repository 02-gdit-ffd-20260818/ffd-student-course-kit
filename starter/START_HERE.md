# START HERE｜课堂起步检查点

本目录是学生开课时拿到的可运行基线，不是本课最终交付。教师保留同课次 `solution`，默认不向学生分发。

## 本课目标

P1 v1.0：替换示例姓名与内容，完成首次 Pages 发布

## 先确认基线

```powershell
# 在当前 Starter 目录启动端口 8000 的临时静态服务器。
# 终端保持运行属于正常现象；浏览器访问 http://localhost:8000，结束时按 Ctrl+C。
python -m http.server 8000
```

命令能运行后先创建 Issue 和个人分支，再按操作手册完成自己的内容与验收。禁止直接复制教师 solution；提交必须包含个人 commit、正常/边界/失败测试、CI 和线上 URL。
