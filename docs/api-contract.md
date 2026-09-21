# P2 v2.0 REST API 契约

基础路径由 `VITE_API_BASE_URL` 指定；本地开发为空，由 Vite 把 `/api` 代理到 `http://127.0.0.1:3000`。

| 方法 | 路径 | 成功 | 失败 |
| --- | --- | --- | --- |
| GET | `/health` | `200 { ok, service }` | 服务不可达 |
| GET | `/api/articles` | `200 { data, total }` | `500` |
| GET | `/api/articles/:id` | `200 { data }` | `404 ARTICLE_NOT_FOUND` |
| POST | `/api/articles` | `201 { data }` | `400 VALIDATION_ERROR` |
| PUT | `/api/articles/:id` | `200 { data }` | `400` / `404` |
| DELETE | `/api/articles/:id` | `204` | `404` |

列表支持 `status=published|draft` 和 `q=关键词` 查询参数。

错误统一格式：

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "invalid article",
    "fields": { "title": "title required" }
  }
}
```

所有响应携带 `x-request-id`；服务日志记录 requestId、方法、路径、状态码和耗时，不记录正文、Cookie 或环境变量。
