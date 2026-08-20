-- 修复enterprises表缺失的字段
-- 前端需要的字段：contact, phone, productCount等

ALTER TABLE enterprises
ADD COLUMN IF NOT EXISTS contact VARCHAR(100) COMMENT '联系人' AFTER name,
ADD COLUMN IF NOT EXISTS phone VARCHAR(20) COMMENT '联系电话' AFTER contact,
ADD COLUMN IF NOT EXISTS product_count INT DEFAULT 0 COMMENT '商品数量' AFTER subscription_plan_id;

-- 更新默认数据
UPDATE enterprises SET contact = '系统管理员', phone = '13800000000' WHERE id = 1;
