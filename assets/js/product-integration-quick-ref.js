/**
 * 产品管理集成 - 快速参考和示例
 * 这个文件提供了常用的产品管理操作的快速参考和代码示例
 */

// ============ 快速参考 ============

/**
 * 快速加载产品列表的几种方法
 */

// 1. 加载所有产品
async function quickLoadAllProducts() {
    const result = await loadProducts('all');
    console.log('总共有', result.total, '个产品');
    return result.products;
}

// 2. 加载在售产品
async function quickLoadActiveProducts() {
    const result = await loadProducts('active');
    return result.products;
}

// 3. 搜索产品
async function quickSearchProducts(keyword) {
    const result = await loadProducts('all', keyword);
    return result.products;
}

// 4. 按分类加载产品
async function quickLoadByCategory(categoryId) {
    const result = await loadProducts('all', '', categoryId);
    return result.products;
}

// 5. 获取库存不足的产品
async function quickGetLowStockProducts() {
    const result = await loadProducts('low-stock');
    return result.products;
}

/**
 * 快速库存操作
 */

// 1. 快速入库
async function quickStockIn(productId, quantity) {
    return await stockIn(productId, quantity, '入库');
}

// 2. 快速出库
async function quickStockOut(productId, quantity) {
    return await stockOut(productId, quantity, '出库');
}

// 3. 快速调整
async function quickAdjustStock(productId, newQuantity) {
    return await adjustStock(productId, newQuantity, '库存调整');
}

/**
 * 快速产品操作
 */

// 1. 获取产品详情并打印
async function quickViewProduct(productId) {
    const product = await getProductDetail(productId);
    if (product) {
        console.log('产品名称:', product.productName);
        console.log('SKU:', product.sku);
        console.log('价格:', formatPrice(product.price));
        console.log('库存:', product.stock);
        console.log('状态:', formatProductStatus(product.status).label);
    }
    return product;
}

// 2. 获取产品统计
async function quickGetStats() {
    const stats = await getProductStatistics();
    console.table({
        '总产品数': stats.totalProducts,
        '在售产品': stats.activeProducts,
        '下架产品': stats.inactiveProducts,
        '库存不足': stats.lowStockCount,
        '分类总数': stats.totalCategories,
        '总库存': stats.totalStock,
        '平均价格': formatPrice(stats.averagePrice)
    });
    return stats;
}

// 3. 获取分类统计
async function quickGetCategoryStats() {
    const stats = await getProductStatisticsByCategory();
    console.table(stats);
    return stats;
}

/**
 * 快速分类操作
 */

// 1. 获取所有分类
async function quickGetCategories() {
    const categories = await loadProductCategories(false);
    console.log('分类列表:', categories);
    return categories;
}

// 2. 获取分类树
async function quickGetCategoryTree() {
    const tree = await loadProductCategories(true);
    console.log('分类树:', tree);
    return tree;
}

// 3. 获取子分类
async function quickGetSubcategories(parentId) {
    const children = await getProductCategoryChildren(parentId);
    console.log('子分类:', children);
    return children;
}

// ============ 常见场景示例 ============

/**
 * 场景1: 显示产品列表表格
 */
