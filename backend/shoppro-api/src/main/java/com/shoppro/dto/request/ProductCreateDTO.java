package com.shoppro.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Min;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

/**
 * 产品创建请求DTO
 *
 * @author ShopPro Team
 * @version 1.0.0
 */
@Schema(description = "产品创建请求")
public class ProductCreateDTO {

    @NotBlank(message = "产品名称不能为空")
    @Schema(description = "产品名称", requiredMode = Schema.RequiredMode.REQUIRED, example = "iPhone 15 Pro")
    private String name;

    @NotNull(message = "产品分类不能为空")
    @Schema(description = "产品分类ID", requiredMode = Schema.RequiredMode.REQUIRED, example = "1")
    private Long categoryId;

    @NotBlank(message = "产品SKU不能为空")
    @Schema(description = "产品SKU", requiredMode = Schema.RequiredMode.REQUIRED, example = "IPHONE-15-PRO-001")
    private String sku;

    @Schema(description = "品牌", example = "Apple")
    private String brand;

    @Schema(description = "型号", example = "A2969")
    private String model;

    @NotNull(message = "产品价格不能为空")
    @Min(value = 0, message = "产品价格不能为负")
    @Schema(description = "销售价格", requiredMode = Schema.RequiredMode.REQUIRED, example = "8999.00")
    private BigDecimal price;

    @Schema(description = "市场价", example = "9999.00")
    private BigDecimal marketPrice;

    @Schema(description = "成本价", example = "6000.00")
    private BigDecimal costPrice;

    @Schema(description = "产品规格参数", example = "{\"屏幕\": \"6.1英寸\", \"芯片\": \"A17 Pro\"}")
    private Map<String, Object> specifications;

    @Schema(description = "产品特性", example = "[\"钛金属设计\", \"48MP主摄\", \"USB-C接口\"]")
    private List<String> features;

    @Schema(description = "产品图片URLs")
    private List<String> images;

    @Schema(description = "产品描述", example = "Apple最新旗舰手机")
    private String description;

    @NotNull(message = "初始库存不能为空")
    @Min(value = 0, message = "库存数量不能为负")
    @Schema(description = "初始库存数量", requiredMode = Schema.RequiredMode.REQUIRED, example = "100")
    private Integer stockQuantity;

    @Min(value = 0, message = "最低库存不能为负")
    @Schema(description = "最低库存警戒线", example = "10")
    private Integer minStock;

    @Schema(description = "是否推荐(0-否，1-是)", example = "0")
    private Integer isFeatured;

    public ProductCreateDTO() {
    }

    public String getName() {
        return name;
    }
    public void setName(String name) {
        this.name = name;
    }

    public Long getCategoryId() {
        return categoryId;
    }
    public void setCategoryId(Long categoryId) {
        this.categoryId = categoryId;
    }

    public String getSku() {
        return sku;
    }
    public void setSku(String sku) {
        this.sku = sku;
    }

    public String getBrand() {
        return brand;
    }
    public void setBrand(String brand) {
        this.brand = brand;
    }

    public String getModel() {
        return model;
    }
    public void setModel(String model) {
        this.model = model;
    }

    public BigDecimal getPrice() {
        return price;
    }
    public void setPrice(BigDecimal price) {
        this.price = price;
    }

    public BigDecimal getMarketPrice() {
        return marketPrice;
    }
    public void setMarketPrice(BigDecimal marketPrice) {
        this.marketPrice = marketPrice;
    }

    public BigDecimal getCostPrice() {
        return costPrice;
    }
    public void setCostPrice(BigDecimal costPrice) {
        this.costPrice = costPrice;
    }

    public Map<String, Object> getSpecifications() {
        return specifications;
    }
    public void setSpecifications(Map<String, Object> specifications) {
        this.specifications = specifications;
    }

    public List<String> getFeatures() {
        return features;
    }
    public void setFeatures(List<String> features) {
        this.features = features;
    }

    public List<String> getImages() {
        return images;
    }
    public void setImages(List<String> images) {
        this.images = images;
    }

    public String getDescription() {
        return description;
    }
    public void setDescription(String description) {
        this.description = description;
    }

    public Integer getStockQuantity() {
        return stockQuantity;
    }
    public void setStockQuantity(Integer stockQuantity) {
        this.stockQuantity = stockQuantity;
    }

    public Integer getMinStock() {
        return minStock;
    }
    public void setMinStock(Integer minStock) {
        this.minStock = minStock;
    }

    public Integer getIsFeatured() {
        return isFeatured;
    }
    public void setIsFeatured(Integer isFeatured) {
        this.isFeatured = isFeatured;
    }
}
