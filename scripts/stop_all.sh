#!/usr/bin/env bash
# ==============================================================================
# ShopPro AI SCRM - 一键全栈服务停止脚本
# ==============================================================================

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_ROOT"

echo "======================================================"
echo " 🛑 正在停止 ShopPro AI SCRM 全栈环境..."
echo "======================================================"

# 1. 停止前端服务
echo "▶ 停止前端开发服务器 (Vite 5174 / 5173)..."
pkill -f "vite" || true

# 2. 停止 Spring Boot 后端
echo "▶ 停止 Spring Boot 后端进程..."
pkill -f "shoppro-web" || true
pkill -f "ShopProApplication" || true

# 3. 停止 Docker 容器组
echo "▶ 停止 Docker 容器组..."
docker compose stop mysql redis 2>/dev/null || true

echo "======================================================"
echo " 🟢 所有服务已安全停止！"
echo "======================================================"
