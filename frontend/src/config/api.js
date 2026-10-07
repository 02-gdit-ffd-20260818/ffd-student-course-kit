// API 地址配置。
// 默认 /api 表示当前页面的同源接口，保留协议、域名和端口。
// 开发时由 Vite 代理转给后端；Docker 上线时由前端 Nginx 转发。
// SSH 隧道也是访问当前页面的 /api，不能根据 localhost 猜测后端端口。
// 只有前后端分开部署时，才在构建前设置 VITE_API_BASE_URL；
// 例如 https://api.example.com/api，并配置后端跨域允许来源。
const configuredApi = String(import.meta.env.VITE_API_BASE_URL || '').trim()
export const API_BASE_URL = configuredApi || '/api'
