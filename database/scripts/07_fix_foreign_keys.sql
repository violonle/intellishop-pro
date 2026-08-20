-- =====================================================
-- ShopPro 数据库外键修复迁移脚本
-- 日期: 2026-03-04
-- 说明: 修复外键引用 users_backup_20251220 的问题
-- =====================================================

-- 关闭外键检查以便修改
SET FOREIGN_KEY_CHECKS = 0;

-- =====================================================
-- 1. 修复 customers 表外键
-- =====================================================
-- 删除旧的外键约束
ALTER TABLE `customers` DROP FOREIGN KEY IF EXISTS `customers_ibfk_1`;
ALTER TABLE `customers` DROP FOREIGN KEY IF EXISTS `customers_ibfk_2`;

-- 添加新的外键约束（引用 user_profiles 表）
ALTER TABLE `customers` 
    ADD CONSTRAINT `fk_customers_created_by` 
    FOREIGN KEY (`created_by`) REFERENCES `user_profiles` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;
    
ALTER TABLE `customers` 
    ADD CONSTRAINT `fk_customers_assigned_to` 
    FOREIGN KEY (`assigned_to`) REFERENCES `user_profiles` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- =====================================================
-- 2. 修复 leads 表外键
-- =====================================================
ALTER TABLE `leads` DROP FOREIGN KEY IF EXISTS `leads_ibfk_1`;
ALTER TABLE `leads` DROP FOREIGN KEY IF EXISTS `leads_ibfk_2`;

ALTER TABLE `leads` 
    ADD CONSTRAINT `fk_leads_created_by` 
    FOREIGN KEY (`created_by`) REFERENCES `user_profiles` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;
    
ALTER TABLE `leads` 
    ADD CONSTRAINT `fk_leads_assigned_to` 
    FOREIGN KEY (`assigned_to`) REFERENCES `user_profiles` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- =====================================================
-- 3. 修复 follow_up_records 表外键
-- =====================================================
ALTER TABLE `follow_up_records` DROP FOREIGN KEY IF EXISTS `follow_up_records_ibfk_1`;
ALTER TABLE `follow_up_records` DROP FOREIGN KEY IF EXISTS `follow_up_records_ibfk_2`;

ALTER TABLE `follow_up_records` 
    ADD CONSTRAINT `fk_follow_up_created_by` 
    FOREIGN KEY (`created_by`) REFERENCES `user_profiles` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;
    
ALTER TABLE `follow_up_records` 
    ADD CONSTRAINT `fk_follow_up_user_id` 
    FOREIGN KEY (`user_id`) REFERENCES `user_profiles` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- =====================================================
-- 4. 修复 departments 表外键
-- =====================================================
ALTER TABLE `departments` DROP FOREIGN KEY IF EXISTS `departments_ibfk_1`;

ALTER TABLE `departments` 
    ADD CONSTRAINT `fk_departments_manager` 
    FOREIGN KEY (`manager_id`) REFERENCES `user_profiles` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- =====================================================
-- 5. 为 orders 表添加缺失的外键约束
-- =====================================================
ALTER TABLE `orders` DROP FOREIGN KEY IF EXISTS `fk_orders_customer`;
ALTER TABLE `orders` DROP FOREIGN KEY IF EXISTS `fk_orders_created_by`;

ALTER TABLE `orders` 
    ADD CONSTRAINT `fk_orders_customer` 
    FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
    
ALTER TABLE `orders` 
    ADD CONSTRAINT `fk_orders_created_by` 
    FOREIGN KEY (`created_by`) REFERENCES `user_profiles` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- =====================================================
-- 6. 为 order_items 表添加缺失的外键约束
-- =====================================================
ALTER TABLE `order_items` DROP FOREIGN KEY IF EXISTS `fk_order_items_order`;
ALTER TABLE `order_items` DROP FOREIGN KEY IF EXISTS `fk_order_items_product`;

ALTER TABLE `order_items` 
    ADD CONSTRAINT `fk_order_items_order` 
    FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
    
ALTER TABLE `order_items` 
    ADD CONSTRAINT `fk_order_items_product` 
    FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- =====================================================
