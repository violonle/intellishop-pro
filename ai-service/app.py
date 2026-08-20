#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
ShopPro AI智能分析服务
基于Flask的AI微服务，提供客户分析、销售预测、脚本推荐等功能

@author: ShopPro Team  
@version: 1.0.0
"""

import os
import logging
from datetime import datetime
from flask import Flask, request, jsonify
from flask_cors import CORS

# 导入自定义服务
from services.customer_analysis import CustomerAnalysisService
from services.sales_prediction import SalesPredictionService
from services.advanced_ai import (
    clv_predictor, funnel_optimizer, 
    customer_segmentation, recommendation_engine
)
from services.marketing_automation import MarketingAutomationService
from services.advanced_analytics import AdvancedAnalyticsService
from services.chatbot_assistant import ChatbotAssistantService

# 导入工具类
from utils import ApiResponse, Validator, db_manager, model_manager

# 配置日志
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('ai-service.log'),
        logging.StreamHandler()
    ]
)

logger = logging.getLogger(__name__)


def create_app():
    """创建Flask应用"""
    app = Flask(__name__)
    
    # 配置CORS
    CORS(app, resources={
        r"/api/*": {
            "origins": ["*"],
            "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
            "allow_headers": ["Content-Type", "Authorization"]
        }
    })
    
    # 应用配置
    app.config.update({
        'SECRET_KEY': os.getenv('AI_SECRET_KEY', 'shoppro-ai-secret-2024'),
        'DEBUG': os.getenv('FLASK_DEBUG', 'False').lower() == 'true',
        'MODEL_PATH': os.getenv('MODEL_PATH', './models')
    })
    
    return app


# 创建应用实例
app = create_app()

# 初始化服务
try:
    # AI服务初始化
    customer_service = CustomerAnalysisService()
    sales_service = SalesPredictionService()
    marketing_service = MarketingAutomationService()
    analytics_service = AdvancedAnalyticsService()
    chatbot_service = ChatbotAssistantService()
    
    logger.info("AI服务初始化成功")
    
except Exception as e:
    logger.error(f"AI服务初始化失败: {str(e)}")


@app.route('/api/health', methods=['GET'])
def health_check():
    """健康检查接口"""
    try:
        # 检查模型状态
        models_status = model_manager.list_models()
        
        return ApiResponse.success({
            "status": "healthy",
            "timestamp": datetime.now().isoformat(),
            "version": "1.0.0",
            "services": {
                "database": "connected",
                "ai_models": models_status
            }
        })
    except Exception as e:
        logger.error(f"健康检查失败: {str(e)}")
        return ApiResponse.error(f"服务异常: {str(e)}", 500)


@app.route('/api/customer/analysis', methods=['POST'])
def customer_analysis():
    """客户画像分析"""
    try:
        data = request.get_json()
        
        # 参数验证
        validation_errors = Validator.validate_analysis_params(data)
        if validation_errors:
            return ApiResponse.validation_error("参数验证失败", validation_errors)
        
        customer_id = data.get('customer_id')
        
        # 执行客户分析
        result = customer_service.analyze_customer_profile(customer_id)
        
        logger.info(f"客户分析完成: customer_id={customer_id}")
        return ApiResponse.success(result)
        
    except Exception as e:
        logger.error(f"客户分析失败: {str(e)}")
        return ApiResponse.error(f"分析失败: {str(e)}", 500)


@app.route('/api/customer/analysis/<int:customer_id>', methods=['GET'])
def get_customer_analysis(customer_id):
    """获取客户分析结果"""
    try:
        # 从数据库获取客户信息
        customer = db_manager.get_customer_by_id(customer_id)
        
        if not customer:
            return ApiResponse.not_found("客户不存在")
        
        # 执行分析
        result = customer_service.analyze_customer_profile(customer_id)
        
        return ApiResponse.success(result)
        
    except Exception as e:
        logger.error(f"获取客户分析失败: {str(e)}")
        return ApiResponse.error(f"获取失败: {str(e)}", 500)


@app.route('/api/sales/prediction', methods=['POST'])
def sales_prediction():
    """成交概率预测"""
    try:
        data = request.get_json()
        
        # 参数验证
        validation_errors = Validator.validate_analysis_params(data)
        if validation_errors:
            return ApiResponse.validation_error("参数验证失败", validation_errors)
        
        lead_id = data.get('lead_id')
        
        # 执行成交预测
        result = sales_service.predict_success_probability(lead_id)
        
        logger.info(f"成交预测完成: lead_id={lead_id}, probability={result.get('probability', 0)}")
        return ApiResponse.success(result)
        
    except Exception as e:
        logger.error(f"成交预测失败: {str(e)}")
        return ApiResponse.error(f"预测失败: {str(e)}", 500)


@app.route('/api/script/recommendation', methods=['POST'])
def script_recommendation():
    """智能话术推荐"""
    try:
        data = request.get_json()
        customer_id = data.get('customer_id')
        scenario = data.get('scenario', 'general')  # 场景：general, objection, closing等
        
        if not customer_id:
            return ApiResponse.validation_error("缺少客户ID参数")
        
        # 获取客户信息
        customer = db_manager.get_customer_by_id(customer_id)
        if not customer:
            return ApiResponse.not_found("客户不存在")
        
        # 基于客户画像和场景推荐话术
        scripts = generate_script_recommendations(customer, scenario)
        
        result = {
            "customer_id": customer_id,
            "scenario": scenario,
            "scripts": scripts,
            "recommendations": len(scripts)
        }
        
        logger.info(f"话术推荐完成: customer_id={customer_id}, scenario={scenario}")
        return ApiResponse.success(result)
        
    except Exception as e:
        logger.error(f"话术推荐失败: {str(e)}")
        return ApiResponse.error(f"推荐失败: {str(e)}", 500)


@app.route('/api/risk/analysis', methods=['POST'])
def risk_analysis():
    """客户流失风险分析"""
    try:
        data = request.get_json()
        customer_ids = data.get('customer_ids', [])
        
        if not customer_ids:
            return ApiResponse.validation_error("缺少客户ID列表")
        
        # 批量获取客户信息
        customers = db_manager.get_customers_by_ids(customer_ids)
        
        risk_results = []
        for customer in customers:
            risk_score = calculate_churn_risk(customer)
            risk_results.append({
                "customer_id": customer['id'],
                "customer_name": customer['name'],
                "risk_score": risk_score,
                "risk_level": get_risk_level(risk_score),
                "recommendations": get_retention_recommendations(risk_score)
            })
        
        result = {
            "total_analyzed": len(customers),
            "risk_analysis": risk_results,
            "high_risk_count": len([r for r in risk_results if r['risk_level'] == 'high'])
        }
        
        logger.info(f"风险分析完成: 分析客户数={len(customer_ids)}")
        return ApiResponse.success(result)
        
    except Exception as e:
        logger.error(f"风险分析失败: {str(e)}")
        return ApiResponse.error(f"分析失败: {str(e)}", 500)


@app.route('/api/batch/analysis', methods=['POST'])
def batch_analysis():
    """批量AI分析任务"""
    try:
        data = request.get_json()
        analysis_type = data.get('type')  # customer, sales, risk
        entity_ids = data.get('entity_ids', [])
        
        if not analysis_type or not entity_ids:
            return ApiResponse.validation_error("缺少分析类型或实体ID列表")
        
        results = []
        
        # 根据分析类型执行批量分析
        if analysis_type == 'customer':
            for customer_id in entity_ids:
                try:
                    result = customer_service.analyze_customer_profile(customer_id)
                    results.append({
                        'customer_id': customer_id,
                        'analysis': result,
                        'status': 'success'
                    })
                except Exception as e:
                    results.append({
                        'customer_id': customer_id,
                        'error': str(e),
                        'status': 'failed'
                    })
                    
        elif analysis_type == 'sales':
            for lead_id in entity_ids:
                try:
                    result = sales_service.predict_success_probability(lead_id)
                    results.append({
                        'lead_id': lead_id,
                        'prediction': result,
                        'status': 'success'
                    })
                except Exception as e:
                    results.append({
                        'lead_id': lead_id,
                        'error': str(e),
                        'status': 'failed'
                    })
        else:
            return ApiResponse.validation_error("不支持的分析类型")
        
        success_count = len([r for r in results if r.get('status') == 'success'])
        
        logger.info(f"批量分析完成: type={analysis_type}, total={len(entity_ids)}, success={success_count}")
        return ApiResponse.success({
            'analysis_type': analysis_type,
            'total_count': len(entity_ids),
            'success_count': success_count,
            'results': results
        })
        
    except Exception as e:
        logger.error(f"批量分析失败: {str(e)}")
        return ApiResponse.error(f"分析失败: {str(e)}", 500)


def generate_script_recommendations(customer, scenario):
    """生成话术推荐"""
    scripts = []
    
    # 基础信息话术
    if scenario == 'general':
        scripts.extend([
            f"您好{customer['name']}，我是来自ShopPro的客户顾问",
            f"根据您之前的购买记录，我为您推荐一些新产品",
            "感谢您一直以来对我们的信任和支持"
        ])
    
    # 异议处理话术
    elif scenario == 'objection':
        scripts.extend([
            "我理解您的顾虑，让我为您详细解答",
            "很多客户刚开始也有同样的想法，但使用后都非常满意",
            "我们提供7天无理由退换，您可以放心尝试"
        ])
    
    # 成交话术
    elif scenario == 'closing':
        scripts.extend([
            "现在下单还有限时优惠，机会难得",
            "基于您的需求，这个方案最适合您",
            "我来帮您完成下单流程，只需要几分钟"
        ])
    
    return scripts


def calculate_churn_risk(customer):
    """计算客户流失风险分数"""
    risk_score = 0.0
    
    # 基于最后购买时间
    if customer.get('last_purchase_date'):
        from datetime import datetime, timedelta
        last_purchase = customer['last_purchase_date']
        if isinstance(last_purchase, str):
            last_purchase = datetime.fromisoformat(last_purchase.replace('Z', '+00:00'))
        
        days_since_purchase = (datetime.now() - last_purchase).days
        if days_since_purchase > 90:
            risk_score += 0.4
        elif days_since_purchase > 30:
            risk_score += 0.2
    
    # 基于消费金额
    total_consumption = customer.get('total_consumption', 0)
    if total_consumption < 100:
        risk_score += 0.3
    elif total_consumption < 500:
        risk_score += 0.1
    
    # 基于客户状态
    if customer.get('status') == 'inactive':
        risk_score += 0.3
    
    return min(risk_score, 1.0)


def get_risk_level(risk_score):
    """获取风险等级"""
    if risk_score >= 0.7:
        return 'high'
    elif risk_score >= 0.4:
        return 'medium'
    else:
        return 'low'


def get_retention_recommendations(risk_score):
    """获取客户挽留建议"""
    if risk_score >= 0.7:
        return [
            "立即安排客户经理主动联系",
            "提供专属优惠券或折扣",
            "了解客户不满意的具体原因"
        ]
    elif risk_score >= 0.4:
        return [
            "发送关怀邮件或短信",
            "推荐相关产品或服务",
            "邀请参与客户满意度调研"
        ]
    else:
        return [
            "保持常规的客户关怀",
            "定期推送产品资讯"
        ]


# ===== 高级AI算法API端点 =====

@app.route('/api/advanced/clv_prediction', methods=['POST'])
def clv_prediction():
    """客户生命周期价值预测"""
    try:
        data = request.get_json()
        customer_data = data.get('customers', [])
        
        if not customer_data:
            return ApiResponse.validation_error("缺少客户数据")
        
        # 执行CLV预测
        result = clv_predictor.predict_clv(customer_data)
        
        logger.info(f"CLV预测完成，处理客户数: {len(customer_data)}")
        return ApiResponse.success({
            "predictions": result,
            "total_customers": len(customer_data),
            "model_type": "MLPRegressor"
        })
        
    except Exception as e:
        logger.error(f"CLV预测失败: {str(e)}")
        return ApiResponse.error(f"预测失败: {str(e)}", 500)


@app.route('/api/advanced/funnel_analysis', methods=['POST'])
def funnel_analysis():
    """销售漏斗分析优化"""
    try:
        data = request.get_json()
        funnel_data = data.get('funnel_data', {})
        
        if not funnel_data:
            return ApiResponse.validation_error("缺少漏斗数据")
        
        # 执行漏斗分析
        result = funnel_optimizer.analyze_funnel_performance(funnel_data)
        
        logger.info(f"漏斗分析完成，性能评分: {result.get('performance_score', 0)}")
        return ApiResponse.success(result)
        
    except Exception as e:
        logger.error(f"漏斗分析失败: {str(e)}")
        return ApiResponse.error(f"分析失败: {str(e)}", 500)


@app.route('/api/advanced/customer_segmentation', methods=['POST'])
def advanced_customer_segmentation():
    """高级客户细分分析"""
    try:
        data = request.get_json()
        customer_data = data.get('customers', [])
        
        if not customer_data:
            return ApiResponse.validation_error("缺少客户数据")
        
        if len(customer_data) < 10:
            return ApiResponse.validation_error("客户数据量不足，至少需要10个客户")
        
        # 执行高级客户细分
        result = customer_segmentation.perform_advanced_segmentation(customer_data)
        
        logger.info(f"客户细分完成，识别出 {result.get('segment_count', 0)} 个细分群体")
        return ApiResponse.success(result)
        
    except Exception as e:
        logger.error(f"客户细分失败: {str(e)}")
        return ApiResponse.error(f"细分失败: {str(e)}", 500)


@app.route('/api/advanced/recommendations', methods=['POST'])
def realtime_recommendations():
    """实时个性化推荐"""
    try:
        data = request.get_json()
        user_id = data.get('user_id')
        item_type = data.get('item_type', 'product')
        count = data.get('count', 10)
        interactions = data.get('interactions', [])
        
        if not user_id:
            return ApiResponse.validation_error("缺少用户ID")
        
        # 更新用户画像
        if interactions:
            recommendation_engine.update_user_profile(user_id, interactions)
        
        # 获取推荐
        recommendations = recommendation_engine.get_recommendations(
            user_id, item_type, min(count, 20)  # 限制最大推荐数量
        )
        
        logger.info(f"推荐生成完成: user_id={user_id}, recommendations={len(recommendations)}")
        return ApiResponse.success({
            "user_id": user_id,
            "recommendations": recommendations,
            "total_count": len(recommendations),
            "item_type": item_type
        })
        
    except Exception as e:
        logger.error(f"推荐生成失败: {str(e)}")
        return ApiResponse.error(f"推荐失败: {str(e)}", 500)


@app.route('/api/advanced/user_profile', methods=['POST'])
def update_user_profile():
    """更新用户画像"""
    try:
        data = request.get_json()
        user_id = data.get('user_id')
        interactions = data.get('interactions', [])
        
        if not user_id:
            return ApiResponse.validation_error("缺少用户ID")
        
        if not interactions:
            return ApiResponse.validation_error("缺少交互数据")
        
        # 更新用户画像
        recommendation_engine.update_user_profile(user_id, interactions)
        
        # 获取更新后的用户画像
        if user_id in recommendation_engine.user_profiles:
            profile = recommendation_engine.user_profiles[user_id]
            result = {
                "user_id": user_id,
                "profile_updated": True,
                "last_updated": profile['last_updated'].isoformat(),
                "behavior_patterns": profile['behavior_patterns'],
                "preference_count": len(profile['preferences'])
            }
        else:
            result = {
                "user_id": user_id,
                "profile_updated": False,
                "message": "画像更新失败"
            }
        
        logger.info(f"用户画像更新完成: user_id={user_id}")
        return ApiResponse.success(result)
        
    except Exception as e:
        logger.error(f"用户画像更新失败: {str(e)}")
        return ApiResponse.error(f"更新失败: {str(e)}", 500)


@app.route('/api/advanced/batch_clv_training', methods=['POST'])
def train_clv_model():
    """训练CLV预测模型"""
    try:
        data = request.get_json()
        training_data = data.get('training_data', [])
        
        if len(training_data) < 50:
            return ApiResponse.validation_error("训练数据不足，至少需要50个样本")
        
        # 训练CLV模型
        training_result = clv_predictor.train(training_data)
        
        logger.info(f"CLV模型训练完成: MSE={training_result.get('mse', 0)}")
        return ApiResponse.success({
            "training_completed": True,
            "training_samples": len(training_data),
            "model_performance": training_result
        })
        
    except Exception as e:
        logger.error(f"CLV模型训练失败: {str(e)}")
        return ApiResponse.error(f"训练失败: {str(e)}", 500)


# ===== 智能营销自动化API端点 =====

@app.route('/api/marketing/journey/create', methods=['POST'])
def create_customer_journey():
    """创建客户旅程"""
    try:
        data = request.get_json()
        journey_config = data.get('journey_config', {})
        
        if not journey_config:
            return ApiResponse.validation_error("缺少旅程配置")
        
        # 创建客户旅程
        journey = marketing_service.journey_automation.create_journey(journey_config)
        
        logger.info(f"客户旅程创建完成: journey_id={journey.get('journey_id')}")
        return ApiResponse.success(journey)
        
    except Exception as e:
        logger.error(f"客户旅程创建失败: {str(e)}")
        return ApiResponse.error(f"创建失败: {str(e)}", 500)


@app.route('/api/marketing/journey/trigger', methods=['POST'])
def trigger_customer_journey():
    """触发客户旅程"""
    try:
        data = request.get_json()
        customer_id = data.get('customer_id')
        journey_id = data.get('journey_id')
        trigger_event = data.get('trigger_event', {})
        
        if not all([customer_id, journey_id]):
            return ApiResponse.validation_error("缺少必要参数")
        
        # 触发旅程
        result = marketing_service.journey_automation.trigger_journey(
            customer_id, journey_id, trigger_event
        )
        
        logger.info(f"旅程触发成功: customer_id={customer_id}, journey_id={journey_id}")
        return ApiResponse.success(result)
        
    except Exception as e:
        logger.error(f"旅程触发失败: {str(e)}")
        return ApiResponse.error(f"触发失败: {str(e)}", 500)


@app.route('/api/marketing/campaign/create', methods=['POST'])
def create_marketing_campaign():
    """创建个性化营销活动"""
    try:
        data = request.get_json()
        campaign_config = data.get('campaign_config', {})
        
        if not campaign_config:
            return ApiResponse.validation_error("缺少活动配置")
        
        # 创建营销活动
        campaign = marketing_service.campaign_engine.create_campaign(campaign_config)
        
        logger.info(f"营销活动创建完成: campaign_id={campaign.get('campaign_id')}")
        return ApiResponse.success(campaign)
        
    except Exception as e:
        logger.error(f"营销活动创建失败: {str(e)}")
        return ApiResponse.error(f"创建失败: {str(e)}", 500)


@app.route('/api/marketing/campaign/personalize', methods=['POST'])
def personalize_campaign():
    """个性化营销内容"""
    try:
        data = request.get_json()
        customer_id = data.get('customer_id')
        campaign_id = data.get('campaign_id')
        
        if not all([customer_id, campaign_id]):
            return ApiResponse.validation_error("缺少必要参数")
        
        # 个性化内容
        personalized_content = marketing_service.campaign_engine.personalize_content(
            customer_id, campaign_id
        )
        
        logger.info(f"内容个性化完成: customer_id={customer_id}, campaign_id={campaign_id}")
        return ApiResponse.success(personalized_content)
        
    except Exception as e:
        logger.error(f"内容个性化失败: {str(e)}")
        return ApiResponse.error(f"个性化失败: {str(e)}", 500)


@app.route('/api/marketing/email/send', methods=['POST'])
def send_smart_email():
    """发送智能邮件"""
    try:
        data = request.get_json()
        email_config = data.get('email_config', {})
        recipients = data.get('recipients', [])
        
        if not all([email_config, recipients]):
            return ApiResponse.validation_error("缺少邮件配置或收件人")
        
        # 发送智能邮件
        result = marketing_service.email_engine.send_email(email_config, recipients)
        
        logger.info(f"智能邮件发送完成: 收件人数={len(recipients)}")
        return ApiResponse.success(result)
        
    except Exception as e:
        logger.error(f"智能邮件发送失败: {str(e)}")
        return ApiResponse.error(f"发送失败: {str(e)}", 500)


@app.route('/api/marketing/email/optimize_timing', methods=['POST'])
def optimize_send_timing():
    """优化发送时间"""
    try:
        data = request.get_json()
        recipient_data = data.get('recipients', [])
        
        if not recipient_data:
            return ApiResponse.validation_error("缺少收件人数据")
        
        # 优化发送时间
        optimized_schedule = marketing_service.email_engine.optimize_send_time(recipient_data)
        
        logger.info(f"发送时间优化完成: 收件人数={len(recipient_data)}")
        return ApiResponse.success(optimized_schedule)
        
    except Exception as e:
        logger.error(f"发送时间优化失败: {str(e)}")
        return ApiResponse.error(f"优化失败: {str(e)}", 500)


@app.route('/api/marketing/email/predict_metrics', methods=['POST'])
def predict_email_metrics():
    """预测邮件指标"""
    try:
        data = request.get_json()
        email_content = data.get('email_content', {})
        recipient_segments = data.get('recipient_segments', [])
        
        if not all([email_content, recipient_segments]):
            return ApiResponse.validation_error("缺少邮件内容或收件人分群")
        
        # 预测邮件指标
        predictions = marketing_service.email_engine.predict_metrics(
            email_content, recipient_segments
        )
        
        logger.info(f"邮件指标预测完成: 分群数={len(recipient_segments)}")
        return ApiResponse.success(predictions)
        
    except Exception as e:
        logger.error(f"邮件指标预测失败: {str(e)}")
        return ApiResponse.error(f"预测失败: {str(e)}", 500)


# ===== 高级报表和分析API端点 =====

@app.route('/api/analytics/pivot', methods=['POST'])
def create_pivot_analysis():
    """创建数据透视分析"""
    try:
        data = request.get_json()
        dataset = data.get('data', [])
        config = data.get('config', {})
        
        if not dataset:
            return ApiResponse.validation_error("缺少数据集")
        
        # 创建透视表
        result = analytics_service.create_pivot_analysis(dataset, config)
        
        logger.info(f"数据透视分析完成: 数据行数={len(dataset)}")
        return ApiResponse.success(result)
        
    except Exception as e:
        logger.error(f"数据透视分析失败: {str(e)}")
        return ApiResponse.error(f"分析失败: {str(e)}", 500)


@app.route('/api/analytics/report/generate', methods=['POST'])
def generate_custom_report():
    """生成自定义报表"""
    try:
        data = request.get_json()
        report_config = data.get('config', {})
        dataset = data.get('data', [])
        
        if not all([report_config, dataset]):
            return ApiResponse.validation_error("缺少报表配置或数据")
        
        # 生成报表
        result = analytics_service.generate_custom_report(report_config, dataset)
        
        logger.info(f"自定义报表生成完成: 报表类型={report_config.get('report_type')}")
        return ApiResponse.success(result)
        
    except Exception as e:
        logger.error(f"报表生成失败: {str(e)}")
        return ApiResponse.error(f"生成失败: {str(e)}", 500)


@app.route('/api/analytics/anomaly/detect', methods=['POST'])
def detect_anomalies():
    """检测数据异常"""
    try:
        data = request.get_json()
        dataset = data.get('data', [])
        config = data.get('config', {})
        
        if not dataset:
            return ApiResponse.validation_error("缺少数据集")
        
        # 检测异常
        anomalies = analytics_service.detect_anomalies(dataset, config)
        
        logger.info(f"异常检测完成: 发现异常={len(anomalies)}个")
        return ApiResponse.success({
            'anomalies': anomalies,
            'total_anomalies': len(anomalies),
            'detection_method': config.get('method', 'isolation_forest'),
            'analyzed_metrics': config.get('monitor_metrics', [])
        })
        
    except Exception as e:
        logger.error(f"异常检测失败: {str(e)}")
        return ApiResponse.error(f"检测失败: {str(e)}", 500)


@app.route('/api/analytics/trend/predict', methods=['POST'])
def predict_trends():
    """预测数据趋势"""
    try:
        data = request.get_json()
        dataset = data.get('data', [])
        config = data.get('config', {})
        
        if not dataset:
            return ApiResponse.validation_error("缺少数据集")
        
        # 趋势预测
        result = analytics_service.predict_trends(dataset, config)
        
        logger.info(f"趋势预测完成: 方法={config.get('method', 'linear')}")
        return ApiResponse.success(result)
        
    except Exception as e:
        logger.error(f"趋势预测失败: {str(e)}")
        return ApiResponse.error(f"预测失败: {str(e)}", 500)


@app.route('/api/analytics/competitor/analyze', methods=['POST'])
def analyze_competitors():
    """竞争对手分析"""
    try:
        data = request.get_json()
        company_data = data.get('company_data', {})
        competitor_data = data.get('competitor_data', [])
        config = data.get('config', {})
        
        if not all([company_data, competitor_data]):
            return ApiResponse.validation_error("缺少公司数据或竞争对手数据")
        
        # 竞争对手分析
        result = analytics_service.analyze_competitors(company_data, competitor_data, config)
        
        logger.info(f"竞争对手分析完成: 竞争对手数量={len(competitor_data)}")
        return ApiResponse.success(result)
        
    except Exception as e:
        logger.error(f"竞争对手分析失败: {str(e)}")
        return ApiResponse.error(f"分析失败: {str(e)}", 500)


@app.route('/api/analytics/templates', methods=['GET'])
def get_report_templates():
    """获取报表模板列表"""
    try:
        templates = analytics_service.get_report_templates()
        
        return ApiResponse.success({
            'templates': templates,
            'total_templates': len(templates)
        })
        
    except Exception as e:
        logger.error(f"获取报表模板失败: {str(e)}")
        return ApiResponse.error(f"获取失败: {str(e)}", 500)


# ===== 聊天机器人API端点 =====

@app.route('/api/chat/message', methods=['POST'])
def chat_message():
    """处理聊天消息"""
    try:
        data = request.get_json()
        
        # 验证必需参数
        required_fields = ['user_id', 'message', 'session_id']
        for field in required_fields:
            if not data.get(field):
                return ApiResponse.validation_error(f"缺少必需参数: {field}")
        
        user_id = data.get('user_id')
        message = data.get('message')
        session_id = data.get('session_id')
        channel = data.get('channel', 'web')
        context = data.get('context', {})
        
        # 处理用户消息
        response = chatbot_service.process_message(
            user_id=user_id,
            message=message,
            session_id=session_id,
            channel=channel,
            context=context
        )
        
        logger.info(f"聊天消息处理完成: user_id={user_id}, intent={response.get('intent')}")
        return ApiResponse.success(response)
        
    except Exception as e:
        logger.error(f"聊天消息处理失败: {str(e)}")
        return ApiResponse.error(f"处理失败: {str(e)}", 500)


@app.route('/api/chat/session/<session_id>', methods=['GET'])
def get_chat_session(session_id):
    """获取聊天会话"""
    try:
        session = chatbot_service.get_session(session_id)
        
        if not session:
            return ApiResponse.not_found("会话不存在")
        
        return ApiResponse.success(session.__dict__)
        
    except Exception as e:
        logger.error(f"获取聊天会话失败: {str(e)}")
        return ApiResponse.error(f"获取失败: {str(e)}", 500)


@app.route('/api/chat/session/<session_id>/end', methods=['POST'])
def end_chat_session(session_id):
    """结束聊天会话"""
    try:
        success = chatbot_service.end_session(session_id)
        
        if success:
            logger.info(f"聊天会话已结束: session_id={session_id}")
            return ApiResponse.success({"message": "会话已成功结束"})
        else:
            return ApiResponse.not_found("会话不存在")
        
    except Exception as e:
        logger.error(f"结束聊天会话失败: {str(e)}")
        return ApiResponse.error(f"结束失败: {str(e)}", 500)


@app.route('/api/chat/knowledge/search', methods=['POST'])
def search_knowledge():
    """搜索知识库"""
    try:
        data = request.get_json()
        query = data.get('query', '')
        limit = data.get('limit', 10)
        
        if not query.strip():
            return ApiResponse.validation_error("搜索查询不能为空")
        
        results = chatbot_service.search_knowledge(query, limit)
        
        return ApiResponse.success({
            "query": query,
            "results": results,
            "total_results": len(results)
        })
        
    except Exception as e:
        logger.error(f"知识库搜索失败: {str(e)}")
        return ApiResponse.error(f"搜索失败: {str(e)}", 500)


@app.route('/api/chat/knowledge', methods=['POST'])
def update_knowledge():
    """更新知识库"""
    try:
        data = request.get_json()
        knowledge_items = data.get('knowledge_items', [])
        
        if not knowledge_items:
            return ApiResponse.validation_error("缺少知识条目")
        
        # 验证知识条目格式
        for item in knowledge_items:
            if not all(k in item for k in ['question', 'answer']):
                return ApiResponse.validation_error("知识条目必须包含question和answer字段")
        
        result = chatbot_service.update_knowledge_base(knowledge_items)
        
        if isinstance(result, dict) and result.get('success'):
            logger.info(f"知识库已更新: 添加{result.get('updated_items', len(knowledge_items))}个条目")
            return ApiResponse.success({
                "message": "知识库更新成功",
                "updated_items": result.get('updated_items', len(knowledge_items))
            })
        else:
            return ApiResponse.error(result.get('error', "知识库更新失败"), 500)
        
    except Exception as e:
        logger.error(f"知识库更新失败: {str(e)}")
        return ApiResponse.error(f"更新失败: {str(e)}", 500)


@app.route('/')
def index():
    """根路径"""
    return jsonify({
        "service": "ShopPro AI智能分析服务",
        "version": "2.0.0",
        "status": "running",
        "features": [
            "客户画像分析",
            "成交概率预测", 
            "智能话术推荐",
            "客户流失风险评估",
            "批量智能分析",
            "客户生命周期价值预测",
            "销售漏斗优化",
            "高级客户细分",
            "实时个性化推荐",
            "智能聊天机器人",
            "24/7客户服务",
            "知识问答系统",
            "智能销售助手",
            "多语言支持",
            "情感分析"
        ],
        "endpoints": {
            "health": "/api/health",
            "customer_analysis": "/api/customer/analysis",
            "sales_prediction": "/api/sales/prediction",
            "script_recommendation": "/api/script/recommendation", 
            "risk_analysis": "/api/risk/analysis",
            "batch_analysis": "/api/batch/analysis",
            "clv_prediction": "/api/advanced/clv_prediction",
            "funnel_analysis": "/api/advanced/funnel_analysis", 
            "customer_segmentation": "/api/advanced/customer_segmentation",
            "recommendations": "/api/advanced/recommendations",
            "user_profile": "/api/advanced/user_profile",
            "clv_training": "/api/advanced/batch_clv_training",
            "chat_message": "/api/chat/message",
            "chat_session": "/api/chat/session",
            "chat_knowledge_search": "/api/chat/knowledge/search",
            "chat_knowledge_update": "/api/chat/knowledge"
        }
    })


@app.errorhandler(404)
def not_found(error):
    """404错误处理"""
    return ApiResponse.not_found("接口不存在")


@app.errorhandler(500)
def internal_error(error):
    """500错误处理"""
    logger.error(f"服务器内部错误: {str(error)}")
    return ApiResponse.server_error("服务器内部错误")


if __name__ == '__main__':
    # 开发环境启动
    port = int(os.getenv('PORT', 5000))
    debug = os.getenv('FLASK_DEBUG', 'False').lower() == 'true'
    
    logger.info(f"启动AI服务: port={port}, debug={debug}")
    app.run(host='0.0.0.0', port=port, debug=debug)