# 产品管理页面前后端集成指南

## 概述

本指南说明如何在产品管理相关的 HTML 页面中集成 `product-integration.js` 脚本，以实现与后端 API 的无缝连接。

## 快速开始

### 1. 引入脚本

在 HTML 页面的 `<head>` 或 `<body>` 末尾引入集成脚本：

```html
<!-- API 客户端（必须） -->
<script src="../assets/js/api-client.js"></script>

<!-- 产品集成脚本 -->
<script src="../assets/js/product-integration.js"></script>
```

### 2. 初始化页面

页面加载时，调用相应的初始化函数来加载数据：

```javascript
// 页面加载完成后
document.addEventListener('DOMContentLoaded', async function() {
    // 加载产品统计数据
    const stats = await getProductStatistics();
    updateStatsDisplay(stats);
    
    // 加载产品列表
    const productList = await loadProducts('all', '', '', 1);
    renderProductList(productList.products);
    
    // 加载分类列表
    const categories = await loadProductCategories();
    renderCategoryFilter(categories);
});
```

## API 函数参考

### 产品 CRUD 操作

#### 加载产品列表
```javascript
// 基础用法
const result = await loadProducts(
    filter = 'all',      // 筛选：all|active|inactive|low-stock
    keyword = '',        // 搜索关键词
    categoryId = '',     // 分类ID
    page = 1             // 页码
);

// 示例
const products = await loadProducts('active', '笔记本', '5', 1);
console.log(products.products);  // 产品数组
console.log(products.total);     // 总数
```

#### 获取产品详情
```javascript
const product = await getProductDetail(productId);
// 返回完整的产品对象
```

#### 创建产品
```javascript
const newProduct = await createProduct({
    productName: '新产品',
    sku: 'SKU-001',
    categoryId: 1,
    price: 99.99,
    costPrice: 50.00,
    stock: 100,
    minStock: 10,
    description: '产品描述',
    brand: '品牌名'
});
```

#### 更新产品
```javascript
const updated = await updateProduct(productId, {
    productName: '更新后的名称',
    price: 129.99,
    status: 'active'
});
```

#### 删除产品
```javascript
// 会弹出确认对话框
const success = await deleteProduct(productId);

// 跳过确认对话框
const success = await deleteProduct(productId, false);
```

#### 复制产品
```javascript
// 基于现有产品创建副本
const copied = await duplicateProduct(sourceProductId);
```

### 库存管理

#### 入库
```javascript
const result = await stockIn(
    productId,
    quantity,
    remark = '入库原因'
);
```

#### 出库
```javascript
const result = await stockOut(
    productId,
    quantity,
    remark = '出库原因'
);
```

#### 调整库存
```javascript
// 直接设置库存数量
const result = await adjustStock(
    productId,
    newQuantity,
    remark = '调整原因'
);
```

#### 获取库存记录
```javascript
const history = await getStockHistory(productId, page = 1);
console.log(history.records);  // 库存记录数组
```

#### 通用库存更新
```javascript
const result = await updateProductStock(
    productId,
    quantity,
    type = 'adjust',  // in|out|adjust
    remark = ''
);
```

### 分类管理

#### 加载分类
```javascript
// 平面列表
const categories = await loadProductCategories(false);

// 树形结构
const categoryTree = await loadProductCategories(true);
```

#### 获取分类详情
```javascript
const category = await getProductCategory(categoryId);
```

#### 创建分类
```javascript
const newCategory = await createProductCategory({
    categoryName: '新分类',
    parentId: 0,  // 0表示顶级分类
    description: '分类描述'
});
```

#### 更新分类
```javascript
const updated = await updateProductCategory(categoryId, {
    categoryName: '更新的分类名'
});
```

#### 删除分类
```javascript
const success = await deleteProductCategory(categoryId);
```

#### 获取子分类
```javascript
const children = await getProductCategoryChildren(parentId);
```

### 统计功能

#### 获取产品统计
```javascript
const stats = await getProductStatistics();
// 返回：{
//   totalProducts: 1247,
//   activeProducts: 892,
//   inactiveProducts: 355,
//   lowStockCount: 23,
//   totalCategories: 15,
//   averagePrice: 299.50,
//   totalStock: 50000
// }
```

#### 按分类统计
```javascript
const categoryStats = await getProductStatisticsByCategory();
// 返回：[
//   { categoryId: 1, categoryName: '电子产品', productCount: 120, totalStock: 5000 },
//   ...
// ]
```

#### 获取库存预警产品
```javascript
const lowStockProducts = await getLowStockProducts();
```

## 数据格式化函数

### 格式化产品状态
```javascript
const statusDisplay = formatProductStatus('active');
// 返回：{ label: '在售', class: 'bg-green-100 text-green-800' }

// 在 HTML 中使用
<span class="${statusDisplay.class}">${statusDisplay.label}</span>
```

### 格式化库存状态
```javascript
const stockStatus = formatStockStatus(5, 10);  // 库存5，最低阈值10
// 返回：{ label: '库存不足', class: 'text-orange-600', icon: '⚠️' }
```

