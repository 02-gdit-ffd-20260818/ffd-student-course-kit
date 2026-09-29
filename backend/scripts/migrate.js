const { closeDB, connectDB } = require('../src/database');
const { runMigrations } = require('../src/migrations');
(async () => { await connectDB(); await runMigrations(); await closeDB(); })().catch(error => { console.error(error); process.exit(1); });
