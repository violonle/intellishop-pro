-- 配置管理员角色层级（修正版）
USE shoppro_db;

-- 1. 扩展 role_type ENUM 类型以支持更多角色类型
ALTER TABLE roles 
MODIFY COLUMN role_type ENUM('system', 'platform', 'enterprise', 'custom') DEFAULT 'custom';

-- 2. 确保三种管理员角色存在并正确配置
-- 超级管理员（系统级别，拥有所有权限）
INSERT INTO roles (name, code, level, display_name, description, role_type, data_scope, status, sort_order, parent_id)
VALUES ('超级管理员', 'super_admin', 100, 'Super Admin', '系统超级管理员，拥有所有权限', 'system', 'all', 1, 1, 0)
ON DUPLICATE KEY UPDATE 
  level = 100, 
  display_name = 'Super Admin',
  description = '系统超级管理员，拥有所有权限',
  role_type = 'system',
  data_scope = 'all',
  updated_at = NOW();

-- 平台管理员（平台级别，管理平台运营）
INSERT INTO roles (name, code, level, display_name, description, role_type, data_scope, status, sort_order, parent_id)
VALUES ('平台管理员', 'platform_admin', 90, 'Platform Admin', '平台管理员，负责平台运营管理', 'platform', 'all', 1, 2, 0)
ON DUPLICATE KEY UPDATE 
  level = 90,
  display_name = 'Platform Admin',
  description = '平台管理员，负责平台运营管理',
  role_type = 'platform',
  data_scope = 'all',
  updated_at = NOW();

-- 企业管理员（企业级别，管理企业内部）
INSERT INTO roles (name, code, level, display_name, description, role_type, data_scope, status, sort_order, parent_id)
VALUES ('企业管理员', 'enterprise_admin', 80, 'Enterprise Admin', '企业管理员，负责企业内部管理', 'enterprise', 'department', 1, 3, 0)
ON DUPLICATE KEY UPDATE 
  level = 80,
  display_name = 'Enterprise Admin',
  description = '企业管理员，负责企业内部管理',
  role_type = 'enterprise',
  data_scope = 'department',
  updated_at = NOW();

-- 3. 为 admin 用户分配超级管理员角色
-- 首先删除可能存在的旧角色关联（保留基于用户ID=1）
DELETE FROM user_roles WHERE user_id = 1;

-- 分配超级管理员角色给 admin 用户
INSERT INTO user_roles (user_id, role_id)
SELECT 1, id FROM roles WHERE code = 'super_admin' LIMIT 1;

-- 4. 验证配置
SELECT '=== Admin 用户角色配置 ===' as info;
SELECT 
  u.id,
  u.username,
  r.name as role_name,
  r.code as role_code,
  r.display_name,
  r.level,
  r.role_type,
  r.data_scope
FROM users u
JOIN user_roles ur ON u.id = ur.user_id
JOIN roles r ON ur.role_id = r.id
WHERE u.username = 'admin';

SELECT '=== 所有管理员角色 ===' as info;
SELECT 
  id,
  name,
  code,
  display_name,
  level,
  role_type,
  data_scope,
  status
FROM roles
WHERE code IN ('super_admin', 'platform_admin', 'enterprise_admin')
ORDER BY level DESC;
