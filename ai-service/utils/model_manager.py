#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
AI模型管理工具
负责模型的加载、保存和管理

@author: ShopPro Team
@version: 1.0.0
"""

import os
import pickle
import logging
import joblib
from typing import Any, Dict, Optional
from datetime import datetime


class ModelManager:
    """AI模型管理器"""
    
    def __init__(self, models_dir: str = "models"):
        self.models_dir = models_dir
        self.logger = logging.getLogger(__name__)
        self._models_cache = {}
        
        # 确保模型目录存在
        os.makedirs(self.models_dir, exist_ok=True)
        
        # 模型配置
        self.model_configs = {
            'customer_segmentation': {
                'filename': 'customer_kmeans_model.pkl',
                'type': 'clustering',
                'algorithm': 'KMeans'
            },
            'customer_value_prediction': {
                'filename': 'customer_value_model.pkl',
                'type': 'classification',
                'algorithm': 'RandomForest'
            },
            'sales_success_prediction': {
                'filename': 'sales_success_model.pkl',
                'type': 'classification',
                'algorithm': 'GradientBoosting'
            },
            'sales_cycle_prediction': {
                'filename': 'sales_cycle_model.pkl',
                'type': 'regression',
                'algorithm': 'RandomForest'
            },
            'churn_risk_prediction': {
                'filename': 'churn_risk_model.pkl',
                'type': 'classification',
                'algorithm': 'XGBoost'
            }
        }
    
    def get_model_path(self, model_name: str) -> str:
        """获取模型文件路径"""
        if model_name not in self.model_configs:
            raise ValueError(f"未知的模型名称: {model_name}")
        
        filename = self.model_configs[model_name]['filename']
        return os.path.join(self.models_dir, filename)
    
    def save_model(self, model: Any, model_name: str, metadata: Dict = None) -> bool:
        """保存模型到文件"""
        try:
            model_path = self.get_model_path(model_name)
            
            # 准备保存的数据
            model_data = {
                'model': model,
                'metadata': metadata or {},
                'created_at': datetime.now(),
                'model_type': self.model_configs[model_name]['type'],
                'algorithm': self.model_configs[model_name]['algorithm']
            }
            
            # 保存模型
            with open(model_path, 'wb') as f:
                pickle.dump(model_data, f)
            
            self.logger.info(f"模型 {model_name} 已保存到 {model_path}")
            
            # 清除缓存中的旧模型
            if model_name in self._models_cache:
                del self._models_cache[model_name]
            
            return True
        
        except Exception as e:
            self.logger.error(f"保存模型 {model_name} 失败: {str(e)}")
            return False
    
    def load_model(self, model_name: str, use_cache: bool = True) -> Optional[Any]:
        """从文件加载模型"""
        try:
            # 检查缓存
            if use_cache and model_name in self._models_cache:
                return self._models_cache[model_name]['model']
            
            model_path = self.get_model_path(model_name)
            
            # 检查文件是否存在
            if not os.path.exists(model_path):
                self.logger.warning(f"模型文件不存在: {model_path}")
                return None
            
            # 加载模型
            with open(model_path, 'rb') as f:
                model_data = pickle.load(f)
            
            # 缓存模型
            if use_cache:
                self._models_cache[model_name] = model_data
            
            self.logger.info(f"模型 {model_name} 已从 {model_path} 加载")
            return model_data['model']
        
        except Exception as e:
            self.logger.error(f"加载模型 {model_name} 失败: {str(e)}")
            return None
    
    def get_model_metadata(self, model_name: str) -> Optional[Dict]:
        """获取模型元数据"""
        try:
            # 先尝试从缓存获取
            if model_name in self._models_cache:
                return self._models_cache[model_name]['metadata']
            
            model_path = self.get_model_path(model_name)
            
            if not os.path.exists(model_path):
                return None
            
            with open(model_path, 'rb') as f:
                model_data = pickle.load(f)
            
            return model_data.get('metadata', {})
        
        except Exception as e:
            self.logger.error(f"获取模型元数据失败 {model_name}: {str(e)}")
            return None
    
    def model_exists(self, model_name: str) -> bool:
        """检查模型是否存在"""
        model_path = self.get_model_path(model_name)
        return os.path.exists(model_path)
    
    def delete_model(self, model_name: str) -> bool:
        """删除模型文件"""
        try:
            model_path = self.get_model_path(model_name)
            
            if os.path.exists(model_path):
                os.remove(model_path)
                self.logger.info(f"模型文件已删除: {model_path}")
            
            # 清除缓存
            if model_name in self._models_cache:
                del self._models_cache[model_name]
            
            return True
        
        except Exception as e:
            self.logger.error(f"删除模型失败 {model_name}: {str(e)}")
            return False
    
    def list_models(self) -> Dict[str, Dict]:
        """列出所有模型的状态"""
        models_status = {}
        
        for model_name, config in self.model_configs.items():
            model_path = self.get_model_path(model_name)
            exists = os.path.exists(model_path)
            
            status = {
                'name': model_name,
                'type': config['type'],
                'algorithm': config['algorithm'],
                'exists': exists,
                'path': model_path
            }
            
            if exists:
                try:
                    stat = os.stat(model_path)
                    status['size'] = stat.st_size
                    status['modified_time'] = datetime.fromtimestamp(stat.st_mtime)
                    
                    # 获取元数据
                    metadata = self.get_model_metadata(model_name)
                    if metadata:
                        status['metadata'] = metadata
                        
                except Exception as e:
                    self.logger.warning(f"获取模型文件信息失败 {model_name}: {str(e)}")
            
            models_status[model_name] = status
        
        return models_status
    
    def clear_cache(self):
        """清除模型缓存"""
        self._models_cache.clear()
        self.logger.info("模型缓存已清除")
    
    def warm_up_models(self):
        """预热所有模型（加载到缓存）"""
        loaded_count = 0
        for model_name in self.model_configs.keys():
            if self.model_exists(model_name):
                model = self.load_model(model_name, use_cache=True)
                if model is not None:
                    loaded_count += 1
        
        self.logger.info(f"预热完成，已加载 {loaded_count} 个模型到缓存")
        return loaded_count


# 全局模型管理器实例
model_manager = ModelManager()