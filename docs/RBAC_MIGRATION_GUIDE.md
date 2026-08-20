# ShopPro RBAC 权限系统改造方案

## 📋 目录
1. [改造目标](#改造目标)
2. [架构设计](#架构设计)
3. [数据库设计](#数据库设计)
4. [迁移步骤](#迁移步骤)
5. [兼容性保证](#兼容性保证)
6. [使用示例](#使用示例)
7. [最佳实践](#最佳实践)

---

## 🎯 改造目标

### 当前问题
- ✗ 管理员和普通用户混在同一张 `users` 表
- ✗ 字段冗余，不同类型用户需要的字段不同
- ✗ 权限控制粗粒度，只能通过 `role` 字段判断
- ✗ 无法支持一个用户多个角色
- ✗ 缺少数据权限控制

### 改造目标
- ✓ **多表分离**：基础表 + 角色表 + 权限表 + 扩展表
- ✓ **向后兼容**：保持现有代码可用，通过视图模拟原表
- ✓ **细粒度权限**：支持菜单、按钮、API、数据四级权限
- ✓ **灵活扩展**：支持角色继承、权限继承、临时授权
- ✓ **数据隔离**：支持部门、个人、自定义数据权限范围

---

## 🏗️ 架构设计

### 核心设计理念
```
用户 (User) 
  ├─ 基础信息 (user_profiles)
  ├─ 扩展信息
  │   ├─ 员工信息 (employee_profiles)
  │   └─ 客户信息 (customer_profiles)
  ├─ 角色 (user_roles) → 角色 (roles)
  │   └─ 权限 (role_permissions) → 权限 (permissions)
  └─ 直接权限 (user_permissions) → 权限 (permissions)
```

### 权限判断优先级
```
1. 用户直接权限（拒绝）- 最高优先级
2. 用户直接权限（授予）
3. 角色权限
4. 默认拒绝
```

---

## 🗄️ 数据库设计

### 1. 核心表结构

#### 1.1 用户基础信息表 (user_profiles)
```sql
-- 存储所有用户的通用信息
- id: 主键
- username: 用户名（唯一）
- phone/email: 联系方式
- password: 密码
- user_type: 用户类型（admin/employee/customer）
- status: 状态
```

**设计要点**：
- 只存储所有用户类型都需要的字段
- 通过 `user_type` 区分用户类型
- 支持软删除（deleted 字段）

#### 1.2 员工扩展信息表 (employee_profiles)
```sql
-- 仅员工和管理员使用
- user_id: 关联 user_profiles.id
- employee_no: 工号
- department_id: 部门
- position: 职位
- sales_targets: 销售目标
- kpi_config: KPI 配置
```

**设计要点**：
- 一对一关联 user_profiles
- 级联删除
- 存储员工特有字段

#### 1.3 客户扩展信息表 (customer_profiles)
```sql
-- 仅客户使用
- user_id: 关联 user_profiles.id
- customer_no: 客户编号
- company_name: 公司名称
- level: 客户等级
- owner_id: 负责销售
```

**设计要点**：
- 一对一关联 user_profiles
- 存储客户特有字段
- 支持客户分级管理

### 2. 权限相关表

#### 2.1 角色表 (roles) - 增强版
```sql
新增字段：
- role_type: 系统角色/自定义角色
- data_scope: 数据权限范围（all/department/self等）
```

#### 2.2 权限表 (permissions) - 增强版
```sql
新增字段：
- permission_type: 权限类型（menu/button/api/data）
- parent_id: 父权限（支持树形结构）
- path: 路径（菜单路径或API路径）
- method: HTTP方法
```

#### 2.3 用户权限表 (user_permissions) - 新增
```sql
-- 用户直接分配的权限
- user_id: 用户ID
- permission_id: 权限ID
- permission_type: grant（授予）/ deny（拒绝）
- expires_at: 过期时间（支持临时授权）
```

#### 2.4 数据权限表 (data_permissions) - 新增
```sql
-- 细粒度数据访问控制
- user_id/role_id: 用户或角色
- resource_type: 资源类型（customer/lead/order）
- resource_id: 具体资源ID
- permission_scope: read/write/delete/all
- conditions: JSON条件表达式
```

#### 2.5 角色继承表 (role_inheritance) - 新增
```sql
-- 支持角色继承
- parent_role_id: 父角色
- child_role_id: 子角色
```

---

## 🔄 迁移步骤

### 步骤 1：备份现有数据
```bash
# 备份整个数据库
docker exec shoppro-mysql mysqldump -u shoppro -pShopProDB2024! shoppro_db > backup_$(date +%Y%m%d).sql

# 或仅备份 users 表
docker exec shoppro-mysql mysqldump -u shoppro -pShopProDB2024! shoppro_db users > backup_users_$(date +%Y%m%d).sql
```

### 步骤 2：执行迁移脚本
```bash
# 执行 RBAC 改造脚本
docker exec -i shoppro-mysql mysql -u shoppro -pShopProDB2024! shoppro_db < backend/shoppro-infra/src/main/resources/db/migration_rbac.sql
```

### 步骤 3：验证数据迁移
```sql
-- 检查用户数据是否正确迁移
SELECT COUNT(*) FROM user_profiles;
SELECT COUNT(*) FROM employee_profiles;
SELECT COUNT(*) FROM customer_profiles;

-- 检查视图是否正常工作
SELECT * FROM users LIMIT 10;

-- 检查权限数据
SELECT COUNT(*) FROM permissions;
SELECT COUNT(*) FROM roles;
SELECT COUNT(*) FROM role_permissions;
```

### 步骤 4：重命名原表（可选）
```sql
-- 如果确认迁移成功，可以重命名原表
RENAME TABLE users TO users_backup_20251220;
```

### 步骤 5：更新应用配置
```yaml
# application.yml
mybatis-plus:
  global-config:
    db-config:
      # 如果使用视图，需要关闭表存在性检查
      table-underline: true
```

---

## 🔒 兼容性保证

### 1. 视图兼容
创建了 `users` 视图，完全模拟原 `users` 表结构：
```sql
CREATE OR REPLACE VIEW users AS
SELECT 
  up.id,
  up.username,
  -- ... 其他字段
  CASE 
    WHEN up.user_type = 'admin' THEN 'admin'
    -- 动态获取角色
  END AS role
FROM user_profiles up
LEFT JOIN employee_profiles ep ON up.id = ep.user_id;
```

### 2. 触发器自动同步
```sql
-- 插入 user_profiles 时自动创建对应的扩展表记录
CREATE TRIGGER after_user_insert
AFTER INSERT ON user_profiles
FOR EACH ROW
BEGIN
  IF NEW.user_type = 'employee' THEN
    INSERT INTO employee_profiles (user_id) VALUES (NEW.id);
  END IF;
END;
```

### 3. 代码兼容性
现有代码无需修改，因为：
- ✓ `users` 视图保持了原表结构
- ✓ MyBatis 查询可以继续使用
- ✓ 字段名称保持一致

---

## 💡 使用示例

### 1. 创建新用户（员工）
```java
// 1. 创建基础用户
UserProfile user = new UserProfile();
user.setUsername("zhangsan");
user.setPassword(passwordEncoder.encode("123456"));
user.setUserType(UserType.EMPLOYEE);
userProfileRepository.save(user);

// 2. 创建员工扩展信息（触发器会自动创建，也可以手动更新）
EmployeeProfile employee = employeeProfileRepository.findByUserId(user.getId());
employee.setEmployeeNo("EMP001");
employee.setDepartmentId(10L);
employeeProfileRepository.save(employee);

// 3. 分配角色
UserRole userRole = new UserRole();
userRole.setUserId(user.getId());
userRole.setRoleId(salesRoleId);
userRoleRepository.save(userRole);
```

### 2. 权限检查
```java
// 方式1：使用数据库函数
@Query(value = "SELECT has_permission(:userId, :permCode)", nativeQuery = true)
Boolean hasPermission(@Param("userId") Long userId, @Param("permCode") String permCode);

// 方式2：在代码中检查
public boolean checkPermission(Long userId, String permissionCode) {
    // 检查用户直接权限（拒绝）
    if (userPermissionRepository.existsByUserIdAndPermissionCodeAndType(
        userId, permissionCode, PermissionType.DENY)) {
        return false;
    }
    
    // 检查用户直接权限（授予）
    if (userPermissionRepository.existsByUserIdAndPermissionCodeAndType(
        userId, permissionCode, PermissionType.GRANT)) {
        return true;
    }
    
    // 检查角色权限
    return rolePermissionRepository.existsByUserIdAndPermissionCode(userId, permissionCode);
}
```

### 3. 数据权限过滤
```java
// 根据用户的数据权限范围过滤查询
public List<Customer> getAccessibleCustomers(Long userId) {
    User user = userRepository.findById(userId);
    Role role = user.getRoles().get(0); // 简化示例
    
    switch (role.getDataScope()) {
        case ALL:
            return customerRepository.findAll();
        case DEPARTMENT:
            return customerRepository.findByDepartmentId(user.getDepartmentId());
        case SELF:
            return customerRepository.findByOwnerId(userId);
        default:
            return Collections.emptyList();
    }
}
```

### 4. 临时授权
```java
// 给用户临时授予某个权限（7天后过期）
UserPermission tempPerm = new UserPermission();
tempPerm.setUserId(userId);
tempPerm.setPermissionId(permissionId);
tempPerm.setPermissionType(PermissionType.GRANT);
tempPerm.setExpiresAt(LocalDateTime.now().plusDays(7));
userPermissionRepository.save(tempPerm);
```

---

## 📚 最佳实践

### 1. 权限命名规范
```
格式：<资源>:<操作>
示例：
- customer:list      # 查看客户列表
- customer:create    # 创建客户
- customer:update    # 更新客户
- customer:delete    # 删除客户
- customer:export    # 导出客户
```

### 2. 角色设计建议
```
系统角色（不可删除）：
- super_admin: 超级管理员
- admin: 系统管理员
- manager: 部门经理
- sales: 销售人员
- customer_service: 客服人员

自定义角色（可扩展）：
- senior_sales: 高级销售
- regional_manager: 区域经理
```

### 3. 数据权限范围
```
- all: 所有数据
- department: 本部门数据
- department_and_sub: 本部门及下级部门数据
- self: 仅自己的数据
- custom: 自定义条件
```

### 4. 性能优化建议
```sql
-- 1. 为常用查询添加索引
CREATE INDEX idx_user_type_status ON user_profiles(user_type, status);

-- 2. 使用缓存存储用户权限
@Cacheable(value = "userPermissions", key = "#userId")
public Set<String> getUserPermissions(Long userId);

-- 3. 批量查询权限
SELECT p.code FROM permissions p
WHERE p.id IN (
  SELECT rp.permission_id FROM role_permissions rp
  WHERE rp.role_id IN (
    SELECT ur.role_id FROM user_roles ur WHERE ur.user_id = ?
  )
);
```

### 5. 安全建议
```java
// 1. 敏感操作需要二次验证
@PreAuthorize("hasPermission(#userId, 'user:delete')")
@RequireSecondaryAuth  // 自定义注解，要求输入密码
public void deleteUser(Long userId);

// 2. 记录权限变更日志
@Aspect
public class PermissionAuditAspect {
    @After("@annotation(RequirePermission)")
    public void logPermissionCheck(JoinPoint jp) {
        // 记录权限检查日志
    }
}

// 3. 定期清理过期权限
@Scheduled(cron = "0 0 2 * * ?")  // 每天凌晨2点
public void cleanExpiredPermissions() {
    userPermissionRepository.deleteByExpiresAtBefore(LocalDateTime.now());
}
```

---

## 🚀 后续优化方向

1. **权限缓存**：使用 Redis 缓存用户权限，减少数据库查询
2. **权限树**：前端展示权限树，支持可视化配置
3. **审计日志**：记录所有权限变更操作
4. **权限模板**：预设常用权限组合，快速分配
5. **动态权限**：支持运行时动态注册新权限

---

## 📞 技术支持

如有问题，请查看：
- 数据库迁移脚本：`backend/shoppro-infra/src/main/resources/db/migration_rbac.sql`
- 原始表结构：`backend/shoppro-infra/src/main/resources/db/init.sql`

---

**最后更新时间**：2025-12-20  
**版本**：v1.0.0
