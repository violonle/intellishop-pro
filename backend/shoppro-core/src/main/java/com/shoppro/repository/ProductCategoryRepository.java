package com.shoppro.repository;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.shoppro.entity.ProductCategory;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;

/**
 * 产品分类数据访问层
 *
 * @author ShopPro Team
 * @version 1.0.0
 */
@Mapper
public interface ProductCategoryRepository extends BaseMapper<ProductCategory> {

    /**
     * 查询顶级分类(parent_id = 0)
     */
    @Select("SELECT * FROM product_categories WHERE parent_id = 0 AND status = 1 ORDER BY sort_order ASC")
    List<ProductCategory> findRootCategories();

    /**
     * 查询子分类
     */
    @Select("SELECT * FROM product_categories WHERE parent_id = #{parentId} AND status = 1 ORDER BY sort_order ASC")
    List<ProductCategory> findChildren(@Param("parentId") Long parentId);

    /**
     * 根据分类名查询
     */
    @Select("SELECT * FROM product_categories WHERE name = #{name} AND status = 1")
    ProductCategory findByName(@Param("name") String name);

    /**
     * 查询所有启用的分类(带排序)
     */
    @Select("SELECT * FROM product_categories WHERE status = 1 ORDER BY sort_order ASC")
    List<ProductCategory> findAllActive();

    /**
     * 检查分类名是否重复(排除自己)
     */
    @Select("SELECT COUNT(*) FROM product_categories WHERE name = #{name} AND id != #{id} AND status = 1")
    Long countDuplicateName(@Param("name") String name, @Param("id") Long id);

    /**
     * 获取分类路径(祖先分类列表)
     */
    @Select("WITH RECURSIVE cte AS ( " +
            "SELECT id, parent_id, name FROM product_categories WHERE id = #{categoryId} " +
            "UNION ALL " +
            "SELECT p.id, p.parent_id, p.name FROM product_categories p " +
            "INNER JOIN cte ON p.id = cte.parent_id " +
            ") SELECT * FROM cte ORDER BY parent_id DESC")
    List<ProductCategory> findCategoryPath(@Param("categoryId") Long categoryId);
}
