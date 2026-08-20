package com.shoppro.service;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.shoppro.entity.Product;

import java.util.List;
import java.util.Map;

/**
 * 产品管理服务接口
 * 定义产品的CRUD、库存、搜索等功能
 *
 * @author ShopPro Team
 * @version 1.0.0
 */
public interface ProductService {

    /**
     * 分页查询产品列表
     */
    Page<Product> listProducts(int pageNo, int pageSize, Map<String, Object> filters);

    /**
     * 搜索产品
     */
    Page<Product> searchProducts(String keyword, int pageNo, int pageSize);

    /**
     * 获取产品详情
     */
    Product getProductDetail(Long productId);

    /**
     * 按分类获取产品列表
     */
    Page<Product> getProductsByCategory(Long categoryId, int pageNo, int pageSize);

    /**
     * 创建产品
     */
    Product createProduct(Product product);

    /**
     * 更新产品
     */
    Product updateProduct(Product product);

    /**
     * 删除产品
     */
    boolean deleteProduct(Long productId);

    /**
     * 批量删除产品
     */
    boolean deleteProducts(List<Long> productIds);

    /**
     * 更新库存
     */
    boolean updateStock(Long productId, int quantity, String operation);

    /**
     * 检查库存是否充足
     */
    boolean isStockSufficient(Long productId, int quantity);

    /**
     * 获取库存不足的产品
     */
    List<Product> getLowStockProducts();

    /**
     * 获取产品统计信息
     */
    Map<String, Object> getProductStatistics();

    /**
     * 获取分类下的产品数量
     */
    long getProductCountByCategory(Long categoryId);

    /**
     * 获取热门产品
     */
    List<Product> getHotProducts(int limit);

    /**
     * 获取推荐产品
     */
    List<Product> getFeaturedProducts(int limit);

    /**
     * 按品牌获取产品
     */
    Page<Product> getProductsByBrand(String brand, int pageNo, int pageSize);

    /**
     * 按价格范围搜索产品
     */
    Page<Product> searchProductsByPriceRange(double minPrice, double maxPrice, int pageNo, int pageSize);

    /**
     * 获取所有可用产品
     */
    List<Product> getAllActiveProducts();

    /**
     * 获取产品的销售统计
     */
    Map<String, Object> getProductSalesStatistics(Long productId);
}
