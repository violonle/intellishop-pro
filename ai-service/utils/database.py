#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
数据库连接工具
提供数据库连接和操作功能

@author: ShopPro Team
@version: 1.0.0
"""

import os
import logging
import pymysql
from typing import List, Dict, Any, Optional
from contextlib import contextmanager
from pymysql.cursors import DictCursor


class DatabaseManager:
    """数据库管理器"""
    
    def __init__(self):
        self.config = {
            'host': os.getenv('DB_HOST', 'mysql'),
            'port': int(os.getenv('DB_PORT', '3306')),
            'user': os.getenv('DB_USER', 'shoppro'),
            'password': os.getenv('DB_PASSWORD', 'shoppro123'),
            'database': os.getenv('DB_NAME', 'shoppro'),
            'charset': 'utf8mb4',
            'autocommit': False,
            'cursorclass': DictCursor
        }
        self.logger = logging.getLogger(__name__)
    
    @contextmanager
    def get_connection(self):
        """获取数据库连接上下文管理器"""
        connection = None
        try:
            connection = pymysql.connect(**self.config)
            yield connection
        except Exception as e:
            self.logger.error(f"数据库连接错误: {str(e)}")
            if connection:
                connection.rollback()
            raise
        finally:
            if connection:
                connection.close()
    
    def execute_query(self, sql: str, params: tuple = None) -> List[Dict[str, Any]]:
        """执行查询SQL"""
        with self.get_connection() as conn:
            with conn.cursor() as cursor:
                cursor.execute(sql, params)
                return cursor.fetchall()
    
    def execute_one(self, sql: str, params: tuple = None) -> Optional[Dict[str, Any]]:
        """执行查询SQL，返回单条记录"""
        with self.get_connection() as conn:
            with conn.cursor() as cursor:
                cursor.execute(sql, params)
                return cursor.fetchone()
    
    def execute_update(self, sql: str, params: tuple = None) -> int:
        """执行更新SQL"""
        with self.get_connection() as conn:
            with conn.cursor() as cursor:
                affected_rows = cursor.execute(sql, params)
                conn.commit()
                return affected_rows
    
    def execute_batch(self, sql: str, params_list: List[tuple]) -> int:
        """批量执行SQL"""
        with self.get_connection() as conn:
            with conn.cursor() as cursor:
                affected_rows = cursor.executemany(sql, params_list)
                conn.commit()
                return affected_rows
    
    def get_customer_by_id(self, customer_id: int) -> Optional[Dict[str, Any]]:
        """根据ID获取客户信息"""
        sql = """
        SELECT id, name, phone, email, gender, age, status, 
               source, total_consumption, last_purchase_date,
               tags, preferences, created_at, updated_at
        FROM customers 
        WHERE id = %s AND deleted = 0
        """
        return self.execute_one(sql, (customer_id,))
    
    def get_customers_by_ids(self, customer_ids: List[int]) -> List[Dict[str, Any]]:
        """根据ID列表获取客户信息"""
        if not customer_ids:
            return []
        
        placeholders = ','.join(['%s'] * len(customer_ids))
        sql = f"""
        SELECT id, name, phone, email, gender, age, status, 
               source, total_consumption, last_purchase_date,
               tags, preferences, created_at, updated_at
        FROM customers 
        WHERE id IN ({placeholders}) AND deleted = 0
        ORDER BY id
        """
        return self.execute_query(sql, tuple(customer_ids))
    
    def get_customer_orders(self, customer_id: int, limit: int = 50) -> List[Dict[str, Any]]:
        """获取客户订单记录"""
        sql = """
        SELECT o.id, o.order_no, o.amount, o.status, o.created_at,
               oi.product_id, oi.quantity, oi.price,
               p.name as product_name, p.category
        FROM orders o
        LEFT JOIN order_items oi ON o.id = oi.order_id
        LEFT JOIN products p ON oi.product_id = p.id
        WHERE o.customer_id = %s AND o.deleted = 0
        ORDER BY o.created_at DESC
        LIMIT %s
        """
        return self.execute_query(sql, (customer_id, limit))
    
    def get_customer_follow_ups(self, customer_id: int, limit: int = 20) -> List[Dict[str, Any]]:
        """获取客户跟进记录"""
        sql = """
        SELECT id, type, content, result, follow_up_date,
               next_follow_up_date, created_by, created_at
        FROM follow_up_records
        WHERE customer_id = %s AND deleted = 0
        ORDER BY follow_up_date DESC
        LIMIT %s
        """
        return self.execute_query(sql, (customer_id, limit))
    
    def get_lead_by_id(self, lead_id: int) -> Optional[Dict[str, Any]]:
        """根据ID获取线索信息"""
        sql = """
        SELECT id, name, phone, email, source, status, level,
               description, assigned_to, tags, created_at, updated_at
        FROM leads
        WHERE id = %s AND deleted = 0
        """
        return self.execute_one(sql, (lead_id,))
    
    def update_customer_analysis(self, customer_id: int, analysis_data: Dict[str, Any]) -> bool:
        """更新客户分析结果"""
        sql = """
        UPDATE customers 
        SET analysis_result = %s, updated_at = NOW()
        WHERE id = %s
        """
        try:
            import json
            affected_rows = self.execute_update(sql, (json.dumps(analysis_data), customer_id))
            return affected_rows > 0
        except Exception as e:
            self.logger.error(f"更新客户分析结果失败: {str(e)}")
            return False
    
    def get_customers_for_analysis(self, limit: int = 100, offset: int = 0) -> List[Dict[str, Any]]:
        """获取待分析的客户数据"""
        sql = """
        SELECT c.id, c.name, c.phone, c.email, c.gender, c.age, 
               c.status, c.source, c.total_consumption, c.last_purchase_date,
               c.tags, c.preferences, c.created_at,
               COUNT(o.id) as order_count,
               AVG(o.amount) as avg_order_amount,
               MAX(o.created_at) as last_order_date,
               DATEDIFF(NOW(), MAX(o.created_at)) as days_since_last_order
        FROM customers c
        LEFT JOIN orders o ON c.id = o.customer_id AND o.deleted = 0
        WHERE c.deleted = 0
        GROUP BY c.id
        ORDER BY c.id
        LIMIT %s OFFSET %s
        """
        return self.execute_query(sql, (limit, offset))
    
    def get_sales_prediction_data(self, lead_id: int) -> Optional[Dict[str, Any]]:
        """获取销售预测所需数据"""
        sql = """
        SELECT l.id, l.name, l.phone, l.email, l.source, l.status, l.level,
               l.description, l.assigned_to, l.created_at,
               COUNT(fr.id) as follow_up_count,
               MAX(fr.follow_up_date) as last_follow_up_date,
               DATEDIFF(NOW(), l.created_at) as days_since_created,
               u.name as assigned_user_name
        FROM leads l
        LEFT JOIN follow_up_records fr ON l.id = fr.lead_id AND fr.deleted = 0
        LEFT JOIN users u ON l.assigned_to = u.id
        WHERE l.id = %s AND l.deleted = 0
        GROUP BY l.id
        """
        return self.execute_one(sql, (lead_id,))


# 全局数据库管理器实例
db_manager = DatabaseManager()