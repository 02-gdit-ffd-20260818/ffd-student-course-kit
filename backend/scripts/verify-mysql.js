require('dotenv').config();

const { pool, connectDB } = require('../db');

const run = async () => {
  await connectDB();
  const [[classCount]] = await pool.query('SELECT COUNT(*) AS total FROM classes');
  const [[userCount]] = await pool.query('SELECT COUNT(*) AS total FROM users');
  const [[studentCount]] = await pool.query("SELECT COUNT(*) AS total FROM users WHERE role <> 'admin'");
  const [[groupCount]] = await pool.query('SELECT COUNT(*) AS total FROM synonym_groups');
  const [[hobbyCount]] = await pool.query('SELECT COUNT(*) AS total FROM standard_hobbies');
  const [[avatarStats]] = await pool.query("SELECT COUNT(*) AS total, COALESCE(SUM(OCTET_LENGTH(avatar)), 0) AS bytes FROM users WHERE role <> 'admin' AND avatar <> ''");
  const [[orphans]] = await pool.query('SELECT COUNT(*) AS total FROM users u LEFT JOIN classes c ON c.id = u.class_id WHERE u.class_id IS NOT NULL AND c.id IS NULL');
  const [admins] = await pool.query("SELECT email, password_hash FROM users WHERE role = 'admin'");
  const admin = admins.find((item) => item.email === 'admin@system.com');
  const adminPasswordHashed = Boolean(admin?.password_hash?.startsWith('$2'));
  const report = {
    database: process.env.DB_NAME || 'personalink',
    classes: Number(classCount.total),
    users: Number(userCount.total),
    students: Number(studentCount.total),
    synonymGroups: Number(groupCount.total),
    standardHobbies: Number(hobbyCount.total),
    studentsWithStoredAvatar: Number(avatarStats.total),
    storedStudentAvatarBytes: Number(avatarStats.bytes),
        // ============ TODO 03（中等）：迁移之后必须逐项核对 ============
    // **数据迁移最危险的不是失败，是"看起来成功了"。**
    // 少搬了 3 条、某个字段错位了、外键指向了不存在的班级——
    // 这些都不会报错，等用户投诉时才发现。
    //
    // 终端里看得到的结果：npm run db:verify 打印一张核对表，
    // 逐项说明搬了多少、有没有孤儿数据、还有没有明文密码。
    //
    // TODO：统计"指向不存在班级的用户"有多少条，写进报告：
    //   orphanUsers: Number(orphans.total)
    //
    // **迁移三件套**：搬之前数一遍、搬之后数一遍、两个数对得上。
    // 这一条纪律能挡掉绝大多数迁移事故。
    // ==========================================================
    orphanUsers: 0,
    adminExists: Boolean(admin),
    adminPasswordHashed
  };
  console.log(JSON.stringify(report, null, 2));
  // 全新站点允许管理员先登录后再创建第一个班级，因此班级数量可以为 0。
  if (!report.users || report.orphanUsers || !report.adminExists || !report.adminPasswordHashed) process.exitCode = 1;
  await pool.end();
};

run().catch(async (error) => {
  console.error('MySQL 校验失败：', error.message);
  await pool.end();
  process.exit(1);
});
