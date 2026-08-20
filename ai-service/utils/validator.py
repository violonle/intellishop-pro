#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
数据验证工具
提供通用的数据验证功能

@author: ShopPro Team
@version: 1.0.0
"""

import re
from typing import List, Dict, Any
from datetime import datetime


class Validator:
    """数据验证工具类"""
    
    @staticmethod
    def is_valid_email(email: str) -> bool:
        """验证邮箱格式"""
        if not email:
            return False
        pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        return re.match(pattern, email) is not None
    
    @staticmethod
    def is_valid_phone(phone: str) -> bool:
        """验证手机号格式"""
        if not phone:
            return False
        # 中国手机号正则
        pattern = r'^1[3-9]\d{9}$'
        return re.match(pattern, phone) is not None
    
    @staticmethod
    def is_valid_id_card(id_card: str) -> bool:
        """验证身份证号码"""
        if not id_card:
            return False
        # 18位身份证号正则
        pattern = r'^\d{17}[\dXx]$'
        return re.match(pattern, id_card) is not None
    
    @staticmethod
    def is_valid_date(date_str: str, format_str: str = "%Y-%m-%d") -> bool:
        """验证日期格式"""
        try:
            datetime.strptime(date_str, format_str)
            return True
        except ValueError:
            return False
    
    @staticmethod
    def is_positive_number(value: Any) -> bool:
        """验证是否为正数"""
        try:
            num = float(value)
            return num > 0
        except (ValueError, TypeError):
            return False
    
    @staticmethod
    def is_non_negative_number(value: Any) -> bool:
        """验证是否为非负数"""
        try:
            num = float(value)
            return num >= 0
        except (ValueError, TypeError):
            return False
    
    @staticmethod
    def is_integer(value: Any) -> bool:
        """验证是否为整数"""
        try:
            int(value)
            return True
        except (ValueError, TypeError):
            return False
    
    @staticmethod
    def is_in_range(value: Any, min_val: float, max_val: float) -> bool:
        """验证数值是否在指定范围内"""
        try:
            num = float(value)
            return min_val <= num <= max_val
        except (ValueError, TypeError):
            return False
    
    @staticmethod
    def validate_required_fields(data: Dict[str, Any], required_fields: List[str]) -> List[str]:
        """验证必填字段"""
        errors = []
        for field in required_fields:
            if field not in data or data[field] is None or str(data[field]).strip() == '':
                errors.append(f"字段 '{field}' 为必填项")
        return errors
    
    @staticmethod
    def validate_customer_data(data: Dict[str, Any]) -> List[str]:
        """验证客户数据"""
        errors = []
        
        # 必填字段验证
        required_fields = ['name', 'phone']
        errors.extend(Validator.validate_required_fields(data, required_fields))
        
        # 手机号格式验证
        if 'phone' in data and data['phone']:
            if not Validator.is_valid_phone(data['phone']):
                errors.append("手机号格式不正确")
        
        # 邮箱格式验证
        if 'email' in data and data['email']:
            if not Validator.is_valid_email(data['email']):
                errors.append("邮箱格式不正确")
        
        # 年龄验证
        if 'age' in data and data['age']:
            if not Validator.is_integer(data['age']) or not Validator.is_in_range(data['age'], 0, 120):
                errors.append("年龄必须为0-120之间的整数")
        
        # 消费金额验证
        if 'total_consumption' in data and data['total_consumption']:
            if not Validator.is_non_negative_number(data['total_consumption']):
                errors.append("消费金额必须为非负数")
        
        return errors
    
    @staticmethod
    def validate_lead_data(data: Dict[str, Any]) -> List[str]:
        """验证线索数据"""
        errors = []
        
        # 必填字段验证
        required_fields = ['name', 'phone', 'source', 'status']
        errors.extend(Validator.validate_required_fields(data, required_fields))
        
        # 手机号格式验证
        if 'phone' in data and data['phone']:
            if not Validator.is_valid_phone(data['phone']):
                errors.append("手机号格式不正确")
        
        # 邮箱格式验证（可选）
        if 'email' in data and data['email']:
            if not Validator.is_valid_email(data['email']):
                errors.append("邮箱格式不正确")
        
        # 状态验证
        valid_statuses = ['new', 'contacted', 'qualified', 'converted', 'lost']
        if 'status' in data and data['status']:
            if data['status'] not in valid_statuses:
                errors.append(f"状态必须为以下值之一：{', '.join(valid_statuses)}")
        
        return errors
    
    @staticmethod
    def validate_analysis_params(data: Dict[str, Any]) -> List[str]:
        """验证分析参数"""
        errors = []
        
        # 客户ID验证
        if 'customer_id' in data and data['customer_id']:
            if not Validator.is_integer(data['customer_id']) or not Validator.is_positive_number(data['customer_id']):
                errors.append("客户ID必须为正整数")
        
        # 时间范围验证
        if 'start_date' in data and data['start_date']:
            if not Validator.is_valid_date(data['start_date']):
                errors.append("开始日期格式不正确，应为YYYY-MM-DD")
        
        if 'end_date' in data and data['end_date']:
            if not Validator.is_valid_date(data['end_date']):
                errors.append("结束日期格式不正确，应为YYYY-MM-DD")
        
        # 分页参数验证
        if 'page' in data and data['page']:
            if not Validator.is_integer(data['page']) or not Validator.is_positive_number(data['page']):
                errors.append("页码必须为正整数")
        
        if 'size' in data and data['size']:
            if not Validator.is_integer(data['size']) or not Validator.is_in_range(data['size'], 1, 100):
                errors.append("每页大小必须为1-100之间的整数")
        
        return errors