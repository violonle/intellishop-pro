#!/usr/bin/env bash

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
APP_DIR="$PROJECT_ROOT/shoppro-app"

echo "[前端启动] 目标目录: $APP_DIR"

# 检查 Node
if ! command -v node >/dev/null 2>&1; then
  echo "错误：未检测到 Node.js，请先安装 Node.js 16+"
  exit 1
fi

# 优先使用国内镜像源
if command -v npm >/dev/null 2>&1; then
  echo "[前端启动] 设置 npm 国内镜像源为 npmmirror"
  npm config set registry https://registry.npmmirror.com || true
fi

cd "$APP_DIR"

echo "[前端启动] 安装依赖...（处理peer依赖冲突）"
npm install --no-fund --loglevel=error --legacy-peer-deps

echo "[前端启动] 启动H5开发服务器..."
npm run dev:h5