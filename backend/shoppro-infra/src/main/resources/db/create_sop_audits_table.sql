-- Create sop_audits table for SOP execution audit
CREATE TABLE IF NOT EXISTS `sop_audits` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `tenant_id` BIGINT NOT NULL COMMENT '租户ID',
  `sop_template_id` BIGINT COMMENT 'SOP模板ID',
  `rule_name` VARCHAR(255) COMMENT '规则名称',
  `trigger_event` VARCHAR(50) COMMENT '触发事件: manual/scheduled/event',
  `target_type` VARCHAR(50) COMMENT '目标类型: customer/lead/order/task',
  `target_name` VARCHAR(255) COMMENT '目标名称',
  `target_id` BIGINT COMMENT '目标ID',
  `status` VARCHAR(20) DEFAULT 'pending' COMMENT '状态: success/failed/pending/running',
  `error_message` TEXT COMMENT '错误信息',
  `executed_at` DATETIME COMMENT '执行时间',
  `duration` INT COMMENT '耗时(毫秒)',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`),
  INDEX `idx_tenant_id` (`tenant_id`),
  INDEX `idx_status` (`status`),
  INDEX `idx_executed_at` (`executed_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='SOP执行审计表';
