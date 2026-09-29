const app = require('./app');
const { closeDB, connectDB } = require('./database');
const { runMigrations } = require('./migrations');
const { seedIfEmpty } = require('./seed');
const { validateProductionConfig } = require('./config');

const port = Number(process.env.PORT || 3003);

const start = async () => {
  validateProductionConfig();
  await connectDB();
  await runMigrations();
  if (process.env.AUTO_SEED !== '0') await seedIfEmpty();

  const server = app.listen(port, '0.0.0.0', () => console.log(`PersonaLink API listening on ${port}`));
  const shutdown = signal => {
    console.log(`${signal} received; shutting down`);
    server.close(async () => {
      await closeDB();
      process.exit(0);
    });
    setTimeout(() => process.exit(1), 10_000).unref();
  };
  process.once('SIGINT', () => shutdown('SIGINT'));
  process.once('SIGTERM', () => shutdown('SIGTERM'));
};

start().catch(async error => {
  console.error('Server startup failed:', error);
  await closeDB();
  process.exit(1);
});
