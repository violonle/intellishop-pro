# ShopPro AI智能SCRM系统 - 部署指南

## 📋 系统概述

ShopPro是一个基于AI的智能客户关系管理系统，采用前后端分离架构，支持容器化部署。

### 技术栈
- **后端**: Spring Boot 2.7, MySQL 8.0, Redis 6.x, JWT认证
- **前端**: HTML5, Tailwind CSS, 原生JavaScript
- **AI服务**: Python Flask, scikit-learn, TensorFlow
- **容器化**: Docker, Docker Compose
- **反向代理**: Nginx
- **监控**: Prometheus, Grafana
- **文件存储**: MinIO

## 🚀 快速开始

### 1. 环境准备

#### 系统要求
- **操作系统**: Linux (推荐 Ubuntu 20.04+), macOS, Windows 10+
- **内存**: 至少 8GB (推荐 16GB+)
- **存储**: 至少 50GB 可用空间
- **网络**: 稳定的互联网连接

#### 必需软件
```bash
# 安装Docker和Docker Compose
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# 安装Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# 验证安装
docker --version
docker-compose --version
```

### 2. 项目部署

#### Step 1: 克隆项目
```bash
git clone https://github.com/your-repo/ShopPro.git
cd ShopPro
```

#### Step 2: 配置环境变量
```bash
# 复制环境变量模板
cp .env.example .env

# 编辑环境变量 (重要：修改默认密码)
vim .env
```

#### Step 3: 构建和启动服务
```bash
# 构建并启动所有服务
docker-compose up -d

# 查看服务状态
docker-compose ps

# 查看日志
docker-compose logs -f backend
```

#### Step 4: 初始化数据库
```bash
# 等待MySQL启动完成后，初始化数据
docker-compose exec mysql mysql -u root -p shoppro_db < /docker-entrypoint-initdb.d/01_init_database.sql
docker-compose exec mysql mysql -u root -p shoppro_db < /docker-entrypoint-initdb.d/02_insert_sample_data.sql
```

### 3. 验证部署

#### 服务端口检查
```bash
# 检查所有服务端口
netstat -tlnp | grep -E ':(80|443|8080|3306|6379|9000|9001)' || \
ss -tlnp | grep -E ':(80|443|8080|3306|6379|9000|9001)'
```

#### 健康检查
- **前端**: http://localhost (应显示登录页面)
- **后端API**: http://localhost:8080/api/health
- **API文档**: http://localhost:8080/api/swagger-ui.html
- **数据库管理**: http://localhost:8081 (开发模式)
- **Redis管理**: http://localhost:8082 (开发模式)
- **MinIO控制台**: http://localhost:9001
- **监控面板**: http://localhost:3000 (监控模式)

## 🛠️ 开发环境设置

### 1. 本地开发环境

#### 后端开发
```bash
# 进入后端目录
cd backend

# 安装Maven依赖
./mvnw clean install

# 启动开发服务器
./mvnw spring-boot:run -Dspring-boot.run.profiles=dev

# 或者使用IDE (推荐IntelliJ IDEA)
```

#### 前端开发
```bash
# 启动本地HTTP服务器
python3 -m http.server 8000
# 或者使用Node.js
npx serve .

# 访问: http://localhost:8000
```

#### AI服务开发
```bash
cd ai-service

# 创建虚拟环境
python3 -m venv venv
source venv/bin/activate

# 安装依赖
pip install -r requirements.txt

# 启动开发服务器
flask run --debug
```

### 2. 开发工具推荐

#### IDE配置
- **Java**: IntelliJ IDEA Ultimate, VS Code + Java Extension Pack
- **前端**: VS Code, WebStorm
- **Python**: PyCharm, VS Code + Python Extension
- **数据库**: DBeaver, Adminer, MySQL Workbench

#### Chrome扩展
- **Vue.js devtools**: 调试Vue组件
- **React Developer Tools**: 调试React组件
- **JSON Viewer**: 格式化JSON响应
- **Postman**: API测试

## 🏭 生产环境部署

### 1. 服务器配置

#### 推荐配置
- **CPU**: 4核心以上
- **内存**: 16GB以上
- **存储**: SSD 100GB以上
- **网络**: 带宽10Mbps以上

#### 安全配置
```bash
# 防火墙配置
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable

# SSL证书配置 (Let's Encrypt)
sudo apt install certbot
sudo certbot certonly --standalone -d your-domain.com
```

### 2. 生产环境优化

#### Docker Compose生产配置
```bash
# 使用生产配置启动
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# 启用监控
docker-compose --profile monitoring up -d
```

