-- JSON字段优化：将JSON字段拆分为关联表

-- 1. 客户 TABLE IF NOT EXISTS标签表
CREATE `customer_tags` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键',
  `customer_id` BIGINT NOT NULL COMMENT '客户ID',
  `tag` VARCHAR(50) NOT NULL COMMENT '标签',
  `created_by` BIGINT COMMENT '创建人',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`),
  INDEX `idx_customer_id` (`customer_id`),
  INDEX `idx_tag` (`tag`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='客户标签表';

-- 2. 客户偏好设置表
CREATE TABLE IF NOT EXISTS `customer_preferences` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键',
  `customer_id` BIGINT NOT NULL COMMENT '客户ID',
  `preference_key` VARCHAR(50) NOT NULL COMMENT '偏好键',
  `preference_value` VARCHAR(500) COMMENT '偏好值',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  INDEX `idx_customer_id` (`customer_id`),
  UNIQUE KEY `uk_customer_key` (`customer_id`, `preference_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='客户偏好设置表';

-- 3. 产品规格表
CREATE TABLE IF NOT EXISTS `product_specifications` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键',
  `product_id` BIGINT NOT NULL COMMENT '产品ID',
  `spec_name` VARCHAR(50) NOT NULL COMMENT '规格名称',
  `spec_value` VARCHAR(100) NOT NULL COMMENT '规格值',
  `spec_unit` VARCHAR(20) COMMENT '规格单位',
  `is_default` TINYINT DEFAULT 0 COMMENT '是否默认',
  `sort_order` INT DEFAULT 0 COMMENT '排序',
  PRIMARY KEY (`id`),
  INDEX `idx_product_id` (`product_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='产品规格表';

-- 4. 产品特性表
CREATE TABLE IF NOT EXISTS `product_features` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键',
  `product_id` BIGINT NOT NULL COMMENT '产品ID',
  `feature_name` VARCHAR(100) NOT NULL COMMENT '特性名称',
  `feature_value` VARCHAR(500) COMMENT '特性值',
  `feature_type` VARCHAR(20) COMMENT '特性类型: text/image/video',
  `sort_order` INT DEFAULT 0 COMMENT '排序',
  PRIMARY KEY (`id`),
  INDEX `idx_product_id` (`product_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='产品特性表';

-- 迁移现有数据（如果JSON字段有数据的话）
-- 注意：迁移前需要确保原有JSON字段有数据
-- 以下是迁移示例，实际执行时需要根据实际情况调整

-- 迁移客户标签示例
-- INSERT INTO customer_tags (customer_id, tag, created_at)
-- SELECT id, tag, NOW() FROM customers WHERE tags IS NOT NULL AND tags != '[]';

-- 迁移产品规格示例
-- INSERT INTO product_specifications (product_id, spec_name, spec_value, created_at)
-- SELECT id, '规格', specifications, NOW() FROM products WHERE specifications IS NOT NULL;

-- 注意：执行迁移后，原JSON字段可以保留作为备份，不建议直接删除
