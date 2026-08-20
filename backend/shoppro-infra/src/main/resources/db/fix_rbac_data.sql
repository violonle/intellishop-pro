-- ==========================================
-- ShopPro RBAC 修复脚本 (数据与视图)
-- ==========================================

-- 1. 更新 users 视图，确保角色逻辑正确
CREATE OR REPLACE VIEW users AS
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
    ELSE COALESCE(
      (SELECT r.code FROM user_roles ur 
       JOIN roles r ON ur.role_id = r.id 
       WHERE ur.user_id = up.id 
       ORDER BY r.level DESC LIMIT 1), 
      'user'
    )
  END AS role,
  ep.department_id,
  ep.sales_targets,
  up.status,
  up.last_login_at,
  up.created_at,
  up.updated_at,
  up.deleted
FROM user_profiles up
LEFT JOIN employee_profiles ep ON up.id = ep.user_id;

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

-- 3. 确保管理员用户有关联角色
INSERT INTO user_roles (user_id, role_id)
SELECT up.id, r.id 
FROM user_profiles up, roles r
WHERE up.username = 'admin' AND r.code = 'super_admin'
AND NOT EXISTS (SELECT 1 FROM user_roles WHERE user_id = up.id AND role_id = r.id);
