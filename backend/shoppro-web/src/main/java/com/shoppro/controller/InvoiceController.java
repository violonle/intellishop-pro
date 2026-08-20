package com.shoppro.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.shoppro.dto.response.ApiResponse;
import com.shoppro.entity.Invoice;
import com.shoppro.service.InvoiceService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/invoices")
@Tag(name = "发票管理")
@PreAuthorize("hasAnyRole('ADMIN', 'ENTERPRISE_ADMIN', 'MANAGER', 'SALES')")
public class InvoiceController {

    private final InvoiceService invoiceService;

    public InvoiceController(InvoiceService invoiceService) {
        this.invoiceService = invoiceService;
    }

    @GetMapping
    @Operation(summary = "获取发票列表")
    public ApiResponse<Page<Invoice>> list(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String type) {
        Page<Invoice> result = invoiceService.list(page, size, keyword, status, type);
        return ApiResponse.success(result);
    }

    @GetMapping("/{id}")
    @Operation(summary = "获取发票详情")
    public ApiResponse<Invoice> getById(@PathVariable Long id) {
        Invoice invoice = invoiceService.getById(id);
        return ApiResponse.success(invoice);
    }

    @PostMapping
    @Operation(summary = "创建发票")
    public ApiResponse<Invoice> create(@RequestBody Invoice invoice) {
        Invoice result = invoiceService.create(invoice);
        return ApiResponse.success(result, "创建成功");
    }

    @PutMapping("/{id}")
    @Operation(summary = "更新发票")
    public ApiResponse<Invoice> update(@PathVariable Long id, @RequestBody Invoice invoice) {
        invoice.setId(id);
        Invoice result = invoiceService.update(invoice);
        return ApiResponse.success(result, "更新成功");
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "删除发票")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        invoiceService.delete(id);
        return ApiResponse.success(null, "删除成功");
    }

    @GetMapping("/order/{orderId}")
    @Operation(summary = "获取订单的发票")
    public ApiResponse<List<Invoice>> getByOrderId(@PathVariable Long orderId) {
        List<Invoice> invoices = invoiceService.getByOrderId(orderId);
        return ApiResponse.success(invoices);
    }

    @GetMapping("/customer/{customerId}")
    @Operation(summary = "获取客户的所有发票")
    public ApiResponse<List<Invoice>> getByCustomerId(@PathVariable Long customerId) {
        List<Invoice> invoices = invoiceService.getByCustomerId(customerId);
        return ApiResponse.success(invoices);
    }

    @PostMapping("/{id}/issue")
    @Operation(summary = "开具发票")
    public ApiResponse<Invoice> issueInvoice(@PathVariable Long id) {
        Invoice result = invoiceService.issueInvoice(id);
        return ApiResponse.success(result, "发票已开具");
    }

    @PostMapping("/{id}/cancel")
    @Operation(summary = "取消发票")
    public ApiResponse<Invoice> cancelInvoice(@PathVariable Long id) {
        Invoice result = invoiceService.cancelInvoice(id);
        return ApiResponse.success(result, "发票已取消");
    }
}
