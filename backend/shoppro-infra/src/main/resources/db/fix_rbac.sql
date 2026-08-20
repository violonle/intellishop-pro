-- ==========================================
-- ShopPro RBAC 修复脚本
-- ==========================================

-- 1. 确保 users 保持物理实体表，不创建只读视图
-- （避免 MySQL 1288 Not Updatable 错误）

-- 2. 初始化核心角色（如果缺失）
INSERT INTO roles (name, code, display_name, description, role_type, data_scope, status) VALUES
('超级管理员', 'super_admin', 'Super Admin', '系统超级管理员，拥有所有权限', 'system', 'all', 1),
('系统管理员', 'admin', 'Administrator', '系统管理员', 'system', 'all', 1),
('部门经理', 'manager', 'Manager', '部门经理', 'system', 'department_and_sub', 1),
('销售人员', 'sales', 'Sales', '销售人员', 'system', 'self', 1),
('客服人员', 'customer_service', 'Customer Service', '客服人员', 'system', 'department', 1)
ON DUPLICATE KEY UPDATE 
  code = VALUES(code),
  role_type = VALUES(role_type),
  data_scope = VALUES(data_scope);

-- 3. 重置 has_permission 函数
DROP FUNCTION IF EXISTS has_permission;
DELIMITER $$
CREATE FUNCTION has_permission(
  p_user_id BIGINT,
  p_permission_code VARCHAR(100)
) RETURNS BOOLEAN
DETERMINISTIC
READS SQL DATA
BEGIN
  -- 1. 检查超级管理员角色
  IF EXISTS (
    SELECT 1 FROM user_roles ur
    JOIN roles r ON ur.role_id = r.id
    WHERE ur.user_id = p_user_id AND r.code = 'super_admin'
  ) THEN
    RETURN TRUE;
  END IF;

  -- 2. 检查用户直接权限（拒绝优先）
  IF EXISTS (
    SELECT 1 FROM user_permissions up
    JOIN permissions p ON up.permission_id = p.id
    WHERE up.user_id = p_user_id 
    AND p.code = p_permission_code
    AND up.permission_type = 'deny'
  ) THEN
    RETURN FALSE;
  END IF;
  
  -- 3. 检查用户直接权限（授予）
  IF EXISTS (
    SELECT 1 FROM user_permissions up
    JOIN permissions p ON up.permission_id = p.id
    WHERE up.user_id = p_user_id 
    AND p.code = p_permission_code
    AND up.permission_type = 'grant'
    AND (up.expires_at IS NULL OR up.expires_at > NOW())
  ) THEN
    RETURN TRUE;
  END IF;
  
  -- 4. 检查角色权限
  IF EXISTS (
    SELECT 1 FROM user_roles ur
    JOIN role_permissions rp ON ur.role_id = rp.role_id
    JOIN permissions p ON rp.permission_id = p.id
    WHERE ur.user_id = p_user_id 
    AND (p.code = p_permission_code OR p_permission_code IS NULL)
  ) THEN
    RETURN TRUE;
  END IF;
  
  RETURN FALSE;
END$$
DELIMITER ;

-- 4. 修复触发器
DROP TRIGGER IF EXISTS after_user_insert;
DELIMITER $$
CREATE TRIGGER after_user_insert
AFTER INSERT ON user_profiles
FOR EACH ROW
BEGIN
  IF NEW.user_type IN ('admin', 'employee') THEN
    INSERT INTO employee_profiles (user_id) VALUES (NEW.id)
    ON DUPLICATE KEY UPDATE updated_at = CURRENT_TIMESTAMP;
  END IF;
  
  IF NEW.user_type = 'customer' THEN
    INSERT INTO customer_profiles (user_id) VALUES (NEW.id)
    ON DUPLICATE KEY UPDATE updated_at = CURRENT_TIMESTAMP;
  END IF;
END$$
DELIMITER ;

-- 5. 确保管理员用户有关联角色
-- 假设 ID 为 1 的用户是管理员（通常是这样）
INSERT INTO user_roles (user_id, role_id)
SELECT up.id, r.id 
FROM user_profiles up, roles r
WHERE up.username = 'admin' AND r.code = 'super_admin'
AND NOT EXISTS (SELECT 1 FROM user_roles WHERE user_id = up.id AND role_id = r.id);
