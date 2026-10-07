// /api 使用当前页面的协议、域名和端口；不会丢掉独立测试端口。
// 开发时由 Vite 代理，上线时由 Nginx 代理，SSH 隧道访问也适用。
// 不再根据 localhost 写死 3003，也不把云端端口强制改成 80。
// 前后端分开部署时，在构建前指定 VITE_API_BASE_URL（含 /api）。
const configuredApi = String(import.meta.env.VITE_API_BASE_URL || '').trim()
export const API_BASE_URL = configuredApi || '/api'
