# ShopPro 产品管理页面 API集成指南

## 概述

本文档详细说明了 `pages/product-management.html` 页面与后端API的集成实现，包括产品列表管理、搜索、创建、编辑、删除等功能的完整API调用流程。

## 架构设计

### 文件结构

```
pages/
├── product-management.html         # 主页面文件
assets/js/
├── api-client.js                   # 全局API客户端
├── product-api.js                  # 产品管理API管理器
├── ui-components.js                # UI组件库
└── utils.js                        # 工具函数
```

### 层级关系

```
product-management.html
   ↓
product-api.js (ProductAPIManager)
   ↓
api-client.js (APIClient)
   ↓
Backend API (/api/products, /api/product-categories)
```

## API集成详情

### 1. 产品列表加载

**函数**: `loadProductsData()`

**流程**:
```javascript
loadProductsData()
  ↓
productManager.loadProducts()
  ↓
api.products.list({ page: 1, pageSize: 12, ...filters })
  ↓
Backend: GET /products
  ↓
renderGridView(products) 或 renderListView(products)
```

**后端端点**: `GET /products`

**查询参数**:
- `page` (默认: 1) - 页码
- `pageSize` (默认: 12) - 每页数量
- `category` - 分类筛选 (可选)
- `status` - 状态筛选 (可选: active, inactive, low_stock, out_of_stock)
- `sortBy` - 排序字段 (可选: name, price, sales)
- `order` - 排序方向 (可选: asc, desc)

**响应示例**:
```json
{
  "code": 0,
  "data": {
    "records": [
      {
        "id": 1,
        "name": "iPhone 15 Pro",
        "sku": "IP15P-256-TB",
        "categoryId": 1,
        "category": "智能手机",
        "brand": "Apple",
        "price": 8999,
        "cost": 6500,
        "stock": 45,
        "minStock": 10,
        "status": "active",
        "image": "https://example.com/image.jpg",
        "description": "产品描述...",
        "createdAt": "2024-01-20T10:00:00Z",
        ...
      }
    ],
    "total": 1247,
    "pages": 104
  },
  "message": "查询成功"
}
```

### 2. 产品搜索

**函数**: `enableSmartSearch()`

**端点**: `GET /products/search?keyword={keyword}`

**使用场景**: 用户在搜索框输入关键词并按Enter

**示例**:
```javascript
const results = await productManager.searchProducts("iPhone");
// 使用搜索结果更新UI
renderGridView(results);
```

### 3. 创建产品

**函数**: `saveProduct()`

**端点**: `POST /products`

**请求体**:
```json
{
  "name": "iPhone 15 Pro",
  "sku": "IP15P-256-TB",
  "categoryId": 1,
  "brand": "Apple",
  "price": 8999,
  "cost": 6500,
  "stock": 45,
  "minStock": 10,
  "description": "全新iPhone 15 Pro，搭载A17 Pro芯片，钛金属设计",
  "images": [],
  "status": "active"
}
```

**验证规则**:
- `name` - 必填，不能为空
- `sku` - 必填，且在系统内唯一
- `price` - 必填，必须为正数
- `stock` - 必填，必须为正整数
- `categoryId` - 可选，需要存在的分类ID

### 4. 编辑产品

**函数**: `editProduct(productId)`

**端点**: `PUT /products/{id}`

**请求体**: 同创建产品，可部分更新

### 5. 删除产品

**函数**: `deleteProduct(productId)`

**端点**: `DELETE /products/{id}`

**确认**: 删除前会弹出确认对话框

### 6. 切换产品状态

**函数**: `toggleProductStatus(productId)`

**端点**: `PUT /products/{id}`

**请求体**:
```json
{
  "status": "inactive"  // 可选值: active, inactive, low_stock, out_of_stock
}
```

### 7. 更新库存

**函数**: `updateStock(productId, quantity)`

**端点**: `POST /products/{id}/stock`

**请求体**:
```json
{
  "quantity": 100  // 新的库存数量
}
```

### 8. 获取产品分类

**函数**: `getCategories()`

**端点**: `GET /product-categories`

**用途**: 初始化分类下拉菜单

### 9. 获取产品统计

**函数**: `getProductStats()`

**端点**: `GET /products/stats`

**响应**:
```json
{
  "totalProducts": 1247,
  "activeProducts": 892,
  "lowStockProducts": 23,
  "outOfStockProducts": 15,
  "totalInventoryValue": 2860000
}
```

