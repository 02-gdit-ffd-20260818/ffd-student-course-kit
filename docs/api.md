# 当前课堂 API 与兼容示例

## 当前课堂页面使用的接口

- `POST /api/greeting`：提交 receiver、occasion、tone、details，返回 text、mode、reason 等字段；无模型密钥时返回本地文案，不等于真实模型调用成功。
- `POST /api/card`：保存卡片，返回 slug 与分享路径；字段白名单是第3课 TODO03。
- `GET /api/card?slug=实际标识`：读取已保存卡片；标识校验是第3课 TODO04。
- `GET /c/实际标识`：打开分享页；HTML 转义是第3课 TODO05。
- 本地/Ubuntu 由 `server/app.js` 复用课堂函数，并通过 CARD_STORAGE_PATH 保存 JSON 文件；Netlify 路线使用 Blobs。两个环境的数据不自动同步。

## 旧版兼容接口（不是当前页面的请求路径）

以下记录保留供比较学习，不能用这些接口的成功来替代本课 TODO 验收。

# P4 API 契约

## `GET /health`

返回服务状态、Prompt 版本和“是否已配置模型”的布尔值，绝不返回密钥、模型输入或用户文案。

## `POST /api/greetings/generate`

请求示例：

```json
{"receiver":"林老师","occasion":"感谢","tone":"真诚","details":"感谢一路指导"}
```

成功返回 `text`、`mode`（`ai` 或 `fallback`）、`reason`、`promptVersion`、`requestId` 和 `requiresHumanReview`。校验失败为 400/422，限流为 429，请求体过大为 413。

## `POST /api/greetings/stream`

请求体相同，响应为 UTF-8 SSE：

- `meta`：模式、降级原因、Prompt 版本、人工确认标记；
- `delta`：逐段文案；
- `done`：请求 ID；
- `error`：流开始后的安全错误信息。

服务不记录完整输入或模型密钥。生产反向代理必须关闭 SSE 缓冲。
