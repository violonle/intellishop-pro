-- ShopPro AI智能SCRM系统数据库初始化脚本
-- 创建时间: 2024-10-19
-- 版本: v1.0

-- 创建数据库
CREATE DATABASE IF NOT EXISTS shoppro_db 
DEFAULT CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE shoppro_db;

-- 用户表
CREATE TABLE users (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) NOT NULL UNIQUE COMMENT '用户名',
    phone VARCHAR(20) NOT NULL UNIQUE COMMENT '手机号',
    email VARCHAR(100) UNIQUE COMMENT '邮箱',
    password VARCHAR(255) NOT NULL COMMENT '密码（加密）',
    real_name VARCHAR(100) COMMENT '真实姓名',
    avatar_url VARCHAR(500) COMMENT '头像URL',
    role ENUM('admin', 'manager', 'sales', 'user') DEFAULT 'user' COMMENT '用户角色',
    department_id BIGINT COMMENT '部门ID',
    status TINYINT DEFAULT 1 COMMENT '状态：1-正常，0-禁用',
    last_login_at TIMESTAMP NULL COMMENT '最后登录时间',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_phone (phone),
    INDEX idx_email (email),
    INDEX idx_role (role),
    INDEX idx_status (status)
) ENGINE=InnoDB COMMENT='用户表';

-- 部门表
CREATE TABLE departments (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL COMMENT '部门名称',
    parent_id BIGINT DEFAULT 0 COMMENT '父部门ID',
    manager_id BIGINT COMMENT '部门经理ID',
    description TEXT COMMENT '部门描述',
    sort_order INT DEFAULT 0 COMMENT '排序',
    status TINYINT DEFAULT 1 COMMENT '状态：1-正常，0-禁用',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_parent (parent_id),
    INDEX idx_status (status)
) ENGINE=InnoDB COMMENT='部门表';

-- 客户表
CREATE TABLE customers (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL COMMENT '客户姓名',
    phone VARCHAR(20) COMMENT '联系电话',
    email VARCHAR(100) COMMENT '邮箱地址',
    wechat VARCHAR(100) COMMENT '微信号',
    gender ENUM('male', 'female', 'unknown') DEFAULT 'unknown' COMMENT '性别',
    age INT COMMENT '年龄',
    birthday DATE COMMENT '生日',
    source VARCHAR(50) COMMENT '客户来源',
    level ENUM('normal', 'vip', 'diamond') DEFAULT 'normal' COMMENT '客户等级',
    status ENUM('active', 'inactive', 'potential', 'lost') DEFAULT 'potential' COMMENT '客户状态',
    tags JSON COMMENT '客户标签',
    address TEXT COMMENT '联系地址',
    company VARCHAR(200) COMMENT '公司名称',
    position VARCHAR(100) COMMENT '职位',
    annual_income DECIMAL(12,2) COMMENT '年收入',
    preferences JSON COMMENT '偏好设置',
    notes TEXT COMMENT '备注信息',
    created_by BIGINT COMMENT '创建人ID',
    assigned_to BIGINT COMMENT '分配给',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_phone (phone),
    INDEX idx_email (email),
    INDEX idx_status (status),
    INDEX idx_level (level),
    INDEX idx_source (source),
    INDEX idx_assigned (assigned_to),
    INDEX idx_created_by (created_by),
    FULLTEXT INDEX ft_search (name, phone, company)
) ENGINE=InnoDB COMMENT='客户表';

