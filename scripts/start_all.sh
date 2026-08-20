#!/usr/bin/env bash
# ==============================================================================
# ShopPro AI SCRM - 一键全栈服务启动脚本
# ==============================================================================

set -e

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_ROOT"

echo "======================================================"
echo " 🚀 正在启动 ShopPro AI SCRM 全栈环境..."
echo "======================================================"

# 1. 启动 Docker 容器组 (MySQL, Redis)
echo "▶ 1/4 启动基础容器服务 (MySQL, Redis)..."
docker compose up -d mysql redis

# 2. 启动 Spring Boot 后端
echo "▶ 2/4 启动 Spring Boot 后端 (端口 8080)..."
pkill -f "shoppro-web" || true
pkill -f "ShopProApplication" || true
cd "$PROJECT_ROOT/backend"
nohup mvn spring-boot:run -pl shoppro-web > "$PROJECT_ROOT/backend_runtime.log" 2>&1 &

# 3. 启动 PC 业务主站
echo "▶ 3/5 启动 PC 业务主站 (端口 5174)..."
cd "$PROJECT_ROOT/shoppro-admin"
nohup npm run dev:business > "$PROJECT_ROOT/business_runtime.log" 2>&1 &

# 4. 启动平台管理后台
echo "▶ 4/5 启动平台管理后台 (端口 5175)..."
nohup npm run dev:platform-admin > "$PROJECT_ROOT/platform_admin_runtime.log" 2>&1 &

# 5. 启动 移动端 App
echo "▶ 5/5 启动 移动端 App (端口 5173)..."
cd "$PROJECT_ROOT/shoppro-app"
nohup npm run dev -- --host 0.0.0.0 --port 5173 > "$PROJECT_ROOT/app_runtime.log" 2>&1 &

echo "======================================================"
echo " ✅ 全栈服务启动指令已发出！"
echo " 🖥️ PC 业务主站:    http://localhost:5174/login"
echo " 🔐 平台管理后台:   http://localhost:5175/admin-login"
echo " 📱 移动端业务 App: http://localhost:5173"
echo " ⚙️ 后端 API 接口:  http://localhost:8080/api"
echo " 📘 Swagger 文档:  http://localhost:8080/api/swagger-ui.html"
echo " 🌐 项目导航门户:   http://localhost:8080/ (或直接打开 index.html)"
echo "======================================================"
