const jwt = require('jsonwebtoken');

const jwtSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret && process.env.NODE_ENV === 'production') throw new Error('JWT_SECRET is required in production');
  return secret || 'development-only-change-me';
};

const signToken = user => jwt.sign(
  { sub: user.id, email: user.email, role: user.role || 'user' },
  jwtSecret(),
  { expiresIn: process.env.JWT_EXPIRES_IN || '7d', issuer: 'personalink' }
);

const authenticate = (req, res, next) => {
  const header = req.get('authorization') || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  if (!token) return res.status(401).json({ message: '请先登录' });
  try {
    req.user = jwt.verify(token, jwtSecret(), { issuer: 'personalink' });
    next();
  } catch {
    res.status(401).json({ message: '登录已失效，请重新登录' });
  }
};

const requireAdmin = (req, res, next) => {
  if (req.user?.role !== 'admin') return res.status(403).json({ message: '需要管理员权限' });
  next();
};

const requireSelfOrAdmin = parameter => (req, res, next) => {
  const value = req.params[parameter];
  if (req.user?.role === 'admin' || req.user?.email?.toLowerCase() === value?.toLowerCase()) return next();
  return res.status(403).json({ message: '无权修改其他用户' });
};

module.exports = { authenticate, requireAdmin, requireSelfOrAdmin, signToken };
