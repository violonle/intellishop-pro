/**
 * ShopPro 产品管理前后端集成脚本
 * 提供所有产品相关的API包装函数和UI交互功能
 * @version 1.0.0
 */

// ==================== 产品管理 API ====================

/**
 * 加载产品列表
 * @param {string} filter - 筛选条件：all|active|inactive|low-stock
 * @param {string} keyword - 搜索关键词
 * @param {string} categoryId - 分类ID
 * @param {number} page - 页码，默认为1
 * @returns {Promise<Object>} 包含products数组、total总数、分页信息
 */
async function loadProducts(filter = 'all', keyword = '', categoryId = '', page = 1) {
    try {
        const params = {
            pageNo: page,
            pageSize: 10
        };

        // 应用筛选条件
        if (filter === 'active') {
            params.status = 'active';
        } else if (filter === 'inactive') {
            params.status = 'inactive';
        } else if (filter === 'low-stock') {
            params.lowStock = true;
        }

        // 如果指定分类，添加分类参数
        if (categoryId) {
            params.categoryId = categoryId;
        }

        // 如果有搜索关键词，使用搜索API
        if (keyword.trim()) {
            const response = await window.api.products.search(keyword, params);
            return {
                products: response.records || response.data || [],
                total: response.total || 0,
                pageNo: page,
                pageSize: 10
            };
        }

        // 否则使用列表API
        const response = await window.api.products.list(params);
        return {
            products: response.records || response.data || [],
            total: response.total || 0,
            pageNo: page,
            pageSize: 10
        };
    } catch (error) {
        console.error('加载产品列表失败:', error);
        if (window.UI && window.UI.showMessage) {
            UI.showMessage('加载产品列表失败：' + (error.message || '未知错误'), 'danger');
        }
        return null;
    }
}

/**
 * 获取产品详情
 * @param {number} productId - 产品ID
 * @returns {Promise<Object>} 产品详细信息
 */
async function getProductDetail(productId) {
    try {
        const response = await window.api.products.get(productId);
        return response || null;
    } catch (error) {
        console.error('获取产品详情失败:', error);
        if (window.UI && window.UI.showMessage) {
            UI.showMessage('获取产品详情失败', 'danger');
        }
        return null;
    }
}

/**
 * 创建新产品
 * @param {Object} productData - 产品信息
 * @returns {Promise<Object>} 创建后的产品对象
 */
async function createProduct(productData) {
    try {
        // 验证必填字段
        if (!productData.productName || !productData.sku) {
            if (window.UI && window.UI.showMessage) {
                UI.showMessage('请填写产品名称和SKU', 'warning');
            }
            return null;
        }

        const response = await window.api.products.create(productData);
        
        if (window.UI && window.UI.showMessage) {
            UI.showMessage('产品创建成功', 'success');
        }
        
        return response;
    } catch (error) {
        console.error('创建产品失败:', error);
        if (window.UI && window.UI.showMessage) {
            UI.showMessage('创建产品失败：' + (error.message || '未知错误'), 'danger');
        }
        return null;
    }
}

/**
 * 更新产品信息
 * @param {number} productId - 产品ID
 * @param {Object} updateData - 需要更新的数据
 * @returns {Promise<Object>} 更新后的产品对象
 */
async function updateProduct(productId, updateData) {
    try {
        const response = await window.api.products.update(productId, updateData);
        
        if (window.UI && window.UI.showMessage) {
            UI.showMessage('产品信息更新成功', 'success');
        }
        
        return response;
    } catch (error) {
        console.error('更新产品失败:', error);
        if (window.UI && window.UI.showMessage) {
            UI.showMessage('更新产品失败：' + (error.message || '未知错误'), 'danger');
        }
        return null;
    }
}

/**
 * 删除产品
 * @param {number} productId - 产品ID
 * @param {boolean} confirm - 是否需要确认对话框
 * @returns {Promise<boolean>} 删除是否成功
 */
async function deleteProduct(productId, confirm = true) {
    try {
        // 显示确认对话框
        if (confirm) {
            const confirmed = window.confirm('确定要删除这个产品吗？此操作无法撤销。');
            if (!confirmed) {
                return false;
            }
        }

        await window.api.products.delete(productId);
        
        if (window.UI && window.UI.showMessage) {
            UI.showMessage('产品删除成功', 'success');
        }
        
        return true;
    } catch (error) {
        console.error('删除产品失败:', error);
        if (window.UI && window.UI.showMessage) {
            UI.showMessage('删除产品失败：' + (error.message || '未知错误'), 'danger');
        }
        return false;
    }
}

