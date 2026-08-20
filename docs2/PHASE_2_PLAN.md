# ShopPro 项目 - 第二阶段开发规划书

**规划日期**: 2024年1月  
**阶段**: 第二阶段  
**预计工期**: 3-5天  
**优先级**: 高  

---

## 一、阶段目标

完成客户管理系统的前端UI适配和功能测试，使得整个系统达到**可用状态**。

### 核心目标
- ✅ 调整 customer-list.html 以适配API返回的数据格式
- ✅ 完善所有CRUD操作的UI和交互
- ✅ 完成AI功能的前端展示
- ✅ 整体联调测试
- ✅ 用户验收测试(UAT)

---

## 二、任务分解

### 2.1 前端UI调整 (优先级: 🔴 关键)

#### 任务2.1.1: 客户列表数据绑定调整

**文件**: `pages/customer-list.html`

**当前问题**:
- 页面使用模拟数据进行渲染
- 需要适配真实API返回的数据结构

**需要完成的工作**:

1. **审查API返回数据结构**
   - 检查 `GET /customers/list` 的实际返回格式
   - 确认字段名称和数据类型

2. **调整HTML模板**
   - 更新客户卡片/行的HTML结构
   - 确保CSS类和选择器匹配

3. **更新JavaScript渲染逻辑**
   ```javascript
   // 当前方式 (示例)
   // 需要调整为
   function renderCustomerList(apiData) {
     const { records, total, pages } = apiData;
     // 动态生成HTML
   }
   ```

4. **测试渲染**
   - 测试空数据状态
   - 测试数据过多时的性能
   - 测试各种客户状态的显示

**预计工期**: 2小时  
**负责人**: TBD  
**依赖**: API已实现  

---

#### 任务2.1.2: 搜索和筛选功能完善

**文件**: `pages/customer-list.html`

**需要完成的工作**:

1. **关键词搜索**
   - 实现搜索框的防抖处理
   - 集成 `customerManager.searchCustomers()`
   - 显示搜索加载状态

2. **条件筛选**
   - 状态筛选 (active, dormant, lost等)
   - 等级筛选 (normal, vip, platinum等)
   - 时间范围筛选
   - 多条件联合筛选

3. **筛选UI**
   ```javascript
   // 需要实现
   function filterCustomers(type) {
     // 根据type调用不同的API
     switch(type) {
       case 'vip': return customerManager.getVIPCustomers();
       case 'active': return customerManager.getActiveCustomers();
       // ...
     }
   }
   ```

**预计工期**: 1.5小时  
**负责人**: TBD  

---

#### 任务2.1.3: 创建客户功能完善

**文件**: `pages/customer-list.html`

**需要完成的工作**:

1. **表单验证**
   - 必填字段检查 (name, phone, email)
   - 电话号码格式验证
   - 邮箱格式验证
   - 实时验证反馈

2. **表单提交**
   - 集成 `customerManager.createCustomer()`
   - 处理提交时的加载状态
   - 成功/失败提示

3. **表单重置**
   ```javascript
   function showCreateCustomerModal() {
     // 显示弹窗
     // 清空表单
     // 监听提交事件
   }
   
   async function saveNewCustomer(formData) {
     try {
       const result = await customerManager.createCustomer(formData);
       showSuccess('客户创建成功');
       closeModal();
       loadCustomerData(); // 刷新列表
     } catch (error) {
       showError(error.message);
     }
   }
   ```

**预计工期**: 1.5小时  
**负责人**: TBD  

---

#### 任务2.1.4: 编辑客户功能完善

**文件**: `pages/customer-list.html`

**需要完成的工作**:

1. **编辑表单预填充**
   - 获取选中客户的详细信息
   - 填充到编辑表单中

2. **编辑提交**
   - 集成 `customerManager.updateCustomer()`
   - 智能更新 (只提交变更字段)

3. **编辑状态指示**
   ```javascript
   async function editCustomer(customerId) {
     const customer = await customerManager.getCustomerDetail(customerId);
     showEditModal(customer);
   }
   
   async function saveEditedCustomer(customerId, formData) {
     const result = await customerManager.updateCustomer(customerId, formData);
     showSuccess('客户信息已更新');
     loadCustomerData();
   }
   ```

**预计工期**: 1.5小时  
**负责人**: TBD  

---

#### 任务2.1.5: 删除客户功能完善

**文件**: `pages/customer-list.html`

**需要完成的工作**:

1. **删除确认框**
   - 显示客户信息确认
   - 确认/取消选项

2. **删除处理**
   - 集成 `customerManager.deleteCustomer()`
   - 删除后自动刷新列表

