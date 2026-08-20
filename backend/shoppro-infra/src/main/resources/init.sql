-- ShopPro Database Initialization Script
-- =====================================

-- 创建数据库
CREATE DATABASE IF NOT EXISTS shoppro CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE shoppro;

-- ============= 用户相关表 =============

-- 用户表
CREATE TABLE IF NOT EXISTS users (
  id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '用户ID',
  username VARCHAR(50) UNIQUE NOT NULL COMMENT '用户名',
  email VARCHAR(100) UNIQUE NOT NULL COMMENT '邮箱',
  phone VARCHAR(20) UNIQUE COMMENT '手机号',
  password VARCHAR(255) NOT NULL COMMENT '密码（加密）',
  name VARCHAR(100) COMMENT '真实姓名',
  avatar VARCHAR(255) COMMENT '头像URL',
  role VARCHAR(50) DEFAULT 'salesman' COMMENT '角色: admin, manager, salesman',
  status INT DEFAULT 1 COMMENT '状态: 1=正常, 0=禁用',
  last_login TIMESTAMP COMMENT '最后登录时间',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '修改时间',
  INDEX idx_username (username),
  INDEX idx_email (email),
  INDEX idx_status (status)
) COMMENT '用户表' ENGINE=InnoDB;

-- ============= 线索管理表 =============

-- 线索表
CREATE TABLE IF NOT EXISTS leads (
  id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '线索ID',
  name VARCHAR(100) NOT NULL COMMENT '客户名称',
  phone VARCHAR(20) COMMENT '电话',
  email VARCHAR(100) COMMENT '邮箱',
  company VARCHAR(100) COMMENT '公司名称',
  source VARCHAR(50) COMMENT '线索来源: phone, email, website, referral, ad, other',
  status VARCHAR(50) DEFAULT 'pending' COMMENT '状态: pending, contacted, qualified, converted, lost',
  priority VARCHAR(20) DEFAULT 'medium' COMMENT '优先级: high, medium, low',
  assigned_to BIGINT COMMENT '分配给（用户ID）',
  notes LONGTEXT COMMENT '备注',
  created_by BIGINT NOT NULL COMMENT '创建人',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '修改时间',
  INDEX idx_status (status),
  INDEX idx_priority (priority),
  INDEX idx_assigned (assigned_to),
  INDEX idx_created_by (created_by),
  FOREIGN KEY (assigned_to) REFERENCES users(id),
  FOREIGN KEY (created_by) REFERENCES users(id)
) COMMENT '线索表' ENGINE=InnoDB;

-- 线索跟进记录表
CREATE TABLE IF NOT EXISTS lead_followups (
  id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '跟进ID',
  lead_id BIGINT NOT NULL COMMENT '线索ID',
  followup_user_id BIGINT NOT NULL COMMENT '跟进人ID',
  followup_date TIMESTAMP NOT NULL COMMENT '跟进日期',
  followup_type VARCHAR(50) COMMENT '跟进方式: call, email, meeting, wechat, sms',
  content LONGTEXT COMMENT '跟进内容',
  next_followup TIMESTAMP COMMENT '下次跟进时间',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_lead_id (lead_id),
  FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE CASCADE
) COMMENT '线索跟进记录' ENGINE=InnoDB;

-- ============= 客户管理表 =============

-- 客户表
CREATE TABLE IF NOT EXISTS customers (
  id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '客户ID',
  name VARCHAR(100) NOT NULL COMMENT '客户名称',
  phone VARCHAR(20) COMMENT '电话',
  email VARCHAR(100) COMMENT '邮箱',
  company VARCHAR(100) COMMENT '公司名称',
  industry VARCHAR(50) COMMENT '行业',
  status VARCHAR(50) DEFAULT 'active' COMMENT '状态: active, inactive, lost',
  total_amount DECIMAL(12, 2) DEFAULT 0 COMMENT '总消费金额',
  orders INT DEFAULT 0 COMMENT '订单数',
  owner_id BIGINT COMMENT '客户经理ID',
  address VARCHAR(255) COMMENT '地址',
  notes LONGTEXT COMMENT '备注',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_owner_id (owner_id),
  INDEX idx_status (status),
  FOREIGN KEY (owner_id) REFERENCES users(id)
) COMMENT '客户表' ENGINE=InnoDB;

-- 客户联系人表
CREATE TABLE IF NOT EXISTS customer_contacts (
  id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '联系人ID',
  customer_id BIGINT NOT NULL COMMENT '客户ID',
  name VARCHAR(100) NOT NULL COMMENT '联系人名称',
  phone VARCHAR(20) COMMENT '电话',
  email VARCHAR(100) COMMENT '邮箱',
  position VARCHAR(50) COMMENT '职位',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_customer_id (customer_id),
  FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
) COMMENT '客户联系人' ENGINE=InnoDB;

