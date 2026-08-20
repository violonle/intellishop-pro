package com.shoppro.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.shoppro.entity.KnowledgeCategory;
import com.shoppro.repository.KnowledgeCategoryRepository;
import com.shoppro.service.KnowledgeCategoryService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * 知识库分类业务服务实现
 *
 * @author ShopPro Team
 * @version 1.0.0
 */
@Service
@Transactional
public class KnowledgeCategoryServiceImpl extends ServiceImpl<KnowledgeCategoryRepository, KnowledgeCategory>
        implements KnowledgeCategoryService {

    private static final Logger log = LoggerFactory.getLogger(KnowledgeCategoryServiceImpl.class);

    @Override
    public List<KnowledgeCategory> getRootCategories() {
        try {
            return baseMapper.findRootCategories();
        } catch (Exception e) {
            log.error("获取一级分类失败", e);
            return new ArrayList<>();
        }
    }

    @Override
    public List<KnowledgeCategory> getSubCategories(Long parentId) {
        try {
            if (parentId == null || parentId <= 0) {
                log.warn("无效的父分类ID: {}", parentId);
                return new ArrayList<>();
            }
            return baseMapper.findSubCategories(parentId);
        } catch (Exception e) {
            log.error("获取子分类失败, parentId: {}", parentId, e);
            return new ArrayList<>();
        }
    }

    @Override
    public List<KnowledgeCategory> getCategoryTree() {
        try {
            // 获取所有一级分类
            List<KnowledgeCategory> rootCategories = this.getRootCategories();

            // 为每个一级分类添加子分类
            rootCategories.forEach(root -> {
                List<KnowledgeCategory> children = this.getSubCategories(root.getId());
                root.setChildren(children);

                // 为二级分类添加三级分类
                children.forEach(child -> {
                    List<KnowledgeCategory> grandChildren = this.getSubCategories(child.getId());
                    child.setChildren(grandChildren);
                });
            });

            return rootCategories;
        } catch (Exception e) {
            log.error("获取分类树失败", e);
            return new ArrayList<>();
        }
    }

    @Override
    public boolean createCategory(KnowledgeCategory category) {
        try {
            if (category == null || category.getName() == null || category.getName().trim().isEmpty()) {
                log.warn("分类名称不能为空");
                return false;
            }

            // 验证父分类是否存在（如果指定了父分类）
            if (category.getParentId() != null && category.getParentId() > 0) {
                KnowledgeCategory parentCategory = baseMapper.selectById(category.getParentId());
                if (parentCategory == null) {
                    log.warn("父分类不存在, parentId: {}", category.getParentId());
                    return false;
                }
            }

            category.setCreatedAt(LocalDateTime.now());
            category.setUpdatedAt(LocalDateTime.now());
            category.setDeleted(0);

            return save(category);
        } catch (Exception e) {
            log.error("创建分类失败", e);
            return false;
        }
    }

    @Override
    public boolean updateCategory(KnowledgeCategory category) {
        try {
            if (category == null || category.getId() == null || category.getId() <= 0) {
                log.warn("分类ID不能为空");
                return false;
            }

            KnowledgeCategory existingCategory = baseMapper.selectById(category.getId());
            if (existingCategory == null) {
                log.warn("分类不存在, id: {}", category.getId());
                return false;
            }

            // 验证新的父分类是否存在（如果变更了父分类）
            if (category.getParentId() != null && category.getParentId() > 0) {
                if (category.getParentId().equals(category.getId())) {
                    log.warn("分类不能是其自身的父分类");
                    return false;
                }

                // 检查是否会形成循环引用
                if (this.isCircularReference(category.getId(), category.getParentId())) {
                    log.warn("不能形成循环引用");
                    return false;
                }
            }

            category.setUpdatedAt(LocalDateTime.now());
            return updateById(category);
        } catch (Exception e) {
            log.error("更新分类失败, id: {}", category.getId(), e);
            return false;
        }
    }

    @Override
    public boolean deleteCategory(Long id) {
        try {
            if (id == null || id <= 0) {
                log.warn("分类ID不能为空");
                return false;
            }

            KnowledgeCategory category = baseMapper.selectById(id);
            if (category == null) {
                log.warn("分类不存在, id: {}", id);
                return false;
            }

            // 检查是否有子分类
            List<KnowledgeCategory> children = this.getSubCategories(id);
            if (!children.isEmpty()) {
                log.warn("分类下还有子分类，不能删除");
                return false;
            }

            // 逻辑删除
            category.setDeleted(1);
            category.setUpdatedAt(LocalDateTime.now());
            return updateById(category);
        } catch (Exception e) {
            log.error("删除分类失败, id: {}", id, e);
            return false;
        }
    }

    @Override
    public KnowledgeCategory getCategoryDetail(Long id) {
        try {
            if (id == null || id <= 0) {
                log.warn("分类ID不能为空");
                return null;
            }

            KnowledgeCategory category = baseMapper.selectById(id);
            if (category == null) {
                log.warn("分类不存在, id: {}", id);
                return null;
            }

            // 加载子分类
            List<KnowledgeCategory> children = this.getSubCategories(id);
            category.setChildren(children);

            return category;
        } catch (Exception e) {
            log.error("获取分类详情失败, id: {}", id, e);
            return null;
        }
    }

    private boolean isCircularReference(Long categoryId, Long newParentId) {
        if (newParentId == null || newParentId <= 0) {
            return false;
        }

        Long currentId = newParentId;
        int maxDepth = 100; // 防止无限循环

        while (currentId != null && currentId > 0 && maxDepth-- > 0) {
            if (currentId.equals(categoryId)) {
                return true;
            }

            KnowledgeCategory current = baseMapper.selectById(currentId);
            if (current == null) {
                break;
            }

            currentId = current.getParentId();
        }

        return false;
    }
}