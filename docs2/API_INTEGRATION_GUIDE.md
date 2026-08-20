# ShopPro leads.html API集成指南

## 概述

本文档详细说明了 `pages/leads.html` 页面与后端API的集成实现，包括线索管理、客户管理的完整API调用流程。

## 架构设计

### 文件结构

```
pages/
├── leads.html                  # 主页面文件
assets/js/
├── api-client.js              # 全局API客户端
├── leads-api.js               # Lead页面API管理器
├── ui-components.js           # UI组件库
└── utils.js                   # 工具函数
```

### 层级关系

```
leads.html
   ↓
leads-api.js (LeadsAPIManager)
   ↓
api-client.js (APIClient)
   ↓
Backend API (/api/leads, /api/customers)
```

## API集成详情

### 1. 线索列表加载

**函数**: `loadLeadsData()`

**流程**:
```javascript
loadLeadsData()
  ↓
currentTab === 'leads' ?
  ↓ YES
leadsManager.loadLeads()
  ↓
api.leads.list({ page: 1, pageSize: 20, ...filters })
  ↓
Backend: GET /leads/list
  ↓
renderLeadsList(leads)
```

**后端端点**: `GET /leads/list`

**查询参数**:
- `pageNo` (默认: 1) - 页码
- `pageSize` (默认: 10) - 每页数量
- `priority` - 优先级筛选 (可选)
- `status` - 状态筛选 (可选)
- `assignedTo` - 分配人ID (可选)
- `source` - 线索来源 (可选)
- `stage` - 销售阶段 (可选)

**响应示例**:
```json
{
  "code": 0,
  "data": {
    "records": [
      {
        "id": 1,
        "title": "李先生",
        "description": "意向车型：宝马X5",
        "source": "官网咨询",
        "priority": "HIGH",
        "estimatedValue": 500000,
        "successProbability": 85,
        "status": "新建",
        "assignedTo": 1,
        "createdAt": "2024-01-20T10:00:00Z",
        "tags": ["价格敏感型", "配置优先"],
        ...
      }
    ],
    "total": 100,
    "pages": 5
  },
  "message": "查询成功"
}
```

### 2. 线索搜索

**函数**: `searchLeads(keyword)`

**端点**: `GET /leads/search?keyword={keyword}`

**示例**:
```javascript
await leadsManager.searchLeads("宝马");
```

### 3. 创建线索

**函数**: `createLead(leadData)`

**端点**: `POST /leads`

**请求体**:
```json
{
  "title": "张先生",
  "description": "询问产品信息",
  "source": "官网咨询",
  "priority": "HIGH",
  "estimatedValue": 450000,
  "interestedProducts": "宝马X5",
  "budgetRange": "40-50万",
  "decisionTimeline": "2024年3月",
  "followUpDate": "2024-01-25",
  "assignedTo": 1
}
```

### 4. 线索分配

**函数**: `assignLead(leadId, userId)`

**端点**: `POST /leads/{id}/assign?assignTo={userId}`

**使用场景**:
- 自动分配 (执行AutoAssign后)
- 手动分配 (选择销售人员后)

**流程**:
```javascript
// 自动分配
await leadsManager.assignLead(leadId, recommendedSalesId);

// 手动分配
await leadsManager.assignLead(leadId, selectedSalesId);
```

### 5. 更新线索状态

**函数**: `updateLeadStatus(leadId, status)`

**端点**: `POST /leads/{id}/status?status={status}`

**支持的状态**:
- `新建` - 新创建的线索
- `跟进中` - 正在跟进的线索
- `待决策` - 等待客户决策
- `已成交` - 成功成交
- `已失败` - 失败的线索

### 6. 线索转客户

**函数**: `convertToCustomer(leadId)`

**端点**: `POST /leads/{id}/convert`

**响应**: 返回新创建的Customer对象

### 7. 删除线索

**函数**: `deleteLead(leadId)`

**端点**: `DELETE /leads/{id}`

### 8. 客户列表加载

**函数**: `loadCustomers(options)`

