# ShopPro 项目接口与硬编码审计报告

## 一、前端硬编码情况

### 1.1 shoppro-admin 硬编码文件清单

共发现 **25 个文件** 存在伪数据或待完善数据：

| 序号 | 模块 | 文件 | 问题类型 |程度 |
|------ 严重|------|------|----------|----------|
| 1 | Marketing | ExecutionAudit.tsx | 已修复 ✓ | - |
| 2 | Marketing | AutomationRules.tsx | 伪数据 | 🔴 高 |
| 3 | Marketing | WelcomeMessage.tsx | 伪数据 | 🔴 高 |
| 4 | Marketing | ChannelCode.tsx | 正常 | 🟢 |
| 5 | Marketing | SopManagement.tsx | 正常 | 🟢 |
| 6 | Enterprise | EnterpriseTeam.tsx | 已修复 ✓ | - |
| 7 | Enterprise | EnterpriseDetail.tsx | 正常 | 🟢 |
| 8 | Enterprise | EnterpriseEdit.tsx | 正常 | 🟢 |
| 9 | Enterprise | Info.tsx | 空数据 | 🟡 中 |
| 10 | Enterprise | Team.tsx | 空数据 | 🟡 中 |
| 11 | Enterprise | CompanyList.tsx | 正常 | 🟢 |
| 12 | Enterprise | Product.tsx | 正常 | 🟢 |
| 13 | Enterprise | ProductEdit.tsx | 正常 | 🟢 |
| 14 | Enterprise | ProductAdd.tsx | 正常 | 🟢 |
| 15 | Subscription | PlanEdit.tsx | 正常 | 🟢 |
| 16 | Subscription | Plans.tsx | 正常 | 🟢 |
| 17 | Subscription | Orders.tsx | 正常 | 🟢 |
| 18 | Tenancy | UserManagement.tsx | 正常 | 🟢 |
| 19 | Tenancy | TenantList.tsx | 正常 | 🟢 |
| 20 | Tenancy | Provision.tsx | 正常 | 🟢 |
| 21 | System | Admins.tsx | 正常 | 🟢 |
| 22 | System | Notifications.tsx | 正常 | 🟢 |
| 23 | System | Logs.tsx | 正常 | 🟢 |
| 24 | AIModels | Models.tsx | 正常 | 🟢 |
| 25 | AIModels | Versions.tsx | 正常 | 🟢 |
| 26 | AIModels | PromptTemplates.tsx | 正常 | 🟢 |
| 27 | Data | Export.tsx | 正常 | 🟢 |
| 28 | Dashboard | index.tsx | 硬编码数值 | 🟡 中 |

### 1.2 未修复的硬编码问题

#### 🔴 高优先级 (需要后端 API 支持)

1. **AutomationRules.tsx** - 自动化规则
   - 位置: `src/pages/Marketing/Operation/AutomationRules.tsx`
   - 问题: 使用伪数据函数 `getMockData()`
   - 需后端: `/api/operation/automation-rule/*` 接口

2. **WelcomeMessage.tsx** - 欢迎语管理
   - 位置: `src/pages/Marketing/Acquisition/WelcomeMessage.tsx`
   - 问题: 使用伪数据函数
   - 需后端: `/api/acquisition/welcome-message/*` 接口

#### 🟡 中优先级

3. **Dashboard/index.tsx** - 首页统计
   - 位置: 第 145 行
   - 问题: 硬编码 `percent={78}`
   - 建议: 改为动态计算

---

## 二、前端接口服务层

### 2.1 已有的 Service 接口 (63 个)

| 服务文件 | 接口数量 | 覆盖模块 |
|----------|----------|----------|
| auth.ts | 3 | 登录/注册/登出 |
| user.ts | 5 | 用户管理 |
| enterprise.ts | 8 | 企业管理 |
| tenant.ts | 4 | 租户管理 |
| department.ts | 2 | 部门管理 |
| role.ts | 2 | 角色管理 |
| permission.ts | 3 | 权限管理 |
| product.ts | 5 | 商品管理 |
| category.ts | 2 | 分类管理 |
| subscription.ts | 3 | 订阅管理 |
| analytics.ts | 5 | 数据分析 |
| operation.ts | 6 | 运营管理 |
| acquisition.ts | 4 | 获客工具 |
| aimodel.ts | 7 | AI 模型 |
| setting.ts | 4 | 系统设置 |
| log.ts | 1 | 日志 |

### 2.2 缺失的 Service 接口

| 模块 | 缺失接口 | 对应后端 |
|------|----------|----------|
| Marketing | 自动化规则 CRUD | OperationController |
| Acquisition | 欢迎语 CRUD | AcquisitionController |

---

