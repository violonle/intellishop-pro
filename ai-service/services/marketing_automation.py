"""
ShopPro 智能营销自动化服务
包含客户旅程自动化、个性化营销活动、智能邮件营销等功能
"""

import numpy as np
import pandas as pd
import json
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Tuple
import re
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler
import warnings
warnings.filterwarnings('ignore')

logger = logging.getLogger(__name__)


class CustomerJourneyAutomation:
    """客户旅程自动化引擎"""
    
    def __init__(self):
        self.journey_templates = {}
        self.trigger_rules = {}
        self.automation_sequences = {}
        self.load_journey_templates()
    
    def load_journey_templates(self):
        """加载预定义的客户旅程模板"""
        self.journey_templates = {
            'new_customer_onboarding': {
                'name': '新客户引导流程',
                'description': '为新注册客户提供个性化引导体验',
                'stages': [
                    {
                        'stage': 'welcome',
                        'name': '欢迎阶段',
                        'duration_hours': 0,
                        'actions': ['send_welcome_email', 'assign_customer_success_manager'],
                        'conditions': ['customer_status == new']
                    },
                    {
                        'stage': 'product_introduction',
                        'name': '产品介绍',
                        'duration_hours': 24,
                        'actions': ['send_product_guide', 'schedule_demo'],
                        'conditions': ['welcome_email_opened']
                    },
                    {
                        'stage': 'first_purchase_incentive',
                        'name': '首购激励',
                        'duration_hours': 72,
                        'actions': ['send_discount_coupon', 'recommend_starter_products'],
                        'conditions': ['no_purchase_made', 'engagement_score > 3']
                    }
                ]
            },
            'customer_retention': {
                'name': '客户留存计划',
                'description': '针对长期客户的留存策略',
                'stages': [
                    {
                        'stage': 'loyalty_check',
                        'name': '忠诚度检查',
                        'duration_hours': 0,
                        'actions': ['analyze_purchase_patterns', 'calculate_satisfaction_score'],
                        'conditions': ['customer_age > 365', 'total_orders > 5']
                    },
                    {
                        'stage': 'personalized_offers',
                        'name': '个性化优惠',
                        'duration_hours': 168,  # 1周
                        'actions': ['generate_personal_offers', 'send_vip_invitation'],
                        'conditions': ['loyalty_score > 7', 'recent_activity']
                    }
                ]
            },
            'win_back_campaign': {
                'name': '客户挽回活动',
                'description': '重新激活流失客户',
                'stages': [
                    {
                        'stage': 'churn_detection',
                        'name': '流失检测',
                        'duration_hours': 0,
                        'actions': ['analyze_churn_risk', 'segment_churn_reasons'],
                        'conditions': ['days_since_last_purchase > 90']
                    },
                    {
                        'stage': 'win_back_offer',
                        'name': '挽回优惠',
                        'duration_hours': 48,
                        'actions': ['send_win_back_email', 'offer_special_discount'],
                        'conditions': ['churn_risk == high']
                    },
                    {
                        'stage': 'personal_outreach',
                        'name': '人工外联',
                        'duration_hours': 168,
                        'actions': ['schedule_personal_call', 'send_feedback_survey'],
                        'conditions': ['no_response_to_email', 'customer_value > 5000']
                    }
                ]
            }
        }
    
    def create_customer_journey(self, customer_data, journey_type='auto'):
        """为客户创建个性化旅程"""
        try:
            # 自动选择最适合的旅程类型
            if journey_type == 'auto':
                journey_type = self._determine_optimal_journey(customer_data)
            
            if journey_type not in self.journey_templates:
                raise ValueError(f"未知的旅程类型: {journey_type}")
            
            template = self.journey_templates[journey_type]
            
            # 个性化旅程参数
            personalized_journey = self._personalize_journey(template, customer_data)
            
            # 创建执行计划
            execution_plan = self._create_execution_plan(personalized_journey, customer_data)
            
            logger.info(f"为客户 {customer_data.get('customer_id')} 创建了 {journey_type} 旅程")
            
            return {
                'journey_id': f"{journey_type}_{customer_data.get('customer_id')}_{int(datetime.now().timestamp())}",
                'customer_id': customer_data.get('customer_id'),
                'journey_type': journey_type,
                'template': template,
                'personalized_journey': personalized_journey,
                'execution_plan': execution_plan,
                'status': 'created',
                'created_at': datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"创建客户旅程失败: {str(e)}")
            raise
    
    def _determine_optimal_journey(self, customer_data):
        """自动确定最优的客户旅程类型"""
        customer_age_days = customer_data.get('customer_age_days', 0)
        days_since_last_purchase = customer_data.get('days_since_last_purchase', 0)
        total_orders = customer_data.get('total_orders', 0)
        
        # 新客户
        if customer_age_days <= 7 or total_orders == 0:
            return 'new_customer_onboarding'
        
        # 流失风险客户
        elif days_since_last_purchase > 90:
            return 'win_back_campaign'
        
        # 长期客户
        elif customer_age_days > 365 and total_orders > 5:
            return 'customer_retention'
        
        # 默认使用新客户流程
        return 'new_customer_onboarding'
    
    def _personalize_journey(self, template, customer_data):
        """根据客户数据个性化旅程"""
        personalized = template.copy()
        
        # 根据客户特征调整时间间隔
        engagement_score = customer_data.get('engagement_score', 5)
        if engagement_score > 7:
            # 高参与度客户，缩短时间间隔
            for stage in personalized['stages']:
                stage['duration_hours'] = max(1, int(stage['duration_hours'] * 0.7))
        elif engagement_score < 3:
            # 低参与度客户，延长时间间隔
            for stage in personalized['stages']:
                stage['duration_hours'] = int(stage['duration_hours'] * 1.5)
        
        # 根据客户偏好调整行动
        preferred_channel = customer_data.get('preferred_communication_channel', 'email')
        for stage in personalized['stages']:
            stage['preferred_channel'] = preferred_channel
            
        return personalized
    
    def _create_execution_plan(self, journey, customer_data):
        """创建旅程执行计划"""
        plan = []
        current_time = datetime.now()
        
        for i, stage in enumerate(journey['stages']):
            execution_time = current_time + timedelta(hours=stage['duration_hours'])
            
            plan.append({
                'stage_index': i,
                'stage': stage,
                'execution_time': execution_time.isoformat(),
                'status': 'pending',
                'conditions_met': self._check_stage_conditions(stage, customer_data)
            })
            
            # 累加时间
            current_time = execution_time
        
        return plan
    
    def _check_stage_conditions(self, stage, customer_data):
        """检查阶段执行条件"""
        conditions = stage.get('conditions', [])
        if not conditions:
            return True
        
        for condition in conditions:
            if not self._evaluate_condition(condition, customer_data):
                return False
        
        return True
    
    def _evaluate_condition(self, condition, customer_data):
        """评估单个条件"""
        try:
            # 简单的条件解析和评估
            if '==' in condition:
                field, value = condition.split('==')
                field, value = field.strip(), value.strip()
                return str(customer_data.get(field, '')).strip() == value
            elif '>' in condition:
                field, value = condition.split('>')
                field, value = field.strip(), float(value.strip())
                return float(customer_data.get(field, 0)) > value
            elif '<' in condition:
                field, value = condition.split('<')
                field, value = field.strip(), float(value.strip())
                return float(customer_data.get(field, 0)) < value
            else:
                # 简单的布尔条件
                return bool(customer_data.get(condition, False))
        except:
            return False


