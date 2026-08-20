-- 增加提示词模板管理表
USE shoppro_db;

CREATE TABLE IF NOT EXISTS ai_prompt_templates (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL COMMENT '模板名称',
    code VARCHAR(100) UNIQUE NOT NULL COMMENT '模板唯一标识',
    content TEXT NOT NULL COMMENT '提示词内容',
    description VARCHAR(255) COMMENT '模板描述',
    variables JSON COMMENT '变量列表',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_prompt_code(code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='AI 提示词模板表';

-- 初始化默认提示词模板数据
INSERT INTO ai_prompt_templates (name, code, content, description, variables) VALUES
('首页智能洞察', 'ai_insight_home', '请作为一名专业的数据分析师，深度解读以下销售高级分析数据。请分析销售趋势、客户细分和漏斗转化情况。指出潜在的机会点和风险点，并提供 3 条具有行动导向的战略建议。请保持分析犀利、简练且富有商业逻辑。\n分析数据：{data}', '用于首页展示的智能业务洞察', '["data"]'),
('客户画像分析', 'customer_profile', '请根据以下客户数据进行深度画像分析。请提供结构化的结果，包括：客户标签、性格/行为风格分析、潜在需求、购买偏好以及建议维护策略。\n客户数据：{data}', '深度分析客户特征', '["data"]'),
('营销话术生成', 'marketing_script', '请根据以下背景信息生成专业的营销话术。请提供结构化的结果，包括：场景标题、推荐话术列表、话术技巧/注意事项以及适用阶段。\n背景信息：{context}', '根据场景生成销售话术', '["context"]'),
('销量预测分析', 'sales_prediction', '请根据以下历史销售数据及市场信息进行销售预测分析。请提供结构化的结果，包括：预测销售额、同比增长率、市场趋势分析、关键影响因素、建议采取的行动以及信心指数。\n销售数据：{data}', '预测未来销售趋势', '["data"]'),
('线索智能评估', 'lead_evaluation', '请深度分析以下销售线索数据。请提供结构化的分析结果，包括：线索得分(1-100)、意向等级、核心分析、建议行动以及预计转化成功率。\n线索信息：{info}', '评估销售线索质量', '["info"]'),
('销售团队洞察', 'sales_team_insight', '请作为一名资深销售总监，分析以下销售团队的业绩数据。请指出表现优异的成员，分析团队整体表现，并为团队管理者提供3条具体的辅导或激励建议。请保持语气专业、鼓舞人心。\n业绩数据：{data}', '分析销售团队表现', '["data"]'),
('客户流失预测', 'customer_churn', '根据该客户的近期行为数据，深度分析其流失风险。请提供结构化的分析结果，包括：风险等级、流失概率、主要原因、挽留策略以及具体的行动建议。\n行为数据：{behavior}', '分析客户流失风险', '["behavior"]'),
('通用 AI 对话', 'general_chat', '请根据以下上下文回答用户的问题。请保持回复专业、友好且有帮助。\n上下文：{context}\n用户问题：{message}', '基础 AI 对话功能', '["context", "message"]');
