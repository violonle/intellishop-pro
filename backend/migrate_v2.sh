#!/bin/bash
# Move from the mess directory to correct modules
BASE="/Users/yangyong/codebuddy/ShopPro/backend"
MESS="$BASE/shoppro-infra/src/main/resources"

echo "Moving common files..."
mv "$MESS/exception" "$BASE/shoppro-common/src/main/java/com/shoppro/"

echo "Moving core files..."
mv "$MESS/entity" "$BASE/shoppro-core/src/main/java/com/shoppro/"
mkdir -p "$BASE/shoppro-core/src/main/java/com/shoppro/service"
mv "$MESS/service/"* "$BASE/shoppro-core/src/main/java/com/shoppro/service/"

echo "Moving infra files..."
mv "$MESS/repository" "$BASE/shoppro-infra/src/main/java/com/shoppro/"
# Merge config content
mv "$MESS/config/"* "$BASE/shoppro-infra/src/main/java/com/shoppro/config/"

echo "Moving web files..."
mv "$MESS/controller" "$BASE/shoppro-web/src/main/java/com/shoppro/"
mv "$MESS/security" "$BASE/shoppro-web/src/main/java/com/shoppro/"
mv "$MESS/aspect" "$BASE/shoppro-web/src/main/java/com/shoppro/"
mv "$MESS/interceptor" "$BASE/shoppro-web/src/main/java/com/shoppro/"
mv "$MESS/slim" "$BASE/shoppro-web/src/main/java/com/shoppro/"
mv "$MESS/ShopProApplication.java" "$BASE/shoppro-web/src/main/java/com/shoppro/"
mv "$MESS/application.yml" "$BASE/shoppro-web/src/main/resources/"

echo "Done."
