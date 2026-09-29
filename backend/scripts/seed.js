const { closeDB, connectDB } = require('../src/database');
const { runMigrations } = require('../src/migrations');
const { seedIfEmpty } = require('../src/seed');
(async () => { await connectDB(); await runMigrations(); await seedIfEmpty(); await closeDB(); })().catch(error => { console.error(error); process.exit(1); });
