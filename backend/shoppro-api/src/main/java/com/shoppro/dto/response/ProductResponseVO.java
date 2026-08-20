package com.shoppro.dto.response;

import com.fasterxml.jackson.annotation.JsonFormat;
import io.swagger.v3.oas.annotations.media.Schema;
// ... existing code ...

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

/**
 * 产品响应VO
 *
 * @author ShopPro Team
 * @version 1.0.0
 */

@Schema(description = "产品响应信息")
public class ProductResponseVO {

    @Schema(description = "产品ID", example = "1")
    private Long id;

    @Schema(description = "产品名称", example = "iPhone 15 Pro")
    private String name;

    @Schema(description = "产品SKU", example = "IPHONE-15-PRO-001")
    private String sku;

    @Schema(description = "产品分类ID", example = "1")
    private Long categoryId;

    @Schema(description = "产品分类名称", example = "手机")
    private String categoryName;

    @Schema(description = "品牌", example = "Apple")
    private String brand;

    @Schema(description = "型号", example = "A2969")
    private String model;

    @Schema(description = "销售价格", example = "8999.00")
    private BigDecimal price;

    @Schema(description = "市场价", example = "9999.00")
    private BigDecimal marketPrice;

    @Schema(description = "成本价", example = "6000.00")
    private BigDecimal costPrice;

    @Schema(description = "产品规格参数")
    private Map<String, Object> specifications;

    @Schema(description = "产品特性")
    private List<String> features;

    @Schema(description = "产品图片URLs")
    private List<String> images;

    @Schema(description = "产品描述", example = "Apple最新旗舰手机")
    private String description;

    @Schema(description = "库存数量", example = "100")
    private Integer stockQuantity;

    @Schema(description = "最低库存警戒线", example = "10")
    private Integer minStock;

    @Schema(description = "销售数量", example = "50")
    private Integer salesCount;

    @Schema(description = "产品状态", example = "active")
    private String status;

    @Schema(description = "是否推荐", example = "0")
    private Integer isFeatured;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    @Schema(description = "创建时间")
    private LocalDateTime createdAt;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    @Schema(description = "更新时间")
    private LocalDateTime updatedAt;

    @Schema(description = "利润（价格-成本）")
    private BigDecimal profit;

    @Schema(description = "利润率", example = "33.33")
    private BigDecimal profitMargin;

    // 显式无参构造器
    public ProductResponseVO() {}

    // 显式全参构造器（用于兼容可能的调用）
    public ProductResponseVO(Long id, String name, String sku, Long categoryId, String categoryName,
                              String brand, String model, BigDecimal price, BigDecimal marketPrice,
                              BigDecimal costPrice, Map<String, Object> specifications, List<String> features,
                              List<String> images, String description, Integer stockQuantity, Integer minStock,
                              Integer salesCount, String status, Integer isFeatured, LocalDateTime createdAt,
                              LocalDateTime updatedAt, BigDecimal profit, BigDecimal profitMargin) {
        this.id = id;
        this.name = name;
        this.sku = sku;
        this.categoryId = categoryId;
        this.categoryName = categoryName;
        this.brand = brand;
        this.model = model;
        this.price = price;
        this.marketPrice = marketPrice;
        this.costPrice = costPrice;
        this.specifications = specifications;
        this.features = features;
        this.images = images;
        this.description = description;
        this.stockQuantity = stockQuantity;
        this.minStock = minStock;
        this.salesCount = salesCount;
        this.status = status;
        this.isFeatured = isFeatured;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.profit = profit;
        this.profitMargin = profitMargin;
    }

        public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getSku() { return sku; }
    public void setSku(String sku) { this.sku = sku; }

    public Long getCategoryId() { return categoryId; }
    public void setCategoryId(Long categoryId) { this.categoryId = categoryId; }

    public String getCategoryName() { return categoryName; }
    public void setCategoryName(String categoryName) { this.categoryName = categoryName; }

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

    public Integer getStockQuantity() { return stockQuantity; }
    public void setStockQuantity(Integer stockQuantity) { this.stockQuantity = stockQuantity; }