-- ============= 产品管理表 =============

-- 产品分类表
CREATE TABLE IF NOT EXISTS product_categories (
  id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '分类ID',
  name VARCHAR(100) NOT NULL COMMENT '分类名称',
  description VARCHAR(255) COMMENT '描述',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) COMMENT '产品分类' ENGINE=InnoDB;

-- 产品表
CREATE TABLE IF NOT EXISTS products (
  id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '产品ID',
  name VARCHAR(100) NOT NULL COMMENT '产品名称',
  sku VARCHAR(50) UNIQUE NOT NULL COMMENT 'SKU编码',
  price DECIMAL(12, 2) NOT NULL COMMENT '价格',
  stock INT DEFAULT 0 COMMENT '库存',
  category_id BIGINT COMMENT '分类ID',
  image VARCHAR(255) COMMENT '产品图片URL',
  description LONGTEXT COMMENT '产品描述',
  status INT DEFAULT 1 COMMENT '状态: 1=上架, 0=下架',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_sku (sku),
  INDEX idx_category (category_id),
  INDEX idx_status (status),
  FOREIGN KEY (category_id) REFERENCES product_categories(id)
) COMMENT '产品表' ENGINE=InnoDB;

-- 库存记录表
CREATE TABLE IF NOT EXISTS inventory_logs (
  id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '日志ID',
  product_id BIGINT NOT NULL COMMENT '产品ID',
  quantity INT NOT NULL COMMENT '数量变化',
  type VARCHAR(50) COMMENT '类型: in, out, adjust',
  reason VARCHAR(255) COMMENT '原因',
  created_by BIGINT COMMENT '操作人',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_product_id (product_id),
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
) COMMENT '库存变动日志' ENGINE=InnoDB;

-- ============= 订单管理表 =============

-- 订单表
CREATE TABLE IF NOT EXISTS orders (
  id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '订单ID',
  order_no VARCHAR(50) UNIQUE NOT NULL COMMENT '订单号',
  customer_id BIGINT NOT NULL COMMENT '客户ID',
  total_amount DECIMAL(12, 2) NOT NULL COMMENT '总金额',
  status VARCHAR(50) DEFAULT 'pending' COMMENT '状态: pending, confirmed, shipped, completed, cancelled',
  created_by BIGINT COMMENT '创建人',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_order_no (order_no),
  INDEX idx_customer_id (customer_id),
  INDEX idx_status (status),
  FOREIGN KEY (customer_id) REFERENCES customers(id)
) COMMENT '订单表' ENGINE=InnoDB;

-- 订单明细表
CREATE TABLE IF NOT EXISTS order_items (
  id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '明细ID',
  order_id BIGINT NOT NULL COMMENT '订单ID',
  product_id BIGINT NOT NULL COMMENT '产品ID',
  quantity INT NOT NULL COMMENT '数量',
  price DECIMAL(12, 2) NOT NULL COMMENT '单价',
  subtotal DECIMAL(12, 2) NOT NULL COMMENT '小计',
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id)
) COMMENT '订单明细' ENGINE=InnoDB;

-- ============= 分析统计表 =============

-- 销售统计表（每日）
CREATE TABLE IF NOT EXISTS sales_daily_stats (
  id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '统计ID',
  stats_date DATE NOT NULL COMMENT '统计日期',
  total_sales DECIMAL(12, 2) DEFAULT 0 COMMENT '日销售额',
  order_count INT DEFAULT 0 COMMENT '订单数',
  new_leads INT DEFAULT 0 COMMENT '新增线索',
  converted_leads INT DEFAULT 0 COMMENT '成交线索',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE INDEX idx_date (stats_date)
) COMMENT '日销售统计' ENGINE=InnoDB;

-- 用户业绩表
CREATE TABLE IF NOT EXISTS user_performance (
  id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '业绩ID',
  user_id BIGINT NOT NULL COMMENT '用户ID',
  stats_date DATE NOT NULL COMMENT '统计日期',
  sales_amount DECIMAL(12, 2) DEFAULT 0 COMMENT '销售金额',
  order_count INT DEFAULT 0 COMMENT '订单数',
  lead_count INT DEFAULT 0 COMMENT '线索数',
  conversion_rate DECIMAL(5, 2) DEFAULT 0 COMMENT '转化率',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE INDEX idx_user_date (user_id, stats_date),
  FOREIGN KEY (user_id) REFERENCES users(id)
) COMMENT '用户业绩统计' ENGINE=InnoDB;

-- ============= 初始化数据 =============