### 格式化价格
```javascript
const priceStr = formatPrice(99.99);
// 返回：'¥99.99'
```

### 完整格式化产品
```javascript
const formattedProduct = formatProductForDisplay(product);
// 返回增强的产品对象，包含所有格式化的显示字段
```

## UI 交互函数

### 打开新增产品对话框
```javascript
openAddProductModal();
```

### 打开编辑产品对话框
```javascript
openEditProductModal(productId);
```

### 打开库存操作对话框
```javascript
// 入库
openStockModal(productId, 'in');

// 出库
openStockModal(productId, 'out');

// 调整
openStockModal(productId, 'adjust');
```

### 刷新产品列表
```javascript
refreshProductList();
```

### 刷新AI建议
```javascript
refreshProductAI();
```

### 切换编辑模式
```javascript
toggleEdit();
```

### 保存产品更改
```javascript
saveProductChanges();
```

## 完整集成示例

### 产品列表页面 (product-management.html)

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <title>产品管理</title>
    <link rel="stylesheet" href="../assets/global-styles.css">
</head>
<body>
    <!-- 统计卡片 -->
    <div id="statsContainer" class="grid grid-cols-4 gap-4 mb-8">
        <!-- 由 JavaScript 动态生成 -->
    </div>

    <!-- 搜索和筛选 -->
    <input type="text" id="productSearch" placeholder="搜索产品...">
    <select id="categoryFilter">
        <option value="">全部分类</option>
    </select>

    <!-- 产品列表 -->
    <table id="productTable">
        <thead>
            <tr>
                <th>产品名称</th>
                <th>SKU</th>
                <th>分类</th>
                <th>价格</th>
                <th>库存</th>
                <th>状态</th>
                <th>操作</th>
            </tr>
        </thead>
        <tbody id="productList"></tbody>
    </table>

    <!-- 分页 -->
    <div id="pagination"></div>

    <script src="../assets/js/api-client.js"></script>
    <script src="../assets/js/product-integration.js"></script>

    <script>
        let currentPage = 1;
        let currentFilter = 'all';
        let currentKeyword = '';
        let currentCategory = '';

        // 初始化页面
        document.addEventListener('DOMContentLoaded', async function() {
            // 加载统计信息
            const stats = await getProductStatistics();
            renderStats(stats);

            // 加载分类
            const categories = await loadProductCategories();
            renderCategoryFilter(categories);

            // 加载产品
            await refreshList();

            // 事件监听
            document.getElementById('productSearch').addEventListener('input', (e) => {
                currentKeyword = e.target.value;
                currentPage = 1;
                refreshList();
            });

            document.getElementById('categoryFilter').addEventListener('change', (e) => {
                currentCategory = e.target.value;
                currentPage = 1;
                refreshList();
            });
        });

        // 刷新列表
        async function refreshList() {
            const result = await loadProducts(currentFilter, currentKeyword, currentCategory, currentPage);
            if (result) {
                renderProductList(result.products);
                renderPagination(result.total, currentPage);
            }
        }

        // 渲染统计信息
        function renderStats(stats) {
            const container = document.getElementById('statsContainer');
            container.innerHTML = `
                <div class="card">
                    <p>产品总数</p>
                    <h3>${stats.totalProducts}</h3>
                </div>
                <div class="card">
                    <p>在售产品</p>
                    <h3>${stats.activeProducts}</h3>
                </div>
                <div class="card">
                    <p>库存不足</p>
                    <h3>${stats.lowStockCount}</h3>
                </div>
                <div class="card">
                    <p>产品分类</p>
                    <h3>${stats.totalCategories}</h3>
                </div>
            `;
        }

        // 渲染分类筛选
        function renderCategoryFilter(categories) {
            const select = document.getElementById('categoryFilter');
            const options = categories.map(cat => 
                `<option value="${cat.id || cat.categoryId}">${cat.categoryName}</option>`
            ).join('');
            select.innerHTML = '<option value="">全部分类</option>' + options;
        }

        // 渲染产品列表
        function renderProductList(products) {
            const tbody = document.getElementById('productList');
            tbody.innerHTML = products.map(product => {
                const status = formatProductStatus(product.status);
                const stockStatus = formatStockStatus(product.stock, product.minStock);
                return `
                    <tr>
                        <td>${product.productName}</td>
                        <td>${product.sku}</td>
                        <td>${product.categoryName || '-'}</td>
                        <td>${formatPrice(product.price)}</td>
                        <td>
                            <span class="${stockStatus.class}">
                                ${stockStatus.icon} ${product.stock}
                            </span>
                        </td>
                        <td><span class="${status.class}">${status.label}</span></td>
                        <td>
                            <button onclick="openEditProductModal(${product.id || product.productId})">编辑</button>
                            <button onclick="duplicateProduct(${product.id || product.productId})">复制</button>
                            <button onclick="deleteProduct(${product.id || product.productId})">删除</button>
                        </td>
                    </tr>
                `;
            }).join('');
        }

        // 渲染分页
        function renderPagination(total, currentPage) {
            const pageSize = 10;
            const totalPages = Math.ceil(total / pageSize);
            const pagination = document.getElementById('pagination');
            
            let html = '';
            for (let i = 1; i <= totalPages; i++) {
                html += `<button ${i === currentPage ? 'disabled' : ''} 
                    onclick="currentPage=${i};refreshList()">
                    ${i}
                </button>`;
            }
            pagination.innerHTML = html;
        }

        // 新增产品
        function addProduct() {
            // 显示新增表单或跳转到详情页
            window.location.href = 'product-detail.html?mode=create';
        }
    </script>
