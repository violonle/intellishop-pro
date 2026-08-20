# 销售线索管理模块 (Module 3) 快速参考指南

## 📁 文件位置

```
backend/src/main/java/com/shoppro/
├── service/
│   └── impl/
│       └── LeadServiceImpl.java          ✅ 服务实现 (456行)
├── dto/
│   ├── LeadCreateDTO.java               ✅ 创建请求 (65行)
│   ├── LeadUpdateDTO.java               ✅ 更新请求 (69行)
│   └── LeadResponseVO.java              ✅ 响应对象 (87行)
└── controller/
    └── LeadController.java              ✅ 控制器 (318行)
```

## 🎯 核心功能

### 线索CRUD操作
```
POST   /leads                 创建线索
GET    /leads/{id}            获取详情
PUT    /leads/{id}            更新线索
DELETE /leads/{id}            删除线索
```

### 线索查询和搜索
```
GET /leads/list              分页查询（支持多维度过滤）
GET /leads/search            全文搜索（按标题/描述）
GET /leads/by-assignee/{id}  按分配人查询
```

### 线索操作
```
POST /leads/{id}/assign              分配线索
POST /leads/batch-assign             批量分配
POST /leads/{id}/status              修改状态
POST /leads/{id}/convert             转客户
```

### 统计和分析
```
GET /leads/statistics        线索统计信息
GET /leads/overdue           逾期线索
GET /leads/high-value        高价值线索
```

## 📊 线索状态流转

```
┌─────────┐      ┌──────────┐      ┌────────────┐      ┌──────────┐
│   new   │ ──→  │contacted │ ──→  │ qualified  │ ──→  │proposal  │
└─────────┘      └──────────┘      └────────────┘      └──────────┘
    ↓                ↓                   ↓                   ↓
  lost             lost               lost               lost
                                                            ↓
                                                      ┌─────────┐
                                                      │negotiat │
                                                      │  ion    │
                                                      └─────────┘
                                                           ↓
                                                        won/lost
```

## 🔐 权限配置

| 操作 | ADMIN | MANAGER | SALES | USER |
|------|-------|---------|-------|------|
| 列表/搜索 | ✓ | ✓ | ✓ | - |
| 详情 | ✓ | ✓ | ✓ | - |
| 创建 | ✓ | ✓ | ✓ | - |
| 编辑 | ✓ | ✓ | ✓ | - |
| 删除 | ✓ | ✓ | - | - |
| 分配 | ✓ | ✓ | - | - |
| 状态转移 | ✓ | ✓ | ✓ | - |
| 转客户 | ✓ | ✓ | ✓ | - |
| 统计 | ✓ | ✓ | - | - |

## 📝 API 示例

### 创建线索
```bash
curl -X POST http://localhost:8080/api/leads \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "title": "客户A的购车需求",
    "priority": "high",
    "description": "客户对A6L感兴趣",
    "customerId": 1,
    "source": "website",
    "estimatedValue": 500000,
    "budgetRange": "40-60万",
    "decisionTimeline": "2周内",
    "interestedProducts": ["A6L", "Q7"],
    "assignedTo": 1,
    "followUpDate": "2024-10-25"
  }'
```

### 查询线索列表（带过滤）
```bash
curl "http://localhost:8080/api/leads/list?pageNo=1&pageSize=10&status=qualified&priority=high" \
  -H "Authorization: Bearer <token>"
```

### 分配线索
```bash
curl -X POST "http://localhost:8080/api/leads/1/assign?assignTo=2" \
  -H "Authorization: Bearer <token>"
```

### 线索转客户
```bash
curl -X POST http://localhost:8080/api/leads/1/convert \
  -H "Authorization: Bearer <token>"
```

## 🔧 配置说明

### 默认值
- 状态 (status): `new`
- 优先级 (priority): `medium`

### 过滤参数
```
priority: low|medium|high|urgent
status: new|contacted|qualified|proposal|negotiation|won|lost
stage: 自定义销售阶段
source: 自定义来源渠道
```

## 🔗 依赖关系

### 服务层依赖
```
LeadServiceImpl
├── LeadRepository (已存在)
├── CustomerRepository (用于转客户)
├── BusinessException (异常处理)
└── ResourceNotFoundException (异常处理)
```

### 控制层依赖
```
LeadController
├── LeadService
├── ApiResponse (统一响应)
├── SecurityContextHolder (获取用户信息)
└── Swagger注解 (文档)
```

## 🧪 集成测试清单

- [ ] 创建线索（正常、缺少必填字段）
- [ ] 查询线索列表（空、有数据、分页）
- [ ] 搜索线索（命中、无结果）
- [ ] 更新线索（部分字段、非法状态转移）
- [ ] 删除线索（正常、不存在）
- [ ] 分配线索（单条、批量）
- [ ] 状态转移（合法、非法）
- [ ] 线索转客户（成功、已转过）
- [ ] 权限控制（不同角色）

## 📈 性能优化建议

1. **使用分页** - 避免一次性加载大量数据
2. **索引优化** - 充分利用 leads 表的索引
3. **缓存层** - 考虑添加 Redis 缓存热门查询
4. **异步处理** - 转客户操作可异步处理
5. **批量操作** - 提供批量分配等操作接口

## 🚀 后续扩展

### Module 4: 跟进记录系统
- 在 LeadServiceImpl 中创建跟进时，自动检查下一次跟进日期
- 集成跟进提醒功能

### Module 6: 数据分析系统
- 线索成功率分析报表
- 销售漏斗可视化
- 价值分布分析

### Module 7: 权限控制系统
- 添加部门级别的权限控制
- 实现线索分配权限管理

## 📞 常见问题

### Q: 如何批量分配线索？
A: 使用 `POST /leads/batch-assign?leadIds=1,2,3&assignTo=1`

### Q: 线索转客户后会发生什么？
A: 
1. 创建新客户记录
2. 关联客户ID到线索
3. 自动更新线索状态为 "won"
4. 记录转换时间

### Q: 如何查询我负责的线索？
A: 使用 `GET /leads/by-assignee/{userId}?pageNo=1&pageSize=10`

### Q: 可以直接从 "new" 转到 "won" 吗？
A: 不可以，必须按规定的状态流转路径

---

**完成日期**: 2024-10-19
**版本**: v1.0.0
**维护者**: ShopPro Team
