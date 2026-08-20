# 前端硬编码与伪数据清单

本文档记录了 ShopPro 项目中所有使用硬编码和伪数据的地方，以便后续统一修改为动态数据。

---

## 一、shoppro-admin 后台管理系统

### 1. Marketing 模块

#### 1.1 获客工具 (Acquisition)

##### 渠道码管理 (ChannelCode)
- **文件**: `src/pages/Marketing/Acquisition/ChannelCode.tsx`
- **问题**: 暂无伪数据，使用空数组
- **API 接口**: `POST /api/acquisition/channel-code/list`

##### 欢迎语管理 (WelcomeMessage)
- **文件**: `src/pages/Marketing/Acquisition/WelcomeMessage.tsx`
- **伪数据**: 第 61-79 行定义 `getMockData()` 函数
- **API 接口**: `POST /api/acquisition/welcome-message/list`
- **示例数据**:
  ```typescript
  {
    id: 1,
    channelCodeId: 1,
    channelCodeName: '官网引流',
    content: '您好！感谢关注我们的产品，请问有什么可以帮助您的？',
    mediaType: 'text',
    isActive: true,
    priority: 1,
    createdAt: '2025-01-01 10:00:00'
  }
  ```

#### 1.2 运营工具 (Operation)

##### 自动化规则 (AutomationRules)
- **文件**: `src/pages/Marketing/Operation/AutomationRules.tsx`
- **伪数据**: 第 64-87 行定义 `getMockData()` 函数，包含 5 条规则
- **API 接口**:
  - 列表: `POST /api/operation/automation-rule/list`
  - 创建: `POST /api/operation/automation-rule`
  - 更新: `PUT /api/operation/automation-rule/{id}`
  - 删除: `DELETE /api/operation/automation-rule/{id}`
  - 切换状态: `PUT /api/operation/automation-rule/{id}/toggle`
- **示例数据**:
  ```typescript
  {
    id: 1,
    name: '新客户欢迎流程',
    description: '新客户添加时自动发送欢迎消息',
    triggerEvent: 'customer_created',
    conditions: '[]',
    actions: '[{"type":"send_message","template":"welcome"}]',
    isActive: true,
    executionCount: 156,
    lastExecutedAt: '2025-02-20 14:30:00',
    createdAt: '2025-01-01 10:00:00'
  }
  ```

##### SOP 管理 (SopManagement)
- **文件**: `src/pages/Marketing/Operation/SopManagement.tsx`
- **API 接口**: `POST /api/operation/sop/list`

##### 执行审计 (ExecutionAudit)
- **文件**: `src/pages/Marketing/Operation/ExecutionAudit.tsx`
- **伪数据**: 第 88-120 行定义 `getMockData()` 函数，生成 50 条随机数据
- **API 接口**: `GET /api/operation/sop/export` (CSV 格式)
- **fallback 伪数据内容**:
  ```typescript
  {
    id: number,
    ruleName: '新客户欢迎流程' | '线索超时提醒' | '订单完成通知' | '生日祝福提醒' | '跟进超时提醒',
    triggerEvent: 'scheduled',
    targetType: 'customer' | 'lead' | 'order',
    targetName: string,
    status: 'success' | 'failed' | 'pending',
    errorMessage: string | null,
    executedAt: string,
    duration: number
  }
  ```

---

### 2. Enterprise 企业管理模块

##### 企业详情 (EnterpriseDetail)
- **文件**: `src/pages/Enterprise/EnterpriseDetail.tsx`
- **API 接口**: `GET /api/tenant/{id}`

##### 企业团队 (EnterpriseTeam)
- **文件**: `src/pages/Enterprise/EnterpriseTeam.tsx`
- **问题**: 增删成员功能只有 UI，缺少实际 API 调用
- **待实现 API**:
  - 添加成员: `POST /api/tenant/{id}/member`
  - 移除成员: `DELETE /api/tenant/{id}/member/{userId}`

##### 企业信息 (EnterpriseInfo)
- **文件**: `src/pages/Enterprise/Info.tsx`
- **API 接口**: `GET /api/tenant/{id}`

##### 团队管理 (TeamManagement)
- **文件**: `src/pages/Enterprise/Team.tsx`
- **API 接口**:
  - 获取部门树: `GET /api/department/tree`
  - 获取部门成员: `GET /api/department/{id}/members`

