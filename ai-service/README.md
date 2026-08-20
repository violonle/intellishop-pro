# ShopPro AI智能分析服务

基于Flask的AI微服务，为ShopPro SCRM系统提供智能分析功能。

## 功能特性

### 🤖 AI分析功能
- **客户画像分析**: RFM分析、客户分群、价值预测
- **销售预测**: 成交概率预测、销售周期预测
- **智能话术推荐**: 基于客户画像的个性化话术
- **风险分析**: 客户流失风险评估

### 📊 技术架构
- **机器学习**: scikit-learn、XGBoost、LightGBM
- **Web框架**: Flask + Flask-RESTful
- **数据库**: MySQL (通过PyMySQL连接)
- **缓存**: Redis (可选)
- **模型管理**: 本地文件存储 + 缓存机制

## 项目结构

```
ai-service/
├── app.py                  # 主应用入口
├── requirements.txt        # Python依赖
├── start.sh               # 启动脚本
├── test_ai_service.py     # 测试脚本
├── README.md              # 说明文档
│
├── services/              # AI服务模块
│   ├── __init__.py
│   ├── customer_analysis.py    # 客户分析服务
│   └── sales_prediction.py     # 销售预测服务
│
├── utils/                 # 工具模块
│   ├── __init__.py
│   ├── response.py        # API响应工具
│   ├── validator.py       # 数据验证工具
│   ├── database.py        # 数据库连接工具
│   └── model_manager.py   # AI模型管理工具
│
├── models/                # AI模型存储目录
├── logs/                  # 日志文件目录
└── venv/                  # 虚拟环境目录
```

## 快速开始

### 1. 环境准备

```bash
# 克隆项目
git clone <repository-url>
cd ShopPro/ai-service

# 确保Python 3.8+环境
python3 --version
```

### 2. 启动服务

```bash
# 使用启动脚本（推荐）
./start.sh

# 或手动启动
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python app.py
```

### 3. 验证服务

```bash
# 健康检查
curl http://localhost:5000/api/health

# 运行测试
python test_ai_service.py
```

## API接口

### 基础接口

#### 健康检查
```http
GET /api/health
```

响应示例:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "status": "healthy",
    "timestamp": "2024-01-15T10:30:00",
    "version": "1.0.0",
    "services": {
      "database": "connected",
      "ai_models": {...}
    }
  }
}
```

### 客户分析

#### 客户画像分析
```http
POST /api/customer/analysis
Content-Type: application/json

{
  "customer_id": 1
}
```

```http
GET /api/customer/analysis/{customer_id}
```

响应示例:
```json
{
  "code": 200,
  "data": {
    "customer_id": 1,
    "rfm_analysis": {
      "recency": 15,
      "frequency": 8,
      "monetary": 2500.0,
      "rfm_score": "421"
    },
    "cluster_analysis": {
      "cluster": 2,
      "cluster_name": "价值客户",
      "features": {...}
    },
    "value_prediction": {
      "predicted_value": "high",
      "probability": 0.85
    }
  }
}
```

### 销售预测

#### 成交概率预测
```http
POST /api/sales/prediction
Content-Type: application/json

{
  "lead_id": 1
}
```

响应示例:
```json
{
  "code": 200,
  "data": {
    "lead_id": 1,
    "success_probability": 0.72,
    "predicted_cycle_days": 15,
    "risk_factors": [...],
    "recommendations": [...]
  }
}
```

### 智能话术推荐

```http
POST /api/script/recommendation
Content-Type: application/json

{
  "customer_id": 1,
  "scenario": "general"  // general, objection, closing
}
```

响应示例:
```json
{
  "code": 200,
  "data": {
    "customer_id": 1,
    "scenario": "general",
    "scripts": [
      "您好张先生，我是来自ShopPro的客户顾问",
      "根据您之前的购买记录，我为您推荐一些新产品"
    ],
    "recommendations": 2
  }
}
```

### 风险分析

```http
POST /api/risk/analysis
Content-Type: application/json

