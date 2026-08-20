# 第二阶段实现指南 - 全局错误处理系统

**指南版本**: 1.0  
**阶段**: 第二阶段  
**优先级**: 中  
**预计工期**: 3-5天  

---

## 一、任务总览

第二阶段的核心任务是建立一个完整的全局错误处理系统，包括：

1. **完善 customer-list.html UI** (2-3天)
2. **实现全局错误处理系统** (2-3天)
3. **集成错误处理到现有API** (1-2天)
4. **测试和验证** (1-2天)

总计工期：**5-8天**（取决于并行工作）

---

## 二、任务1 - Customer-List 页面完善 (2-3天)

### 2.1 HTML 结构调整

**文件**: `pages/customer-list.html`

#### 2.1.1 检查现有结构

```html
<!-- 检查以下部分是否存在 -->
1. 搜索框 - 关键词搜索
2. 筛选按钮 - 状态/等级/优先级筛选
3. 创建按钮 - 新建客户
4. 客户列表容器 - 显示客户列表
5. 分页控件 - 分页导航
6. 统计信息卡片 - 显示统计数据
7. 模态框 - 创建/编辑客户表单
```

#### 2.1.2 必要的HTML元素

```html
<!-- 搜索和筛选区域 -->
<div id="search-filter-section" class="search-filter">
  <div class="search-box">
    <input type="text" id="search-input" placeholder="搜索客户名称、电话、邮箱...">
    <button id="search-btn">搜索</button>
  </div>
  
  <div class="filter-buttons">
    <button class="filter-btn" data-filter="all">全部</button>
    <button class="filter-btn" data-filter="vip">VIP客户</button>
    <button class="filter-btn" data-filter="active">活跃客户</button>
    <button class="filter-btn" data-filter="dormant">沉睡客户</button>
    <button class="filter-btn" data-filter="high-value">高价值客户</button>
  </div>
</div>

<!-- 统计信息 -->
<div id="statistics-section" class="statistics">
  <div class="stat-card">
    <h3>总客户数</h3>
    <p id="total-customers">-</p>
  </div>
  <div class="stat-card">
    <h3>VIP客户</h3>
    <p id="vip-customers">-</p>
  </div>
  <div class="stat-card">
    <h3>活跃客户</h3>
    <p id="active-customers">-</p>
  </div>
  <div class="stat-card">
    <h3>满意度</h3>
    <p id="satisfaction-rate">-</p>
  </div>
</div>

<!-- 客户列表 -->
<div id="customer-list-container" class="customer-list">
  <!-- 动态生成的客户项 -->
</div>

<!-- 分页 -->
<div id="pagination-section" class="pagination">
  <!-- 分页控件 -->
</div>

<!-- 创建/编辑客户模态框 -->
<div id="customer-modal" class="modal" style="display:none">
  <div class="modal-overlay"></div>
  <div class="modal-content">
    <!-- 表单内容 -->
  </div>
</div>
```

### 2.2 JavaScript 改造

#### 2.2.1 页面初始化

```javascript
// 确保已引入必要的文件
// <script src="assets/js/api-client.js"></script>
// <script src="assets/js/customer-api.js"></script>
// <script src="assets/js/error-handler.js"></script>

let customerManager;
let currentFilters = {};
let currentPage = 1;
const pageSize = 12;

// 页面加载完成时初始化
document.addEventListener('DOMContentLoaded', async () => {
  try {
    customerManager = new CustomerAPIManager();
    
    // 初始化事件监听
    initializeEventListeners();
    
    // 加载初始数据
    await loadCustomerData();
    
    // 更新统计信息
    await updateStatistics();
  } catch (error) {
    console.error('页面初始化失败:', error);
    ErrorHandler.handle(error);
  }
});

// 初始化事件监听
function initializeEventListeners() {
  // 搜索
  document.getElementById('search-btn').addEventListener('click', performSearch);
  document.getElementById('search-input').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') performSearch();
  });

  // 筛选
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const filter = btn.getAttribute('data-filter');
      filterCustomers(filter);
    });
  });

  // 创建客户按钮
  document.getElementById('create-btn').addEventListener('click', showCreateModal);
}
```

#### 2.2.2 数据加载和渲染

