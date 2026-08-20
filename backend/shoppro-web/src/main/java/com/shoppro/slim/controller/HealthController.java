package com.shoppro.slim.controller;

import com.shoppro.dto.response.ApiResponse;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;

@RestController
@ConditionalOnProperty(name = "slim.api.enabled", havingValue = "true", matchIfMissing = false)
public class HealthController {
    @GetMapping("/slim/health")
    public ApiResponse<Map<String, Object>> health() {
        Map<String, Object> m = new HashMap<>();
        m.put("status", "ok");
        m.put("timestamp", System.currentTimeMillis());
        return ApiResponse.success(m, "ok");
    }
}