/**
 * 复制产品
 * @param {number} productId - 源产品ID
 * @returns {Promise<Object>} 新创建的产品对象
 */
async function duplicateProduct(productId) {
    try {
        const sourceProduct = await getProductDetail(productId);
        if (!sourceProduct) {
            return null;
        }

        // 移除ID和时间戳，准备新产品数据
        const newProductData = { ...sourceProduct };
        delete newProductData.id;
        delete newProductData.productId;
        delete newProductData.createdAt;
        delete newProductData.updatedAt;
        
        // 修改名称和SKU，表示这是复制的产品
        newProductData.productName = sourceProduct.productName + ' (副本)';
        newProductData.sku = sourceProduct.sku + '-copy-' + Date.now();

        return await createProduct(newProductData);
    } catch (error) {
        console.error('复制产品失败:', error);
        if (window.UI && window.UI.showMessage) {
            UI.showMessage('复制产品失败：' + (error.message || '未知错误'), 'danger');
        }
        return null;
    }
}

// ==================== 产品库存管理 ====================

/**
 * 更新产品库存
 * @param {number} productId - 产品ID
 * @param {number} quantity - 数量变化（正数表示入库，负数表示出库）
 * @param {string} type - 库存操作类型：in|out|adjust
 * @param {string} remark - 备注
 * @returns {Promise<Object>} 更新后的库存信息
 */
async function updateProductStock(productId, quantity, type = 'adjust', remark = '') {
    try {
        const stockData = {
            quantity,
            type,
            remark
        };

        // 使用通用的库存更新API或使用特定的库存操作API
        const response = await window.api.products.updateStock(productId, stockData);
        
        if (window.UI && window.UI.showMessage) {
            UI.showMessage('库存更新成功', 'success');
        }
        
        return response;
    } catch (error) {
        console.error('库存更新失败:', error);
        if (window.UI && window.UI.showMessage) {
            UI.showMessage('库存更新失败：' + (error.message || '未知错误'), 'danger');
        }
        return null;
    }
}

/**
 * 获取产品库存记录
 * @param {number} productId - 产品ID
 * @param {number} page - 页码
 * @returns {Promise<Object>} 库存记录列表
 */
async function getStockHistory(productId, page = 1) {
    try {
        // 如果API中有专门的库存记录查询
        // 可以添加到api-client.js中，例如：getStockHistory: (id, params) => ...
        const response = await window.api.get(`${window.api.apiURL}/products/${productId}/stock-history`, {
            pageNo: page,
            pageSize: 10
        });
        
        return {
            records: response.records || response.data || [],
            total: response.total || 0,
            pageNo: page,
            pageSize: 10
        };
    } catch (error) {
        console.error('获取库存记录失败:', error);
        return null;
    }
}

/**
 * 入库操作
 * @param {number} productId - 产品ID
 * @param {number} quantity - 入库数量
 * @param {string} remark - 备注
 * @returns {Promise<Object>} 操作结果
 */
async function stockIn(productId, quantity, remark = '') {
    return await updateProductStock(productId, quantity, 'in', remark);
}

/**
 * 出库操作
 * @param {number} productId - 产品ID
 * @param {number} quantity - 出库数量
 * @param {string} remark - 备注
 * @returns {Promise<Object>} 操作结果
 */
async function stockOut(productId, quantity, remark = '') {
    return await updateProductStock(productId, -quantity, 'out', remark);
}

/**
 * 库存调整
 * @param {number} productId - 产品ID
 * @param {number} newQuantity - 调整后的数量（绝对值）
 * @param {string} remark - 备注
 * @returns {Promise<Object>} 操作结果
 */
async function adjustStock(productId, newQuantity, remark = '') {
    try {
        const currentProduct = await getProductDetail(productId);
        if (!currentProduct) {
            return null;
        }

        const currentStock = currentProduct.stock || currentProduct.currentStock || 0;
        const quantityDiff = newQuantity - currentStock;

        return await updateProductStock(productId, quantityDiff, 'adjust', remark);
    } catch (error) {
        console.error('库存调整失败:', error);
        if (window.UI && window.UI.showMessage) {
            UI.showMessage('库存调整失败', 'danger');
        }
        return null;
    }
}

