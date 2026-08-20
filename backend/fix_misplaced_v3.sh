#!/bin/bash
BASE="/Users/yangyong/codebuddy/ShopPro/backend"

echo "Moving web-related configs back to shoppro-web..."
mkdir -p "$BASE/shoppro-web/src/main/java/com/shoppro/config"

CONFIGS=("SecurityConfig.java" "SwaggerConfig.java" "WebMvcConfig.java" "MetricsConfig.java")

for config in "${CONFIGS[@]}"; do
    if [ -f "$BASE/shoppro-infra/src/main/java/com/shoppro/config/$config" ]; then
        echo "Moving $config..."
        mv "$BASE/shoppro-infra/src/main/java/com/shoppro/config/$config" "$BASE/shoppro-web/src/main/java/com/shoppro/config/"
    fi
done

echo "Fix complete."
