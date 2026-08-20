# ShopPro 客户管理页面 API集成指南

## 概述

本文档详细说明了 `pages/customer-list.html` 页面与后端API的集成实现，包括客户列表管理、搜索、创建、编辑、删除等功能的完整API调用流程。

## 架构设计

### 文件结构

```
pages/
├── customer-list.html              # 主页面文件
assets/js/
├── api-client.js                   # 全局API客户端
├── customer-api.js                 # 客户管理API管理器
├── ui-components.js                # UI组件库
└── utils.js                        # 工具函数
```

### 层级关系

```
customer-list.html
   ↓
customer-api.js (CustomerAPIManager)
   ↓
api-client.js (APIClient)
   ↓
Backend API (/api/customers)
```

## API集成详情

### 1. 客户列表加载

**函数**: `loadCustomerData()`

**流程**:
```javascript
loadCustomerData()
  ↓
customerManager.loadCustomers()
  ↓
api.customers.list({ pageNo: 1, pageSize: 12, ...filters })
  ↓
Backend: GET /customers/list
  ↓
更新UI显示客户列表和统计数据
```

**后端端点**: `GET /customers/list`

**查询参数**:
- `pageNo` (默认: 1) - 页码
- `pageSize` (默认: 12) - 每页数量
- `status` - 客户状态筛选 (可选)
- `level` - 客户等级筛选 (可选)

**响应示例**:
```json
{
  "code": 0,
  "data": {
    "records": [
      {
        "id": 1,
        "name": "李先生",
        "phone": "138****8888",
        "email": "li@example.com",
        "company": "某公司",
        "address": "北京朝阳",
        "level": "vip",
        "status": "active",
        "satisfactionScore": 95,
        "lastContactTime": "2024-01-20T10:00:00Z",
        ...
      }
    ],
    "total": 150,
    "pages": 13
  },
  "message": "查询成功"
}
```

### 2. 客户搜索

**函数**: `toggleSearch()`

**端点**: `GET /customers/search?keyword={keyword}`

**使用场景**: 用户在搜索框输入关键词搜索客户

### 3. 客户筛选

**函数**: `filterCustomers(type)`

**支持的筛选类型**:
- `all` - 全部客户
- `vip` - VIP客户
- `active` - 活跃客户
- `dormant` - 沉睡客户
- `high-value` - 高价值客户
- `recent` - 近期购买客户

### 4. 客户创建

**函数**: 通过表单弹窗创建

**端点**: `POST /customers`

**请求体**:
```json
{
  "name": "客户名称",
  "phone": "联系电话",
  "email": "电子邮箱",
  "company": "公司名称",
  "address": "地址",
  "sourceType": "线索来源",
  "status": "active",
  "level": "normal",
  "purchaseIntention": "购买意向",
  "budget": "预算",
  "tags": ["标签1", "标签2"]
}
```

### 5. 客户更新

**函数**: `updateCustomer(customerId, customerData)`

**端点**: `PUT /customers/{id}`

### 6. 客户删除

**函数**: `deleteCustomer(customerId)`

**端点**: `DELETE /customers/{id}`

### 7. 客户分配

**函数**: `assignCustomer(customerId, userId)`

**端点**: `POST /customers/{customerId}/assign?userId={userId}`

### 8. 客户等级升级

**函数**: `upgradeCustomerLevel(customerId, newLevel)`

**端点**: `POST /customers/{customerId}/upgrade-level`

### 9. 标记客户为流失

**函数**: `markAsLost(customerId)`

**端点**: `POST /customers/{customerId}/mark-lost`

### 10. 恢复流失客户

**函数**: `recoverCustomer(customerId)`

**端点**: `POST /customers/{customerId}/recover`

### 11. 客户统计

**函数**: `getCustomerStats()`

**端点**: `GET /customers/statistics`

**响应**:
```json
{
  "totalCustomers": 150,
  "vipCustomers": 12,
  "activeCustomers": 98,
  "dormantCustomers": 40,
  "satisfactionRate": 95,
  "averageLifetimeValue": 285000
}
```

