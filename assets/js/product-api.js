/**
 * Product页面 API集成脚本
 * 处理与products API的所有交互
 * @version 1.0.0
 */

class ProductAPIManager {
    constructor() {
        this.currentPage = 1;
        this.pageSize = 12;
        this.filters = {};
        this.currentView = 'grid';
    }

    /**
     * 加载产品列表
     * @param {Object} options - 查询选项
     */
    async loadProducts(options = {}) {
        try {
            UI.showLoading('正在加载产品数据...');
            
            const queryParams = {
                page: options.page || this.currentPage,
                pageSize: options.pageSize || this.pageSize,
                ...this.filters
            };

            // 调用API获取产品列表
            const response = await api.products.list(queryParams);
            const products = response.data || response;

            // 缓存当前页码
            this.currentPage = queryParams.page;

            return products;
        } catch (error) {
            console.error('加载产品列表失败:', error);
            UI.showMessage('加载产品数据失败: ' + error.message, 'error');
            throw error;
        } finally {
            UI.hideLoading();
        }
    }

    /**
     * 搜索产品
     * @param {string} keyword - 搜索关键词
     */
    async searchProducts(keyword) {
        try {
            if (!keyword || keyword.trim().length === 0) {
                return await this.loadProducts();
            }

            UI.showLoading('正在搜索...');
            
            const response = await api.products.search(keyword, 1, this.pageSize);
            return response.data || response;
        } catch (error) {
            console.error('搜索产品失败:', error);
            UI.showMessage('搜索失败: ' + error.message, 'error');
            throw error;
        } finally {
            UI.hideLoading();
        }
    }

    /**
     * 创建产品
     * @param {Object} productData - 产品数据
     */
    async createProduct(productData) {
        try {
            UI.showLoading('正在创建产品...');
            
            const response = await api.products.create({
                name: productData.name,
                sku: productData.sku,
                categoryId: productData.categoryId,
                brand: productData.brand,
                price: parseFloat(productData.price),
                cost: productData.cost ? parseFloat(productData.cost) : null,
                stock: parseInt(productData.stock),
                minStock: productData.minStock ? parseInt(productData.minStock) : null,
                description: productData.description,
                images: productData.images || [],
                status: productData.status || 'active'
            });

            UI.showMessage('产品创建成功', 'success');
            return response;
        } catch (error) {
            console.error('创建产品失败:', error);
            UI.showMessage('创建产品失败: ' + error.message, 'error');
            throw error;
        } finally {
            UI.hideLoading();
        }
    }

    /**
     * 更新产品
     * @param {number} productId - 产品ID
     * @param {Object} productData - 更新的产品数据
     */
    async updateProduct(productId, productData) {
        try {
            UI.showLoading('正在更新产品...');
            
            const response = await api.products.update(productId, productData);
            
            UI.showMessage('产品更新成功', 'success');
            return response;
        } catch (error) {
            console.error('更新产品失败:', error);
            UI.showMessage('更新产品失败: ' + error.message, 'error');
            throw error;
        } finally {
            UI.hideLoading();
        }
    }

    /**
     * 删除产品
     * @param {number} productId - 产品ID
     */
    async deleteProduct(productId) {
        try {
            const confirmed = confirm('确定要删除这个产品吗？');
            if (!confirmed) return;

            UI.showLoading('正在删除产品...');
            
            const response = await api.products.delete(productId);
            
            UI.showMessage('产品删除成功', 'success');
            return response;
        } catch (error) {
            console.error('删除产品失败:', error);
            UI.showMessage('删除产品失败: ' + error.message, 'error');
            throw error;
        } finally {
            UI.hideLoading();
        }
    }

    /**
     * 更新产品库存
     * @param {number} productId - 产品ID
     * @param {number} quantity - 库存数量
     */
    async updateStock(productId, quantity) {
        try {
            UI.showLoading('正在更新库存...');
            
            const response = await api.products.updateStock(productId, quantity);
            
            UI.showMessage('库存更新成功', 'success');
            return response;
        } catch (error) {
            console.error('更新库存失败:', error);
            UI.showMessage('更新库存失败: ' + error.message, 'error');
            throw error;
        } finally {
            UI.hideLoading();
        }
    }

    /**
     * 获取产品详情
     * @param {number} productId - 产品ID
     */
    async getProductDetail(productId) {
        try {
            const response = await api.products.get(productId);
            return response;
        } catch (error) {
            console.error('获取产品详情失败:', error);
            UI.showMessage('获取产品详情失败: ' + error.message, 'error');
            throw error;
        }
    }

