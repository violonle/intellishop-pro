package com.shoppro.interceptor;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;
import org.springframework.web.servlet.ModelAndView;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.time.Duration;
import java.time.Instant;

/**
 * HTTP请求日志拦截器
 * 记录请求的基础信息与响应耗时
 */
@Component
public class HttpLoggingInterceptor implements HandlerInterceptor {

    private static final Logger log = LoggerFactory.getLogger(HttpLoggingInterceptor.class);
    private static final String START_TIME_ATTR = "__shoppro_request_start_time__";

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        // 记录开始时间
        request.setAttribute(START_TIME_ATTR, Instant.now());
        if (log.isDebugEnabled()) {
            String uri = request.getRequestURI();
            String query = request.getQueryString();
            String method = request.getMethod();
            String fullPath = query == null ? uri : uri + "?" + query;
            log.debug("Incoming request: {} {}", method, fullPath);
        }
        return true;
    }

    @Override
    public void postHandle(HttpServletRequest request, HttpServletResponse response, Object handler, ModelAndView modelAndView) {
        // 可按需记录模型视图信息，这里保持最小实现
    }

    @Override
    public void afterCompletion(HttpServletRequest request, HttpServletResponse response, Object handler, Exception ex) {
        Object startObj = request.getAttribute(START_TIME_ATTR);
        if (startObj instanceof Instant) {
            Instant start = (Instant) startObj;
            long millis = Duration.between(start, Instant.now()).toMillis();
            if (log.isDebugEnabled()) {
                int status = response.getStatus();
                log.debug("Completed request: {} {} - {} ({} ms)", request.getMethod(), request.getRequestURI(), status, millis);
            }
        }
        if (ex != null) {
            log.warn("Request completed with exception: {}", ex.getMessage(), ex);
        }
    }
}