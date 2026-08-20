-- ==========================================================
-- ShopPro: users 物理表修复与恢复脚本
-- 说明：解决 MySQL 1288 错误 (The target table users of the UPDATE is not updatable)
-- ==========================================================

USE shoppro_db;

-- 1. 创建临时表备份当前 users（无论是表还是视图）中的有效数据
CREATE TABLE IF NOT EXISTS temp_users_backup AS
SELECT * FROM users WHERE 1=1;

-- 2. 若 users 是视图，删除视图
DROP VIEW IF EXISTS users;

-- 3. 创建标准的 InnoDB 物理表 users
CREATE TABLE IF NOT EXISTS users (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(50) UNIQUE NOT NULL COMMENT '用户名',
  phone VARCHAR(20) UNIQUE COMMENT '手机号',
  email VARCHAR(100) UNIQUE COMMENT '邮箱',
  password VARCHAR(255) NOT NULL COMMENT '加密密码',
  real_name VARCHAR(100) COMMENT '真实姓名',
  avatar_url VARCHAR(255) COMMENT '头像URL',
  role VARCHAR(50) DEFAULT 'user' COMMENT '角色代码(admin, manager, sales, user等)',
  department_id BIGINT COMMENT '部门ID',
  enterprise_id BIGINT COMMENT '所属企业ID',
  sales_targets JSON COMMENT '销售目标(周/月/季)',
  status TINYINT DEFAULT 1 COMMENT '状态: 1-正常, 0-禁用',
  last_login_at TIMESTAMP NULL COMMENT '最后登录时间',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  deleted TINYINT DEFAULT 0 COMMENT '逻辑删除: 0-未删除, 1-已删除',
  INDEX idx_users_username(username),
  INDEX idx_users_phone(phone),
  INDEX idx_users_email(email),
  INDEX idx_users_role(role),
  INDEX idx_users_enterprise(enterprise_id),
  INDEX idx_users_department(department_id),
  INDEX idx_users_status(status),
  INDEX idx_users_deleted(deleted)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户主表(物理表)';

-- 4. 从备份表安全同步恢复数据
INSERT INTO users (
  id, username, phone, email, password, real_name, avatar_url, 
  role, department_id, enterprise_id, sales_targets, status, 
  last_login_at, created_at, updated_at, deleted
)
SELECT 
  b.id,
  b.username,
  b.phone,
  b.email,
  b.password,
  b.real_name,
  b.avatar_url,
  COALESCE(b.role, 'user'),
  b.department_id,
  NULL AS enterprise_id,
  b.sales_targets,
  COALESCE(b.status, 1),
  b.last_login_at,
  COALESCE(b.created_at, NOW()),
  COALESCE(b.updated_at, NOW()),
  COALESCE(b.deleted, 0)
FROM temp_users_backup b
ON DUPLICATE KEY UPDATE
  phone = VALUES(phone),
  email = VALUES(email),
  real_name = VALUES(real_name),
  role = VALUES(role),
  status = VALUES(status),
  updated_at = NOW();

-- 5. 如果有 user_profiles 表，补齐可能在 user_profiles 中存在但 users 中没有的用户
INSERT INTO users (
  id, username, phone, email, password, real_name, avatar_url, 
  role, status, last_login_at, created_at, updated_at, deleted
)
SELECT 
  up.id,
  up.username,
  up.phone,
  up.email,
  up.password,
  up.real_name,
  up.avatar_url,
  CASE 
    WHEN up.user_type = 'admin' THEN 'admin'
    WHEN up.user_type = 'employee' THEN 'sales'
    ELSE 'user'
  END,
  up.status,
  up.last_login_at,
  up.created_at,
  up.updated_at,
  up.deleted
FROM user_profiles up
WHERE NOT EXISTS (SELECT 1 FROM users u WHERE u.id = up.id)
ON DUPLICATE KEY UPDATE updated_at = CURRENT_TIMESTAMP;

-- 6. 清理临时备份表
DROP TABLE IF EXISTS temp_users_backup;
