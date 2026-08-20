-- 添加缺失的数据库字段

-- 1. orders 表添加字段
ALTER TABLE `orders` ADD COLUMN `delivery_address` VARCHAR(500) NULL COMMENT '收货地址' AFTER `status`;
ALTER TABLE `orders` ADD COLUMN `invoice_info` VARCHAR(500) NULL COMMENT '发票信息' AFTER `delivery_address`;

-- 2. customers 表添加字段
ALTER TABLE `customers` ADD COLUMN `total_purchase_amount` DECIMAL(15,2) DEFAULT 0 COMMENT '累计消费金额' AFTER `lifetime_value`;
ALTER TABLE `customers` ADD COLUMN `last_order_at` DATETIME NULL COMMENT '最后下单时间' AFTER `total_purchase_amount`;

-- 3. leads 表添加字段
ALTER TABLE `leads` ADD COLUMN `lost_reason` VARCHAR(500) NULL COMMENT '丢失原因' AFTER `status`;
ALTER TABLE `leads` ADD COLUMN `lost_at` DATETIME NULL COMMENT '丢失时间' AFTER `lost_reason`;
ALTER TABLE `leads` ADD COLUMN `converted_at` DATETIME NULL COMMENT '转化时间' AFTER `lost_at`;
ALTER TABLE `leads` ADD COLUMN `converted_customer_id` BIGINT NULL COMMENT '转化后的客户ID' AFTER `converted_at`;

-- 4. products 表添加字段
ALTER TABLE `products` ADD COLUMN `weight` DECIMAL(10,2) NULL COMMENT '重量(kg)' AFTER `stock`;
ALTER TABLE `products` ADD COLUMN `volume` DECIMAL(10,2) NULL COMMENT '体积(m³)' AFTER `weight`;
ALTER TABLE `products` ADD COLUMN `barcode` VARCHAR(50) NULL COMMENT '条形码' AFTER `volume`;

-- 5. 为 orders, order_items, customer_sops 添加审计字段
ALTER TABLE `orders` ADD COLUMN `deleted` TINYINT DEFAULT 0 COMMENT '逻辑删除' AFTER `updated_at`;
ALTER TABLE `order_items` ADD COLUMN `deleted` TINYINT DEFAULT 0 COMMENT '逻辑删除' AFTER `updated_at`;
ALTER TABLE `customer_sops` ADD COLUMN `deleted` TINYINT DEFAULT 0 COMMENT '逻辑删除' AFTER `updated_at`;
ALTER TABLE `leads` ADD COLUMN `deleted` TINYINT DEFAULT 0 COMMENT '逻辑删除' AFTER `converted_customer_id`;
ALTER TABLE `follow_up_records` ADD COLUMN `deleted` TINYINT DEFAULT 0 COMMENT '逻辑删除' AFTER `created_at`;

-- 6. 添加索引优化查询性能
CREATE INDEX idx_customers_last_order_at ON `customers`(`last_order_at`);
CREATE INDEX idx_orders_delivery_address ON `orders`(`delivery_address`);
CREATE INDEX idx_leads_lost_reason ON `leads`(`lost_reason`);
CREATE INDEX idx_leads_converted_at ON `leads`(`converted_at`);
