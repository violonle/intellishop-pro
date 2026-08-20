-- ShopPro AI智能SCRM系统示例数据插入脚本
-- 创建时间: 2024-10-19
-- 版本: v1.0

USE shoppro_db;

-- 插入部门数据
INSERT INTO departments (name, parent_id, description, sort_order) VALUES
('总经理办', 0, '公司最高管理层', 1),
('销售部', 1, '负责产品销售和客户关系管理', 2),
('市场部', 1, '负责市场推广和品牌建设', 3),
('技术部', 1, '负责产品研发和技术支持', 4),
('客服部', 1, '负责客户服务和售后支持', 5),
('销售一组', 2, '主要负责华东地区销售', 6),
('销售二组', 2, '主要负责华北地区销售', 7),
('销售三组', 2, '主要负责华南地区销售', 8);

-- 插入用户数据（密码为bcrypt加密后的"123456"）
INSERT INTO users (username, phone, email, password, real_name, role, department_id, status) VALUES
('admin', '13800000001', 'admin@shoppro.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBaLZfqFFzI5R6', '系统管理员', 'admin', 1, 1),
('manager001', '13800000002', 'manager1@shoppro.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBaLZfqFFzI5R6', '张经理', 'manager', 2, 1),
('sales001', '13800000003', 'sales1@shoppro.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBaLZfqFFzI5R6', '李销售', 'sales', 6, 1),
('sales002', '13800000004', 'sales2@shoppro.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBaLZfqFFzI5R6', '王销售', 'sales', 7, 1),
('sales003', '13800000005', 'sales3@shoppro.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBaLZfqFFzI5R6', '赵销售', 'sales', 8, 1);

-- 更新部门经理
UPDATE departments SET manager_id = 2 WHERE id = 2;
UPDATE departments SET manager_id = 3 WHERE id = 6;
UPDATE departments SET manager_id = 4 WHERE id = 7;
UPDATE departments SET manager_id = 5 WHERE id = 8;

-- 插入客户数据
INSERT INTO customers (name, phone, email, wechat, gender, age, source, level, status, company, position, annual_income, tags, notes, created_by, assigned_to) VALUES
('李先生', '13900000001', 'li@example.com', 'wechat_li', 'male', 35, '官网咨询', 'vip', 'active', '上海科技有限公司', 'CEO', 1000000.00, '["高价值客户", "决策者", "技术导向"]', '对高端产品有强烈需求', 3, 3),
('王女士', '13900000002', 'wang@example.com', 'wechat_wang', 'female', 28, '朋友推荐', 'normal', 'potential', '广州贸易公司', '采购经理', 300000.00, '["价格敏感", "质量要求高"]', '需要详细的产品对比资料', 3, 4),
('张总', '13900000003', 'zhang@example.com', 'wechat_zhang', 'male', 42, '展会', 'diamond', 'active', '北京集团公司', '副总经理', 2000000.00, '["大客户", "决策快", "品质要求高"]', '公司规模大，有批量采购需求', 4, 3),
('刘经理', '13900000004', 'liu@example.com', 'wechat_liu', 'male', 39, '电话咨询', 'vip', 'potential', '深圳制造企业', '运营经理', 500000.00, '["成本控制", "效率优先"]', '关注产品的性价比和服务质量', 4, 5),
('陈小姐', '13900000005', 'chen@example.com', 'wechat_chen', 'female', 31, '网络广告', 'normal', 'inactive', '成都设计工作室', '设计总监', 200000.00, '["创意导向", "个性化需求"]', '对产品外观和用户体验要求较高', 5, 4);

-- 插入线索数据
INSERT INTO leads (customer_id, title, description, source, priority, status, estimated_value, success_probability, interested_products, budget_range, assigned_to, created_by, follow_up_date) VALUES
(1, '上海科技公司ERP系统采购', '李先生咨询企业级ERP系统，预算充足，决策周期短', '官网咨询', 'high', 'qualified', 800000.00, 85, '["企业ERP", "数据分析模块"]', '80-100万', 3, 3, '2024-10-20'),
(2, '广州贸易公司库存管理系统', '王女士需要库存管理解决方案，正在对比多家供应商', '朋友推荐', 'medium', 'proposal', 150000.00, 60, '["库存管理系统"]', '10-20万', 4, 3, '2024-10-22'),
(3, '北京集团数字化转型项目', '张总负责集团数字化转型，预算很大，需要整体解决方案', '展会', 'urgent', 'negotiation', 2000000.00, 90, '["企业ERP", "CRM系统", "数据分析"]', '200-300万', 3, 4, '2024-10-19'),
(4, '深圳制造企业生产管理系统', '刘经理关注生产效率提升，需要定制化解决方案', '电话咨询', 'high', 'contacted', 300000.00, 70, '["生产管理系统"]', '20-40万', 5, 4, '2024-10-21'),
(5, '设计工作室项目管理工具', '陈小姐需要轻量级的项目管理工具，预算有限', '网络广告', 'low', 'new', 50000.00, 30, '["项目管理工具"]', '3-8万', 4, 5, '2024-10-25');

