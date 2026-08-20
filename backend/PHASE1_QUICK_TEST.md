# Phase 1 快速测试指南

## 🚀 快速启动

### 1. 预备检查
```bash
# 检查数据库
mysql -u root -p123456 -e "USE shoppro_db; SHOW TABLES;" | grep users

# 检查Redis
redis-cli ping
# 返回: PONG
```

### 2. 编译和运行
```bash
cd /Users/yangyong/codebuddy/ShopPro/backend

# 清理之前的构建
mvn clean

# 跳过编译错误的文件，只编译核心
mvn compile -DskipTests -X 2>&1 | grep -E "SUCCESS|ERROR" | tail -5

# 运行项目
mvn spring-boot:run -DskipTests
```

### 3. 验证启动
```bash
# 另一个终端检查健康状态
curl -s http://localhost:8080/api/actuator/health | jq .

# 应该返回: {"status":"UP"}
```

---

## 🧪 API测试

### 方式一: Swagger UI (推荐)
访问: http://localhost:8080/api/swagger-ui.html

### 方式二: cURL 命令

#### 1. 发送验证码
```bash
curl -X POST http://localhost:8080/api/auth/send-code \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "phone=13800138000"

# 响应: {"code":200,"message":"success","data":"验证码发送成功"}
```

#### 2. 用户注册
```bash
# 从日志中获取验证码 (目前直接生成存Redis)
# 可以使用: redis-cli GET "verify_code:13800138000"

curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "zhangsan",
    "phone": "13800138000",
    "email": "zhangsan@example.com",
    "password": "password123",
    "confirmPassword": "password123",
    "verifyCode": "123456",
    "realName": "张三",
    "agreeTerms": true
  }'

# 响应示例:
# {
#   "code": 200,
#   "message": "success",
#   "data": {
#     "accessToken": "eyJhbGc...",
#     "refreshToken": "eyJhbGc...",
#     "tokenType": "Bearer",
#     "expiresIn": 86400000,
#     "userId": 1,
#     "username": "zhangsan",
#     "phone": "13800138000",
#     "role": "user"
#   }
# }
```

#### 3. 用户登录
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "zhangsan",
    "password": "password123",
    "rememberMe": false
  }'

# 保存返回的 accessToken
```

#### 4. 使用Token访问受保护资源
```bash
# 先执行登录获取token
TOKEN=$(curl -s -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"zhangsan","password":"password123"}' \
  | jq -r '.data.accessToken')

echo "Token: $TOKEN"

# 使用Token访问其他接口 (需要实现)
curl -X GET http://localhost:8080/api/users/me \
  -H "Authorization: Bearer $TOKEN"
```

#### 5. 刷新Token
```bash
# 获取refreshToken
REFRESH_TOKEN=$(curl -s -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"zhangsan","password":"password123"}' \
  | jq -r '.data.refreshToken')

# 使用refreshToken获取新的accessToken
curl -X POST http://localhost:8080/api/auth/refresh \
  -H "Authorization: Bearer $REFRESH_TOKEN"
```

#### 6. 用户登出
```bash
ACCESS_TOKEN="your_access_token_here"

curl -X POST http://localhost:8080/api/auth/logout \
  -H "Authorization: Bearer $ACCESS_TOKEN"

# 响应: {"code":200,"message":"success","data":"登出成功"}
```

---

## 🔍 调试技巧

### 1. 查看生成的验证码
```bash
redis-cli
> GET "verify_code:13800138000"
# 返回: "123456"

# 或直接命令行
redis-cli GET "verify_code:13800138000"
```

### 2. 查看缓存的Token
```bash
redis-cli
> GET "refresh_token:zhangsan"
# 返回: "eyJhbGc..."
```

### 3. 查看用户数据库
```bash
mysql -u root -p123456 shoppro_db

SELECT id, username, phone, email, role, status, created_at 
FROM users WHERE username='zhangsan';
```

### 4. 检查Token内容
访问 https://jwt.io 并粘贴 accessToken，可以看到：
```json
{
  "sub": "zhangsan",
  "iat": 1697890123,
  "exp": 1697976523
}
```

### 5. 项目日志
```bash
# 查看最新日志
tail -f /Users/yangyong/codebuddy/ShopPro/backend/logs/application.log

# 或在运行日志中直接查看Spring Boot输出
```

---

## 📋 测试检查清单

- [ ] 项目成功启动，控制台显示"ShopPro AI智能SCRM系统已启动"
- [ ] Swagger UI 可以访问 (http://localhost:8080/api/swagger-ui.html)
- [ ] 发送验证码接口返回成功
- [ ] 用户注册成功，获得Token
- [ ] 用户登录成功，获得Token
- [ ] Token包含正确的用户名信息
- [ ] Token刷新返回新Token
- [ ] 登出成功，Token被清除
- [ ] 数据库中创建了新用户记录
- [ ] Redis缓存正常工作

---

## ⚠️ 常见问题

### 1. 编译错误: "非法字符"
**原因**: 现有文件编码问题  
**解决**: 只运行Phase 1相关代码，暂不编译整个项目

### 2. MySQL连接失败
**原因**: MySQL未运行或凭证错误  
**解决**: 
```bash
# 启动MySQL
brew services start mysql

# 检查配置
cat /Users/yangyong/codebuddy/ShopPro/backend/target/classes/application.yml | grep -A 5 datasource
```

### 3. Redis连接失败
**原因**: Redis未运行  
**解决**:
```bash
brew services start redis

# 检查
redis-cli ping
```

### 4. Token验证失败
**原因**: Token格式错误或已过期  
**解决**:
- 确保使用 "Bearer {token}" 格式
- 检查token过期时间
- 使用refresh token获取新token

### 5. CORS跨域错误
**原因**: 前端origin未在白名单中  
**解决**: 在 SecurityConfig 的 corsConfigurationSource 方法中添加前端地址

---

## 📊 预期输出示例

### 登录成功响应
```json
{
  "code": 200,
  "message": "success",
  "timestamp": "2024-10-21T12:00:00",
  "data": {
    "accessToken": "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJ6aGFuZ3NhbiIsImlhdCI6MTY5Nzg5MDEyMywiZXhwIjoxNjk3OTc2NTIzfQ.xxx",
    "refreshToken": "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJ6aGFuZ3NhbiIsImlhdCI6MTY5Nzg5MDEyMywiZXhwIjoxNjk4NDk1MzIzfQ.yyy",
    "tokenType": "Bearer",
    "expiresIn": 86400000,
    "userId": 1,
    "username": "zhangsan",
    "phone": "13800138000",
    "email": "zhangsan@example.com",
    "realName": "张三",
    "role": "user"
  }
}
```

### 错误响应示例
```json
{
  "code": 400,
  "message": "用户名或密码错误",
  "timestamp": "2024-10-21T12:00:00"
}
```

---

## 🎯 下一步

完成Phase 1测试后，可以：

1. **修复现有文件编码问题** (可选)
2. **进行集成测试** (与Phase 2结合)
3. **开始Phase 2: CRUD接口**
   - 实现Leads模块API
   - 实现Customers模块API
   - 实现Products模块API

---

**测试时间**: ~15-20分钟  
**困难度**: ⭐⭐ (简单)  
**必需环境**: Java 11+, MySQL, Redis
