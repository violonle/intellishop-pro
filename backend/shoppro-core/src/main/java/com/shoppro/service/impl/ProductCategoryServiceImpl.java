package com.shoppro.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.shoppro.entity.ProductCategory;
import com.shoppro.repository.ProductCategoryRepository;
import com.shoppro.service.ProductCategoryService;
import com.shoppro.exception.BusinessException;
import com.shoppro.exception.ResourceNotFoundException;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

/**
 * 产品分类管理服务实现
 * 提供产品分类的CRUD和树形结构获取功能
 *
 * @author ShopPro Team
 * @version 1.0.0
 */
@Service
public class ProductCategoryServiceImpl implements ProductCategoryService {

    private static final Logger log = LoggerFactory.getLogger(ProductCategoryServiceImpl.class);
    private final ProductCategoryRepository productCategoryRepository;

    public ProductCategoryServiceImpl(ProductCategoryRepository productCategoryRepository) {
        this.productCategoryRepository = productCategoryRepository;
    }

    @Override
    public List<Map<String, Object>> getCategoryTree() {
        // 获取所有启用的分类
        List<ProductCategory> categories = getAllActiveCategories();

        // 构建树形结构
        Map<Long, List<ProductCategory>> categoryMap = categories.stream()
                .collect(Collectors.groupingBy(ProductCategory::getParentId));

        // 递归构建树
        List<Map<String, Object>> tree = new ArrayList<>();
        List<ProductCategory> rootCategories = categoryMap.getOrDefault(0L, new ArrayList<>());

        for (ProductCategory root : rootCategories) {
            tree.add(buildCategoryNode(root, categoryMap));
        }

        return tree;
    }

    @Override
    public List<ProductCategory> getRootCategories() {
        QueryWrapper<ProductCategory> queryWrapper = new QueryWrapper<>();
        queryWrapper.eq("parent_id", 0)
                   .eq("status", 1)
                   .orderByAsc("sort_order");

        return productCategoryRepository.selectList(queryWrapper);
    }

    @Override
    public List<ProductCategory> getSubCategories(Long parentId) {
        if (parentId == null || parentId < 0) {
            throw new BusinessException("父分类ID不合法");
        }

        QueryWrapper<ProductCategory> queryWrapper = new QueryWrapper<>();
        queryWrapper.eq("parent_id", parentId)
                   .eq("status", 1)
                   .orderByAsc("sort_order");

        return productCategoryRepository.selectList(queryWrapper);
    }