-- 线索表
CREATE TABLE leads (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    customer_id BIGINT COMMENT '客户ID',
    title VARCHAR(200) NOT NULL COMMENT '线索标题',
    description TEXT COMMENT '线索描述',
    source VARCHAR(50) COMMENT '线索来源',
    priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium' COMMENT '优先级',
    status ENUM('new', 'contacted', 'qualified', 'proposal', 'negotiation', 'won', 'lost') DEFAULT 'new' COMMENT '线索状态',
    stage VARCHAR(50) COMMENT '销售阶段',
    estimated_value DECIMAL(12,2) COMMENT '预估价值',
    success_probability INT DEFAULT 0 COMMENT 'AI预测成交概率',
    interested_products JSON COMMENT '感兴趣的产品',
    budget_range VARCHAR(100) COMMENT '预算范围',
    decision_timeline VARCHAR(100) COMMENT '决策时间线',
    competitor_info TEXT COMMENT '竞争对手信息',
    assigned_to BIGINT COMMENT '分配给',
    created_by BIGINT COMMENT '创建人',
    follow_up_date DATE COMMENT '下次跟进日期',
    closed_at TIMESTAMP NULL COMMENT '关闭时间',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_customer (customer_id),
    INDEX idx_status (status),
    INDEX idx_priority (priority),
    INDEX idx_assigned (assigned_to),
    INDEX idx_created_by (created_by),
    INDEX idx_follow_up (follow_up_date),
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
) ENGINE=InnoDB COMMENT='线索表';

