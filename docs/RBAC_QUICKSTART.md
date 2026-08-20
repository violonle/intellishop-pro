# RBAC 权限系统改造 - 快速开始

## 🚀 快速执行（推荐）

### 一键迁移
```bash
# 在项目根目录执行
./scripts/migrate_rbac.sh
```

这个脚本会自动完成：
- ✅ 检查 MySQL 容器状态
- ✅ 备份整个数据库
- ✅ 备份 users 表
- ✅ 执行 RBAC 迁移
- ✅ 验证迁移结果
- ✅ 显示详细报告

---

## 📋 手动执行步骤

### 步骤 1：备份数据库
```bash
docker exec shoppro-mysql mysqldump -u shoppro -pShopProDB2024! shoppro_db > backup_$(date +%Y%m%d).sql
```

### 步骤 2：执行迁移
```bash
docker exec -i shoppro-mysql mysql -u shoppro -pShopProDB2024! shoppro_db < backend/shoppro-infra/src/main/resources/db/migration_rbac.sql
```

### 步骤 3：运行测试
```bash
docker exec -i shoppro-mysql mysql -u shoppro -pShopProDB2024! shoppro_db < backend/shoppro-infra/src/main/resources/db/test_rbac.sql
```

---

## 🔙 回滚操作

如果迁移后发现问题，可以快速回滚：

```bash
# 使用脚本回滚
./scripts/migrate_rbac.sh rollback ./backups/shoppro_db_backup_YYYYMMDD_HHMMSS.sql

# 或手动回滚
docker exec -i shoppro-mysql mysql -u shoppro -pShopProDB2024! shoppro_db < backup_YYYYMMDD.sql
```

---

## 📊 验证迁移结果

### 方法 1：使用测试脚本
```bash
docker exec -i shoppro-mysql mysql -u shoppro -pShopProDB2024! shoppro_db < backend/shoppro-infra/src/main/resources/db/test_rbac.sql
```

### 方法 2：手动检查
```bash
# 进入 MySQL 容器
docker exec -it shoppro-mysql mysql -u shoppro -pShopProDB2024! shoppro_db

# 检查新表
SHOW TABLES LIKE '%profile%';
SHOW TABLES LIKE '%permission%';

# 检查数据
SELECT COUNT(*) FROM user_profiles;
SELECT COUNT(*) FROM employee_profiles;
SELECT COUNT(*) FROM permissions;

# 检查视图
SELECT * FROM users LIMIT 5;
```

---

## 📁 相关文件

| 文件 | 说明 |
|------|------|
| `docs/RBAC_MIGRATION_GUIDE.md` | 详细改造文档 |
| `backend/shoppro-infra/src/main/resources/db/migration_rbac.sql` | 迁移脚本 |
| `backend/shoppro-infra/src/main/resources/db/test_rbac.sql` | 测试脚本 |
| `scripts/migrate_rbac.sh` | 一键执行脚本 |
| `backups/` | 备份文件目录 |

---

## ⚠️ 注意事项

1. **建议先在测试环境执行**
2. **确保已备份数据**
3. **迁移期间暂停业务访问**
4. **迁移后重启后端服务**
5. **保留备份文件至少7天**

---

## 🆘 常见问题

### Q1: 迁移后登录失败？
**A:** 检查 users 视图是否创建成功：
```sql
SELECT * FROM information_schema.views WHERE table_name = 'users';
```

### Q2: 权限检查不生效？
**A:** 确认权限数据已初始化：
```sql
SELECT COUNT(*) FROM permissions;
SELECT COUNT(*) FROM role_permissions;
```

### Q3: 如何添加新权限？
**A:** 
```sql
INSERT INTO permissions (name, code, permission_type, category, resource, action)
VALUES ('新功能', 'feature:new', 'menu', 'business', 'feature', 'view');
```

### Q4: 如何给用户分配角色？
**A:**
```sql
INSERT INTO user_roles (user_id, role_id)
VALUES (用户ID, 角色ID);
```

---

## 📞 获取帮助

- 查看详细文档：`docs/RBAC_MIGRATION_GUIDE.md`
- 查看迁移脚本：`backend/shoppro-infra/src/main/resources/db/migration_rbac.sql`
- 运行测试验证：`backend/shoppro-infra/src/main/resources/db/test_rbac.sql`

---

**最后更新**：2025-12-20
