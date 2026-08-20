# ShopPro 后端API实现指南

## 📋 项目技术栈
- **框架**: Spring Boot 2.7.18
- **数据库**: MySQL 8.0
- **ORM**: MyBatis Plus 3.5.3
- **认证**: JWT + Spring Security
- **缓存**: Redis
- **文档**: Swagger/Springfox 3.0
- **工具**: Lombok, Hutool, FastJSON

---

## 🎯 API实现清单

### Phase 1: 认证系统 (PRIORITY: 🔴 HIGH)

#### 1.1 认证端点

**POST /api/auth/login**
```java
Request:
{
  "username": "user@example.com",  // 支持邮箱/用户名/手机号
  "password": "password123"
}

Response:
{
  "code": 0,
  "message": "Success",
  "data": {
    "token": "eyJhbGc...",
    "refreshToken": "eyJhbGc...",
    "user": {
      "id": 1,
      "username": "zhangsan",
      "email": "zhangsan@example.com",
      "phone": "13800000001",
      "name": "张三",
      "avatar": "https://...",
      "role": "salesman"
    }
  }
}
```

**POST /api/auth/register**
```java
Request:
{
  "username": "newuser",
  "email": "newuser@example.com",
  "phone": "13800000002",
  "password": "password123",
  "name": "李四"
}

Response: Same as login
```

**POST /api/auth/refresh**
```java
Request:
{
  "refreshToken": "eyJhbGc..."
}

Response: Same as login (new token)
```

**POST /api/auth/logout**
```java
Headers: Authorization: Bearer {token}

Response:
{
  "code": 0,
  "message": "Logout successful"
}
```

**GET /api/auth/verify**
```java
Headers: Authorization: Bearer {token}

Response:
{
  "code": 0,
  "data": {
    "valid": true,
    "expiresIn": 3600
  }
}
```

#### 1.2 实现步骤

✅ **已有基础**:
- AuthController.java
- JWT工具类
- Spring Security配置

📝 **需要实现**:
1. JWT工具类增强
   - Token生成（access + refresh）
   - Token验证
   - Token解析
   - Token刷新逻辑

2. AuthService业务逻辑
   - 用户注册验证
   - 密码加密存储
   - Token生成和保存
   - 登出处理

3. AuthController完整实现
   - 参数验证
   - 错误处理
   - 响应格式统一

4. SecurityConfig配置
   - JWT过滤器
   - 放行路径
   - CORS配置

---

### Phase 2: 数据CRUD端点 (PRIORITY: 🟠 MEDIUM)

#### 2.1 Leads API

**GET /api/leads**
```java
Parameters:
- page: 1
- limit: 20
- search: "搜索词"
- status: "pending,contacted,qualified,converted"
- priority: "high,medium,low"

Response:
{
  "code": 0,
  "data": {
    "records": [...],
    "total": 100,
    "page": 1,
    "pageSize": 20,
    "pages": 5
  }
}
```

**GET /api/leads/{id}** - 获取线索详情
**POST /api/leads** - 创建线索
**PUT /api/leads/{id}** - 更新线索
**DELETE /api/leads/{id}** - 删除线索
**POST /api/leads/{id}/assign** - 分配线索

#### 2.2 Customers API

**GET /api/customers** - 客户列表
**GET /api/customers/{id}** - 客户详情
**POST /api/customers** - 创建客户
**PUT /api/customers/{id}** - 更新客户
**DELETE /api/customers/{id}** - 删除客户
**GET /api/customers/{id}/profile** - 客户档案
**GET /api/customers/{id}/interactions** - 客户互动记录

#### 2.3 Products API

**GET /api/products** - 产品列表（支持分类筛选）
**GET /api/products/{id}** - 产品详情
**POST /api/products** - 创建产品
**PUT /api/products/{id}** - 更新产品
**DELETE /api/products/{id}** - 删除产品
**GET /api/products/{id}/inventory** - 库存信息
**PUT /api/products/{id}/inventory** - 更新库存

#### 2.4 实现步骤

✅ **已有基础**:
- LeadController.java
- CustomerController.java
- ProductController.java
- 相应的Service和DTO

📝 **需要完成**:
1. Service业务逻辑完善
   - 分页查询实现
   - 搜索过滤逻辑
   - 关联数据加载

2. Controller接口完善
   - 参数验证
   - 权限检查
   - 响应格式统一

3. 数据库表设计
   - 确保所有字段
   - 索引优化
   - 关联关系

---

### Phase 3: Analytics API (PRIORITY: 🟡 MEDIUM)

**GET /api/analytics/dashboard**
```java
Response:
{
  "code": 0,
  "data": {
    "stats": {
      "todayLeads": 12,
      "leadsChange": "+20% vs 昨日",
      "pendingFollowups": 8,
      "followupsPriority": "2个优先",
      "monthlySales": "28500",
      "salesProgress": "已达成85%",
      "conversionRate": "32.5%",
      "conversionChange": "+5% vs 上月"
    },
    "aiInsight": "根据分析，近期线索质量提升显著...",
    "recentActivities": [...]
  }
}
```

**GET /api/analytics/sales**
- 支持按日期范围、团队成员、产品等筛选

**GET /api/analytics/performance**
- 团队业绩排行
- 个人业绩统计

**GET /api/analytics/export/{type}**
- 支持 Excel、PDF 导出

---

### Phase 4: AI API (PRIORITY: 🟢 LOW)

**GET /api/ai/suggestions**
- 获取AI建议和洞察

**POST /api/ai/analysis**
- 执行AI分析

**GET /api/ai/scripts**
- 获取推荐话术

---

## 🔧 核心配置实现

