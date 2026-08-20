# ShopPro AI智能SCRM系统 - 前后端集成指南

## 📋 目录
1. [集成概述](#集成概述)
2. [API客户端使用指南](#api客户端使用指南)
3. [各模块集成详细步骤](#各模块集成详细步骤)
4. [认证与授权](#认证与授权)
5. [错误处理](#错误处理)
6. [性能优化建议](#性能优化建议)

---

## 集成概述

### 系统架构
```
前端 (HTML/JavaScript)
    ↓
API客户端 (api-client.js)
    ↓
后端API (Spring Boot 8080/api)
    ↓
数据库 (MySQL) / 外部服务 (企业微信、钉钉等)
```

### 后端服务地址配置
- **本地开发**: `http://localhost:8080/api`
- **生产环境**: 需在 `application.yml` 中配置

### 前端文件结构
```
assets/
├── js/
│   ├── api-client.js        # ✅ 已完成 - 统一API客户端
│   ├── utils.js             # 工具函数库
│   ├── ui-components.js     # UI组件
│   └── websocket-manager.js # WebSocket实时通信
├── css/
│   ├── global-styles.css    # 全局样式
│   └── responsive.css       # 响应式设计
pages/
├── login.html               # 登录页面 (集成认证API)
├── dashboard.html           # 数据分析仪表板 (集成分析API)
├── customer-*.html          # 客户管理相关页面
├── leads.html               # 线索管理页面
├── product-*.html           # 产品管理页面
├── knowledge-*.html         # 知识库管理页面
└── ai.html                  # AI聊天页面 (已集成)
```

---

## API客户端使用指南

### 基础使用

#### 1. 导入API客户端
```html
<script src="../assets/js/api-client.js"></script>

<script>
    // API客户端已全局暴露为 window.api
    console.log(api); // APIClient实例
</script>
```

#### 2. 设置认证Token
```javascript
// 登录成功后设置token
api.setAuthToken(responseData.token);

// 后续请求会自动带上Authorization头
// Authorization: Bearer <token>
```

#### 3. 发起API调用
```javascript
// 获取用户列表
const response = await api.customers.list({ page: 1, pageSize: 10 });

// 创建客户
const newCustomer = await api.customers.create({
    name: '张三',
    phone: '13800138000',
    email: 'zhangsan@example.com'
});

// 更新客户
await api.customers.update(customerId, { status: 'active' });

// 删除客户
await api.customers.delete(customerId);
```

---

## 各模块集成详细步骤

### 【第1步】用户认证流程整合

#### login.html 集成
```html
<!DOCTYPE html>
<html>
<head>
    <script src="../assets/js/api-client.js"></script>
    <script src="../assets/js/utils.js"></script>
</head>
<body>
    <!-- 登录表单 -->
    <form id="loginForm" onsubmit="handleLogin(event)">
        <input type="text" id="username" placeholder="用户名" required>
        <input type="password" id="password" placeholder="密码" required>
        <button type="submit">登录</button>
    </form>

    <script>
        async function handleLogin(event) {
            event.preventDefault();
            
            try {
                // 调用后端认证API
                const response = await api.auth.login({
                    username: document.getElementById('username').value,
                    password: document.getElementById('password').value
                });
                
                // 保存token
                api.setAuthToken(response.token);
                
                // 保存用户信息
                localStorage.setItem('user_id', response.userId);
                localStorage.setItem('user_role', response.role);
                localStorage.setItem('user_name', response.userName);
                
                // 跳转到首页
                window.location.href = '../pages/dashboard.html';
                
            } catch (error) {
                alert('登录失败: ' + error.message);
            }
        }
        
        // 登出功能
        async function logout() {
            await api.auth.logout();
            api.setAuthToken(null);
            localStorage.clear();
            window.location.href = '../pages/login.html';
        }
    </script>
</body>
</html>
```

### 【第2步】知识库管理页面集成

#### knowledge-detail.html 集成富文本编辑器和文件上传
```html
<head>
    <!-- 引入TinyMCE富文本编辑器 -->
    <script src="https://cdn.tiny.cloud/1/your-api-key/tinymce/6/tinymce.min.js"></script>
</head>
<body>
    <form id="knowledgeForm">
        <input type="text" id="title" placeholder="标题" required>
        <textarea id="content" placeholder="内容"></textarea>
        
        <div id="fileUpload">
            <input type="file" id="attachments" multiple>
            <button type="button" onclick="uploadFiles()">上传附件</button>
            <div id="fileList"></div>
        </div>
        
        <button type="submit">保存知识库</button>
    </form>

    <script>
        // 初始化富文本编辑器
        tinymce.init({
            selector: '#content',
            plugins: 'image link media',
            toolbar: 'undo redo | formatselect | bold italic | alignleft aligncenter alignright | image link media'
        });

        // 文件上传
        async function uploadFiles() {
            const files = document.getElementById('attachments').files;
            const fileList = document.getElementById('fileList');
            
            for (let file of files) {
                try {
                    const result = await api.files.upload(file, 'knowledge', null);
                    
                    // 显示已上传文件
                    const item = document.createElement('div');
                    item.innerHTML = `
                        <p>${result.originalFileName} 
                        <a href="#" onclick="api.files.download(${result.id})">下载</a>
                        <button onclick="api.files.delete(${result.id})">删除</button>
                        </p>
                    `;
                    fileList.appendChild(item);
                    
                } catch (error) {
                    alert('上传失败: ' + error.message);
                }
            }
        }

        // 保存知识库
        document.getElementById('knowledgeForm').onsubmit = async function(e) {
            e.preventDefault();
            
            try {
                const content = tinymce.get('content').getContent();
                
                const data = {
                    title: document.getElementById('title').value,
                    content: content,
                    categoryId: 1 // 根据需要设置
                };
                
                const result = await api.knowledge.create(data);
                alert('保存成功');
                
            } catch (error) {
                alert('保存失败: ' + error.message);
            }
        };
    </script>
</body>
```

### 【第3步】客户/线索管理页面集成

#### customer-management.html 集成
```html
<body>
    <!-- 客户列表 -->
    <div id="customerList"></div>
    
    <!-- 添加/编辑客户 -->
    <form id="customerForm" style="display:none;">
        <input type="text" id="customerName" placeholder="客户名称" required>
        <input type="tel" id="customerPhone" placeholder="电话" required>
        <input type="email" id="customerEmail" placeholder="邮箱">
        <select id="customerLevel">
            <option value="normal">普通</option>
            <option value="vip">VIP</option>
            <option value="diamond">钻石</option>
        </select>
        <button type="submit">保存</button>
        <button type="button" onclick="closeForm()">取消</button>
    </form>

    <script>
        // 加载客户列表
        async function loadCustomers(page = 1) {
            try {
                const response = await api.customers.list({
                    page: page,
                    pageSize: 10
                });
                
                const html = response.records.map(customer => `
                    <div class="customer-item">
                        <h3>${customer.name}</h3>
                        <p>电话: ${customer.phone}</p>
                        <p>等级: ${customer.level}</p>
                        <button onclick="editCustomer(${customer.id})">编辑</button>
                        <button onclick="deleteCustomer(${customer.id})">删除</button>
                        <button onclick="assignCustomer(${customer.id})">分配</button>
                    </div>
                `).join('');
                
                document.getElementById('customerList').innerHTML = html;
                
            } catch (error) {
                alert('加载失败: ' + error.message);
            }
        }

        // 添加/编辑客户
        document.getElementById('customerForm').onsubmit = async function(e) {
            e.preventDefault();
            
            const customerId = this.dataset.customerId;
            const data = {
                name: document.getElementById('customerName').value,
                phone: document.getElementById('customerPhone').value,
                email: document.getElementById('customerEmail').value,
                level: document.getElementById('customerLevel').value
            };
            
            try {
                if (customerId) {
                    await api.customers.update(customerId, data);
                } else {
                    await api.customers.create(data);
                }
                
                alert('保存成功');
                loadCustomers();
                closeForm();
                
            } catch (error) {
                alert('保存失败: ' + error.message);
            }
        };

        function editCustomer(id) {
            // 显示表单并加载数据
            document.getElementById('customerForm').dataset.customerId = id;
            document.getElementById('customerForm').style.display = 'block';
        }

        function deleteCustomer(id) {
            if (confirm('确定删除?')) {
                api.customers.delete(id).then(() => {
                    loadCustomers();
                });
            }
        }

        function closeForm() {
            document.getElementById('customerForm').style.display = 'none';
        }

        // 分配客户
        async function assignCustomer(customerId) {
            const userId = prompt('输入分配给的用户ID:');
            if (userId) {
                await api.customers.assign(customerId, userId);
                alert('分配成功');
            }
        }

        // 页面加载
        window.onload = () => loadCustomers();
    </script>
</body>
```

### 【第4步】产品管理页面集成

#### product-management.html 集成
```javascript
// 产品CRUD操作
async function loadProducts() {
    const response = await api.products.list({ page: 1, pageSize: 20 });
    // 渲染产品列表...
}

async function createProduct(productData) {
    return await api.products.create(productData);
}

async function updateProduct(id, productData) {
    return await api.products.update(id, productData);
}

// 库存管理
async function updateStock(productId, quantity) {
    return await api.products.updateStock(productId, quantity);
}

// 产品分类
async function loadCategories() {
    const response = await api.productCategories.getTree();
    // 渲染分类树...
}
```

### 【第5步】数据分析仪表板集成

#### dashboard.html 集成
```javascript
// 初始化仪表板
async function initDashboard() {
    try {
        // 获取关键指标
        const dashboard = await api.analytics.getDashboard();
        
        // 显示销售数据
        displaySalesMetrics(dashboard);
        
        // 显示客户数据
        displayCustomerMetrics(dashboard);
        
        // 显示产品数据
        displayProductMetrics(dashboard);
        
        // 定时刷新 (每30秒)
        setInterval(initDashboard, 30000);
        
    } catch (error) {
        console.error('仪表板加载失败:', error);
    }
}

function displaySalesMetrics(dashboard) {
    const container = document.getElementById('salesMetrics');
    container.innerHTML = `
        <div class="metric">
            <h3>本月销售额</h3>
            <p>¥${dashboard.monthlySales}</p>
        </div>
        <div class="metric">
            <h3>成交订单数</h3>
            <p>${dashboard.ordersCount}</p>
        </div>
        <div class="metric">
            <h3>转化率</h3>
            <p>${(dashboard.conversionRate * 100).toFixed(2)}%</p>
        </div>
    `;
}

window.onload = initDashboard;
```

### 【第6步】权限控制集成

```javascript
// 检查用户权限
function checkPermission(requiredRole) {
    const userRole = localStorage.getItem('user_role');
    
    const roleHierarchy = {
        'admin': ['admin', 'manager', 'sales', 'user'],
        'manager': ['manager', 'sales', 'user'],
        'sales': ['sales', 'user'],
        'user': ['user']
    };
    
    return roleHierarchy[userRole]?.includes(requiredRole) || false;
}

// 根据权限显示/隐藏菜单
document.querySelectorAll('[data-permission]').forEach(el => {
    const permission = el.getAttribute('data-permission');
    if (!checkPermission(permission)) {
        el.style.display = 'none';
    }
});

// API调用时自动进行权限检查
api.addRequestInterceptor(async (config) => {
    const token = localStorage.getItem('auth_token');
    if (!token) {
        window.location.href = '../pages/login.html';
        throw new Error('未授权');
    }
    return config;
});
```

### 【第7步】第三方服务集成

```javascript
// 企业微信消息发送
async function sendWecomMessage(params) {
    return await api.integrations.wecom.sendMessage({
        touser: params.userId,
        msgtype: 'text',
        text: { content: params.content }
    });
}

// 发送SMS通知
async function sendSMS(phoneNumber, message) {
    return await api.integrations.sms.send({
        phone: phoneNumber,
        message: message
    });
}

// 发送邮件
async function sendEmail(to, subject, content) {
    return await api.integrations.email.send({
        to: to,
        subject: subject,
        content: content
    });
}

// 初始化支付
async function initiatePayment(orderId, amount) {
    return await api.integrations.payment.initiate({
        orderId: orderId,
        amount: amount,
        paymentMethod: 'alipay'
    });
}
```

---

## 认证与授权

### Token管理
```javascript
// 自动刷新token
api.addResponseInterceptor(async (response) => {
    if (response.status === 401) {
        // token过期，尝试刷新
        try {
            const newToken = await api.auth.refreshToken();
            api.setAuthToken(newToken.token);
        } catch (error) {
            // 刷新失败，重定向登录
            window.location.href = '../pages/login.html';
        }
    }
    return response;
});
```

### 基于角色的访问控制 (RBAC)
```javascript
// 检查角色是否有权限调用API
const userRole = localStorage.getItem('user_role');
const requiredRoles = ['admin', 'manager'];

if (!requiredRoles.includes(userRole)) {
    alert('您没有权限执行此操作');
    return;
}

// 调用API
await api.customers.create(data);
```

---

## 错误处理

### 通用错误处理模式
```javascript
try {
    const result = await api.customers.create(data);
    console.log('操作成功', result);
} catch (error) {
    if (error instanceof APIError) {
        // API错误
        if (error.isNetworkError()) {
            alert('网络连接失败');
        } else if (error.isAuthError()) {
            // 401 认证失败
            window.location.href = '../pages/login.html';
        } else if (error.isForbiddenError()) {
            // 403 无权限
            alert('您没有权限执行此操作');
        } else if (error.isServerError()) {
            // 5xx 服务器错误
            alert('服务器错误，请稍后重试');
        } else {
            alert('操作失败: ' + error.message);
        }
    } else {
        // 客户端错误
        console.error('发生错误:', error);
    }
}
```

---

## 性能优化建议

### 1. 缓存策略
```javascript
// 使用localStorage缓存常用数据
async function getCustomersWithCache(page) {
    const cacheKey = `customers_page_${page}`;
    const cached = localStorage.getItem(cacheKey);
    
    if (cached) {
        const data = JSON.parse(cached);
        // 检查缓存是否过期 (1小时)
        if (Date.now() - data.timestamp < 3600000) {
            return data.list;
        }
    }
    
    const list = await api.customers.list({ page, pageSize: 10 });
    localStorage.setItem(cacheKey, JSON.stringify({
        list,
        timestamp: Date.now()
    }));
    
    return list;
}
```

### 2. 分页加载
```javascript
// 虚拟滚动分页
let currentPage = 1;
const pageSize = 20;

async function loadMoreOnScroll() {
    const scrollTop = window.pageYOffset;
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;
    
    if (scrollTop + windowHeight > documentHeight - 100) {
        // 即将到底部，加载下一页
        currentPage++;
        const data = await api.customers.list({ 
            page: currentPage, 
            pageSize 
        });
        
        appendCustomersToDOM(data.records);
    }
}

window.addEventListener('scroll', loadMoreOnScroll);
```

### 3. 批量操作
```javascript
// 批量删除
async function deleteMultipleCustomers(customerIds) {
    for (let id of customerIds) {
        await api.customers.delete(id);
    }
}

// 优化: 使用Promise.all并发请求
async function deleteMultipleCustomersOptimized(customerIds) {
    await Promise.all(
        customerIds.map(id => api.customers.delete(id))
    );
}
```

### 4. WebSocket实时更新 (可选)
```javascript
// 连接WebSocket获取实时数据
const ws = new WebSocket('ws://localhost:8080/api/ws/data');

ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    
    if (data.type === 'customer_update') {
        // 实时更新客户数据
        updateCustomerInDOM(data.customerId, data.changes);
    } else if (data.type === 'new_lead') {
        // 实时显示新线索
        addLeadToDOM(data.lead);
    }
};
```

---

## 总结检查清单

- [ ] ✅ API客户端已完善 (assets/js/api-client.js)
- [ ] 🔄 登录页面集成认证API
- [ ] 🔄 知识库编辑器集成
- [ ] 🔄 客户管理页面CRUD集成
- [ ] 🔄 产品管理页面集成
- [ ] 🔄 仪表板数据集成
- [ ] 🔄 权限控制实现
- [ ] 🔄 第三方服务集成
- [ ] 🔄 完整功能测试

---

## 联系与支持

如有问题，请参考:
- 后端API文档: Swagger UI (http://localhost:8080/api/swagger-ui.html)
- 错误日志: 浏览器控制台 (F12)
- 后端日志: 服务器日志文件

**项目更新时间**: 2024年10月19日
**版本**: 1.0.0
