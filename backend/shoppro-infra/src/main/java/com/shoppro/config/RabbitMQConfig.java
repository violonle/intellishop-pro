package com.shoppro.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.amqp.core.*;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * RabbitMQ消息队列配置
 * 定义交换机、队列、绑定和消息转换器
 *
 * @author ShopPro Team
 * @version 1.0.0
 */
@Configuration
public class RabbitMQConfig {

    // ========== 定义交换机名称 ==========
    public static final String SHOP_TOPIC_EXCHANGE = "shop.topic.exchange";
    public static final String SHOP_DIRECT_EXCHANGE = "shop.direct.exchange";
    public static final String SHOP_FANOUT_EXCHANGE = "shop.fanout.exchange";

    // ========== 定义队列名称 ==========
    // 客户管理队列
    public static final String CUSTOMER_CREATED_QUEUE = "shop.customer.created.queue";
    public static final String CUSTOMER_UPDATED_QUEUE = "shop.customer.updated.queue";
    public static final String CUSTOMER_DELETED_QUEUE = "shop.customer.deleted.queue";

    // 订单管理队列
    public static final String ORDER_CREATED_QUEUE = "shop.order.created.queue";
    public static final String ORDER_UPDATED_QUEUE = "shop.order.updated.queue";
    public static final String ORDER_COMPLETED_QUEUE = "shop.order.completed.queue";

    // 通知队列
    public static final String EMAIL_QUEUE = "shop.email.queue";
    public static final String SMS_QUEUE = "shop.sms.queue";
    public static final String NOTIFICATION_QUEUE = "shop.notification.queue";

    // AI分析队列
    public static final String AI_ANALYSIS_QUEUE = "shop.ai.analysis.queue";

    // ========== 定义路由键 ==========
    public static final String CUSTOMER_CREATED_ROUTING_KEY = "shop.customer.created";
    public static final String CUSTOMER_UPDATED_ROUTING_KEY = "shop.customer.updated";
    public static final String CUSTOMER_DELETED_ROUTING_KEY = "shop.customer.deleted";

    public static final String ORDER_CREATED_ROUTING_KEY = "shop.order.created";
    public static final String ORDER_UPDATED_ROUTING_KEY = "shop.order.updated";
    public static final String ORDER_COMPLETED_ROUTING_KEY = "shop.order.completed";

    public static final String EMAIL_ROUTING_KEY = "shop.email.*";
    public static final String SMS_ROUTING_KEY = "shop.sms.*";
    public static final String NOTIFICATION_ROUTING_KEY = "shop.notification.*";

    public static final String AI_ANALYSIS_ROUTING_KEY = "shop.ai.analysis.*";

    // ========== 创建主题交换机 ==========
    @Bean
    public TopicExchange shopTopicExchange() {
        return new TopicExchange(SHOP_TOPIC_EXCHANGE, true, false);
    }

    // ========== 创建直接交换机 ==========
    @Bean
    public DirectExchange shopDirectExchange() {
        return new DirectExchange(SHOP_DIRECT_EXCHANGE, true, false);
    }

    // ========== 创建扇出交换机 ==========
    @Bean
    public FanoutExchange shopFanoutExchange() {
        return new FanoutExchange(SHOP_FANOUT_EXCHANGE, true, false);
    }

    // ========== 创建客户管理队列 ==========
    @Bean
    public Queue customerCreatedQueue() {
        return QueueBuilder.durable(CUSTOMER_CREATED_QUEUE)
                .withArgument("x-message-ttl", 86400000) // 24小时过期
                .build();
    }

    @Bean
    public Queue customerUpdatedQueue() {
        return QueueBuilder.durable(CUSTOMER_UPDATED_QUEUE)
                .withArgument("x-message-ttl", 86400000)
                .build();
    }

    @Bean
    public Queue customerDeletedQueue() {
        return QueueBuilder.durable(CUSTOMER_DELETED_QUEUE)
                .withArgument("x-message-ttl", 86400000)
                .build();
    }

    // ========== 创建订单管理队列 ==========
    @Bean
    public Queue orderCreatedQueue() {
        return QueueBuilder.durable(ORDER_CREATED_QUEUE)
                .withArgument("x-message-ttl", 86400000)
                .build();
    }

    @Bean
    public Queue orderUpdatedQueue() {
        return QueueBuilder.durable(ORDER_UPDATED_QUEUE)
                .withArgument("x-message-ttl", 86400000)
                .build();
    }

