-- ==============================================================================
-- 15_ai_agent_tables.sql
-- ShopPro AI CRM 四大战略增强功能数据表结构定义与种子数据
-- 覆盖：1. AI 销售智能体; 2. 会话智能与实时辅导; 3. 收入运营引擎; 4. 智能信号触发
-- ==============================================================================

USE shoppro_db;

-- 1. AI 智能体配置表
CREATE TABLE IF NOT EXISTS ai_agent_configs (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    agent_type VARCHAR(50) NOT NULL UNIQUE COMMENT '智能体类型: sdr, follow_up, deal_coach',
    name VARCHAR(100) NOT NULL COMMENT '智能体名称',
    description VARCHAR(500) COMMENT '描述',
    is_enabled TINYINT DEFAULT 1 COMMENT '是否启用: 1-启用, 0-停用',
    execution_frequency VARCHAR(50) DEFAULT '2h' COMMENT '执行频率: 30m, 1h, 2h, daily',
    trigger_threshold INT DEFAULT 70 COMMENT '触发阈值(如线索评分>70)',
    require_confirmation TINYINT DEFAULT 1 COMMENT '是否需人工确认: 1-需要, 0-全自主',
    prompt_template_code VARCHAR(100) DEFAULT 'agent_default' COMMENT '关联提示词模板编码',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='AI智能体配置表';

-- 2. AI 智能体任务表
CREATE TABLE IF NOT EXISTS ai_agent_tasks (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    agent_type VARCHAR(50) NOT NULL COMMENT '智能体类型: sdr, follow_up, deal_coach',
    title VARCHAR(200) NOT NULL COMMENT '任务标题',
    target_type VARCHAR(50) NOT NULL COMMENT '目标类型: lead, customer, deal',
    target_id BIGINT NOT NULL COMMENT '目标ID',
    target_name VARCHAR(100) COMMENT '目标名称',
    assigned_sales_id BIGINT COMMENT '负责销售ID',
    assigned_sales_name VARCHAR(100) COMMENT '负责销售姓名',
    generated_content TEXT COMMENT 'AI 生成的执行内容/话术/建议',
    status VARCHAR(50) DEFAULT 'pending' COMMENT '状态: pending(待确认), confirmed(已确认执行), rejected(已驳回), auto_executed(自动执行)',
    execution_result VARCHAR(500) COMMENT '执行结果描述',
    feedback VARCHAR(500) COMMENT '人工驳回意见或反馈',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_agent_status (agent_type, status),
    INDEX idx_target (target_type, target_id),
    INDEX idx_sales (assigned_sales_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='AI智能体任务记录表';

-- 3. 会话智能记录表
CREATE TABLE IF NOT EXISTS ai_conversations (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    customer_id BIGINT COMMENT '关联客户ID',
    customer_name VARCHAR(100) COMMENT '客户名称',
    lead_id BIGINT COMMENT '关联线索ID',
    sales_id BIGINT COMMENT '跟进销售ID',
    sales_name VARCHAR(100) COMMENT '销售姓名',
    channel VARCHAR(50) DEFAULT 'phone' COMMENT '沟通渠道: phone, meeting, wechat',
    duration_seconds INT DEFAULT 0 COMMENT '通话/会议时长(秒)',
    sentiment VARCHAR(50) DEFAULT 'neutral' COMMENT '情绪倾向: positive, neutral, negative',
    sentiment_score DOUBLE DEFAULT 0.5 COMMENT '情绪评分 0.0 - 1.0',
    summary TEXT COMMENT 'AI 智能摘要',
    key_topics JSON COMMENT '关键议题列表',
    action_items JSON COMMENT '承诺事项清单',
    competitor_mentions JSON COMMENT '提及竞品列表',
    transcript TEXT COMMENT '语音转文字完整文本',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_customer (customer_id),
    INDEX idx_sales (sales_id),
    INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='会话智能记录表';

-- 4. 实时辅导规则表
CREATE TABLE IF NOT EXISTS ai_coaching_rules (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    keyword VARCHAR(100) NOT NULL COMMENT '触发关键词/模式',
    scenario VARCHAR(100) COMMENT '适用场景(价格异议/竞品对比/技术咨询)',
    suggested_response TEXT NOT NULL COMMENT '建议应对话术卡片内容',
    action_type VARCHAR(50) DEFAULT 'whisper' COMMENT '动作类型: whisper(耳语提示), script_card(话术卡片)',
    is_enabled TINYINT DEFAULT 1 COMMENT '是否启用',
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='实时辅导规则表';

-- 5. 智能信号类型配置表
CREATE TABLE IF NOT EXISTS ai_signal_types (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    code VARCHAR(50) NOT NULL UNIQUE COMMENT '信号编码: quote_viewed, silence_timeout, contact_changed, web_visit',
    name VARCHAR(100) NOT NULL COMMENT '信号名称',
    icon VARCHAR(50) DEFAULT 'Bell' COMMENT '图标',
    priority VARCHAR(20) DEFAULT 'medium' COMMENT '优先级: high, medium, low',
    description VARCHAR(255),
    is_enabled TINYINT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='智能信号类型表';

-- 6. 实时信号流记录表
CREATE TABLE IF NOT EXISTS ai_signals (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    signal_type VARCHAR(50) NOT NULL COMMENT '信号类型编码',
    title VARCHAR(200) NOT NULL COMMENT '信号标题',
    description TEXT COMMENT '详细描述',
    target_type VARCHAR(50) NOT NULL COMMENT '目标类型: customer, lead, deal',
    target_id BIGINT NOT NULL COMMENT '目标ID',
    target_name VARCHAR(100) COMMENT '目标名称',
    sales_id BIGINT COMMENT '负责销售ID',
    priority VARCHAR(20) DEFAULT 'medium' COMMENT '优先级: high, medium, low',
    recommended_action VARCHAR(255) COMMENT '建议行动',
    is_handled TINYINT DEFAULT 0 COMMENT '是否已处理: 0-未处理, 1-已处理',
    handled_at TIMESTAMP NULL COMMENT '处理时间',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_sales_handled (sales_id, is_handled),
    INDEX idx_target (target_type, target_id),
    INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='实时信号流表';

-- 7. 信号触发规则表
CREATE TABLE IF NOT EXISTS ai_trigger_rules (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    name VARCHAR(100) NOT NULL COMMENT '规则名称',
    signal_type VARCHAR(50) NOT NULL COMMENT '监听信号类型',
    condition_expr VARCHAR(255) COMMENT '条件表达式(如: count >= 3 AND uncontacted_days >= 3)',
    action_type VARCHAR(50) NOT NULL COMMENT '执行动作: create_task, send_notification, start_sop, assign_agent',
    action_config JSON COMMENT '动作参数配置',
    is_enabled TINYINT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='信号触发规则表';

-- 8. 收入运营配置表
CREATE TABLE IF NOT EXISTS ai_revenue_configs (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    stage_name VARCHAR(50) NOT NULL COMMENT '阶段名称: 初次接触, 需求确认, 方案建立, 商务谈判, 签约结案',
    benchmark_conversion_rate DOUBLE DEFAULT 0.5 COMMENT '基准转化率 (0.0-1.0)',
    max_stay_days INT DEFAULT 15 COMMENT '健康最大停留天数(超过触发卡单预警)',
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='收入运营配置表';

-- ==============================================================================
-- 种子数据注入
-- ==============================================================================

-- 1. 注入 3 大 AI 智能体默认配置
INSERT INTO ai_agent_configs (agent_type, name, description, is_enabled, execution_frequency, trigger_threshold, require_confirmation) VALUES
('sdr', 'SDR 线索开发智能体', '自动监控公海池与新录入线索，研判优先级并生成个性化多渠道首触方案', 1, '30m', 70, 1),
('follow_up', '跟进提醒与保活智能体', '智能扫描超过3天未跟进的商机，自动生成跟进策略并指派待办', 1, '2h', 50, 1),
('deal_coach', '成单教练与促成智能体', '分析停滞商机成因，匹配成功案例并推荐最优促成与谈判方案', 1, 'daily', 80, 1)
ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);

-- 2. 注入 Agent 待处理任务种子数据
INSERT INTO ai_agent_tasks (id, agent_type, title, target_type, target_id, target_name, assigned_sales_id, assigned_sales_name, generated_content, status) VALUES
(1, 'sdr', '新线索【上海科技公司ERP采购】个性化首触方案生成', 'lead', 1, '上海科技公司ERP采购', 3, '李销售', '王总您好！了解到贵司近期计划升级内部信息化架构，ShopPro提供全渠道AI赋能的SCRM解决方案，已帮助多家同业提升30%以上的人效，为您准备了一份针对性方案白皮书，方便发您微信审阅吗？', 'pending'),
(2, 'follow_up', '商机【广州贸易公司库存系统】跟进逾期提醒与关怀话术', 'lead', 2, '广州贸易公司库存系统', 3, '李销售', '李总您好！上周交流中您提到的多仓多库存实时同步需求，我们最新上线了自动化规则引擎，可支持跨区域毫秒级对账，诚邀您周四下午体验15分钟在线演示。', 'pending'),
(3, 'deal_coach', '商机【北京集团数字化转型】停滞成单攻坚策略推荐', 'lead', 3, '北京集团数字化转型', 3, '李销售', '【成单策略建议】该商机处于方案确认阶段已超12天，决策链中技术总监对数据安全性有顾虑。建议：1. 转发《ShopPro私有化与国密安全认证报告》；2. 申请技术专家共同参与二次澄清会。', 'pending')
ON DUPLICATE KEY UPDATE title=VALUES(title), generated_content=VALUES(generated_content);

-- 3. 注入会话智能记录种子数据
INSERT INTO ai_conversations (id, customer_id, customer_name, lead_id, sales_id, sales_name, channel, duration_seconds, sentiment, sentiment_score, summary, key_topics, action_items, competitor_mentions, transcript) VALUES
(1, 1, '上海科技有限公司', 1, 3, '李销售', 'phone', 420, 'positive', 0.85, 
'客户对ShopPro的AI智能大脑表现出极高兴趣，重点询问了线索智能打分与SOP自动化流转的落地周期，认可产品价值但希望了解更多安全合规资质。',
'["系统安全与私有化部署", "AI线索评分准确率", "实施周期与培训支持"]',
'["周三前提供同行业落地案例与安全合规证书", "预约周五上午针对技术团队的在线功能演示"]',
'["纷享销客", "Salesforce"]',
'销售: 王总您好，我是ShopPro的李销售，关于您上周咨询的AI SCRM方案... 客户: 对，我们目前主要想解决销售跟进不及时和转化率低的问题... 销售: 我们的AI大脑会自动识别客户意向并推荐促成策略... 客户: 听起来很不错，能否把安全认证和案例发我一份？ 销售: 没问题，我今天下午就整理好发送给您。'
),
(2, 2, '广州外贸供应链', 2, 3, '李销售', 'meeting', 900, 'neutral', 0.60, 
'就多仓库库存同步与移动端开单进行了深入讨论，客户对报价略有犹豫，希望申请阶梯性折扣或赠送首年AI模型算力包。',
'["报价与预算审批", "多仓多库存同步", "移动端销售开单操作体验"]',
'["向销售总监申请5%季度商务优惠政策", "提供移动端Demo测试账号供业务员试用"]',
'["用友CRM"]',
'销售: 张经理您好，今天给各位演示我们移动端SCRM... 客户: 整体界面很流畅，但费用上超出我们Q3预算大概15%... 销售: 我们支持按模块灵活订阅，或者为您申请总部的算力补贴...'
)
ON DUPLICATE KEY UPDATE summary=VALUES(summary);

-- 4. 注入实时辅导规则
INSERT INTO ai_coaching_rules (id, keyword, scenario, suggested_response, action_type, is_enabled, sort_order) VALUES
(1, '价格太高', '价格异议处理', '【FAB应对策略】认同预算压力，强调ShopPro平均首月提升30%人效并缩短15天成单周期，提议采用基础版起步阶梯式扩容。', 'script_card', 1, 1),
(2, '数据安全', '安全与合规', '【合规背书话术】ShopPro通过等保三级认证，采用国密SM4全字段加密，支持本地私有化部署与混合云架构，保障企业核心数据主权。', 'whisper', 1, 2),
(3, '对比纷享销客', '竞品差异化', '【核心优势对比】我们拥有原生的双模AI智能大脑与开箱即用的多端实时协同架构，无需二次高额定制开发，部署周期缩短70%。', 'script_card', 1, 3)
ON DUPLICATE KEY UPDATE suggested_response=VALUES(suggested_response);

-- 5. 注入信号类型配置
INSERT INTO ai_signal_types (id, code, name, icon, priority, description, is_enabled) VALUES
(1, 'quote_viewed', '客户查看报价单', 'FileText', 'high', '客户在邮件或微信中反复打开报价单超过3次', 1),
(2, 'silence_timeout', '商机沉默超期', 'Clock', 'medium', '高价值商机处于当前阶段超过15天未进行任何互动', 1),
(3, 'contact_changed', '关键决策人变更', 'UserCheck', 'high', '企业联系人职位发生变动或出现新决策人', 1),
(4, 'web_visit', '官网深度浏览', 'Globe', 'low', '客户访问产品定价页或API文档页超过3分钟', 1)
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- 6. 注入实时信号流记录
INSERT INTO ai_signals (id, signal_type, title, description, target_type, target_id, target_name, sales_id, priority, recommended_action, is_handled) VALUES
(1, 'quote_viewed', '王总(上海科技)今日打开报价方案累计 3 次', '客户于 12:30 再次深度浏览报价附录及实施清单，成交意向极高', 'customer', 1, '上海科技有限公司', 3, 'high', '建议立即致电跟进，锁定商务谈判时间', 0),
(2, 'contact_changed', '李总(广州外贸)关联企业新增采购总监职位', '工商数据监控发现该企业近期任命了数字化采购负责人', 'customer', 2, '广州外贸供应链', 3, 'medium', '建议主动添加新采购总监企微并发送产品白皮书', 0),
(3, 'silence_timeout', '商机【北京集团数字化转型】已超 12 天未跟进', '方案确认阶段停留过长，存在被竞品介入风险', 'lead', 3, '北京集团数字化转型', 3, 'high', '触发高优促成SOP，安排售前架构师二次拜访', 0)
ON DUPLICATE KEY UPDATE title=VALUES(title), description=VALUES(description);

-- 7. 注入信号触发规则
INSERT INTO ai_trigger_rules (id, name, signal_type, condition_expr, action_type, action_config, is_enabled) VALUES
(1, '报价高频浏览自动触发外呼任务', 'quote_viewed', 'view_count >= 3', 'create_task', '{"task_type": "high_priority_call", "due_hours": 2}', 1),
(2, '商机停滞超时自动流转成单教练', 'silence_timeout', 'uncontacted_days >= 10', 'assign_agent', '{"agent": "deal_coach", "action": "generate_strategy"}', 1)
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- 8. 注入收入运营阶段配置
INSERT INTO ai_revenue_configs (id, stage_name, benchmark_conversion_rate, max_stay_days, sort_order) VALUES
(1, '初次接触', 0.55, 7, 1),
(2, '需求确认', 0.65, 10, 2),
(3, '方案建立', 0.70, 15, 3),
(4, '商务谈判', 0.80, 10, 4),
(5, '签约结案', 0.95, 5, 5)
ON DUPLICATE KEY UPDATE benchmark_conversion_rate=VALUES(benchmark_conversion_rate), max_stay_days=VALUES(max_stay_days);
