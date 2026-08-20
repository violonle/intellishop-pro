# 使用OpenJDK 11作为基础镜像
FROM openjdk:11-jre-slim

# 设置维护者信息
LABEL maintainer="ShopPro Team <support@shoppro.com>"
LABEL version="1.0.0"
LABEL description="ShopPro AI智能SCRM系统后端服务"

# 设置工作目录
WORKDIR /app

# 设置时区
ENV TZ=Asia/Shanghai
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

# 安装必要的系统包
RUN apt-get update && apt-get install -y \
    curl \
    wget \
    fontconfig \
    libfreetype6 \
    && rm -rf /var/lib/apt/lists/*

# 创建应用用户
RUN groupadd -r shoppro && useradd -r -g shoppro -d /app -s /sbin/nologin shoppro

# 创建日志和上传目录
RUN mkdir -p /var/log/shoppro /data/shoppro/uploads && \
    chown -R shoppro:shoppro /var/log/shoppro /data/shoppro

# 复制Maven构建的jar文件
COPY target/shoppro-backend-*.jar app.jar

# 设置文件权限
RUN chown shoppro:shoppro app.jar

# 切换到应用用户
USER shoppro

# 暴露端口
EXPOSE 8080

# 设置JVM参数
ENV JAVA_OPTS="-Xms512m -Xmx2g -XX:+UseG1GC -XX:G1HeapRegionSize=16m -XX:+UseG1OptionalPreEvacuationCollection -XX:+UseStringDeduplication -XX:+HeapDumpOnOutOfMemoryError -XX:HeapDumpPath=/var/log/shoppro/heapdump.hprof"

# 设置Spring Boot profiles
ENV SPRING_PROFILES_ACTIVE=prod

# 健康检查
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:8080/api/actuator/health || exit 1

# 启动应用
CMD ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]