async function renderProductTableExample() {
    const result = await loadProducts('all');
    
    let html = `
        <table border="1">
            <thead>
                <tr>
                    <th>产品名称</th>
                    <th>SKU</th>
                    <th>价格</th>
                    <th>库存</th>
                    <th>状态</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    for (const product of result.products) {
        const status = formatProductStatus(product.status);
        html += `
            <tr>
                <td>${product.productName}</td>
                <td>${product.sku}</td>
                <td>${formatPrice(product.price)}</td>
                <td>${product.stock}</td>
                <td><span style="color: ${status.class}">${status.label}</span></td>
            </tr>
        `;
    }
    
    html += `
            </tbody>
        </table>
    `;
    
    return html;
}

/**
 * 场景2: 库存预警通知
 */
async function checkLowStockAndNotify() {
    const lowStockProducts = await getLowStockProducts();
    
    if (lowStockProducts.length > 0) {
        const message = `
            库存预警: 有 ${lowStockProducts.length} 个产品库存不足
            ${lowStockProducts.map(p => `- ${p.productName}: ${p.stock}件`).join('\n')}
        `;
        
        if (window.UI && window.UI.showMessage) {
            UI.showMessage(message, 'warning');
        }
    }
    
    return lowStockProducts;
}

/**
 * 场景3: 产品价格和利润计算
 */
function calculateProductProfit(product) {
    const cost = product.costPrice || 0;
    const price = product.price || 0;
    const profit = price - cost;
    const margin = price > 0 ? ((profit / price) * 100).toFixed(1) : 0;
    
    return {
        cost: formatPrice(cost),
        price: formatPrice(price),
        profit: formatPrice(profit),
        marginPercent: margin + '%'
    };
}

/**
 * 场景4: 库存金额计算
 */
function calculateInventoryValue(product) {
    const stock = product.stock || 0;
    const cost = product.costPrice || 0;
    const totalCost = stock * cost;
    const totalPrice = stock * (product.price || 0);
    
    return {
        quantity: stock,
        unitCost: formatPrice(cost),
        totalCost: formatPrice(totalCost),
        totalPrice: formatPrice(totalPrice)
    };
}

/**
 * 场景5: 批量操作 - 批量入库
 */
async function batchStockIn(productStockData) {
    // productStockData: [{ id: 1, quantity: 100 }, { id: 2, quantity: 50 }]
    const results = [];
    
    for (const item of productStockData) {
        try {
            const result = await stockIn(item.id, item.quantity);
            results.push({ id: item.id, status: 'success', result });
        } catch (error) {
            results.push({ id: item.id, status: 'failed', error: error.message });
        }
    }
    
    return results;
}

/**
 * 场景6: 批量操作 - 批量更新产品状态
 */
async function batchUpdateStatus(productIds, newStatus) {
    const results = [];
    
    for (const productId of productIds) {
        try {
            const result = await updateProduct(productId, { status: newStatus });
            results.push({ id: productId, status: 'success' });
        } catch (error) {
            results.push({ id: productId, status: 'failed', error: error.message });
        }
    }
    
    return results;
}

/**
 * 场景7: 搜索并过滤
 */
async function searchWithFilters(keyword, minPrice, maxPrice, categoryId) {
    const result = await loadProducts('all', keyword, categoryId);
    
    // 前端过滤价格范围
    const filtered = result.products.filter(p => {
        return (minPrice === undefined || p.price >= minPrice) &&
               (maxPrice === undefined || p.price <= maxPrice);
    });
    
    return {
        total: filtered.length,
        products: filtered
    };
}

/**
 * 场景8: 导出产品数据为 CSV
 */
function exportProductsToCSV(products) {
    let csv = '产品名称,SKU,分类,价格,成本价,库存,最低库存,状态\n';
    
    for (const product of products) {
        const row = [
            product.productName,
            product.sku,
            product.categoryName || '',
            product.price || 0,
            product.costPrice || 0,
            product.stock || 0,
            product.minStock || 0,
            product.status || ''
        ].map(field => `"${field}"`).join(',');
        
        csv += row + '\n';
    }
    
    return csv;
}

/**
 * 场景9: 导出库存报告
 */
async function generateInventoryReport() {
    const stats = await getProductStatistics();
    const categoryStats = await getProductStatisticsByCategory();
    const lowStockProducts = await getLowStockProducts();
    
    const report = {
        generatedAt: new Date().toISOString(),
        summary: {
            totalProducts: stats.totalProducts,
            activeProducts: stats.activeProducts,
            lowStockCount: stats.lowStockCount,
            totalStock: stats.totalStock,
            averagePrice: formatPrice(stats.averagePrice)
        },
        byCategory: categoryStats,
        lowStockItems: lowStockProducts.map(p => ({
            name: p.productName,
            sku: p.sku,
            currentStock: p.stock,
            minStock: p.minStock,
            needReplenish: p.minStock - p.stock
        }))
    };
    
    return report;
}

/**
 * 场景10: 智能补货建议
 */
async function getReplenishmentSuggestions() {
    const lowStockProducts = await getLowStockProducts();
    
    const suggestions = lowStockProducts.map(product => {
        const neededQuantity = product.minStock - product.stock;
        const suggestedQuantity = Math.ceil(neededQuantity * 1.5); // 建议补货150%
        
        return {
            productId: product.id || product.productId,
            productName: product.productName,
            sku: product.sku,
            currentStock: product.stock,
            minimumStock: product.minStock,
            suggestedQuantity: suggestedQuantity,
            estimatedCost: formatPrice(suggestedQuantity * (product.costPrice || 0))
        };
    });
    
    return suggestions;
}

// ============ 实用工具函数 ============

/**
 * 检查产品是否需要补货
 */
function needsReplenishment(product) {
    return product.stock < (product.minStock || 10);
}

/**
 * 获取库存颜色代码
 */
function getStockColorCode(stock, minStock) {
    if (stock <= 0) return '#dc2626'; // 红色 - 缺货
    if (stock < minStock) return '#ea580c'; // 橙色 - 库存不足
    return '#16a34a'; // 绿色 - 充足
}

/**
 * 获取产品利润级别
 */
function getProfitLevel(product) {
    if (!product.price || !product.costPrice) return '未知';
    
    const margin = ((product.price - product.costPrice) / product.price) * 100;
    
    if (margin >= 50) return '高利润';
    if (margin >= 30) return '中利润';
    if (margin >= 10) return '低利润';
    return '亏本';
}

/**
 * 创建库存预警规则
 */
function createStockAlert(product, alertThreshold) {
    const percentageUsed = ((product.stock - alertThreshold) / alertThreshold * 100).toFixed(1);
    
    if (product.stock <= 0) {
        return { level: 'critical', message: '缺货', color: 'red' };
    } else if (product.stock <= alertThreshold) {
        return { level: 'warning', message: `库存即将不足 (${percentageUsed}%)`, color: 'orange' };
    } else {
        return { level: 'normal', message: '库存充足', color: 'green' };
    }
}

/**
 * 销售速率计算（需要销售历史数据）
 */
function calculateSalesVelocity(product, unitsSoldLast30Days) {
    if (unitsSoldLast30Days === 0) return { daysToStockout: Infinity, message: '暂无销售' };
    
    const daysToStockout = (product.stock / (unitsSoldLast30Days / 30)).toFixed(1);
    
    return {
        averageDailyRate: (unitsSoldLast30Days / 30).toFixed(1),
        daysToStockout: daysToStockout,
        message: `按当前销售速率，库存可维持 ${daysToStockout} 天`
    };
}

// ============ 导出所有快速参考函数 ============
window.productQuickRef = {
    // 快速加载
    quickLoadAllProducts,
    quickLoadActiveProducts,
    quickSearchProducts,
    quickLoadByCategory,
    quickGetLowStockProducts,
    
    // 快速库存操作
    quickStockIn,
    quickStockOut,
    quickAdjustStock,
    
    // 快速产品操作
    quickViewProduct,
    quickGetStats,
    quickGetCategoryStats,
    
    // 快速分类操作
    quickGetCategories,
    quickGetCategoryTree,
    quickGetSubcategories,
    
    // 场景示例
    renderProductTableExample,
    checkLowStockAndNotify,
    calculateProductProfit,
    calculateInventoryValue,
    batchStockIn,
    batchUpdateStatus,
    searchWithFilters,
    exportProductsToCSV,
    generateInventoryReport,
    getReplenishmentSuggestions,
    
    // 实用工具
    needsReplenishment,
    getStockColorCode,
    getProfitLevel,
    createStockAlert,
    calculateSalesVelocity
};
