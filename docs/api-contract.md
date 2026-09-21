# P2 v2.2 REST API 契约

基础路径由 `VITE_API_BASE_URL` 指定；本地开发为空，由 Vite 把 `/api` 代理到 `http://127.0.0.1:3000`。

| 方法 | 路径 | 成功 | 失败 |
| --- | --- | --- | --- |
| GET | `/health` | `200 { ok, service }` | 服务不可达 |
| POST | `/api/auth/login` | `200 { data: { token, user } }` | `401 INVALID_CREDENTIALS` |
| GET | `/api/articles` | `200 { data, total }` | `500` |
| GET | `/api/articles/:id` | `200 { data }` | `404 ARTICLE_NOT_FOUND` |
| POST | `/api/articles` | `201 { data }` | `400 VALIDATION_ERROR` / `401` |
| PUT | `/api/articles/:id` | `200 { data }` | `400` / `401` / `404` |
| DELETE | `/api/articles/:id` | `204` | `401` / `403` / `404` |

列表支持 `status=published|draft`、`q=关键词`、`page` 和 `pageSize` 查询参数。`page` 默认 1；`pageSize` 默认 20、最大 50。响应同时返回 `total`、`page` 和 `pageSize`。

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

写操作通过 `Authorization: Bearer <token>` 认证。作者和管理员可以新建、修改；只有管理员可以删除。未登录返回 `401 AUTH_REQUIRED`，已登录但角色不足返回 `403 FORBIDDEN`。登录失败统一返回 `401 INVALID_CREDENTIALS`，不透露用户名是否存在。
