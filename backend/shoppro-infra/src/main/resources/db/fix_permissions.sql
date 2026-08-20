-- ==========================================
-- ShopPro RBAC 权限初始化
-- ==========================================

-- 1. 插入基础权限（根据 migration_rbac.sql）
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
ON DUPLICATE KEY UPDATE 
  permission_type = VALUES(permission_type),
  path = VALUES(path),
  updated_at = CURRENT_TIMESTAMP;

-- 2. 为超级管理员分配所有权限
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
