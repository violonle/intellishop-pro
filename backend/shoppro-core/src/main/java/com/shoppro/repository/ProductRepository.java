package com.shoppro.repository;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.shoppro.entity.Product;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Update;

import java.math.BigDecimal;
import java.util.List;

/**
 * 产品数据访问层
 *
 * @author ShopPro Team
 * @version 1.0.0
 */
@Mapper
public interface ProductRepository extends BaseMapper<Product> {

    /**
     * 根据SKU查询产品
     */
    @Select("SELECT * FROM products WHERE sku = #{sku}")
    Product findBySku(@Param("sku") String sku);

    /**
     * 根据分类ID查询产品
     */
    @Select("SELECT * FROM products WHERE category_id = #{categoryId} AND status = 'active'")
    List<Product> findByCategory(@Param("categoryId") Long categoryId);

    /**
     * 根据品牌查询产品
     */
    @Select("SELECT * FROM products WHERE brand = #{brand} AND status = 'active'")
    List<Product> findByBrand(@Param("brand") String brand);

    /**
     * 查询推荐产品
     */
    @Select("SELECT * FROM products WHERE is_featured = 1 AND status = 'active' " +
            "ORDER BY updated_at DESC LIMIT #{limit}")
    List<Product> findFeaturedProducts(@Param("limit") int limit);

    /**
     * 查询库存不足的产品
     */
    @Select("SELECT * FROM products WHERE stock_quantity < min_stock AND status = 'active'")
    List<Product> findLowStockProducts();

    /**
     * 根据关键词搜索产品
     */
    @Select("SELECT * FROM products WHERE status = 'active' AND " +
            "(name LIKE CONCAT('%', #{keyword}, '%') OR " +
            "brand LIKE CONCAT('%', #{keyword}, '%') OR " +
            "model LIKE CONCAT('%', #{keyword}, '%') OR " +
            "sku LIKE CONCAT('%', #{keyword}, '%'))")
    IPage<Product> searchProducts(Page<Product> page, @Param("keyword") String keyword);

    /**
     * 分页查询分类下的产品
     */
    @Select("SELECT * FROM products WHERE category_id = #{categoryId} AND status = 'active'")
    IPage<Product> findPageByCategory(Page<Product> page, @Param("categoryId") Long categoryId);

    /**
     * 分页查询所有产品(支持过滤)
     */
    @Select("SELECT * FROM products WHERE 1=1 " +
            "<if test=\"status != null\">AND status = #{status}</if> " +
            "<if test=\"categoryId != null\">AND category_id = #{categoryId}</if> " +
            "ORDER BY created_at DESC")
    IPage<Product> findPageWithFilter(Page<Product> page,
                                     @Param("status") String status,
                                     @Param("categoryId") Long categoryId);

    /**
     * 查询价格在指定范围的产品
     */
    @Select("SELECT * FROM products WHERE status = 'active' " +
            "AND price BETWEEN #{minPrice} AND #{maxPrice}")
    List<Product> findByPriceRange(@Param("minPrice") BigDecimal minPrice,
                                   @Param("maxPrice") BigDecimal maxPrice);

    /**
     * 更新库存数量
     */
    @Update("UPDATE products SET stock_quantity = stock_quantity - #{quantity} WHERE id = #{productId}")
    int decreaseStock(@Param("productId") Long productId, @Param("quantity") Integer quantity);

    /**
     * 增加销售数量
     */
    @Update("UPDATE products SET sales_count = sales_count + #{quantity} WHERE id = #{productId}")
    int increaseSalesCount(@Param("productId") Long productId, @Param("quantity") Integer quantity);

    /**
     * 查询销售排行(按销售数量)
     */
    @Select("SELECT * FROM products WHERE status = 'active' " +
            "ORDER BY sales_count DESC LIMIT #{limit}")
    List<Product> findTopSellers(@Param("limit") int limit);

    /**
     * 统计产品总数
     */
    @Select("SELECT COUNT(*) FROM products WHERE status = 'active'")
    Long countActiveProducts();

    /**
     * 统计分类下的产品数
     */
    @Select("SELECT COUNT(*) FROM products WHERE category_id = #{categoryId} AND status = 'active'")
    Long countByCategory(@Param("categoryId") Long categoryId);
}
