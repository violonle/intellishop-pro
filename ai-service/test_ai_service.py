#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
ShopPro AI服务测试脚本
用于测试所有AI接口功能

@author: ShopPro Team
@version: 1.0.0
"""

import requests
import json
import time
from datetime import datetime


class AIServiceTester:
    """AI服务测试器"""
    
    def __init__(self, base_url="http://localhost:5000"):
        self.base_url = base_url
        self.headers = {
            'Content-Type': 'application/json'
        }
    
    def test_health_check(self):
        """测试健康检查接口"""
        print("=" * 50)
        print("测试健康检查接口")
        print("=" * 50)
        
        try:
            response = requests.get(f"{self.base_url}/api/health")
            print(f"状态码: {response.status_code}")
            print(f"响应内容: {json.dumps(response.json(), indent=2, ensure_ascii=False)}")
            
            if response.status_code == 200:
                print("✅ 健康检查接口正常")
            else:
                print("❌ 健康检查接口异常")
                
        except Exception as e:
            print(f"❌ 健康检查失败: {str(e)}")
        
        print()
    
    def test_customer_analysis(self):
        """测试客户分析接口"""
        print("=" * 50)
        print("测试客户分析接口")
        print("=" * 50)
        
        # 测试POST接口
        try:
            data = {
                "customer_id": 1
            }
            
            response = requests.post(
                f"{self.base_url}/api/customer/analysis",
                headers=self.headers,
                json=data
            )
            
            print(f"POST 状态码: {response.status_code}")
            print(f"POST 响应: {json.dumps(response.json(), indent=2, ensure_ascii=False)}")
            
            if response.status_code == 200:
                print("✅ 客户分析POST接口正常")
            else:
                print("❌ 客户分析POST接口异常")
                
        except Exception as e:
            print(f"❌ 客户分析POST失败: {str(e)}")
        
        # 测试GET接口
        try:
            response = requests.get(f"{self.base_url}/api/customer/analysis/1")
            print(f"GET 状态码: {response.status_code}")
            print(f"GET 响应: {json.dumps(response.json(), indent=2, ensure_ascii=False)}")
            
            if response.status_code == 200:
                print("✅ 客户分析GET接口正常")
            else:
                print("❌ 客户分析GET接口异常")
                
        except Exception as e:
            print(f"❌ 客户分析GET失败: {str(e)}")
        
        print()
    
    def test_sales_prediction(self):
        """测试销售预测接口"""
        print("=" * 50)
        print("测试销售预测接口")
        print("=" * 50)
        
        try:
            data = {
                "lead_id": 1
            }
            
            response = requests.post(
                f"{self.base_url}/api/sales/prediction",
                headers=self.headers,
                json=data
            )
            
            print(f"状态码: {response.status_code}")
            print(f"响应内容: {json.dumps(response.json(), indent=2, ensure_ascii=False)}")
            
            if response.status_code == 200:
                print("✅ 销售预测接口正常")
            else:
                print("❌ 销售预测接口异常")
                
        except Exception as e:
            print(f"❌ 销售预测失败: {str(e)}")
        
        print()
    
    def test_script_recommendation(self):
        """测试话术推荐接口"""
        print("=" * 50)
        print("测试话术推荐接口")
        print("=" * 50)
        
        scenarios = ['general', 'objection', 'closing']
        
        for scenario in scenarios:
            try:
                data = {
                    "customer_id": 1,
                    "scenario": scenario
                }
                
                response = requests.post(
                    f"{self.base_url}/api/script/recommendation",
                    headers=self.headers,
                    json=data
                )
                
                print(f"场景 {scenario} - 状态码: {response.status_code}")
                print(f"场景 {scenario} - 响应: {json.dumps(response.json(), indent=2, ensure_ascii=False)}")
                
                if response.status_code == 200:
                    print(f"✅ 话术推荐接口({scenario})正常")
                else:
                    print(f"❌ 话术推荐接口({scenario})异常")
                    
            except Exception as e:
                print(f"❌ 话术推荐({scenario})失败: {str(e)}")
        
        print()
    
    def test_risk_analysis(self):
        """测试风险分析接口"""
        print("=" * 50)
        print("测试风险分析接口")
        print("=" * 50)
        
        try:
            data = {
                "customer_ids": [1, 2, 3]
            }
            
            response = requests.post(
                f"{self.base_url}/api/risk/analysis",
                headers=self.headers,
                json=data
            )
            
            print(f"状态码: {response.status_code}")
            print(f"响应内容: {json.dumps(response.json(), indent=2, ensure_ascii=False)}")
            
            if response.status_code == 200:
                print("✅ 风险分析接口正常")
            else:
                print("❌ 风险分析接口异常")
                
        except Exception as e:
            print(f"❌ 风险分析失败: {str(e)}")
        
        print()
    
    def test_batch_analysis(self):
        """测试批量分析接口"""
        print("=" * 50)
        print("测试批量分析接口")
        print("=" * 50)
        
        test_cases = [
            {
                "type": "customer",
                "entity_ids": [1, 2]
            },
            {
                "type": "sales",
                "entity_ids": [1, 2]
            }
        ]
        
        for case in test_cases:
            try:
                response = requests.post(
                    f"{self.base_url}/api/batch/analysis",
                    headers=self.headers,
                    json=case
                )
                
                print(f"类型 {case['type']} - 状态码: {response.status_code}")
                print(f"类型 {case['type']} - 响应: {json.dumps(response.json(), indent=2, ensure_ascii=False)}")
                
                if response.status_code == 200:
                    print(f"✅ 批量分析接口({case['type']})正常")
                else:
                    print(f"❌ 批量分析接口({case['type']})异常")
                    
            except Exception as e:
                print(f"❌ 批量分析({case['type']})失败: {str(e)}")
        
        print()
    
    def test_error_cases(self):
        """测试错误情况"""
        print("=" * 50)
        print("测试错误情况")
        print("=" * 50)
        
        # 测试缺少参数
        try:
            response = requests.post(
                f"{self.base_url}/api/customer/analysis",
                headers=self.headers,
                json={}
            )
            
            print(f"缺少参数 - 状态码: {response.status_code}")
            print(f"缺少参数 - 响应: {json.dumps(response.json(), indent=2, ensure_ascii=False)}")
            
        except Exception as e:
            print(f"缺少参数测试失败: {str(e)}")
        
        # 测试不存在的客户
        try:
            response = requests.get(f"{self.base_url}/api/customer/analysis/99999")
            
            print(f"不存在客户 - 状态码: {response.status_code}")
            print(f"不存在客户 - 响应: {json.dumps(response.json(), indent=2, ensure_ascii=False)}")
            
        except Exception as e:
            print(f"不存在客户测试失败: {str(e)}")
        
        # 测试404
        try:
            response = requests.get(f"{self.base_url}/api/nonexistent")
            
            print(f"404测试 - 状态码: {response.status_code}")
            print(f"404测试 - 响应: {json.dumps(response.json(), indent=2, ensure_ascii=False)}")
            
        except Exception as e:
            print(f"404测试失败: {str(e)}")
        
        print()
    
    def run_all_tests(self):
        """运行所有测试"""
        print(f"开始测试 ShopPro AI服务 - {datetime.now()}")
        print(f"测试目标: {self.base_url}")
        print()
        
        # 等待服务启动
        print("等待服务启动...")
        time.sleep(2)
        
        # 执行所有测试
        self.test_health_check()
        self.test_customer_analysis()
        self.test_sales_prediction()
        self.test_script_recommendation()
        self.test_risk_analysis()
        self.test_batch_analysis()
        self.test_error_cases()
        
        print("=" * 50)
        print("测试完成")
        print("=" * 50)


if __name__ == "__main__":
    import sys
    
    # 获取服务地址
    base_url = sys.argv[1] if len(sys.argv) > 1 else "http://localhost:5000"
    
    # 创建测试器
    tester = AIServiceTester(base_url)
    
    # 运行所有测试
    tester.run_all_tests()