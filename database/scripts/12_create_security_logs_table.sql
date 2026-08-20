-- 安全审计日志表
CREATE TABLE IF NOT EXISTS `security_logs` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键',
  `user_id` BIGINT COMMENT '用户ID',
  `username` VARCHAR(50) COMMENT '用户名',
  `action` VARCHAR(50) NOT NULL COMMENT '操作类型',
  `ip_address` VARCHAR(50) COMMENT 'IP地址',
  `user_agent` VARCHAR(500) COMMENT '用户代理',
  `resource` VARCHAR(200) COMMENT '访问资源',
  `result` VARCHAR(20) COMMENT '结果: SUCCESS/FAILED/DENIED/BLOCKED',
  `failure_reason` VARCHAR(500) COMMENT '失败原因',
  `extra_data` TEXT COMMENT '额外数据(JSON)',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`),
  INDEX `idx_user_id` (`user_id`),
  INDEX `idx_action` (`action`),
  INDEX `idx_ip_address` (`ip_address`),
  INDEX `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='安全审计日志表';