-- 7. 为 customer_sops 表添加缺失的外键约束
-- =====================================================
ALTER TABLE `customer_sops` DROP FOREIGN KEY IF EXISTS `fk_customer_sops_customer`;
ALTER TABLE `customer_sops` DROP FOREIGN KEY IF EXISTS `fk_customer_sops_template`;

ALTER TABLE `customer_sops` 
    ADD CONSTRAINT `fk_customer_sops_customer` 
    FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- =====================================================
-- 8. 为 work_tasks 表添加缺失的外键约束
-- =====================================================
ALTER TABLE `work_tasks` DROP FOREIGN KEY IF EXISTS `fk_work_tasks_customer`;
ALTER TABLE `work_tasks` DROP FOREIGN KEY IF EXISTS `fk_work_tasks_user`;

ALTER TABLE `work_tasks` 
    ADD CONSTRAINT `fk_work_tasks_customer` 
    FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;
    
ALTER TABLE `work_tasks` 
    ADD CONSTRAINT `fk_work_tasks_user` 
    FOREIGN KEY (`user_id`) REFERENCES `user_profiles` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- =====================================================
-- 9. 清理数据：确保引用完整性
-- =====================================================
UPDATE `customers` SET `created_by` = NULL WHERE `created_by` IS NOT NULL AND `created_by` NOT IN (SELECT id FROM `user_profiles`);
UPDATE `customers` SET `assigned_to` = NULL WHERE `assigned_to` IS NOT NULL AND `assigned_to` NOT IN (SELECT id FROM `user_profiles`);

UPDATE `leads` SET `created_by` = NULL WHERE `created_by` IS NOT NULL AND `created_by` NOT IN (SELECT id FROM `user_profiles`);
UPDATE `leads` SET `assigned_to` = NULL WHERE `assigned_to` IS NOT NULL AND `assigned_to` NOT IN (SELECT id FROM `user_profiles`);

UPDATE `follow_up_records` SET `created_by` = NULL WHERE `created_by` IS NOT NULL AND `created_by` NOT IN (SELECT id FROM `user_profiles`);
UPDATE `follow_up_records` SET `user_id` = NULL WHERE `user_id` IS NOT NULL AND `user_id` NOT IN (SELECT id FROM `user_profiles`);

UPDATE `departments` SET `manager_id` = NULL WHERE `manager_id` IS NOT NULL AND `manager_id` NOT IN (SELECT id FROM `user_profiles`);

-- =====================================================
-- 10. 添加缺失的审计字段
-- =====================================================
ALTER TABLE `orders` ADD COLUMN IF NOT EXISTS `deleted` TINYINT DEFAULT 0 COMMENT '逻辑删除标记';
ALTER TABLE `orders` ADD COLUMN IF NOT EXISTS `updated_by` BIGINT DEFAULT NULL COMMENT '更新人ID';
ALTER TABLE `orders` ADD COLUMN IF NOT EXISTS `version` INT DEFAULT 1 COMMENT '版本号';

ALTER TABLE `order_items` ADD COLUMN IF NOT EXISTS `deleted` TINYINT DEFAULT 0 COMMENT '逻辑删除标记';
ALTER TABLE `order_items` ADD COLUMN IF NOT EXISTS `updated_by` BIGINT DEFAULT NULL COMMENT '更新人ID';
ALTER TABLE `order_items` ADD COLUMN IF NOT EXISTS `version` INT DEFAULT 1 COMMENT '版本号';

ALTER TABLE `leads` ADD COLUMN IF NOT EXISTS `deleted` TINYINT DEFAULT 0 COMMENT '逻辑删除标记';
ALTER TABLE `leads` ADD COLUMN IF NOT EXISTS `updated_by` BIGINT DEFAULT NULL COMMENT '更新人ID';
ALTER TABLE `leads` ADD COLUMN IF NOT EXISTS `version` INT DEFAULT 1 COMMENT '版本号';

