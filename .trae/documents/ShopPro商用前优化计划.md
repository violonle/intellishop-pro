# ShopPro 商用前优化计划

> 审查日期：2026-03-04
> 项目定位：AI智能SCRM系统，面向B2B/高端零售行业

---

## 一、基础架构优化

### 1.1 安全问题（严重）

| 问题 | 严重程度 | 位置 | 影响 |
|------|----------|------|------|
| **敏感业务路径无认证** | 🔴 严重 | [SecurityConfig.java](file:///Users/yangyong/codebuddy/ShopPro/backend/shoppro-web/src/main/java/com/shoppro/config/SecurityConfig.java) | `/leads/**`, `/customers/**`, `/products/**` 无需认证即可访问，数据泄露风险 |
| **后门账号存在** | 🔴 严重 | [AuthServiceImpl.java:83-89](file:///Users/yangyong/codebuddy/ShopPro/backend/shoppro-infra/src/main/java/com/shoppro/service/impl/AuthServiceImpl.java#L83) | `manager001` 用户可绕过密码验证登录 |
| **权限校验失效** | 🔴 严重 | [UserController.java:233](file:///Users/yangyong/codebuddy/ShopPro/backend/shoppro-web/src/main/java/com/shoppro/controller/UserController.java#L233) | `isCurrentUser()` 方法始终返回 `true` |
| **硬编码用户ID** | 🟠 高 | [OperationServiceImpl.java:105](file:///Users/yangyong/codebuddy/ShopPro/backend/shoppro-infra/src/main/java/com/shoppro/service/impl/OperationServiceImpl.java#L105) | 任务分配硬编码为 `1L` |

**修复方案：**
1. 移除 SecurityConfig 中 `/leads/**`, `/customers/**`, `/products/**` 的公开访问配置
2. 删除 AuthServiceImpl 中的后门账号代码
3. 实现 `isCurrentUser()` 方法，从 SecurityContext 获取当前用户ID进行比较
4. 从 SecurityContext 获取当前用户ID替代硬编码

### 1.2 数据库问题（严重）

| 问题 | 严重程度 | 位置 | 影响 |
|------|----------|------|------|
| **外键引用备份表** | 🔴 严重 | [shoppro_db_dump.sql](file:///Users/yangyong/codebuddy/ShopPro/database/scripts/shoppro_db_dump.sql#L238-L239) | `customers`, `leads`, `follow_up_records` 表外键引用 `users_backup_20251220` |
| **表结构重复定义** | 🟠 高 | 多处 | `users` 视图 vs `user_profiles` + `employee_profiles`，`knowledge` vs `knowledge_base` |
| **缺少必要外键约束** | 🟠 高 | orders, order_items, customer_sops | 数据完整性无法保证 |
| **索引设计问题** | 🟡 中 | 多表 | 存在冗余索引和缺失索引 |

**修复方案：**
1. 修改外键约束，将引用改为 `user_profiles` 表
2. 统一表结构设计，删除冗余表
3. 为 orders, order_items, customer_sops, work_tasks 添加外键约束
4. 删除冗余索引，添加缺失索引

### 1.3 云存储未实现

| 问题 | 严重程度 | 位置 | 说明 |
|------|----------|------|------|
| **云存储SDK未集成** | 🟠 高 | [CloudStorageStrategy.java](file:///Users/yangyong/codebuddy/ShopPro/backend/shoppro-core/src/main/java/com/shoppro/service/storage/CloudStorageStrategy.java) | 阿里云OSS、AWS S3、腾讯云COS 共21个TODO未实现 |

**修复方案：**
1. 集成阿里云OSS SDK
2. 集成AWS S3 SDK
3. 集成腾讯云COS SDK
4. 实现统一的上传、下载、删除接口

### 1.4 基础设施配置

| 问题 | 严重程度 | 说明 |
|------|----------|------|
| **Redis连接失败** | 🟠 高 | 日志显示 `Unable to connect to Redis`，令牌缓存失效 |
| **API URL硬编码** | 🟡 中 | 前端API地址硬编码为 `localhost:8080` |
| **CORS端口限制** | 🟡 中 | 需要配置生产环境域名 |

**修复方案：**
1. 配置Redis连接，确保高可用
2. 使用环境变量配置API地址
3. 配置生产环境CORS白名单

---

## 二、功能补全

### 2.1 核心业务功能缺失

| 功能 | 优先级 | 状态 | 影响 |
|------|--------|------|------|
| **短信验证码发送** | 🔴 高 | TODO占位 | 用户无法通过手机验证码登录/注册 |
| **数据导入导出** | 🔴 高 | 部分实现 | 无法批量导入客户/线索数据 |
| **线索分配/转派** | 🟠 高 | API存在但前端未对接 | 团队协作受限 |
| **订单支付流程** | 🟠 高 | 模拟实现 | 无法完成真实交易 |
| **合同管理** | 🟡 中 | 未实现 | 无法管理销售合同 |
| **发票管理** | 🟡 中 | 未实现 | 财务流程不完整 |

### 2.2 后端TODO清单

| 模块 | 文件 | 行号 | 内容 |
|------|------|------|------|
| 认证 | AuthServiceImpl.java | 133 | 更新最后登录时间功能被注释 |
| 认证 | AuthServiceImpl.java | 283 | 短信验证码发送未实现 |
| 线索 | LeadServiceImpl.java | 383 | 线索来源统计缺失 |
| 线索 | LeadServiceImpl.java | 386 | 预估总价值统计缺失 |
| 跟进 | FollowUpRecordServiceImpl.java | 298 | 跟进时长统计缺失 |

### 2.3 前端功能缺失

| 页面 | 位置 | 状态 |
|------|------|------|
| 渠道码管理 | shoppro-admin App.tsx:119 | 占位 `(开发中)` |
| 欢迎语配置 | shoppro-admin App.tsx:120 | 占位 `(开发中)` |
| 自动化规则 | shoppro-admin App.tsx:121 | 占位 `(开发中)` |
| 执行审计 | shoppro-admin App.tsx:122 | 占位 `(开发中)` |
| SOP管理 | shoppro-app SopManagement.tsx:16 | 占位 `功能开发中` |
| SOP启动 | LeadList.tsx:280, CustomerList.tsx:402 | TODO未实现 |
| 添加用户API | UserManagement.tsx:221 | TODO未实现 |
| 修改密码API | UserManagement.tsx:235 | TODO未实现 |
| 创建管理员API | Admins.tsx:134 | TODO未实现 |
| 产品下架 | Product.tsx:93 | `功能开发中` |

### 2.4 统计分析功能

| 功能 | 状态 | 说明 |
|------|------|------|
| 线索来源统计 | ❌ 未实现 | TODO占位 |
| 预估总价值统计 | ❌ 未实现 | TODO占位 |
| 跟进平均时长 | ❌ 未实现 | TODO占位 |
| AI预警时间字段 | ⚠️ 占位数据 | 使用 `'刚刚'` 占位 |

---

## 三、体验优化

### 3.1 代码质量问题

| 问题 | 位置 | 说明 |
|------|------|------|
| CSS类名格式错误 | [MarketingAutomation.tsx:52](file:///Users/yangyong/codebuddy/ShopPro/shoppro-app/src/pages/Marketing/MarketingAutomation.tsx#L52) | `text - xs px - 2` 应为 `text-xs px-2` |
| 分页参数不统一 | MarketingController, LogController | 未使用 PaginationUtils |
| 异常处理不一致 | 多个Controller | 部分直接返回 ApiResponse.error()，部分抛出异常 |

### 3.2 数据库字段优化

| 表 | 缺失字段 | 用途 |
|----|----------|------|
| orders | delivery_address | 收货地址 |
| orders | invoice_info | 发票信息 |
| customers | total_purchase_amount | 累计消费金额 |
| customers | last_order_at | 最后下单时间 |
| leads | lost_reason | 丢失原因 |
| products | weight, volume | 物流属性 |

### 3.3 审计字段缺失

以下表缺少标准审计字段（deleted, updated_by, version）：

- orders
- order_items
- leads
- follow_up_records

### 3.4 JSON字段优化

以下JSON字段可能影响查询性能，建议拆分：

| 表 | 字段 | 建议 |
|----|------|------|
| customers | tags | 拆分为 customer_tags 关联表 |
| customers | preferences | 拆分为独立表 |
| products | specifications | 拆分为 product_specifications 表 |
| products | features | 拆分为独立表 |

### 3.5 前端体验优化

| 问题 | 说明 |
|------|------|
| 加载状态不统一 | 部分页面缺少loading状态 |
| 错误提示不友好 | 部分错误直接显示技术信息 |
| 表单验证不完整 | 部分表单缺少前端验证 |
| 响应式适配 | 部分页面移动端显示不佳 |

---

## 四、优先级排序

### P0 - 必须修复（阻塞商用）

1. 🔴 移除敏感路径的公开访问权限
2. 🔴 删除后门账号代码
3. 🔴 实现权限校验方法
4. 🔴 修复数据库外键引用问题
5. 🔴 配置Redis连接

### P1 - 高优先级（1-2周）

1. 🟠 实现短信验证码发送
2. 🟠 集成云存储SDK
3. 🟠 完成数据导入导出功能
4. 🟠 实现线索分配/转派功能
5. 🟠 完成SOP管理页面
6. 🟠 修复CSS类名格式错误

### P2 - 中优先级（2-4周）

1. 🟡 完成管理后台4个占位页面
2. 🟡 实现合同管理模块
3. 🟡 完善统计分析功能
4. 🟡 添加缺失的数据库字段
5. 🟡 统一异常处理方式
6. 🟡 配置生产环境CORS

### P3 - 低优先级（后续迭代）

1. 🟢 实现发票管理模块
2. 🟢 优化JSON字段设计
3. 🟢 完善前端体验
4. 🟢 添加请求速率限制
5. 🟢 完善安全审计日志

---

## 五、工作量估算

| 阶段 | 工作内容 | 预估工时 |
|------|----------|----------|
| P0 | 安全问题修复 | 3-5人日 |
| P0 | 数据库问题修复 | 2-3人日 |
| P1 | 核心功能补全 | 10-15人日 |
| P1 | 云存储集成 | 5-7人日 |
| P2 | 管理功能完善 | 8-12人日 |
| P2 | 体验优化 | 5-8人日 |
| P3 | 扩展功能 | 10-15人日 |

**总计：约 43-65 人日（约 2-3 个月）**

---

## 六、风险评估

| 风险 | 概率 | 影响 | 应对措施 |
|------|------|------|----------|
| 数据库结构变更导致数据丢失 | 中 | 高 | 备份数据库，编写迁移脚本 |
| 外键约束添加失败 | 中 | 中 | 分批添加，先清理脏数据 |
| 云存储集成兼容性问题 | 低 | 中 | 充分测试各平台SDK |
| 短信服务对接延迟 | 中 | 中 | 提前申请短信服务商资质 |

---

## 七、验收标准

### 安全验收

- [ ] 所有敏感API需要认证
- [ ] 无后门账号
- [ ] 权限校验正确
- [ ] 无硬编码敏感信息

### 功能验收

- [ ] 用户可通过手机验证码登录
- [ ] 可批量导入/导出数据
- [ ] 可分配/转派线索
- [ ] SOP流程可正常执行
- [ ] 云存储功能正常

### 性能验收

- [ ] API响应时间 < 500ms
- [ ] 数据库查询有合适索引
- [ ] Redis缓存正常工作

### 体验验收

- [ ] 无明显UI错误
- [ ] 错误提示友好
- [ ] 表单验证完整

---

*本计划基于代码审查结果生成，实际执行时可根据业务优先级调整。*
