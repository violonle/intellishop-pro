#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
销售预测服务
功能：
- 成交概率预测
- 销售周期预测
- 最佳跟进时间推荐
- 转化率分析

@author: ShopPro Team
@version: 1.0.0
"""

import numpy as np
import pandas as pd
from datetime import datetime, timedelta
from sklearn.ensemble import GradientBoostingClassifier, RandomForestRegressor
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, mean_squared_error
from loguru import logger
import joblib
import json


class SalesPredictionService:
    """销售预测服务"""
    
    def __init__(self, db_config, cache_manager):
        """初始化服务"""
        self.db = db_config
        self.cache = cache_manager
        self.scaler = StandardScaler()
        self.label_encoders = {}
        self.probability_model = None  # 成交概率预测模型
        self.cycle_model = None       # 销售周期预测模型
        self._load_or_train_models()
    
    def _load_or_train_models(self):
        """加载或训练模型"""
        try:
            # 尝试加载已训练的模型
            self.probability_model = joblib.load('./models/sales_probability_model.pkl')
            self.cycle_model = joblib.load('./models/sales_cycle_model.pkl')
            self.scaler = joblib.load('./models/sales_scaler.pkl')
            self.label_encoders = joblib.load('./models/sales_encoders.pkl')
            logger.info("销售预测模型加载成功")
        except FileNotFoundError:
            logger.info("模型文件不存在，开始训练新模型")
            self._train_models()
    
    def _train_models(self):
        """训练销售预测模型"""
        try:
            # 获取训练数据
            training_data = self._get_training_data()
            
            if training_data.empty:
                logger.warning("训练数据为空，使用默认模型")
                self._create_default_models()
                return
            
            # 特征工程
            features, probability_labels, cycle_labels = self._prepare_training_data(training_data)
            
            # 数据分割
            X_train, X_test, y_prob_train, y_prob_test, y_cycle_train, y_cycle_test = train_test_split(
                features, probability_labels, cycle_labels, test_size=0.2, random_state=42
            )
            
            # 特征缩放
            X_train_scaled = self.scaler.fit_transform(X_train)
            X_test_scaled = self.scaler.transform(X_test)
            
            # 训练成交概率预测模型
            self.probability_model = GradientBoostingClassifier(
                n_estimators=100,
                learning_rate=0.1,
                max_depth=6,
                random_state=42
            )
            self.probability_model.fit(X_train_scaled, y_prob_train)
            
            # 训练销售周期预测模型
            self.cycle_model = RandomForestRegressor(
                n_estimators=100,
                max_depth=10,
                random_state=42
            )
            self.cycle_model.fit(X_train_scaled, y_cycle_train)
            
            # 模型评估
            prob_accuracy = self.probability_model.score(X_test_scaled, y_prob_test)
            cycle_mse = mean_squared_error(y_cycle_test, self.cycle_model.predict(X_test_scaled))
            
            logger.info(f"成交概率模型准确率: {prob_accuracy:.3f}")
            logger.info(f"销售周期模型MSE: {cycle_mse:.3f}")
            
            # 保存模型
            joblib.dump(self.probability_model, './models/sales_probability_model.pkl')
            joblib.dump(self.cycle_model, './models/sales_cycle_model.pkl')
            joblib.dump(self.scaler, './models/sales_scaler.pkl')
            joblib.dump(self.label_encoders, './models/sales_encoders.pkl')
            
            logger.info("销售预测模型训练完成")
            
        except Exception as e:
            logger.error(f"模型训练失败: {str(e)}")
            self._create_default_models()
    
    def _create_default_models(self):
        """创建默认模型"""
        self.probability_model = GradientBoostingClassifier(n_estimators=10, random_state=42)
        self.cycle_model = RandomForestRegressor(n_estimators=10, random_state=42)
        
        # 使用虚拟数据训练
        dummy_data = np.random.rand(50, 15)
        dummy_prob_labels = np.random.randint(0, 2, 50)
        dummy_cycle_labels = np.random.randint(1, 180, 50)
        
        scaled_dummy = self.scaler.fit_transform(dummy_data)
        self.probability_model.fit(scaled_dummy, dummy_prob_labels)
        self.cycle_model.fit(scaled_dummy, dummy_cycle_labels)
    
    def _get_training_data(self):
        """获取训练数据"""
        query = """
        SELECT 
            l.*,
            c.level, c.status as customer_status, c.annual_income,
            c.age, c.gender, c.company,
            DATEDIFF(COALESCE(l.closed_at, NOW()), l.created_at) as actual_cycle_days,
            COUNT(f.id) as follow_up_count,
            AVG(CASE WHEN f.result = 'positive' THEN 1 
                     WHEN f.result = 'neutral' THEN 0.5 
                     ELSE 0 END) as avg_follow_up_score,
            DATEDIFF(NOW(), MAX(f.created_at)) as days_since_last_follow_up
        FROM leads l
        LEFT JOIN customers c ON l.customer_id = c.id
        LEFT JOIN follow_up_records f ON l.id = f.lead_id
        WHERE l.deleted = 0 AND c.deleted = 0
        GROUP BY l.id
        """
        
        try:
            return pd.read_sql(query, self.db.get_connection())
        except Exception as e:
            logger.error(f"获取训练数据失败: {str(e)}")
            return pd.DataFrame()
    
    def _prepare_training_data(self, data):
        """准备训练数据"""
        features = pd.DataFrame()
        
        # 线索基础特征
        features['estimated_value'] = data['estimated_value'].fillna(0)
        features['follow_up_count'] = data['follow_up_count'].fillna(0)
        features['avg_follow_up_score'] = data['avg_follow_up_score'].fillna(0)
        features['days_since_last_follow_up'] = data['days_since_last_follow_up'].fillna(999)
        
        # 客户特征
        features['annual_income'] = data['annual_income'].fillna(0)
        features['age'] = data['age'].fillna(35)  # 使用平均年龄填充
        
        # 编码分类特征
        categorical_columns = ['priority', 'source', 'level', 'customer_status', 'gender']
        for col in categorical_columns:
            if col not in self.label_encoders:
                self.label_encoders[col] = LabelEncoder()
            
            # 处理缺失值
            data[col] = data[col].fillna('unknown')
            
            # 确保编码器已拟合
            unique_values = data[col].unique()
            try:
                features[f'{col}_encoded'] = self.label_encoders[col].transform(data[col])
            except ValueError:
                # 如果有新的类别，重新拟合编码器
                self.label_encoders[col].fit(unique_values)
                features[f'{col}_encoded'] = self.label_encoders[col].transform(data[col])
        
        # 时间特征
        features['days_since_creation'] = (datetime.now() - pd.to_datetime(data['created_at'])).dt.days
        features['is_weekend'] = pd.to_datetime(data['created_at']).dt.dayofweek >= 5
        features['hour_created'] = pd.to_datetime(data['created_at']).dt.hour
        
        # 衍生特征
        features['value_per_follow_up'] = features['estimated_value'] / (features['follow_up_count'] + 1)
        features['follow_up_frequency'] = features['follow_up_count'] / (features['days_since_creation'] + 1)
        
        # 目标变量
        # 成交概率标签（0: 未成交, 1: 成交）
        probability_labels = (data['status'] == 'won').astype(int)
        
        # 销售周期标签（实际成交时间，未成交的使用当前时间）
        cycle_labels = data['actual_cycle_days'].fillna(
            (datetime.now() - pd.to_datetime(data['created_at'])).dt.days
        )
        
        return features.fillna(0), probability_labels, cycle_labels
    
    def predict_success_probability(self, lead_id):
        """预测成交概率"""
        try:
            # 检查缓存
            cache_key = f"sales_prediction:{lead_id}"
            cached_result = self.cache.get(cache_key)
            if cached_result:
                return json.loads(cached_result)
            
            # 获取线索数据
            lead_data = self._get_lead_data(lead_id)
            if lead_data.empty:
                raise ValueError(f"线索 {lead_id} 不存在")
            
            # 特征提取
            features = self._extract_lead_features(lead_data)
            scaled_features = self.scaler.transform([features])
            
            # 预测成交概率
            probability = self.probability_model.predict_proba(scaled_features)[0][1]
            
            # 预测销售周期
            predicted_cycle = int(self.cycle_model.predict(scaled_features)[0])
            
            # 生成预测结果
            prediction_result = {
                'lead_id': lead_id,
                'prediction_time': datetime.now().isoformat(),
                'success_probability': float(probability),
                'predicted_cycle_days': predicted_cycle,
                'confidence_level': self._calculate_confidence(probability),
                'risk_factors': self._identify_risk_factors(lead_data.iloc[0], features),
                'success_factors': self._identify_success_factors(lead_data.iloc[0], features),
                'recommendations': self._generate_sales_recommendations(lead_data.iloc[0], probability, predicted_cycle),
                'next_best_actions': self._suggest_next_actions(lead_data.iloc[0], probability)
            }
            
            # 缓存结果（30分钟）
            self.cache.set(cache_key, json.dumps(prediction_result), 1800)
            
            # 保存到数据库
            self._save_prediction_result(lead_id, prediction_result)
            
            return prediction_result
            
        except Exception as e:
            logger.error(f"销售预测失败: lead_id={lead_id}, error={str(e)}")
            raise
    
    def _get_lead_data(self, lead_id):
        """获取线索数据"""
        query = """
        SELECT 
            l.*,
            c.level, c.status as customer_status, c.annual_income,
            c.age, c.gender, c.company, c.name as customer_name,
            COUNT(f.id) as follow_up_count,
            AVG(CASE WHEN f.result = 'positive' THEN 1 
                     WHEN f.result = 'neutral' THEN 0.5 
                     ELSE 0 END) as avg_follow_up_score,
            DATEDIFF(NOW(), MAX(f.created_at)) as days_since_last_follow_up,
            DATEDIFF(NOW(), l.created_at) as days_since_creation
        FROM leads l
        LEFT JOIN customers c ON l.customer_id = c.id
        LEFT JOIN follow_up_records f ON l.id = f.lead_id
        WHERE l.id = %s AND l.deleted = 0
        GROUP BY l.id
        """
        
        return pd.read_sql(query, self.db.get_connection(), params=[lead_id])
    
    def _extract_lead_features(self, data):
        """提取线索特征"""
        row = data.iloc[0]
        features = []
        
        # 基础特征
        features.extend([
            row.get('estimated_value', 0),
            row.get('follow_up_count', 0),
            row.get('avg_follow_up_score', 0),
            row.get('days_since_last_follow_up', 999),
            row.get('annual_income', 0),
            row.get('age', 35),
        ])
        
        # 编码分类特征
        categorical_columns = ['priority', 'source', 'level', 'customer_status', 'gender']
        for col in categorical_columns:
            value = row.get(col, 'unknown')
            if col in self.label_encoders:
                try:
                    encoded = self.label_encoders[col].transform([value])[0]
                except ValueError:
                    encoded = 0  # 未知类别使用默认值
            else:
                encoded = 0
            features.append(encoded)
        
        # 时间特征
        features.extend([
            row.get('days_since_creation', 0),
            1 if pd.to_datetime(row['created_at']).dayofweek >= 5 else 0,  # 是否周末
            pd.to_datetime(row['created_at']).hour,
        ])
        
        # 衍生特征
        estimated_value = row.get('estimated_value', 0)
        follow_up_count = row.get('follow_up_count', 0)
        days_since_creation = row.get('days_since_creation', 1)
        
        features.extend([
            estimated_value / (follow_up_count + 1),  # 单次跟进价值
            follow_up_count / days_since_creation,    # 跟进频率
        ])
        
        return features
    
    def _calculate_confidence(self, probability):
        """计算置信度等级"""
        if probability >= 0.8:
            return "很高"
        elif probability >= 0.6:
            return "高"
        elif probability >= 0.4:
            return "中等"
        elif probability >= 0.2:
            return "低"
        else:
            return "很低"
    
    def _identify_risk_factors(self, lead, features):
        """识别风险因素"""
        risk_factors = []
        
        if lead.get('days_since_last_follow_up', 0) > 14:
            risk_factors.append("超过14天未跟进，客户可能流失")
        
        if lead.get('follow_up_count', 0) < 2:
            risk_factors.append("跟进次数不足，了解客户需求不够深入")
        
        if lead.get('avg_follow_up_score', 0) < 0.3:
            risk_factors.append("客户反馈较差，购买意向不强")
        
        if lead.get('estimated_value', 0) < 50000:
            risk_factors.append("预估价值较低，可能不是目标客户")
        
        if lead.get('customer_status') == 'inactive':
            risk_factors.append("客户状态不活跃，需要重新激活")
        
        return risk_factors
    
    def _identify_success_factors(self, lead, features):
        """识别成功因素"""
        success_factors = []
        
        if lead.get('level') in ['vip', 'diamond']:
            success_factors.append("高等级客户，成交可能性较大")
        
        if lead.get('avg_follow_up_score', 0) > 0.7:
            success_factors.append("客户反馈积极，购买意向强烈")
        
        if lead.get('annual_income', 0) > 500000:
            success_factors.append("客户经济实力强，预算充足")
        
        if lead.get('follow_up_count', 0) > 5:
            success_factors.append("跟进充分，客户关系良好")
        
        if lead.get('estimated_value', 0) > 500000:
            success_factors.append("高价值线索，值得重点投入")
        
        return success_factors
    
    def _generate_sales_recommendations(self, lead, probability, predicted_cycle):
        """生成销售建议"""
        recommendations = []
        
        if probability > 0.7:
            recommendations.append("成交概率很高，建议尽快推进成交流程")
            recommendations.append("准备合同和优惠方案，争取快速签约")
        elif probability > 0.5:
            recommendations.append("成交概率较高，继续保持跟进频率")
            recommendations.append("了解客户决策流程，针对性解决疑虑")
        elif probability > 0.3:
            recommendations.append("成交概率中等，需要加强客户需求挖掘")
            recommendations.append("提供更多产品信息和成功案例")
        else:
            recommendations.append("成交概率较低，建议重新评估客户价值")
            recommendations.append("考虑调整销售策略或转给其他销售人员")
        
        # 基于预测周期的建议
        if predicted_cycle > 90:
            recommendations.append(f"预计销售周期较长({predicted_cycle}天)，需要长期跟进计划")
        elif predicted_cycle < 30:
            recommendations.append(f"预计销售周期较短({predicted_cycle}天)，抓紧推进")
        
        return recommendations
    
    def _suggest_next_actions(self, lead, probability):
        """建议下一步行动"""
        actions = []
        
        days_since_follow_up = lead.get('days_since_last_follow_up', 0)
        
        if days_since_follow_up > 7:
            actions.append({
                'action': '立即联系客户',
                'priority': 'high',
                'reason': '超过一周未联系，需要主动跟进'
            })
        
        if probability > 0.6:
            actions.append({
                'action': '发送详细报价单',
                'priority': 'high',
                'reason': '成交概率较高，可以进入报价阶段'
            })
            actions.append({
                'action': '安排产品演示',
                'priority': 'medium',
                'reason': '通过演示增强客户信心'
            })
        elif probability > 0.3:
            actions.append({
                'action': '深入需求调研',
                'priority': 'high',
                'reason': '需要更好地了解客户需求'
            })
            actions.append({
                'action': '提供案例分享',
                'priority': 'medium',
                'reason': '通过成功案例建立信任'
            })
        else:
            actions.append({
                'action': '重新评估客户',
                'priority': 'medium',
                'reason': '成交概率较低，确认是否值得继续投入'
            })
        
        return actions
    
    def _save_prediction_result(self, lead_id, result):
        """保存预测结果到数据库"""
        try:
            query = """
            INSERT INTO ai_analytics (entity_type, entity_id, analysis_type, result, 
                                     confidence_score, model_version, processing_time, status)
            VALUES ('lead', %s, 'success_prediction', %s, %s, 'v2.1', %s, 'completed')
            ON DUPLICATE KEY UPDATE
                result = VALUES(result),
                confidence_score = VALUES(confidence_score),
                processing_time = VALUES(processing_time),
                created_at = NOW()
            """
            
            confidence = result.get('success_probability', 0.5)
            processing_time = 800  # 模拟处理时间
            
            with self.db.get_connection() as conn:
                cursor = conn.cursor()
                cursor.execute(query, [
                    lead_id,
                    json.dumps(result),
                    confidence,
                    processing_time
                ])
                conn.commit()
                
        except Exception as e:
            logger.error(f"保存预测结果失败: {str(e)}")
    
    def batch_predict(self, lead_ids):
        """批量预测"""
        results = []
        for lead_id in lead_ids:
            try:
                result = self.predict_success_probability(lead_id)
                results.append(result)
            except Exception as e:
                logger.error(f"批量预测失败: lead_id={lead_id}, error={str(e)}")
                results.append({
                    'lead_id': lead_id,
                    'error': str(e)
                })
        
        return results
    
    def get_model_performance(self):
        """获取模型性能指标"""
        try:
            # 获取最近的预测结果进行评估
            query = """
            SELECT 
                l.id, l.status,
                a.result, a.confidence_score, a.created_at
            FROM ai_analytics a
            JOIN leads l ON a.entity_id = l.id
            WHERE a.entity_type = 'lead' 
                AND a.analysis_type = 'success_prediction'
                AND a.created_at > DATE_SUB(NOW(), INTERVAL 30 DAY)
                AND l.status IN ('won', 'lost')
            ORDER BY a.created_at DESC
            LIMIT 1000
            """
            
            df = pd.read_sql(query, self.db.get_connection())
            
            if df.empty:
                return {"message": "暂无足够数据进行性能评估"}
            
            # 解析预测结果
            predictions = []
            actuals = []
            
            for _, row in df.iterrows():
                try:
                    result = json.loads(row['result'])
                    predicted_prob = result.get('success_probability', 0.5)
                    predicted = 1 if predicted_prob > 0.5 else 0
                    actual = 1 if row['status'] == 'won' else 0
                    
                    predictions.append(predicted)
                    actuals.append(actual)
                except:
                    continue
            
            if len(predictions) < 10:
                return {"message": "数据量不足，无法评估模型性能"}
            
            # 计算性能指标
            accuracy = sum([p == a for p, a in zip(predictions, actuals)]) / len(predictions)
            
            return {
                'total_predictions': len(predictions),
                'accuracy': round(accuracy, 3),
                'evaluation_period': '最近30天',
                'model_version': 'v2.1'
            }
            
        except Exception as e:
            logger.error(f"获取模型性能失败: {str(e)}")
            return {"error": str(e)}