class PersonalizedCampaignEngine:
    """个性化营销活动引擎"""
    
    def __init__(self):
        self.campaign_templates = {}
        self.personalization_rules = {}
        self.load_campaign_templates()
    
    def load_campaign_templates(self):
        """加载营销活动模板"""
        self.campaign_templates = {
            'seasonal_promotion': {
                'name': '季节性促销活动',
                'description': '基于季节和节日的促销活动',
                'channels': ['email', 'sms', 'push_notification', 'social_media'],
                'content_templates': {
                    'subject_templates': [
                        '🎉 专属{season}优惠来了！{discount}折扣等您拿',
                        '⏰ 限时{season}特惠，仅剩{hours}小时',
                        '🔥 {season}热销榜单，{product_name}等您选购'
                    ],
                    'body_templates': [
                        '亲爱的{customer_name}，{season}专属优惠来袭！精选商品享{discount}折，立即购买！',
                        '您好{customer_name}，基于您的购买偏好，我们为您推荐以下{season}热门产品...'
                    ]
                },
                'personalization_factors': ['purchase_history', 'seasonal_preferences', 'price_sensitivity']
            },
            'birthday_campaign': {
                'name': '生日营销活动',
                'description': '个性化生日祝福和专属优惠',
                'channels': ['email', 'sms'],
                'content_templates': {
                    'subject_templates': [
                        '🎂 生日快乐！{customer_name}，您的专属礼物来了',
                        '🎁 特别的日子，特别的优惠给特别的您'
                    ],
                    'body_templates': [
                        '生日快乐，{customer_name}！在这个特别的日子里，我们为您准备了{discount}%的生日折扣券...'
                    ]
                },
                'personalization_factors': ['age', 'purchase_history', 'brand_preference']
            },
            'product_recommendation': {
                'name': '产品推荐活动',
                'description': '基于AI算法的个性化产品推荐',
                'channels': ['email', 'app_notification'],
                'content_templates': {
                    'subject_templates': [
                        '💡 为您量身定制：{product_name}等{count}款推荐',
                        '🎯 猜您喜欢：基于您的购买偏好精选'
                    ],
                    'body_templates': [
                        '根据您的购买历史和偏好，我们为您精选了以下商品：{product_list}...'
                    ]
                },
                'personalization_factors': ['purchase_history', 'browsing_behavior', 'similar_customers']
            }
        }
    
    def create_personalized_campaign(self, customer_segments, campaign_type, campaign_config=None):
        """创建个性化营销活动"""
        try:
            if campaign_type not in self.campaign_templates:
                raise ValueError(f"未知的活动类型: {campaign_type}")
            
            template = self.campaign_templates[campaign_type]
            config = campaign_config or {}
            
            campaigns = []
            
            for segment in customer_segments:
                # 为每个客户群体创建定制活动
                personalized_campaign = self._personalize_campaign_for_segment(
                    template, segment, config
                )
                campaigns.append(personalized_campaign)
            
            return {
                'campaign_batch_id': f"{campaign_type}_{int(datetime.now().timestamp())}",
                'campaign_type': campaign_type,
                'total_campaigns': len(campaigns),
                'campaigns': campaigns,
                'created_at': datetime.now().isoformat(),
                'status': 'created'
            }
            
        except Exception as e:
            logger.error(f"创建个性化活动失败: {str(e)}")
            raise
    
    def _personalize_campaign_for_segment(self, template, segment, config):
        """为特定客户群体个性化活动"""
        segment_characteristics = segment.get('characteristics', {})
        customers = segment.get('customers', [])
        
        # 选择最适合的渠道
        optimal_channels = self._select_optimal_channels(
            template['channels'], segment_characteristics
        )
        
        # 生成个性化内容
        personalized_content = self._generate_segment_content(
            template, segment_characteristics, config
        )
        
        # 确定发送时间
        optimal_timing = self._calculate_optimal_timing(segment_characteristics)
        
        return {
            'segment_id': segment.get('segment_id'),
            'segment_name': segment.get('segment_name', 'Unknown'),
            'target_customers': len(customers),
            'channels': optimal_channels,
            'content': personalized_content,
            'timing': optimal_timing,
            'expected_engagement_rate': self._predict_engagement_rate(segment_characteristics),
            'budget_allocation': self._calculate_budget_allocation(len(customers), optimal_channels)
        }
    
    def _select_optimal_channels(self, available_channels, segment_characteristics):
        """为客户群体选择最优渠道"""
        channel_preferences = segment_characteristics.get('channel_preferences', {})
        age_group = segment_characteristics.get('avg_age_group', 'adult')
        engagement_level = segment_characteristics.get('avg_engagement_level', 'medium')
        
        # 基于客户特征的渠道优先级
        channel_priority = {}
        
        for channel in available_channels:
            priority = 0.5  # 基础优先级
            
            # 基于年龄组调整
            if age_group == 'young' and channel in ['social_media', 'app_notification']:
                priority += 0.3
            elif age_group == 'senior' and channel == 'email':
                priority += 0.2
            
            # 基于参与度调整
            if engagement_level == 'high' and channel in ['email', 'push_notification']:
                priority += 0.2
            elif engagement_level == 'low' and channel == 'sms':
                priority += 0.1
            
            # 基于历史偏好调整
            if channel in channel_preferences:
                priority += channel_preferences[channel] * 0.3
            
            channel_priority[channel] = priority
        
        # 选择优先级最高的2-3个渠道
        sorted_channels = sorted(channel_priority.items(), key=lambda x: x[1], reverse=True)
        return [channel for channel, _ in sorted_channels[:3]]
    
    def _generate_segment_content(self, template, segment_characteristics, config):
        """为客户群体生成个性化内容"""
        content_templates = template['content_templates']
        
        # 获取群体特征用于内容个性化
        avg_age = segment_characteristics.get('avg_age', 35)
        dominant_interests = segment_characteristics.get('dominant_interests', ['general'])
        price_sensitivity = segment_characteristics.get('avg_price_sensitivity', 'medium')
        
        # 选择最合适的内容模板
        subject_template = self._select_best_template(
            content_templates['subject_templates'], segment_characteristics
        )
        body_template = self._select_best_template(
            content_templates['body_templates'], segment_characteristics
        )
        
        # 生成个性化参数
        personalization_params = self._generate_personalization_params(
            segment_characteristics, config
        )
        
        return {
            'subject_template': subject_template,
            'body_template': body_template,
            'personalization_params': personalization_params,
            'call_to_action': self._generate_cta(segment_characteristics),
            'visual_style': self._select_visual_style(segment_characteristics)
        }
    
    def _select_best_template(self, templates, segment_characteristics):
        """选择最适合群体的内容模板"""
        # 简化实现：基于群体特征选择模板
        engagement_level = segment_characteristics.get('avg_engagement_level', 'medium')
        
        if engagement_level == 'high' and len(templates) > 2:
            return templates[2]  # 选择更有吸引力的模板
        elif engagement_level == 'low':
            return templates[0]  # 选择简单直接的模板
        else:
            return templates[1] if len(templates) > 1 else templates[0]
    
    def _generate_personalization_params(self, segment_characteristics, config):
        """生成个性化参数"""
        params = {}
        
        # 时间相关参数
        now = datetime.now()
        params.update({
            'season': self._get_current_season(now),
            'month': now.strftime('%B'),
            'day_of_week': now.strftime('%A')
        })
        
        # 优惠相关参数
        price_sensitivity = segment_characteristics.get('avg_price_sensitivity', 'medium')
        if price_sensitivity == 'high':
            params['discount'] = config.get('discount_rate', 20)
        elif price_sensitivity == 'low':
            params['discount'] = config.get('discount_rate', 10)
        else:
            params['discount'] = config.get('discount_rate', 15)
        
        # 产品相关参数
        dominant_categories = segment_characteristics.get('dominant_categories', ['电子产品'])
        params['category'] = dominant_categories[0] if dominant_categories else '热门产品'
        
        return params
    
    def _get_current_season(self, date):
        """获取当前季节"""
        month = date.month
        if month in [12, 1, 2]:
            return '冬季'
        elif month in [3, 4, 5]:
            return '春季'
        elif month in [6, 7, 8]:
            return '夏季'
        else:
            return '秋季'
    
    def _calculate_optimal_timing(self, segment_characteristics):
        """计算最优发送时间"""
        # 基于客户群体特征确定最佳发送时间
        avg_active_hours = segment_characteristics.get('avg_active_hours', [9, 12, 18, 20])
        timezone = segment_characteristics.get('timezone', 'Asia/Shanghai')
        
        # 选择参与度最高的时间段
        optimal_hour = max(avg_active_hours) if avg_active_hours else 10
        
        # 计算下一个最优发送时间
        now = datetime.now()
        next_send_time = now.replace(hour=optimal_hour, minute=0, second=0, microsecond=0)
        
        if next_send_time <= now:
            next_send_time += timedelta(days=1)
        
        return {
            'optimal_send_time': next_send_time.isoformat(),
            'timezone': timezone,
            'day_of_week_preference': segment_characteristics.get('preferred_days', ['Tuesday', 'Wednesday', 'Thursday'])
        }
    
    def _predict_engagement_rate(self, segment_characteristics):
        """预测活动参与率"""
        base_rate = 0.15  # 基础参与率15%
        
        # 根据历史参与度调整
        engagement_level = segment_characteristics.get('avg_engagement_level', 'medium')
        if engagement_level == 'high':
            base_rate *= 1.5
        elif engagement_level == 'low':
            base_rate *= 0.7
        
        # 根据客户价值调整
        avg_clv = segment_characteristics.get('avg_clv', 1000)
        if avg_clv > 5000:
            base_rate *= 1.2
        elif avg_clv < 500:
            base_rate *= 0.9
        
        return min(base_rate, 0.5)  # 上限50%
    
    def _calculate_budget_allocation(self, customer_count, channels):
        """计算预算分配"""
        # 基于渠道成本和客户数量计算预算
        channel_costs = {
            'email': 0.02,  # 每封邮件0.02元
            'sms': 0.10,    # 每条短信0.10元
            'push_notification': 0.01,  # 每条推送0.01元
            'social_media': 0.50,  # 每次社媒投放0.50元
            'app_notification': 0.01
        }
        
        total_cost = 0
        channel_breakdown = {}
        
        for channel in channels:
            cost_per_customer = channel_costs.get(channel, 0.05)
            channel_cost = customer_count * cost_per_customer
            channel_breakdown[channel] = {
                'cost_per_customer': cost_per_customer,
                'total_cost': channel_cost,
                'customer_count': customer_count
            }
            total_cost += channel_cost
        
        return {
            'total_budget': round(total_cost, 2),
            'channel_breakdown': channel_breakdown,
            'cost_per_customer': round(total_cost / max(customer_count, 1), 2)
        }
    
    def _generate_cta(self, segment_characteristics):
        """生成行动号召按钮"""
        engagement_level = segment_characteristics.get('avg_engagement_level', 'medium')
        
        if engagement_level == 'high':
            return {
                'text': '立即抢购',
                'style': 'urgent',
                'color': 'red'
            }
        elif engagement_level == 'low':
            return {
                'text': '了解更多',
                'style': 'soft',
                'color': 'blue'
            }
        else:
            return {
                'text': '查看详情',
                'style': 'normal',
                'color': 'green'
            }
    
    def _select_visual_style(self, segment_characteristics):
        """选择视觉风格"""
        avg_age = segment_characteristics.get('avg_age', 35)
        
        if avg_age < 25:
            return {
                'theme': 'modern',
                'colors': ['#FF6B6B', '#4ECDC4', '#45B7D1'],
                'font_style': 'playful'
            }
        elif avg_age > 50:
            return {
                'theme': 'classic',
                'colors': ['#2C3E50', '#34495E', '#7F8C8D'],
                'font_style': 'elegant'
            }
        else:
            return {
                'theme': 'business',
                'colors': ['#3498DB', '#2ECC71', '#E74C3C'],
                'font_style': 'professional'
            }