-- 插入默认用户
INSERT INTO users (username, email, phone, password, name, role, status) VALUES
('admin', 'admin@example.com', '13800000001', '$2a$10$9j6J6X8o3dz0fzZ8x8x8x8x8x8x8x8x8x8x8x8x8x8x8x8x8', '管理员', 'admin', 1),
('zhangsan', 'zhangsan@example.com', '13800000002', '$2a$10$9j6J6X8o3dz0fzZ8x8x8x8x8x8x8x8x8x8x8x8x8x8x8x8x8', '张三', 'salesman', 1),
('lisi', 'lisi@example.com', '13800000003', '$2a$10$9j6J6X8o3dz0fzZ8x8x8x8x8x8x8x8x8x8x8x8x8x8x8x8x8', '李四', 'salesman', 1);

-- 插入产品分类
INSERT INTO product_categories (name, description) VALUES
('基础版', '适合小型团队'),
('标准版', '适合中型企业'),
('高级版', '适合大型企业'),
('企业版', '定制化解决方案');

-- 插入示例产品
INSERT INTO products (name, sku, price, stock, category_id, description, status) VALUES
('ShopPro 基础版', 'PROD-001', 999.00, 50, 1, '基础CRM功能', 1),
('ShopPro 标准版', 'PROD-002', 1999.00, 30, 2, '包含AI分析功能', 1),
('ShopPro 高级版', 'PROD-003', 4999.00, 20, 3, '完整企业级功能', 1),
('ShopPro 企业版', 'PROD-004', 9999.00, 10, 4, '定制化方案', 1);

-- 插入示例线索
INSERT INTO leads (name, phone, email, company, source, status, priority, assigned_to, notes, created_by) VALUES
('李明', '13800000004', 'liming@example.com', '优质科技有限公司', 'phone', 'contacted', 'high', 2, '重点客户，待跟进', 1),
('王五', '13800000005', 'wangwu@example.com', '创新贸易有限公司', 'email', 'qualified', 'medium', 2, '有购买意向', 1),
('赵六', '13800000006', 'zhaoliu@example.com', '领先制造有限公司', 'website', 'pending', 'low', 3, '新增线索', 1);

-- 插入示例客户
INSERT INTO customers (name, phone, email, company, industry, status, total_amount, orders, owner_id) VALUES
('张三科技', '13800001001', 'info@zhangsan-tech.com', '张三科技有限公司', 'IT', 'active', 50000.00, 5, 2),
('李四贸易', '13800001002', 'info@lisi-trade.com', '李四贸易有限公司', '商业', 'active', 30000.00, 3, 3),
('王五制造', '13800001003', 'info@wangwu-mfg.com', '王五制造有限公司', '制造', 'active', 80000.00, 8, 2);

-- ============= 表索引优化 =============

-- 添加复合索引以优化常用查询
ALTER TABLE leads ADD INDEX idx_status_priority (status, priority);
ALTER TABLE customers ADD INDEX idx_owner_status (owner_id, status);
ALTER TABLE orders ADD INDEX idx_customer_status (customer_id, status);
ALTER TABLE products ADD INDEX idx_category_status (category_id, status);

-- ============= 视图 (可选) =============

-- 销售汇总视图
CREATE OR REPLACE VIEW v_sales_summary AS
SELECT 
    DATE(o.created_at) as sale_date,
    COUNT(DISTINCT o.id) as order_count,
    SUM(o.total_amount) as total_sales,
    COUNT(DISTINCT o.customer_id) as customer_count,
    COUNT(DISTINCT u.id) as salesman_count
FROM orders o
JOIN customers c ON o.customer_id = c.id
JOIN users u ON c.owner_id = u.id
GROUP BY DATE(o.created_at);

-- 用户业绩汇总视图
CREATE OR REPLACE VIEW v_user_performance_summary AS
SELECT 
    u.id,
    u.username,
    u.name,
    COUNT(DISTINCT l.id) as total_leads,
    COUNT(DISTINCT CASE WHEN l.status = 'converted' THEN l.id END) as converted_leads,
    ROUND(COUNT(DISTINCT CASE WHEN l.status = 'converted' THEN l.id END) / COUNT(DISTINCT l.id) * 100, 2) as conversion_rate,
    COUNT(DISTINCT o.id) as total_orders,
    COALESCE(SUM(o.total_amount), 0) as total_sales
FROM users u
LEFT JOIN leads l ON u.id = l.assigned_to
LEFT JOIN customers c ON u.id = c.owner_id
LEFT JOIN orders o ON c.id = o.customer_id
WHERE u.role = 'salesman'
GROUP BY u.id, u.username, u.name;

-- ============= 完成 =============
-- 数据库初始化完成
-- 所有表、索引、视图和初始数据已创建
-- 可以开始使用ShopPro系统