// ==================== 产品分类管理 ====================

/**
 * 加载所有产品分类
 * @param {boolean} tree - 是否返回树形结构
 * @returns {Promise<Object[]>} 分类列表或树形分类
 */
async function loadProductCategories(tree = false) {
    try {
        let response;
        
        if (tree) {
            // 获取树形分类结构
            response = await window.api.productCategories.getTree();
        } else {
            // 获取平面分类列表
            response = await window.api.productCategories.list({ pageNo: 1, pageSize: 100 });
        }
        
        return response.data || response.records || response || [];
    } catch (error) {
        console.error('加载产品分类失败:', error);
        return [];
    }
}

/**
 * 获取分类详情
 * @param {number} categoryId - 分类ID
 * @returns {Promise<Object>} 分类信息
 */
async function getProductCategory(categoryId) {
    try {
        const response = await window.api.productCategories.get(categoryId);
        return response || null;
    } catch (error) {
        console.error('获取分类详情失败:', error);
        return null;
    }
}

/**
 * 创建产品分类
 * @param {Object} categoryData - 分类信息
 * @returns {Promise<Object>} 创建后的分类
 */
async function createProductCategory(categoryData) {
    try {
        if (!categoryData.categoryName) {
            if (window.UI && window.UI.showMessage) {
                UI.showMessage('请填写分类名称', 'warning');
            }
            return null;
        }

        const response = await window.api.productCategories.create(categoryData);
        
        if (window.UI && window.UI.showMessage) {
            UI.showMessage('分类创建成功', 'success');
        }
        
        return response;
    } catch (error) {
        console.error('创建分类失败:', error);
        if (window.UI && window.UI.showMessage) {
            UI.showMessage('创建分类失败：' + (error.message || '未知错误'), 'danger');
        }
        return null;
    }
}

/**
 * 更新产品分类
 * @param {number} categoryId - 分类ID
 * @param {Object} updateData - 更新数据
 * @returns {Promise<Object>} 更新后的分类
 */
async function updateProductCategory(categoryId, updateData) {
    try {
        const response = await window.api.productCategories.update(categoryId, updateData);
        
        if (window.UI && window.UI.showMessage) {
            UI.showMessage('分类更新成功', 'success');
        }
        
        return response;
    } catch (error) {
        console.error('更新分类失败:', error);
        if (window.UI && window.UI.showMessage) {
            UI.showMessage('更新分类失败：' + (error.message || '未知错误'), 'danger');
        }
        return null;
    }
}

/**
 * 删除产品分类
 * @param {number} categoryId - 分类ID
 * @returns {Promise<boolean>} 删除是否成功
 */
async function deleteProductCategory(categoryId) {
    try {
        const confirmed = window.confirm('确定要删除这个分类吗？');
        if (!confirmed) {
            return false;
        }

        await window.api.productCategories.delete(categoryId);
        
        if (window.UI && window.UI.showMessage) {
            UI.showMessage('分类删除成功', 'success');
        }
        
        return true;
    } catch (error) {
        console.error('删除分类失败:', error);
        if (window.UI && window.UI.showMessage) {
            UI.showMessage('删除分类失败：' + (error.message || '未知错误'), 'danger');
        }
        return false;
    }
}

/**
 * 获取分类下的子分类
 * @param {number} parentId - 父分类ID
 * @returns {Promise<Object[]>} 子分类列表
 */
async function getProductCategoryChildren(parentId) {
    try {
        const response = await window.api.productCategories.getChildren(parentId);
        return response.data || response || [];
    } catch (error) {
        console.error('获取子分类失败:', error);
        return [];
    }
}

// ==================== 产品统计 ====================

/**
 * 获取产品统计信息
 * @returns {Promise<Object>} 统计数据
 */
async function getProductStatistics() {
    try {
        const response = await window.api.products.getStats();
        return response || {
            totalProducts: 0,
            activeProducts: 0,
            inactiveProducts: 0,
            lowStockCount: 0,
            totalCategories: 0,
            averagePrice: 0,
            totalStock: 0
        };
    } catch (error) {
        console.error('获取产品统计失败:', error);
        return null;
    }
}

/**
 * 按分类统计产品数量
 * @returns {Promise<Object[]>} 分类统计数据
 */
