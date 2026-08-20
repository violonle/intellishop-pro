#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
ShopPro 高级报表和分析服务
提供多维度数据透视、自定义报表生成、智能异常检测、趋势预测等功能

@author: ShopPro Team
@version: 1.0.0
"""

import json
import numpy as np
import pandas as pd
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional
from dataclasses import dataclass
import warnings
warnings.filterwarnings('ignore')

# 机器学习库
from sklearn.ensemble import IsolationForest, RandomForestRegressor
from sklearn.preprocessing import StandardScaler
from sklearn.decomposition import PCA
from sklearn.cluster import DBSCAN
from sklearn.metrics import mean_absolute_error, mean_squared_error
import scipy.stats as stats


@dataclass
class ReportConfig:
    """报表配置"""
    name: str
    report_type: str
    dimensions: List[str]
    metrics: List[str]
    filters: Dict[str, Any]
    time_range: Dict[str, str]
    visualization: str
    schedule: Optional[str] = None
    recipients: Optional[List[str]] = None


@dataclass
class AnomalyDetection:
    """异常检测结果"""
    timestamp: str
    metric: str
    value: float
    expected_range: tuple
    anomaly_score: float
    severity: str
    description: str


class DataPivotEngine:
    """多维度数据透视引擎"""
    
    def __init__(self):
        self.dimension_mappings = {
            'time': ['date', 'week', 'month', 'quarter', 'year'],
            'customer': ['segment', 'region', 'age_group', 'value_tier'],
            'product': ['category', 'brand', 'price_range'],
            'channel': ['source', 'medium', 'campaign'],
            'sales': ['rep', 'team', 'region']
        }
    
    def create_pivot_table(self, data: List[Dict], config: Dict) -> Dict:
        """创建数据透视表"""
        try:
            # 转换为DataFrame
            df = pd.DataFrame(data)
            
            # 解析配置
            rows = config.get('rows', [])
            columns = config.get('columns', [])
            values = config.get('values', [])
            aggfunc = config.get('aggfunc', 'sum')
            
            # 创建透视表
            pivot = pd.pivot_table(
                df, 
                index=rows,
                columns=columns,
                values=values,
                aggfunc=aggfunc,
                fill_value=0
            )
            
            # 计算汇总统计
            summary = self._calculate_pivot_summary(pivot, values)
            
            return {
                'pivot_table': pivot.to_dict(),
                'summary': summary,
                'config': config,
                'total_rows': len(df),
                'dimensions': len(rows) + len(columns)
            }
            
        except Exception as e:
            return {'error': f'透视表创建失败: {str(e)}'}
    
    def _calculate_pivot_summary(self, pivot, values: List[str]) -> Dict:
        """计算透视表汇总统计"""
        summary = {}
        
        for value in values:
            if value in pivot.columns:
                column_data = pivot[value]
                summary[value] = {
                    'total': float(column_data.sum()),
                    'average': float(column_data.mean()),
                    'max': float(column_data.max()),
                    'min': float(column_data.min()),
                    'std': float(column_data.std())
                }
        
        return summary
    
    def drill_down(self, data: List[Dict], dimension: str, value: Any) -> List[Dict]:
        """数据钻取"""
        return [row for row in data if row.get(dimension) == value]
    
    def roll_up(self, data: List[Dict], remove_dimension: str) -> List[Dict]:
        """数据上卷"""
        df = pd.DataFrame(data)
        if remove_dimension in df.columns:
            # 移除维度并聚合数据
            numeric_columns = df.select_dtypes(include=[np.number]).columns
            result = df.groupby([col for col in df.columns 
                               if col != remove_dimension and col not in numeric_columns])[numeric_columns].sum().reset_index()
            return result.to_dict('records')
        return data


class CustomReportGenerator:
    """自定义报表生成器"""
    
    def __init__(self):
        self.report_templates = {
            'sales_performance': self._sales_performance_template,
            'customer_analysis': self._customer_analysis_template,
            'marketing_roi': self._marketing_roi_template,
            'product_performance': self._product_performance_template,
            'financial_summary': self._financial_summary_template
        }
    
    def generate_report(self, config: ReportConfig, data: List[Dict]) -> Dict:
        """生成自定义报表"""
        try:
            # 数据预处理
            processed_data = self._preprocess_data(data, config)
            
            # 应用过滤器
            filtered_data = self._apply_filters(processed_data, config.filters)
            
            # 生成报表内容
            if config.report_type in self.report_templates:
                report_content = self.report_templates[config.report_type](
                    filtered_data, config
                )
            else:
                report_content = self._generic_report(filtered_data, config)
            
            # 生成可视化配置
            visualization_config = self._generate_visualization_config(
                config.visualization, report_content
            )
            
            return {
                'report_id': f"report_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
                'name': config.name,
                'type': config.report_type,
                'generated_at': datetime.now().isoformat(),
                'data': report_content,
                'visualization': visualization_config,
                'summary': self._generate_report_summary(report_content),
                'export_formats': ['pdf', 'excel', 'csv', 'json']
            }
            
        except Exception as e:
            return {'error': f'报表生成失败: {str(e)}'}
    
    def _sales_performance_template(self, data: List[Dict], config: ReportConfig) -> Dict:
        """销售绩效报表模板"""
        df = pd.DataFrame(data)
        
        return {
            'total_revenue': float(df['revenue'].sum()) if 'revenue' in df.columns else 0,
            'total_deals': len(df),
            'avg_deal_size': float(df['revenue'].mean()) if 'revenue' in df.columns else 0,
            'conversion_rate': self._calculate_conversion_rate(df),
            'top_performers': self._get_top_performers(df),
            'trend_analysis': self._analyze_trends(df, 'revenue'),
            'regional_breakdown': self._group_by_dimension(df, 'region', 'revenue')
        }
    
    def _customer_analysis_template(self, data: List[Dict], config: ReportConfig) -> Dict:
        """客户分析报表模板"""
        df = pd.DataFrame(data)
        
        return {
            'total_customers': len(df['customer_id'].unique()) if 'customer_id' in df.columns else 0,
            'new_customers': self._count_new_customers(df),
            'churn_rate': self._calculate_churn_rate(df),
            'customer_lifetime_value': self._calculate_clv(df),
            'segment_distribution': self._analyze_customer_segments(df),
            'retention_analysis': self._analyze_retention(df),
            'satisfaction_metrics': self._analyze_satisfaction(df)
        }
    
    def _marketing_roi_template(self, data: List[Dict], config: ReportConfig) -> Dict:
        """营销ROI报表模板"""
        df = pd.DataFrame(data)
        
        return {
            'total_spend': float(df['marketing_spend'].sum()) if 'marketing_spend' in df.columns else 0,
            'total_revenue': float(df['attributed_revenue'].sum()) if 'attributed_revenue' in df.columns else 0,
            'overall_roi': self._calculate_marketing_roi(df),
            'channel_performance': self._analyze_channel_performance(df),
            'campaign_effectiveness': self._analyze_campaign_effectiveness(df),
            'cost_per_acquisition': self._calculate_cpa(df),
            'attribution_analysis': self._analyze_attribution(df)
        }
    
    def _preprocess_data(self, data: List[Dict], config: ReportConfig) -> List[Dict]:
        """数据预处理"""
        if not data:
            return data
        
        # 时间范围过滤
        if config.time_range:
            start_date = datetime.fromisoformat(config.time_range.get('start', '1900-01-01'))
            end_date = datetime.fromisoformat(config.time_range.get('end', '2100-12-31'))
            
            data = [row for row in data 
                   if start_date <= datetime.fromisoformat(row.get('date', '1900-01-01')) <= end_date]
        
        return data
    
    def _apply_filters(self, data: List[Dict], filters: Dict[str, Any]) -> List[Dict]:
        """应用过滤器"""
        for key, value in filters.items():
            if isinstance(value, list):
                data = [row for row in data if row.get(key) in value]
            else:
                data = [row for row in data if row.get(key) == value]
        return data
    
    def _calculate_conversion_rate(self, df: pd.DataFrame) -> float:
        """计算转化率"""
        if 'status' in df.columns:
            total = len(df)
            converted = len(df[df['status'] == 'converted'])
            return (converted / total * 100) if total > 0 else 0.0
        return 0.0


class AnomalyDetector:
    """智能异常检测器"""
    
    def __init__(self):
        self.models = {
            'isolation_forest': IsolationForest(contamination=0.1, random_state=42),
            'statistical': self._statistical_detection,
            'time_series': self._time_series_detection
        }
        self.scaler = StandardScaler()
    
    def detect_anomalies(self, data: List[Dict], config: Dict) -> List[AnomalyDetection]:
        """检测异常"""
        try:
            df = pd.DataFrame(data)
            anomalies = []
            
            # 选择数值列进行异常检测
            numeric_columns = df.select_dtypes(include=[np.number]).columns
            
            for column in numeric_columns:
                if column in config.get('monitor_metrics', []):
                    column_anomalies = self._detect_column_anomalies(
                        df, column, config.get('method', 'isolation_forest')
                    )
                    anomalies.extend(column_anomalies)
            
            # 按严重程度排序
            anomalies.sort(key=lambda x: x.anomaly_score, reverse=True)
            
            return anomalies
            
        except Exception as e:
            return [AnomalyDetection(
                timestamp=datetime.now().isoformat(),
                metric='system',
                value=0,
                expected_range=(0, 0),
                anomaly_score=1.0,
                severity='error',
                description=f'异常检测失败: {str(e)}'
            )]
    
    def _detect_column_anomalies(self, df: pd.DataFrame, column: str, method: str) -> List[AnomalyDetection]:
        """检测单列异常"""
        anomalies = []
        values = df[column].dropna()
        
        if len(values) < 10:  # 数据太少无法检测
            return anomalies
        
        if method == 'isolation_forest':
            # 使用Isolation Forest
            X = values.values.reshape(-1, 1)
            outliers = self.models['isolation_forest'].fit_predict(X)
            
            for i, is_outlier in enumerate(outliers):
                if is_outlier == -1:  # 异常值
                    anomaly = self._create_anomaly_detection(
                        df.iloc[i], column, values.iloc[i], 'isolation_forest'
                    )
                    anomalies.append(anomaly)
        
        elif method == 'statistical':
            # 统计方法检测
            Q1 = values.quantile(0.25)
            Q3 = values.quantile(0.75)
            IQR = Q3 - Q1
            lower_bound = Q1 - 1.5 * IQR
            upper_bound = Q3 + 1.5 * IQR
            
            outlier_indices = values[(values < lower_bound) | (values > upper_bound)].index
            
            for idx in outlier_indices:
                anomaly = self._create_anomaly_detection(
                    df.loc[idx], column, values.loc[idx], 'statistical',
                    expected_range=(lower_bound, upper_bound)
                )
                anomalies.append(anomaly)
        
        return anomalies
    
    def _create_anomaly_detection(self, row: pd.Series, metric: str, value: float, 
                                 method: str, expected_range: tuple = None) -> AnomalyDetection:
        """创建异常检测结果"""
        # 计算异常严重程度
        if expected_range:
            lower, upper = expected_range
            if value < lower:
                score = abs(value - lower) / (upper - lower)
            else:
                score = abs(value - upper) / (upper - lower)
        else:
            score = 0.8  # 默认分数
        
        # 确定严重程度
        if score > 0.8:
            severity = 'critical'
            description = f'{metric}指标出现严重异常'
        elif score > 0.5:
            severity = 'warning'
            description = f'{metric}指标异常，需要关注'
        else:
            severity = 'info'
            description = f'{metric}指标轻微异常'
        
        return AnomalyDetection(
            timestamp=row.get('date', datetime.now().isoformat()),
            metric=metric,
            value=value,
            expected_range=expected_range or (0, 0),
            anomaly_score=min(score, 1.0),
            severity=severity,
            description=description
        )


class TrendPredictor:
    """趋势预测分析器"""
    
    def __init__(self):
        self.models = {
            'linear': self._linear_trend,
            'polynomial': self._polynomial_trend,
            'exponential': self._exponential_trend,
            'seasonal': self._seasonal_trend
        }
    
    def predict_trend(self, data: List[Dict], config: Dict) -> Dict:
        """预测趋势"""
        try:
            df = pd.DataFrame(data)
            
            # 确保有时间列
            if 'date' not in df.columns:
                return {'error': '缺少时间列'}
            
            # 转换时间列
            df['date'] = pd.to_datetime(df['date'])
            df = df.sort_values('date')
            
            # 选择预测指标
            target_metric = config.get('target_metric', 'value')
            if target_metric not in df.columns:
                return {'error': f'缺少目标指标: {target_metric}'}
            
            # 选择预测方法
            method = config.get('method', 'linear')
            prediction_days = config.get('prediction_days', 30)
            
            # 执行预测
            if method in self.models:
                prediction_result = self.models[method](
                    df, target_metric, prediction_days
                )
            else:
                prediction_result = self._linear_trend(df, target_metric, prediction_days)
            
            return {
                'method': method,
                'target_metric': target_metric,
                'historical_data': self._format_historical_data(df, target_metric),
                'predictions': prediction_result['predictions'],
                'confidence_intervals': prediction_result.get('confidence_intervals'),
                'model_accuracy': prediction_result.get('accuracy_metrics'),
                'trend_analysis': self._analyze_trend_direction(df, target_metric)
            }
            
        except Exception as e:
            return {'error': f'趋势预测失败: {str(e)}'}
    
    def _linear_trend(self, df: pd.DataFrame, target: str, days: int) -> Dict:
        """线性趋势预测"""
        from sklearn.linear_model import LinearRegression
        
        # 准备数据
        df['day_num'] = (df['date'] - df['date'].min()).dt.days
        X = df[['day_num']].values
        y = df[target].values
        
        # 训练模型
        model = LinearRegression()
        model.fit(X, y)
        
        # 预测未来
        last_day = df['day_num'].max()
        future_days = np.arange(last_day + 1, last_day + days + 1).reshape(-1, 1)
        predictions = model.predict(future_days)
        
        # 计算置信区间
        y_pred_train = model.predict(X)
        residuals = y - y_pred_train
        std_error = np.std(residuals)
        
        confidence_intervals = [
            (pred - 1.96 * std_error, pred + 1.96 * std_error) 
            for pred in predictions
        ]
        
        # 生成预测日期
        last_date = df['date'].max()
        future_dates = [
            (last_date + timedelta(days=i+1)).isoformat() 
            for i in range(days)
        ]
        
        return {
            'predictions': list(zip(future_dates, predictions.tolist())),
            'confidence_intervals': confidence_intervals,
            'accuracy_metrics': {
                'mse': float(mean_squared_error(y, y_pred_train)),
                'mae': float(mean_absolute_error(y, y_pred_train)),
                'r2': float(model.score(X, y))
            }
        }
    
    def _polynomial_trend(self, df: pd.DataFrame, target: str, days: int) -> Dict:
        """多项式趋势预测"""
        from sklearn.preprocessing import PolynomialFeatures
        from sklearn.linear_model import LinearRegression
        from sklearn.pipeline import Pipeline
        
        # 准备数据
        df['day_num'] = (df['date'] - df['date'].min()).dt.days
        X = df[['day_num']].values
        y = df[target].values
        
        # 创建多项式回归管道
        model = Pipeline([
            ('poly', PolynomialFeatures(degree=2)),
            ('linear', LinearRegression())
        ])
        
        model.fit(X, y)
        
        # 预测未来
        last_day = df['day_num'].max()
        future_days = np.arange(last_day + 1, last_day + days + 1).reshape(-1, 1)
        predictions = model.predict(future_days)
        
        # 生成预测日期
        last_date = df['date'].max()
        future_dates = [
            (last_date + timedelta(days=i+1)).isoformat() 
            for i in range(days)
        ]
        
        return {
            'predictions': list(zip(future_dates, predictions.tolist())),
            'accuracy_metrics': {
                'r2': float(model.score(X, y))
            }
        }
    
    def _analyze_trend_direction(self, df: pd.DataFrame, target: str) -> Dict:
        """分析趋势方向"""
        values = df[target].values
        
        # 计算趋势
        if len(values) < 2:
            return {'direction': 'insufficient_data'}
        
        # 线性回归斜率
        x = np.arange(len(values))
        slope, intercept, r_value, p_value, std_err = stats.linregress(x, values)
        
        if slope > 0.01:
            direction = 'upward'
        elif slope < -0.01:
            direction = 'downward'
        else:
            direction = 'stable'
        
        return {
            'direction': direction,
            'slope': float(slope),
            'strength': abs(float(r_value)),
            'significance': float(p_value) < 0.05
        }


class CompetitorAnalyzer:
    """竞争对手分析器"""
    
    def __init__(self):
        self.analysis_dimensions = [
            'market_share', 'pricing', 'product_features', 
            'customer_satisfaction', 'marketing_strategy'
        ]
    
    def analyze_competitors(self, company_data: Dict, competitor_data: List[Dict], 
                           config: Dict) -> Dict:
        """分析竞争对手"""
        try:
            analysis_result = {
                'company_profile': self._analyze_company_profile(company_data),
                'competitive_positioning': self._analyze_competitive_positioning(
                    company_data, competitor_data
                ),
                'market_comparison': self._compare_market_metrics(
                    company_data, competitor_data
                ),
                'opportunity_analysis': self._identify_opportunities(
                    company_data, competitor_data
                ),
                'threat_analysis': self._identify_threats(
                    company_data, competitor_data
                ),
                'strategic_recommendations': self._generate_recommendations(
                    company_data, competitor_data
                )
            }
            
            return analysis_result
            
        except Exception as e:
            return {'error': f'竞争分析失败: {str(e)}'}
    
    def _analyze_company_profile(self, company_data: Dict) -> Dict:
        """分析公司概况"""
        return {
            'market_position': company_data.get('market_position', 'unknown'),
            'revenue': company_data.get('revenue', 0),
            'market_share': company_data.get('market_share', 0),
            'customer_base': company_data.get('customer_count', 0),
            'growth_rate': company_data.get('growth_rate', 0),
            'strengths': company_data.get('strengths', []),
            'weaknesses': company_data.get('weaknesses', [])
        }
    
    def _analyze_competitive_positioning(self, company_data: Dict, 
                                       competitor_data: List[Dict]) -> Dict:
        """分析竞争定位"""
        competitors = sorted(
            competitor_data, 
            key=lambda x: x.get('market_share', 0), 
            reverse=True
        )
        
        company_share = company_data.get('market_share', 0)
        company_rank = 1
        
        for i, competitor in enumerate(competitors):
            if competitor.get('market_share', 0) > company_share:
                company_rank = i + 2
        
        return {
            'market_rank': company_rank,
            'top_competitors': competitors[:5],
            'competitive_gap': self._calculate_competitive_gaps(
                company_data, competitors[:3]
            ),
            'positioning_matrix': self._create_positioning_matrix(
                company_data, competitors
            )
        }
    
    def _calculate_competitive_gaps(self, company_data: Dict, 
                                  top_competitors: List[Dict]) -> Dict:
        """计算竞争差距"""
        gaps = {}
        
        for dimension in self.analysis_dimensions:
            company_value = company_data.get(dimension, 0)
            competitor_values = [c.get(dimension, 0) for c in top_competitors]
            
            if competitor_values:
                avg_competitor = np.mean(competitor_values)
                max_competitor = max(competitor_values)
                
                gaps[dimension] = {
                    'vs_average': float(company_value - avg_competitor),
                    'vs_leader': float(company_value - max_competitor),
                    'performance_ratio': float(company_value / avg_competitor) if avg_competitor > 0 else 0
                }
        
        return gaps


class AdvancedAnalyticsService:
    """高级报表和分析服务主类"""
    
    def __init__(self):
        self.pivot_engine = DataPivotEngine()
        self.report_generator = CustomReportGenerator()
        self.anomaly_detector = AnomalyDetector()
        self.trend_predictor = TrendPredictor()
        self.competitor_analyzer = CompetitorAnalyzer()
        
        # 缓存已生成的报表
        self.report_cache = {}
        
    def create_pivot_analysis(self, data: List[Dict], config: Dict) -> Dict:
        """创建数据透视分析"""
        return self.pivot_engine.create_pivot_table(data, config)
    
    def generate_custom_report(self, config_dict: Dict, data: List[Dict]) -> Dict:
        """生成自定义报表"""
        config = ReportConfig(**config_dict)
        return self.report_generator.generate_report(config, data)
    
    def detect_anomalies(self, data: List[Dict], config: Dict) -> List[Dict]:
        """检测数据异常"""
        anomalies = self.anomaly_detector.detect_anomalies(data, config)
        return [
            {
                'timestamp': a.timestamp,
                'metric': a.metric,
                'value': a.value,
                'expected_range': a.expected_range,
                'anomaly_score': a.anomaly_score,
                'severity': a.severity,
                'description': a.description
            } 
            for a in anomalies
        ]
    
    def predict_trends(self, data: List[Dict], config: Dict) -> Dict:
        """预测数据趋势"""
        return self.trend_predictor.predict_trend(data, config)
    
    def analyze_competitors(self, company_data: Dict, competitor_data: List[Dict], 
                          config: Dict) -> Dict:
        """分析竞争对手"""
        return self.competitor_analyzer.analyze_competitors(
            company_data, competitor_data, config
        )
    
    def get_report_templates(self) -> List[Dict]:
        """获取报表模板列表"""
        return [
            {
                'id': 'sales_performance',
                'name': '销售绩效报表',
                'description': '全面的销售团队和业务绩效分析',
                'dimensions': ['time', 'sales_rep', 'region', 'product'],
                'metrics': ['revenue', 'deals_count', 'conversion_rate']
            },
            {
                'id': 'customer_analysis', 
                'name': '客户分析报表',
                'description': '客户行为、价值和生命周期分析',
                'dimensions': ['segment', 'region', 'acquisition_channel'],
                'metrics': ['clv', 'retention_rate', 'satisfaction_score']
            },
            {
                'id': 'marketing_roi',
                'name': '营销ROI报表',
                'description': '营销活动效果和投资回报分析',
                'dimensions': ['channel', 'campaign', 'audience'],
                'metrics': ['spend', 'revenue', 'roi', 'cpa']
            },
            {
                'id': 'product_performance',
                'name': '产品绩效报表',
                'description': '产品销售表现和盈利能力分析',
                'dimensions': ['category', 'brand', 'price_segment'],
                'metrics': ['sales_volume', 'revenue', 'profit_margin']
            }
        ]