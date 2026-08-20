-- 修复用户角色分配问题
-- 问题：manager001, sales001等用户在user_roles表中没有角色分配
-- 导致users视图返回的role字段为默认值'user'

-- 1. 首先确保有manager和sales角色存在
INSERT IGNORE INTO roles (name, code, level, role_type, description, status, created_at, updated_at)
VALUES 
('经理', 'manager', 70, 'system', '部门经理角色', 1, NOW(), NOW()),
('销售', 'sales', 60, 'system', '销售人员角色', 1, NOW(), NOW());

-- 2. 为manager001分配manager角色
INSERT IGNORE INTO user_roles (user_id, role_id, assigned_at)
SELECT 2, r.id, NOW()
FROM roles r
WHERE r.code = 'manager'
LIMIT 1;

-- 3. 为sales001, sales002, sales003分配sales角色
INSERT IGNORE INTO user_roles (user_id, role_id, assigned_at)
SELECT 3, r.id, NOW()
FROM roles r
WHERE r.code = 'sales'
LIMIT 1;

INSERT IGNORE INTO user_roles (user_id, role_id, assigned_at)
SELECT 4, r.id, NOW()
FROM roles r
WHERE r.code = 'sales'
LIMIT 1;

INSERT IGNORE INTO user_roles (user_id, role_id, assigned_at)
SELECT 5, r.id, NOW()
FROM roles r
WHERE r.code = 'sales'
LIMIT 1;

-- 验证结果
SELECT 
    u.id,
    u.username,
    u.real_name,
    u.role as current_role,
    r.code as assigned_role
FROM users u
LEFT JOIN user_roles ur ON u.id = ur.user_id
LEFT JOIN roles r ON ur.role_id = r.id
WHERE u.id IN (1,2,3,4,5)
ORDER BY u.id;