-- 插入跟进记录
INSERT INTO follow_up_records (lead_id, customer_id, user_id, type, title, content, result, next_follow_up_date) VALUES
(1, 1, 3, 'call', '电话沟通ERP需求', '详细了解了客户的业务流程和系统需求，客户对我们的解决方案很感兴趣', 'positive', '2024-10-20 14:00:00'),
(1, 1, 3, 'visit', '现场演示ERP系统', '在客户公司进行了2小时的系统演示，客户高度认可产品功能', 'positive', '2024-10-22 10:00:00'),
(2, 2, 4, 'wechat', '微信发送产品资料', '通过微信发送了库存管理系统的详细资料和案例', 'neutral', '2024-10-22 16:00:00'),
(3, 3, 3, 'email', '发送整体解决方案', '邮件发送了完整的数字化转型解决方案，包含详细的实施计划', 'positive', '2024-10-19 09:00:00'),
(4, 4, 5, 'call', '了解生产管理需求', '电话沟通了客户的生产管理现状和改进需求', 'neutral', '2024-10-21 15:00:00');

-- 插入知识库分类
INSERT INTO knowledge_categories (name, parent_id, description, icon, sort_order) VALUES
('产品资料', 0, '产品相关的文档和资料', '📚', 1),
('销售技巧', 0, '销售方法和技巧分享', '💼', 2),
('常见问题', 0, '客户常见问题解答', '❓', 3),
('政策法规', 0, '相关政策法规文件', '📋', 4),
('ERP产品', 1, 'ERP系统相关资料', '🏢', 5),
('CRM产品', 1, 'CRM系统相关资料', '👥', 6),
('数据分析产品', 1, '数据分析工具资料', '📊', 7);

-- 插入知识库内容
INSERT INTO knowledge_base (title, content, summary, category_id, tags, view_count, is_public, created_by) VALUES
('ERP系统产品手册', '<h1>企业ERP系统完整介绍</h1><p>我们的ERP系统是一款专为中大型企业设计的综合管理系统...</p>', '详细介绍ERP系统的功能特性和技术优势', 5, '["ERP", "企业管理", "系统集成"]', 156, 1, 1),
('客户异议处理技巧', '<h1>常见客户异议及应对策略</h1><p>在销售过程中，客户经常会提出各种异议...</p>', '总结客户常见异议类型和有效的应对方法', 2, '["销售技巧", "客户沟通", "异议处理"]', 89, 1, 2),
('CRM系统技术规格书', '<h1>CRM系统技术参数</h1><p>系统采用微服务架构，支持高并发...</p>', 'CRM系统的详细技术参数和部署要求', 6, '["CRM", "技术规格", "系统架构"]', 67, 1, 1),
('数据分析平台使用指南', '<h1>数据分析平台操作指南</h1><p>本指南将帮助用户快速掌握数据分析平台的使用方法...</p>', '数据分析平台的详细使用教程和最佳实践', 7, '["数据分析", "使用指南", "操作手册"]', 134, 1, 1);

-- 插入产品分类
INSERT INTO product_categories (name, parent_id, description, sort_order) VALUES
('企业软件', 0, '面向企业的软件产品', 1),
('管理系统', 1, '各类企业管理系统', 2),
('分析工具', 1, '数据分析和报表工具', 3),
('ERP系统', 2, '企业资源计划系统', 4),
('CRM系统', 2, '客户关系管理系统', 5),
('项目管理', 2, '项目管理工具', 6);

