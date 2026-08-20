package com.shoppro.testconfig;

import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;

@TestConfiguration
public class TestRunnerOverrides {
    @Bean(name = "ddlApplicationRunner")
    public ApplicationRunner ddlApplicationRunner() {
        return args -> {
            // No-op in tests: disable any DDL/Application startup runner logic
        };
    }
}