**端点**: `GET /customers`

**响应格式**: 同线索列表

## 实现细节

### LeadsAPIManager 类

位置: `assets/js/leads-api.js`

**主要方法**:
```javascript
class LeadsAPIManager {
  loadLeads(options)          // 加载线索
  searchLeads(keyword)        // 搜索线索
  createLead(leadData)        // 创建线索
  updateLead(leadId, data)    // 更新线索
  assignLead(leadId, userId)  // 分配线索
  updateLeadStatus(leadId, status)  // 更新状态
  convertToCustomer(leadId)   // 转为客户
  deleteLead(leadId)          // 删除线索
  getLeadStats()              // 获取统计
  loadCustomers(options)      // 加载客户
  setFilters(filters)         // 设置筛选
  clearFilters()              // 清空筛选
}
```

### UI集成

**全局变量**:
```javascript
let currentTab = 'leads';              // 当前标签页
let currentLeads = [];                 // 当前线索列表
let currentCustomers = [];             // 当前客户列表
let currentLeadId = null;              // 当前操作的线索ID
let leadsManager = new LeadsAPIManager();
```

**数据属性** (用于DOM操作):
```html
<!-- 线索容器 -->
<div class="lead-item" data-lead-id="1" data-lead-name="李先生">
  <!-- 分配状态显示 -->
  <div data-assign-status>分配给: 张经理</div>
  
  <!-- 操作按钮容器 -->
  <div data-action-buttons>
    <!-- 按钮列表 -->
  </div>
</div>
```

## 使用示例

### 加载并显示线索

```javascript
// 页面初始化
async function initLeads() {
  try {
    const leads = await leadsManager.loadLeads({
      page: 1,
      pageSize: 20
    });
    renderLeadsList(leads);
  } catch (error) {
    console.error('加载失败:', error);
    UI.showMessage('加载线索失败', 'error');
  }
}
```

### 创建线索

```javascript
async function handleCreateLead(formData) {
  try {
    const result = await leadsManager.createLead({
      title: formData.customerName,
      description: formData.notes,
      source: 'manual',
      priority: 'medium',
      estimatedValue: formData.budget,
      ...formData
    });
    
    UI.showMessage('线索创建成功', 'success');
    await loadLeadsData(); // 刷新列表
  } catch (error) {
    UI.showMessage('创建失败: ' + error.message, 'error');
  }
}
```

### 分配线索

```javascript
// 自动分配
async function autoAssignLead(leadId) {
  try {
    // 获取AI推荐
    const recommendation = await api.aiAdvanced.getRecommendations(
      leadId,
      'sales_assignment',
      1,
      []
    );
    
    const bestSales = recommendation.recommendations[0];
    
    // 执行分配
    await leadsManager.assignLead(leadId, bestSales.user_id);
    UI.showMessage('自动分配成功', 'success');
    
  } catch (error) {
    UI.showMessage('分配失败: ' + error.message, 'error');
  }
}

// 手动分配
async function manualAssignLead(leadId, salesId) {
  try {
    await leadsManager.assignLead(leadId, salesId);
    UI.showMessage('分配成功', 'success');
    await loadLeadsData(); // 刷新列表
  } catch (error) {
    UI.showMessage('分配失败: ' + error.message, 'error');
  }
}
```

### 搜索线索

```javascript
async function searchLeads(keyword) {
  try {
    const results = await leadsManager.searchLeads(keyword);
    renderLeadsList(results);
  } catch (error) {
    UI.showMessage('搜索失败: ' + error.message, 'error');
  }
}
```

## 错误处理

### 统一错误处理

所有API调用都通过 `APIClient` 进行，其中包含：

1. **重试机制** - 失败的请求自动重试3次
2. **超时控制** - 30秒超时
3. **请求拦截** - 自动添加认证token
4. **响应拦截** - 处理401错误，自动重定向登录

### 错误响应示例

```json
{
  "code": 400,
  "message": "线索不存在",
  "data": null
}
```

### 常见错误处理

