package com.shoppro.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.shoppro.dto.request.ProductCreateDTO;
import com.shoppro.dto.request.ProductUpdateDTO;
import com.shoppro.dto.response.ApiResponse;
import com.shoppro.entity.Product;
import com.shoppro.service.ProductService;
import com.shoppro.util.PaginationUtils;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 产品管理控制器
 * 提供产品的CRUD、库存管理、搜索、统计等功能
 *
 * @author ShopPro Team
 * @version 1.0.0
 */
@RestController
@RequestMapping("/products")
@Tag(name = "产品管理", description = "产品信息的增删改查、库存管理、搜索等功能")
public class ProductController {

    private static final Logger log = LoggerFactory.getLogger(ProductController.class);

    private final ProductService productService;

    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    /**
     * 分页查询产品列表
     */
    @GetMapping("/list")
    @Operation(summary = "分页查询产品列表")
    public ApiResponse<Page<Product>> list(
            @RequestParam(defaultValue = "1") int pageNo,
            @RequestParam(defaultValue = "10") int pageSize,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) String brand,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) Boolean featured) {
    
        Map<String, Object> filters = new HashMap<>();
        if (categoryId != null) filters.put("categoryId", categoryId);
        if (brand != null) filters.put("brand", brand);
        if (status != null) filters.put("status", status);
        if (featured != null) filters.put("featured", featured);
    
        // 归一化分页参数
        int normalizedPageNo = PaginationUtils.normalizePageNo(pageNo);
        int normalizedPageSize = PaginationUtils.normalizePageSize(pageSize);
        Page<Product> result = productService.listProducts(normalizedPageNo, normalizedPageSize, filters);
        return ApiResponse.success(result, "查询成功");
    }

    /**
     * 搜索产品
     */
    @GetMapping("/search")
    @Operation(summary = "搜索产品")
    public ApiResponse<Page<Product>> search(
            @RequestParam String keyword,
            @RequestParam(defaultValue = "1") int pageNo,
            @RequestParam(defaultValue = "10") int pageSize) {
    
        // 归一化分页参数
        int normalizedPageNo = PaginationUtils.normalizePageNo(pageNo);
        int normalizedPageSize = PaginationUtils.normalizePageSize(pageSize);
        Page<Product> result = productService.searchProducts(keyword, normalizedPageNo, normalizedPageSize);
        return ApiResponse.success(result, "搜索成功");
    }

    /**
     * 按品牌搜索产品
     */
    @GetMapping("/brand/{brand}")
    @Operation(summary = "按品牌搜索产品")
    public ApiResponse<Page<Product>> getByBrand(
            @PathVariable String brand,
            @RequestParam(defaultValue = "1") int pageNo,
            @RequestParam(defaultValue = "10") int pageSize) {

        Page<Product> result = productService.getProductsByBrand(brand, pageNo, pageSize);
        return ApiResponse.success(result, "查询成功");
    }

    /**
     * 按价格范围搜索产品
     */
    @GetMapping("/price-range")
    @Operation(summary = "按价格范围搜索产品")
    public ApiResponse<Page<Product>> searchByPriceRange(
            @RequestParam double minPrice,
            @RequestParam double maxPrice,
            @RequestParam(defaultValue = "1") int pageNo,
            @RequestParam(defaultValue = "10") int pageSize) {
    
        // 归一化分页参数
        int normalizedPageNo = PaginationUtils.normalizePageNo(pageNo);
        int normalizedPageSize = PaginationUtils.normalizePageSize(pageSize);
        Page<Product> result = productService.searchProductsByPriceRange(minPrice, maxPrice, normalizedPageNo, normalizedPageSize);
        return ApiResponse.success(result, "查询成功");
    }

    /**
     * 获取产品详情
     */
    @GetMapping("/{id}")
    @Operation(summary = "获取产品详情")
    public ApiResponse<Product> detail(@PathVariable Long id) {
        Product product = productService.getProductDetail(id);
        return ApiResponse.success(product, "获取成功");
    }

    /**
     * 按分类获取产品列表
     */
    @GetMapping("/category/{categoryId}")
    @Operation(summary = "按分类获取产品列表")
    public ApiResponse<Page<Product>> getByCategory(
            @PathVariable Long categoryId,
            @RequestParam(defaultValue = "1") int pageNo,
            @RequestParam(defaultValue = "10") int pageSize) {
    
        // 归一化分页参数
        int normalizedPageNo = PaginationUtils.normalizePageNo(pageNo);
        int normalizedPageSize = PaginationUtils.normalizePageSize(pageSize);
        Page<Product> result = productService.getProductsByCategory(categoryId, normalizedPageNo, normalizedPageSize);
        return ApiResponse.success(result, "查询成功");
    }

    /**
     * 创建产品
     */
    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('MANAGER')")
    @Operation(summary = "创建产品")
    public ApiResponse<Product> create(@RequestBody ProductCreateDTO dto) {
        Product product = new Product();
        product.setName(dto.getName());
        product.setSku(dto.getSku());
        product.setCategoryId(dto.getCategoryId());
        product.setBrand(dto.getBrand());
        product.setModel(dto.getModel());
        product.setPrice(dto.getPrice());
        product.setMarketPrice(dto.getMarketPrice());
        product.setCostPrice(dto.getCostPrice());
        product.setDescription(dto.getDescription());
        product.setStockQuantity(dto.getStockQuantity());
        product.setMinStock(dto.getMinStock());

        Product result = productService.createProduct(product);
        return ApiResponse.success(result, "创建成功");
    }

    /**
     * 更新产品
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('MANAGER')")
    @Operation(summary = "更新产品")
    public ApiResponse<Product> update(@PathVariable Long id, @RequestBody ProductUpdateDTO dto) {
        Product product = new Product();
        product.setId(id);
        product.setName(dto.getName());
        product.setBrand(dto.getBrand());
        product.setModel(dto.getModel());
        product.setPrice(dto.getPrice());
        product.setMarketPrice(dto.getMarketPrice());
        product.setCostPrice(dto.getCostPrice());
        product.setDescription(dto.getDescription());
        product.setMinStock(dto.getMinStock());
        product.setStatus(dto.getStatus());
        product.setIsFeatured(dto.getIsFeatured());

        Product result = productService.updateProduct(product);
        return ApiResponse.success(result, "更新成功");
    }

    /**
     * 删除产品
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('MANAGER')")
    @Operation(summary = "删除产品")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        productService.deleteProduct(id);
        return ApiResponse.success(null, "删除成功");
    }

    /**
     * 批量删除产品
     */
    @DeleteMapping("/batch-delete")
    @PreAuthorize("hasRole('ADMIN') or hasRole('MANAGER')")
    @Operation(summary = "批量删除产品")
    public ApiResponse<Void> deleteMultiple(@RequestBody List<Long> productIds) {
        productService.deleteProducts(productIds);
        return ApiResponse.success(null, "批量删除成功");
    }

    /**
     * 更新产品库存
     */
    @PostMapping("/{id}/stock/update")
    @PreAuthorize("hasRole('ADMIN') or hasRole('MANAGER')")
    @Operation(summary = "更新产品库存")
    public ApiResponse<Void> updateStock(
            @PathVariable Long id,
            @RequestParam int quantity,
            @RequestParam String operation) {

        productService.updateStock(id, quantity, operation);
        return ApiResponse.success(null, "库存更新成功");
    }

    /**
     * 检查库存是否充足
     */
    @GetMapping("/{id}/stock/check")
    @Operation(summary = "检查库存是否充足")
    public ApiResponse<Map<String, Object>> checkStock(
            @PathVariable Long id,
            @RequestParam int quantity) {

        boolean sufficient = productService.isStockSufficient(id, quantity);
        Map<String, Object> result = new HashMap<>();
        result.put("productId", id);
        result.put("requiredQuantity", quantity);
        result.put("sufficient", sufficient);

        return ApiResponse.success(result, "检查完成");
    }

    /**
     * 获取库存不足的产品
     */
    @GetMapping("/low-stock")
    @Operation(summary = "获取库存不足的产品")
    public ApiResponse<List<Product>> getLowStockProducts() {
        List<Product> products = productService.getLowStockProducts();
        return ApiResponse.success(products, "查询成功");
    }

    /**
     * 获取热门产品
     */
    @GetMapping("/hot")
    @Operation(summary = "获取热门产品")
    public ApiResponse<List<Product>> getHotProducts(
            @RequestParam(defaultValue = "10") int limit) {

        List<Product> products = productService.getHotProducts(limit);
        return ApiResponse.success(products, "查询成功");
    }

    /**
     * 获取推荐产品
     */
    @GetMapping("/featured")
    @Operation(summary = "获取推荐产品")
    public ApiResponse<List<Product>> getFeaturedProducts(
            @RequestParam(defaultValue = "10") int limit) {

        List<Product> products = productService.getFeaturedProducts(limit);
        return ApiResponse.success(products, "查询成功");
    }

    /**
     * 获取所有可用产品
     */
    @GetMapping("/all")
    @Operation(summary = "获取所有可用产品")
    public ApiResponse<List<Product>> getAllActive() {
        List<Product> products = productService.getAllActiveProducts();
        return ApiResponse.success(products, "查询成功");
    }

    /**
     * 获取产品统计信息
     */
    @GetMapping("/statistics")
    @Operation(summary = "获取产品统计信息")
    public ApiResponse<Map<String, Object>> getStatistics() {
        Map<String, Object> statistics = productService.getProductStatistics();
        return ApiResponse.success(statistics, "获取成功");
    }

    /**
     * 获取产品的销售统计
     */
    @GetMapping("/{id}/sales-statistics")
    @Operation(summary = "获取产品的销售统计")
    public ApiResponse<Map<String, Object>> getSalesStatistics(@PathVariable Long id) {
        Map<String, Object> statistics = productService.getProductSalesStatistics(id);
        return ApiResponse.success(statistics, "获取成功");
    }

    /**
     * 获取分类下的产品数量
     */
    @GetMapping("/category/{categoryId}/count")
    @Operation(summary = "获取分类下的产品数量")
    public ApiResponse<Map<String, Object>> getCountByCategory(@PathVariable Long categoryId) {
        long count = productService.getProductCountByCategory(categoryId);
        Map<String, Object> result = new HashMap<>();
        result.put("categoryId", categoryId);
        result.put("productCount", count);
        return ApiResponse.success(result, "获取成功");
    }

    /**
     * 设置推荐产品
     */
    @PostMapping("/{id}/set-featured")
    @PreAuthorize("hasRole('ADMIN') or hasRole('MANAGER')")
    @Operation(summary = "设置推荐产品")
    public ApiResponse<Void> setFeatured(
            @PathVariable Long id,
            @RequestParam Boolean featured) {

        Product product = new Product();
        product.setId(id);
        product.setIsFeatured(featured ? 1 : 0);
        productService.updateProduct(product);

        return ApiResponse.success(null, featured ? "设置推荐成功" : "取消推荐成功");
    }
}