class SmartEmailMarketing:
    """智能邮件营销引擎"""
    
    def __init__(self):
        self.email_templates = {}
        self.personalization_engine = None
        self.ab_test_configs = {}
        self.load_email_templates()
    
    def load_email_templates(self):
        """加载邮件模板"""
        self.email_templates = {
            'welcome': {
                'subject': '欢迎加入{brand_name}大家庭！',
                'template': '''
                <h1>欢迎您，{customer_name}！</h1>
                <p>感谢您选择{brand_name}，我们很高兴为您提供优质的服务。</p>
                <p>作为新用户，您将享受以下专属福利：</p>
                <ul>
                    <li>新用户专享{discount}%折扣</li>
                    <li>免费配送服务</li>
                    <li>专属客服支持</li>
                </ul>
                <a href="{shop_link}" class="cta-button">立即购物</a>
                ''',
                'personalization_fields': ['customer_name', 'brand_name', 'discount', 'shop_link']
            },
            'product_recommendation': {
                'subject': '为您推荐：{product_name}等{count}款精选商品',
                'template': '''
                <h1>专为您推荐</h1>
                <p>亲爱的{customer_name}，基于您的购买偏好，我们为您精选了以下商品：</p>
                <div class="product-grid">
                    {product_list}
                </div>
                <p>这些商品获得了{rating}星好评，限时优惠{discount}%！</p>
                <a href="{products_link}" class="cta-button">查看全部推荐</a>
                ''',
                'personalization_fields': ['customer_name', 'product_name', 'count', 'product_list', 'rating', 'discount', 'products_link']
            },
            'cart_abandonment': {
                'subject': '您的购物车还在等您哦～',
                'template': '''
                <h1>别忘了您的心愿单</h1>
                <p>Hi {customer_name}，您在{brand_name}的购物车里还有{item_count}件商品等待您：</p>
                <div class="cart-items">
                    {cart_items}
                </div>
                <p>为了不让您错过，我们为您保留了{discount}%的专属折扣！</p>
                <a href="{cart_link}" class="cta-button">完成购买</a>
                <p class="urgency">优惠有效期：{expiry_hours}小时</p>
                ''',
                'personalization_fields': ['customer_name', 'brand_name', 'item_count', 'cart_items', 'discount', 'cart_link', 'expiry_hours']
            }
        }
    
    def create_email_campaign(self, recipients, email_type, personalization_data, campaign_config=None):
        """创建智能邮件活动"""
        try:
            if email_type not in self.email_templates:
                raise ValueError(f"未知的邮件类型: {email_type}")
            
            template = self.email_templates[email_type]
            config = campaign_config or {}
            
            # 启用A/B测试
            use_ab_test = config.get('enable_ab_test', False)
            ab_test_variants = []
            
            if use_ab_test:
                ab_test_variants = self._create_ab_test_variants(template, config)
            
            # 生成个性化邮件
            emails = []
            for recipient in recipients:
                personalized_email = self._create_personalized_email(
                    template, recipient, personalization_data, ab_test_variants
                )
                emails.append(personalized_email)
            
            # 优化发送时间
            optimal_send_times = self._optimize_send_times(recipients)
            
            return {
                'campaign_id': f"{email_type}_{int(datetime.now().timestamp())}",
                'email_type': email_type,
                'total_recipients': len(recipients),
                'emails': emails,
                'ab_test_enabled': use_ab_test,
                'ab_test_variants': ab_test_variants,
                'send_schedule': optimal_send_times,
                'expected_metrics': self._predict_email_metrics(recipients, email_type),
                'created_at': datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"创建邮件活动失败: {str(e)}")
            raise
    
    def _create_personalized_email(self, template, recipient, personalization_data, ab_variants=None):
        """创建个性化邮件"""
        # 选择A/B测试变体（如果启用）
        selected_variant = template
        if ab_variants:
            # 简单的随机分配，实际应用中可以更复杂
            import random
            selected_variant = random.choice([template] + ab_variants)
        
        # 获取收件人的个性化数据
        recipient_data = personalization_data.get(recipient.get('customer_id', ''), {})
        
        # 合并默认数据和个性化数据
        merge_data = {
            'customer_name': recipient.get('name', '尊敬的客户'),
            'brand_name': 'ShopPro',
            **recipient_data
        }
        
        # 应用个性化
        personalized_subject = self._apply_personalization(selected_variant['subject'], merge_data)
        personalized_content = self._apply_personalization(selected_variant['template'], merge_data)
        
        # 添加智能元素
        smart_elements = self._add_smart_elements(recipient, merge_data)
        
        return {
            'recipient': recipient,
            'subject': personalized_subject,
            'content': personalized_content,
            'smart_elements': smart_elements,
            'variant_id': getattr(selected_variant, 'variant_id', 'original'),
            'personalization_score': self._calculate_personalization_score(merge_data)
        }
    
    def _apply_personalization(self, template, data):
        """应用个性化数据到模板"""
        result = template
        for key, value in data.items():
            placeholder = '{' + key + '}'
            if placeholder in result:
                result = result.replace(placeholder, str(value))
        return result
    
    def _add_smart_elements(self, recipient, merge_data):
        """添加智能化元素"""
        elements = []
        
        # 基于时间的个性化
        hour = datetime.now().hour
        if hour < 12:
            greeting = '早上好'
        elif hour < 18:
            greeting = '下午好'
        else:
            greeting = '晚上好'
        
        elements.append({
            'type': 'time_greeting',
            'content': greeting
        })
        
        # 基于购买历史的推荐
        purchase_history = merge_data.get('recent_purchases', [])
        if purchase_history:
            elements.append({
                'type': 'purchase_based_recommendation',
                'content': f"基于您最近购买的{purchase_history[0]}，我们还为您推荐..."
            })
        
        # 社会化证明
        avg_rating = merge_data.get('product_rating', 4.5)
        if avg_rating >= 4.0:
            elements.append({
                'type': 'social_proof',
                'content': f"⭐ 该商品获得{avg_rating}星好评，已有{merge_data.get('review_count', 100)}位客户购买"
            })
        
        return elements
    
    def _create_ab_test_variants(self, original_template, config):
        """创建A/B测试变体"""
        variants = []
        
        # 创建主题行变体
        subject_variants = config.get('subject_variants', [])
        for i, variant_subject in enumerate(subject_variants):
            variant = original_template.copy()
            variant['subject'] = variant_subject
            variant['variant_id'] = f'subject_variant_{i+1}'
            variants.append(variant)
        
        # 创建内容变体
        content_variants = config.get('content_variants', [])
        for i, variant_content in enumerate(content_variants):
            variant = original_template.copy()
            variant['template'] = variant_content
            variant['variant_id'] = f'content_variant_{i+1}'
            variants.append(variant)
        
        return variants
    
    def _optimize_send_times(self, recipients):
        """优化邮件发送时间"""
        send_schedule = {}
        
        for recipient in recipients:
            # 基于收件人的历史行为数据优化发送时间
            optimal_hour = recipient.get('optimal_email_hour', 10)
            timezone = recipient.get('timezone', 'Asia/Shanghai')
            
            # 计算最佳发送时间
            now = datetime.now()
            optimal_send_time = now.replace(hour=optimal_hour, minute=0, second=0, microsecond=0)
            
            if optimal_send_time <= now:
                optimal_send_time += timedelta(days=1)
            
            send_schedule[recipient.get('email')] = {
                'send_time': optimal_send_time.isoformat(),
                'timezone': timezone,
                'confidence': recipient.get('time_prediction_confidence', 0.7)
            }
        
        return send_schedule
    
    def _predict_email_metrics(self, recipients, email_type):
        """预测邮件营销指标"""
        # 基于历史数据和邮件类型预测指标
        base_metrics = {
            'welcome': {'open_rate': 0.45, 'click_rate': 0.15, 'conversion_rate': 0.08},
            'product_recommendation': {'open_rate': 0.25, 'click_rate': 0.08, 'conversion_rate': 0.03},
            'cart_abandonment': {'open_rate': 0.35, 'click_rate': 0.12, 'conversion_rate': 0.15}
        }
        
        base = base_metrics.get(email_type, {'open_rate': 0.20, 'click_rate': 0.05, 'conversion_rate': 0.02})
        
        # 基于收件人质量调整预测
        high_engagement_recipients = len([r for r in recipients if r.get('engagement_score', 5) > 7])
        engagement_boost = (high_engagement_recipients / len(recipients)) * 0.1
        
        return {
            'predicted_open_rate': min(base['open_rate'] + engagement_boost, 0.8),
            'predicted_click_rate': min(base['click_rate'] + engagement_boost * 0.5, 0.3),
            'predicted_conversion_rate': min(base['conversion_rate'] + engagement_boost * 0.3, 0.2),
            'estimated_revenue': len(recipients) * base['conversion_rate'] * 500  # 假设平均订单价值500元
        }
    
    def _calculate_personalization_score(self, merge_data):
        """计算个性化评分"""
        score = 0
        total_fields = len(merge_data)
        
        # 基于个性化字段的完整性计算分数
        for key, value in merge_data.items():
            if value and str(value).strip():
                score += 1
        
        return round((score / max(total_fields, 1)) * 100, 1)


# 全局实例
customer_journey_engine = CustomerJourneyAutomation()
campaign_engine = PersonalizedCampaignEngine()
email_marketing_engine = SmartEmailMarketing()