## 实现细节

### CustomerAPIManager 类

位置: `assets/js/customer-api.js`

**主要方法**:
```javascript
class CustomerAPIManager {
  loadCustomers(options)          // 加载客户列表
  searchCustomers(keyword)        // 搜索客户
  createCustomer(customerData)    // 创建客户
  updateCustomer(customerId, data) // 更新客户
  deleteCustomer(customerId)      // 删除客户
  assignCustomer(customerId, userId) // 分配客户
  getCustomerDetail(customerId)   // 获取详情
  getCustomerStats()              // 获取统计
  upgradeCustomerLevel(customerId, level) // 升级等级
  markAsLost(customerId)          // 标记流失
  recoverCustomer(customerId)     // 恢复客户
  getVIPCustomers()               // VIP客户
  getActiveCustomers()            // 活跃客户
  getHighValueCustomers()         // 高价值客户
  getCustomerAIAnalysis(customerId) // AI分析
  getCustomerAIRecommendations(customerId) // AI推荐
  getCustomerValueScore(customerId) // 价值评分
  setFilters(filters)             // 设置筛选
  clearFilters()                  // 清空筛选
  importCustomers(file)           // 导入客户
  exportCustomers(format)         // 导出客户
  assignCustomersBatch(ids, userId) // 批量分配
}
```

## AI功能集成

### 客户AI分析

```javascript
async function performAIAnalysis(customerId) {
  const analysis = await customerManager.getCustomerAIAnalysis(customerId);
  // 显示分析结果
}
```

### AI推荐

```javascript
async function getAIRecommendations(customerId) {
  const recommendations = await customerManager.getCustomerAIRecommendations(customerId);
  // 显示推荐内容
}
```

### 客户价值评分

```javascript
async function getCustomerValueScore(customerId) {
  const score = await customerManager.getCustomerValueScore(customerId);
  // 显示价值评分
}
```

## 后端依赖

### 必需的API端点

| 端点 | 方法 | 说明 |
|-----|------|------|
| `/customers/list` | GET | 客户列表 |
| `/customers` | POST | 创建客户 |
| `/customers/{id}` | GET | 获取详情 |
| `/customers/{id}` | PUT | 更新客户 |
| `/customers/{id}` | DELETE | 删除客户 |
| `/customers/{id}/assign` | POST | 分配客户 |
| `/customers/search` | GET | 搜索客户 |
| `/customers/statistics` | GET | 客户统计 |
| `/customers/vip` | GET | VIP客户 |
| `/customers/active` | GET | 活跃客户 |
| `/customers/{id}/upgrade-level` | POST | 升级等级 |
| `/customers/{id}/mark-lost` | POST | 标记流失 |
| `/customers/{id}/recover` | POST | 恢复客户 |

### 当前实现状态

✅ CustomerController 已完全实现上述所有端点
✅ CustomerAPIManager 已完全实现
✅ customer-list.html 已集成API加载
⚠️ 动态渲染客户列表需要根据API返回结构调整

## 错误处理

所有API调用都通过 `APIClient` 进行统一处理，包括：
- 自动重试机制 (3次)
- 30秒超时控制
- 用户友好的错误提示
- 降级处理（API失败时使用本地数据）

## 测试检查清单

- [ ] 客户列表能正常加载
- [ ] 搜索功能正常
- [ ] 筛选功能正常
- [ ] 创建客户功能正常
- [ ] 编辑客户功能正常
- [ ] 删除客户功能正常
- [ ] 分配客户功能正常
- [ ] 统计数据正确显示
- [ ] AI分析功能正常
- [ ] 错误提示正确显示

## 相关文档

- [APIClient 使用指南](./API_CLIENT_GUIDE.md)
- [leads.html API集成指南](./API_INTEGRATION_GUIDE.md)
- [product-management.html API集成指南](./PRODUCT_MANAGEMENT_API_GUIDE.md)
