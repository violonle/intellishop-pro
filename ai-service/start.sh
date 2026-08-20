#!/bin/bash

# ShopPro AI服务启动脚本

echo "启动ShopPro AI智能分析服务..."

# 检查Python环境
if ! command -v python3 &> /dev/null; then
    echo "错误: 未找到Python3，请先安装Python 3.8+"
    exit 1
fi

# 检查并安装依赖
if [ ! -d "venv" ]; then
    echo "创建虚拟环境..."
    python3 -m venv venv
fi

echo "激活虚拟环境..."
source venv/bin/activate

echo "安装依赖包..."
pip install -r requirements.txt

# 设置环境变量
export FLASK_APP=app.py
export FLASK_ENV=development
export FLASK_DEBUG=true
export PORT=5000

# 创建必要目录
mkdir -p models
mkdir -p logs

echo "服务配置:"
echo "- 端口: ${PORT}"
echo "- 调试模式: ${FLASK_DEBUG}"
echo "- 模型路径: ./models"
echo "- 日志路径: ./logs"

echo ""
echo "启动AI服务..."
echo "访问地址: http://localhost:${PORT}"
echo "健康检查: http://localhost:${PORT}/api/health"
echo ""
echo "按Ctrl+C停止服务"
echo ""

# 启动Flask应用
python app.py