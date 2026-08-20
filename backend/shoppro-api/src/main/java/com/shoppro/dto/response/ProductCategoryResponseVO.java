package com.shoppro.dto.response;

import com.fasterxml.jackson.annotation.JsonFormat;
import io.swagger.v3.oas.annotations.media.Schema;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 产品分类响应VO
 *
 * @author ShopPro Team
 * @version 1.0.0
 */
@Schema(description = "产品分类响应信息")
public class ProductCategoryResponseVO {

    @Schema(description = "分类ID", example = "1")
    private Long id;

    @Schema(description = "分类名称", example = "手机")
    private String name;

    @Schema(description = "父分类ID", example = "0")
    private Long parentId;

    @Schema(description = "分类描述", example = "各品牌手机产品")
    private String description;

    @Schema(description = "分类图片", example = "http://example.com/category.jpg")
    private String imageUrl;

    @Schema(description = "排序", example = "1")
    private Integer sortOrder;

    @Schema(description = "状态", example = "1")
    private Integer status;

    @Schema(description = "该分类下产品数量", example = "10")
    private Long productCount;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    @Schema(description = "创建时间")
    private LocalDateTime createdAt;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    @Schema(description = "更新时间")
    private LocalDateTime updatedAt;

    @Schema(description = "子分类列表")
    private List<ProductCategoryResponseVO> children;

    // 显式无参构造器
    public ProductCategoryResponseVO() {}

        public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public Long getParentId() { return parentId; }
    public void setParentId(Long parentId) { this.parentId = parentId; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }

    public Integer getSortOrder() { return sortOrder; }
    public void setSortOrder(Integer sortOrder) { this.sortOrder = sortOrder; }

    public Integer getStatus() { return status; }
    public void setStatus(Integer status) { this.status = status; }

    public Long getProductCount() { return productCount; }
    public void setProductCount(Long productCount) { this.productCount = productCount; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public List<ProductCategoryResponseVO> getChildren() { return children; }
    public void setChildren(List<ProductCategoryResponseVO> children) { this.children = children; }

    // 手动 builder 实现，兼容现有控制器用法
    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private Long id;
        private String name;
        private Long parentId;
        private String description;
        private String imageUrl;
        private Integer sortOrder;
        private Integer status;
        private Long productCount;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
        private List<ProductCategoryResponseVO> children;

        public Builder id(Long id) { this.id = id; return this; }
        public Builder name(String name) { this.name = name; return this; }
        public Builder parentId(Long parentId) { this.parentId = parentId; return this; }
        public Builder description(String description) { this.description = description; return this; }
        public Builder imageUrl(String imageUrl) { this.imageUrl = imageUrl; return this; }
        public Builder sortOrder(Integer sortOrder) { this.sortOrder = sortOrder; return this; }
        public Builder status(Integer status) { this.status = status; return this; }
        public Builder productCount(Long productCount) { this.productCount = productCount; return this; }
        public Builder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }
        public Builder updatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; return this; }
        public Builder children(List<ProductCategoryResponseVO> children) { this.children = children; return this; }

        public ProductCategoryResponseVO build() {
            ProductCategoryResponseVO vo = new ProductCategoryResponseVO();
            vo.setId(this.id);
            vo.setName(this.name);
            vo.setParentId(this.parentId);
            vo.setDescription(this.description);
            vo.setImageUrl(this.imageUrl);
            vo.setSortOrder(this.sortOrder);
            vo.setStatus(this.status);
            vo.setProductCount(this.productCount);
            vo.setCreatedAt(this.createdAt);
            vo.setUpdatedAt(this.updatedAt);
            vo.setChildren(this.children);
            return vo;
        }
    }
}