    /**
     * 获取产品分类
     */
    async getCategories() {
        try {
            const response = await api.productCategories.list({ pageSize: 100 });
            return response.data || response;
        } catch (error) {
            console.error('获取产品分类失败:', error);
            return [];
        }
    }

    /**
     * 获取产品统计信息
     */
    async getProductStats() {
        try {
            const response = await api.products.getStats();
            return response;
        } catch (error) {
            console.error('获取产品统计失败:', error);
            return null;
        }
    }

    /**
     * 获取库存预警产品
     */
    async getLowStockProducts() {
        try {
            UI.showLoading('正在加载库存预警产品...');
            
            const response = await api.products.list({
                page: 1,
                pageSize: 100,
                status: 'low_stock'
            });
            
            return response.data || response;
        } catch (error) {
            console.error('获取库存预警产品失败:', error);
            UI.showMessage('加载失败: ' + error.message, 'error');
            return [];
        } finally {
            UI.hideLoading();
        }
    }

    /**
     * 获取热销产品
     */
    async getTopProducts() {
        try {
            const response = await api.products.list({
                page: 1,
                pageSize: 10,
                sortBy: 'sales',
                order: 'desc'
            });
            
            return response.data || response;
        } catch (error) {
            console.error('获取热销产品失败:', error);
            return [];
        }
    }

    /**
     * 按分类获取产品
     * @param {number} categoryId - 分类ID
     */
    async getProductsByCategory(categoryId) {
        try {
            const response = await api.products.getByCategory(categoryId, {
                page: 1,
                pageSize: this.pageSize
            });
            
            return response.data || response;
        } catch (error) {
            console.error('获取分类产品失败:', error);
            return [];
        }
    }

    /**
     * 设置筛选条件
     * @param {Object} filters - 筛选条件
     */
    setFilters(filters) {
        this.filters = filters;
        this.currentPage = 1;
    }

    /**
     * 清空筛选条件
     */
    clearFilters() {
        this.filters = {};
        this.currentPage = 1;
    }

    /**
     * 获取产品AI建议
     */
    async getProductAIRecommendations() {
        try {
            // 首先获取产品统计
            const stats = await this.getProductStats();
            
            // 获取库存预警产品
            const lowStockProducts = await this.getLowStockProducts();
            
            // 获取热销产品
            const topProducts = await this.getTopProducts();
            
            // 组合AI建议
            const recommendations = [];
            
            // 库存建议
            if (lowStockProducts && lowStockProducts.length > 0) {
                recommendations.push({
                    type: 'warning',
                    icon: '🔥',
                    title: '库存预警',
                    message: `检测到 ${lowStockProducts.length} 个产品库存不足，建议尽快补货`,
                    action: 'showLowStockProducts'
                });
            }
            
            // 热销建议
            if (topProducts && topProducts.length > 0) {
                recommendations.push({
                    type: 'success',
                    icon: '📈',
                    title: '热销分析',
                    message: `${topProducts[0]?.name || '产品'} 本月销量最高，建议增加库存`,
                    action: 'showTopProducts'
                });
            }
            
            return recommendations;
        } catch (error) {
            console.error('获取AI建议失败:', error);
            return [];
        }
    }

    /**
     * 批量导入产品
     * @param {File} file - CSV/Excel文件
     */
    async importProducts(file) {
        try {
            UI.showLoading('正在导入产品...');
            
            const formData = new FormData();
            formData.append('file', file);
            
            const response = await api.files.upload(file, 'product', null);
            
            UI.showMessage('产品导入成功', 'success');
            return response;
        } catch (error) {
            console.error('产品导入失败:', error);
            UI.showMessage('产品导入失败: ' + error.message, 'error');
            throw error;
        } finally {
            UI.hideLoading();
        }
    }

    /**
     * 导出产品数据
     * @param {string} format - 导出格式 (csv/excel)
     */
    async exportProducts(format = 'csv') {
        try {
            UI.showLoading('正在导出产品...');
            
            // 构建导出URL
            const exportUrl = `${api.apiURL}/products/export?format=${format}`;
            
            // 触发下载
            window.location.href = exportUrl;
            
            UI.showMessage('产品导出成功', 'success');
        } catch (error) {
            console.error('产品导出失败:', error);
            UI.showMessage('产品导出失败: ' + error.message, 'error');
        } finally {
            UI.hideLoading();
        }
    }
}

// 导出全局实例
window.productManager = new ProductAPIManager();
