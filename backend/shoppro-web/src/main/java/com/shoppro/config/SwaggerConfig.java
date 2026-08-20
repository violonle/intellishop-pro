package com.shoppro.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Swagger API 文档配置类
 * 配置 ShopPro 系统 API 文档的基本信息
 *
 * @author ShopPro Team
 * @version 1.0.0
 */
@Configuration
public class SwaggerConfig {

    @Bean
    public OpenAPI customOpenAPI() {
        OpenAPI openAPI = new OpenAPI();
        openAPI.setOpenapi("3.0.3");  // 明确设置 OpenAPI 版本为 3.0.3
        openAPI.setInfo(new Info()
                .title("ShopPro 智能SCRM系统 API")
                .description("ShopPro 智能客户关系管理系统 RESTful API 文档 - 提供完整的客户管理、销售跟进、数据分析等功能接口")
                .version("1.0.0")
                .contact(new Contact()
                        .name("ShopPro 开发团队")
                        .email("support@shoppro.com")));
        return openAPI;
    }
}