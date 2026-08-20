-- ==========================================
-- ShopPro 6角色体系初始化脚本
-- ==========================================
-- 目标：确保系统中存在6种明确的角色，并正确配置权限范围
-- ==========================================

USE shoppro_db;

-- 1. 确保 roles 表支持所有必要的角色类型
ALTER TABLE roles 
MODIFY COLUMN role_type ENUM('system', 'platform', 'enterprise', 'sales', 'custom') DEFAULT 'custom';

-- 2. 插入/更新 6 种核心角色
-- ==========================================
-- 后台管理系统角色（3种）
-- ==========================================

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

-- 企业管理员（企业级别，管理企业内部，与企业关联）
INSERT INTO roles (name, code, level, display_name, description, role_type, data_scope, status, sort_order, parent_id)
VALUES ('企业管理员', 'enterprise_admin', 80, 'Enterprise Admin', '企业管理员，负责企业内部管理，仅能管理关联企业数据', 'enterprise', 'department', 1, 3, 0)
ON DUPLICATE KEY UPDATE 
  level = 80,
  display_name = 'Enterprise Admin',
  description = '企业管理员，负责企业内部管理，仅能管理关联企业数据',
  role_type = 'enterprise',
  data_scope = 'department',
  updated_at = NOW();

-- ==========================================
-- 主站应用角色（3种）
-- ==========================================

-- 销售总监/总经理（销售最高级别）
INSERT INTO roles (name, code, level, display_name, description, role_type, data_scope, status, sort_order, parent_id)
VALUES ('销售总监', 'sales_director', 70, 'Sales Director', '销售总监/总经理，负责整体销售战略', 'sales', 'department_and_sub', 1, 4, 0)
ON DUPLICATE KEY UPDATE 
  level = 70,
  display_name = 'Sales Director',
  description = '销售总监/总经理，负责整体销售战略',
  role_type = 'sales',
  data_scope = 'department_and_sub',
  updated_at = NOW();

-- 销售经理（管理销售团队）
INSERT INTO roles (name, code, level, display_name, description, role_type, data_scope, status, sort_order, parent_id)
VALUES ('销售经理', 'sales_manager', 60, 'Sales Manager', '销售经理，负责销售团队管理', 'sales', 'department', 1, 5, 0)
ON DUPLICATE KEY UPDATE 
  level = 60,
  display_name = 'Sales Manager',
  description = '销售经理，负责销售团队管理',
  role_type = 'sales',
  data_scope = 'department',
  updated_at = NOW();

-- 销售专员（基础销售人员）
INSERT INTO roles (name, code, level, display_name, description, role_type, data_scope, status, sort_order, parent_id)
VALUES ('销售专员', 'sales', 50, 'Sales', '销售专员，负责客户开发与维护', 'sales', 'self', 1, 6, 0)
ON DUPLICATE KEY UPDATE 
  level = 50,
  display_name = 'Sales',
  description = '销售专员，负责客户开发与维护',
  role_type = 'sales',
  data_scope = 'self',
  updated_at = NOW();

-- 3. 为现有用户分配正确的角色
-- ==========================================

-- 确保 admin 用户是超级管理员
UPDATE user_profiles SET user_type = 'admin' WHERE username = 'admin';

-- 为 admin 分配 super_admin 角色（如果还没有）
INSERT IGNORE INTO user_roles (user_id, role_id)
SELECT up.id, r.id 
FROM user_profiles up, roles r
WHERE up.username = 'admin' AND r.code = 'super_admin';

-- 4. 创建测试用户（如果不存在）
-- ==========================================

-- 平台管理员测试用户
INSERT INTO user_profiles (username, phone, email, password, real_name, user_type, status, created_at, updated_at)
VALUES ('platform_admin_test', '13900000001', 'platform@test.com', '$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG', '平台管理员测试', 'admin', 1, NOW(), NOW())
ON DUPLICATE KEY UPDATE updated_at = NOW();

INSERT IGNORE INTO user_roles (user_id, role_id)
SELECT up.id, r.id 
FROM user_profiles up, roles r
WHERE up.username = 'platform_admin_test' AND r.code = 'platform_admin';

-- 企业管理员测试用户
INSERT INTO user_profiles (username, phone, email, password, real_name, user_type, status, created_at, updated_at)
VALUES ('enterprise_admin_test', '13900000002', 'enterprise@test.com', '$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG', '企业管理员测试', 'admin', 1, NOW(), NOW())
ON DUPLICATE KEY UPDATE updated_at = NOW();

INSERT IGNORE INTO user_roles (user_id, role_id)
SELECT up.id, r.id 
FROM user_profiles up, roles r
WHERE up.username = 'enterprise_admin_test' AND r.code = 'enterprise_admin';

-- 销售总监测试用户
INSERT INTO user_profiles (username, phone, email, password, real_name, user_type, status, created_at, updated_at)
VALUES ('sales_director_test', '13900000003', 'director@test.com', '$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG', '销售总监测试', 'employee', 1, NOW(), NOW())
ON DUPLICATE KEY UPDATE updated_at = NOW();

INSERT IGNORE INTO user_roles (user_id, role_id)
SELECT up.id, r.id 
FROM user_profiles up, roles r
WHERE up.username = 'sales_director_test' AND r.code = 'sales_director';

-- 销售经理测试用户
INSERT INTO user_profiles (username, phone, email, password, real_name, user_type, status, created_at, updated_at)
VALUES ('sales_manager_test', '13900000004', 'manager@test.com', '$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG', '销售经理测试', 'employee', 1, NOW(), NOW())
ON DUPLICATE KEY UPDATE updated_at = NOW();

INSERT IGNORE INTO user_roles (user_id, role_id)
SELECT up.id, r.id 
FROM user_profiles up, roles r
WHERE up.username = 'sales_manager_test' AND r.code = 'sales_manager';

-- 销售专员测试用户
INSERT INTO user_profiles (username, phone, email, password, real_name, user_type, status, created_at, updated_at)
VALUES ('sales_test', '13900000005', 'sales@test.com', '$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG', '销售专员测试', 'employee', 1, NOW(), NOW())
ON DUPLICATE KEY UPDATE updated_at = NOW();

INSERT IGNORE INTO user_roles (user_id, role_id)
SELECT up.id, r.id 
FROM user_profiles up, roles r
WHERE up.username = 'sales_test' AND r.code = 'sales';

-- 5. 验证配置
-- ==========================================

SELECT '=== 所有6种核心角色 ===' as info;
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
WHERE code IN ('super_admin', 'platform_admin', 'enterprise_admin', 'sales_director', 'sales_manager', 'sales')
ORDER BY level DESC;

SELECT '=== 测试用户角色分配 ===' as info;
SELECT 
  up.username,
  up.real_name,
  r.name as role_name,
  r.code as role_code,
  r.role_type,
  r.data_scope
FROM user_profiles up
JOIN user_roles ur ON up.id = ur.user_id
JOIN roles r ON ur.role_id = r.id
WHERE up.username IN ('admin', 'platform_admin_test', 'enterprise_admin_test', 'sales_director_test', 'sales_manager_test', 'sales_test')
ORDER BY r.level DESC;
