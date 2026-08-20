package com.shoppro.slim.config;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.context.annotation.Configuration;

@Configuration
@MapperScan("com.shoppro.slim.mapper")
public class SlimMybatisConfig {
}
