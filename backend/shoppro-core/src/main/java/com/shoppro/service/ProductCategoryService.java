package com.shoppro.service;

import com.shoppro.entity.ProductCategory;

import java.util.List;
import java.util.Map;

/**
 * 产品分类管理服务接口
 * 定义产品分类的CRUD和树形结构获取功能
 *
 * @author ShopPro Team
 * @version 1.0.0
 */
public interface ProductCategoryService {

    /**
     * 获取所有分类（树形结构）
     */
    List<Map<String, Object>> getCategoryTree();

    /**
     * 获取顶级分类列表
     */
    List<ProductCategory> getRootCategories();

    /**
     * 获取子分类列表
     */
    List<ProductCategory> getSubCategories(Long parentId);

    /**
     * 获取分类详情
     */
    ProductCategory getCategoryDetail(Long categoryId);

    /**
     * 创建分类
     */
    ProductCategory createCategory(ProductCategory category);

    /**
     * 更新分类
     */
    ProductCategory updateCategory(ProductCategory category);

    /**
     * 删除分类
     */
    boolean deleteCategory(Long categoryId);

    /**
     * 批量删除分类
     */
    boolean deleteCategories(List<Long> categoryIds);

    /**
     * 获取分类及其下属所有分类
     */
    List<ProductCategory> getCategoryAndSubcategories(Long categoryId);

    /**
     * 检查是否存在循环引用
     */
    boolean hasCircularReference(Long categoryId, Long parentId);

    /**
     * 获取分类路径（从根到该分类）
     */
    List<ProductCategory> getCategoryPath(Long categoryId);

    /**
     * 启用分类
     */
    boolean enableCategory(Long categoryId);

    /**
     * 禁用分类
     */
    boolean disableCategory(Long categoryId);

    /**
     * 获取所有启用的分类
     */
    List<ProductCategory> getAllActiveCategories();
}
