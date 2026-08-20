-- ==========================================
-- ShopPro RBAC 权限系统改造方案
-- ==========================================
-- 目标：将用户表拆分为多表设计，支持细粒度权限管理
-- 兼容性：保留现有 users 表，通过视图和触发器保持兼容
-- ==========================================

-- ==========================================
-- 第一步：创建新的核心表结构
-- ==========================================

-- 1. 用户基础信息表（核心表，只存储通用字段）
CREATE TABLE IF NOT EXISTS user_profiles (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(50) UNIQUE NOT NULL COMMENT '用户名',
  phone VARCHAR(20) UNIQUE COMMENT '手机号',
  email VARCHAR(100) UNIQUE COMMENT '邮箱',
  password VARCHAR(255) NOT NULL COMMENT '密码',
  real_name VARCHAR(100) COMMENT '真实姓名',
  avatar_url VARCHAR(255) COMMENT '头像URL',
  user_type ENUM('admin', 'employee', 'customer') DEFAULT 'employee' COMMENT '用户类型',
  status TINYINT DEFAULT 1 COMMENT '1:正常, 0:禁用',
  last_login_at TIMESTAMP NULL COMMENT '最后登录时间',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted TINYINT DEFAULT 0,
  INDEX idx_user_type(user_type),
  INDEX idx_status(status),
  INDEX idx_username(username)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户基础信息表';

-- 2. 员工扩展信息表（仅员工和管理员使用）
CREATE TABLE IF NOT EXISTS employee_profiles (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NOT NULL UNIQUE COMMENT '用户ID',
  employee_no VARCHAR(50) UNIQUE COMMENT '工号',
  department_id BIGINT COMMENT '部门ID',
  position VARCHAR(100) COMMENT '职位',
  entry_date DATE COMMENT '入职日期',
  direct_manager_id BIGINT COMMENT '直属上级ID',
  work_location VARCHAR(200) COMMENT '工作地点',
  employment_type ENUM('full_time', 'part_time', 'contract', 'intern') DEFAULT 'full_time' COMMENT '雇佣类型',
  sales_targets JSON COMMENT '销售目标(周/月/季)',
  kpi_config JSON COMMENT 'KPI配置',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES user_profiles(id) ON DELETE CASCADE,
  INDEX idx_department(department_id),
  INDEX idx_manager(direct_manager_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='员工扩展信息表';

-- 3. 客户扩展信息表（仅客户使用）
CREATE TABLE IF NOT EXISTS customer_profiles (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NOT NULL UNIQUE COMMENT '用户ID',
  customer_no VARCHAR(50) UNIQUE COMMENT '客户编号',
  company_name VARCHAR(200) COMMENT '公司名称',
  industry VARCHAR(100) COMMENT '所属行业',
  level ENUM('vip','high','medium','low') DEFAULT 'medium' COMMENT '客户等级',
  source VARCHAR(100) COMMENT '客户来源',
  owner_id BIGINT COMMENT '负责销售ID',
  tags JSON COMMENT '客户标签',
  last_purchase_at TIMESTAMP NULL COMMENT '最后购买时间',
  total_purchase_amount DECIMAL(12,2) DEFAULT 0 COMMENT '累计消费金额',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES user_profiles(id) ON DELETE CASCADE,
  INDEX idx_owner(owner_id),
  INDEX idx_level(level)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='客户扩展信息表';

-- 4. 增强的角色表（已存在，但需要添加字段）
ALTER TABLE roles ADD COLUMN IF NOT EXISTS role_type ENUM('system', 'custom') DEFAULT 'custom' COMMENT '角色类型';
ALTER TABLE roles ADD COLUMN IF NOT EXISTS data_scope ENUM('all', 'department', 'department_and_sub', 'self', 'custom') DEFAULT 'self' COMMENT '数据权限范围';

-- 5. 增强的权限表（已存在，但需要添加字段）
ALTER TABLE permissions ADD COLUMN IF NOT EXISTS permission_type ENUM('menu', 'button', 'api', 'data') DEFAULT 'menu' COMMENT '权限类型';
ALTER TABLE permissions ADD COLUMN IF NOT EXISTS parent_id BIGINT DEFAULT 0 COMMENT '父权限ID';
ALTER TABLE permissions ADD COLUMN IF NOT EXISTS path VARCHAR(255) COMMENT '菜单路径/API路径';
ALTER TABLE permissions ADD COLUMN IF NOT EXISTS method VARCHAR(10) COMMENT 'HTTP方法(GET/POST等)';
ALTER TABLE permissions ADD COLUMN IF NOT EXISTS icon VARCHAR(100) COMMENT '图标';

-- 6. 用户权限表（用户直接分配的权限，优先级高于角色权限）
CREATE TABLE IF NOT EXISTS user_permissions (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NOT NULL COMMENT '用户ID',
  permission_id BIGINT NOT NULL COMMENT '权限ID',
  permission_type ENUM('grant', 'deny') DEFAULT 'grant' COMMENT '权限类型：授予/拒绝',
  assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '分配时间',
  assigned_by BIGINT COMMENT '分配人ID',
  expires_at TIMESTAMP NULL COMMENT '过期时间',
  UNIQUE KEY uk_user_perm (user_id, permission_id),
  INDEX idx_up_user(user_id),
  INDEX idx_up_perm(permission_id),
  FOREIGN KEY (user_id) REFERENCES user_profiles(id) ON DELETE CASCADE,
  FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户权限表';

-- 7. 数据权限表（细粒度数据访问控制）
CREATE TABLE IF NOT EXISTS data_permissions (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT COMMENT '用户ID（与role_id二选一）',
  role_id BIGINT COMMENT '角色ID（与user_id二选一）',
  resource_type VARCHAR(50) NOT NULL COMMENT '资源类型：customer/lead/order等',
  resource_id BIGINT COMMENT '资源ID（NULL表示所有）',
  permission_scope ENUM('read', 'write', 'delete', 'all') DEFAULT 'read' COMMENT '权限范围',
  conditions JSON COMMENT '条件表达式（如：部门、区域等）',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_dp_user(user_id),
  INDEX idx_dp_role(role_id),
  INDEX idx_dp_resource(resource_type, resource_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='数据权限表';

-- 8. 角色继承表（支持角色继承）
CREATE TABLE IF NOT EXISTS role_inheritance (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  parent_role_id BIGINT NOT NULL COMMENT '父角色ID',
  child_role_id BIGINT NOT NULL COMMENT '子角色ID',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_role_inherit (parent_role_id, child_role_id),
  FOREIGN KEY (parent_role_id) REFERENCES roles(id) ON DELETE CASCADE,
  FOREIGN KEY (child_role_id) REFERENCES roles(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='角色继承表';

-- ==========================================
-- 第二步：保留 users 物理表（确保读写与 Mybatis-Plus 兼容）
-- ==========================================
-- 注意：不应将 users 改为包含 LEFT JOIN 的视图，否则会导致 MySQL 1288 Not Updatable 错误。
-- users 保持为完整的物理实体表。

-- ==========================================
-- 第三步：数据迁移脚本
-- ==========================================

-- 迁移现有 users 表数据到新表结构
INSERT INTO user_profiles (id, username, phone, email, password, real_name, avatar_url, user_type, status, last_login_at, created_at, updated_at, deleted)
SELECT 
  id, 
  username, 
  phone, 
  email, 
  password, 
  real_name, 
  avatar_url,
  CASE 
    WHEN role IN ('admin', 'manager', 'sales') THEN 'employee'
    ELSE 'customer'
  END AS user_type,
  status,
  last_login_at,
  created_at,
  updated_at,
  deleted
FROM users
WHERE NOT EXISTS (SELECT 1 FROM user_profiles WHERE user_profiles.id = users.id);

-- 迁移员工数据到 employee_profiles
INSERT INTO employee_profiles (user_id, department_id, sales_targets)
SELECT 
  id,
  department_id,
  sales_targets
FROM users
WHERE role IN ('admin', 'manager', 'sales')
  AND NOT EXISTS (SELECT 1 FROM employee_profiles WHERE employee_profiles.user_id = users.id);

-- ==========================================
-- 第四步：初始化基础权限数据
-- ==========================================

-- 插入系统角色
INSERT INTO roles (name, code, display_name, description, role_type, data_scope, status) VALUES
('超级管理员', 'super_admin', 'Super Admin', '系统超级管理员，拥有所有权限', 'system', 'all', 1),
('系统管理员', 'admin', 'Administrator', '系统管理员', 'system', 'all', 1),
('部门经理', 'manager', 'Manager', '部门经理', 'system', 'department_and_sub', 1),
('销售人员', 'sales', 'Sales', '销售人员', 'system', 'self', 1),
('客服人员', 'customer_service', 'Customer Service', '客服人员', 'system', 'department', 1)
ON DUPLICATE KEY UPDATE updated_at = CURRENT_TIMESTAMP;

-- 插入基础权限（菜单权限）
INSERT INTO permissions (name, code, display_name, permission_type, category, resource, action, path, status) VALUES
-- 仪表盘
('仪表盘', 'dashboard', 'Dashboard', 'menu', 'system', 'dashboard', 'view', '/dashboard', 1),
('数据概览', 'dashboard:overview', 'Overview', 'menu', 'dashboard', 'dashboard', 'view', '/dashboard/overview', 1),

-- 客户管理
('客户管理', 'customer', 'Customer Management', 'menu', 'business', 'customer', 'view', '/customers', 1),
('客户列表', 'customer:list', 'Customer List', 'menu', 'customer', 'customer', 'view', '/customers/list', 1),
('客户详情', 'customer:detail', 'Customer Detail', 'menu', 'customer', 'customer', 'view', '/customers/:id', 1),
('新增客户', 'customer:create', 'Create Customer', 'button', 'customer', 'customer', 'create', '/api/customers', 1),
('编辑客户', 'customer:update', 'Update Customer', 'button', 'customer', 'customer', 'update', '/api/customers/:id', 1),
('删除客户', 'customer:delete', 'Delete Customer', 'button', 'customer', 'customer', 'delete', '/api/customers/:id', 1),
('导出客户', 'customer:export', 'Export Customer', 'button', 'customer', 'customer', 'export', '/api/customers/export', 1),

-- 线索管理
('线索管理', 'lead', 'Lead Management', 'menu', 'business', 'lead', 'view', '/leads', 1),
('线索列表', 'lead:list', 'Lead List', 'menu', 'lead', 'lead', 'view', '/leads/list', 1),
('新增线索', 'lead:create', 'Create Lead', 'button', 'lead', 'lead', 'create', '/api/leads', 1),
('编辑线索', 'lead:update', 'Update Lead', 'button', 'lead', 'lead', 'update', '/api/leads/:id', 1),
('删除线索', 'lead:delete', 'Delete Lead', 'button', 'lead', 'lead', 'delete', '/api/leads/:id', 1),
('分配线索', 'lead:assign', 'Assign Lead', 'button', 'lead', 'lead', 'assign', '/api/leads/:id/assign', 1),

-- 订单管理
('订单管理', 'order', 'Order Management', 'menu', 'business', 'order', 'view', '/orders', 1),
('订单列表', 'order:list', 'Order List', 'menu', 'order', 'order', 'view', '/orders/list', 1),
('订单详情', 'order:detail', 'Order Detail', 'menu', 'order', 'order', 'view', '/orders/:id', 1),
('创建订单', 'order:create', 'Create Order', 'button', 'order', 'order', 'create', '/api/orders', 1),
('取消订单', 'order:cancel', 'Cancel Order', 'button', 'order', 'order', 'cancel', '/api/orders/:id/cancel', 1),

-- 产品管理
('产品管理', 'product', 'Product Management', 'menu', 'business', 'product', 'view', '/products', 1),
('产品列表', 'product:list', 'Product List', 'menu', 'product', 'product', 'view', '/products/list', 1),
('新增产品', 'product:create', 'Create Product', 'button', 'product', 'product', 'create', '/api/products', 1),
('编辑产品', 'product:update', 'Update Product', 'button', 'product', 'product', 'update', '/api/products/:id', 1),
('删除产品', 'product:delete', 'Delete Product', 'button', 'product', 'product', 'delete', '/api/products/:id', 1),

-- 系统管理
('系统管理', 'system', 'System Management', 'menu', 'system', 'system', 'view', '/system', 1),
('用户管理', 'system:user', 'User Management', 'menu', 'system', 'user', 'view', '/system/users', 1),
('角色管理', 'system:role', 'Role Management', 'menu', 'system', 'role', 'view', '/system/roles', 1),
('权限管理', 'system:permission', 'Permission Management', 'menu', 'system', 'permission', 'view', '/system/permissions', 1),
('部门管理', 'system:department', 'Department Management', 'menu', 'system', 'department', 'view', '/system/departments', 1),
('操作日志', 'system:log', 'Operation Log', 'menu', 'system', 'log', 'view', '/system/logs', 1)
ON DUPLICATE KEY UPDATE updated_at = CURRENT_TIMESTAMP;

-- 为超级管理员分配所有权限
INSERT INTO role_permissions (role_id, permission_id)
SELECT 
  (SELECT id FROM roles WHERE code = 'super_admin'),
  id
FROM permissions
WHERE NOT EXISTS (
  SELECT 1 FROM role_permissions 
  WHERE role_id = (SELECT id FROM roles WHERE code = 'super_admin') 
  AND permission_id = permissions.id
);

-- ==========================================
-- 第五步：创建触发器（可选，用于自动同步）
-- ==========================================

-- 当 user_profiles 插入时，如果是员工类型，自动创建 employee_profiles
DELIMITER $$
CREATE TRIGGER IF NOT EXISTS after_user_insert
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

-- ==========================================
-- 第六步：创建权限查询函数
-- ==========================================

DELIMITER $$
-- 检查用户是否有某个权限
CREATE FUNCTION IF NOT EXISTS has_permission(
  p_user_id BIGINT,
  p_permission_code VARCHAR(100)
) RETURNS BOOLEAN
DETERMINISTIC
READS SQL DATA
BEGIN
  DECLARE has_perm BOOLEAN DEFAULT FALSE;
  
  -- 检查用户直接权限（拒绝优先）
  IF EXISTS (
    SELECT 1 FROM user_permissions up
    JOIN permissions p ON up.permission_id = p.id
    WHERE up.user_id = p_user_id 
    AND p.code = p_permission_code
    AND up.permission_type = 'deny'
  ) THEN
    RETURN FALSE;
  END IF;
  
  -- 检查用户直接权限（授予）
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
  
  -- 检查角色权限
  IF EXISTS (
    SELECT 1 FROM user_roles ur
    JOIN role_permissions rp ON ur.role_id = rp.role_id
    JOIN permissions p ON rp.permission_id = p.id
    WHERE ur.user_id = p_user_id 
    AND p.code = p_permission_code
  ) THEN
    RETURN TRUE;
  END IF;
  
  RETURN FALSE;
END$$
DELIMITER ;

-- ==========================================
-- 第七步：索引优化
-- ==========================================

-- 为常用查询添加复合索引
CREATE INDEX idx_user_type_status ON user_profiles(user_type, status);
CREATE INDEX idx_user_deleted_status ON user_profiles(deleted, status);
CREATE INDEX idx_perm_type_category ON permissions(permission_type, category);
CREATE INDEX idx_perm_resource_action ON permissions(resource, action);

-- ==========================================
-- 完成！
-- ==========================================
