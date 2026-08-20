"""
ShopPro 高级AI算法服务
包含深度学习模型、预测性分析、智能推荐等高级功能
"""

import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor, GradientBoostingClassifier
from sklearn.neural_network import MLPRegressor, MLPClassifier
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error, classification_report
import joblib
import json
import logging
from datetime import datetime, timedelta
import warnings
warnings.filterwarnings('ignore')

logger = logging.getLogger(__name__)


class CustomerLifetimeValuePredictor:
    """客户生命周期价值预测器"""
    
    def __init__(self):
        self.model = None
        self.scaler = StandardScaler()
        self.feature_columns = [
            'recency', 'frequency', 'monetary', 'avg_order_value',
            'days_since_first_purchase', 'total_orders', 'total_spent',
            'avg_days_between_orders', 'customer_age_days', 'is_vip'
        ]
        
    def prepare_features(self, customer_data):
        """准备特征数据"""
        features = []
        
        for customer in customer_data:
            # 计算RFM指标
            recency = customer.get('recency', 0)
            frequency = customer.get('frequency', 1)
            monetary = customer.get('monetary', 0)
            
            # 计算其他特征
            avg_order_value = monetary / max(frequency, 1)
            days_since_first = customer.get('days_since_first_purchase', 0)
            total_orders = frequency
            total_spent = monetary
            
            # 计算平均订单间隔
            avg_days_between_orders = days_since_first / max(frequency - 1, 1) if frequency > 1 else days_since_first
            
            customer_age_days = customer.get('customer_age_days', 0)
            is_vip = 1 if customer.get('is_vip', False) else 0
            
            features.append([
                recency, frequency, monetary, avg_order_value,
                days_since_first, total_orders, total_spent,
                avg_days_between_orders, customer_age_days, is_vip
            ])
            
        return np.array(features)
    
    def train(self, training_data):
        """训练CLV预测模型"""
        logger.info("开始训练CLV预测模型")
        
        # 准备训练数据
        X = self.prepare_features(training_data)
        y = np.array([customer.get('actual_clv', 0) for customer in training_data])
        
        # 标准化特征
        X_scaled = self.scaler.fit_transform(X)
        
        # 分割训练和测试数据
        X_train, X_test, y_train, y_test = train_test_split(
            X_scaled, y, test_size=0.2, random_state=42
        )
        
        # 使用神经网络模型
        self.model = MLPRegressor(
            hidden_layer_sizes=(100, 50, 25),
            activation='relu',
            solver='adam',
            alpha=0.001,
            max_iter=1000,
            random_state=42
        )
        
        # 训练模型
        self.model.fit(X_train, y_train)
        
        # 评估模型
        y_pred = self.model.predict(X_test)
        mse = mean_squared_error(y_test, y_pred)
        
        logger.info(f"CLV预测模型训练完成，MSE: {mse:.2f}")
        
        return {
            'mse': mse,
            'model_info': 'MLPRegressor with 3 hidden layers'
        }
    
    def predict_clv(self, customer_data):
        """预测客户生命周期价值"""
        if not self.model:
            # 使用简化的启发式方法
            return self._heuristic_clv_prediction(customer_data)
        
        X = self.prepare_features(customer_data)
        X_scaled = self.scaler.transform(X)
        
        predictions = self.model.predict(X_scaled)
        
        results = []
        for i, customer in enumerate(customer_data):
            clv_score = max(0, predictions[i])  # 确保非负值
            
            # 计算置信区间
            confidence = min(0.95, customer.get('frequency', 1) / 10)
            
            # 分类CLV等级
            if clv_score >= 10000:
                clv_level = 'platinum'
            elif clv_score >= 5000:
                clv_level = 'gold'
            elif clv_score >= 1000:
                clv_level = 'silver'
            else:
                clv_level = 'bronze'
            
            results.append({
                'customer_id': customer.get('customer_id'),
                'predicted_clv': round(clv_score, 2),
                'clv_level': clv_level,
                'confidence': round(confidence, 2),
                'time_horizon_months': 12,
                'recommendations': self._generate_clv_recommendations(clv_level, clv_score)
            })
        
        return results
    
    def _heuristic_clv_prediction(self, customer_data):
        """启发式CLV预测（模型未训练时的备选方案）"""
        results = []
        
        for customer in customer_data:
            recency = customer.get('recency', 0)
            frequency = customer.get('frequency', 1)
            monetary = customer.get('monetary', 0)
            
            # 简化的CLV计算
            avg_order_value = monetary / max(frequency, 1)
            expected_lifespan_months = max(12 - (recency / 30), 3)  # 基于最近购买预测生命周期
            expected_purchases_per_month = frequency / 12 if frequency > 0 else 0.5
            
            clv_score = avg_order_value * expected_purchases_per_month * expected_lifespan_months
            
            # 分类CLV等级
            if clv_score >= 8000:
                clv_level = 'platinum'
            elif clv_score >= 4000:
                clv_level = 'gold'
            elif clv_score >= 1000:
                clv_level = 'silver'
            else:
                clv_level = 'bronze'
            
            results.append({
                'customer_id': customer.get('customer_id'),
                'predicted_clv': round(clv_score, 2),
                'clv_level': clv_level,
                'confidence': 0.7,  # 启发式方法的置信度较低
                'time_horizon_months': 12,
                'recommendations': self._generate_clv_recommendations(clv_level, clv_score)
            })
        
        return results
    
    def _generate_clv_recommendations(self, clv_level, clv_score):
        """生成基于CLV的建议"""
        recommendations = []
        
        if clv_level == 'platinum':
            recommendations = [
                '提供专属客户经理服务',
                '优先处理所有咨询和投诉',
                '提供独家产品和优先购买权',
                '定期举办VIP客户活动',
                '个性化定制产品和服务'
            ]
        elif clv_level == 'gold':
            recommendations = [
                '提供优先客户支持',
                '发送个性化产品推荐',
                '提供会员专享折扣',
                '邀请参加产品发布会',
                '建立长期合作关系'
            ]
        elif clv_level == 'silver':
            recommendations = [
                '发送定期营销邮件',
                '提供季节性促销活动',
                '推荐互补产品',
                '收集客户反馈意见',
                '提升客户体验质量'
            ]
        else:  # bronze
            recommendations = [
                '发送重新激活邮件',
                '提供新客户优惠券',
                '了解购买障碍因素',
                '提供产品使用指导',
                '建立品牌认知度'
            ]
        
        return recommendations


