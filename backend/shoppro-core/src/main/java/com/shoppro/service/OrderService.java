package com.shoppro.service;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.shoppro.dto.request.OrderCreateRequest;
import com.shoppro.entity.Order;
import com.shoppro.entity.OrderItem;

import java.util.List;

public interface OrderService {
    Order createOrder(OrderCreateRequest request);

    void updateOrderStatus(Long orderId, Integer status);

    Order getOrderById(Long orderId);

    List<OrderItem> getOrderItems(Long orderId);

    Page<Order> pageOrders(int pageNo, int pageSize, Long customerId, Integer status);

}