#### 数据库优化
```sql
-- MySQL配置优化
SET GLOBAL innodb_buffer_pool_size = 2147483648; -- 2GB
SET GLOBAL max_connections = 1000;
SET GLOBAL query_cache_size = 134217728; -- 128MB
```

#### Nginx优化
```nginx
# 开启HTTP/2和Gzip压缩
server {
    listen 443 ssl http2;
    gzip on;
    gzip_comp_level 6;
    
    # 安全头设置
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains";
    add_header X-Frame-Options SAMEORIGIN;
    add_header X-Content-Type-Options nosniff;
}
```

### 3. 备份策略

#### 自动备份脚本
```bash
#!/bin/bash
# backup.sh
DATE=$(date +%Y%m%d_%H%M%S)

# 数据库备份
docker-compose exec mysql mysqldump -u root -p$DB_ROOT_PASSWORD shoppro_db > backup/db_$DATE.sql

# 文件备份
tar -czf backup/files_$DATE.tar.gz uploads/

# 上传到S3 (可选)
aws s3 cp backup/db_$DATE.sql s3://shoppro-backups/
aws s3 cp backup/files_$DATE.tar.gz s3://shoppro-backups/

# 清理7天前的备份
find backup/ -mtime +7 -delete
```

## 📊 监控和日志

### 1. 应用监控

#### Prometheus监控指标
```yaml
# prometheus.yml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'spring-boot'
    static_configs:
      - targets: ['backend:8080']
    metrics_path: '/api/actuator/prometheus'
```

#### Grafana仪表板
- **应用性能**: JVM内存、CPU使用率、响应时间
- **业务指标**: 用户活跃度、API调用量、错误率
- **基础设施**: 数据库连接、Redis状态、磁盘使用

### 2. 日志管理

#### 日志配置
```yaml
# logback-spring.xml
<configuration>
    <appender name="FILE" class="ch.qos.logback.core.rolling.RollingFileAppender">
        <file>/var/log/shoppro/app.log</file>
        <rollingPolicy class="ch.qos.logback.core.rolling.TimeBasedRollingPolicy">
            <fileNamePattern>/var/log/shoppro/app.%d{yyyy-MM-dd}.log</fileNamePattern>
            <maxHistory>30</maxHistory>
        </rollingPolicy>
    </appender>
</configuration>
```

#### 日志分析
```bash
# 实时查看错误日志
docker-compose logs -f backend | grep ERROR

# 分析访问日志
docker-compose exec nginx tail -f /var/log/nginx/access.log | grep -v "/health"

# 性能分析
docker-compose exec backend jstack $(pgrep java)
```

## 🔧 故障排查

### 1. 常见问题

#### 数据库连接失败
```bash
# 检查MySQL状态
docker-compose exec mysql mysqladmin -u root -p ping

# 检查连接配置
docker-compose logs mysql | grep -i error

# 重置数据库
docker-compose stop mysql
docker volume rm shoppro_mysql_data
docker-compose up -d mysql
```

#### Redis连接问题
```bash
# 检查Redis状态
docker-compose exec redis redis-cli ping

# 查看Redis日志
docker-compose logs redis

# 清空Redis缓存
docker-compose exec redis redis-cli flushall
```

#### 应用启动失败
```bash
# 查看详细日志
docker-compose logs backend

# 检查配置文件
docker-compose exec backend cat /app/application.yml

# 内存和CPU检查
docker stats
```

### 2. 性能优化

#### JVM调优
```bash
export JAVA_OPTS="-Xms1g -Xmx4g -XX:+UseG1GC -XX:MaxGCPauseMillis=200"
```

#### 数据库优化
```sql
-- 慢查询分析
SHOW VARIABLES LIKE 'slow_query_log';
SHOW VARIABLES LIKE 'long_query_time';

-- 索引优化
EXPLAIN SELECT * FROM customers WHERE phone = '13800000001';
```

## 📚 更多资源

### 文档链接
- [API文档](http://localhost:8080/api/swagger-ui.html)
- [用户手册](./docs/USER_GUIDE.md)
- [开发指南](./docs/DEVELOPMENT.md)
- [架构设计](./docs/ARCHITECTURE.md)

### 社区支持
- **GitHub Issues**: https://github.com/your-repo/ShopPro/issues
- **讨论论坛**: https://github.com/your-repo/ShopPro/discussions
- **邮件支持**: support@shoppro.com

---

**注意**: 在生产环境中，请务必修改所有默认密码，启用SSL证书，并定期更新系统补丁。