</body>
</html>
```

### 产品详情页面 (product-detail.html)

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <title>产品详情</title>
</head>
<body>
    <!-- 产品基本信息表单 -->
    <form id="productForm">
        <div>
            <label>产品名称</label>
            <input type="text" id="productName" readonly>
        </div>
        <div>
            <label>SKU</label>
            <input type="text" id="productSku" readonly>
        </div>
        <div>
            <label>分类</label>
            <select id="productCategory" disabled></select>
        </div>
        <div>
            <label>价格</label>
            <input type="number" id="productPrice" readonly>
        </div>
        <div>
            <label>成本价</label>
            <input type="number" id="productCost" readonly>
        </div>
        <div>
            <label>当前库存</label>
            <input type="number" id="currentStock" readonly>
        </div>
    </form>

    <!-- 库存操作 -->
    <div id="stockActions">
        <button onclick="openStockModal(getProductId(), 'in')">入库</button>
        <button onclick="openStockModal(getProductId(), 'out')">出库</button>
        <button onclick="openStockModal(getProductId(), 'adjust')">调整</button>
    </div>

    <script src="../assets/js/api-client.js"></script>
    <script src="../assets/js/product-integration.js"></script>

    <script>
        function getProductId() {
            return new URLSearchParams(window.location.search).get('id');
        }

        // 页面加载时获取产品详情
        document.addEventListener('DOMContentLoaded', async function() {
            const productId = getProductId();
            if (productId) {
                const product = await getProductDetail(productId);
                if (product) {
                    fillProductForm(product);
                }
            }
        });

        // 填充表单
        function fillProductForm(product) {
            document.getElementById('productName').value = product.productName;
            document.getElementById('productSku').value = product.sku;
            document.getElementById('productPrice').value = product.price;
            document.getElementById('productCost').value = product.costPrice;
            document.getElementById('currentStock').value = product.stock;
        }

        // 编辑按钮
        function toggleEdit() {
            const inputs = document.querySelectorAll('input, select');
            const isReadonly = inputs[0].readOnly;
            inputs.forEach(input => {
                if (isReadonly) {
                    input.readOnly = false;
                    input.disabled = false;
                } else {
                    input.readOnly = true;
                    input.disabled = true;
                }
            });
        }

        // 保存按钮
        async function saveProduct() {
            const productId = getProductId();
            const updateData = {
                productName: document.getElementById('productName').value,
                price: parseFloat(document.getElementById('productPrice').value),
                costPrice: parseFloat(document.getElementById('productCost').value)
            };

            const success = await updateProduct(productId, updateData);
            if (success) {
                toggleEdit();
            }
        }
    </script>
</body>
</html>
```

## 常见问题

### Q1: 如何处理 API 错误？
```javascript
try {
    const product = await getProductDetail(productId);
    if (!product) {
        console.log('产品不存在');
    }
} catch (error) {
    console.error('获取产品失败:', error);
}
```

### Q2: 如何批量操作？
```javascript
// 批量删除
async function deleteMultiple(productIds) {
    for (const id of productIds) {
        await deleteProduct(id, false);
    }
}

// 批量更新库存
async function updateMultipleStock(products) {
    for (const { id, quantity } of products) {
        await updateProductStock(id, quantity, 'adjust');
    }
}
```

### Q3: 如何与自定义 Modal 组件集成？
```javascript
// 如果使用了自定义 Modal 组件，确保它实现了 window.Modal.show() 方法
window.Modal = {
    show: (modalId, options) => {
        // 你的 Modal 实现
    }
};
```

## 最佳实践

1. **错误处理**：始终检查返回值是否为 null
2. **用户反馈**：在操作后使用 UI.showMessage() 提示用户
3. **防止重复提交**：在异步操作完成前禁用按钮
4. **缓存数据**：对频繁请求的数据进行缓存
5. **分页处理**：合理设置分页大小，避免加载过多数据

## API 端点映射

| 操作 | 方法 | 端点 |
|------|------|------|
| 列表 | GET | `/api/products` |
| 详情 | GET | `/api/products/:id` |
| 创建 | POST | `/api/products` |
| 更新 | PUT | `/api/products/:id` |
| 删除 | DELETE | `/api/products/:id` |
| 搜索 | GET | `/api/products/search?q=keyword` |
| 按分类获取 | GET | `/api/products/category/:categoryId` |
| 库存更新 | POST | `/api/products/:id/stock` |
| 统计 | GET | `/api/products/stats` |
