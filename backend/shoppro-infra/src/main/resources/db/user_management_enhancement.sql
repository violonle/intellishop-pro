-- ==========================================
-- 用户与权限管理优化 - 数据库变更（修正版）
-- ==========================================

USE shoppro_db;

-- 1. 为 users 表添加 enterprise_id 字段
-- 用于企业管理员和销售人员关联企业
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS enterprise_id BIGINT COMMENT '关联企业ID（企业管理员和销售人员专用）',
ADD INDEX IF NOT EXISTS idx_enterprise_id (enterprise_id);

-- 2. 确保 orders 表有 sales_user_id 字段（用于统计成交单数）
-- 如果表不存在或字段不存在，则添加
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS sales_user_id BIGINT COMMENT '销售人员ID',
ADD INDEX IF NOT EXISTS idx_sales_user (sales_user_id);

-- 3. 验证变更
SELECT '=== users 表结构 ===' as info;
DESCRIBE users;

SELECT '=== orders 表结构 ===' as info;
DESCRIBE orders;