### 10. 获取库存预警产品

**函数**: `getLowStockProducts()`

**端点**: `GET /products?status=low_stock&pageSize=100`

**用途**: 在库存预警模态框中显示

### 11. 获取热销产品

**函数**: `getTopProducts()`

**端点**: `GET /products?sortBy=sales&order=desc&pageSize=10`

**用途**: 在热销分析模态框中显示

## 实现细节

### ProductAPIManager 类

位置: `assets/js/product-api.js`

**主要方法**:
```javascript
class ProductAPIManager {
  loadProducts(options)           // 加载产品列表
  searchProducts(keyword)         // 搜索产品
  createProduct(productData)      // 创建产品
  updateProduct(productId, data)  // 更新产品
  deleteProduct(productId)        // 删除产品
  updateStock(productId, qty)     // 更新库存
  getProductDetail(productId)     // 获取详情
  getCategories()                 // 获取分类
  getProductStats()               // 获取统计
  getLowStockProducts()           // 库存预警
  getTopProducts()                // 热销产品
  getProductsByCategory(catId)    // 按分类获取
  getProductAIRecommendations()   // AI建议
  importProducts(file)            // 导入产品
  exportProducts(format)          // 导出产品
  setFilters(filters)             // 设置筛选
  clearFilters()                  // 清空筛选
}
```

### 全局变量

```javascript
let currentView = 'grid';           // 当前视图模式 (grid 或 list)
let productsData = [];              // 缓存的产品数据 (已被API替代)
let productManager = new ProductAPIManager();
```

## 使用示例

### 页面初始化

```javascript
// DOMContentLoaded事件中自动调用
document.addEventListener('DOMContentLoaded', function() {
  // 加载产品数据
  loadProductsData();
  
  // 绑定视图切换
  document.getElementById('gridViewBtn').addEventListener('click', () => switchView('grid'));
  document.getElementById('listViewBtn').addEventListener('click', () => switchView('list'));
  
  // 绑定搜索
  const searchInput = document.getElementById('productSearchInput');
  searchInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
      enableSmartSearch();
    }
  });
});
```

### 创建新产品

```javascript
async function saveProduct() {
  const productData = {
    name: '新产品名称',
    sku: 'SKU-12345',
    categoryId: 1,
    brand: '品牌名',
    price: 9999,
    cost: 5000,
    stock: 100,
    minStock: 20,
    description: '产品描述'
  };
  
  try {
    await productManager.createProduct(productData);
    UI.showMessage('产品创建成功', 'success');
    await loadProductsData(); // 刷新列表
  } catch (error) {
    UI.showMessage('创建失败: ' + error.message, 'error');
  }
}
```

### 搜索产品

```javascript
async function enableSmartSearch() {
  const query = document.getElementById('productSearchInput').value;
  
  try {
    const results = await productManager.searchProducts(query);
    
    if (results.length > 0) {
      renderGridView(results); // 或 renderListView(results)
      UI.showMessage(`找到 ${results.length} 个产品`, 'success');
    } else {
      UI.showMessage('未找到匹配的产品', 'warning');
    }
  } catch (error) {
    UI.showMessage('搜索失败: ' + error.message, 'error');
  }
}
```

### 删除产品

```javascript
async function deleteProduct(productId) {
  try {
    await productManager.deleteProduct(productId);
    UI.showMessage('产品删除成功', 'success');
    await loadProductsData(); // 刷新列表
  } catch (error) {
    console.error('删除失败:', error);
  }
}
```

### 切换产品状态

```javascript
async function toggleProductStatus(productId) {
  try {
    const product = productsData.find(p => p.id === productId);
    const newStatus = product.status === 'active' ? 'inactive' : 'active';
    
    await productManager.updateProduct(productId, { status: newStatus });
    UI.showMessage('状态更新成功', 'success');
    await loadProductsData(); // 刷新列表
  } catch (error) {
    UI.showMessage('更新失败: ' + error.message, 'error');
  }
}
```

## 错误处理

### 统一错误处理

所有API调用都通过 `APIClient` 进行，其中包含：

1. **重试机制** - 失败的请求自动重试3次
2. **超时控制** - 30秒超时
3. **请求拦截** - 自动添加认证token
4. **响应拦截** - 处理401错误

### 常见错误处理

