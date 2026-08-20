#!/bin/bash
set -e

# Define directories
ROOT_DIR="/Users/yangyong/codebuddy/ShopPro/backend"
SRC_BASE="$ROOT_DIR/src/main/java/com/shoppro"
RESOURCES_BASE="$ROOT_DIR/src/main/resources"

CORE_BASE="$ROOT_DIR/shoppro-core/src/main/java/com/shoppro"
INFRA_BASE="$ROOT_DIR/shoppro-infra/src/main/java/com/shoppro"
WEB_BASE="$ROOT_DIR/shoppro-web/src/main/java/com/shoppro"
API_BASE="$ROOT_DIR/shoppro-api/src/main/java/com/shoppro"

# Ensure target directories exist
mkdir -p "$CORE_BASE"
mkdir -p "$INFRA_BASE/config"
mkdir -p "$WEB_BASE/config"
mkdir -p "$API_BASE/dto"

echo "Starting migration..."

# Move to shoppro-core
for dir in entity service repository util; do
    if [ -d "$SRC_BASE/$dir" ]; then
        echo "Moving $dir to core..."
        mv "$SRC_BASE/$dir" "$CORE_BASE/"
    fi
done

# Move to shoppro-infra
for dir in aspect; do
    if [ -d "$SRC_BASE/$dir" ]; then
        echo "Moving $dir to infra..."
        mv "$SRC_BASE/$dir" "$INFRA_BASE/"
    fi
done

infra_configs=(MybatisPlusConfig.java RedisConfig.java RestTemplateConfig.java BeanOverrideRegistry.java)
for conf in "${infra_configs[@]}"; do
    if [ -f "$SRC_BASE/config/$conf" ]; then
        echo "Moving $conf to infra config..."
        mv "$SRC_BASE/config/$conf" "$INFRA_BASE/config/"
    fi
done

# Move to shoppro-web
web_dirs=(controller security interceptor exception)
for dir in "${web_dirs[@]}"; do
    if [ -d "$SRC_BASE/$dir" ]; then
        echo "Moving $dir to web..."
        mv "$SRC_BASE/$dir" "$WEB_BASE/"
    fi
done

web_configs=(SecurityConfig.java SwaggerConfig.java WebMvcConfig.java FileUploadConfig.java MetricsConfig.java StartupRunnerConfig.java)
for conf in "${web_configs[@]}"; do
    if [ -f "$SRC_BASE/config/$conf" ]; then
        echo "Moving $conf to web config..."
        mv "$SRC_BASE/config/$conf" "$WEB_BASE/config/"
    fi
done

if [ -f "$SRC_BASE/ShopProApplication.java" ]; then
    echo "Moving ShopProApplication.java to web..."
    mv "$SRC_BASE/ShopProApplication.java" "$WEB_BASE/"
fi

# Move slim directory (if it exists)
if [ -d "$SRC_BASE/slim" ]; then
    echo "Processing slim directory..."
    mkdir -p "$CORE_BASE/slim"
    [ -d "$SRC_BASE/slim/entity" ] && mv "$SRC_BASE/slim/entity" "$CORE_BASE/slim/"
    [ -d "$SRC_BASE/slim/service" ] && mv "$SRC_BASE/slim/service" "$CORE_BASE/slim/"
    
    mkdir -p "$INFRA_BASE/slim"
    [ -d "$SRC_BASE/slim/mapper" ] && mv "$SRC_BASE/slim/mapper" "$INFRA_BASE/slim/"
    
    mkdir -p "$WEB_BASE/slim"
    [ -d "$SRC_BASE/slim/controller" ] && mv "$SRC_BASE/slim/controller" "$WEB_BASE/slim/"
    [ -d "$SRC_BASE/slim/config" ] && mv "$SRC_BASE/slim/config" "$WEB_BASE/slim/"
fi

# Resources
mkdir -p "$ROOT_DIR/shoppro-infra/src/main/resources"
[ -d "$RESOURCES_BASE/mapper" ] && mv "$RESOURCES_BASE/mapper" "$ROOT_DIR/shoppro-infra/src/main/resources/"

mkdir -p "$ROOT_DIR/shoppro-web/src/main/resources"
[ -f "$RESOURCES_BASE/application.yml" ] && mv "$RESOURCES_BASE/application.yml" "$ROOT_DIR/shoppro-web/src/main/resources/"
[ -d "$RESOURCES_BASE/static" ] && mv "$RESOURCES_BASE/static" "$ROOT_DIR/shoppro-web/src/main/resources/"
[ -d "$RESOURCES_BASE/templates" ] && mv "$RESOURCES_BASE/templates" "$ROOT_DIR/shoppro-web/src/main/resources/"
[ -f "$RESOURCES_BASE/init.sql" ] && mv "$RESOURCES_BASE/init.sql" "$ROOT_DIR/shoppro-web/src/main/resources/"

echo "Migration script finished."