### CORS配置

```java
@Configuration
public class CorsConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOriginPatterns("*")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true)
                .maxAge(3600);
    }
}
```

### 全局异常处理

```java
@RestControllerAdvice
public class GlobalExceptionHandler {
    
    @ExceptionHandler(RuntimeException.class)
    public ApiResponse<Object> handleRuntimeException(RuntimeException e) {
        return ApiResponse.fail(500, e.getMessage());
    }
    
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ApiResponse<Object> handleValidationException(MethodArgumentNotValidException e) {
        return ApiResponse.fail(400, "参数验证失败");
    }
    
    @ExceptionHandler(AuthenticationException.class)
    public ApiResponse<Object> handleAuthException(AuthenticationException e) {
        return ApiResponse.fail(401, "认证失败");
    }
}
```

### 标准响应格式

```java
@Data
@AllArgsConstructor
public class ApiResponse<T> {
    private int code;           // 0: 成功, 非0: 失败
    private String message;     // 响应信息
    private T data;             // 响应数据
    private long timestamp;     // 时间戳
    
    public static <T> ApiResponse<T> success(T data) {
        return new ApiResponse<>(0, "Success", data, System.currentTimeMillis());
    }
    
    public static <T> ApiResponse<T> fail(int code, String message) {
        return new ApiResponse<>(code, message, null, System.currentTimeMillis());
    }
}
```

### 分页查询封装

```java
@Data
public class PageRequest {
    private int page = 1;
    private int pageSize = 20;
    private String search;
    private String orderBy;
    private String sort;
    
    public IPage<T> getPage() {
        return new Page<>(this.page, this.pageSize);
    }
}

@Data
public class PageVO<T> {
    private List<T> records;
    private long total;
    private int page;
    private int pageSize;
    private int pages;
}
```

---

## 📊 数据库表设计

### 用户表 (users)
```sql
CREATE TABLE users (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  phone VARCHAR(20) UNIQUE,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(100),
  avatar VARCHAR(255),
  role VARCHAR(50),
  status INT DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_username (username)
);
```

### 线索表 (leads)
```sql
CREATE TABLE leads (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  phone VARCHAR(20),
  email VARCHAR(100),
  company VARCHAR(100),
  source VARCHAR(50),
  status VARCHAR(50),
  priority VARCHAR(20),
  assigned_to BIGINT,
  notes TEXT,
  created_by BIGINT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_status (status),
  INDEX idx_priority (priority),
  INDEX idx_assigned (assigned_to),
  FOREIGN KEY (assigned_to) REFERENCES users(id)
);
```

### 客户表 (customers)
```sql
CREATE TABLE customers (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  phone VARCHAR(20),
  email VARCHAR(100),
  company VARCHAR(100),
  status VARCHAR(50),
  total_amount DECIMAL(12, 2),
  orders INT DEFAULT 0,
  owner_id BIGINT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_phone (phone),
  INDEX idx_email (email),
  INDEX idx_owner (owner_id),
  FOREIGN KEY (owner_id) REFERENCES users(id)
);
```

### 产品表 (products)
```sql
CREATE TABLE products (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  sku VARCHAR(50) UNIQUE NOT NULL,
  price DECIMAL(12, 2),
  stock INT,
  category_id BIGINT,
  image VARCHAR(255),
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_sku (sku),
  INDEX idx_category (category_id)
);
```

---

## 🚀 部署配置

### application.properties
```properties
# Server
server.port=8080
server.servlet.context-path=/api

# Database
spring.datasource.url=jdbc:mysql://localhost:3306/shoppro?useUnicode=true&characterEncoding=utf8mb4
spring.datasource.username=root
spring.datasource.password=password
spring.jpa.hibernate.ddl-auto=update

# Redis
spring.redis.host=localhost
spring.redis.port=6379
spring.redis.password=

# JWT
jwt.secret=your-secret-key-here
jwt.expiration=3600000
jwt.refreshExpiration=604800000

# Swagger
springfox.documentation.swagger-ui.enabled=true
```

---

## ✅ 实现检查清单

### 第1阶段：认证系统
- [ ] JWT工具类完成
- [ ] AuthService业务逻辑
- [ ] AuthController实现
- [ ] SecurityConfig配置
- [ ] 单元测试通过

### 第2阶段：CRUD接口
- [ ] LeadService + Controller
- [ ] CustomerService + Controller
- [ ] ProductService + Controller
- [ ] 分页/搜索/过滤实现
- [ ] 集成测试通过

### 第3阶段：分析和AI
- [ ] AnalyticsService实现
- [ ] AIService集成
- [ ] 数据聚合查询

### 第4阶段：测试和优化
- [ ] API文档完整
- [ ] 性能优化
- [ ] 安全审计

---

## 🧪 快速测试

### 使用Postman测试

1. **登录**
```
POST http://localhost:8080/api/auth/login
{
  "username": "admin",
  "password": "admin123"
}
```

2. **创建线索**
```
POST http://localhost:8080/api/leads
Authorization: Bearer {token}
{
  "name": "新线索",
  "phone": "13800000001",
  "company": "公司名",
  "source": "电话咨询"
}
```

3. **查询线索列表**
```
GET http://localhost:8080/api/leads?page=1&limit=20
Authorization: Bearer {token}
```

---

## 📚 相关文档

- [API_INTEGRATION_GUIDE.md](../shoppro-app/API_INTEGRATION_GUIDE.md) - 前端集成指南
- [pom.xml](pom.xml) - 依赖配置

---

**最后更新**: 2024-10-21  
**状态**: 📝 实现指南完成  
**下一步**: 开始编码实现