    @Bean
    public Queue orderCompletedQueue() {
        return QueueBuilder.durable(ORDER_COMPLETED_QUEUE)
                .withArgument("x-message-ttl", 86400000)
                .build();
    }

    // ========== 创建通知队列 ==========
    @Bean
    public Queue emailQueue() {
        return QueueBuilder.durable(EMAIL_QUEUE).build();
    }

    @Bean
    public Queue smsQueue() {
        return QueueBuilder.durable(SMS_QUEUE).build();
    }

    @Bean
    public Queue notificationQueue() {
        return QueueBuilder.durable(NOTIFICATION_QUEUE).build();
    }

    // ========== 创建AI分析队列 ==========
    @Bean
    public Queue aiAnalysisQueue() {
        return QueueBuilder.durable(AI_ANALYSIS_QUEUE)
                .withArgument("x-message-ttl", 3600000) // 1小时过期
                .build();
    }

    // ========== 创建客户管理绑定 ==========
    @Bean
    public Binding customerCreatedBinding(Queue customerCreatedQueue, TopicExchange shopTopicExchange) {
        return BindingBuilder.bind(customerCreatedQueue)
                .to(shopTopicExchange)
                .with(CUSTOMER_CREATED_ROUTING_KEY);
    }

    @Bean
    public Binding customerUpdatedBinding(Queue customerUpdatedQueue, TopicExchange shopTopicExchange) {
        return BindingBuilder.bind(customerUpdatedQueue)
                .to(shopTopicExchange)
                .with(CUSTOMER_UPDATED_ROUTING_KEY);
    }

    @Bean
    public Binding customerDeletedBinding(Queue customerDeletedQueue, TopicExchange shopTopicExchange) {
        return BindingBuilder.bind(customerDeletedQueue)
                .to(shopTopicExchange)
                .with(CUSTOMER_DELETED_ROUTING_KEY);
    }

    // ========== 创建订单管理绑定 ==========
    @Bean
    public Binding orderCreatedBinding(Queue orderCreatedQueue, TopicExchange shopTopicExchange) {
        return BindingBuilder.bind(orderCreatedQueue)
                .to(shopTopicExchange)
                .with(ORDER_CREATED_ROUTING_KEY);
    }

    @Bean
    public Binding orderUpdatedBinding(Queue orderUpdatedQueue, TopicExchange shopTopicExchange) {
        return BindingBuilder.bind(orderUpdatedQueue)
                .to(shopTopicExchange)
                .with(ORDER_UPDATED_ROUTING_KEY);
    }

    @Bean
    public Binding orderCompletedBinding(Queue orderCompletedQueue, TopicExchange shopTopicExchange) {
        return BindingBuilder.bind(orderCompletedQueue)
                .to(shopTopicExchange)
                .with(ORDER_COMPLETED_ROUTING_KEY);
    }

    // ========== 创建通知绑定 ==========
    @Bean
    public Binding emailBinding(Queue emailQueue, DirectExchange shopDirectExchange) {
        return BindingBuilder.bind(emailQueue)
                .to(shopDirectExchange)
                .with("email");
    }

    @Bean
    public Binding smsBinding(Queue smsQueue, DirectExchange shopDirectExchange) {
        return BindingBuilder.bind(smsQueue)
                .to(shopDirectExchange)
                .with("sms");
    }

    @Bean
    public Binding notificationBinding(Queue notificationQueue, FanoutExchange shopFanoutExchange) {
        return BindingBuilder.bind(notificationQueue)
                .to(shopFanoutExchange);
    }

    // ========== 创建AI分析绑定 ==========
    @Bean
    public Binding aiAnalysisBinding(Queue aiAnalysisQueue, TopicExchange shopTopicExchange) {
        return BindingBuilder.bind(aiAnalysisQueue)
                .to(shopTopicExchange)
                .with(AI_ANALYSIS_ROUTING_KEY);
    }

    // ========== 配置RabbitTemplate ==========
    @Bean
    public RabbitTemplate rabbitTemplate(ConnectionFactory connectionFactory) {
        RabbitTemplate rabbitTemplate = new RabbitTemplate(connectionFactory);
        
        // 启用发送者确认
        rabbitTemplate.setMandatory(true);
        
        // 设置消息转换器
        rabbitTemplate.setMessageConverter(jackson2JsonMessageConverter());
        
        return rabbitTemplate;
    }

    // ========== 配置JSON消息转换器 ==========
    @Bean
    public Jackson2JsonMessageConverter jackson2JsonMessageConverter() {
        return new Jackson2JsonMessageConverter();
    }

}
