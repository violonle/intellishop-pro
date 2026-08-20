package com.shoppro.config;

import io.micrometer.core.instrument.*;
import io.micrometer.prometheusmetrics.PrometheusConfig;
import io.micrometer.prometheusmetrics.PrometheusMeterRegistry;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.actuate.autoconfigure.metrics.MeterRegistryCustomizer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * 性能监控配置
 * 集成Micrometer和Prometheus进行系统性能监控和指标收集
 *
 * @author ShopPro Team
 * @version 1.0.0
 */
@Configuration
public class MetricsConfig {

    private static final Logger log = LoggerFactory.getLogger(MetricsConfig.class);



    /**
     * 自定义MeterRegistry配置
     */
    @Bean
    public MeterRegistryCustomizer<MeterRegistry> meterRegistryCustomizer() {
        return registry -> {
            // 添加应用程序标签
            registry.config()
                .commonTags(
                    "application", "ShopPro",
                    "version", "2.0.0",
                    "environment", "production"
                );

            // 启用缓存性能指标
            enableCacheMetrics(registry);

            // 启用消息队列性能指标
            enableQueueMetrics(registry);

            // 启用HTTP性能指标
            enableHttpMetrics(registry);

            // 启用JVM性能指标
            enableJvmMetrics(registry);

            log.info("性能监控已启用");
        };
    }

    /**
     * 启用缓存性能指标
     */
    private void enableCacheMetrics(MeterRegistry registry) {
        // 缓存命中率
        Counter.builder("cache.hit")
            .description("缓存命中次数")
            .tag("type", "redis")
            .register(registry);

        Counter.builder("cache.miss")
            .description("缓存未命中次数")
            .tag("type", "redis")
            .register(registry);

        // 缓存大小
        Gauge.builder("cache.size", () -> 0)
            .description("缓存数据量")
            .tag("type", "redis")
            .register(registry);

        // 缓存操作耗时
        Timer.builder("cache.operation")
            .description("缓存操作耗时")
            .publishPercentiles(0.5, 0.95, 0.99)
            .register(registry);

        log.debug("缓存性能指标已启用");
    }

    /**
     * 启用消息队列性能指标
     */
    private void enableQueueMetrics(MeterRegistry registry) {
        // 队列消息数
        Gauge.builder("queue.messages", () -> 0)
            .description("队列中待处理消息数")
            .tag("type", "rabbitmq")
            .register(registry);

        // 消息处理速率
        Counter.builder("queue.processed")
            .description("已处理消息总数")
            .tag("type", "rabbitmq")
            .register(registry);

        // 消息处理失败数
        Counter.builder("queue.failed")
            .description("消息处理失败次数")
            .tag("type", "rabbitmq")
            .register(registry);

        // 消息处理耗时
        Timer.builder("queue.processing.time")
            .description("消息处理耗时")
            .publishPercentiles(0.5, 0.95, 0.99)
            .register(registry);

        log.debug("消息队列性能指标已启用");
    }

    /**
     * 启用HTTP性能指标
     */
    private void enableHttpMetrics(MeterRegistry registry) {
        // HTTP请求总数
        Counter.builder("http.requests.total")
            .description("HTTP请求总数")
            .register(registry);

        // HTTP请求耗时
        Timer.builder("http.request.duration")
            .description("HTTP请求耗时")
            .publishPercentiles(0.5, 0.95, 0.99)
            .register(registry);

        // HTTP错误数
        Counter.builder("http.requests.error")
            .description("HTTP请求错误数")
            .register(registry);

        // 活跃连接数
        Gauge.builder("http.connections.active", () -> 0)
            .description("活跃HTTP连接数")
            .register(registry);

        log.debug("HTTP性能指标已启用");
    }

    /**
     * 启用JVM性能指标（默认已启用，此处用于配置）
     */
    private void enableJvmMetrics(MeterRegistry registry) {
        // JVM内存使用
        Gauge.builder("jvm.memory.used", Runtime.getRuntime()::totalMemory)
            .description("JVM已使用内存")
            .baseUnit("bytes")
            .register(registry);

        // JVM垃圾回收
        Counter.builder("jvm.gc.count")
            .description("垃圾回收次数")
            .register(registry);

        log.debug("JVM性能指标已启用");
    }

    /**
     * 业务指标构建器
     */
    @Bean
    public MetricsHelper metricsHelper(MeterRegistry registry) {
        return new MetricsHelper(registry);
    }

    /**
     * 性能指标辅助类
     */
    public static class MetricsHelper {

        private static final Logger log = LoggerFactory.getLogger(MetricsHelper.class);

        private final MeterRegistry registry;

        public MetricsHelper(MeterRegistry registry) {
            this.registry = registry;
        }

        /**
         * 记录缓存命中
         */
        public void recordCacheHit(String cacheType) {
            Counter.builder("cache.hit")
                .tag("type", cacheType)
                .register(registry)
                .increment();
        }

        /**
         * 记录缓存未命中
         */
        public void recordCacheMiss(String cacheType) {
            Counter.builder("cache.miss")
                .tag("type", cacheType)
                .register(registry)
                .increment();
        }

        /**
         * 记录业务操作耗时
         */
        public Timer.Sample recordOperationStart() {
            return Timer.start(registry);
        }

        /**
         * 结束业务操作记录
         */
        public void recordOperationEnd(Timer.Sample sample, String operationName) {
            sample.stop(Timer.builder(operationName)
                .description("业务操作耗时")
                .register(registry));
        }

        /**
         * 记录API调用
         */
        public void recordApiCall(String endpoint, String method, int status) {
            Counter.builder("api.calls")
                .tag("endpoint", endpoint)
                .tag("method", method)
                .tag("status", String.valueOf(status))
                .register(registry)
                .increment();
        }

        /**
         * 更新业务指标
         */
        public void updateMetric(String metricName, double value) {
            try {
                AtomicDouble atomicDouble = new AtomicDouble(value);
                Gauge.builder(metricName, atomicDouble::get)
                    .register(registry);
            } catch (Exception e) {
                log.warn("更新指标失败: {}", metricName, e);
            }
        }

        /**
         * 记录错误
         */
        public void recordError(String errorType, String message) {
            Counter.builder("errors")
                .tag("type", errorType)
                .tag("message", message)
                .register(registry)
                .increment();
        }
    }

    /**
     * 原子Double类
     */
    private static class AtomicDouble {
        private volatile double value;

        AtomicDouble(double value) {
            this.value = value;
        }

        double get() {
            return value;
        }

        void set(double value) {
            this.value = value;
        }
    }
}