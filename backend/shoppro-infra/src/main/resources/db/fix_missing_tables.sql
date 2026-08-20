-- 修复缺失的数据表
USE shoppro_db;

-- 1. 创建 subscription_plans 表（订阅套餐表）
CREATE TABLE IF NOT EXISTS subscription_plans (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL COMMENT '套餐名称',
  code VARCHAR(50) UNIQUE NOT NULL COMMENT '套餐代码',
  description TEXT COMMENT '套餐描述',
  price DECIMAL(10,2) NOT NULL DEFAULT 0 COMMENT '价格',
  duration_days INT NOT NULL DEFAULT 365 COMMENT '有效天数',
  features JSON COMMENT '功能特性列表',
  max_users INT DEFAULT 10 COMMENT '最大用户数',
  max_storage_gb INT DEFAULT 10 COMMENT '最大存储空间(GB)',
  status TINYINT DEFAULT 1 COMMENT '状态: 1-有效, 0-无效',
  sort_order INT DEFAULT 0 COMMENT '排序',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_code (code),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='订阅套餐表';

-- 2. 创建 enterprises 表（企业表）
CREATE TABLE IF NOT EXISTS enterprises (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(200) NOT NULL COMMENT '企业名称',
  code VARCHAR(50) UNIQUE COMMENT '企业代码',
  legal_name VARCHAR(200) COMMENT '企业法定名称',
  contact_person VARCHAR(100) COMMENT '联系人',
  contact_phone VARCHAR(20) COMMENT '联系电话',
  contact_email VARCHAR(100) COMMENT '联系邮箱',
  address VARCHAR(500) COMMENT '企业地址',
  logo_url VARCHAR(255) COMMENT 'Logo URL',
  status TINYINT DEFAULT 1 COMMENT '状态: 1-正常, 0-禁用',
  subscription_plan_id BIGINT COMMENT '订阅套餐ID',
  subscription_expire_at TIMESTAMP NULL COMMENT '订阅过期时间',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_code (code),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='企业表';

-- 3. 插入默认订阅套餐数据
INSERT INTO subscription_plans (name, code, description, price, duration_days, features, max_users, max_storage_gb, status, sort_order)
VALUES 
('基础版', 'basic', '适合小型团队的基础功能套餐', 0.00, 365, 
 '["用户管理", "客户管理", "基础报表"]', 10, 5, 1, 1),
('专业版', 'professional', '适合中型企业的专业功能套餐', 9999.00, 365, 
 '["用户管理", "客户管理", "高级报表", "AI助手", "数据分析"]', 50, 50, 1, 2),
('企业版', 'enterprise', '适合大型企业的完整功能套餐', 29999.00, 365, 
 '["用户管理", "客户管理", "高级报表", "AI助手", "数据分析", "定制开发", "专属服务"]', 200, 200, 1, 3)
ON DUPLICATE KEY UPDATE updated_at = NOW();

-- 4. 创建默认企业（用于系统管理员）
INSERT INTO enterprises (name, code, legal_name, status, subscription_plan_id)
VALUES ('ShopPro 平台', 'platform', 'ShopPro 智能营销系统', 1, 
  (SELECT id FROM subscription_plans WHERE code = 'enterprise' LIMIT 1))
ON DUPLICATE KEY UPDATE updated_at = NOW();