ALTER TABLE `follow_up_records` ADD COLUMN IF NOT EXISTS `deleted` TINYINT DEFAULT 0 COMMENT '逻辑删除标记';
ALTER TABLE `follow_up_records` ADD COLUMN IF NOT EXISTS `updated_by` BIGINT DEFAULT NULL COMMENT '更新人ID';
ALTER TABLE `follow_up_records` ADD COLUMN IF NOT EXISTS `version` INT DEFAULT 1 COMMENT '版本号';

-- =====================================================
-- 11. 添加缺失的业务字段
-- =====================================================
ALTER TABLE `orders` ADD COLUMN IF NOT EXISTS `delivery_address` VARCHAR(500) DEFAULT NULL COMMENT '收货地址';
ALTER TABLE `orders` ADD COLUMN IF NOT EXISTS `invoice_info` JSON DEFAULT NULL COMMENT '发票信息';

ALTER TABLE `customers` ADD COLUMN IF NOT EXISTS `total_purchase_amount` DECIMAL(15,2) DEFAULT 0.00 COMMENT '累计消费金额';
ALTER TABLE `customers` ADD COLUMN IF NOT EXISTS `last_order_at` TIMESTAMP NULL DEFAULT NULL COMMENT '最后下单时间';

ALTER TABLE `leads` ADD COLUMN IF NOT EXISTS `lost_reason` VARCHAR(500) DEFAULT NULL COMMENT '丢失原因';

ALTER TABLE `products` ADD COLUMN IF NOT EXISTS `weight` DECIMAL(10,3) DEFAULT NULL COMMENT '重量(kg)';
ALTER TABLE `products` ADD COLUMN IF NOT EXISTS `volume` DECIMAL(10,3) DEFAULT NULL COMMENT '体积(m³)';

-- =====================================================
-- 12. 优化索引
-- =====================================================
DROP INDEX IF EXISTS `idx_customers_created` ON `customers`;
DROP INDEX IF EXISTS `idx_customers_assigned` ON `customers`;

CREATE INDEX IF NOT EXISTS `idx_customers_status_level` ON `customers` (`status`, `level`);
CREATE INDEX IF NOT EXISTS `idx_customers_assigned_status` ON `customers` (`assigned_to`, `status`);
CREATE INDEX IF NOT EXISTS `idx_leads_status_created` ON `leads` (`status`, `created_at`);
CREATE INDEX IF NOT EXISTS `idx_orders_customer_status` ON `orders` (`customer_id`, `status`);
CREATE INDEX IF NOT EXISTS `idx_follow_up_customer_time` ON `follow_up_records` (`customer_id`, `follow_up_time`);

-- 恢复外键检查
SET FOREIGN_KEY_CHECKS = 1;

-- =====================================================
-- 验证迁移结果
-- =====================================================
SELECT 
    'customers' AS table_name,
    COUNT(*) AS total_records,
    SUM(CASE WHEN created_by IS NOT NULL AND created_by NOT IN (SELECT id FROM user_profiles) THEN 1 ELSE 0 END) AS invalid_created_by,
    SUM(CASE WHEN assigned_to IS NOT NULL AND assigned_to NOT IN (SELECT id FROM user_profiles) THEN 1 ELSE 0 END) AS invalid_assigned_to
FROM customers
UNION ALL
SELECT 
    'leads' AS table_name,
    COUNT(*) AS total_records,
    SUM(CASE WHEN created_by IS NOT NULL AND created_by NOT IN (SELECT id FROM user_profiles) THEN 1 ELSE 0 END) AS invalid_created_by,
    SUM(CASE WHEN assigned_to IS NOT NULL AND assigned_to NOT IN (SELECT id FROM user_profiles) THEN 1 ELSE 0 END) AS invalid_assigned_to
FROM leads;

-- 显示所有外键
SELECT 
    TABLE_NAME,
    CONSTRAINT_NAME,
    REFERENCED_TABLE_NAME
FROM information_schema.KEY_COLUMN_USAGE
WHERE TABLE_SCHEMA = 'shoppro_db'
AND REFERENCED_TABLE_NAME IS NOT NULL
ORDER BY TABLE_NAME;