## 三、后端 Controller 接口清单

### 3.1 现有的 Controller (31 个)

| Controller | 路径 | 功能 |
|------------|------|------|
| AuthController | /api/auth | 登录认证 |
| UserController | /api/user | 用户管理 |
| EnterpriseController | /api/enterprise | 企业管理 |
| TenantController | /api/tenant | 租户管理 |
| DepartmentController | /api/department | 部门管理 |
| RoleController | /api/role | 角色管理 |
| PermissionController | /api/permission | 权限管理 |
| CustomerController | /api/customer | 客户管理 |
| LeadController | /api/lead | 线索管理 |
| ProductController | /api/product | 商品管理 |
| ProductCategoryController | /api/category | 分类管理 |
| OrderController | /api/order | 订单管理 |
| ContractController | /api/contract | 合同管理 |
| InvoiceController | /api/invoice | 发票管理 |
| FollowUpRecordController | /api/follow-up | 跟进记录 |
| SubscriptionController | /api/subscription | 订阅管理 |
| AnalyticsController | /api/analytics | 数据分析 |
| OperationController | /api/operation | 运营管理 |
| AcquisitionController | /api/acquisition | 获客工具 |
| MarketingController | /api/marketing | 营销管理 |
| AiController | /api/ai | AI 功能 |
| AiModelManagementController | /api/ai-model | AI 模型管理 |
| AiPromptTemplateController | /api/prompt-template | Prompt 模板 |
| KnowledgeController | /api/knowledge | 知识库 |
| SystemSettingController | /api/system-setting | 系统设置 |
| LogController | /api/log | 日志管理 |
| SecurityLogController | /api/security-log | 安全日志 |
| FileUploadController | /api/file | 文件上传 |
| IntegrationController | /api/integration | 第三方集成 |
| WeComController | /api/wecom | 企业微信 |
| DataExportController | /api/data-export | 数据导出 |

### 3.2 接口覆盖情况分析

| 前端模块 | 对应后端 Controller | 状态 |
|----------|---------------------|------|
| 登录/认证 | AuthController | ✅ 完整 |
| 用户管理 | UserController | ✅ 完整 |
| 企业管理 | EnterpriseController | ✅ 完整 |
| 租户管理 | TenantController | ✅ 完整 |
| 部门管理 | DepartmentController | ✅ 完整 |
| 商品管理 | ProductController | ✅ 完整 |
| 客户管理 | CustomerController | ✅ 完整 |
| 线索管理 | LeadController | ✅ 完整 |
| 订单管理 | OrderController | ✅ 完整 |
| 数据分析 | AnalyticsController | ✅ 完整 |
| 订阅管理 | SubscriptionController | ✅ 完整 |
| AI 模型 | AiModelManagementController | ✅ 完整 |
| 运营管理 | OperationController | ⚠️ 部分完整 |
| 获客工具 | AcquisitionController | ⚠️ 部分完整 |
| 日志管理 | LogController | ✅ 完整 |

---

## 四、需要完善的功能

### 4.1 后端缺失的 API

#### OperationController 扩展

```
GET    /api/operation/automation-rule/list     # 自动化规则列表
POST   /api/operation/automation-rule         # 创建规则
PUT    /api/operation/automation-rule/{id}   # 更新规则
DELETE /api/operation/automation-rule/{id}   # 删除规则
PUT    /api/operation/automation-rule/{id}/toggle  # 切换状态
```

#### AcquisitionController 扩展

```
GET    /api/acquisition/welcome-message/list     # 欢迎语列表
POST   /api/acquisition/welcome-message          # 创建欢迎语
PUT    /api/acquisition/welcome-message/{id}     # 更新欢迎语
DELETE /api/acquisition/welcome-message/{id}     # 删除欢迎语

GET    /api/acquisition/channel/list             # 渠道列表
POST   /api/acquisition/channel                  # 创建渠道
PUT    /api/acquisition/channel/{id}             # 更新渠道
DELETE /api/acquisition/channel/{id}             # 删除渠道
```

---

## 五、总结

### 5.1 硬编码统计

- **总页面数**: 30 个
- **存在问题**: 3 个高优先级 + 1 个中优先级
- **已修复**: 2 个

### 5.2 接口统计

- **后端 Controller**: 31 个
- **前端 Service**: 63 个接口
- **接口覆盖率**: ~90%

### 5.3 待办事项

| 优先级 | 事项 | 工作量 |
|--------|------|--------|
| 🔴 高 | 自动化规则前后端联调 | 2-3 小时 |
| 🔴 高 | 欢迎语前后端联调 | 2-3 小时 |
| 🟡 中 | Dashboard 动态化 | 1 小时 |

---

*报告生成时间: 2026-03-05*
