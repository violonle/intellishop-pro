-- ----------------------------------------------------------------
-- Table structure for channel_codes (Channel QR Codes)
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `channel_codes` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT 'Primary Key',
  `user_id` bigint(20) NOT NULL COMMENT 'Owner User ID (Sales)',
  `channel_type` varchar(50) NOT NULL COMMENT 'Channel Type: offline, wechat, douyin, xiaohongshu',
  `channel_name` varchar(100) NOT NULL COMMENT 'Channel Name',
  `code_url` varchar(500) DEFAULT NULL COMMENT 'QR Code URL or Content',
  `description` varchar(255) DEFAULT NULL COMMENT 'Description',
  `scan_count` int(11) DEFAULT '0' COMMENT 'Total Scan Count',
  `follow_count` int(11) DEFAULT '0' COMMENT 'Total Follow Count',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP COMMENT 'Creation Time',
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Update Time',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_user_channel` (`user_id`, `channel_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Customer Acquisition Channel Codes';

-- ----------------------------------------------------------------
-- Table structure for channel_code_stats
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `channel_code_stats` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `channel_code_id` bigint(20) NOT NULL,
  `stat_date` date NOT NULL,
  `scan_count` int(11) DEFAULT '0',
  `follow_count` int(11) DEFAULT '0',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY `uk_channel_date` (`channel_code_id`, `stat_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Channel Code Daily Statistics';

-- ----------------------------------------------------------------
-- Table structure for welcome_messages
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `welcome_messages` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT 'Primary Key',
  `channel_code_id` bigint(20) NOT NULL COMMENT 'Related Channel Code ID',
  `msg_type` varchar(20) NOT NULL DEFAULT 'text' COMMENT 'Message Type: text, image, link, miniprogram',
  `content` text COMMENT 'Message Content or JSON config',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP COMMENT 'Creation Time',
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Update Time',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Channel Welcome Messages';

-- ----------------------------------------------------------------
-- Table structure for marketing_fission
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `marketing_fission` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT 'Primary Key',
  `name` varchar(100) NOT NULL COMMENT 'Fission Activity Name',
  `type` varchar(50) NOT NULL COMMENT 'Type: poster, lottery, task_bot',
  `config` text COMMENT 'JSON Configuration',
  `status` int(11) DEFAULT '1' COMMENT 'Status: 1=Active, 0=Inactive',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP COMMENT 'Creation Time',
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Update Time',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Marketing Fission Tasks';

-- ----------------------------------------------------------------
-- Table structure for sop_templates (Standard Operating Procedures)
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `sop_templates` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT 'Primary Key',
  `name` varchar(100) NOT NULL COMMENT 'SOP Name',
  `description` varchar(255) DEFAULT NULL COMMENT 'Description',
  `steps` text COMMENT 'JSON Array of Steps',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP COMMENT 'Creation Time',
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Update Time',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='SOP Templates';

-- ----------------------------------------------------------------
-- Table structure for customer_sops
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `customer_sops` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `customer_id` bigint(20) NOT NULL,
  `sop_template_id` bigint(20) NOT NULL,
  `status` varchar(20) DEFAULT 'active' COMMENT 'active, completed, terminated',
  `current_step` int(11) DEFAULT '1',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Customer SOP Mapping';

-- ----------------------------------------------------------------
-- Table structure for work_tasks (Sales Tasks/To-Do)
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `work_tasks` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT 'Primary Key',
  `user_id` bigint(20) NOT NULL COMMENT 'Assignee User ID',
  `customer_id` bigint(20) DEFAULT NULL COMMENT 'Related Customer ID',
  `customer_sop_id` bigint(20) DEFAULT NULL COMMENT 'Related Customer SOP ID',
  `type` varchar(50) NOT NULL DEFAULT 'manual' COMMENT 'Type: sop, manual, ai_suggestion',
  `title` varchar(255) NOT NULL COMMENT 'Task Title',
  `description` text COMMENT 'Task Description',
  `status` varchar(20) DEFAULT 'pending' COMMENT 'Status: pending, completed, cancelled',
  `due_time` datetime DEFAULT NULL COMMENT 'Due Time',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP COMMENT 'Creation Time',
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Update Time',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Sales Work Tasks';
