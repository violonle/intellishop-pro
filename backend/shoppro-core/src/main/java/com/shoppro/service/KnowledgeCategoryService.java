package com.shoppro.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.shoppro.entity.KnowledgeCategory;
import java.util.List;

/**
 * 知识库分类业务服务接口
 *
 * @author ShopPro Team
 * @version 1.0.0
 */
public interface KnowledgeCategoryService extends IService<KnowledgeCategory> {

    /**
     * 获取所有一级分类
     * @return 一级分类列表
     */
    List<KnowledgeCategory> getRootCategories();

    /**
     * 获取指定分类的子分类
     * @param parentId 父分类ID
     * @return 子分类列表
     */
    List<KnowledgeCategory> getSubCategories(Long parentId);

    /**
     * 获取完整的分类树
     * @return 分类树列表
     */
    List<KnowledgeCategory> getCategoryTree();

    /**
     * 创建分类
     * @param category 分类对象
     * @return 是否成功
     */
    boolean createCategory(KnowledgeCategory category);

    /**
     * 更新分类
     * @param category 分类对象
     * @return 是否成功
     */
    boolean updateCategory(KnowledgeCategory category);

    /**
     * 删除分类
     * @param id 分类ID
     * @return 是否成功
     */
    boolean deleteCategory(Long id);

    /**
     * 获取分类详情
     * @param id 分类ID
     * @return 分类对象
     */
    KnowledgeCategory getCategoryDetail(Long id);
}