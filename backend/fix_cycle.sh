#!/bin/bash
BASE="/Users/yangyong/codebuddy/ShopPro/backend"

echo "Moving repositories from infra to core..."
mkdir -p "$BASE/shoppro-core/src/main/java/com/shoppro/repository"
mv "$BASE/shoppro-infra/src/main/java/com/shoppro/repository/"* "$BASE/shoppro-core/src/main/java/com/shoppro/repository/"
rmdir "$BASE/shoppro-infra/src/main/java/com/shoppro/repository"

echo "Cleaning up..."
# Any other lost files?
if [ -d "$BASE/shoppro-infra/src/main/resources/mapper" ]; then
    echo "Mappers are already in infra resources, good."
fi

echo "Done."
