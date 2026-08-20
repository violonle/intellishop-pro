# 使用多阶段构建
# 第一阶段：构建静态文件
FROM node:16-alpine AS builder

WORKDIR /app

# 如果有前端构建流程，可以在这里添加
# 由于当前是静态HTML文件，直接复制即可

# 第二阶段：运行时
FROM nginx:alpine

# 设置维护者信息
LABEL maintainer="ShopPro Team <support@shoppro.com>"
LABEL version="1.0.0"
LABEL description="ShopPro AI智能SCRM系统前端服务"

# 设置时区
ENV TZ=Asia/Shanghai
RUN apk add --no-cache tzdata && \
    ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && \
    echo $TZ > /etc/timezone

# 安装依赖
RUN apk add --no-cache \
    curl \
    ca-certificates \
    && rm -rf /var/cache/apk/*

# 复制静态文件到nginx目录
COPY pages/ /usr/share/nginx/html/pages/
COPY assets/ /usr/share/nginx/html/assets/
COPY *.html /usr/share/nginx/html/

# 复制nginx配置
COPY frontend/nginx.conf /etc/nginx/nginx.conf

# 创建日志目录
RUN mkdir -p /var/log/nginx && \
    chown -R nginx:nginx /var/log/nginx

# 暴露端口
EXPOSE 80 443

# 健康检查
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
    CMD curl -f http://localhost/ || exit 1

# 启动nginx
CMD ["nginx", "-g", "daemon off;"]