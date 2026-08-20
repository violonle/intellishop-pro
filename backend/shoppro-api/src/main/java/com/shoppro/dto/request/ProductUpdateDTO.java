package com.shoppro.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Min;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

/**
 * 产品更新请求DTO
 *
 * @author ShopPro Team
 * @version 1.0.0
 */
@Schema(description = "产品更新请求")
public class ProductUpdateDTO {

    @Schema(description = "产品名称", example = "iPhone 15 Pro Max")
    private String name;

    @Schema(description = "产品分类ID", example = "1")
    private Long categoryId;

    @Schema(description = "品牌", example = "Apple")
    private String brand;

    @Schema(description = "型号", example = "A2970")
    private String model;

    @Min(value = 0, message = "产品价格不能为负")
    @Schema(description = "销售价格", example = "9999.00")
    private BigDecimal price;

    @Schema(description = "市场价", example = "10999.00")
    private BigDecimal marketPrice;

    @Schema(description = "成本价", example = "7000.00")
    private BigDecimal costPrice;

    @Schema(description = "产品规格参数", example = "{\"屏幕\": \"6.7英寸\", \"芯片\": \"A17 Pro\"}")
    private Map<String, Object> specifications;

    @Schema(description = "产品特性", example = "[\"钛金属设计\", \"48MP主摄\", \"USB-C接口\", \"超大屏幕\"]")
    private List<String> features;

    @Schema(description = "产品图片URLs")
    private List<String> images;

    @Schema(description = "产品描述", example = "Apple最新旗舰大屏手机")
    private String description;

    @Min(value = 0, message = "最低库存不能为负")
    @Schema(description = "最低库存警戒线", example = "10")
    private Integer minStock;

    @Schema(description = "产品状态", example = "active")
    private String status;

    @Schema(description = "是否推荐(0-否，1-是)", example = "1")
    private Integer isFeatured;

    public ProductUpdateDTO() {}

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public Long getCategoryId() { return categoryId; }
    public void setCategoryId(Long categoryId) { this.categoryId = categoryId; }

    public String getBrand() { return brand; }
    public void setBrand(String brand) { this.brand = brand; }

    public String getModel() { return model; }
    public void setModel(String model) { this.model = model; }

    public BigDecimal getPrice() { return price; }
    public void setPrice(BigDecimal price) { this.price = price; }

    public BigDecimal getMarketPrice() { return marketPrice; }
    public void setMarketPrice(BigDecimal marketPrice) { this.marketPrice = marketPrice; }

    public BigDecimal getCostPrice() { return costPrice; }
    public void setCostPrice(BigDecimal costPrice) { this.costPrice = costPrice; }

    public Map<String, Object> getSpecifications() { return specifications; }
    public void setSpecifications(Map<String, Object> specifications) { this.specifications = specifications; }

    public List<String> getFeatures() { return features; }
    public void setFeatures(List<String> features) { this.features = features; }

    public List<String> getImages() { return images; }
    public void setImages(List<String> images) { this.images = images; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Integer getMinStock() { return minStock; }
    public void setMinStock(Integer minStock) { this.minStock = minStock; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Integer getIsFeatured() { return isFeatured; }
    public void setIsFeatured(Integer isFeatured) { this.isFeatured = isFeatured; }
}
