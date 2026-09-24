const errorHandler = (error, req, res, next) => {
  if (res.headersSent) return next(error);
  console.error('API error:', error);
  const conflict = error.code === '23505';
  const foreignKey = error.code === '23503';
  const status = conflict || foreignKey ? 400 : (error.status || 500);
  const message = conflict ? '该数据已存在' : foreignKey ? '该数据仍被其他记录使用' : (error.message || '服务器错误');
  res.status(status).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' ? { error: error.stack } : {})
  });
};
module.exports = errorHandler;
