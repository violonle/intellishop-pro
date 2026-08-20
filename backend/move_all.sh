#!/bin/bash
# Move DTOs to API
mv src/main/java/com/shoppro/dto shoppro-api/src/main/java/com/shoppro/

# Move Code to Core
mv src/main/java/com/shoppro/entity shoppro-core/src/main/java/com/shoppro/
mv src/main/java/com/shoppro/service shoppro-core/src/main/java/com/shoppro/
mv src/main/java/com/shoppro/repository shoppro-core/src/main/java/com/shoppro/
mv src/main/java/com/shoppro/util shoppro-core/src/main/java/com/shoppro/
mkdir -p shoppro-core/src/main/java/com/shoppro/slim
mv src/main/java/com/shoppro/slim/entity shoppro-core/src/main/java/com/shoppro/slim/
mv src/main/java/com/shoppro/slim/service shoppro-core/src/main/java/com/shoppro/slim/

# Move Code to Infra
mkdir -p shoppro-infra/src/main/java/com/shoppro/config
mv src/main/java/com/shoppro/config/MybatisPlusConfig.java shoppro-infra/src/main/java/com/shoppro/config/
mv src/main/java/com/shoppro/config/RabbitMQConfig.java shoppro-infra/src/main/java/com/shoppro/config/
mv src/main/java/com/shoppro/config/RedisConfig.java shoppro-infra/src/main/java/com/shoppro/config/
mv src/main/java/com/shoppro/config/RestTemplateConfig.java shoppro-infra/src/main/java/com/shoppro/config/
mv src/main/java/com/shoppro/config/BeanOverrideRegistry.java shoppro-infra/src/main/java/com/shoppro/config/
mv src/main/java/com/shoppro/aspect shoppro-infra/src/main/java/com/shoppro/
mkdir -p shoppro-infra/src/main/java/com/shoppro/slim
mv src/main/java/com/shoppro/slim/mapper shoppro-infra/src/main/java/com/shoppro/slim/

# Move Code to Web
mv src/main/java/com/shoppro/ShopProApplication.java shoppro-web/src/main/java/com/shoppro/
mv src/main/java/com/shoppro/controller shoppro-web/src/main/java/com/shoppro/
mv src/main/java/com/shoppro/security shoppro-web/src/main/java/com/shoppro/
mv src/main/java/com/shoppro/interceptor shoppro-web/src/main/java/com/shoppro/
mv src/main/java/com/shoppro/exception shoppro-web/src/main/java/com/shoppro/
mv src/main/java/com/shoppro/config/SecurityConfig.java shoppro-web/src/main/java/com/shoppro/config/
mv src/main/java/com/shoppro/config/SwaggerConfig.java shoppro-web/src/main/java/com/shoppro/config/
mv src/main/java/com/shoppro/config/WebMvcConfig.java shoppro-web/src/main/java/com/shoppro/config/
mv src/main/java/com/shoppro/config/FileUploadConfig.java shoppro-web/src/main/java/com/shoppro/config/
mv src/main/java/com/shoppro/config/MetricsConfig.java shoppro-web/src/main/java/com/shoppro/config/
mv src/main/java/com/shoppro/config/StartupRunnerConfig.java shoppro-web/src/main/java/com/shoppro/config/
mkdir -p shoppro-web/src/main/java/com/shoppro/slim
mv src/main/java/com/shoppro/slim/controller shoppro-web/src/main/java/com/shoppro/slim/
mv src/main/java/com/shoppro/slim/config shoppro-web/src/main/java/com/shoppro/slim/

# Move Resources
mkdir -p shoppro-infra/src/main/resources
mv src/main/resources/mapper shoppro-infra/src/main/resources/

mkdir -p shoppro-web/src/main/resources
mv src/main/resources/application.yml shoppro-web/src/main/resources/
mv src/main/resources/static shoppro-web/src/main/resources/
mv src/main/resources/templates shoppro-web/src/main/resources/

# Cleanup
rm -rf src/main/java/com/shoppro
rm -rf src/main/resources