class SalesFunnelOptimizer:
    """智能销售漏斗优化器"""
    
    def __init__(self):
        self.conversion_model = None
        self.scaler = StandardScaler()
        
    def analyze_funnel_performance(self, funnel_data):
        """分析销售漏斗性能"""
        stages = ['awareness', 'interest', 'consideration', 'intent', 'evaluation', 'purchase']
        
        # 计算各阶段转化率
        conversion_rates = {}
        bottlenecks = []
        
        for i, stage in enumerate(stages):
            current_count = funnel_data.get(f'{stage}_count', 0)
            
            if i == 0:
                conversion_rates[stage] = 1.0  # 第一阶段转化率为100%
            else:
                previous_stage = stages[i-1]
                previous_count = funnel_data.get(f'{previous_stage}_count', 0)
                
                if previous_count > 0:
                    rate = current_count / previous_count
                    conversion_rates[stage] = rate
                    
                    # 识别瓶颈（转化率低于60%的阶段）
                    if rate < 0.6:
                        bottlenecks.append({
                            'stage': stage,
                            'conversion_rate': rate,
                            'potential_improvement': (0.7 - rate) * previous_count
                        })
                else:
                    conversion_rates[stage] = 0
        
        # 计算整体转化率
        overall_conversion = funnel_data.get('purchase_count', 0) / max(funnel_data.get('awareness_count', 1), 1)
        
        # 生成优化建议
        optimizations = self._generate_funnel_optimizations(conversion_rates, bottlenecks)
        
        return {
            'conversion_rates': conversion_rates,
            'overall_conversion': overall_conversion,
            'bottlenecks': bottlenecks,
            'optimizations': optimizations,
            'performance_score': self._calculate_funnel_score(conversion_rates)
        }
    
    def _generate_funnel_optimizations(self, conversion_rates, bottlenecks):
        """生成漏斗优化建议"""
        optimizations = []
        
        for bottleneck in bottlenecks:
            stage = bottleneck['stage']
            rate = bottleneck['conversion_rate']
            
            if stage == 'interest':
                optimizations.append({
                    'stage': stage,
                    'priority': 'high',
                    'recommendation': '优化内容营销策略，提供更有吸引力的产品信息',
                    'expected_improvement': f'{(0.7 - rate) * 100:.1f}%'
                })
            elif stage == 'consideration':
                optimizations.append({
                    'stage': stage,
                    'priority': 'high',
                    'recommendation': '提供更多产品对比信息和客户评价',
                    'expected_improvement': f'{(0.7 - rate) * 100:.1f}%'
                })
            elif stage == 'intent':
                optimizations.append({
                    'stage': stage,
                    'priority': 'critical',
                    'recommendation': '优化购买流程，减少步骤，提供更多支付选项',
                    'expected_improvement': f'{(0.8 - rate) * 100:.1f}%'
                })
            elif stage == 'evaluation':
                optimizations.append({
                    'stage': stage,
                    'priority': 'medium',
                    'recommendation': '提供免费试用或退货保证，降低购买风险',
                    'expected_improvement': f'{(0.75 - rate) * 100:.1f}%'
                })
            elif stage == 'purchase':
                optimizations.append({
                    'stage': stage,
                    'priority': 'critical',
                    'recommendation': '优化结账流程，提供实时客户支持',
                    'expected_improvement': f'{(0.85 - rate) * 100:.1f}%'
                })
        
        return optimizations
    
    def _calculate_funnel_score(self, conversion_rates):
        """计算漏斗性能评分"""
        weights = {
            'awareness': 0.1,
            'interest': 0.15,
            'consideration': 0.2,
            'intent': 0.25,
            'evaluation': 0.15,
            'purchase': 0.15
        }
        
        score = 0
        for stage, rate in conversion_rates.items():
            if stage in weights:
                score += rate * weights[stage] * 100
        
        return min(100, score)


