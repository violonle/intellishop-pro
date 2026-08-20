#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
ShopPro AI智能分析服务
主要功能：
- 客户画像分析
- 成交概率预测
- 智能话术推荐
- 销售预警分析

@author: ShopPro Team
@version: 1.0.0
"""

import os
import logging
from datetime import datetime
from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_restful import Api, Resource
from loguru import logger
import redis
import pandas as pd
from dotenv import load_dotenv

# 导入自定义模块
from services.customer_analysis import CustomerAnalysisService
from services.sales_prediction import SalesPredictionService
from services.script_recommendation import ScriptRecommendationService
from services.risk_analysis import RiskAnalysisService
from config.database import DatabaseConfig
from utils.response import ApiResponse
from utils.cache import CacheManager

# 加载环境变量
load_dotenv()

def create_app():
    """创建Flask应用"""
    app = Flask(__name__)
    
    # 配置CORS
    CORS(app, resources={
        r"/api/*": {
            "origins": ["http://localhost", "http://localhost:3000", "http://localhost:8080"],
            "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
            "allow_headers": ["Content-Type", "Authorization"]
        }
    })
    
    # 应用配置
    app.config.update({
        'SECRET_KEY': os.getenv('AI_SECRET_KEY', 'shoppro-ai-secret-2024'),
        'DEBUG': os.getenv('FLASK_DEBUG', 'False').lower() == 'true',
        'REDIS_URL': os.getenv('REDIS_URL', 'redis://localhost:6379/0'),
        'MODEL_PATH': os.getenv('MODEL_PATH', './models'),
        'DATABASE_URL': os.getenv('DATABASE_URL', 'mysql://root:123456@localhost:3306/shoppro_db')
    })
    
    # 配置日志
    logger.add(
        "/var/log/ai-service/app.log",
        rotation="1 day",
        retention="30 days",
        level="INFO",
        format="{time:YYYY-MM-DD HH:mm:ss} | {level} | {message}"
    )
    
    return app

# 创建应用实例
app = create_app()
api = Api(app)

# 初始化服务
try:
    # Redis连接
    redis_client = redis.from_url(app.config['REDIS_URL'])
    cache_manager = CacheManager(redis_client)
    
    # 数据库连接
    db_config = DatabaseConfig(app.config['DATABASE_URL'])
    
    # AI服务初始化
    customer_service = CustomerAnalysisService(db_config, cache_manager)
    sales_service = SalesPredictionService(db_config, cache_manager)
    script_service = ScriptRecommendationService(db_config, cache_manager)
    risk_service = RiskAnalysisService(db_config, cache_manager)
    
    logger.info("AI服务初始化成功")
    
except Exception as e:
    logger.error(f"AI服务初始化失败: {str(e)}")
    raise

class HealthCheck(Resource):
    """健康检查接口"""
    
    def get(self):
        """健康检查"""
        try:
            # 检查Redis连接
            redis_client.ping()
            
            # 检查数据库连接
            db_config.test_connection()
            
            return ApiResponse.success({
                "status": "healthy",
                "timestamp": datetime.now().isoformat(),
                "version": "1.0.0",
                "services": {
                    "redis": "connected",
                    "database": "connected",
                    "ai_models": "loaded"
                }
            })
        except Exception as e:
            logger.error(f"健康检查失败: {str(e)}")
            return ApiResponse.error(f"服务异常: {str(e)}", 500)

class CustomerAnalysis(Resource):
    """客户分析接口"""
    
    def post(self):
        """客户画像分析"""
        try:
            data = request.get_json()
            customer_id = data.get('customer_id')
            
            if not customer_id:
                return ApiResponse.error("缺少客户ID参数")
            
            # 执行客户分析
            result = customer_service.analyze_customer_profile(customer_id)
            
            logger.info(f"客户分析完成: customer_id={customer_id}")
            return ApiResponse.success(result)
            
        except Exception as e:
            logger.error(f"客户分析失败: {str(e)}")
            return ApiResponse.error(f"分析失败: {str(e)}", 500)
    
    def get(self, customer_id):
        """获取客户分析结果"""
        try:
            # 从缓存获取分析结果
            result = customer_service.get_analysis_result(customer_id)
            
            if result:
                return ApiResponse.success(result)
            else:
                return ApiResponse.error("未找到分析结果", 404)
                
        except Exception as e:
            logger.error(f"获取客户分析失败: {str(e)}")
            return ApiResponse.error(f"获取失败: {str(e)}", 500)

class SalesPrediction(Resource):
    """销售预测接口"""
    
    def post(self):
        """成交概率预测"""
        try:
            data = request.get_json()
            lead_id = data.get('lead_id')
            
            if not lead_id:
                return ApiResponse.error("缺少线索ID参数")
            
            # 执行成交预测
            result = sales_service.predict_success_probability(lead_id)
            
            logger.info(f"成交预测完成: lead_id={lead_id}, probability={result.get('probability', 0)}")
            return ApiResponse.success(result)
            
        except Exception as e:
            logger.error(f"成交预测失败: {str(e)}")
            return ApiResponse.error(f"预测失败: {str(e)}", 500)

class ScriptRecommendation(Resource):
    """话术推荐接口"""
    
    def post(self):
        """智能话术推荐"""
        try:
            data = request.get_json()
            customer_id = data.get('customer_id')
            scenario = data.get('scenario', 'general')  # 场景：general, objection, closing等
            
            if not customer_id:
                return ApiResponse.error("缺少客户ID参数")
            
            # 执行话术推荐
            result = script_service.recommend_scripts(customer_id, scenario)
            
            logger.info(f"话术推荐完成: customer_id={customer_id}, scenario={scenario}")
            return ApiResponse.success(result)
            
        except Exception as e:
            logger.error(f"话术推荐失败: {str(e)}")
            return ApiResponse.error(f"推荐失败: {str(e)}", 500)

class RiskAnalysis(Resource):
    """风险分析接口"""
    
    def post(self):
        """客户流失风险分析"""
        try:
            data = request.get_json()
            customer_ids = data.get('customer_ids', [])
            
            if not customer_ids:
                return ApiResponse.error("缺少客户ID列表")
            
            # 执行风险分析
            result = risk_service.analyze_churn_risk(customer_ids)
            
            logger.info(f"风险分析完成: 分析客户数={len(customer_ids)}")
            return ApiResponse.success(result)
            
        except Exception as e:
            logger.error(f"风险分析失败: {str(e)}")
            return ApiResponse.error(f"分析失败: {str(e)}", 500)

class BatchAnalysis(Resource):
    """批量分析接口"""
    
    def post(self):
        """批量AI分析任务"""
        try:
            data = request.get_json()
            analysis_type = data.get('type')  # customer, sales, risk
            entity_ids = data.get('entity_ids', [])
            
            if not analysis_type or not entity_ids:
                return ApiResponse.error("缺少分析类型或实体ID列表")
            
            # 根据分析类型执行批量分析
            if analysis_type == 'customer':
                results = []
                for customer_id in entity_ids:
                    result = customer_service.analyze_customer_profile(customer_id)
                    results.append({
                        'customer_id': customer_id,
                        'analysis': result
                    })
            elif analysis_type == 'sales':
                results = []
                for lead_id in entity_ids:
                    result = sales_service.predict_success_probability(lead_id)
                    results.append({
                        'lead_id': lead_id,
                        'prediction': result
                    })
            else:
                return ApiResponse.error("不支持的分析类型")
            
            logger.info(f"批量分析完成: type={analysis_type}, count={len(entity_ids)}")
            return ApiResponse.success({
                'analysis_type': analysis_type,
                'total_count': len(entity_ids),
                'results': results
            })
            
        except Exception as e:
            logger.error(f"批量分析失败: {str(e)}")
            return ApiResponse.error(f"分析失败: {str(e)}", 500)

# 注册API路由
api.add_resource(HealthCheck, '/health', '/api/health')
api.add_resource(CustomerAnalysis, '/api/customer/analysis', '/api/customer/analysis/<int:customer_id>')
api.add_resource(SalesPrediction, '/api/sales/prediction')
api.add_resource(ScriptRecommendation, '/api/script/recommendation')
api.add_resource(RiskAnalysis, '/api/risk/analysis')
api.add_resource(BatchAnalysis, '/api/batch/analysis')

@app.route('/')
def index():
    """根路径"""
    return jsonify({
        "service": "ShopPro AI智能分析服务",
        "version": "1.0.0",
        "status": "running",
        "docs": "/api/docs",
        "health": "/api/health"
    })

@app.errorhandler(404)
def not_found(error):
    """404错误处理"""
    return ApiResponse.error("接口不存在", 404)

@app.errorhandler(500)
def internal_error(error):
    """500错误处理"""
    logger.error(f"服务器内部错误: {str(error)}")
    return ApiResponse.error("服务器内部错误", 500)

if __name__ == '__main__':
    # 开发环境启动
    port = int(os.getenv('PORT', 5000))
    debug = os.getenv('FLASK_DEBUG', 'False').lower() == 'true'
    
    logger.info(f"启动AI服务: port={port}, debug={debug}")
    app.run(host='0.0.0.0', port=port, debug=debug)