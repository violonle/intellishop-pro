#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
客户画像分析服务
功能：
- RFM分析（最近购买时间、购买频率、购买金额）
- 客户价值分类
- 行为特征分析
- 个性化标签生成

@author: ShopPro Team
@version: 1.0.0
"""

import numpy as np
import pandas as pd
from datetime import datetime, timedelta
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import RandomForestClassifier
from loguru import logger
import joblib
import json


class CustomerAnalysisService:
    """客户画像分析服务"""
    
    def __init__(self, db_config, cache_manager):
        """初始化服务"""
        self.db = db_config
        self.cache = cache_manager
        self.scaler = StandardScaler()
        self.kmeans_model = None
        self.rf_model = None
        self._load_or_train_models()
    
    def _load_or_train_models(self):
        """加载或训练模型"""
        try:
            # 尝试加载已训练的模型
            self.kmeans_model = joblib.load('./models/customer_clustering_model.pkl')
            self.rf_model = joblib.load('./models/customer_classification_model.pkl')
            self.scaler = joblib.load('./models/customer_scaler.pkl')
            logger.info("客户分析模型加载成功")
        except FileNotFoundError:
            logger.info("模型文件不存在，开始训练新模型")
            self._train_models()
    
    def _train_models(self):
        """训练客户分析模型"""
        try:
            # 获取训练数据
            training_data = self._get_training_data()
            
            if training_data.empty:
                logger.warning("训练数据为空，使用默认模型")
                self._create_default_models()
                return
            
            # 特征工程
            features = self._extract_features(training_data)
            
            # 训练聚类模型（客户分群）
            scaled_features = self.scaler.fit_transform(features)
            self.kmeans_model = KMeans(n_clusters=5, random_state=42)
            self.kmeans_model.fit(scaled_features)
            
            # 训练分类模型（客户价值预测）
            labels = self._generate_value_labels(training_data)
            self.rf_model = RandomForestClassifier(n_estimators=100, random_state=42)
            self.rf_model.fit(scaled_features, labels)
            
            # 保存模型
            joblib.dump(self.kmeans_model, './models/customer_clustering_model.pkl')
            joblib.dump(self.rf_model, './models/customer_classification_model.pkl')
            joblib.dump(self.scaler, './models/customer_scaler.pkl')
            
            logger.info("客户分析模型训练完成")
            
        except Exception as e:
            logger.error(f"模型训练失败: {str(e)}")
            self._create_default_models()
    
    def _create_default_models(self):
        """创建默认模型"""
        self.kmeans_model = KMeans(n_clusters=5, random_state=42)
        self.rf_model = RandomForestClassifier(n_estimators=100, random_state=42)
        
        # 使用虚拟数据训练
        dummy_data = np.random.rand(100, 10)
        dummy_labels = np.random.randint(0, 3, 100)
        
        scaled_dummy = self.scaler.fit_transform(dummy_data)
        self.kmeans_model.fit(scaled_dummy)
        self.rf_model.fit(scaled_dummy, dummy_labels)
    
    def _get_training_data(self):
        """获取训练数据"""
        query = """
        SELECT 
            c.id, c.name, c.level, c.status, c.annual_income,
            c.created_at, c.tags,
            COUNT(l.id) as lead_count,
            AVG(l.success_probability) as avg_success_prob,
            SUM(l.estimated_value) as total_estimated_value,
            COUNT(f.id) as follow_up_count,
            DATEDIFF(NOW(), MAX(f.created_at)) as days_since_last_contact
        FROM customers c
        LEFT JOIN leads l ON c.id = l.customer_id
        LEFT JOIN follow_up_records f ON c.id = f.customer_id
        WHERE c.deleted = 0
        GROUP BY c.id
        """
        
        try:
            return pd.read_sql(query, self.db.get_connection())
        except Exception as e:
            logger.error(f"获取训练数据失败: {str(e)}")
            return pd.DataFrame()
    
    def _extract_features(self, data):
        """特征工程"""
        features = pd.DataFrame()
        
        # 基础特征
        features['annual_income'] = data['annual_income'].fillna(0)
        features['lead_count'] = data['lead_count'].fillna(0)
        features['avg_success_prob'] = data['avg_success_prob'].fillna(0)
        features['total_estimated_value'] = data['total_estimated_value'].fillna(0)
        features['follow_up_count'] = data['follow_up_count'].fillna(0)
        features['days_since_last_contact'] = data['days_since_last_contact'].fillna(999)
        
        # 衍生特征
        features['income_per_lead'] = features['total_estimated_value'] / (features['lead_count'] + 1)
        features['follow_up_frequency'] = features['follow_up_count'] / (features['lead_count'] + 1)
        
        # 客户等级编码
        level_mapping = {'normal': 1, 'vip': 2, 'diamond': 3}
        features['level_encoded'] = data['level'].map(level_mapping).fillna(1)
        
        # 客户状态编码
        status_mapping = {'potential': 1, 'active': 2, 'inactive': 3, 'lost': 0}
        features['status_encoded'] = data['status'].map(status_mapping).fillna(1)
        
        return features.fillna(0)
    
    def _generate_value_labels(self, data):
        """生成客户价值标签"""
        # 基于年收入和预估价值生成标签
        # 0: 低价值, 1: 中价值, 2: 高价值
        
        income = data['annual_income'].fillna(0)
        estimated_value = data['total_estimated_value'].fillna(0)
        
        labels = []
        for i, v in zip(income, estimated_value):
            if i >= 500000 or v >= 1000000:  # 高价值
                labels.append(2)
            elif i >= 200000 or v >= 300000:  # 中价值
                labels.append(1)
            else:  # 低价值
                labels.append(0)
        
        return np.array(labels)
    
    def analyze_customer_profile(self, customer_id):
        """分析客户画像"""
        try:
            # 检查缓存
            cache_key = f"customer_analysis:{customer_id}"
            cached_result = self.cache.get(cache_key)
            if cached_result:
                return json.loads(cached_result)
            
            # 获取客户数据
            customer_data = self._get_customer_data(customer_id)
            if customer_data.empty:
                raise ValueError(f"客户 {customer_id} 不存在")
            
            # 特征提取
            features = self._extract_features(customer_data)
            scaled_features = self.scaler.transform(features)
            
            # 执行分析
            analysis_result = {
                'customer_id': customer_id,
                'analysis_time': datetime.now().isoformat(),
                'basic_info': self._analyze_basic_info(customer_data.iloc[0]),
                'rfm_analysis': self._rfm_analysis(customer_data.iloc[0]),
                'cluster_analysis': self._cluster_analysis(scaled_features),
                'value_prediction': self._value_prediction(scaled_features),
                'behavioral_analysis': self._behavioral_analysis(customer_data.iloc[0]),
                'recommendations': self._generate_recommendations(customer_data.iloc[0])
            }
            
            # 缓存结果（1小时）
            self.cache.set(cache_key, json.dumps(analysis_result), 3600)
            
            # 保存到数据库
            self._save_analysis_result(customer_id, analysis_result)
            
            return analysis_result
            
        except Exception as e:
            logger.error(f"客户分析失败: customer_id={customer_id}, error={str(e)}")
            raise
    
    def _get_customer_data(self, customer_id):
        """获取客户数据"""
        query = """
        SELECT 
            c.*, 
            COUNT(l.id) as lead_count,
            AVG(l.success_probability) as avg_success_prob,
            SUM(l.estimated_value) as total_estimated_value,
            COUNT(f.id) as follow_up_count,
            DATEDIFF(NOW(), MAX(f.created_at)) as days_since_last_contact
        FROM customers c
        LEFT JOIN leads l ON c.id = l.customer_id
        LEFT JOIN follow_up_records f ON c.id = f.customer_id
        WHERE c.id = %s AND c.deleted = 0
        GROUP BY c.id
        """
        
        return pd.read_sql(query, self.db.get_connection(), params=[customer_id])
    
    def _analyze_basic_info(self, customer):
        """基础信息分析"""
        return {
            'name': customer['name'],
            'level': customer['level'],
            'status': customer['status'],
            'age': customer.get('age'),
            'gender': customer.get('gender'),
            'company': customer.get('company'),
            'annual_income': customer.get('annual_income'),
            'registration_days': (datetime.now() - customer['created_at']).days if customer['created_at'] else 0
        }
    
    def _rfm_analysis(self, customer):
        """RFM分析（最近性、频率、货币价值）"""
        # 简化的RFM分析
        recency = customer.get('days_since_last_contact', 999)
        frequency = customer.get('follow_up_count', 0)
        monetary = customer.get('total_estimated_value', 0)
        
        # RFM评分（1-5分）
        r_score = 5 if recency <= 7 else (4 if recency <= 30 else (3 if recency <= 90 else (2 if recency <= 180 else 1)))
        f_score = 5 if frequency >= 10 else (4 if frequency >= 5 else (3 if frequency >= 2 else (2 if frequency >= 1 else 1)))
        m_score = 5 if monetary >= 1000000 else (4 if monetary >= 500000 else (3 if monetary >= 100000 else (2 if monetary >= 10000 else 1)))
        
        rfm_segment = self._get_rfm_segment(r_score, f_score, m_score)
        
        return {
            'recency_score': r_score,
            'frequency_score': f_score,
            'monetary_score': m_score,
            'rfm_segment': rfm_segment,
            'days_since_last_contact': recency,
            'total_interactions': frequency,
            'total_value': monetary
        }
    
    def _get_rfm_segment(self, r, f, m):
        """获取RFM客户分群"""
        score = r * 100 + f * 10 + m
        
        if score >= 555:
            return "冠军客户"
        elif score >= 445:
            return "忠诚客户"
        elif score >= 344:
            return "潜力客户"
        elif score >= 233:
            return "新客户"
        elif score >= 155:
            return "风险客户"
        else:
            return "流失客户"
    
    def _cluster_analysis(self, scaled_features):
        """聚类分析"""
        cluster = self.kmeans_model.predict(scaled_features)[0]
        
        cluster_mapping = {
            0: "价格敏感型",
            1: "品质追求型", 
            2: "服务导向型",
            3: "冲动消费型",
            4: "理性决策型"
        }
        
        return {
            'cluster_id': int(cluster),
            'cluster_name': cluster_mapping.get(cluster, "未分类"),
            'cluster_description': self._get_cluster_description(cluster)
        }
    
    def _get_cluster_description(self, cluster_id):
        """获取聚类描述"""
        descriptions = {
            0: "对价格较为敏感，倾向于选择性价比高的产品",
            1: "注重产品品质和品牌，愿意为高质量产品付费",
            2: "重视服务体验，对售后服务要求较高",
            3: "决策速度快，容易被营销活动影响",
            4: "决策谨慎，需要充分的信息支持"
        }
        return descriptions.get(cluster_id, "暂无描述")
    
    def _value_prediction(self, scaled_features):
        """客户价值预测"""
        value_prob = self.rf_model.predict_proba(scaled_features)[0]
        value_class = self.rf_model.predict(scaled_features)[0]
        
        value_mapping = {0: "低价值", 1: "中价值", 2: "高价值"}
        
        return {
            'predicted_value': value_mapping[value_class],
            'value_probability': {
                '低价值': float(value_prob[0]),
                '中价值': float(value_prob[1]) if len(value_prob) > 1 else 0.0,
                '高价值': float(value_prob[2]) if len(value_prob) > 2 else 0.0
            },
            'confidence': float(np.max(value_prob))
        }
    
    def _behavioral_analysis(self, customer):
        """行为特征分析"""
        lead_count = customer.get('lead_count', 0)
        avg_success_prob = customer.get('avg_success_prob', 0)
        follow_up_count = customer.get('follow_up_count', 0)
        
        # 活跃度评估
        activity_level = "高" if follow_up_count >= 5 else ("中" if follow_up_count >= 2 else "低")
        
        # 购买倾向
        purchase_tendency = "高" if avg_success_prob >= 0.7 else ("中" if avg_success_prob >= 0.4 else "低")
        
        return {
            'activity_level': activity_level,
            'purchase_tendency': purchase_tendency,
            'interaction_count': follow_up_count,
            'lead_conversion_rate': avg_success_prob,
            'engagement_score': min(100, (follow_up_count * 20 + avg_success_prob * 50))
        }
    
    def _generate_recommendations(self, customer):
        """生成推荐策略"""
        level = customer.get('level', 'normal')
        status = customer.get('status', 'potential')
        days_since_contact = customer.get('days_since_last_contact', 999)
        
        recommendations = []
        
        # 基于状态的推荐
        if status == 'potential':
            recommendations.append("建议主动联系，了解具体需求")
        elif status == 'active':
            recommendations.append("保持定期跟进，提供个性化服务")
        elif status == 'inactive':
            recommendations.append("需要重新激活，可发送优惠信息")
        
        # 基于最后联系时间的推荐
        if days_since_contact > 30:
            recommendations.append("长时间未联系，建议主动关怀")
        elif days_since_contact > 7:
            recommendations.append("适时跟进，保持客户关系")
        
        # 基于等级的推荐
        if level == 'vip':
            recommendations.append("VIP客户，提供专属服务")
        elif level == 'diamond':
            recommendations.append("钻石客户，安排专门客户经理")
        
        return recommendations
    
    def _save_analysis_result(self, customer_id, result):
        """保存分析结果到数据库"""
        try:
            query = """
            INSERT INTO ai_analytics (entity_type, entity_id, analysis_type, result, 
                                     confidence_score, model_version, processing_time, status)
            VALUES ('customer', %s, 'customer_profile', %s, %s, 'v2.1', %s, 'completed')
            ON DUPLICATE KEY UPDATE
                result = VALUES(result),
                confidence_score = VALUES(confidence_score),
                processing_time = VALUES(processing_time),
                created_at = NOW()
            """
            
            confidence = result.get('value_prediction', {}).get('confidence', 0.5)
            processing_time = 1000  # 模拟处理时间
            
            with self.db.get_connection() as conn:
                cursor = conn.cursor()
                cursor.execute(query, [
                    customer_id,
                    json.dumps(result),
                    confidence,
                    processing_time
                ])
                conn.commit()
                
        except Exception as e:
            logger.error(f"保存分析结果失败: {str(e)}")
    
    def get_analysis_result(self, customer_id):
        """获取客户分析结果"""
        try:
            # 先从缓存获取
            cache_key = f"customer_analysis:{customer_id}"
            cached_result = self.cache.get(cache_key)
            if cached_result:
                return json.loads(cached_result)
            
            # 从数据库获取
            query = """
            SELECT result, confidence_score, created_at
            FROM ai_analytics
            WHERE entity_type = 'customer' AND entity_id = %s 
                AND analysis_type = 'customer_profile'
                AND status = 'completed'
            ORDER BY created_at DESC
            LIMIT 1
            """
            
            with self.db.get_connection() as conn:
                cursor = conn.cursor()
                cursor.execute(query, [customer_id])
                row = cursor.fetchone()
                
                if row:
                    return json.loads(row[0])
                else:
                    return None
                    
        except Exception as e:
            logger.error(f"获取分析结果失败: {str(e)}")
            return None