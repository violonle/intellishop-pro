#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
ShopPro AI聊天机器人和智能助手服务
提供24/7客户服务、知识问答、销售助手、多语言支持和情感分析功能

@author: ShopPro Team
@version: 1.0.0
"""

import json
import re
import numpy as np
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional, Tuple
from dataclasses import dataclass
import warnings
warnings.filterwarnings('ignore')

# NLP和机器学习库
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.naive_bayes import MultinomialNB
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline
import jieba
import jieba.analyse


@dataclass
class ChatMessage:
    """聊天消息"""
    message_id: str
    session_id: str
    user_id: str
    message_type: str  # 'user', 'bot', 'system'
    content: str
    timestamp: str
    intent: Optional[str] = None
    entities: Optional[List[Dict]] = None
    confidence: Optional[float] = None
    context: Optional[Dict] = None


@dataclass
class ConversationSession:
    """对话会话"""
    session_id: str
    user_id: str
    channel: str
    created_at: str
    updated_at: str
    status: str
    context: Dict
    messages: List[ChatMessage]
    intent_history: List[str]
    user_profile: Optional[Dict] = None


class IntentClassifier:
    """意图识别分类器"""
    
    def __init__(self):
        self.intents = {
            'greeting': ['你好', '您好', 'hello', 'hi', '嗨', '问候'],
            'product_inquiry': ['产品', '商品', '价格', '功能', '参数', '规格'],
            'order_status': ['订单', '发货', '物流', '配送', '快递'],
            'customer_service': ['投诉', '建议', '问题', '故障', '售后'],
            'sales_inquiry': ['购买', '下单', '优惠', '折扣', '活动'],
            'technical_support': ['使用', '安装', '设置', '教程', '帮助'],
            'farewell': ['再见', '拜拜', 'bye', '结束', '退出'],
            'praise': ['好', '棒', '赞', '谢谢', '满意'],
            'complaint': ['不好', '差', '不满意', '问题', '投诉']
        }
        
        self.model = None
        self.vectorizer = TfidfVectorizer(
            max_features=1000,
            stop_words=self._get_stopwords()
        )
        self._build_training_data()
        self._train_classifier()
    
    def _get_stopwords(self) -> List[str]:
        """获取停用词"""
        return ['的', '了', '在', '是', '我', '有', '和', '就', '不', '人', '都', 
                '一', '一个', '上', '也', '很', '到', '说', '要', '去', '你', '会', '着']
    
    def _build_training_data(self):
        """构建训练数据"""
        self.training_texts = []
        self.training_labels = []
        
        # 为每个意图生成训练样本
        for intent, keywords in self.intents.items():
            for keyword in keywords:
                # 生成包含关键词的句子
                samples = self._generate_samples(keyword, intent)
                self.training_texts.extend(samples)
                self.training_labels.extend([intent] * len(samples))
    
    def _generate_samples(self, keyword: str, intent: str) -> List[str]:
        """生成训练样本"""
        if intent == 'greeting':
            return [
                f"{keyword}",
                f"{keyword}，请问有什么可以帮助您的吗？",
                f"我想{keyword}"
            ]
        elif intent == 'product_inquiry':
            return [
                f"我想了解{keyword}",
                f"请介绍一下{keyword}",
                f"{keyword}怎么样？",
                f"{keyword}多少钱？"
            ]
        elif intent == 'order_status':
            return [
                f"我的{keyword}状态",
                f"查询{keyword}",
                f"{keyword}到哪了？"
            ]
        else:
            return [keyword, f"关于{keyword}", f"我想{keyword}"]
    
    def _train_classifier(self):
        """训练分类器"""
        # 文本向量化
        X = self.vectorizer.fit_transform(self.training_texts)
        y = self.training_labels
        
        # 训练朴素贝叶斯分类器
        self.model = MultinomialNB()
        self.model.fit(X, y)
    
    def classify_intent(self, text: str) -> Tuple[str, float]:
        """分类意图"""
        # 文本预处理
        processed_text = self._preprocess_text(text)
        
        # 向量化
        X = self.vectorizer.transform([processed_text])
        
        # 预测
        probabilities = self.model.predict_proba(X)[0]
        max_prob_index = np.argmax(probabilities)
        confidence = probabilities[max_prob_index]
        
        intent = self.model.classes_[max_prob_index]
        
        return intent, float(confidence)
    
    def _preprocess_text(self, text: str) -> str:
        """文本预处理"""
        # 转小写
        text = text.lower()
        
        # 移除标点符号
        text = re.sub(r'[^\w\s]', '', text)
        
        # 中文分词
        words = jieba.cut(text)
        
        return ' '.join(words)


class EntityExtractor:
    """实体提取器"""
    
    def __init__(self):
        self.entity_patterns = {
            'product_name': [
                r'(iPhone|iPad|MacBook|Apple Watch|AirPods)',
                r'(华为|小米|OPPO|vivo|三星)',
                r'(笔记本|手机|平板|耳机|音箱)'
            ],
            'order_number': [
                r'订单号?\s*[:\：]?\s*([A-Z0-9]{10,20})',
                r'单号\s*[:\：]?\s*([A-Z0-9]{10,20})'
            ],
            'price': [
                r'(\d+(?:\.\d+)?)\s*[元块钱]',
                r'[￥¥$]\s*(\d+(?:\.\d+)?)'
            ],
            'phone': [
                r'(1[3-9]\d{9})',
                r'(\d{3}-\d{4}-\d{4})'
            ],
            'email': [
                r'([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})'
            ]
        }
    
    def extract_entities(self, text: str) -> List[Dict]:
        """提取实体"""
        entities = []
        
        for entity_type, patterns in self.entity_patterns.items():
            for pattern in patterns:
                matches = re.finditer(pattern, text)
                for match in matches:
                    entities.append({
                        'type': entity_type,
                        'value': match.group(1) if match.groups() else match.group(),
                        'start': match.start(),
                        'end': match.end(),
                        'confidence': 0.9
                    })
        
        return entities


class SentimentAnalyzer:
    """情感分析器"""
    
    def __init__(self):
        self.positive_words = [
            '好', '棒', '赞', '优秀', '满意', '喜欢', '推荐', '完美',
            '方便', '快速', '专业', '优质', '实惠', '值得'
        ]
        
        self.negative_words = [
            '差', '坏', '糟糕', '不满意', '失望', '问题', '故障', '投诉',
            '慢', '贵', '不好', '不行', '麻烦', '困难'
        ]
        
        self.intensity_words = [
            ('非常', 2.0), ('特别', 1.8), ('十分', 1.6), ('很', 1.4),
            ('比较', 0.8), ('有点', 0.6), ('稍微', 0.4)
        ]
    
    def analyze_sentiment(self, text: str) -> Dict[str, Any]:
        """分析情感"""
        # 分词
        words = list(jieba.cut(text))
        
        positive_score = 0
        negative_score = 0
        intensity_multiplier = 1.0
        
        # 计算情感分数
        for i, word in enumerate(words):
            # 检查强度词
            for intensity_word, multiplier in self.intensity_words:
                if word == intensity_word and i < len(words) - 1:
                    intensity_multiplier = multiplier
                    continue
            
            # 计算正面分数
            if word in self.positive_words:
                positive_score += 1 * intensity_multiplier
                intensity_multiplier = 1.0
            
            # 计算负面分数
            if word in self.negative_words:
                negative_score += 1 * intensity_multiplier
                intensity_multiplier = 1.0
        
        # 确定情感倾向
        if positive_score > negative_score:
            sentiment = 'positive'
            confidence = positive_score / (positive_score + negative_score + 1)
        elif negative_score > positive_score:
            sentiment = 'negative'
            confidence = negative_score / (positive_score + negative_score + 1)
        else:
            sentiment = 'neutral'
            confidence = 0.5
        
        return {
            'sentiment': sentiment,
            'confidence': float(confidence),
            'positive_score': positive_score,
            'negative_score': negative_score
        }


class KnowledgeBase:
    """知识库"""
    
    def __init__(self):
        self.knowledge_data = {
            'products': {
                'iPhone 15 Pro': {
                    'description': 'Apple最新旗舰手机，搭载A17 Pro芯片',
                    'price': '8999',
                    'features': ['钛金属设计', '48MP主摄', 'USB-C接口', '120Hz屏幕'],
                    'specs': {
                        'screen': '6.1英寸 Super Retina XDR',
                        'storage': '128GB/256GB/512GB/1TB',
                        'camera': '48MP主摄 + 12MP超广角 + 12MP长焦'
                    }
                }
            },
            'policies': {
                'return_policy': '支持15天无理由退货，商品需保持原包装完整',
                'warranty': '提供1年免费保修服务，人为损坏不在保修范围内',
                'shipping': '全国大部分地区支持次日达，偏远地区3-5个工作日'
            },
            'faqs': [
                {
                    'question': '如何查询订单状态？',
                    'answer': '您可以登录账户查看订单详情，或提供订单号让我帮您查询'
                },
                {
                    'question': '支持哪些支付方式？',
                    'answer': '支持微信支付、支付宝、银行卡、花呗等多种支付方式'
                },
                {
                    'question': '如何申请售后服务？',
                    'answer': '请联系在线客服或拨打400客服热线，我们会及时为您处理'
                }
            ]
        }
        
        # 构建FAQ搜索索引
        self._build_faq_index()
    
    def _build_faq_index(self):
        """构建FAQ搜索索引"""
        faq_texts = [faq['question'] + ' ' + faq['answer'] for faq in self.knowledge_data['faqs']]
        self.faq_vectorizer = TfidfVectorizer()
        self.faq_vectors = self.faq_vectorizer.fit_transform(faq_texts)
    
    def search_knowledge(self, query: str, knowledge_type: str = 'all') -> List[Dict]:
        """搜索知识库"""
        results = []
        
        if knowledge_type in ['all', 'faq']:
            # 搜索FAQ
            faq_results = self._search_faq(query)
            results.extend(faq_results)
        
        if knowledge_type in ['all', 'product']:
            # 搜索产品信息
            product_results = self._search_products(query)
            results.extend(product_results)
        
        return results
    
    def _search_faq(self, query: str) -> List[Dict]:
        """搜索FAQ"""
        query_vector = self.faq_vectorizer.transform([query])
        similarities = cosine_similarity(query_vector, self.faq_vectors)[0]
        
        results = []
        for i, similarity in enumerate(similarities):
            if similarity > 0.1:  # 相似度阈值
                faq = self.knowledge_data['faqs'][i]
                results.append({
                    'type': 'faq',
                    'question': faq['question'],
                    'answer': faq['answer'],
                    'similarity': float(similarity)
                })
        
        # 按相似度排序
        results.sort(key=lambda x: x['similarity'], reverse=True)
        return results[:3]  # 返回前3个结果
    
    def _search_products(self, query: str) -> List[Dict]:
        """搜索产品信息"""
        results = []
        
        for product_name, product_info in self.knowledge_data['products'].items():
            if any(keyword in product_name.lower() or keyword in product_info['description'].lower() 
                   for keyword in query.lower().split()):
                results.append({
                    'type': 'product',
                    'name': product_name,
                    'info': product_info
                })
        
        return results


class ResponseGenerator:
    """回复生成器"""
    
    def __init__(self, knowledge_base: KnowledgeBase):
        self.kb = knowledge_base
        self.response_templates = {
            'greeting': [
                "您好！欢迎来到ShopPro，我是您的智能助手，有什么可以帮助您的吗？",
                "您好！很高兴为您服务，请问有什么问题需要咨询吗？"
            ],
            'product_inquiry': [
                "我来为您介绍相关产品信息",
                "让我查找一下产品详情"
            ],
            'order_status': [
                "请提供您的订单号，我帮您查询订单状态",
                "您可以告诉我订单号吗？我来帮您查询"
            ],
            'customer_service': [
                "我理解您的问题，让我来帮您解决",
                "请详细描述您遇到的问题，我会尽力为您处理"
            ],
            'farewell': [
                "感谢您的咨询，祝您生活愉快！",
                "再见，有问题随时联系我们！"
            ],
            'default': [
                "抱歉，我没有完全理解您的问题，能否换个方式表达？",
                "请问您具体想了解什么呢？我来为您详细解答"
            ]
        }
    
    def generate_response(self, message: ChatMessage, session: ConversationSession) -> str:
        """生成回复"""
        intent = message.intent or 'default'
        
        # 根据意图生成基础回复
        base_response = self._get_base_response(intent)
        
        # 根据实体和上下文丰富回复
        enhanced_response = self._enhance_response(
            base_response, message, session
        )
        
        return enhanced_response
    
    def _get_base_response(self, intent: str) -> str:
        """获取基础回复"""
        templates = self.response_templates.get(intent, self.response_templates['default'])
        return np.random.choice(templates)
    
    def _enhance_response(self, base_response: str, message: ChatMessage, 
                         session: ConversationSession) -> str:
        """增强回复内容"""
        entities = message.entities or []
        
        # 如果有产品实体，添加产品信息
        for entity in entities:
            if entity['type'] == 'product_name':
                product_info = self._get_product_info(entity['value'])
                if product_info:
                    return f"{base_response}\n\n{product_info}"
        
        # 如果是产品询问意图，搜索知识库
        if message.intent == 'product_inquiry':
            search_results = self.kb.search_knowledge(message.content, 'product')
            if search_results:
                product_text = self._format_product_results(search_results)
                return f"{base_response}：\n\n{product_text}"
        
        # 如果是FAQ类问题，搜索答案
        if message.intent in ['customer_service', 'technical_support']:
            faq_results = self.kb.search_knowledge(message.content, 'faq')
            if faq_results:
                faq_text = self._format_faq_results(faq_results)
                return f"{faq_text}"
        
        return base_response
    
    def _get_product_info(self, product_name: str) -> Optional[str]:
        """获取产品信息"""
        products = self.kb.knowledge_data['products']
        for name, info in products.items():
            if product_name.lower() in name.lower():
                return f"**{name}**\n{info['description']}\n价格：¥{info['price']}\n主要特性：{', '.join(info['features'])}"
        return None
    
    def _format_product_results(self, results: List[Dict]) -> str:
        """格式化产品搜索结果"""
        if not results:
            return "抱歉，没有找到相关产品信息。"
        
        formatted = []
        for result in results:
            info = result['info']
            formatted.append(
                f"**{result['name']}**\n"
                f"{info['description']}\n"
                f"价格：¥{info['price']}\n"
                f"特性：{', '.join(info['features'])}"
            )
        
        return '\n\n'.join(formatted)
    
    def _format_faq_results(self, results: List[Dict]) -> str:
        """格式化FAQ搜索结果"""
        if not results:
            return "抱歉，没有找到相关的帮助信息，建议您联系人工客服。"
        
        best_result = results[0]
        return f"**{best_result['question']}**\n\n{best_result['answer']}"


class MultilingualSupport:
    """多语言支持"""
    
    def __init__(self):
        self.supported_languages = ['zh-cn', 'en', 'ja', 'ko']
        self.translations = {
            'zh-cn': {
                'greeting': '您好！有什么可以帮助您的吗？',
                'not_understand': '抱歉，我没有理解您的问题',
                'goodbye': '再见，祝您愉快！'
            },
            'en': {
                'greeting': 'Hello! How can I help you?',
                'not_understand': 'Sorry, I didn\'t understand your question',
                'goodbye': 'Goodbye, have a nice day!'
            },
            'ja': {
                'greeting': 'こんにちは！何かお手伝いできることはありますか？',
                'not_understand': 'すみません、質問が理解できませんでした',
                'goodbye': 'さようなら、良い一日を！'
            },
            'ko': {
                'greeting': '안녕하세요! 무엇을 도와드릴까요?',
                'not_understand': '죄송합니다, 질문을 이해하지 못했습니다',
                'goodbye': '안녕히 가세요, 좋은 하루 되세요!'
            }
        }
    
    def detect_language(self, text: str) -> str:
        """检测语言"""
        # 简单的语言检测（实际项目中建议使用专门的语言检测库）
        if re.search(r'[\u4e00-\u9fff]', text):
            return 'zh-cn'
        elif re.search(r'[\u3040-\u309f\u30a0-\u30ff]', text):
            return 'ja'
        elif re.search(r'[\uac00-\ud7af]', text):
            return 'ko'
        else:
            return 'en'
    
    def translate_response(self, response: str, target_lang: str) -> str:
        """翻译回复（简化实现）"""
        if target_lang not in self.supported_languages:
            return response
        
        # 实际项目中应该集成专业的翻译API
        # 这里只是示例实现
        return response


class ChatbotAssistantService:
    """聊天机器人和智能助手服务主类"""
    
    def __init__(self):
        self.intent_classifier = IntentClassifier()
        self.entity_extractor = EntityExtractor()
        self.sentiment_analyzer = SentimentAnalyzer()
        self.knowledge_base = KnowledgeBase()
        self.response_generator = ResponseGenerator(self.knowledge_base)
        self.multilingual = MultilingualSupport()
        
        # 会话管理
        self.active_sessions: Dict[str, ConversationSession] = {}
        
    def process_message(self, session_id: str = None, user_id: str = None, content: Optional[str] = None,
                       channel: str = 'web', message: Optional[str] = None, context: Optional[Dict] = None) -> Dict[str, Any]:
        """处理用户消息
        兼容两种调用方式：
        - 旧签名: process_message(session_id, user_id, content, channel)
        - 新签名: process_message(user_id=..., message=..., session_id=..., channel=..., context=...)
        """
        try:
            # 兼容参数名 message/content
            if content is None and message is not None:
                content = message

            if session_id is None or user_id is None or content is None:
                raise ValueError('缺少必要参数: session_id/user_id/content')

            # 获取或创建会话
            session = self._get_or_create_session(session_id, user_id, channel)
            
            # 创建用户消息对象
            user_message = ChatMessage(
                message_id=f"msg_{datetime.now().strftime('%Y%m%d_%H%M%S_%f')}",
                session_id=session_id,
                user_id=user_id,
                message_type='user',
                content=content,
                timestamp=datetime.now().isoformat(),
                context=context or {}
            )
            
            # 意图识别
            intent, confidence = self.intent_classifier.classify_intent(content)
            user_message.intent = intent
            user_message.confidence = confidence
            
            # 实体提取
            entities = self.entity_extractor.extract_entities(content)
            user_message.entities = entities
            
            # 情感分析
            sentiment = self.sentiment_analyzer.analyze_sentiment(content)
            
            # 语言检测
            language = self.multilingual.detect_language(content)
            
            # 生成回复
            bot_response_content = self.response_generator.generate_response(
                user_message, session
            )
            
            # 多语言支持
            if language != 'zh-cn':
                bot_response_content = self.multilingual.translate_response(
                    bot_response_content, language
                )
            
            # 创建机器人回复消息
            bot_message = ChatMessage(
                message_id=f"bot_{datetime.now().strftime('%Y%m%d_%H%M%S_%f')}",
                session_id=session_id,
                user_id='system',
                message_type='bot',
                content=bot_response_content,
                timestamp=datetime.now().isoformat()
            )
            
            # 更新会话
            session.messages.append(user_message)
            session.messages.append(bot_message)
            session.intent_history.append(intent)
            session.updated_at = datetime.now().isoformat()
            
            # 更新上下文
            session.context.update({
                'last_intent': intent,
                'last_sentiment': sentiment,
                'language': language,
                'entities': entities
            })
            
            return {
                'session_id': session_id,
                'bot_response': bot_response_content,
                'intent': intent,
                'confidence': confidence,
                'sentiment': sentiment,
                'entities': entities,
                'language': language,
                'suggestions': self._get_suggestions(intent, session)
            }
            
        except Exception as e:
            return {
                'error': f'消息处理失败: {str(e)}',
                'bot_response': '抱歉，我现在无法处理您的消息，请稍后再试。'
            }
    
    def _get_or_create_session(self, session_id: str, user_id: str, 
                              channel: str) -> ConversationSession:
        """获取或创建会话"""
        if session_id not in self.active_sessions:
            session = ConversationSession(
                session_id=session_id,
                user_id=user_id,
                channel=channel,
                created_at=datetime.now().isoformat(),
                updated_at=datetime.now().isoformat(),
                status='active',
                context={},
                messages=[],
                intent_history=[]
            )
            self.active_sessions[session_id] = session
        
        return self.active_sessions[session_id]
    
    def _get_suggestions(self, intent: str, session: ConversationSession) -> List[str]:
        """获取建议回复"""
        suggestions = {
            'greeting': [
                '我想了解产品信息',
                '查询订单状态', 
                '联系人工客服'
            ],
            'product_inquiry': [
                '查看产品详情',
                '比较同类产品',
                '咨询购买流程'
            ],
            'order_status': [
                '修改收货地址',
                '申请退换货',
                '联系配送员'
            ]
        }
        
        return suggestions.get(intent, ['还有其他问题吗？'])
    
    def get_session_history(self, session_id: str) -> Optional[Dict]:
        """获取会话历史"""
        if session_id not in self.active_sessions:
            return None
        
        session = self.active_sessions[session_id]
        return {
            'session_id': session_id,
            'created_at': session.created_at,
            'updated_at': session.updated_at,
            'status': session.status,
            'message_count': len(session.messages),
            'messages': [
                {
                    'message_id': msg.message_id,
                    'type': msg.message_type,
                    'content': msg.content,
                    'timestamp': msg.timestamp,
                    'intent': msg.intent
                }
                for msg in session.messages
            ]
        }

    def get_session(self, session_id: str) -> Optional[ConversationSession]:
        """返回会话对象（用于API层__dict__序列化）"""
        return self.active_sessions.get(session_id)
    
    def end_session(self, session_id: str) -> bool:
        """结束会话，返回True/False以匹配API层预期"""
        if session_id in self.active_sessions:
            session = self.active_sessions[session_id]
            session.status = 'ended'
            session.updated_at = datetime.now().isoformat()
            # 可选：生成会话总结（此处不返回，由后续扩展持久化使用）
            _ = self._generate_session_summary(session)
            del self.active_sessions[session_id]
            return True
        return False
    
    def _generate_session_summary(self, session: ConversationSession) -> Dict:
        """生成会话总结"""
        messages = session.messages
        user_messages = [msg for msg in messages if msg.message_type == 'user']
        
        return {
            'duration_minutes': self._calculate_duration(session.created_at, session.updated_at),
            'total_messages': len(messages),
            'user_messages': len(user_messages),
            'main_intents': list(set(session.intent_history)),
            'sentiment_summary': self._analyze_session_sentiment(user_messages)
        }
    
    def _calculate_duration(self, start_time: str, end_time: str) -> float:
        """计算会话时长"""
        start = datetime.fromisoformat(start_time)
        end = datetime.fromisoformat(end_time)
        return (end - start).total_seconds() / 60
    
    def _analyze_session_sentiment(self, user_messages: List[ChatMessage]) -> Dict:
        """分析会话整体情感"""
        if not user_messages:
            return {'overall': 'neutral'}
        
        sentiments = []
        for message in user_messages:
            sentiment = self.sentiment_analyzer.analyze_sentiment(message.content)
            sentiments.append(sentiment['sentiment'])
        
        # 计算整体情感
        positive_count = sentiments.count('positive')
        negative_count = sentiments.count('negative')
        neutral_count = sentiments.count('neutral')
        
        if positive_count > negative_count:
            overall = 'positive'
        elif negative_count > positive_count:
            overall = 'negative'
        else:
            overall = 'neutral'
        
        return {
            'overall': overall,
            'positive': positive_count,
            'negative': negative_count,
            'neutral': neutral_count
        }
    
    def get_knowledge_suggestions(self, query: str) -> List[Dict]:
        """获取知识建议"""
        return self.knowledge_base.search_knowledge(query)

    def search_knowledge(self, query: str, limit: int = 10) -> List[Dict]:
        """搜索知识库，支持限制返回条数"""
        results = self.knowledge_base.search_knowledge(query)
        return results[:limit]
    
    def update_knowledge_base(self, knowledge_items_or_type, data: Dict = None) -> Dict[str, Any]:
        """更新知识库
        - 批量模式：传入列表[{question, answer}] 添加到FAQ
        - 兼容原有模式：传入(knowledge_type, data)
        """
        try:
            # 批量模式
            if isinstance(knowledge_items_or_type, list):
                count = 0
                for item in knowledge_items_or_type:
                    if 'question' in item and 'answer' in item:
                        self.knowledge_base.knowledge_data['faqs'].append(item)
                        count += 1
                self.knowledge_base._build_faq_index()
                return {'success': True, 'message': '知识库更新成功', 'updated_items': count}
            
            # 兼容原有单条模式
            knowledge_type = knowledge_items_or_type
            if knowledge_type == 'faq' and data:
                self.knowledge_base.knowledge_data['faqs'].append(data)
                self.knowledge_base._build_faq_index()  # 重建索引
                return {'success': True, 'message': '知识库更新成功', 'updated_items': 1}
            elif knowledge_type == 'product' and data:
                self.knowledge_base.knowledge_data['products'][data['name']] = data['info']
                return {'success': True, 'message': '知识库更新成功', 'updated_items': 1}
            else:
                return {'success': False, 'error': '参数不合法'}
            
        except Exception as e:
            return {'success': False, 'error': f'知识库更新失败: {str(e)}'}
