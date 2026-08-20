package com.shoppro.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.shoppro.dto.request.OrderCreateRequest;
import com.shoppro.entity.Order;
import com.shoppro.entity.OrderItem;
import com.shoppro.entity.Product;
import com.shoppro.repository.OrderItemRepository;
import com.shoppro.repository.OrderRepository;
import com.shoppro.repository.ProductRepository;
import com.shoppro.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final ProductRepository productRepository;

    public OrderServiceImpl(OrderRepository orderRepository, OrderItemRepository orderItemRepository,
            ProductRepository productRepository) {
        this.orderRepository = orderRepository;
        this.orderItemRepository = orderItemRepository;
        this.productRepository = productRepository;
    }

    @Override
    @Transactional
    public Order createOrder(OrderCreateRequest request) {
        Order order = new Order();
        order.setOrderNo(UUID.randomUUID().toString().replace("-", "").substring(0, 16));
        order.setCustomerId(request.getCustomerId());
        order.setUserId(request.getUserId());
        order.setPaymentMethod(request.getPaymentMethod());
        order.setRemark(request.getRemark());
        order.setStatus(0); // 待支付
        order.setTotalAmount(BigDecimal.ZERO);

        orderRepository.insert(order);

        BigDecimal totalAmount = BigDecimal.ZERO;
        for (OrderCreateRequest.Item itemReq : request.getItems()) {
            Product product = productRepository.selectById(itemReq.getProductId());
            if (product == null)
                throw new RuntimeException("产品不存在: " + itemReq.getProductId());
            if (product.getStockQuantity() < itemReq.getQuantity()) {
                throw new RuntimeException("库存不足: " + product.getName());
            }

            OrderItem item = new OrderItem();
            item.setOrderId(order.getId());
            item.setProductId(product.getId());
            item.setProductName(product.getName());
            item.setPrice(product.getPrice());
            item.setQuantity(itemReq.getQuantity());
            BigDecimal itemTotal = product.getPrice().multiply(BigDecimal.valueOf(itemReq.getQuantity()));
            item.setTotalAmount(itemTotal);
            orderItemRepository.insert(item);

            totalAmount = totalAmount.add(itemTotal);

            // 扣减库存
            productRepository.decreaseStock(product.getId(), itemReq.getQuantity());
        }

        order.setTotalAmount(totalAmount);
        order.setPayAmount(totalAmount); // 默认无折扣
        orderRepository.updateById(order);

        return order;
    }

    @Override
    @Transactional
    public void updateOrderStatus(Long orderId, Integer status) {
        Order order = orderRepository.selectById(orderId);
        if (order != null) {
            order.setStatus(status);
            orderRepository.updateById(order);
        }
    }

    @Override
    public Order getOrderById(Long orderId) {
        return orderRepository.selectById(orderId);
    }

    @Override
    public List<OrderItem> getOrderItems(Long orderId) {
        return orderItemRepository.selectList(new LambdaQueryWrapper<OrderItem>().eq(OrderItem::getOrderId, orderId));
    }

    @Override
    public Page<Order> pageOrders(int pageNo, int pageSize, Long customerId, Integer status) {
        Page<Order> page = new Page<>(pageNo, pageSize);
        LambdaQueryWrapper<Order> queryWrapper = new LambdaQueryWrapper<>();
        if (customerId != null) {
            queryWrapper.eq(Order::getCustomerId, customerId);
        }
        if (status != null) {
            queryWrapper.eq(Order::getStatus, status);
        }
        queryWrapper.orderByDesc(Order::getCreatedAt);
        return orderRepository.selectPage(page, queryWrapper);
    }

}
