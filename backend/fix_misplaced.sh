#!/bin/bash
BASE="/Users/yangyong/codebuddy/ShopPro/backend"

echo "Moving GlobalExceptionHandler to shoppro-web..."
mkdir -p "$BASE/shoppro-web/src/main/java/com/shoppro/exception"
mv "$BASE/shoppro-common/src/main/java/com/shoppro/exception/GlobalExceptionHandler.java" "$BASE/shoppro-web/src/main/java/com/shoppro/exception/"

echo "Moving CacheUtil to shoppro-infra..."
mkdir -p "$BASE/shoppro-infra/src/main/java/com/shoppro/util"
mv "$BASE/shoppro-common/src/main/java/com/shoppro/util/CacheUtil.java" "$BASE/shoppro-infra/src/main/java/com/shoppro/util/"

echo "Fix complete."