```javascript
// 加载客户列表
async function loadCustomerData() {
  try {
    showLoading('加载中...');
    
    const options = {
      pageNo: currentPage,
      pageSize: pageSize,
      ...currentFilters
    };
    
    const response = await customerManager.loadCustomers(options);
    
    // 渲染客户列表
    renderCustomerList(response.records);
    
    // 渲染分页
    renderPagination(response.total, response.pages);
  } catch (error) {
    ErrorHandler.handle(error, { operation: 'loadCustomerData' });
  } finally {
    hideLoading();
  }
}

// 渲染客户列表
function renderCustomerList(customers) {
  const container = document.getElementById('customer-list-container');
  
  if (!customers || customers.length === 0) {
    container.innerHTML = '<div class="empty-state">暂无客户数据</div>';
    return;
  }

  const html = customers.map(customer => `
    <div class="customer-card" data-customer-id="${customer.id}">
      <div class="card-header">
        <h3>${customer.name}</h3>
        <span class="customer-level ${customer.level}">${getLevelText(customer.level)}</span>
      </div>
      <div class="card-body">
        <div class="info-row">
          <span>电话:</span>
          <span>${customer.phone}</span>
        </div>
        <div class="info-row">
          <span>邮箱:</span>
          <span>${customer.email}</span>
        </div>
        <div class="info-row">
          <span>公司:</span>
          <span>${customer.company}</span>
        </div>
        <div class="info-row">
          <span>满意度:</span>
          <span class="satisfaction-score">${customer.satisfactionScore}%</span>
        </div>
      </div>
      <div class="card-footer">
        <button class="btn btn-sm btn-primary" onclick="editCustomer(${customer.id})">编辑</button>
        <button class="btn btn-sm btn-warning" onclick="viewAIAnalysis(${customer.id})">AI分析</button>
        <button class="btn btn-sm btn-danger" onclick="deleteCustomer(${customer.id})">删除</button>
      </div>
    </div>
  `).join('');

  container.innerHTML = html;
}

// 渲染分页
function renderPagination(total, pages) {
  const container = document.getElementById('pagination-section');
  
  if (pages <= 1) {
    container.innerHTML = '';
    return;
  }

  let html = '<div class="pagination-controls">';
  
  // 上一页
  if (currentPage > 1) {
    html += `<button onclick="goToPage(${currentPage - 1})">上一页</button>`;
  }

  // 页码
  for (let i = 1; i <= pages; i++) {
    if (i === currentPage) {
      html += `<span class="current-page">${i}</span>`;
    } else if (i <= 3 || i > pages - 3 || Math.abs(i - currentPage) <= 1) {
      html += `<button onclick="goToPage(${i})">${i}</button>`;
    } else if (i === 4 || i === pages - 2) {
      html += '<span>...</span>';
    }
  }

  // 下一页
  if (currentPage < pages) {
    html += `<button onclick="goToPage(${currentPage + 1})">下一页</button>`;
  }

  html += '</div>';
  container.innerHTML = html;
}
```

#### 2.2.3 搜索和筛选

```javascript
// 执行搜索
async function performSearch() {
  try {
    const keyword = document.getElementById('search-input').value.trim();
    
    if (!keyword) {
      ToastManager.warning('请输入搜索关键词');
      return;
    }

    showLoading('搜索中...');
    
    const results = await customerManager.searchCustomers(keyword);
    renderCustomerList(results);
    
    ToastManager.success(`找到 ${results.length} 个匹配的客户`);
  } catch (error) {
    ErrorHandler.handle(error, { operation: 'performSearch' });
  } finally {
    hideLoading();
  }
}

// 筛选客户
async function filterCustomers(filterType) {
  try {
    showLoading('筛选中...');
    
    currentPage = 1;
    currentFilters = {};

    let response;
    switch(filterType) {
      case 'vip':
        response = await customerManager.getVIPCustomers();
        break;
      case 'active':
        response = await customerManager.getActiveCustomers();
        break;
      case 'dormant':
        currentFilters.status = 'dormant';
        response = await customerManager.loadCustomers(currentFilters);
        break;
      case 'high-value':
        response = await customerManager.getHighValueCustomers();
        break;
      default:
        response = await customerManager.loadCustomers();
    }

    // 更新UI
    updateActiveFilterButton(filterType);
    renderCustomerList(response.records || response);
  } catch (error) {
    ErrorHandler.handle(error, { operation: 'filterCustomers', filterType });
  } finally {
    hideLoading();
  }
}

// 更新活跃的筛选按钮
function updateActiveFilterButton(activeFilter) {
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.classList.remove('active');
    if (btn.getAttribute('data-filter') === activeFilter) {
      btn.classList.add('active');
    }
  });
}

// 转到指定页码
async function goToPage(pageNo) {
  currentPage = pageNo;
  await loadCustomerData();
  // 滚动到顶部
  window.scrollTo(0, 0);
}
```