---

### 3. Tenancy 租户管理模块

##### 租户列表 (TenantList)
- **文件**: `src/pages/Tenancy/TenantList.tsx`
- **API 接口**: `POST /api/tenant/list`

##### 用户管理 (UserManagement)
- **文件**: `src/pages/Tenancy/UserManagement.tsx`
- **问题**:
  - 第 38-41 行: TODO 注释，缺少企业筛选和排序参数
  - 第 221-222 行: TODO 注释，添加用户 API 未实现
  - 第 235 行: TODO 注释，修改密码 API 未实现
- **待实现 API**:
  - 添加用户: `POST /api/user`
  - 修改密码: `PUT /api/user/{id}/password`

---

### 4. Subscription 订阅管理模块

##### 计划编辑 (PlanEdit)
- **文件**: `src/pages/Subscription/PlanEdit.tsx`
- **API 接口**:
  - 获取计划: `GET /api/subscription/plan/{id}`
  - 更新计划: `PUT /api/subscription/plan/{id}`

##### 订单管理 (Orders)
- **文件**: `src/pages/Subscription/Orders.tsx`
- **API 接口**: `POST /api/subscription/order/list`

---

### 5. System 系统管理模块

##### 管理员管理 (Admins)
- **文件**: `src/pages/System/Admins.tsx`
- **问题**:
  - 第 134 行: TODO 注释，创建管理员 API 未实现 (`// await createAdmin(values);`)
- **待实现 API**:
  - 创建管理员: `POST /api/admin`
  - 更新管理员: `PUT /api/admin/{id}`
  - 删除管理员: `DELETE /api/admin/{id}`

##### 通知管理 (Notifications)
- **文件**: `src/pages/System/Notifications.tsx`
- **API 接口**: `POST /api/notification/list`

##### 日志管理 (Logs)
- **文件**: `src/pages/System/Logs.tsx`
- **API 接口**: `POST /api/log/list`

---

### 6. AI Models 模块

##### 模型管理 (Models)
- **文件**: `src/pages/AIModels/Models.tsx`
- **API 接口**: `POST /api/ai-model/list`

##### 版本管理 (Versions)
- **文件**: `src/pages/AIModels/Versions.tsx`
- **API 接口**: `POST /api/ai-model-version/list`

##### Prompt 模板 (PromptTemplates)
- **文件**: `src/pages/AIModels/PromptTemplates.tsx`
- **API 接口**: `POST /api/prompt-template/list`

---

### 7. Data 数据模块

##### 数据导出 (Export)
- **文件**: `src/pages/Data/Export.tsx`
- **API 接口**: 需根据导出类型调用对应接口

---

### 8. Dashboard 首页

##### 仪表盘 (Dashboard)
- **文件**: `src/pages/Dashboard/index.tsx`
- **API 接口**:
  - 销售数据: `GET /api/analytics/sales-dashboard`
  - 客户数据: `GET /api/analytics/customer-dashboard`
  - 商品数据: `GET /api/analytics/product-dashboard`
  - 销售趋势: `GET /api/analytics/sales-trend`
- **注意**: 第 145 行存在硬编码 `percent={78}` (目标达成率)

---

## 二、shoppro-app 主站前端

### 1. Leads 线索模块

##### 线索分配 (LeadAssign)
- **文件**: `src/pages/Leads/LeadAssign.tsx`
- **问题**: 存在伪数据或硬编码

##### 线索列表 (LeadList)
- **文件**: `src/pages/Leads/LeadList.tsx`
- **问题**: 第 221 行有 TODO 注释

---

### 2. Customers 客户模块

##### 客户列表 (CustomerList)
- **文件**: `src/pages/Customers/CustomerList.tsx`
- **问题**: 第 198 行有 TODO 注释

---

### 3. Operation 运营模块

##### 任务列表 (TaskList)
- **文件**: `src/pages/Operation/TaskList.tsx`
- **问题**: 存在伪数据或硬编码

---

### 4. Products 商品模块

##### 商品列表 (ProductList)
- **文件**: `src/pages/Products/ProductList.tsx`
- **问题**: 存在伪数据或硬编码

---

### 5. AI 模块