{
  "customer_ids": [1, 2, 3]
}
```

响应示例:
```json
{
  "code": 200,
  "data": {
    "total_analyzed": 3,
    "risk_analysis": [
      {
        "customer_id": 1,
        "customer_name": "张三",
        "risk_score": 0.3,
        "risk_level": "low",
        "recommendations": [...]
      }
    ],
    "high_risk_count": 0
  }
}
```

### 批量分析

```http
POST /api/batch/analysis
Content-Type: application/json

{
  "type": "customer",  // customer, sales
  "entity_ids": [1, 2, 3]
}
```

## 环境配置

### 环境变量

```bash
# AI服务配置
export AI_SECRET_KEY="your-secret-key"
export FLASK_DEBUG="true"
export PORT="5000"

# 数据库配置
export DB_HOST="localhost"
export DB_PORT="3306"
export DB_USER="shoppro"
export DB_PASSWORD="shoppro123"
export DB_NAME="shoppro"

# 模型路径
export MODEL_PATH="./models"
```

### 数据库要求

- MySQL 8.0+
- 需要ShopPro数据库schema
- 包含customers、leads、orders等核心表

### Python依赖

主要依赖包：
- Flask 2.3.3
- scikit-learn 1.3.0
- pandas 2.0.3
- PyMySQL 1.1.0
- numpy 1.24.3

完整依赖见 `requirements.txt`

## 开发指南

### 添加新的AI服务

1. 在 `services/` 目录下创建新的服务文件
2. 继承基础服务类，实现分析逻辑
3. 在 `app.py` 中添加对应的API路由
4. 更新测试脚本

### 模型管理

```python
from utils import model_manager

# 保存模型
model_manager.save_model(model, 'model_name', metadata)

# 加载模型
model = model_manager.load_model('model_name')

# 检查模型状态
status = model_manager.list_models()
```

### 数据库操作

```python
from utils import db_manager

# 获取客户信息
customer = db_manager.get_customer_by_id(customer_id)

# 批量获取客户
customers = db_manager.get_customers_by_ids([1, 2, 3])

# 执行自定义查询
results = db_manager.execute_query(sql, params)
```

## 测试

### 运行单元测试

```bash
# 运行所有测试
python test_ai_service.py

# 测试特定服务
python -c "
from test_ai_service import AIServiceTester
tester = AIServiceTester()
tester.test_customer_analysis()
"
```

### 性能测试

```bash
# 使用ab工具进行压力测试
ab -n 100 -c 10 -H "Content-Type: application/json" \
   -p test_data.json http://localhost:5000/api/customer/analysis
```

## 部署

### Docker部署

```dockerfile
FROM python:3.9-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .
EXPOSE 5000

CMD ["python", "app.py"]
```

### 生产配置

```bash
# 使用gunicorn
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:5000 app:app

# 使用systemd服务
sudo systemctl enable shoppro-ai
sudo systemctl start shoppro-ai
```

## 监控和日志

### 日志配置

- 日志文件: `ai-service.log`
- 日志级别: INFO
- 轮转策略: 按天轮转，保留30天

### 监控指标

- 接口响应时间
- 错误率
- 模型预测准确性
- 资源使用情况

## 故障排除

### 常见问题

1. **模型文件缺失**
   - 检查 `models/` 目录
   - 重新训练模型

2. **数据库连接失败**
   - 验证数据库配置
   - 检查网络连接

3. **内存不足**
   - 调整模型缓存策略
   - 增加服务器内存

### 调试模式

```bash
export FLASK_DEBUG=true
python app.py
```

## 贡献指南

1. Fork项目
2. 创建特性分支
3. 提交更改
4. 创建Pull Request

## 许可证

Copyright © 2024 ShopPro Team. All rights reserved.

---

## 更新日志

### v1.0.0 (2024-01-15)
- 初始版本发布
- 实现基础AI分析功能
- 完成API接口设计
- 添加测试和文档