-- 跟进记录表
CREATE TABLE follow_up_records (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    lead_id BIGINT COMMENT '线索ID',
    customer_id BIGINT COMMENT '客户ID',
    user_id BIGINT NOT NULL COMMENT '跟进人ID',
    type ENUM('call', 'email', 'wechat', 'visit', 'sms', 'douyin', 'other') NOT NULL COMMENT '跟进方式',
    title VARCHAR(200) NOT NULL COMMENT '跟进标题',
    content TEXT COMMENT '跟进内容',
    result ENUM('positive', 'neutral', 'negative') COMMENT '跟进结果',
    next_follow_up_date DATETIME COMMENT '下次跟进时间',
    attachments JSON COMMENT '附件信息',
    duration INT COMMENT '跟进时长（分钟）',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_lead (lead_id),
    INDEX idx_customer (customer_id),
    INDEX idx_user (user_id),
    INDEX idx_type (type),
    INDEX idx_created_at (created_at),
    FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE CASCADE,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB COMMENT='跟进记录表';

-- 知识库分类表
CREATE TABLE knowledge_categories (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    parent_id BIGINT DEFAULT 0 COMMENT '父分类ID',
    name VARCHAR(100) NOT NULL COMMENT '分类名称',
    description TEXT COMMENT '分类描述',
    icon VARCHAR(100) COMMENT '分类图标',
    sort_order INT DEFAULT 0 COMMENT '排序',
    status TINYINT DEFAULT 1 COMMENT '状态：1-正常，0-禁用',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_parent (parent_id),
    INDEX idx_status (status)
) ENGINE=InnoDB COMMENT='知识库分类表';

-- 知识库内容表
CREATE TABLE knowledge_base (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(200) NOT NULL COMMENT '标题',
    content LONGTEXT COMMENT '内容（富文本）',
    summary TEXT COMMENT '摘要',
    category_id BIGINT COMMENT '分类ID',
    tags JSON COMMENT '标签',
    file_urls JSON COMMENT '附件文件URLs',
    cover_image VARCHAR(500) COMMENT '封面图片',
    view_count INT DEFAULT 0 COMMENT '查看次数',
    like_count INT DEFAULT 0 COMMENT '点赞数',
    is_public TINYINT DEFAULT 1 COMMENT '是否公开：1-公开，0-私有',
    is_featured TINYINT DEFAULT 0 COMMENT '是否推荐',
    created_by BIGINT COMMENT '创建人ID',
    updated_by BIGINT COMMENT '更新人ID',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_category (category_id),
    INDEX idx_public (is_public),
    INDEX idx_featured (is_featured),
    INDEX idx_created_by (created_by),
    FULLTEXT INDEX ft_content (title, content, summary),
    FOREIGN KEY (category_id) REFERENCES knowledge_categories(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB COMMENT='知识库内容表';

-- 产品分类表
CREATE TABLE product_categories (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    parent_id BIGINT DEFAULT 0 COMMENT '父分类ID',
    name VARCHAR(100) NOT NULL COMMENT '分类名称',
    description TEXT COMMENT '分类描述',
    image_url VARCHAR(500) COMMENT '分类图片',
    sort_order INT DEFAULT 0 COMMENT '排序',
    status TINYINT DEFAULT 1 COMMENT '状态：1-正常，0-禁用',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_parent (parent_id),
    INDEX idx_status (status)
) ENGINE=InnoDB COMMENT='产品分类表';

-- 产品表
CREATE TABLE products (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(200) NOT NULL COMMENT '产品名称',
    sku VARCHAR(100) UNIQUE COMMENT '产品SKU',
    category_id BIGINT COMMENT '分类ID',
    brand VARCHAR(100) COMMENT '品牌',
    model VARCHAR(100) COMMENT '型号',
    price DECIMAL(12,2) COMMENT '价格',
    market_price DECIMAL(12,2) COMMENT '市场价',
    cost_price DECIMAL(12,2) COMMENT '成本价',
    specifications JSON COMMENT '产品规格参数',
    features JSON COMMENT '产品特性',
    images JSON COMMENT '产品图片URLs',
    description TEXT COMMENT '产品描述',
    stock_quantity INT DEFAULT 0 COMMENT '库存数量',
    min_stock INT DEFAULT 0 COMMENT '最低库存警戒线',
    sales_count INT DEFAULT 0 COMMENT '销售数量',
    status ENUM('active', 'inactive', 'discontinued') DEFAULT 'active' COMMENT '产品状态',
    is_featured TINYINT DEFAULT 0 COMMENT '是否推荐',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_sku (sku),
    INDEX idx_category (category_id),
    INDEX idx_brand (brand),
    INDEX idx_status (status),
    INDEX idx_featured (is_featured),
    FULLTEXT INDEX ft_search (name, brand, model),
    FOREIGN KEY (category_id) REFERENCES product_categories(id) ON DELETE SET NULL
) ENGINE=InnoDB COMMENT='产品表';

-- AI分析结果表
CREATE TABLE ai_analytics (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    entity_type ENUM('customer', 'lead', 'sales', 'product') NOT NULL COMMENT '分析对象类型',
    entity_id BIGINT NOT NULL COMMENT '分析对象ID',
    analysis_type VARCHAR(50) NOT NULL COMMENT '分析类型',
    algorithm VARCHAR(100) COMMENT '使用的算法',
    input_data JSON COMMENT '输入数据',
    result JSON COMMENT '分析结果',
    confidence_score FLOAT COMMENT '置信度（0-1）',
    model_version VARCHAR(50) COMMENT '模型版本',
    processing_time INT COMMENT '处理时间（毫秒）',
    status ENUM('pending', 'completed', 'failed') DEFAULT 'pending' COMMENT '分析状态',
    error_message TEXT COMMENT '错误信息',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_entity (entity_type, entity_id),
    INDEX idx_type (analysis_type),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB COMMENT='AI分析结果表';

-- 系统配置表
CREATE TABLE system_configs (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    config_key VARCHAR(100) NOT NULL UNIQUE COMMENT '配置键',
    config_value JSON COMMENT '配置值',
    description TEXT COMMENT '配置说明',
    is_system TINYINT DEFAULT 0 COMMENT '是否系统配置：1-是，0-否',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_key (config_key)
) ENGINE=InnoDB COMMENT='系统配置表';

-- 操作日志表
CREATE TABLE operation_logs (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT COMMENT '操作用户ID',
    module VARCHAR(50) NOT NULL COMMENT '模块名称',
    action VARCHAR(50) NOT NULL COMMENT '操作动作',
    entity_type VARCHAR(50) COMMENT '操作对象类型',
    entity_id BIGINT COMMENT '操作对象ID',
    old_data JSON COMMENT '变更前数据',
    new_data JSON COMMENT '变更后数据',
    ip_address VARCHAR(45) COMMENT 'IP地址',
    user_agent TEXT COMMENT '用户代理',
    request_id VARCHAR(100) COMMENT '请求ID',
    execution_time INT COMMENT '执行时间（毫秒）',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_user (user_id),
    INDEX idx_module (module),
    INDEX idx_action (action),
    INDEX idx_entity (entity_type, entity_id),
    INDEX idx_created_at (created_at),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB COMMENT='操作日志表';

-- 设置外键约束
ALTER TABLE users ADD FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL;
ALTER TABLE departments ADD FOREIGN KEY (manager_id) REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE customers ADD FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE customers ADD FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE leads ADD FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE leads ADD FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL;