-- ShopPro 权限控制系统(RBAC) 数据库初始化脚本
-- 创建时间: 2024-10-19
-- 版本: v1.0

USE shoppro_db;

-- 权限表
CREATE TABLE IF NOT EXISTS permissions (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL UNIQUE COMMENT '权限名称',
    display_name VARCHAR(100) NOT NULL COMMENT '权限中文名称',
    description TEXT COMMENT '权限描述',
    resource VARCHAR(500) COMMENT '资源标识(URL路径)',
    action VARCHAR(50) COMMENT '操作类型(CREATE,READ,UPDATE,DELETE,EXECUTE)',
    category VARCHAR(50) COMMENT '权限分类',
    is_system TINYINT DEFAULT 0 COMMENT '是否系统权限：1-是，0-否',
    sort_order INT DEFAULT 0 COMMENT '排序序号',
    status TINYINT DEFAULT 1 COMMENT '状态：1-正常，0-禁用',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_name (name),
    INDEX idx_category (category),
    INDEX idx_status (status),
    INDEX idx_system (is_system)
) ENGINE=InnoDB COMMENT='权限表';

-- 角色表
CREATE TABLE IF NOT EXISTS roles (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL UNIQUE COMMENT '角色名称',
    display_name VARCHAR(100) NOT NULL COMMENT '角色中文名称',
    description TEXT COMMENT '角色描述',
    parent_id BIGINT DEFAULT 0 COMMENT '父角色ID',
    sort_order INT DEFAULT 0 COMMENT '排序序号',
    status TINYINT DEFAULT 1 COMMENT '状态：1-正常，0-禁用',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_name (name),
    INDEX idx_parent (parent_id),
    INDEX idx_status (status)
) ENGINE=InnoDB COMMENT='角色表';