class AdvancedCustomerSegmentation:
    """高级客户细分算法"""
    
    def __init__(self):
        self.clustering_model = None
        self.scaler = StandardScaler()
        self.feature_columns = [
            'rfm_score', 'clv_score', 'engagement_score', 'satisfaction_score',
            'loyalty_score', 'purchase_frequency', 'brand_affinity', 'price_sensitivity'
        ]
    
    def perform_advanced_segmentation(self, customer_data):
        """执行高级客户细分"""
        # 准备多维度特征
        features = self._extract_advanced_features(customer_data)
        
        # 执行多层次聚类
        segments = self._multi_level_clustering(features)
        
        # 生成细分洞察
        insights = self._generate_segment_insights(segments, customer_data)
        
        return {
            'segments': segments,
            'insights': insights,
            'segment_count': len(set(segments['cluster_labels'])),
            'segmentation_quality': self._evaluate_segmentation_quality(features, segments['cluster_labels'])
        }
    
    def _extract_advanced_features(self, customer_data):
        """提取高级特征"""
        features = []
        
        for customer in customer_data:
            # 基础RFM特征
            rfm_score = (
                (100 - customer.get('recency', 50)) * 0.3 +
                min(customer.get('frequency', 1) * 20, 100) * 0.4 +
                min(customer.get('monetary', 0) / 100, 100) * 0.3
            )
            
            # CLV评分
            clv_score = min(customer.get('predicted_clv', 1000) / 100, 100)
            
            # 参与度评分
            engagement_score = (
                customer.get('email_open_rate', 0.2) * 30 +
                customer.get('website_visits', 5) * 2 +
                customer.get('social_interactions', 0) * 5
            )
            engagement_score = min(engagement_score, 100)
            
            # 满意度评分
            satisfaction_score = customer.get('nps_score', 7) * 10
            
            # 忠诚度评分
            loyalty_score = min(
                customer.get('years_as_customer', 1) * 20 +
                customer.get('referrals_made', 0) * 15,
                100
            )
            
            # 购买频率标准化
            purchase_frequency = min(customer.get('frequency', 1) * 10, 100)
            
            # 品牌亲和力
            brand_affinity = customer.get('brand_engagement_score', 50)
            
            # 价格敏感性
            price_sensitivity = 100 - min(customer.get('avg_discount_used', 0.1) * 100, 100)
            
            features.append([
                rfm_score, clv_score, engagement_score, satisfaction_score,
                loyalty_score, purchase_frequency, brand_affinity, price_sensitivity
            ])
        
        return np.array(features)
    
    def _multi_level_clustering(self, features):
        """多层次聚类分析"""
        from sklearn.cluster import KMeans
        from sklearn.metrics import silhouette_score
        
        # 标准化特征
        features_scaled = self.scaler.fit_transform(features)
        
        # 寻找最优聚类数
        silhouette_scores = []
        K_range = range(3, 8)
        
        for k in K_range:
            kmeans = KMeans(n_clusters=k, random_state=42, n_init=10)
            labels = kmeans.fit_predict(features_scaled)
            score = silhouette_score(features_scaled, labels)
            silhouette_scores.append(score)
        
        # 选择最优K值
        optimal_k = K_range[np.argmax(silhouette_scores)]
        
        # 执行最终聚类
        self.clustering_model = KMeans(n_clusters=optimal_k, random_state=42, n_init=10)
        cluster_labels = self.clustering_model.fit_predict(features_scaled)
        
        return {
            'cluster_labels': cluster_labels,
            'optimal_k': optimal_k,
            'silhouette_score': max(silhouette_scores),
            'cluster_centers': self.clustering_model.cluster_centers_
        }
    
    def _generate_segment_insights(self, segments, customer_data):
        """生成细分洞察"""
        insights = []
        cluster_labels = segments['cluster_labels']
        
        for cluster_id in range(segments['optimal_k']):
            cluster_mask = cluster_labels == cluster_id
            cluster_customers = [customer for i, customer in enumerate(customer_data) if cluster_mask[i]]
            
            if not cluster_customers:
                continue
            
            # 计算聚类特征
            avg_rfm = {
                'recency': np.mean([c.get('recency', 0) for c in cluster_customers]),
                'frequency': np.mean([c.get('frequency', 0) for c in cluster_customers]),
                'monetary': np.mean([c.get('monetary', 0) for c in cluster_customers])
            }
            
            avg_clv = np.mean([c.get('predicted_clv', 0) for c in cluster_customers])
            customer_count = len(cluster_customers)
            
            # 生成细分标签和描述
            segment_label, description, strategy = self._classify_segment(avg_rfm, avg_clv, customer_count)
            
            insights.append({
                'cluster_id': cluster_id,
                'segment_label': segment_label,
                'description': description,
                'customer_count': customer_count,
                'percentage': (customer_count / len(customer_data)) * 100,
                'avg_rfm': avg_rfm,
                'avg_clv': avg_clv,
                'marketing_strategy': strategy
            })
        
        return insights
    
    def _classify_segment(self, avg_rfm, avg_clv, customer_count):
        """分类客户细分"""
        recency = avg_rfm['recency']
        frequency = avg_rfm['frequency']
        monetary = avg_rfm['monetary']
        
        if avg_clv > 8000 and frequency > 10:
            return (
                "VIP忠诚客户",
                "高价值、高频购买的忠诚客户群体",
                ["提供专属服务", "个性化产品推荐", "优先客户支持", "独家活动邀请"]
            )
        elif avg_clv > 5000 and recency < 60:
            return (
                "高价值客户",
                "具有高消费潜力的活跃客户",
                ["增值服务推广", "交叉销售", "会员计划", "忠诚度奖励"]
            )
        elif frequency > 5 and recency < 90:
            return (
                "活跃客户",
                "购买频率较高的稳定客户群体",
                ["保持互动", "定期促销", "产品更新通知", "客户满意度调研"]
            )
        elif recency > 180:
            return (
                "流失风险客户",
                "长时间未购买，存在流失风险",
                ["重新激活活动", "特殊优惠", "了解流失原因", "个性化挽回"]
            )
        elif monetary < 500:
            return (
                "价格敏感客户",
                "对价格敏感的成本导向客户",
                ["价格优惠", "性价比产品", "分期付款", "捆绑销售"]
            )
        else:
            return (
                "新客户",
                "新加入或低活跃度的客户群体",
                ["欢迎流程", "产品教育", "首次购买激励", "客户体验优化"]
            )
    
    def _evaluate_segmentation_quality(self, features, labels):
        """评估细分质量"""
        from sklearn.metrics import calinski_harabasz_score, davies_bouldin_score
        
        features_scaled = self.scaler.transform(features)
        
        # 计算多个质量指标
        silhouette = silhouette_score(features_scaled, labels)
        calinski_harabasz = calinski_harabasz_score(features_scaled, labels)
        davies_bouldin = davies_bouldin_score(features_scaled, labels)
        
        # 综合评分 (0-100)
        quality_score = (
            silhouette * 30 +  # 轮廓系数
            min(calinski_harabasz / 100, 1) * 40 +  # Calinski-Harabasz指数
            max(0, (2 - davies_bouldin) / 2) * 30  # Davies-Bouldin指数(越小越好)
        ) * 100
        
        return {
            'overall_score': round(quality_score, 2),
            'silhouette_score': round(silhouette, 3),
            'calinski_harabasz_score': round(calinski_harabasz, 2),
            'davies_bouldin_score': round(davies_bouldin, 3)
        }


