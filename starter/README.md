# 一笺心意（P4）

第 14 次课的完整 AI 贺卡工程：安全生成、人工编辑、模板预览、流式反馈、失败降级和无账号分享。浏览器只请求自有后端，模型密钥永不进入前端构建。

## 本地运行

```powershell
# 按锁文件精确安装 P4 依赖。
npm ci
# 从无真实密钥的示例创建本地环境文件。
Copy-Item .env.example .env
# 在第一个终端启动后端代理，保持窗口运行。
npm run dev:api
# 在第二个终端启动前端开发服务器。
npm run dev
```

不填写真实密钥时系统自动进入教学 fallback，所有 UI 和异常路径仍可演示。若学校已批准使用 OpenAI API，只在服务器 `.env` 中设置 `AI_PROVIDER=openai` 与 `OPENAI_API_KEY`。实现使用 Responses API，并设置 `store: false`、服务端超时、输入校验和限流。

## 验证

```powershell
# 检查 P4 项目结构。
npm run check
# 扫描仓库，确认没有真实密钥进入文件。
npm run check:secrets
# 运行代理、Prompt 和 fallback 测试。
npm test
# 生成生产构建。
npm run build
```

详见 `docs/lesson-14-teacher-guide.md`、`docs/deployment-runbook.md` 和 `docs/api.md`。
