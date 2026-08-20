-- 补全多租户功能所需的数据库表

USE shoppro_db;

-- 1. SOP 模板表 (sop_templates)
CREATE TABLE IF NOT EXISTS sop_templates (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  enterprise_id BIGINT NOT NULL COMMENT '所属企业ID',
  name VARCHAR(200) NOT NULL COMMENT 'SOP名称',
  description TEXT COMMENT 'SOP描述',
  steps JSON COMMENT '执行步骤(JSON格式)',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_sop_enterprise(enterprise_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='SOP模板表';

-- 2. 客户 SOP 应用记录表 (customer_sops)
CREATE TABLE IF NOT EXISTS customer_sops (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  customer_id BIGINT NOT NULL COMMENT '客户ID',
  sop_template_id BIGINT NOT NULL COMMENT 'SOP模板ID',
  status VARCHAR(20) DEFAULT 'active' COMMENT '状态: active, completed, terminated',
  current_step INT DEFAULT 1 COMMENT '当前执行步骤',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_cs_customer(customer_id),
  INDEX idx_cs_sop(sop_template_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='客户SOP应用记录表';

-- 3. 销售工作任务表 (work_tasks)
CREATE TABLE IF NOT EXISTS work_tasks (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  enterprise_id BIGINT NOT NULL COMMENT '所属企业ID',
  user_id BIGINT NOT NULL COMMENT '负责人ID',
  customer_id BIGINT COMMENT '关联客户ID',
  customer_sop_id BIGINT COMMENT '关联SOP记录ID',
  type VARCHAR(20) NOT NULL COMMENT '任务类型: sop, manual, ai_suggestion',
  title VARCHAR(200) NOT NULL COMMENT '任务标题',
  description TEXT COMMENT '任务描述',
  status VARCHAR(20) DEFAULT 'pending' COMMENT '状态: pending, completed, cancelled',
  due_time TIMESTAMP NULL COMMENT '截止时间',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_wt_enterprise(enterprise_id),
  INDEX idx_wt_user(user_id),
  INDEX idx_wt_customer(customer_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='销售工作任务表';

-- 4. 渠道码表 (channel_codes)
DROP TABLE IF EXISTS channel_codes;
CREATE TABLE channel_codes (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  enterprise_id BIGINT NOT NULL COMMENT '所属企业ID',
  user_id BIGINT COMMENT '负责人员ID',
  channel_type VARCHAR(50) COMMENT '渠道类型',
  channel_name VARCHAR(100) NOT NULL COMMENT '渠道名称',
  code_url VARCHAR(255) COMMENT '二维码URL',
  description TEXT COMMENT '描述',
  scan_count INT DEFAULT 0 COMMENT '累计扫码次数',
  follow_count INT DEFAULT 0 COMMENT '累计关注次数',
  status TINYINT DEFAULT 1 COMMENT '状态: 1-启用, 0-禁用',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  index idx_channel_enterprise(enterprise_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='渠道码管理表';

-- 5. 渠道码每日统计表 (channel_code_stats)
CREATE TABLE IF NOT EXISTS channel_code_stats (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  channel_code_id BIGINT NOT NULL COMMENT '渠道码ID',
  stat_date DATE NOT NULL COMMENT '统计日期',
  scan_count INT DEFAULT 0 COMMENT '扫码次数',
  follow_count INT DEFAULT 0 COMMENT '关注次数',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_channel_date(channel_code_id, stat_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='渠道码每日统计表';

-- 6. 渠道欢迎语表 (welcome_messages)
CREATE TABLE IF NOT EXISTS welcome_messages (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  channel_code_id BIGINT NOT NULL COMMENT '渠道码ID',
  msg_type VARCHAR(20) NOT NULL COMMENT '消息类型: text, image, link, miniprogram',
  content TEXT COMMENT '消息内容/JSON配置',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_wm_channel(channel_code_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='渠道欢迎语表';

-- 7. 营销裂变任务表 (marketing_fission)
CREATE TABLE IF NOT EXISTS marketing_fission (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(200) NOT NULL COMMENT '任务名称',
  type VARCHAR(50) COMMENT '任务类型: poster, lottery, task_bot',
  config JSON COMMENT '任务配置',
  status TINYINT DEFAULT 1 COMMENT '状态: 1-启用, 0-禁用',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='营销裂变任务表';

-- 8. 插入演示数据
INSERT INTO channel_codes (enterprise_id, user_id, channel_type, channel_name, scan_count, follow_count)
VALUES 
(1, 1, 'wechat', '微信公众号', 150, 45),
(1, 1, 'offline', '线下门店展架', 80, 12),
(1, 1, 'douyin', '抖音短视频', 300, 90),
(1, 1, 'xiaohongshu', '小红书种草', 120, 30);

INSERT INTO channel_code_stats (channel_code_id, stat_date, scan_count, follow_count)
VALUES 
(1, CURDATE(), 25, 8),
(2, CURDATE(), 10, 2),
(3, CURDATE(), 50, 15),
(4, CURDATE(), 20, 5);
