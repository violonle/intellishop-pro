FROM python:3.10-slim

WORKDIR /app

# 安装系统依赖
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    g++ \
    curl \
    && rm -rf /var/lib/apt/lists/*

# 复制依赖文件
COPY requirements.txt .

# 安装 Python 依赖
RUN pip install --no-cache-dir -i https://pypi.tuna.tsinghua.edu.cn/simple \
    flask flask-cors flask-restful requests redis scikit-learn pandas numpy joblib pymysql sqlalchemy loguru pydantic pyyaml gunicorn

# 复制源码
COPY . .

# 暴露端口
EXPOSE 5000

# 启动服务
CMD ["python", "app.py"]
