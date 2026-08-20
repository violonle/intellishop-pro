#!/bin/bash
BASE="/Users/yangyong/codebuddy/ShopPro/backend"

echo "Moving heavy implementations to shoppro-infra..."
mkdir -p "$BASE/shoppro-infra/src/main/java/com/shoppro/service/impl"
mkdir -p "$BASE/shoppro-infra/src/main/java/com/shoppro/security"

# Services
mv "$BASE/shoppro-core/src/main/java/com/shoppro/service/impl/AuthServiceImpl.java" "$BASE/shoppro-infra/src/main/java/com/shoppro/service/impl/"
mv "$BASE/shoppro-core/src/main/java/com/shoppro/service/impl/UserServiceImpl.java" "$BASE/shoppro-infra/src/main/java/com/shoppro/service/impl/"
mv "$BASE/shoppro-core/src/main/java/com/shoppro/service/impl/FileStorageServiceImpl.java" "$BASE/shoppro-infra/src/main/java/com/shoppro/service/impl/"

# Security Utils
mv "$BASE/shoppro-web/src/main/java/com/shoppro/security/JwtTokenProvider.java" "$BASE/shoppro-infra/src/main/java/com/shoppro/security/"

echo "Fix complete."