#### 2.2.4 CRUD 操作

```javascript
// 显示创建客户模态框
function showCreateModal() {
  const modal = document.getElementById('customer-modal');
  const form = modal.querySelector('form');
  
  form.reset();
  form.onsubmit = async (e) => {
    e.preventDefault();
    await saveNewCustomer(form);
  };
  
  modal.style.display = 'block';
}

// 编辑客户
async function editCustomer(customerId) {
  try {
    showLoading('加载客户信息...');
    
    const customer = await customerManager.getCustomerDetail(customerId);
    const modal = document.getElementById('customer-modal');
    const form = modal.querySelector('form');
    
    // 填充表单
    form.elements['name'].value = customer.name;
    form.elements['phone'].value = customer.phone;
    form.elements['email'].value = customer.email;
    form.elements['company'].value = customer.company;
    // ... 其他字段
    
    form.onsubmit = async (e) => {
      e.preventDefault();
      await saveEditedCustomer(customerId, form);
    };
    
    modal.style.display = 'block';
  } catch (error) {
    ErrorHandler.handle(error, { operation: 'editCustomer', customerId });
  } finally {
    hideLoading();
  }
}

// 保存新客户
async function saveNewCustomer(form) {
  try {
    const formData = new FormData(form);
    const customerData = Object.fromEntries(formData);
    
    // 基础验证
    if (!validateCustomerForm(customerData)) {
      return;
    }

    showLoading('保存中...');
    
    await customerManager.createCustomer(customerData);
    
    ToastManager.success('客户创建成功');
    closeModal();
    await loadCustomerData();
  } catch (error) {
    ErrorHandler.handle(error, { operation: 'saveNewCustomer' });
  } finally {
    hideLoading();
  }
}

// 保存编辑的客户
async function saveEditedCustomer(customerId, form) {
  try {
    const formData = new FormData(form);
    const updates = Object.fromEntries(formData);
    
    if (!validateCustomerForm(updates)) {
      return;
    }

    showLoading('保存中...');
    
    await customerManager.updateCustomer(customerId, updates);
    
    ToastManager.success('客户信息已更新');
    closeModal();
    await loadCustomerData();
  } catch (error) {
    ErrorHandler.handle(error, { operation: 'saveEditedCustomer', customerId });
  } finally {
    hideLoading();
  }
}

// 删除客户
async function deleteCustomer(customerId) {
  try {
    const confirmed = await showConfirmDialog('确定要删除此客户吗？此操作不可撤销。');
    
    if (!confirmed) return;

    showLoading('删除中...');
    
    await customerManager.deleteCustomer(customerId);
    
    ToastManager.success('客户已删除');
    await loadCustomerData();
  } catch (error) {
    ErrorHandler.handle(error, { operation: 'deleteCustomer', customerId });
  } finally {
    hideLoading();
  }
}
```

#### 2.2.5 统计信息更新

```javascript
// 更新统计信息
async function updateStatistics() {
  try {
    const stats = await customerManager.getCustomerStats();
    
    document.getElementById('total-customers').textContent = stats.totalCustomers;
    document.getElementById('vip-customers').textContent = stats.vipCustomers;
    document.getElementById('active-customers').textContent = stats.activeCustomers;
    document.getElementById('satisfaction-rate').textContent = Math.round(stats.satisfactionRate) + '%';
  } catch (error) {
    console.error('更新统计失败:', error);
    // 不显示错误提示，因为这是次要功能
  }
}

// 定时更新统计信息（每5分钟）
setInterval(updateStatistics, 5 * 60 * 1000);
```

#### 2.2.6 辅助函数