    public Integer getMinStock() { return minStock; }
    public void setMinStock(Integer minStock) { this.minStock = minStock; }

    public Integer getSalesCount() { return salesCount; }
    public void setSalesCount(Integer salesCount) { this.salesCount = salesCount; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Integer getIsFeatured() { return isFeatured; }
    public void setIsFeatured(Integer isFeatured) { this.isFeatured = isFeatured; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public BigDecimal getProfit() { return profit; }
    public void setProfit(BigDecimal profit) { this.profit = profit; }

    public BigDecimal getProfitMargin() { return profitMargin; }
    public void setProfitMargin(BigDecimal profitMargin) { this.profitMargin = profitMargin; }

    // 手动 Builder 实现，兼容可能的 builder 用法
    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private Long id;
        private String name;
        private String sku;
        private Long categoryId;
        private String categoryName;
        private String brand;
        private String model;
        private BigDecimal price;
        private BigDecimal marketPrice;
        private BigDecimal costPrice;
        private Map<String, Object> specifications;
        private List<String> features;
        private List<String> images;
        private String description;
        private Integer stockQuantity;
        private Integer minStock;
        private Integer salesCount;
        private String status;
        private Integer isFeatured;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
        private BigDecimal profit;
        private BigDecimal profitMargin;

        public Builder id(Long id) { this.id = id; return this; }
        public Builder name(String name) { this.name = name; return this; }
        public Builder sku(String sku) { this.sku = sku; return this; }
        public Builder categoryId(Long categoryId) { this.categoryId = categoryId; return this; }
        public Builder categoryName(String categoryName) { this.categoryName = categoryName; return this; }
        public Builder brand(String brand) { this.brand = brand; return this; }
        public Builder model(String model) { this.model = model; return this; }
        public Builder price(BigDecimal price) { this.price = price; return this; }
        public Builder marketPrice(BigDecimal marketPrice) { this.marketPrice = marketPrice; return this; }
        public Builder costPrice(BigDecimal costPrice) { this.costPrice = costPrice; return this; }
        public Builder specifications(Map<String, Object> specifications) { this.specifications = specifications; return this; }
        public Builder features(List<String> features) { this.features = features; return this; }
        public Builder images(List<String> images) { this.images = images; return this; }
        public Builder description(String description) { this.description = description; return this; }
        public Builder stockQuantity(Integer stockQuantity) { this.stockQuantity = stockQuantity; return this; }
        public Builder minStock(Integer minStock) { this.minStock = minStock; return this; }
        public Builder salesCount(Integer salesCount) { this.salesCount = salesCount; return this; }
        public Builder status(String status) { this.status = status; return this; }
        public Builder isFeatured(Integer isFeatured) { this.isFeatured = isFeatured; return this; }
        public Builder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }
        public Builder updatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; return this; }
        public Builder profit(BigDecimal profit) { this.profit = profit; return this; }
        public Builder profitMargin(BigDecimal profitMargin) { this.profitMargin = profitMargin; return this; }

        public ProductResponseVO build() {
            ProductResponseVO vo = new ProductResponseVO();
            vo.setId(this.id);
            vo.setName(this.name);
            vo.setSku(this.sku);
            vo.setCategoryId(this.categoryId);
            vo.setCategoryName(this.categoryName);
            vo.setBrand(this.brand);
            vo.setModel(this.model);
            vo.setPrice(this.price);
            vo.setMarketPrice(this.marketPrice);
            vo.setCostPrice(this.costPrice);
            vo.setSpecifications(this.specifications);
            vo.setFeatures(this.features);
            vo.setImages(this.images);
            vo.setDescription(this.description);
            vo.setStockQuantity(this.stockQuantity);
            vo.setMinStock(this.minStock);
            vo.setSalesCount(this.salesCount);
            vo.setStatus(this.status);
            vo.setIsFeatured(this.isFeatured);
            vo.setCreatedAt(this.createdAt);
            vo.setUpdatedAt(this.updatedAt);
            vo.setProfit(this.profit);
            vo.setProfitMargin(this.profitMargin);
            return vo;
        }
    }
}
