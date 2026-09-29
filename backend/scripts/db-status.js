const { closeDB, connectDB, getDatabaseInfo } = require('../src/database');
const { runMigrations } = require('../src/migrations');
(async () => {
  await connectDB();
  await runMigrations();
  console.log(JSON.stringify(await getDatabaseInfo(), null, 2));
  await closeDB();
})().catch(error => { console.error(error); process.exit(1); });