-- 角色权限关系表
CREATE TABLE IF NOT EXISTS role_permissions (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    role_id BIGINT NOT NULL COMMENT '角色ID',
    permission_id BIGINT NOT NULL COMMENT '权限ID',
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '分配时间',
    assigned_by BIGINT COMMENT '分配人ID',
    
    UNIQUE KEY unique_role_permission (role_id, permission_id),
    INDEX idx_role (role_id),
    INDEX idx_permission (permission_id),
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
    FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE,
    FOREIGN KEY (assigned_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB COMMENT='角色权限关系表';

-- 用户角色关系表
CREATE TABLE IF NOT EXISTS user_roles (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL COMMENT '用户ID',
    role_id BIGINT NOT NULL COMMENT '角色ID',
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '分配时间',
    assigned_by BIGINT COMMENT '分配人ID',
    
    UNIQUE KEY unique_user_role (user_id, role_id),
    INDEX idx_user (user_id),
    INDEX idx_role (role_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
    FOREIGN KEY (assigned_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB COMMENT='用户角色关系表';

-- 权限访问日志表
CREATE TABLE IF NOT EXISTS permission_logs (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT COMMENT '用户ID',
    permission_name VARCHAR(100) COMMENT '权限名称',
    resource VARCHAR(500) COMMENT '资源',
    action VARCHAR(50) COMMENT '操作',
    result ENUM('success', 'denied', 'error') DEFAULT 'success' COMMENT '结果',
    error_message TEXT COMMENT '错误信息',
    ip_address VARCHAR(45) COMMENT 'IP地址',
    user_agent TEXT COMMENT '用户代理',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_user (user_id),
    INDEX idx_permission (permission_name),
    INDEX idx_resource (resource),
    INDEX idx_result (result),
    INDEX idx_created_at (created_at),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB COMMENT='权限访问日志表';

-- 插入默认角色
INSERT INTO roles (name, display_name, description, sort_order, status) VALUES
('admin', '管理员', '系统管理员，拥有所有权限', 1, 1),
('manager', '经理', '部门经理，管理团队成员', 2, 1),
('sales', '销售', '销售人员，客户管理和销售操作', 3, 1),
('user', '普通用户', '普通系统用户', 4, 1),
('guest', '访客', '访客角色，仅查看权限', 5, 1);

-- 插入默认权限 - 用户管理权限
INSERT INTO permissions (name, display_name, description, resource, action, category, is_system, sort_order, status) VALUES
-- 用户管理
('system:user:list', '查看用户列表', '查看系统用户列表', '/api/users', 'READ', 'user', 1, 1, 1),
('system:user:add', '添加用户', '添加新用户', '/api/users', 'CREATE', 'user', 1, 2, 1),
('system:user:edit', '编辑用户', '编辑用户信息', '/api/users/*', 'UPDATE', 'user', 1, 3, 1),
('system:user:delete', '删除用户', '删除用户', '/api/users/*', 'DELETE', 'user', 1, 4, 1),
('system:user:export', '导出用户', '导出用户数据', '/api/users/export', 'READ', 'user', 1, 5, 1),

-- 角色权限管理
('system:role:list', '查看角色列表', '查看系统角色', '/api/roles', 'READ', 'role', 1, 6, 1),
('system:role:add', '添加角色', '添加新角色', '/api/roles', 'CREATE', 'role', 1, 7, 1),
('system:role:edit', '编辑角色', '编辑角色信息', '/api/roles/*', 'UPDATE', 'role', 1, 8, 1),
('system:role:delete', '删除角色', '删除角色', '/api/roles/*', 'DELETE', 'role', 1, 9, 1),
('system:role:permission', '配置角色权限', '为角色分配权限', '/api/roles/*/permissions', 'UPDATE', 'role', 1, 10, 1),

-- 权限管理
('system:permission:list', '查看权限列表', '查看系统权限', '/api/permissions', 'READ', 'permission', 1, 11, 1),
('system:permission:add', '添加权限', '添加新权限', '/api/permissions', 'CREATE', 'permission', 1, 12, 1),
('system:permission:edit', '编辑权限', '编辑权限信息', '/api/permissions/*', 'UPDATE', 'permission', 1, 13, 1),
('system:permission:delete', '删除权限', '删除权限', '/api/permissions/*', 'DELETE', 'permission', 1, 14, 1),

-- 部门管理
('system:department:list', '查看部门', '查看部门列表', '/api/departments', 'READ', 'department', 1, 15, 1),
('system:department:add', '添加部门', '添加新部门', '/api/departments', 'CREATE', 'department', 1, 16, 1),
('system:department:edit', '编辑部门', '编辑部门信息', '/api/departments/*', 'UPDATE', 'department', 1, 17, 1),
('system:department:delete', '删除部门', '删除部门', '/api/departments/*', 'DELETE', 'department', 1, 18, 1),

-- 客户管理
('customer:list', '查看客户', '查看客户列表', '/api/customers', 'READ', 'customer', 0, 19, 1),
('customer:add', '添加客户', '添加新客户', '/api/customers', 'CREATE', 'customer', 0, 20, 1),
('customer:edit', '编辑客户', '编辑客户信息', '/api/customers/*', 'UPDATE', 'customer', 0, 21, 1),
('customer:delete', '删除客户', '删除客户', '/api/customers/*', 'DELETE', 'customer', 0, 22, 1),
('customer:assign', '分配客户', '将客户分配给销售人员', '/api/customers/*/assign', 'UPDATE', 'customer', 0, 23, 1),
('customer:view360', '360视图', '查看客户360度视图', '/api/customers/*/profile', 'READ', 'customer', 0, 24, 1),

-- 销售线索管理
('lead:list', '查看线索', '查看销售线索列表', '/api/leads', 'READ', 'lead', 0, 25, 1),
('lead:add', '添加线索', '添加新线索', '/api/leads', 'CREATE', 'lead', 0, 26, 1),
('lead:edit', '编辑线索', '编辑线索信息', '/api/leads/*', 'UPDATE', 'lead', 0, 27, 1),
('lead:delete', '删除线索', '删除线索', '/api/leads/*', 'DELETE', 'lead', 0, 28, 1),
('lead:assign', '分配线索', '将线索分配给销售人员', '/api/leads/*/assign', 'UPDATE', 'lead', 0, 29, 1),
('lead:convert', '转化客户', '将线索转化为客户', '/api/leads/*/convert', 'UPDATE', 'lead', 0, 30, 1),

-- 产品管理
('product:list', '查看产品', '查看产品列表', '/api/products', 'READ', 'product', 0, 31, 1),
('product:add', '添加产品', '添加新产品', '/api/products', 'CREATE', 'product', 0, 32, 1),
('product:edit', '编辑产品', '编辑产品信息', '/api/products/*', 'UPDATE', 'product', 0, 33, 1),
('product:delete', '删除产品', '删除产品', '/api/products/*', 'DELETE', 'product', 0, 34, 1),

-- 数据分析
('analytics:view', '查看分析', '查看数据分析页面', '/api/analytics/*', 'READ', 'analytics', 0, 35, 1),
('analytics:export', '导出报表', '导出分析报表', '/api/analytics/report/*', 'READ', 'analytics', 0, 36, 1);

-- 为管理员角色配置所有权限
INSERT INTO role_permissions (role_id, permission_id, assigned_by) 
SELECT (SELECT id FROM roles WHERE name='admin'), id, NULL FROM permissions;

-- 为经理角色配置常用权限（除系统设置外）
INSERT INTO role_permissions (role_id, permission_id, assigned_by) 
SELECT (SELECT id FROM roles WHERE name='manager'), id, NULL FROM permissions 
WHERE is_system = 0 OR name IN ('system:department:list', 'system:user:list');

-- 为销售角色配置基本权限
INSERT INTO role_permissions (role_id, permission_id, assigned_by) 
SELECT (SELECT id FROM roles WHERE name='sales'), id, NULL FROM permissions 
WHERE name IN (
  'customer:list', 'customer:add', 'customer:edit', 'customer:view360',
  'lead:list', 'lead:add', 'lead:edit', 'lead:assign', 'lead:convert',
  'product:list', 'analytics:view'
);

-- 为普通用户角色配置只读权限
INSERT INTO role_permissions (role_id, permission_id, assigned_by) 
SELECT (SELECT id FROM roles WHERE name='user'), id, NULL FROM permissions 
WHERE name IN (
  'customer:list', 'lead:list', 'product:list', 'analytics:view'
);

-- 为访客角色配置最小权限
INSERT INTO role_permissions (role_id, permission_id, assigned_by) 
SELECT (SELECT id FROM roles WHERE name='guest'), id, NULL FROM permissions 
WHERE name IN ('customer:list', 'product:list');
