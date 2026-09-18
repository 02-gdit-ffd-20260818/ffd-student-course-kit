# P3 v2.0 API 契约

| 方法 | 路径 | 权限 | 成功 | 主要失败 |
| --- | --- | --- | --- | --- |
| GET | `/health` | 公开 | 200 | 服务不可达 |
| POST | `/api/auth/login` | 公开 | 200 + token | 401 |
| GET | `/api/members` | 公开 | 200 已通过画像 | — |
| POST | `/api/members` | member/reviewer | 201 待审核记录 | 400/401 |
| GET | `/api/review/members` | reviewer | 200 全部记录 | 401/403 |
| PATCH | `/api/review/members/:id/status` | reviewer | 200 | 400/401/403/404 |
| POST | `/api/import/preview` | reviewer | 200 行预览 | 400 含行号 |
| POST | `/api/import` | reviewer | 201 导入数量 | 400/409，整批不写入 |
| GET | `/api/export` | reviewer | 200 UTF-8 CSV | 401/403 |

Bearer token 有效期 8 小时。日志只记录 request ID、方法、路径、状态和耗时，不记录密码、token、CSV 正文或完整成员资料。
