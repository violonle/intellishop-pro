package com.shoppro;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.transaction.annotation.EnableTransactionManagement;

/**
 * ShopPro AI智能SCRM系统启动类
 * 
 * @author ShopPro Team
 * @version 1.0.0
 * @since 2024-10-19
 */
@SpringBootApplication
@MapperScan("com.shoppro.repository")
@EnableTransactionManagement
@EnableAsync
@EnableScheduling
public class ShopProApplication {

    public static void main(String[] args) {
        SpringApplication.run(ShopProApplication.class, args);
        System.out.println("ShopPro started: http://localhost:8080/api (swagger-ui.html)");
    }
}