3. **批量删除** (可选)
   ```javascript
   async function deleteCustomer(customerId) {
     const confirmed = await showConfirmDialog(
       `确定要删除客户"${customerName}"吗？此操作不可撤销。`
     );
     if (confirmed) {
       await customerManager.deleteCustomer(customerId);
       showSuccess('客户已删除');
       loadCustomerData();
     }
   }
   ```

**预计工期**: 1小时  
**负责人**: TBD  

---

### 2.2 高级功能实现 (优先级: 🟠 重要)

#### 任务2.2.1: 客户分配功能

**文件**: `pages/customer-list.html`

**需要完成的工作**:

1. **分配UI**
   - 显示分配按钮
   - 弹窗选择销售人员

2. **分配逻辑**
   ```javascript
   async function assignCustomer(customerId) {
     const users = await getAvailableUsers(); // 获取可用用户
     showAssignModal(users);
     
     // 用户选择后
     await customerManager.assignCustomer(customerId, selectedUserId);
     showSuccess('客户已分配');
   }
   ```

**预计工期**: 1.5小时  
**负责人**: TBD  

---

#### 任务2.2.2: 客户等级管理

**文件**: `pages/customer-list.html`

**需要完成的工作**:

1. **等级升级UI**
   - 显示当前等级
   - 提供升级选项

2. **等级升级逻辑**
   ```javascript
   async function upgradeCustomerLevel(customerId, newLevel) {
     const result = await customerManager.upgradeCustomerLevel(customerId, newLevel);
     showSuccess(`客户等级已升级为${newLevel}`);
     loadCustomerData();
   }
   ```

**预计工期**: 1小时  
**负责人**: TBD  

---

#### 任务2.2.3: 客户流失管理

**文件**: `pages/customer-list.html`

**需要完成的工作**:

1. **标记流失**
   ```javascript
   async function markAsLost(customerId) {
     await customerManager.markAsLost(customerId);
     showSuccess('已标记为流失客户');
     loadCustomerData();
   }
   ```

2. **恢复客户**
   ```javascript
   async function recoverCustomer(customerId) {
     await customerManager.recoverCustomer(customerId);
     showSuccess('客户已恢复');
     loadCustomerData();
   }
   ```

**预计工期**: 1小时  
**负责人**: TBD  

---

#### 任务2.2.4: AI功能展示

**文件**: `pages/customer-list.html`

**需要完成的工作**:

1. **AI分析功能**
   - 添加"AI分析"按钮
   - 调用 `customerManager.getCustomerAIAnalysis()`
   - 弹窗展示分析结果

2. **AI推荐功能**
   - 显示"获取建议"按钮
   - 调用 `customerManager.getCustomerAIRecommendations()`
   - 展示推荐内容

3. **价值评分**
   - 调用 `customerManager.getCustomerValueScore()`
   - 在客户卡片上显示评分

```javascript
async function performAIAnalysis(customerId) {
  try {
    const analysis = await customerManager.getCustomerAIAnalysis(customerId);
    showAnalysisModal(analysis);
  } catch (error) {
    showError('AI分析失败，请重试');
  }
}
```

**预计工期**: 2小时  
**负责人**: TBD  

---

### 2.3 统计和数据展示 (优先级: 🟠 重要)

#### 任务2.3.1: 客户统计更新

**文件**: `pages/customer-list.html`

**需要完成的工作**:

1. **获取统计数据**
   ```javascript
   async function updateStatistics() {
     const stats = await customerManager.getCustomerStats();
     
     // 更新UI
     updateStatCard('totalCustomers', stats.totalCustomers);
     updateStatCard('vipCustomers', stats.vipCustomers);
     updateStatCard('activeCustomers', stats.activeCustomers);
     updateStatCard('dormantCustomers', stats.dormantCustomers);
     updateStatCard('satisfactionRate', stats.satisfactionRate);
   }
   ```

2. **定时刷新**
   - 每5分钟自动刷新统计

**预计工期**: 1小时  
**负责人**: TBD  

---

### 2.4 其他页面集成 (优先级: 🟡 中等)

#### 任务2.4.1: customer-management.html 集成

**文件**: `pages/customer-management.html`

**需要完成的工作**:

1. **检查页面结构**
   - 审查现有HTML结构
   - 确认功能需求

2. **API集成**
   - 引入 customer-api.js
   - 集成数据加载
   - 集成操作功能

3. **测试**
   - 测试所有功能

**预计工期**: 2小时  
**负责人**: TBD  

---

## 三、技术规范

### 3.1 代码规范

**JavaScript**:
```javascript
// 命名规范
const customerManager = new CustomerAPIManager();
async function loadCustomerData() { }
function updateCustomerUI(data) { }

// 错误处理
try {
  const result = await customerManager.loadCustomers();
} catch (error) {
  console.error('加载失败:', error);
  showError('加载失败，请重试');
}

// 加载状态
function showLoading(message = '加载中...') { }
function hideLoading() { }
```

