package com.shoppro.controller;

import com.shoppro.dto.request.ProductCategoryDTO;
import com.shoppro.dto.response.ApiResponse;
import com.shoppro.dto.response.ProductCategoryResponseVO;
import com.shoppro.entity.ProductCategory;
import com.shoppro.service.ProductCategoryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * 产品分类管理控制器
 * 提供产品分类的CRUD和树形结构功能
 *
 * @author ShopPro Team
 * @version 1.0.0
 */
@RestController
@RequestMapping("/product-categories")
@Tag(name = "产品分类管理", description = "产品分类的增删改查、树形结构等功能")
public class ProductCategoryController {

    private static final Logger logger = LoggerFactory.getLogger(ProductCategoryController.class);

    private final ProductCategoryService productCategoryService;

    public ProductCategoryController(ProductCategoryService productCategoryService) {
        this.productCategoryService = productCategoryService;
    }

    @GetMapping("/tree")
    @Operation(summary = "获取分类树形结构")
    public ApiResponse<List<Map<String, Object>>> getCategoryTree() {
        List<Map<String, Object>> tree = productCategoryService.getCategoryTree();
        return ApiResponse.success(tree, "获取成功");
    }

    @GetMapping("/all")
    @Operation(summary = "获取所有启用的分类")
    public ApiResponse<List<ProductCategoryResponseVO>> getAllActive() {
        List<ProductCategory> categories = productCategoryService.getAllActiveCategories();
        List<ProductCategoryResponseVO> result = categories.stream()
                .map(this::convertToVO)
                .collect(Collectors.toList());
        return ApiResponse.success(result, "获取成功");
    }

    @GetMapping("/root")
    @Operation(summary = "获取顶级分类列表")
    public ApiResponse<List<ProductCategoryResponseVO>> getRootCategories() {
        List<ProductCategory> categories = productCategoryService.getRootCategories();
        List<ProductCategoryResponseVO> result = categories.stream()
                .map(this::convertToVO)
                .collect(Collectors.toList());
        return ApiResponse.success(result, "获取成功");
    }

    @GetMapping("/{parentId}/children")
    @Operation(summary = "获取子分类列表")
    public ApiResponse<List<ProductCategoryResponseVO>> getSubCategories(@PathVariable Long parentId) {
        List<ProductCategory> categories = productCategoryService.getSubCategories(parentId);
        List<ProductCategoryResponseVO> result = categories.stream()
                .map(this::convertToVO)
                .collect(Collectors.toList());
        return ApiResponse.success(result, "获取成功");
    }

    @GetMapping("/{id}")
    @Operation(summary = "获取分类详情")
    public ApiResponse<ProductCategoryResponseVO> detail(@PathVariable Long id) {
        ProductCategory category = productCategoryService.getCategoryDetail(id);
        return ApiResponse.success(convertToVO(category), "获取成功");
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('MANAGER')")
    @Operation(summary = "创建分类")
    public ApiResponse<ProductCategoryResponseVO> create(@RequestBody ProductCategoryDTO dto) {
        ProductCategory category = new ProductCategory();
        category.setName(dto.getName());
        category.setParentId(dto.getParentId());
        category.setDescription(dto.getDescription());
        category.setImageUrl(dto.getImageUrl());
        category.setSortOrder(dto.getSortOrder());

        ProductCategory result = productCategoryService.createCategory(category);
        return ApiResponse.success(convertToVO(result), "创建成功");
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('MANAGER')")
    @Operation(summary = "更新分类")
    public ApiResponse<ProductCategoryResponseVO> update(@PathVariable Long id, @RequestBody ProductCategoryDTO dto) {
        ProductCategory category = new ProductCategory();
        category.setId(id);
        category.setName(dto.getName());
        category.setParentId(dto.getParentId());
        category.setDescription(dto.getDescription());
        category.setImageUrl(dto.getImageUrl());
        category.setSortOrder(dto.getSortOrder());

        ProductCategory result = productCategoryService.updateCategory(category);
        return ApiResponse.success(convertToVO(result), "更新成功");
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('MANAGER')")
    @Operation(summary = "删除分类")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        productCategoryService.deleteCategory(id);
        return ApiResponse.success(null, "删除成功");
    }

    @DeleteMapping("/batch-delete")
    @PreAuthorize("hasRole('ADMIN') or hasRole('MANAGER')")
    @Operation(summary = "批量删除分类")
    public ApiResponse<Void> deleteMultiple(@RequestBody List<Long> categoryIds) {
        productCategoryService.deleteCategories(categoryIds);
        return ApiResponse.success(null, "批量删除成功");
    }

    @GetMapping("/{id}/full-hierarchy")
    @Operation(summary = "获取分类及其所有子分类")
    public ApiResponse<List<ProductCategoryResponseVO>> getCategoryWithSubcategories(@PathVariable Long id) {
        List<ProductCategory> categories = productCategoryService.getCategoryAndSubcategories(id);
        List<ProductCategoryResponseVO> result = categories.stream()
                .map(this::convertToVO)
                .collect(Collectors.toList());
        return ApiResponse.success(result, "获取成功");
    }

    @GetMapping("/{id}/path")
    @Operation(summary = "获取分类路径")
    public ApiResponse<List<ProductCategoryResponseVO>> getCategoryPath(@PathVariable Long id) {
        List<ProductCategory> categories = productCategoryService.getCategoryPath(id);
        List<ProductCategoryResponseVO> result = categories.stream()
                .map(this::convertToVO)
                .collect(Collectors.toList());
        return ApiResponse.success(result, "获取成功");
    }

    @PostMapping("/{id}/enable")
    @PreAuthorize("hasRole('ADMIN') or hasRole('MANAGER')")
    @Operation(summary = "启用分类")
    public ApiResponse<Void> enable(@PathVariable Long id) {
        productCategoryService.enableCategory(id);
        return ApiResponse.success(null, "启用成功");
    }

    @PostMapping("/{id}/disable")
    @PreAuthorize("hasRole('ADMIN') or hasRole('MANAGER')")
    @Operation(summary = "禁用分类")
    public ApiResponse<Void> disable(@PathVariable Long id) {
        productCategoryService.disableCategory(id);
        return ApiResponse.success(null, "禁用成功");
    }

    @GetMapping("/{categoryId}/check-circular-reference")
    @Operation(summary = "检查是否存在循环引用")
    public ApiResponse<Map<String, Object>> checkCircularReference(
            @PathVariable Long categoryId,
            @RequestParam Long parentId) {

        boolean hasCircular = productCategoryService.hasCircularReference(categoryId, parentId);
        Map<String, Object> result = Map.of(
                "categoryId", categoryId,
                "parentId", parentId,
                "hasCircularReference", hasCircular
        );
        return ApiResponse.success(result, "检查完成");
    }

    /**
     * 转换为VO对象
     */
    private ProductCategoryResponseVO convertToVO(ProductCategory category) {
        if (category == null) {
            return null;
        }
        return ProductCategoryResponseVO.builder()
                .id(category.getId())
                .name(category.getName())
                .parentId(category.getParentId())
                .description(category.getDescription())
                .imageUrl(category.getImageUrl())
                .sortOrder(category.getSortOrder())
                .status(category.getStatus())
                .createdAt(category.getCreatedAt())
                .updatedAt(category.getUpdatedAt())
                .build();
    }
}
