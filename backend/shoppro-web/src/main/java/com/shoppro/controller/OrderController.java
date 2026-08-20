package com.shoppro.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.shoppro.dto.request.OrderCreateRequest;
import com.shoppro.dto.response.ApiResponse;
import com.shoppro.entity.Order;
import com.shoppro.entity.OrderItem;
import com.shoppro.service.OrderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/orders")
@Tag(name = "订单管理")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'SALES')")
    @Operation(summary = "创建订单")
    public ApiResponse<Order> createOrder(@RequestBody OrderCreateRequest request) {
        return ApiResponse.success(orderService.createOrder(request));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'SALES')")
    @Operation(summary = "获取订单详情")
    public ApiResponse<Map<String, Object>> getOrderDetails(@PathVariable Long id) {
        Order order = orderService.getOrderById(id);
        List<OrderItem> items = orderService.getOrderItems(id);
        return ApiResponse.success(Map.of("order", order, "items", items));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'SALES')")
    @Operation(summary = "分页查询订单")
    public ApiResponse<Page<Order>> pageOrders(
            @RequestParam(defaultValue = "1") int pageNo,
            @RequestParam(defaultValue = "10") int pageSize,
            @RequestParam(required = false) Long customerId,
            @RequestParam(required = false) Integer status) {
        return ApiResponse.success(orderService.pageOrders(pageNo, pageSize, customerId, status));
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @Operation(summary = "更新订单状态")
    public ApiResponse<String> updateStatus(@PathVariable Long id, @RequestParam Integer status) {
        orderService.updateOrderStatus(id, status);
        return ApiResponse.success("更新成功");
    }

}
