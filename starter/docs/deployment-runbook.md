# P2 部署运行手册

## Netlify（第 7—8 次课主平台）

- 固定生产地址：<https://ffd-p2-blog.netlify.app/>
- Site ID：`c728261f-c688-4d17-b68d-93d6621cabb0`
- Build command：`npm run build`
- Publish directory：`dist`
- Node：24
- SPA fallback：由 `netlify.toml` 配置

首次部署后记录站点名、生产 URL、Git commit 和部署 ID。后续保持同一 URL。

已验证部署：

| 课次 | 版本 | Deploy ID | 固定 URL |
| --- | --- | --- | --- |
| 07 | `p2-v1.0` | `6a9a3ffc65561e2353fdd1e6` | <https://ffd-p2-blog.netlify.app/> |
| 08 | `p2-v1.1` | `6a9a4025c2fafd06b7da9cde` | <https://ffd-p2-blog.netlify.app/> |

## GitHub Actions

每次 push/PR 必须依次执行锁定依赖安装、结构检查、自动测试和生产构建。Netlify 部署不能代替 GitHub CI。

## 第 9 次课以后

前端仍可由 Netlify 托管；API、SQLite/MySQL、Nginx 和健康检查迁移到 Ubuntu。生产环境变量只在平台或服务器配置，不写入仓库。
