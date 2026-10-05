/**
 * 管理员身份验证中间件
 * 用于验证请求是否来自管理员
 */

const adminAuth = (req, res, next) => {
  const { adminEmail, adminPassword } = req.body;
  
  // 验证管理员身份
  if (adminEmail !== 'admin@system.com' || adminPassword !== 'admin123') {
    return res.status(403).json({ message: '管理员身份验证失败' });
  }
  
  // 验证通过，继续处理请求
  next();
};

module.exports = adminAuth;