    @Override
    public ProductCategory getCategoryDetail(Long categoryId) {
        if (categoryId == null || categoryId <= 0) {
            throw new BusinessException("分类ID不合法");
        }

        ProductCategory category = productCategoryRepository.selectById(categoryId);
        if (category == null) {
            throw new ResourceNotFoundException("分类不存在");
        }

        return category;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public ProductCategory createCategory(ProductCategory category) {
        if (category == null) {
            throw new BusinessException("分类信息不能为空");
        }

        if (category.getName() == null || category.getName().trim().isEmpty()) {
            throw new BusinessException("分类名称不能为空");
        }

        // 检查分类名称是否重复
        QueryWrapper<ProductCategory> queryWrapper = new QueryWrapper<>();
        queryWrapper.eq("name", category.getName())
                   .eq("parent_id", category.getParentId() != null ? category.getParentId() : 0);
        if (productCategoryRepository.selectCount(queryWrapper) > 0) {
            throw new BusinessException("同级分类名称已存在");
        }

        // 检查循环引用
        if (category.getParentId() != null && category.getParentId() > 0) {
            if (hasCircularReference(category.getId(), category.getParentId())) {
                throw new BusinessException("存在循环引用");
            }
        }

        // 初始化默认值
        if (category.getParentId() == null) {
            category.setParentId(0L);
        }
        if (category.getStatus() == null) {
            category.setStatus(1);
        }
        if (category.getSortOrder() == null) {
            category.setSortOrder(0);
        }

        productCategoryRepository.insert(category);
        log.info("产品分类创建成功: categoryId={}, name={}", category.getId(), category.getName());

        return category;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public ProductCategory updateCategory(ProductCategory category) {
        if (category == null || category.getId() == null) {
            throw new BusinessException("分类ID不能为空");
        }

        ProductCategory existingCategory = productCategoryRepository.selectById(category.getId());
        if (existingCategory == null) {
            throw new ResourceNotFoundException("分类不存在");
        }

        if (category.getName() != null && !category.getName().trim().isEmpty()) {
            // 检查分类名称是否重复
            QueryWrapper<ProductCategory> queryWrapper = new QueryWrapper<>();
            queryWrapper.eq("name", category.getName())
                       .eq("parent_id", category.getParentId() != null ? category.getParentId() : existingCategory.getParentId())
                       .ne("id", category.getId());
            if (productCategoryRepository.selectCount(queryWrapper) > 0) {
                throw new BusinessException("同级分类名称已存在");
            }
        }

        // 检查循环引用
        if (category.getParentId() != null && category.getParentId() > 0) {
            if (!Objects.equals(category.getId(), category.getParentId()) && 
                hasCircularReference(category.getId(), category.getParentId())) {
                throw new BusinessException("存在循环引用");
            }
        }

        productCategoryRepository.updateById(category);
        log.info("产品分类更新成功: categoryId={}", category.getId());

        return productCategoryRepository.selectById(category.getId());
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean deleteCategory(Long categoryId) {
        if (categoryId == null || categoryId <= 0) {
            throw new BusinessException("分类ID不合法");
        }

        ProductCategory category = productCategoryRepository.selectById(categoryId);
        if (category == null) {
            throw new ResourceNotFoundException("分类不存在");
        }

        // 检查是否有子分类
        QueryWrapper<ProductCategory> subCategoryWrapper = new QueryWrapper<>();
        subCategoryWrapper.eq("parent_id", categoryId);
        if (productCategoryRepository.selectCount(subCategoryWrapper) > 0) {
            throw new BusinessException("分类下存在子分类，不能删除");
        }

        productCategoryRepository.deleteById(categoryId);
        log.info("产品分类删除成功: categoryId={}", categoryId);

        return true;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean deleteCategories(List<Long> categoryIds) {
        if (categoryIds == null || categoryIds.isEmpty()) {
            throw new BusinessException("分类ID列表不能为空");
        }

        for (Long categoryId : categoryIds) {
            deleteCategory(categoryId);
        }

        log.info("批量删除产品分类成功: count={}", categoryIds.size());
        return true;
    }

    @Override
    public List<ProductCategory> getCategoryAndSubcategories(Long categoryId) {
        if (categoryId == null || categoryId <= 0) {
            throw new BusinessException("分类ID不合法");
        }

        ProductCategory category = productCategoryRepository.selectById(categoryId);
        if (category == null) {
            throw new ResourceNotFoundException("分类不存在");
        }

        List<ProductCategory> result = new ArrayList<>();
        result.add(category);

        // 递归获取所有子分类
        getAllSubcategories(categoryId, result);

        return result;
    }

    @Override
    public boolean hasCircularReference(Long categoryId, Long parentId) {
        if (categoryId == null || categoryId <= 0 || parentId == null || parentId <= 0) {
            return false;
        }

        // 如果分类ID等于父ID，则存在循环引用
        if (Objects.equals(categoryId, parentId)) {
            return true;
        }

        // 递归检查父分类的父分类
        ProductCategory parentCategory = productCategoryRepository.selectById(parentId);
        if (parentCategory != null && parentCategory.getParentId() != null && parentCategory.getParentId() > 0) {
            return hasCircularReference(categoryId, parentCategory.getParentId());
        }

        return false;
    }

    @Override
    public List<ProductCategory> getCategoryPath(Long categoryId) {
        if (categoryId == null || categoryId <= 0) {
            throw new BusinessException("分类ID不合法");
        }

        List<ProductCategory> path = new ArrayList<>();
        ProductCategory category = productCategoryRepository.selectById(categoryId);

        while (category != null) {
            path.add(0, category);
            if (category.getParentId() != null && category.getParentId() > 0) {
                category = productCategoryRepository.selectById(category.getParentId());
            } else {
                break;
            }
        }

        return path;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean enableCategory(Long categoryId) {
        if (categoryId == null || categoryId <= 0) {
            throw new BusinessException("分类ID不合法");
        }

        ProductCategory category = new ProductCategory();
        category.setId(categoryId);
        category.setStatus(1);
        productCategoryRepository.updateById(category);

        log.info("产品分类启用成功: categoryId={}", categoryId);
        return true;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean disableCategory(Long categoryId) {
        if (categoryId == null || categoryId <= 0) {
            throw new BusinessException("分类ID不合法");
        }

        ProductCategory category = new ProductCategory();
        category.setId(categoryId);
        category.setStatus(0);
        productCategoryRepository.updateById(category);

        log.info("产品分类禁用成功: categoryId={}", categoryId);
        return true;
    }

    @Override
    public List<ProductCategory> getAllActiveCategories() {
        QueryWrapper<ProductCategory> queryWrapper = new QueryWrapper<>();
        queryWrapper.eq("status", 1)
                   .orderByAsc("parent_id")
                   .orderByAsc("sort_order");

        return productCategoryRepository.selectList(queryWrapper);
    }

    /**
     * 构建分类树节点
     */
    private Map<String, Object> buildCategoryNode(ProductCategory category, Map<Long, List<ProductCategory>> categoryMap) {
        Map<String, Object> node = new HashMap<>();
        node.put("id", category.getId());
        node.put("name", category.getName());
        node.put("parentId", category.getParentId());
        node.put("description", category.getDescription());
        node.put("imageUrl", category.getImageUrl());
        node.put("sortOrder", category.getSortOrder());
        node.put("status", category.getStatus());

        // 递归构建子节点
        List<ProductCategory> children = categoryMap.getOrDefault(category.getId(), new ArrayList<>());
        if (!children.isEmpty()) {
            List<Map<String, Object>> childrenNodes = new ArrayList<>();
            for (ProductCategory child : children) {
                childrenNodes.add(buildCategoryNode(child, categoryMap));
            }
            node.put("children", childrenNodes);
        } else {
            node.put("children", new ArrayList<>());
        }

        return node;
    }

    /**
     * 递归获取所有子分类
     */
    private void getAllSubcategories(Long parentId, List<ProductCategory> result) {
        List<ProductCategory> subCategories = getSubCategories(parentId);
        for (ProductCategory subCategory : subCategories) {
            result.add(subCategory);
            getAllSubcategories(subCategory.getId(), result);
        }
    }
}
