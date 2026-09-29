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
