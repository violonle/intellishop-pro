#!/usr/bin/env bash
# ==============================================================================
# ShopPro AI SCRM - 全栈服务健康自检脚本
# ==============================================================================

echo "======================================================"
echo " 🔍 执行 ShopPro 全栈服务健康检查..."
echo "======================================================"

check_http() {
    local name="$1"
    local url="$2"
    local expected="$3"

    local status
    status=$(curl -s -L -o /dev/null -w "%{http_code}" "$url" || echo "000")
    if [ "$status" = "200" ] || [[ "$status" =~ ^($expected)$ ]]; then
        echo -e "  \033[92m✔ [HEALTHY]\033[0m $name ($url) -> HTTP $status"
    else
        echo -e "  \033[91m✘ [UNHEALTHY]\033[0m $name ($url) -> HTTP $status"
    fi
}

check_port() {
    local name="$1"
    local port="$2"

    if lsof -i :"$port" >/dev/null 2>&1; then
        echo -e "  \033[92m✔ [LISTENING]\033[0m $name (端口 $port)"
    else
        echo -e "  \033[91m✘ [OFFLINE]\033[0m   $name (端口 $port)"
    fi
}

# 1. 端口检查
echo "▶ 1. 基础网络端口监听状态："
check_port "MySQL 数据库 (容器映射)" 3307
check_port "Redis 缓存 (容器映射)" 6379
check_port "Spring Boot 后端 API" 8080
check_port "PC 业务主站 (Vite)" 5174
check_port "平台管理后台 (Vite)" 5175
check_port "移动端 App (Vite)" 5173

# 2. HTTP 探测
echo -e "\n▶ 2. 核心 HTTP 服务健康探测："
check_http "PC 业务主站" "http://localhost:5174/login" "200"
check_http "平台管理后台" "http://localhost:5175/admin-login" "200"
check_http "移动端业务 App" "http://localhost:5173" "200"
check_http "Swagger API 在线文档" "http://localhost:8080/api/swagger-ui.html" "200|302"
check_http "后端 API 根路径" "http://localhost:8080/api/ai/scenarios/list" "200|401"

echo -e "\n======================================================"
echo " 🎯 健康检查完毕！"
echo "======================================================"