```javascript
try {
  await leadsManager.loadLeads();
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

### AI线索预测

```javascript
async function predictLeadSuccess(leadId) {
  try {
    const prediction = await api.aiSales.predict(leadId);
    
    // 响应:
    // {
    //   success_probability: 0.85,  // 成交概率
    //   predicted_cycle_days: 5,    // 预计周期
    //   recommendations: [...]      // 行动建议
    // }
    
    showPredictionModal(prediction);
  } catch (error) {
    UI.showMessage('预测失败: ' + error.message, 'error');
  }
}
```

### AI话术推荐

```javascript
async function getLeadRecommendations(leadId) {
  try {
    const scripts = await api.aiScript.recommend(leadId, 'sales');
    
    // 响应:
    // {
    //   scripts: [
    //     "您好，请问您现在有时间吗？...",
    //     "我们的产品特别适合...",
    //     ...
    //   ]
    // }
    
    showScriptsModal(scripts);
  } catch (error) {
    UI.showMessage('获取话术失败: ' + error.message, 'error');
  }
}
```

## 性能优化

### 缓存策略

1. **当前列表缓存** - `currentLeads` 和 `currentCustomers`
2. **分页缓存** - 记录当前页码，避免重复加载
3. **搜索结果缓存** - 5分钟自动刷新

### 加载优化

```javascript
// 分步加载
async function initializeLeadsPage() {
  // 1. 立即显示缓存数据
  renderLeadsList(currentLeads);
  
  // 2. 异步加载新数据
  setTimeout(async () => {
    const newLeads = await leadsManager.loadLeads();
    currentLeads = newLeads;
    renderLeadsList(newLeads);
    
    // 3. 异步加载AI分析
    await refreshLeadsAI();
  }, 100);
}
```

## 后端依赖

### 必需的API端点

| 端点 | 方法 | 说明 |
|-----|------|------|
| `/leads/list` | GET | 线索列表 |
| `/leads` | POST | 创建线索 |
| `/leads/{id}` | GET | 获取详情 |
| `/leads/{id}` | PUT | 更新线索 |
| `/leads/{id}` | DELETE | 删除线索 |
| `/leads/{id}/assign` | POST | 分配线索 |
| `/leads/{id}/status` | POST | 更新状态 |
| `/leads/{id}/convert` | POST | 转为客户 |
| `/leads/search` | GET | 搜索线索 |
| `/customers` | GET | 客户列表 |

### 当前实现状态

✅ LeadController 已完全实现上述所有端点
✅ APIClient 已完全实现
✅ LeadsAPIManager 已完全实现
⚠️ 前端renderLeadsList()需要根据实际API响应体调整

## TODO 任务

1. **完善renderLeadsList()** - 根据API实际返回的字段结构进行渲染
2. **完善renderCustomersList()** - 根据API实际返回的字段结构进行渲染
3. **集成follow-up-records API** - 添加跟进记录功能
4. **集成follow-up-reminders** - 添加跟进提醒功能
5. **实现搜索输入框** - 连接搜索功能
6. **实现筛选功能** - 根据优先级、状态等筛选

## 测试检查清单

- [ ] 线索列表能正常加载
- [ ] 搜索功能能正常工作
- [ ] 创建线索能保存到数据库
- [ ] 自动分配能正确调用AI接口
- [ ] 手动分配能正确保存分配信息
- [ ] 线索转客户能正常转换
- [ ] AI预测能正常显示概率
- [ ] 获取话术能正常推荐
- [ ] 错误提示能正常显示
- [ ] 页面切换不会丢失数据

## 部署注意事项

1. **环境配置** - 确保API_BASE_URL正确配置
2. **CORS设置** - 后端需要配置CORS允许前端跨域请求
3. **认证token** - 确保登录后token正确保存在localStorage
4. **浏览器兼容性** - 需要支持async/await (ES2017+)

## 相关文档

- [APIClient 使用指南](./API_CLIENT_GUIDE.md)
- [后端API文档](./BACKEND_API.md)
- [数据库模型](./DATABASE_SCHEMA.md)