class RealtimeRecommendationEngine:
    """实时推荐引擎"""
    
    def __init__(self):
        self.user_profiles = {}
        self.item_features = {}
        self.interaction_matrix = None
        
    def update_user_profile(self, user_id, interactions):
        """更新用户画像"""
        if user_id not in self.user_profiles:
            self.user_profiles[user_id] = {
                'preferences': {},
                'behavior_patterns': {},
                'last_updated': datetime.now()
            }
        
        profile = self.user_profiles[user_id]
        
        # 更新偏好
        for interaction in interactions:
            item_id = interaction.get('item_id')
            action = interaction.get('action')  # view, purchase, like, etc.
            weight = self._get_action_weight(action)
            
            if item_id not in profile['preferences']:
                profile['preferences'][item_id] = 0
            
            profile['preferences'][item_id] += weight
        
        # 更新行为模式
        profile['behavior_patterns'] = self._analyze_behavior_patterns(interactions)
        profile['last_updated'] = datetime.now()
    
    def get_recommendations(self, user_id, item_type='product', count=10):
        """获取实时推荐"""
        if user_id not in self.user_profiles:
            return self._get_popular_items(item_type, count)
        
        user_profile = self.user_profiles[user_id]
        
        # 协同过滤推荐
        collaborative_recs = self._collaborative_filtering(user_id, count)
        
        # 内容基础推荐
        content_recs = self._content_based_filtering(user_profile, item_type, count)
        
        # 混合推荐
        hybrid_recs = self._hybrid_recommendation(collaborative_recs, content_recs, count)
        
        # 添加推荐解释
        explained_recs = self._add_recommendation_explanations(hybrid_recs, user_profile)
        
        return explained_recs
    
    def _get_action_weight(self, action):
        """获取行为权重"""
        weights = {
            'view': 1.0,
            'like': 2.0,
            'share': 3.0,
            'add_to_cart': 4.0,
            'purchase': 5.0,
            'review': 3.0,
            'recommend': 4.0
        }
        return weights.get(action, 1.0)
    
    def _analyze_behavior_patterns(self, interactions):
        """分析用户行为模式"""
        if not interactions:
            return {}
        
        # 时间模式分析
        hours = [datetime.fromisoformat(i.get('timestamp', datetime.now().isoformat())).hour for i in interactions]
        most_active_hour = max(set(hours), key=hours.count) if hours else 12
        
        # 品类偏好
        categories = [i.get('category', 'unknown') for i in interactions]
        preferred_category = max(set(categories), key=categories.count) if categories else 'unknown'
        
        # 价格敏感性
        prices = [i.get('price', 0) for i in interactions if i.get('price')]
        avg_price = np.mean(prices) if prices else 0
        
        return {
            'most_active_hour': most_active_hour,
            'preferred_category': preferred_category,
            'avg_price_range': avg_price,
            'interaction_frequency': len(interactions),
            'diversity_score': len(set(categories)) / max(len(categories), 1)
        }
    
    def _collaborative_filtering(self, user_id, count):
        """协同过滤推荐"""
        # 简化的协同过滤实现
        user_prefs = self.user_profiles[user_id]['preferences']
        
        # 寻找相似用户
        similar_users = []
        for other_user_id, other_profile in self.user_profiles.items():
            if other_user_id != user_id:
                similarity = self._calculate_user_similarity(user_prefs, other_profile['preferences'])
                if similarity > 0.3:  # 相似度阈值
                    similar_users.append((other_user_id, similarity))
        
        # 基于相似用户推荐
        recommendations = {}
        for similar_user_id, similarity in similar_users:
            similar_prefs = self.user_profiles[similar_user_id]['preferences']
            for item_id, score in similar_prefs.items():
                if item_id not in user_prefs:  # 推荐用户未接触的物品
                    if item_id not in recommendations:
                        recommendations[item_id] = 0
                    recommendations[item_id] += score * similarity
        
        # 返回top推荐
        sorted_recs = sorted(recommendations.items(), key=lambda x: x[1], reverse=True)
        return [{'item_id': item_id, 'score': score, 'reason': 'collaborative'} 
                for item_id, score in sorted_recs[:count]]
    
    def _content_based_filtering(self, user_profile, item_type, count):
        """基于内容的推荐"""
        preferences = user_profile['preferences']
        behavior_patterns = user_profile['behavior_patterns']
        
        # 模拟商品数据库
        items = self._get_available_items(item_type)
        
        recommendations = []
        for item in items:
            score = self._calculate_content_similarity(item, preferences, behavior_patterns)
            if score > 0:
                recommendations.append({
                    'item_id': item['id'],
                    'score': score,
                    'reason': 'content_based'
                })
        
        # 按分数排序
        recommendations.sort(key=lambda x: x['score'], reverse=True)
        return recommendations[:count]
    
    def _hybrid_recommendation(self, collaborative_recs, content_recs, count):
        """混合推荐算法"""
        # 合并两种推荐结果
        all_recs = {}
        
        # 协同过滤推荐 (权重0.6)
        for rec in collaborative_recs:
            item_id = rec['item_id']
            all_recs[item_id] = {
                'score': rec['score'] * 0.6,
                'reasons': [rec['reason']]
            }
        
        # 内容推荐 (权重0.4)
        for rec in content_recs:
            item_id = rec['item_id']
            if item_id in all_recs:
                all_recs[item_id]['score'] += rec['score'] * 0.4
                all_recs[item_id]['reasons'].append(rec['reason'])
            else:
                all_recs[item_id] = {
                    'score': rec['score'] * 0.4,
                    'reasons': [rec['reason']]
                }
        
        # 转换为列表并排序
        final_recs = []
        for item_id, data in all_recs.items():
            final_recs.append({
                'item_id': item_id,
                'score': data['score'],
                'reasons': data['reasons']
            })
        
        final_recs.sort(key=lambda x: x['score'], reverse=True)
        return final_recs[:count]
    
    def _add_recommendation_explanations(self, recommendations, user_profile):
        """添加推荐解释"""
        explained_recs = []
        
        for rec in recommendations:
            explanation = self._generate_explanation(rec, user_profile)
            explained_recs.append({
                **rec,
                'explanation': explanation,
                'confidence': min(rec['score'] / 10, 1.0)  # 归一化置信度
            })
        
        return explained_recs
    
    def _generate_explanation(self, recommendation, user_profile):
        """生成推荐解释"""
        reasons = recommendation.get('reasons', [])
        
        if 'collaborative' in reasons and 'content_based' in reasons:
            return "基于相似用户喜好和您的历史偏好推荐"
        elif 'collaborative' in reasons:
            return "喜好相似的用户也喜欢这个商品"
        elif 'content_based' in reasons:
            return "根据您的历史购买记录推荐"
        else:
            return "热门商品推荐"
    
    def _calculate_user_similarity(self, prefs1, prefs2):
        """计算用户相似度"""
        common_items = set(prefs1.keys()) & set(prefs2.keys())
        if not common_items:
            return 0
        
        # 计算皮尔逊相关系数
        sum1 = sum(prefs1[item] for item in common_items)
        sum2 = sum(prefs2[item] for item in common_items)
        
        sum1Sq = sum(prefs1[item] ** 2 for item in common_items)
        sum2Sq = sum(prefs2[item] ** 2 for item in common_items)
        
        pSum = sum(prefs1[item] * prefs2[item] for item in common_items)
        
        num = pSum - (sum1 * sum2 / len(common_items))
        den = ((sum1Sq - sum1 ** 2 / len(common_items)) * 
               (sum2Sq - sum2 ** 2 / len(common_items))) ** 0.5
        
        if den == 0:
            return 0
        
        return num / den
    
    def _calculate_content_similarity(self, item, user_preferences, behavior_patterns):
        """计算内容相似度"""
        score = 0
        
        # 基于分类偏好
        if item.get('category') == behavior_patterns.get('preferred_category'):
            score += 3
        
        # 基于价格偏好
        item_price = item.get('price', 0)
        avg_price = behavior_patterns.get('avg_price_range', 0)
        if avg_price > 0:
            price_diff = abs(item_price - avg_price) / avg_price
            score += max(0, 2 - price_diff)  # 价格越接近，分数越高
        
        # 基于品牌偏好
        item_brand = item.get('brand', '')
        if any(item_brand in str(pref_item) for pref_item in user_preferences.keys()):
            score += 2
        
        return score
    
    def _get_available_items(self, item_type):
        """获取可用商品（模拟数据）"""
        # 这里应该连接到实际的商品数据库
        sample_items = [
            {'id': 'item_1', 'category': 'electronics', 'price': 999, 'brand': 'Apple'},
            {'id': 'item_2', 'category': 'electronics', 'price': 1299, 'brand': 'Samsung'},
            {'id': 'item_3', 'category': 'clothing', 'price': 89, 'brand': 'Nike'},
            {'id': 'item_4', 'category': 'books', 'price': 29, 'brand': 'Penguin'},
            {'id': 'item_5', 'category': 'home', 'price': 199, 'brand': 'IKEA'},
        ]
        return sample_items
    
    def _get_popular_items(self, item_type, count):
        """获取热门商品（用于新用户）"""
        popular_items = [
            {'item_id': 'popular_1', 'score': 0.9, 'explanation': '热门推荐', 'confidence': 0.7},
            {'item_id': 'popular_2', 'score': 0.85, 'explanation': '热门推荐', 'confidence': 0.7},
            {'item_id': 'popular_3', 'score': 0.8, 'explanation': '热门推荐', 'confidence': 0.7},
        ]
        return popular_items[:count]


# 全局实例
clv_predictor = CustomerLifetimeValuePredictor()
funnel_optimizer = SalesFunnelOptimizer()
customer_segmentation = AdvancedCustomerSegmentation()
recommendation_engine = RealtimeRecommendationEngine()