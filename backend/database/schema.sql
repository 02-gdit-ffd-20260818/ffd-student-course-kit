-- PersonaLink MySQL 生产数据库结构
-- 必须在 MySQL 8.0+（推荐 8.4 LTS）上执行，统一使用 utf8mb4。

CREATE DATABASE IF NOT EXISTS personalink
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_0900_ai_ci;

USE personalink;

CREATE TABLE IF NOT EXISTS classes (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  teacher VARCHAR(100) NOT NULL,
  created_at DATETIME(3) NOT NULL,
  updated_at DATETIME(3) NULL,
  CONSTRAINT uq_classes_name UNIQUE (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(64) PRIMARY KEY,
  username VARCHAR(100) NOT NULL,
  name VARCHAR(100) NOT NULL,
    -- ============ 第14课 TODO 02（简单）：MySQL 的约束写法 ============
  -- 【修改边界】只改本任务注释指定的占位代码；保留函数、路由、选择器等外层结构，也不要提前修改其他课次 TODO。
  -- 【动手顺序】先逐条读要求，把每条要求写成一个条件或一条语句；再按注释给出的顺序组合，不要凭感觉一次写一大段。
  -- 【完成标准】保存后执行本课手册该 TODO 的“自己验证”；结果、状态码或页面效果全部一致才算完成，卡住再对照本课教师答案。
  -- 和 SQLite 大同小异，但有几处不一样，正好对照着记：
  --   SQLite: email TEXT NOT NULL UNIQUE
  --   MySQL : email VARCHAR(255) NOT NULL UNIQUE
  --
  -- VARCHAR(255) 声明最大字符数，不表示每行预先占满 255 字符。
  -- 本任务增加 NOT NULL；MySQL 也支持 TEXT，不能说所有字符串类型都要写长度。
  --
  -- 实际数据库验收：SHOW COLUMNS 的 email Null=NO；事务内插入 NULL 被拒，最后 ROLLBACK。
  -- 同邮箱原本已受下面的 UNIQUE 保护，不是本任务前后的区别。
  -- CREATE TABLE IF NOT EXISTS 不会改旧列；已有表必须按手册检查并明确迁移，不要删库。
  --
  -- 本任务要补全：把这一列改成 VARCHAR(255) NOT NULL
  -- （唯一性由下面单独的 CONSTRAINT uq_users_email UNIQUE (email) 保证，
  --   MySQL 允许把约束单独命名写出来，好处是报错信息里会带上这个名字，
  --   一眼知道是哪条约束被违反了）
  -- ==================================================
  email VARCHAR(255),
  password_hash VARCHAR(255) NOT NULL,
  avatar MEDIUMTEXT NOT NULL,
  role VARCHAR(32) NOT NULL DEFAULT 'user',
  class_id VARCHAR(64) NULL,
  profile JSON NOT NULL,
  avatar_index INT NULL,
  created_at DATETIME(3) NOT NULL,
  updated_at DATETIME(3) NULL,
  CONSTRAINT uq_users_email UNIQUE (email),
  CONSTRAINT fk_users_class FOREIGN KEY (class_id) REFERENCES classes(id)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  INDEX idx_users_class_id (class_id),
  INDEX idx_users_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS synonym_groups (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  category VARCHAR(100) NOT NULL,
  synonyms JSON NOT NULL,
  updated_at DATETIME(3) NULL,
  CONSTRAINT uq_synonym_groups_name UNIQUE (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS standard_hobbies (
  id INT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  category VARCHAR(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
