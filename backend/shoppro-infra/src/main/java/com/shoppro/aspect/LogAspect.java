package com.shoppro.aspect;

import cn.hutool.json.JSONUtil;
import com.shoppro.annotation.Log;
import com.shoppro.entity.OperateLog;
import com.shoppro.repository.OperateLogRepository;
import com.shoppro.util.SecurityUtils;
import com.shoppro.util.ServletUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.AfterReturning;
import org.aspectj.lang.annotation.AfterThrowing;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Before;
import org.springframework.stereotype.Component;
import java.time.LocalDateTime;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * 操作日志记录处理
 */
@Aspect
@Component
public class LogAspect {
    private static final Logger log = LoggerFactory.getLogger(LogAspect.class);

    private final OperateLogRepository operateLogRepository;

    public LogAspect(OperateLogRepository operateLogRepository) {
        this.operateLogRepository = operateLogRepository;
    }

    // 计算操作消耗时间
    private static final ThreadLocal<Long> TIME_THREADLOCAL = new ThreadLocal<>();

    @Before("@annotation(controllerLog)")
    public void doBefore(JoinPoint joinPoint, Log controllerLog) {
        TIME_THREADLOCAL.set(System.currentTimeMillis());
    }

    /**
     * 处理完请求后执行
     */
    @AfterReturning(pointcut = "@annotation(controllerLog)", returning = "jsonResult")
    public void doAfterReturning(JoinPoint joinPoint, Log controllerLog, Object jsonResult) {
        handleLog(joinPoint, controllerLog, null, jsonResult);
    }

    /**
     * 拦截异常操作
     */
    @AfterThrowing(value = "@annotation(controllerLog)", throwing = "e")
    public void doAfterThrowing(JoinPoint joinPoint, Log controllerLog, Exception e) {
        handleLog(joinPoint, controllerLog, e, null);
    }

    protected void handleLog(final JoinPoint joinPoint, Log controllerLog, final Exception e, Object jsonResult) {
        try {
            // 获取当前的用户
            String username = SecurityUtils.getUsername();
            Long userId = SecurityUtils.getUserId();

            // *========数据库日志=========*//
            OperateLog operLog = new OperateLog();
            operLog.setStatus(0);
            // 请求的地址
            operLog.setIp(ServletUtils.getClientIp());
            operLog.setUrl(ServletUtils.getRequest().getRequestURI());
            operLog.setUserName(username);
            operLog.setUserId(userId);

            if (e != null) {
                operLog.setStatus(1);
                operLog.setErrorMsg(StrLimit(e.getMessage(), 2000));
            }
            // 设置方法名称
            String className = joinPoint.getTarget().getClass().getName();
            String methodName = joinPoint.getSignature().getName();
            operLog.setMethod(className + "." + methodName + "()");
            // 设置请求方式
            operLog.setRequestMethod(ServletUtils.getRequest().getMethod());
            // 处理注解上的参数
            getControllerMethodDescription(joinPoint, controllerLog, operLog, jsonResult);
            // 设置消耗时间
            operLog.setTimeUsed(System.currentTimeMillis() - TIME_THREADLOCAL.get());
            operLog.setCreatedAt(LocalDateTime.now());

            // 保存数据库
            operateLogRepository.insert(operLog);
        } catch (Exception exp) {
            log.error("日志记录异常: {}", exp.getMessage());
        } finally {
            TIME_THREADLOCAL.remove();
        }
    }

    /**
     * 获取注解中对方法的描述信息 用于Controller层注解
     */
    public void getControllerMethodDescription(JoinPoint joinPoint, Log log, OperateLog operLog, Object jsonResult) {
        // 设置业务类型
        operLog.setBusinessType(log.businessType());
        // 设置模块标题
        operLog.setTitle(log.title());
        // 是否需要保存request，参数和值
        if (log.isSaveRequestData()) {
            setRequestValue(joinPoint, operLog);
        }
        // 是否需要保存response，参数和值
        if (log.isSaveResponseData() && jsonResult != null) {
            operLog.setJsonResult(StrLimit(JSONUtil.toJsonStr(jsonResult), 2000));
        }
    }

    /**
     * 获取请求的参数，放到log中
     */
    private void setRequestValue(JoinPoint joinPoint, OperateLog operLog) {
        String requestMethod = operLog.getRequestMethod();
        if ("PUT".equals(requestMethod) || "POST".equals(requestMethod)) {
            String params = argsArrayToString(joinPoint.getArgs());
            operLog.setRequestParam(StrLimit(params, 2000));
        }
    }

    /**
     * 参数拼装
     */
    private String argsArrayToString(Object[] paramsArray) {
        StringBuilder params = new StringBuilder();
        if (paramsArray != null && paramsArray.length > 0) {
            for (Object o : paramsArray) {
                if (o != null) {
                    try {
                        params.append(redactSensitiveFields(JSONUtil.toJsonStr(o))).append(" ");
                    } catch (Exception e) {
                        params.append(o.toString()).append(" ");
                    }
                }
            }
        }
        return params.toString().trim();
    }

    private String redactSensitiveFields(String json) {
        return json.replaceAll(
                "(\\\"(?:password|oldPassword|newPassword|accessToken|refreshToken|apiKey|secret)\\\"\\s*:\\s*\\\")[^\\\"]*(\\\")",
                "$1***$2");
    }

    private String StrLimit(String str, int map) {
        if (str == null)
            return "";
        if (str.length() <= map)
            return str;
        return str.substring(0, map);
    }
}