```javascript
// 表单验证
function validateCustomerForm(data) {
  if (!data.name || data.name.trim() === '') {
    ToastManager.warning('客户名称不能为空');
    return false;
  }

  if (!data.phone || data.phone.trim() === '') {
    ToastManager.warning('联系电话不能为空');
    return false;
  }

  if (!isValidPhone(data.phone)) {
    ToastManager.warning('联系电话格式不正确');
    return false;
  }

  if (!data.email || data.email.trim() === '') {
    ToastManager.warning('邮箱不能为空');
    return false;
  }

  if (!isValidEmail(data.email)) {
    ToastManager.warning('邮箱格式不正确');
    return false;
  }

  return true;
}

// 电话号码验证
function isValidPhone(phone) {
  return /^1[3-9]\d{9}$/.test(phone);
}

// 邮箱验证
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// 获取等级文本
function getLevelText(level) {
  const levels = {
    'vip': 'VIP客户',
    'platinum': '铂金客户',
    'gold': '黄金客户',
    'normal': '普通客户'
  };
  return levels[level] || level;
}

// 加载状态显示
function showLoading(message = '加载中...') {
  let loader = document.getElementById('loading-indicator');
  if (!loader) {
    loader = document.createElement('div');
    loader.id = 'loading-indicator';
    loader.className = 'loading-overlay';
    document.body.appendChild(loader);
  }
  loader.innerHTML = `<div class="spinner"></div><p>${message}</p>`;
  loader.style.display = 'block';
}

function hideLoading() {
  const loader = document.getElementById('loading-indicator');
  if (loader) {
    loader.style.display = 'none';
  }
}

// 模态框操作
function closeModal() {
  const modal = document.getElementById('customer-modal');
  if (modal) {
    modal.style.display = 'none';
  }
}

// 确认对话框
async function showConfirmDialog(message) {
  return new Promise(resolve => {
    // 可以使用 window.confirm 或自定义模态框
    resolve(window.confirm(message));
  });
}
```

### 2.3 CSS 样式

```css
/* 搜索和筛选 */
.search-filter {
  margin-bottom: 20px;
  padding: 15px;
  background: #f5f5f5;
  border-radius: 8px;
}

.search-box {
  display: flex;
  gap: 10px;
  margin-bottom: 15px;
}

.search-box input {
  flex: 1;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.filter-buttons {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.filter-btn {
  padding: 8px 16px;
  background: white;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
}

.filter-btn:hover,
.filter-btn.active {
  background: #2196F3;
  color: white;
  border-color: #2196F3;
}

/* 统计卡片 */
.statistics {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 15px;
  margin-bottom: 20px;
}

.stat-card {
  background: white;
  padding: 15px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.stat-card h3 {
  margin: 0 0 10px 0;
  color: #666;
  font-size: 12px;
}

.stat-card p {
  margin: 0;
  font-size: 24px;
  font-weight: bold;
  color: #2196F3;
}

/* 客户列表 */
.customer-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 15px;
  margin-bottom: 20px;
}

.customer-card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: all 0.3s;
}

.customer-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transform: translateY(-2px);
}

.card-header {
  padding: 15px;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header h3 {
  margin: 0;
  font-size: 16px;
}

.customer-level {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: bold;
}

.customer-level.vip {
  background: #ffd700;
  color: #333;
}

.customer-level.platinum {
  background: #e5e4e2;
  color: #333;
}

.card-body {
  padding: 15px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 14px;
}

.card-footer {
  padding: 15px;
  border-top: 1px solid #eee;
  display: flex;
  gap: 8px;
}

.btn {
  padding: 8px 12px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.3s;
}

.btn-primary {
  background: #2196F3;
  color: white;
}

.btn-warning {
  background: #ff9800;
  color: white;
}

.btn-danger {
  background: #f44336;
  color: white;
}

/* 分页 */
.pagination-controls {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-top: 20px;
}

.pagination-controls button,
.pagination-controls span {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
}

.pagination-controls .current-page {
  background: #2196F3;
  color: white;
  border-color: #2196F3;
  cursor: default;
}
```

### 2.4 检查清单

- [ ] HTML结构完整
- [ ] 搜索功能正常
- [ ] 筛选功能正常
- [ ] CRUD操作正常
- [ ] 分页正常
- [ ] 统计信息正常
- [ ] 加载状态正确显示
- [ ] 样式美观统一

---

## 三、任务2 - 全局错误处理系统实现 (2-3天)

### 3.1 创建 error-handler.js

**文件**: `assets/js/error-handler.js`

参考 `ERROR_HANDLING_GUIDE.md` 第三、四、五章节的代码实现。

### 3.2 创建 toast-manager.js

