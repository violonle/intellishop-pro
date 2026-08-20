package com.shoppro.aspect;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.*;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import jakarta.servlet.http.HttpServletRequest;
import java.util.*;

/**
 * 日志切面
 * 用于记录API调用的日志，包括执行时间、参数、返回值等信息
 *
 * @author ShopPro Team
 * @version 1.0.0
 */
@Component
@Aspect
public class LoggingAspect {

    private static final Logger log = LoggerFactory.getLogger(LoggingAspect.class);
    private static final ObjectMapper objectMapper = new ObjectMapper();
    private static final String LOG_START = "====================> 请求开始 <====================";
    private static final String LOG_END = "====================> 请求结束 <====================";

    /**
     * 定义切点：所有 controller 中的方法
     */
    @Pointcut("execution(public * com.shoppro.controller..*(..))")
    public void controllerPointcut() {
    }

    /**
     * 定义切点：所有 service 中的方法
     */
    @Pointcut("execution(public * com.shoppro.service..*(..))")
    public void servicePointcut() {
    }

    /**
     * 环绕通知：记录方法调用前后的日志
     */
    @Around("controllerPointcut()")
    public Object logControllerMethod(ProceedingJoinPoint joinPoint) throws Throwable {
        long startTime = System.currentTimeMillis();
        String methodName = joinPoint.getSignature().getName();
        String className = joinPoint.getTarget().getClass().getSimpleName();
        String fullMethodName = className + "." + methodName;

        try {
            // 获取请求信息
            ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
            HttpServletRequest request = null;
            if (attributes != null) {
                request = attributes.getRequest();
                log.info(LOG_START);
                log.info("请求方法: {} {}", request.getMethod(), request.getRequestURI());
                log.info("处理类.方法: {}", fullMethodName);
                logRequestParams(joinPoint);
            }

            // 执行方法
            Object result = joinPoint.proceed();

            // 记录执行时间和返回值
            long duration = System.currentTimeMillis() - startTime;
            log.info("执行时间: {}ms", duration);
            log.info("返回值: {}", formatLog(result));
            log.info(LOG_END);

            return result;

        } catch (Exception e) {
            long duration = System.currentTimeMillis() - startTime;
            log.error("方法执行异常: {}, 耗时: {}ms", fullMethodName, duration, e);
            throw e;
        }
    }

    /**
     * 记录请求参数
     */
    private void logRequestParams(JoinPoint joinPoint) {
        Object[] args = joinPoint.getArgs();
        String[] paramNames = getMethodParamNames(joinPoint);

        if (args != null && args.length > 0) {
            log.info("请求参数:");
            for (int i = 0; i < args.length; i++) {
                String paramName = (i < paramNames.length) ? paramNames[i] : "param" + i;
                log.info("  {} = {}", paramName, formatLog(args[i]));
            }
        }
    }

    /**
     * 获取方法参数名称
     */
    private String[] getMethodParamNames(JoinPoint joinPoint) {
        try {
            return Arrays.stream(joinPoint.getSignature().getDeclaringType()
                    .getDeclaredMethod(joinPoint.getSignature().getName(),
                            (Class[]) Arrays.stream(joinPoint.getArgs())
                                    .map(Object::getClass)
                                    .toArray(Class[]::new))
                    .getParameters())
                    .map(java.lang.reflect.Parameter::getName)
                    .toArray(String[]::new);
        } catch (Exception e) {
            return new String[0];
        }
    }

    /**
     * 格式化日志输出
     */
    private String formatLog(Object obj) {
        if (obj == null) {
            return "null";
        }

        // 对于大对象，只显示摘要
        if (obj.getClass().getName().startsWith("java.")) {
            return obj.toString();
        }

        try {
            String jsonStr = objectMapper.writeValueAsString(obj);
            jsonStr = redactSensitiveFields(jsonStr);
            // 限制长度
            if (jsonStr.length() > 500) {
                return jsonStr.substring(0, 500) + "...";
            }
            return jsonStr;
        } catch (Exception e) {
            return obj.toString();
        }
    }

    private String redactSensitiveFields(String json) {
        return json.replaceAll(
                "(\\\"(?:password|oldPassword|newPassword|accessToken|refreshToken|apiKey|secret)\\\"\\s*:\\s*\\\")[^\\\"]*(\\\")",
                "$1***$2");
    }

    /**
     * 前置通知：在方法执行前记录
     */
    @Before("servicePointcut()")
    public void logServiceBefore(JoinPoint joinPoint) {
        String methodName = joinPoint.getSignature().getName();
        String className = joinPoint.getTarget().getClass().getSimpleName();
        log.debug("Service执行: {}.{}", className, methodName);
    }

    /**
     * 返回通知：在方法正常返回后记录
     */
    @AfterReturning(pointcut = "servicePointcut()", returning = "result")
    public void logServiceAfterReturning(JoinPoint joinPoint, Object result) {
        String methodName = joinPoint.getSignature().getName();
        String className = joinPoint.getTarget().getClass().getSimpleName();
        log.debug("Service返回: {}.{} -> {}", className, methodName, 
                result != null ? result.getClass().getSimpleName() : "null");
    }

    /**
     * 异常通知：在方法抛出异常后记录
     */
    @AfterThrowing(pointcut = "servicePointcut()", throwing = "e")
    public void logServiceAfterThrowing(JoinPoint joinPoint, Throwable e) {
        String methodName = joinPoint.getSignature().getName();
        String className = joinPoint.getTarget().getClass().getSimpleName();
        log.error("Service异常: {}.{} -> {}", className, methodName, e.getMessage());
    }

}
