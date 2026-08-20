-- ShopPro 初始数据库结构

CREATE DATABASE IF NOT EXISTS shoppro_db DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE shoppro_db;

-- 1. 用户表
CREATE TABLE IF NOT EXISTS users (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(50) UNIQUE NOT NULL,
  phone VARCHAR(20) UNIQUE,
  email VARCHAR(100) UNIQUE,
  password VARCHAR(255) NOT NULL,
  real_name VARCHAR(100),
  avatar_url VARCHAR(255),
  role VARCHAR(50),                 -- admin, manager, sales, user (保留字段，兼容旧逻辑)
  department_id BIGINT,
  enterprise_id BIGINT,
  sales_targets JSON COMMENT '销售目标(周/月/季)',
  status TINYINT DEFAULT 1 COMMENT '1:正常, 0:禁用',
  last_login_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted TINYINT DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. 客户表
CREATE TABLE IF NOT EXISTS customers (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  phone VARCHAR(20),
  email VARCHAR(100),
  level ENUM('vip','high','medium','low') DEFAULT 'medium',
  status ENUM('active','inactive') DEFAULT 'active',
  tags JSON NULL,
  last_purchase_at TIMESTAMP NULL,
  owner_id BIGINT NULL,
  enterprise_id BIGINT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_customers_owner(owner_id),
  INDEX idx_customers_status(status),
  INDEX idx_customers_level(level)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. 线索表
CREATE TABLE IF NOT EXISTS leads (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(200) NOT NULL,
  status ENUM('new','contacted','qualified','won','lost') DEFAULT 'new',
  source VARCHAR(100) NULL,
  owner_id BIGINT NULL,
  enterprise_id BIGINT NULL,
  customer_id BIGINT NULL,
  amount DECIMAL(12,2) DEFAULT 0,
  probability DECIMAL(5,4) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_leads_owner(owner_id),
  INDEX idx_leads_status(status),
  INDEX idx_leads_customer(customer_id),
  CONSTRAINT fk_lead_customer FOREIGN KEY (customer_id) REFERENCES customers(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. 产品分类 (product_categories)
CREATE TABLE IF NOT EXISTS product_categories (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL COMMENT '分类名称',
  parent_id BIGINT DEFAULT 0 COMMENT '父分类ID',
  description VARCHAR(500) COMMENT '描述',
  image_url VARCHAR(255) COMMENT '图片URL',
  sort_order INT DEFAULT 0 COMMENT '排序',
  status TINYINT DEFAULT 1 COMMENT '状态: 1-正常, 0-禁用',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_category_parent(parent_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='产品分类表';

-- 5. 产品表 (products)
CREATE TABLE IF NOT EXISTS products (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  sku VARCHAR(64) UNIQUE COMMENT 'SKU',
  name VARCHAR(200) NOT NULL COMMENT '产品名称',
  category_id BIGINT COMMENT '分类ID',
  brand VARCHAR(100) COMMENT '品牌',
  model VARCHAR(100) COMMENT '型号',
  price DECIMAL(12,2) NOT NULL COMMENT '销售价格',
  market_price DECIMAL(12,2) COMMENT '市场价格',
  cost_price DECIMAL(12,2) COMMENT '成本价格',
  specifications JSON COMMENT '规格参数',
  features TEXT COMMENT '功能特性',
  images JSON COMMENT '图片列表',
  description LONGTEXT COMMENT '详细描述',
  stock_quantity INT DEFAULT 0 COMMENT '库存数量',
  min_stock INT DEFAULT 0 COMMENT '最低库存预警',
  sales_count INT DEFAULT 0 COMMENT '销量',
  status VARCHAR(20) DEFAULT 'active' COMMENT '状态: active/inactive/draft',
  is_featured TINYINT DEFAULT 0 COMMENT '是否推荐: 1-是, 0-否',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_products_category(category_id),
  INDEX idx_products_status(status),
  INDEX idx_products_brand(brand),
  CONSTRAINT fk_product_category FOREIGN KEY (category_id) REFERENCES product_categories(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='产品表';

-- 6. 部门表 (departments)
CREATE TABLE IF NOT EXISTS departments (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL COMMENT '部门名称',
  parent_id BIGINT DEFAULT 0 COMMENT '父部门ID',
  manager_id BIGINT COMMENT '负责人ID',
  description VARCHAR(500) COMMENT '描述',
  code VARCHAR(50) COMMENT '部门编码',
  phone VARCHAR(20) COMMENT '联系电话',
  email VARCHAR(100) COMMENT '邮箱',
  sort_order INT DEFAULT 0 COMMENT '排序',
  status TINYINT DEFAULT 1 COMMENT '状态: 1-正常, 0-禁用',
  level INT DEFAULT 1 COMMENT '层级',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted TINYINT DEFAULT 0,
  INDEX idx_dept_parent(parent_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='部门表';

-- 7. 角色表 (roles)
CREATE TABLE IF NOT EXISTS roles (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(50) NOT NULL COMMENT '角色名称',
  code VARCHAR(50) NOT NULL UNIQUE COMMENT '角色编码',
  display_name VARCHAR(100) COMMENT '显示名称',
  description VARCHAR(500) COMMENT '描述',
  parent_id BIGINT DEFAULT 0 COMMENT '父角色ID',
  level INT DEFAULT 1 COMMENT '职级: 1-初级, 2-中级, 3-高级',
  level_name VARCHAR(50) COMMENT '职级名称',
  sort_order INT DEFAULT 0 COMMENT '排序',
  status TINYINT DEFAULT 1 COMMENT '状态: 1-正常, 0-禁用',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted TINYINT DEFAULT 0,
  role_type ENUM('system','platform','enterprise','custom') DEFAULT 'custom',
  data_scope ENUM('all','department','department_and_sub','self','custom') DEFAULT 'self'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='角色表';

-- 8. 权限表 (permissions)
CREATE TABLE IF NOT EXISTS permissions (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL COMMENT '权限名称',
  code VARCHAR(100) NOT NULL UNIQUE COMMENT '权限编码',
  display_name VARCHAR(100) COMMENT '显示名称',
  description VARCHAR(500) COMMENT '描述',
  resource VARCHAR(255) COMMENT '资源标识',
  action VARCHAR(50) COMMENT '操作类型',
  category VARCHAR(50) COMMENT '分类',
  is_system TINYINT DEFAULT 0 COMMENT '是否系统权限',
  sort_order INT DEFAULT 0 COMMENT '排序',
  status TINYINT DEFAULT 1 COMMENT '状态',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted TINYINT DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='权限表';

-- 9. 用户角色关联表 (user_roles)
CREATE TABLE IF NOT EXISTS user_roles (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NOT NULL COMMENT '用户ID',
  role_id BIGINT NOT NULL COMMENT '角色ID',
  assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '分配时间',
  assigned_by BIGINT COMMENT '分配人ID',
  UNIQUE KEY uk_user_role (user_id, role_id),
  INDEX idx_ur_user(user_id),
  INDEX idx_ur_role(role_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户角色关联表';

-- 10. 角色权限关联表 (role_permissions)
CREATE TABLE IF NOT EXISTS role_permissions (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  role_id BIGINT NOT NULL COMMENT '角色ID',
  permission_id BIGINT NOT NULL COMMENT '权限ID',
  assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '分配时间',
  assigned_by BIGINT COMMENT '分配人ID',
  UNIQUE KEY uk_role_perm (role_id, permission_id),
  INDEX idx_rp_role(role_id),
  INDEX idx_rp_perm(permission_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='角色权限关联表';

-- 11. 订单表 (orders)
CREATE TABLE IF NOT EXISTS orders (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  order_no VARCHAR(64) NOT NULL UNIQUE COMMENT '订单编号',
  customer_id BIGINT NOT NULL COMMENT '客户ID',
  user_id BIGINT COMMENT '销售人员ID',
  total_amount DECIMAL(12,2) NOT NULL DEFAULT 0 COMMENT '订单总额',
  pay_amount DECIMAL(12,2) DEFAULT 0 COMMENT '实付金额',
  payment_method VARCHAR(20) COMMENT '支付方式',
  status TINYINT DEFAULT 0 COMMENT '0待支付 1已支付 2已发货 3已完成 4已取消',
  pay_time TIMESTAMP NULL COMMENT '支付时间',
  remark VARCHAR(500) COMMENT '备注',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted TINYINT DEFAULT 0,
  INDEX idx_orders_customer(customer_id),
  INDEX idx_orders_user(user_id),
  INDEX idx_orders_orderno(order_no)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='订单表';

-- 12. 订单明细表 (order_items)
CREATE TABLE IF NOT EXISTS order_items (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  order_id BIGINT NOT NULL COMMENT '订单ID',
  product_id BIGINT NOT NULL COMMENT '产品ID',
  product_name VARCHAR(200) COMMENT '产品名称',
  price DECIMAL(12,2) NOT NULL COMMENT '购买单价',
  quantity INT NOT NULL DEFAULT 1 COMMENT '数量',
  total_amount DECIMAL(12,2) NOT NULL COMMENT '小计金额',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_order_items_order(order_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='订单明细表';

-- 13. 跟进记录表 (follow_up_records)
CREATE TABLE IF NOT EXISTS follow_up_records (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  lead_id BIGINT COMMENT '线索ID',
  customer_id BIGINT COMMENT '客户ID',
  user_id BIGINT NOT NULL COMMENT '跟进人ID',
  type VARCHAR(20) COMMENT '跟进方式',
  title VARCHAR(200) COMMENT '标题',
  content TEXT COMMENT '跟进内容',
  result VARCHAR(20) COMMENT '跟进结果',
  next_follow_up_date TIMESTAMP NULL COMMENT '下次跟进时间',
  attachments JSON COMMENT '附件JSON',
  duration INT COMMENT '时长(分钟)',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_follow_lead(lead_id),
  INDEX idx_follow_cust(customer_id),
  INDEX idx_follow_user(user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='跟进记录表';

-- 14. 营销任务表 (marketing_tasks)
CREATE TABLE IF NOT EXISTS marketing_tasks (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL COMMENT '任务名称',
  type VARCHAR(20) COMMENT '任务类型',
  content TEXT COMMENT '内容',
  cron_expression VARCHAR(50) COMMENT 'Cron表达式',
  status TINYINT DEFAULT 0 COMMENT '状态',
  total_sent INT DEFAULT 0 COMMENT '发送总数',
  success_count INT DEFAULT 0 COMMENT '成功数',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted TINYINT DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='营销任务表';

-- 15. 知识库分类表 (knowledge_categories)
CREATE TABLE IF NOT EXISTS knowledge_categories (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  parent_id BIGINT DEFAULT 0,
  name VARCHAR(100) NOT NULL,
  description VARCHAR(500),
  icon VARCHAR(100),
  sort_order INT DEFAULT 0,
  status TINYINT DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted TINYINT DEFAULT 0,
  INDEX idx_kb_cat_parent(parent_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='知识库分类表';

-- 16. 知识库文章表 (knowledge)
CREATE TABLE IF NOT EXISTS knowledge (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  category_id BIGINT COMMENT '分类ID',
  title VARCHAR(200) NOT NULL COMMENT '标题',
  content LONGTEXT COMMENT '内容',
  tags VARCHAR(200) COMMENT '标签',
  view_count INT DEFAULT 0,
  like_count INT DEFAULT 0,
  status TINYINT DEFAULT 0 COMMENT '0草稿 1发布',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted TINYINT DEFAULT 0,
  INDEX idx_kb_category(category_id),
  INDEX idx_kb_title(title)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='知识库文章表';

-- 17. 文件上传记录表 (file_uploads)
CREATE TABLE IF NOT EXISTS file_uploads (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  original_file_name VARCHAR(255) COMMENT '原始文件名',
  saved_file_name VARCHAR(255) COMMENT '保存文件名',
  file_url VARCHAR(500) COMMENT '访问URL',
  file_size BIGINT COMMENT '文件大小',
  mime_type VARCHAR(100) COMMENT '文件类型',
  file_extension VARCHAR(20) COMMENT '扩展名',
  related_entity_type VARCHAR(50) COMMENT '关联实体类型',
  related_entity_id BIGINT COMMENT '关联实体ID',
  uploaded_by BIGINT COMMENT '上传人ID',
  uploaded_by_name VARCHAR(100) COMMENT '上传人',
  status TINYINT DEFAULT 1 COMMENT '1有效 0删除',
  md5_hash VARCHAR(64) COMMENT 'MD5',
  download_count INT DEFAULT 0,
  remarks VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_file_md5(md5_hash),
  INDEX idx_file_related(related_entity_type, related_entity_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='文件上传记录表';

-- 18. 企业信息表 (enterprises)
CREATE TABLE IF NOT EXISTS enterprises (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL COMMENT '企业名称',
  code VARCHAR(50) UNIQUE COMMENT '企业编码',
  legal_name VARCHAR(200) COMMENT '法人',
  contact_person VARCHAR(100) COMMENT '联系人',
  contact_phone VARCHAR(20) COMMENT '联系电话',
  contact_email VARCHAR(100) COMMENT '邮箱',
  address VARCHAR(500) COMMENT '地址',
  logo_url VARCHAR(255) COMMENT 'Logo',
  status TINYINT DEFAULT 1 COMMENT '1正常 0停用',
  subscription_plan_id BIGINT COMMENT '订阅计划',
  subscription_expire_at TIMESTAMP NULL COMMENT '订阅到期时间',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='企业信息表';

-- 19. 操作日志表 (operate_logs)
CREATE TABLE IF NOT EXISTS operate_logs (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(50) COMMENT '模块标题',
  business_type VARCHAR(20) COMMENT '业务类型',
  method VARCHAR(100) COMMENT '方法名称',
  request_method VARCHAR(10) COMMENT '请求方式',
  user_id BIGINT COMMENT '操作人员ID',
  user_name VARCHAR(50) COMMENT '操作人员名称',
  url VARCHAR(255) COMMENT '请求URL',
  ip VARCHAR(128) COMMENT '主机IP',
  request_param TEXT COMMENT '请求参数',
  json_result TEXT COMMENT '返回参数',
  status INT DEFAULT 0 COMMENT '操作状态 0正常 1异常',
  error_msg TEXT COMMENT '错误消息',
  time_used BIGINT COMMENT '消耗时间(ms)',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='操作日志表';

-- 20. 销售目标表 (sales_targets)
CREATE TABLE IF NOT EXISTS sales_targets (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  target_type VARCHAR(20) NOT NULL COMMENT '目标类型: PERSONAL, DEPARTMENT, COMPANY',
  target_id BIGINT NOT NULL COMMENT '目标主体ID (User ID or Dept ID or 0 for Company)',
  period_type VARCHAR(20) NOT NULL COMMENT '周期类型: WEEKLY, MONTHLY, QUARTERLY, YEARLY',
  period_start DATE NOT NULL COMMENT '周期开始日期',
  period_end DATE NOT NULL COMMENT '周期结束日期',
  target_amount DECIMAL(12,2) NOT NULL DEFAULT 0 COMMENT '目标金额',
  currency VARCHAR(10) DEFAULT 'CNY' COMMENT '货币单位',
  status TINYINT DEFAULT 1 COMMENT '状态: 1-生效, 0-失效',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_target_type_id (target_type, target_id),
  INDEX idx_target_period (period_start, period_end)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='销售目标表';

-- 21. 销售业绩记录表 (sales_performance)
CREATE TABLE IF NOT EXISTS sales_performance (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NOT NULL COMMENT '员工ID',
  department_id BIGINT COMMENT '部门ID',
  period_type VARCHAR(20) NOT NULL COMMENT '周期类型: WEEKLY, MONTHLY',
  period_date DATE NOT NULL COMMENT '周期标识日期 (例如每月1号)',
  sales_amount DECIMAL(12,2) DEFAULT 0 COMMENT '销售金额',
  order_count INT DEFAULT 0 COMMENT '订单数量',
  leads_count INT DEFAULT 0 COMMENT '线索数量',
  conversion_rate DECIMAL(5,2) DEFAULT 0 COMMENT '转化率(%)',
  score INT DEFAULT 0 COMMENT '绩效评分',
  ranking INT DEFAULT 0 COMMENT '排名',
  summary TEXT COMMENT '业绩总结',
  manager_comment TEXT COMMENT '主管点评',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_perf_user (user_id),
  INDEX idx_perf_dept (department_id),
  INDEX idx_perf_period (period_type, period_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='销售业绩记录表';

-- 22. AI 场景配置表 (ai_scenarios)
CREATE TABLE IF NOT EXISTS ai_scenarios (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  code VARCHAR(50) UNIQUE NOT NULL COMMENT '场景代码',
  name VARCHAR(100) NOT NULL COMMENT '场景名称',
  description VARCHAR(500) COMMENT '描述',
  model_config JSON COMMENT '模型配置',
  is_enabled TINYINT DEFAULT 1 COMMENT '是否启用',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_scenario_code (code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='AI 场景配置表';

-- 23. 销售话术表 (sales_scripts)
CREATE TABLE IF NOT EXISTS sales_scripts (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(200) NOT NULL COMMENT '话术标题',
  category VARCHAR(50) COMMENT '分类',
  content TEXT COMMENT '话术内容',
  tags VARCHAR(200) COMMENT '标签',
  usage_count INT DEFAULT 0 COMMENT '使用次数',
  success_rate DECIMAL(5,2) DEFAULT 0 COMMENT '成功率',
  last_used_at TIMESTAMP NULL COMMENT '最后使用时间',
  is_recommended TINYINT DEFAULT 0 COMMENT '是否推荐',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_script_category (category)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='销售话术表';

-- 24. 客户画像 (customer_personas)
CREATE TABLE IF NOT EXISTS customer_personas (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  customer_id BIGINT NOT NULL COMMENT '客户ID',
  tags JSON COMMENT '标签',
  score INT DEFAULT 0 COMMENT '画像评分',
  analysis_json JSON COMMENT '详细分析JSON',
  generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '生成时间',
  INDEX idx_persona_customer (customer_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='客户画像表';

-- 25. 运营自动化规则
CREATE TABLE IF NOT EXISTS automation_rules (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  tenant_id BIGINT NOT NULL,
  name VARCHAR(200) NOT NULL,
  description VARCHAR(500),
  trigger_event VARCHAR(100) NOT NULL,
  conditions TEXT,
  actions TEXT,
  is_active TINYINT DEFAULT 1,
  execution_count INT DEFAULT 0,
  last_executed_at DATETIME NULL,
  priority INT DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_automation_tenant (tenant_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='运营自动化规则';

-- 26. SOP及执行审计
CREATE TABLE IF NOT EXISTS sop_templates (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  enterprise_id BIGINT NOT NULL,
  name VARCHAR(200) NOT NULL,
  description VARCHAR(500),
  steps TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_sop_enterprise (enterprise_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='SOP模板';

CREATE TABLE IF NOT EXISTS customer_sops (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  customer_id BIGINT NOT NULL,
  sop_template_id BIGINT NOT NULL,
  status VARCHAR(30) NOT NULL,
  current_step INT DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_customer_sop_customer (customer_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='客户SOP执行';

CREATE TABLE IF NOT EXISTS work_tasks (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  enterprise_id BIGINT NOT NULL,
  user_id BIGINT NOT NULL,
  customer_id BIGINT NULL,
  customer_sop_id BIGINT NULL,
  type VARCHAR(30),
  title VARCHAR(200) NOT NULL,
  description TEXT,
  status VARCHAR(30) NOT NULL,
  due_time DATETIME NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_work_task_enterprise (enterprise_id),
  INDEX idx_work_task_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='运营待办任务';

CREATE TABLE IF NOT EXISTS sop_audits (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  tenant_id BIGINT NOT NULL,
  sop_template_id BIGINT NULL,
  rule_name VARCHAR(200),
  trigger_event VARCHAR(100),
  target_type VARCHAR(50),
  target_name VARCHAR(200),
  target_id BIGINT NULL,
  status VARCHAR(30),
  error_message TEXT,
  executed_at DATETIME NULL,
  duration INT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_sop_audit_tenant (tenant_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='SOP执行审计';

-- 27. 获客渠道及裂变
CREATE TABLE IF NOT EXISTS channel_codes (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  enterprise_id BIGINT NOT NULL,
  user_id BIGINT NOT NULL,
  channel_type VARCHAR(50) NOT NULL,
  channel_name VARCHAR(200) NOT NULL,
  code_url VARCHAR(500),
  description VARCHAR(500),
  scan_count INT DEFAULT 0,
  follow_count INT DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_channel_enterprise (enterprise_id),
  INDEX idx_channel_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='获客渠道码';

CREATE TABLE IF NOT EXISTS channel_code_stats (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  channel_code_id BIGINT NOT NULL,
  stat_date DATE NOT NULL,
  scan_count INT DEFAULT 0,
  follow_count INT DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_channel_stat_day (channel_code_id, stat_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='渠道码统计';

CREATE TABLE IF NOT EXISTS welcome_messages (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  tenant_id BIGINT NOT NULL,
  channel_code_id BIGINT NULL,
  channel_code_name VARCHAR(200),
  msg_type VARCHAR(50),
  content TEXT,
  is_active TINYINT DEFAULT 1,
  priority INT DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_welcome_tenant (tenant_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='渠道欢迎语';

CREATE TABLE IF NOT EXISTS marketing_fission (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  enterprise_id BIGINT NOT NULL,
  name VARCHAR(200) NOT NULL,
  type VARCHAR(50),
  config TEXT,
  status TINYINT DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_fission_enterprise (enterprise_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='营销裂变任务';
