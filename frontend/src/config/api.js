// API配置文件
// 根据环境自动选择API地址

// 获取当前主机名
const getApiBaseUrl = () => {
  // 获取当前页面的协议和主机名
  const protocol = window.location.protocol;
  const hostname = window.location.hostname;
  
  // 如果是localhost或127.0.0.1，使用localhost
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'http://localhost:3003/api';
  }
  
  // 否则使用当前主机的80端口（通过Nginx代理）
  // 这样可以避免直接访问后端端口，而是通过Nginx代理
  return `${protocol}//${hostname}/api`;
};

export const API_BASE_URL = getApiBaseUrl();