### 3.2 UI/UX规范

1. **加载状态**: 显示加载动画和文字提示
2. **错误提示**: 使用Toast/弹窗清晰显示错误
3. **成功提示**: 短暂显示成功提示
4. **确认对话框**: 危险操作前需要确认

---

## 四、测试计划

### 4.1 单元测试

- [ ] 表单验证逻辑
- [ ] 数据格式转换
- [ ] 错误处理函数

### 4.2 集成测试

- [ ] 客户列表加载和渲染
- [ ] 搜索和筛选功能
- [ ] 创建客户工作流
- [ ] 编辑客户工作流
- [ ] 删除客户工作流
- [ ] 客户分配工作流
- [ ] AI功能工作流

### 4.3 端到端测试 (E2E)

- [ ] 完整的客户管理流程
- [ ] 异常处理流程
- [ ] 性能测试

### 4.4 用户验收测试 (UAT)

- [ ] 页面加载速度
- [ ] 功能完整性
- [ ] 用户体验
- [ ] 错误处理

---

## 五、风险评估

| 风险 | 概率 | 影响 | 缓解措施 |
|------|------|------|--------|
| API返回数据格式不符 | 低 | 高 | 提前检查API文档和实际响应 |
| 性能问题 | 中 | 中 | 实施分页、虚拟滚动 |
| 浏览器兼容性 | 低 | 中 | 完整的兼容性测试 |
| 网络延迟 | 中 | 低 | 实施重试和超时机制 |

---

## 六、交付清单

### 6.1 代码文件

- ✅ `pages/customer-list.html` (完整功能)
- ✅ `pages/customer-management.html` (已集成)
- ✅ `assets/js/customer-api.js` (无需改动)

### 6.2 文档

- ✅ `CUSTOMER_MANAGEMENT_API_GUIDE.md`
- ✅ `PHASE_2_PLAN.md` (本文件)
- ⏳ `PHASE_2_COMPLETION_REPORT.md` (待生成)

### 6.3 测试报告

- ⏳ 单元测试报告
- ⏳ 集成测试报告
- ⏳ E2E测试报告
- ⏳ UAT报告

---

## 七、工期估算

| 模块 | 预计工期 | 优先级 |
|------|---------|-------|
| 客户列表UI调整 | 2小时 | 🔴关键 |
| 搜索和筛选 | 1.5小时 | 🔴关键 |
| 创建功能 | 1.5小时 | 🔴关键 |
| 编辑功能 | 1.5小时 | 🔴关键 |
| 删除功能 | 1小时 | 🔴关键 |
| 客户分配 | 1.5小时 | 🟠重要 |
| 等级管理 | 1小时 | 🟠重要 |
| 流失管理 | 1小时 | 🟠重要 |
| AI功能 | 2小时 | 🟠重要 |
| 统计展示 | 1小时 | 🟠重要 |
| 其他页面集成 | 2小时 | 🟡中等 |
| 测试和调试 | 3小时 | 🔴关键 |
| **总计** | **20小时** | - |

**预计完成日期**: 3-5个工作日 (取决于并行工作)

---

## 八、验收标准

### 8.1 功能完整性

- ✅ 所有CRUD操作正常工作
- ✅ 搜索和筛选正常
- ✅ AI功能正常
- ✅ 统计数据正确

### 8.2 用户体验

- ✅ 响应时间<2秒
- ✅ 无明显卡顿
- ✅ 错误提示清晰
- ✅ UI美观且易用

### 8.3 代码质量

- ✅ 代码格式规范
- ✅ 错误处理完整
- ✅ 注释清晰
- ✅ 无控制台错误

### 8.4 兼容性

- ✅ 支持Chrome/Firefox/Safari/Edge
- ✅ 支持PC和移动端
- ✅ 支持不同网络速度

---

## 九、后续工作

### 第三阶段 (预计: 1周)

1. 集成其他模块 (订单、产品等)
2. 性能优化和缓存
3. 离线支持
4. 数据导入导出

### 第四阶段

1. 深度优化和重构
2. 高级分析功能
3. 报表和仪表板

---

## 十、参考资源

- [CustomerAPIManager 文档](./assets/js/customer-api.js)
- [APIClient 文档](./assets/js/api-client.js)
- [API集成指南](./CUSTOMER_MANAGEMENT_API_GUIDE.md)
- [测试报告](./INTEGRATION_TEST_REPORT.md)

---

**规划人**: AI Agent  
**审核人**: TBD  
**更新日期**: 2024年1月  
**状态**: ⏳ 待开始
