#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
API响应工具类
提供统一的响应格式

@author: ShopPro Team
@version: 1.0.0
"""

import json
from datetime import datetime
from flask import jsonify


class ApiResponse:
    """统一的API响应格式"""
    
    @staticmethod
    def success(data=None, message="success", code=200):
        """成功响应"""
        response = {
            "code": code,
            "message": message,
            "data": data,
            "timestamp": datetime.now().isoformat()
        }
        return jsonify(response), code
    
    @staticmethod
    def error(message="error", code=400, details=None):
        """错误响应"""
        response = {
            "code": code,
            "message": message,
            "error": True,
            "timestamp": datetime.now().isoformat()
        }
        
        if details:
            response["details"] = details
            
        return jsonify(response), code
    
    @staticmethod
    def not_found(message="资源未找到"):
        """404响应"""
        return ApiResponse.error(message, 404)
    
    @staticmethod
    def unauthorized(message="未授权访问"):
        """401响应"""
        return ApiResponse.error(message, 401)
    
    @staticmethod
    def forbidden(message="禁止访问"):
        """403响应"""
        return ApiResponse.error(message, 403)
    
    @staticmethod
    def server_error(message="服务器内部错误"):
        """500响应"""
        return ApiResponse.error(message, 500)
    
    @staticmethod
    def validation_error(message="参数验证失败", errors=None):
        """参数验证错误响应"""
        return ApiResponse.error(message, 400, errors)