**文件**: `assets/js/toast-manager.js`

```javascript
class ToastManager {
  static showToast(message, options = {}) {
    const {
      type = 'info',      // success, info, warning, error
      duration = 3000,
      position = 'top-right'
    } = options;

    const toastElement = this.createToastElement(message, type);
    this.addToDOM(toastElement, position);

    setTimeout(() => {
      toastElement.remove();
    }, duration);
  }

  static success(message) {
    this.showToast(message, { type: 'success' });
  }

  static info(message) {
    this.showToast(message, { type: 'info' });
  }

  static warning(message) {
    this.showToast(message, { type: 'warning' });
  }

  static error(message) {
    this.showToast(message, { type: 'error' });
  }

  // ... 实现其他方法
}
```

### 3.3 集成到 APIClient

修改 `assets/js/api-client.js`：

```javascript
// 响应拦截器
this.axiosInstance.interceptors.response.use(
  response => response,
  error => this.handleResponseError(error)
);

async handleResponseError(error) {
  // 使用ErrorHandler处理错误
  ErrorHandler.handle(error, {
    url: error.config?.url,
    method: error.config?.method,
    timestamp: new Date().toISOString()
  });

  throw error;
}
```

### 3.4 测试清单

- [ ] 所有错误类型都能正确分类
- [ ] 用户提示信息清晰
- [ ] 重试机制正常工作
- [ ] 日志记录正确
- [ ] Toast/Modal 显示正确

---

## 四、任务3 - 集成错误处理到API (1-2天)

### 4.1 更新 CustomerAPIManager

在 `assets/js/customer-api.js` 中的每个方法中集成错误处理：

```javascript
class CustomerAPIManager {
  async loadCustomers(options = {}) {
    try {
      const response = await this.apiClient.get('/customers/list', { params: options });
      return response.data;
    } catch (error) {
      ErrorHandler.handle(error, {
        operation: 'loadCustomers',
        parameters: options
      });
      throw error;
    }
  }

  // ... 其他方法
}
```

### 4.2 更新其他 API 管理器

类似地更新：
- `ProductAPIManager` (product-api.js)
- `LeadAPIManager` (lead-api.js) 如果存在

### 4.3 测试清单

- [ ] API错误被正确捕获
- [ ] 用户收到友好的错误提示
- [ ] 重试机制在需要时触发
- [ ] 错误被正确记录

---

## 五、任务4 - 测试和验证 (1-2天)

### 5.1 单元测试

```javascript
// 测试错误分类
test('classifyNetworkError', () => {
  const error = new Error('timeout');
  const classified = ErrorHandler.classify(error);
  assert.equal(classified.type, 'NetworkError');
});

// 测试重试机制
test('retryWithSuccess', async () => {
  let attempts = 0;
  const fn = async () => {
    attempts++;
    if (attempts < 2) throw new Error('Failed');
    return 'Success';
  };

  const result = await ErrorHandler.retry(fn, { maxRetries: 3 });
  assert.equal(result, 'Success');
  assert.equal(attempts, 2);
});
```

### 5.2 集成测试

- [ ] 测试网络超时场景
- [ ] 测试服务器错误场景
- [ ] 测试验证错误场景
- [ ] 测试权限错误场景
- [ ] 测试所有CRUD操作的错误处理

### 5.3 用户体验测试

- [ ] 错误提示是否清晰明白
- [ ] 是否有重试选项
- [ ] 加载状态是否正确显示
- [ ] 是否支持离线模式

### 5.4 检查清单

- [ ] 所有错误场景都已覆盖
- [ ] 用户反馈清晰
- [ ] 系统能正确恢复
- [ ] 没有遗漏的边界情况

---

## 六、实现时间表

| 天 | 任务 | 进度 |
|----|------|------|
| 第1-2天 | Customer-List 页面改造 | 100% |
| 第2-3天 | 错误处理系统实现 | 100% |
| 第3-4天 | 集成错误处理 | 100% |
| 第4-5天 | 测试和调试 | 100% |

---

## 七、参考文档

- [错误处理指南](./ERROR_HANDLING_GUIDE.md)
- [第二阶段规划](./PHASE_2_PLAN.md)
- [客户管理API指南](./CUSTOMER_MANAGEMENT_API_GUIDE.md)

---

**指南作者**: AI Agent  
**最后更新**: 2024年1月  
**状态**: 完成 ✅
