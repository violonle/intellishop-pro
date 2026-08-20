package com.shoppro.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;

/**
 * 产品分类DTO
 *
 * @author ShopPro Team
 * @version 1.0.0
 */
@Schema(description = "产品分类请求")
public class ProductCategoryDTO {

    @NotBlank(message = "分类名称不能为空")
    @Schema(description = "分类名称", requiredMode = Schema.RequiredMode.REQUIRED, example = "手机")
    private String name;

    @Schema(description = "父分类ID", example = "0")
    private Long parentId;

    @Schema(description = "分类描述", example = "各品牌手机产品")
    private String description;

    @Schema(description = "分类图片", example = "http://example.com/category.jpg")
    private String imageUrl;

    @Schema(description = "排序", example = "1")
    private Integer sortOrder;

    @Schema(description = "状态(1-启用，0-禁用)", example = "1")
    private Integer status;

    // 显式无参构造器
    public ProductCategoryDTO() {}

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
}