##### AI 线索预测 (AILeadPrediction)
- **文件**: `src/pages/AI/AILeadPrediction.tsx`
- **问题**: 存在伪数据或硬编码

##### AI 人物分析 (AIPersonaAnalysis)
- **文件**: `src/pages/AI/AIPersonaAnalysis.tsx`
- **问题**: 存在伪数据或硬编码

---

### 6. Tags 标签模块

##### 标签详情 (TagDetail)
- **文件**: `src/pages/Tags/TagDetail.tsx`
- **问题**: 存在伪数据或硬编码

---

### 7. System 系统模块

##### 个人中心 (Profile)
- **文件**: `src/pages/System/Profile.tsx`
- **问题**: 存在伪数据或硬编码

---

## 三、待实现 API 接口汇总

### Tenant (租户/企业)

| 功能 | 方法 | 路径 |
|------|------|------|
| 获取企业详情 | GET | `/api/tenant/{id}` |
| 获取部门树 | GET | `/api/department/tree` |
| 获取部门成员 | GET | `/api/department/{id}/members` |
| 添加成员 | POST | `/api/tenant/{id}/member` |
| 移除成员 | DELETE | `/api/tenant/{id}/member/{userId}` |

### User (用户)

| 功能 | 方法 | 路径 |
|------|------|------|
| 创建用户 | POST | `/api/user` |
| 更新用户 | PUT | `/api/user/{id}` |
| 删除用户 | DELETE | `/api/user/{id}` |
| 修改密码 | PUT | `/api/user/{id}/password` |

### Admin (管理员)

| 功能 | 方法 | 路径 |
|------|------|------|
| 创建管理员 | POST | `/api/admin` |
| 更新管理员 | PUT | `/api/admin/{id}` |
| 删除管理员 | DELETE | `/api/admin/{id}` |

### Operation (运营)

| 功能 | 方法 | 路径 |
|------|------|------|
| 获取 SOP 列表 | POST | `/api/operation/sop/list` |
| 创建 SOP | POST | `/api/operation/sop` |
| 更新 SOP | PUT | `/api/operation/sop/{id}` |
| 删除 SOP | DELETE | `/api/operation/sop/{id}` |
| 获取自动化规则列表 | POST | `/api/operation/automation-rule/list` |
| 创建自动化规则 | POST | `/api/operation/automation-rule` |
| 更新自动化规则 | PUT | `/api/operation/automation-rule/{id}` |
| 删除自动化规则 | DELETE | `/api/operation/automation-rule/{id}` |
| 切换规则状态 | PUT | `/api/operation/automation-rule/{id}/toggle` |

### Acquisition (获客)

| 功能 | 方法 | 路径 |
|------|------|------|
| 获取渠道码列表 | POST | `/api/acquisition/channel-code/list` |
| 创建渠道码 | POST | `/api/acquisition/channel-code` |
| 更新渠道码 | PUT | `/api/acquisition/channel-code/{id}` |
| 删除渠道码 | DELETE | `/api/acquisition/channel-code/{id}` |
| 获取欢迎语列表 | POST | `/api/acquisition/welcome-message/list` |
| 创建欢迎语 | POST | `/api/acquisition/welcome-message` |
| 更新欢迎语 | PUT | `/api/acquisition/welcome-message/{id}` |
| 删除欢迎语 | DELETE | `/api/acquisition/welcome-message/{id}` |

---

## 四、修改优先级

### P0 - 必须修改 (功能不可用)

1. **EnterpriseTeam** - 添加/移除成员功能
2. **UserManagement** - 添加用户、修改密码
3. **Admins** - 创建管理员

### P1 - 高优先级 (影响核心功能)

1. **AutomationRules** - 自动化规则 CRUD
2. **WelcomeMessage** - 欢迎语管理
3. **ExecutionAudit** - 审计数据展示

### P2 - 中优先级 (优化体验)

1. **Dashboard** - 硬编码的达成率
2. **SopManagement** - SOP 管理
3. **ChannelCode** - 渠道码管理

---

## 五、修改建议

1. **统一命名**: 建议使用 `useRequest` 或 React Query 管理数据请求
2. **错误处理**: 添加全局错误处理和 loading 状态
3. **数据校验**: 使用 Zod 或 Yup 进行表单验证
4. **类型定义**: 完善 TypeScript 类型定义，减少 `any` 使用
