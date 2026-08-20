-- 修复集成测试发现的数据库问题
-- 日期：2025-12-21
-- 问题：leads表缺少first_contact_time字段

-- 1. 添加first_contact_time字段到leads表
ALTER TABLE leads 
ADD COLUMN first_contact_time DATETIME COMMENT '首次联系时间' AFTER follow_up_date;

-- 2. 为现有数据设置默认值（使用created_at作为首次联系时间）
UPDATE leads 
SET first_contact_time = created_at 
WHERE first_contact_time IS NULL;

-- 3. 添加索引以提高查询性能
CREATE INDEX idx_first_contact_time ON leads(first_contact_time);

-- 验证字段是否添加成功
SELECT COLUMN_NAME, DATA_TYPE, COLUMN_COMMENT 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'shoppro' 
  AND TABLE_NAME = 'leads' 
  AND COLUMN_NAME = 'first_contact_time';