async function getProductStatisticsByCategory() {
    try {
        const categories = await loadProductCategories();
        const stats = [];

        for (const category of categories) {
            const products = await window.api.products.getByCategory(category.id || category.categoryId, {
                pageNo: 1,
                pageSize: 1000
            });
            
            stats.push({
                categoryId: category.id || category.categoryId,
                categoryName: category.categoryName,
                productCount: products.total || 0,
                totalStock: (products.records || []).reduce((sum, p) => sum + (p.stock || 0), 0)
            });
        }

        return stats;
    } catch (error) {
        console.error('获取分类统计失败:', error);
        return [];
    }
}

/**
 * 获取库存预警产品
 * @returns {Promise<Object[]>} 库存预警产品列表
 */
async function getLowStockProducts() {
    try {
        const response = await loadProducts('low-stock');
        return response?.products || [];
    } catch (error) {
        console.error('获取库存预警产品失败:', error);
        return [];
    }
}

// ==================== 数据格式化辅助函数 ====================

/**
 * 格式化产品状态
 * @param {string} status - 状态值
 * @returns {Object} 格式化后的状态对象
 */
function formatProductStatus(status) {
    const statusMap = {
        'active': { label: '在售', class: 'bg-green-100 text-green-800' },
        'inactive': { label: '下架', class: 'bg-gray-100 text-gray-800' },
        'pre_sale': { label: '预售', class: 'bg-blue-100 text-blue-800' },
        'discontinued': { label: '停售', class: 'bg-red-100 text-red-800' }
    };
    
    return statusMap[status] || { label: status, class: 'bg-gray-100 text-gray-800' };
}

/**
 * 格式化库存状态
 * @param {number} stock - 当前库存
 * @param {number} minStock - 最低库存阈值
 * @returns {Object} 格式化后的库存状态
 */
function formatStockStatus(stock, minStock = 10) {
    if (stock <= 0) {
        return { label: '缺货', class: 'text-red-600', icon: '⚠️' };
    } else if (stock < minStock) {
        return { label: '库存不足', class: 'text-orange-600', icon: '⚠️' };
    } else {
        return { label: '充足', class: 'text-green-600', icon: '✓' };
    }
}

/**
 * 格式化价格
 * @param {number} price - 价格值
 * @returns {string} 格式化后的价格字符串
 */
function formatPrice(price) {
    if (typeof price !== 'number') {
        return '¥0.00';
    }
    return `¥${price.toFixed(2)}`;
}

/**
 * 格式化产品信息用于显示
 * @param {Object} product - 产品对象
 * @returns {Object} 格式化后的产品对象
 */
function formatProductForDisplay(product) {
    return {
        ...product,
        statusDisplay: formatProductStatus(product.status),
        stockStatusDisplay: formatStockStatus(product.stock, product.minStock),
        priceDisplay: formatPrice(product.price),
        costDisplay: formatPrice(product.costPrice),
        profitMargin: product.price && product.costPrice ? 
            (((product.price - product.costPrice) / product.price) * 100).toFixed(1) + '%' : 'N/A'
    };
}

// ==================== UI交互函数 ====================

/**
 * 打开新增产品模态框
 */
function openAddProductModal() {
    if (window.Modal && window.Modal.show) {
        window.Modal.show('productModal', {
            title: '新增产品',
            mode: 'create'
        });
    } else {
        console.warn('Modal组件未加载');
    }
}

/**
 * 打开编辑产品模态框
 * @param {number} productId - 产品ID
 */
async function openEditProductModal(productId) {
    try {
        const product = await getProductDetail(productId);
        if (!product) {
            return;
        }

        if (window.Modal && window.Modal.show) {
            window.Modal.show('productModal', {
                title: '编辑产品',
                mode: 'edit',
                data: product
            });
        }
    } catch (error) {
        console.error('打开编辑模态框失败:', error);
    }
}

/**
 * 打开库存操作模态框
 * @param {number} productId - 产品ID
 * @param {string} operationType - 操作类型：in|out|adjust
 */
async function openStockModal(productId, operationType = 'adjust') {
    try {
        const product = await getProductDetail(productId);
        if (!product) {
            return;
        }

        if (window.Modal && window.Modal.show) {
            window.Modal.show('stockModal', {
                title: operationType === 'in' ? '入库' : operationType === 'out' ? '出库' : '调整库存',
                operationType,
                product
            });
        }
    } catch (error) {
        console.error('打开库存模态框失败:', error);
    }
}