-- 插入产品数据
INSERT INTO products (name, sku, category_id, brand, model, price, market_price, cost_price, specifications, features, description, stock_quantity, sales_count, status, is_featured) VALUES
('智慧ERP企业版', 'ERP-ENT-2024', 4, 'ShopPro', 'ERP-V3.0', 800000.00, 1000000.00, 400000.00, 
'{"users": "500", "modules": "15", "storage": "1TB", "support": "7x24"}', 
'["多模块集成", "云端部署", "移动端支持", "实时数据同步"]', 
'专为大中型企业设计的全功能ERP系统，支持财务、人事、采购、销售等全业务流程管理', 10, 5, 'active', 1),

('智能CRM专业版', 'CRM-PRO-2024', 5, 'ShopPro', 'CRM-V2.5', 300000.00, 400000.00, 150000.00,
'{"users": "200", "contacts": "50000", "storage": "500GB", "api": "unlimited"}',
'["AI客户分析", "销售预测", "自动化营销", "移动应用"]',
'基于AI技术的智能客户关系管理系统，帮助企业提升销售效率和客户满意度', 20, 12, 'active', 1),

('数据分析平台', 'DA-PLATFORM-2024', 3, 'ShopPro', 'DA-V1.8', 200000.00, 280000.00, 100000.00,
'{"users": "100", "reports": "unlimited", "storage": "2TB", "realtime": "yes"}',
'["实时数据处理", "可视化报表", "机器学习", "预测分析"]',
'强大的企业数据分析平台，支持多数据源接入和智能分析', 15, 8, 'active', 1),

('轻量级项目管理工具', 'PM-LITE-2024', 6, 'ShopPro', 'PM-V1.0', 50000.00, 80000.00, 25000.00,
'{"users": "50", "projects": "100", "storage": "100GB", "mobile": "yes"}',
'["任务管理", "团队协作", "进度跟踪", "文件共享"]',
'适合中小企业和团队的轻量级项目管理解决方案', 50, 25, 'active', 0);

-- 插入系统配置
INSERT INTO system_configs (config_key, config_value, description, is_system) VALUES
('system.name', '"ShopPro AI智能SCRM系统"', '系统名称', 1),
('system.version', '"1.0.0"', '系统版本号', 1),
('ai.prediction.enabled', 'true', '是否启用AI预测功能', 1),
('ai.model.version', '"v2.1"', 'AI模型版本', 1),
('notification.email.enabled', 'true', '是否启用邮件通知', 0),
('notification.sms.enabled', 'true', '是否启用短信通知', 0),
('file.upload.max_size', '10485760', '文件上传最大大小(字节)', 0),
('session.timeout', '7200', '会话超时时间(秒)', 0);

-- 插入一些AI分析结果示例
INSERT INTO ai_analytics (entity_type, entity_id, analysis_type, algorithm, result, confidence_score, model_version, processing_time, status) VALUES
('customer', 1, 'customer_profile', 'RandomForest', 
'{"profile": "高价值客户", "purchase_tendency": "高", "preferred_products": ["ERP", "数据分析"], "risk_level": "低"}', 
0.89, 'v2.1', 1250, 'completed'),

('lead', 1, 'success_prediction', 'GradientBoosting', 
'{"success_probability": 0.85, "key_factors": ["预算充足", "决策快", "需求明确"], "recommendation": "重点跟进，建议提供定制方案"}', 
0.92, 'v2.1', 980, 'completed'),

('customer', 3, 'churn_risk', 'LogisticRegression', 
'{"churn_probability": 0.15, "risk_factors": ["沟通频率高", "满意度高"], "retention_score": 0.95}', 
0.87, 'v2.1', 756, 'completed');

-- 插入操作日志示例
INSERT INTO operation_logs (user_id, module, action, entity_type, entity_id, new_data, ip_address, user_agent, execution_time) VALUES
(3, 'customer', 'create', 'customer', 1, '{"name": "李先生", "phone": "13900000001", "company": "上海科技有限公司"}', '192.168.1.100', 'Mozilla/5.0 Chrome/91.0', 125),
(3, 'lead', 'create', 'lead', 1, '{"title": "上海科技公司ERP系统采购", "customer_id": 1, "estimated_value": 800000}', '192.168.1.100', 'Mozilla/5.0 Chrome/91.0', 89),
(4, 'follow_up', 'create', 'follow_up_record', 3, '{"lead_id": 2, "type": "wechat", "title": "微信发送产品资料"}', '192.168.1.101', 'Mozilla/5.0 Chrome/91.0', 56);