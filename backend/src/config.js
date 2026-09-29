const validateProductionConfig = () => {
  if (process.env.NODE_ENV !== 'production') return;
  const required = ['POSTGRES_PASSWORD', 'JWT_SECRET', 'CORS_ORIGINS'];
  for (const name of required) {
    const value = process.env[name] || '';
    if (!value || value.startsWith('replace-')) throw new Error(`${name} must be configured for production`);
  }
  if (process.env.JWT_SECRET.length < 32) throw new Error('JWT_SECRET must contain at least 32 characters');
};
module.exports = { validateProductionConfig };