/**
 * 刷新产品列表
 */
function refreshProductList() {
    if (window.loadProducts) {
        loadProducts();
    }
}

/**
 * 刷新产品AI建议（如果存在）
 */
async function refreshProductAI() {
    try {
        if (window.UI && window.UI.showLoading) {
            UI.showLoading();
        }

        // 调用AI分析接口（如果后端支持）
        const response = await window.api.get(`${window.api.apiURL}/products/ai-recommendations`);
        
        if (window.UI && window.UI.hideLoading) {
            UI.hideLoading();
        }

        // 更新AI推荐区域
        if (document.getElementById('product-ai-recommendations')) {
            document.getElementById('product-ai-recommendations').innerHTML = 
                formatAIRecommendations(response.recommendations || []);
        }
    } catch (error) {
        console.error('刷新AI建议失败:', error);
        if (window.UI && window.UI.hideLoading) {
            UI.hideLoading();
        }
    }
}

/**
 * 格式化AI推荐结果
 * @param {Array} recommendations - 推荐项目数组
 * @returns {string} 格式化后的HTML
 */
function formatAIRecommendations(recommendations) {
    if (!recommendations || recommendations.length === 0) {
        return '<p class="text-gray-500">暂无推荐建议</p>';
    }

    return recommendations.map(rec => `
        <div class="mb-3 pb-3 border-b border-gray-300 last:border-b-0">
            <p class="font-medium text-gray-900">${rec.title || '产品建议'}</p>
            <p class="text-sm text-gray-600">${rec.description || ''}</p>
            ${rec.action ? `<button class="text-sm text-primary hover:underline mt-1">${rec.action}</button>` : ''}
        </div>
    `).join('');
}

/**
 * 切换产品编辑模式（查看/编辑）
 */
function toggleEdit() {
    const editBtn = document.getElementById('editBtn');
    const form = document.querySelector('form');
    
    if (form) {
        const isReadonly = form.querySelector('input[readonly]');
        const inputs = form.querySelectorAll('input, textarea, select');
        
        if (isReadonly) {
            // 切换到编辑模式
            inputs.forEach(input => input.removeAttribute('readonly', 'disabled'));
            editBtn.textContent = '保存';
            editBtn.onclick = saveProductChanges;
        } else {
            // 切换回查看模式
            inputs.forEach(input => {
                input.setAttribute('readonly', '');
                input.disabled = true;
            });
            editBtn.textContent = '编辑产品';
            editBtn.onclick = toggleEdit;
        }
    }
}

/**
 * 保存产品更改
 */
async function saveProductChanges() {
    try {
        const productId = new URLSearchParams(window.location.search).get('id');
        if (!productId) {
            if (window.UI && window.UI.showMessage) {
                UI.showMessage('产品ID不存在', 'warning');
            }
            return;
        }

        const form = document.querySelector('form');
        const formData = new FormData(form);
        const updateData = Object.fromEntries(formData);

        const success = await updateProduct(productId, updateData);
        if (success) {
            // 恢复查看模式
            const inputs = form.querySelectorAll('input, textarea, select');
            inputs.forEach(input => {
                input.setAttribute('readonly', '');
                input.disabled = true;
            });
            const editBtn = document.getElementById('editBtn');
            editBtn.textContent = '编辑产品';
            editBtn.onclick = toggleEdit;
        }
    } catch (error) {
        console.error('保存产品更改失败:', error);
    }
}

// 导出所有函数供页面使用
window.productIntegration = {
    // 产品CRUD
    loadProducts,
    getProductDetail,
    createProduct,
    updateProduct,
    deleteProduct,
    duplicateProduct,
    
    // 库存管理
    updateProductStock,
    getStockHistory,
    stockIn,
    stockOut,
    adjustStock,
    
    // 分类管理
    loadProductCategories,
    getProductCategory,
    createProductCategory,
    updateProductCategory,
    deleteProductCategory,
    getProductCategoryChildren,
    
    // 统计
    getProductStatistics,
    getProductStatisticsByCategory,
    getLowStockProducts,
    
    // 格式化
    formatProductStatus,
    formatStockStatus,
    formatPrice,
    formatProductForDisplay,
    formatAIRecommendations,
    
    // UI交互
    openAddProductModal,
    openEditProductModal,
    openStockModal,
    refreshProductList,
    refreshProductAI,
    toggleEdit,
    saveProductChanges
};
