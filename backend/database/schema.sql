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
    -- ============ TODO 02（简单）：MySQL 的约束写法 ============
  -- 和 SQLite 大同小异，但有几处不一样，正好对照着记：
  --   SQLite: email TEXT NOT NULL UNIQUE
  --   MySQL : email VARCHAR(255) NOT NULL UNIQUE
  --
  -- **MySQL 要求字符串列指定长度**（VARCHAR(255)），SQLite 不用。
  -- 原因是 MySQL 要为索引预分配空间，必须知道最大长度。
  --
  -- 页面上看得到的结果：同邮箱注册第二次被拒。
  --
  -- TODO：把这一列改成 VARCHAR(255) NOT NULL
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