```javascript
try {
  await productManager.createProduct(data);
} catch (error) {
  if (error instanceof APIError) {
    if (error.isAuthError()) {
      // 认证错误 - 重定向登录
      window.location.href = '/pages/login.html';
    } else if (error.isServerError()) {
      // 服务器错误
      UI.showMessage('服务器错误，请稍后重试', 'error');
    } else if (error.isNetworkError()) {
      // 网络错误
      UI.showMessage('网络连接失败', 'error');
    } else {
      // 其他错误
      UI.showMessage('操作失败: ' + error.message, 'error');
    }
  }
}
```

## AI功能集成

### AI产品建议

```javascript
async function refreshProductAI() {
  try {
    const recommendations = await productManager.getProductAIRecommendations();
    
    // 返回格式:
    // [
    //   {
    //     type: 'warning',
    //     icon: '🔥',
    //     title: '库存预警',
    //     message: '检测到 23 个产品库存不足...',
    //     action: 'showLowStockProducts'
    //   },
    //   ...
    // ]
    
    displayRecommendations(recommendations);
  } catch (error) {
    console.error('获取AI建议失败:', error);
  }
}
```

## 视图切换

### 网格视图

显示产品卡片网格，每行显示多个产品。使用 `renderGridView(products)` 渲染。

### 列表视图

显示产品表格，包含详细信息。使用 `renderListView(products)` 渲染。

### 切换逻辑

```javascript
function switchView(view) {
  currentView = view;
  
  if (view === 'grid') {
    renderGridView();
  } else if (view === 'list') {
    renderListView();
  }
}
```

## 后端依赖

### 必需的API端点

| 端点 | 方法 | 说明 |
|-----|------|------|
| `/products` | GET | 产品列表 |
| `/products` | POST | 创建产品 |
| `/products/{id}` | GET | 获取详情 |
| `/products/{id}` | PUT | 更新产品 |
| `/products/{id}` | DELETE | 删除产品 |
| `/products/{id}/stock` | POST | 更新库存 |
| `/products/search` | GET | 搜索产品 |
| `/products/stats` | GET | 产品统计 |
| `/products/category/{id}` | GET | 按分类获取 |
| `/product-categories` | GET | 分类列表 |

### 当前实现状态

✅ ProductController 已完全实现上述所有端点
✅ ProductAPIManager 已完全实现
✅ product-management.html 已完全集成API
✅ 错误处理已完善

## 性能优化

### 缓存策略

1. **当前列表缓存** - `productsData` 变量缓存当前页数据
2. **分页缓存** - 记录当前页码，避免重复加载
3. **分类缓存** - 分类数据只加载一次

### 加载优化

```javascript
async function loadProductsData() {
  try {
    // 1. 显示加载状态
    UI.showLoading('正在加载产品数据...');
    
    // 2. 异步加载数据
    const products = await productManager.loadProducts();
    
    // 3. 更新UI
    if (currentView === 'grid') {
      renderGridView(products);
    } else {
      renderListView(products);
    }
    
    // 4. 刷新AI推荐
    setTimeout(refreshProductAI, 500);
    
  } catch (error) {
    console.error('加载失败:', error);
  }
}
```

## 测试检查清单

- [ ] 产品列表能正常加载
- [ ] 搜索功能能正常工作
- [ ] 创建产品能保存到数据库
- [ ] 编辑产品信息能正确保存
- [ ] 删除产品后列表正确更新
- [ ] 切换产品状态正常工作
- [ ] 更新库存功能正常
- [ ] 视图切换（网格/列表）正常
- [ ] AI建议能正常显示
- [ ] 错误提示能正常显示
- [ ] 分页能正常工作
- [ ] 筛选功能能正常工作

## 部署注意事项

1. **环境配置** - 确保API_BASE_URL正确配置
2. **CORS设置** - 后端需要配置CORS允许跨域请求
3. **认证token** - 确保登录后token正确保存
4. **浏览器兼容性** - 需要支持async/await (ES2017+)

## 下一步工作

1. 完善产品导入功能
2. 完善产品导出功能
3. 实现产品图片上传
4. 实现高级筛选功能
5. 实现产品批量操作
6. 集成库存预警通知

## 相关文档

- [APIClient 使用指南](./API_CLIENT_GUIDE.md)
- [leads.html API集成指南](./API_INTEGRATION_GUIDE.md)
- [后端API文档](./BACKEND_API.md)
