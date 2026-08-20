package com.shoppro.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.shoppro.entity.Product;
import com.shoppro.repository.ProductRepository;
import com.shoppro.service.ProductService;
import com.shoppro.exception.BusinessException;
import com.shoppro.exception.ResourceNotFoundException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 产品管理服务实现
 * 提供产品的CRUD、库存管理、搜索等功能
 *
 * @author ShopPro Team
 * @version 1.0.0
 */
@Service
public class ProductServiceImpl implements ProductService {

    private static final Logger log = LoggerFactory.getLogger(ProductServiceImpl.class);

    private final ProductRepository productRepository;

    public ProductServiceImpl(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    @Override
    public Page<Product> listProducts(int pageNo, int pageSize, Map<String, Object> filters) {
        QueryWrapper<Product> queryWrapper = buildQueryWrapper(filters);
        queryWrapper.eq("status", "active");
        Page<Product> page = new Page<>(pageNo, pageSize);
        return productRepository.selectPage(page, queryWrapper);
    }

    @Override
    public Page<Product> searchProducts(String keyword, int pageNo, int pageSize) {
        if (keyword == null || keyword.trim().isEmpty()) {
            throw new BusinessException("搜索关键词不能为空");
        }

        QueryWrapper<Product> queryWrapper = new QueryWrapper<>();
        queryWrapper.and(wrapper -> wrapper.like("name", keyword)
                .or().like("brand", keyword)
                .or().like("model", keyword)
                .or().like("description", keyword));
        queryWrapper.eq("status", "active");

        Page<Product> page = new Page<>(pageNo, pageSize);
        return productRepository.selectPage(page, queryWrapper);
    }

    @Override
    public Product getProductDetail(Long productId) {
        if (productId == null || productId <= 0) {
            throw new BusinessException("产品ID不合法");
        }

        Product product = productRepository.selectById(productId);
        if (product == null) {
            throw new ResourceNotFoundException("产品不存在");
        }

        return product;
    }

    @Override
    public Page<Product> getProductsByCategory(Long categoryId, int pageNo, int pageSize) {
        if (categoryId == null || categoryId <= 0) {
            throw new BusinessException("分类ID不合法");
        }

        QueryWrapper<Product> queryWrapper = new QueryWrapper<>();
        queryWrapper.eq("category_id", categoryId)
                .eq("status", "active");

        Page<Product> page = new Page<>(pageNo, pageSize);
        return productRepository.selectPage(page, queryWrapper);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Product createProduct(Product product) {
        if (product == null) {
            throw new BusinessException("产品信息不能为空");
        }

        if (product.getName() == null || product.getName().trim().isEmpty()) {
            throw new BusinessException("产品名称不能为空");
        }

        if (product.getPrice() == null || product.getPrice().compareTo(BigDecimal.ZERO) <= 0) {
            throw new BusinessException("产品价格必须大于0");
        }

        // 检查SKU是否重复
        if (product.getSku() != null && !product.getSku().isEmpty()) {
            QueryWrapper<Product> queryWrapper = new QueryWrapper<>();
            queryWrapper.eq("sku", product.getSku());
            if (productRepository.selectCount(queryWrapper) > 0) {
                throw new BusinessException("产品SKU已存在");
            }
        }

        // 初始化默认值
        if (product.getStatus() == null) {
            product.setStatus("active");
        }
        if (product.getStockQuantity() == null) {
            product.setStockQuantity(0);
        }
        if (product.getSalesCount() == null) {
            product.setSalesCount(0);
        }
        if (product.getIsFeatured() == null) {
            product.setIsFeatured(0);
        }

        productRepository.insert(product);
        log.info("产品创建成功: productId={}, name={}", product.getId(), product.getName());

        return product;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Product updateProduct(Product product) {
        if (product == null || product.getId() == null) {
            throw new BusinessException("产品ID不能为空");
        }

        Product existingProduct = productRepository.selectById(product.getId());
        if (existingProduct == null) {
            throw new ResourceNotFoundException("产品不存在");
        }

        if (product.getPrice() != null && product.getPrice().compareTo(BigDecimal.ZERO) <= 0) {
            throw new BusinessException("产品价格必须大于0");
        }

        productRepository.updateById(product);
        log.info("产品更新成功: productId={}", product.getId());

        return productRepository.selectById(product.getId());
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean deleteProduct(Long productId) {
        if (productId == null || productId <= 0) {
            throw new BusinessException("产品ID不合法");
        }

        Product product = productRepository.selectById(productId);
        if (product == null) {
            throw new ResourceNotFoundException("产品不存在");
        }

        productRepository.deleteById(productId);
        log.info("产品删除成功: productId={}", productId);

        return true;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean deleteProducts(List<Long> productIds) {
        if (productIds == null || productIds.isEmpty()) {
            throw new BusinessException("产品ID列表不能为空");
        }

        productRepository.deleteBatchIds(productIds);
        log.info("批量删除产品成功: count={}", productIds.size());

        return true;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean updateStock(Long productId, int quantity, String operation) {
        if (productId == null || productId <= 0) {
            throw new BusinessException("产品ID不合法");
        }

        if (quantity <= 0) {
            throw new BusinessException("数量必须大于0");
        }

        if (!("add".equals(operation) || "subtract".equals(operation) || "set".equals(operation))) {
            throw new BusinessException("不支持的操作类型");
        }

        Product product = productRepository.selectById(productId);
        if (product == null) {
            throw new ResourceNotFoundException("产品不存在");
        }

        int currentStock = product.getStockQuantity() != null ? product.getStockQuantity() : 0;
        int newStock;

        switch (operation) {
            case "add":
                newStock = currentStock + quantity;
                break;
            case "subtract":
                if (currentStock < quantity) {
                    throw new BusinessException("库存不足");
                }
                newStock = currentStock - quantity;
                break;
            case "set":
                newStock = quantity;
                break;
            default:
                throw new BusinessException("不支持的操作类型");
        }

        Product updateProduct = new Product();
        updateProduct.setId(productId);
        updateProduct.setStockQuantity(newStock);
        productRepository.updateById(updateProduct);

        log.info("产品库存更新成功: productId={}, operation={}, quantity={}, newStock={}",
                productId, operation, quantity, newStock);

        return true;
    }

    @Override
    public boolean isStockSufficient(Long productId, int quantity) {
        if (productId == null || productId <= 0) {
            throw new BusinessException("产品ID不合法");
        }

        Product product = productRepository.selectById(productId);
        if (product == null) {
            throw new ResourceNotFoundException("产品不存在");
        }

        int currentStock = product.getStockQuantity() != null ? product.getStockQuantity() : 0;
        return currentStock >= quantity;
    }

    @Override
    public List<Product> getLowStockProducts() {
        QueryWrapper<Product> queryWrapper = new QueryWrapper<>();
        queryWrapper.select("*")
                .apply("stock_quantity < IFNULL(min_stock, 0)")
                .eq("status", "active")
                .orderByAsc("stock_quantity");

        return productRepository.selectList(queryWrapper);
    }

    @Override
    public Map<String, Object> getProductStatistics() {
        Map<String, Object> statistics = new HashMap<>();

        // 总产品数 (所有状态)
        long totalCount = productRepository.selectCount(new QueryWrapper<>());
        statistics.put("totalProducts", totalCount);

        // 在售产品数
        QueryWrapper<Product> activeWrapper = new QueryWrapper<>();
        activeWrapper.eq("status", "active");
        long activeCount = productRepository.selectCount(activeWrapper);
        statistics.put("activeProducts", activeCount);

        // 产品分类数
        QueryWrapper<Product> categoryWrapper = new QueryWrapper<>();
        categoryWrapper.select("count(distinct category_id)");
        // Note: MyBatis Plus selectCount might not support distinct count easily with
        // wrapper unless expected return is Long
        // Easier to use selectMaps or selectObjs but simple approach:
        // Or simply:
        categoryWrapper.isNotNull("category_id");
        // We really want count distinct. Let's try selectObjs with distinct selection
        List<Object> categories = productRepository
                .selectObjs(new QueryWrapper<Product>().select("distinct category_id").isNotNull("category_id"));
        statistics.put("categoryCount", categories.size());

        // 库存不足的产品数
        List<Product> lowStockProducts = getLowStockProducts();
        statistics.put("lowStockCount", lowStockProducts.size());

        // 总库存量
        long totalStock = 0;
        QueryWrapper<Product> stockWrapper = new QueryWrapper<>();
        stockWrapper.eq("status", "active");
        List<Product> allProducts = productRepository.selectList(stockWrapper);
        for (Product product : allProducts) {
            totalStock += (product.getStockQuantity() != null ? product.getStockQuantity() : 0);
        }
        statistics.put("totalStock", totalStock);

        // 总销售量
        long totalSales = 0;
        for (Product product : allProducts) {
            totalSales += (product.getSalesCount() != null ? product.getSalesCount() : 0);
        }
        statistics.put("totalSales", totalSales);

        return statistics;
    }

    @Override
    public long getProductCountByCategory(Long categoryId) {
        if (categoryId == null || categoryId <= 0) {
            throw new BusinessException("分类ID不合法");
        }

        QueryWrapper<Product> queryWrapper = new QueryWrapper<>();
        queryWrapper.eq("category_id", categoryId)
                .eq("status", "active");

        return productRepository.selectCount(queryWrapper);
    }

    @Override
    public List<Product> getHotProducts(int limit) {
        if (limit <= 0) {
            limit = 10;
        }

        QueryWrapper<Product> queryWrapper = new QueryWrapper<>();
        queryWrapper.eq("status", "active")
                .orderByDesc("sales_count")
                .last("LIMIT " + limit);

        return productRepository.selectList(queryWrapper);
    }

    @Override
    public List<Product> getFeaturedProducts(int limit) {
        if (limit <= 0) {
            limit = 10;
        }

        QueryWrapper<Product> queryWrapper = new QueryWrapper<>();
        queryWrapper.eq("is_featured", 1)
                .eq("status", "active")
                .orderByDesc("created_at")
                .last("LIMIT " + limit);

        return productRepository.selectList(queryWrapper);
    }

    @Override
    public Page<Product> getProductsByBrand(String brand, int pageNo, int pageSize) {
        if (brand == null || brand.trim().isEmpty()) {
            throw new BusinessException("品牌名称不能为空");
        }

        QueryWrapper<Product> queryWrapper = new QueryWrapper<>();
        queryWrapper.eq("brand", brand)
                .eq("status", "active");

        Page<Product> page = new Page<>(pageNo, pageSize);
        return productRepository.selectPage(page, queryWrapper);
    }

    @Override
    public Page<Product> searchProductsByPriceRange(double minPrice, double maxPrice, int pageNo, int pageSize) {
        if (minPrice < 0 || maxPrice < 0 || minPrice > maxPrice) {
            throw new BusinessException("价格范围不合法");
        }

        QueryWrapper<Product> queryWrapper = new QueryWrapper<>();
        queryWrapper.between("price", minPrice, maxPrice)
                .eq("status", "active");

        Page<Product> page = new Page<>(pageNo, pageSize);
        return productRepository.selectPage(page, queryWrapper);
    }

    @Override
    public List<Product> getAllActiveProducts() {
        QueryWrapper<Product> queryWrapper = new QueryWrapper<>();
        queryWrapper.eq("status", "active")
                .orderByDesc("created_at");

        return productRepository.selectList(queryWrapper);
    }

    @Override
    public Map<String, Object> getProductSalesStatistics(Long productId) {
        if (productId == null || productId <= 0) {
            throw new BusinessException("产品ID不合法");
        }

        Product product = productRepository.selectById(productId);
        if (product == null) {
            throw new ResourceNotFoundException("产品不存在");
        }

        Map<String, Object> statistics = new HashMap<>();
        statistics.put("productId", productId);
        statistics.put("productName", product.getName());
        statistics.put("totalSales", product.getSalesCount() != null ? product.getSalesCount() : 0);
        statistics.put("currentStock", product.getStockQuantity() != null ? product.getStockQuantity() : 0);
        statistics.put("price", product.getPrice());
        statistics.put("marketPrice", product.getMarketPrice());

        return statistics;
    }

    /**
     * 构建查询条件
     */
    private QueryWrapper<Product> buildQueryWrapper(Map<String, Object> filters) {
        QueryWrapper<Product> queryWrapper = new QueryWrapper<>();

        if (filters == null || filters.isEmpty()) {
            return queryWrapper;
        }

        // 按分类查询
        if (filters.containsKey("categoryId")) {
            queryWrapper.eq("category_id", filters.get("categoryId"));
        }

        // 按品牌查询
        if (filters.containsKey("brand")) {
            queryWrapper.eq("brand", filters.get("brand"));
        }

        // 按状态查询
        if (filters.containsKey("status")) {
            queryWrapper.eq("status", filters.get("status"));
        }

        // 按价格范围查询
        if (filters.containsKey("minPrice") && filters.containsKey("maxPrice")) {
            queryWrapper.between("price", filters.get("minPrice"), filters.get("maxPrice"));
        }

        // 按库存状态查询
        if (filters.containsKey("lowStock")) {
            Boolean lowStock = (Boolean) filters.get("lowStock");
            if (lowStock) {
                queryWrapper.apply("stock_quantity < IFNULL(min_stock, 0)");
            }
        }

        // 只显示推荐产品
        if (filters.containsKey("featured")) {
            Boolean featured = (Boolean) filters.get("featured");
            if (featured) {
                queryWrapper.eq("is_featured", 1);
            }
        }

        return queryWrapper;
    }
}
