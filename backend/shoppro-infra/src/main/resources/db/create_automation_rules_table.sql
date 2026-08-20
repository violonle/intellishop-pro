-- Create automation_rules table for automation rules
CREATE TABLE IF NOT EXISTS `automation_rules` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `tenant_id` BIGINT NOT NULL COMMENT '租户ID',
  `name` VARCHAR(255) NOT NULL COMMENT '规则名称',
  `description` TEXT COMMENT '规则描述',
  `trigger_event` VARCHAR(50) NOT NULL COMMENT '触发事件: customer_created, lead_created, scheduled, etc.',
  `conditions` TEXT COMMENT '条件(JSON)',
  `actions` TEXT COMMENT '动作(JSON)',
  `is_active` TINYINT DEFAULT 1 COMMENT '是否启用: 0-禁用, 1-启用',
  `execution_count` INT DEFAULT 0 COMMENT '执行次数',
  `last_executed_at` DATETIME COMMENT '最后执行时间',
  `priority` INT DEFAULT 0 COMMENT '优先级',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  INDEX `idx_tenant_id` (`tenant_id`),
  INDEX `idx_trigger_event` (`trigger_event`),
  INDEX `idx_is_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='自动化规则表';
