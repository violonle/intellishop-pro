package com.shoppro.config;

import com.shoppro.interceptor.HttpLoggingInterceptor;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.converter.HttpMessageConverter;
import org.springframework.http.converter.ByteArrayHttpMessageConverter;
import org.springframework.http.converter.StringHttpMessageConverter;
import org.springframework.http.converter.json.MappingJackson2HttpMessageConverter;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import org.springframework.beans.factory.annotation.Value;

import java.nio.charset.StandardCharsets;
import java.util.List;

/**
 * Web MVC配置
 * 配置拦截器、CORS、消息转换器等
 *
 * @author ShopPro Team
 * @version 1.0.0
 */
@Configuration
public class WebMvcConfig implements WebMvcConfigurer {

    private final HttpLoggingInterceptor httpLoggingInterceptor;
    private final MappingJackson2HttpMessageConverter mappingJackson2HttpMessageConverter;

    @Value("${cors.allowed-origins:http://localhost:3000,http://localhost:5173,http://localhost:5174,http://localhost:5175,http://localhost:5176}")
    private String allowedOrigins;

    public WebMvcConfig(HttpLoggingInterceptor httpLoggingInterceptor,
                        MappingJackson2HttpMessageConverter mappingJackson2HttpMessageConverter) {
        this.httpLoggingInterceptor = httpLoggingInterceptor;
        this.mappingJackson2HttpMessageConverter = mappingJackson2HttpMessageConverter;
    }

    /**
     * 配置拦截器
     */
    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        // 注册HTTP日志拦截器
        registry.addInterceptor(httpLoggingInterceptor)
                .addPathPatterns("/**")
                .excludePathPatterns(
                        "/swagger-ui/**",
                        "/v3/api-docs/**",
                        "/swagger-resources/**",
                        "/static/**",
                        "/assets/**"
                );
    }

    /**
     * 配置CORS（跨域资源共享）
     */
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                // 认证请求必须使用显式来源，来源由环境配置提供
                .allowedOrigins(allowedOrigins.split(","))
                // 允许的HTTP方法
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH")
                // 允许的请求头
                .allowedHeaders("*")
                // 是否允许携带凭证(Cookie等)
                .allowCredentials(true)
                // 预检请求的缓存时间
                .maxAge(3600);
    }

    /**
     * 保留默认消息转换器，并调整顺序：
     * 1) ByteArrayHttpMessageConverter 优先，用于 byte[] 原样输出（避免被 Jackson 转成 Base64 字符串）
     * 2) StringHttpMessageConverter 其次，保证字符串原样输出
     * 3) MappingJackson2HttpMessageConverter 接着，用于对象的 JSON 序列化
     */
    @Override
    public void extendMessageConverters(List<HttpMessageConverter<?>> converters) {
        // 处理 byte[]
        converters.removeIf(c -> c instanceof ByteArrayHttpMessageConverter);
        ByteArrayHttpMessageConverter byteArrayConverter = new ByteArrayHttpMessageConverter();
        converters.add(0, byteArrayConverter);

        // 处理 String
        converters.removeIf(c -> c instanceof StringHttpMessageConverter);
        StringHttpMessageConverter stringConverter = new StringHttpMessageConverter(StandardCharsets.UTF_8);
        converters.add(1, stringConverter);

        // 处理对象为 JSON
        converters.removeIf(c -> c instanceof MappingJackson2HttpMessageConverter);
        converters.add(2, mappingJackson2HttpMessageConverter);
    }

}
