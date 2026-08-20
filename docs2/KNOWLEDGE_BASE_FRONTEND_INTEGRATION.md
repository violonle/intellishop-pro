# 知识库管理系统前后端集成文档

## 📋 项目概述

本文档详细说明ShopPro AI智能SCRM系统的**知识库管理模块前后端集成**方案，包含完整的系统架构、API集成、功能实现、部署指南等内容。

## 🎯 集成目标

将后端知识库管理API与前端知识库管理页面进行完全集成，实现：
- ✅ 知识库列表查询与分页
- ✅ 创建、编辑、删除知识库
- ✅ 富文本编辑器集成（TinyMCE）
- ✅ 文件上传与管理
- ✅ 知识库搜索与筛选
- ✅ 分类管理

## 🏗️ 系统架构

```
┌─────────────────────────────────────────────────────────────┐
│                    前端应用 (HTML5 + JavaScript)              │
├─────────────────────────────────────────────────────────────┤
│  knowledge-management.html (知识库管理页面)                  │
│  - TinyMCE 富文本编辑器                                      │
│  - 文件上传组件                                              │
│  - 列表展示与操作                                            │
├─────────────────────────────────────────────────────────────┤
│           API Client Layer (assets/js/api-client.js)         │
├─────────────────────────────────────────────────────────────┤
│                   后端 API (Spring Boot)                      │
├─────────────────────────────────────────────────────────────┤
│  KnowledgeController                                         │
│  - /api/knowledge/list (列表)                               │
│  - /api/knowledge/{id} (详情)                               │
│  - /api/knowledge (创建)                                    │
│  - /api/knowledge/{id} (更新)                               │
│  - /api/knowledge/{id} (删除)                               │
│  - /api/knowledge/search (搜索)                             │
├─────────────────────────────────────────────────────────────┤
│  FileUploadController                                        │
│  - /api/files/upload (文件上传)                             │
│  - /api/files/{id} (文件详情)                               │
│  - /api/files/download/{id} (文件下载)                     │
│  - /api/files/{id} (文件删除)                               │
├─────────────────────────────────────────────────────────────┤
│                  数据库 (MySQL)                               │
├─────────────────────────────────────────────────────────────┤
│  knowledge_base 表                                           │
│  knowledge_categories 表                                     │
│  file_uploads 表                                             │
└─────────────────────────────────────────────────────────────┘
```

## 📁 文件结构

```
ShopPro/
├── pages/
│   ├── knowledge-management.html          # 🆕 知识库管理页面（完整集成）
│   ├── knowledge-base.html               # 知识库浏览页面
│   └── knowledge-detail.html             # 知识库详情页面
├── assets/
│   ├── js/
│   │   ├── api-client.js                 # 📝 已扩展：添加知识库API
│   │   ├── utils.js                      # 工具函数
│   │   ├── ui-components.js              # UI组件
│   │   └── websocket-manager.js          # WebSocket管理
│   └── global-styles.css                 # 全局样式
├── backend/
│   └── src/main/java/com/shoppro/
│       ├── controller/
│       │   ├── KnowledgeController.java   # ✅ 知识库控制器
│       │   └── FileUploadController.java  # ✅ 文件上传控制器
│       ├── service/
│       │   ├── KnowledgeService.java      # ✅ 知识库服务
│       │   └── FileStorageService.java    # ✅ 文件存储服务
│       └── entity/
│           ├── Knowledge.java             # ✅ 知识库实体
│           ├── KnowledgeCategory.java     # ✅ 分类实体
│           └── FileUpload.java            # ✅ 文件上传实体
└── database/
    └── scripts/
        ├── 01_init_database.sql           # 核心表
        ├── 03_knowledge_base_tables.sql   # 知识库表
        └── 04_rbac_tables.sql             # 权限表
```

## 🔌 API集成方案

### 1. API客户端扩展（assets/js/api-client.js）

已添加知识库相关API方法：

```javascript
/**
 * 知识库管理API
 */
knowledge = {
    list: (params) => this.get(`${this.apiURL}/knowledge`, params),
    get: (id) => this.get(`${this.apiURL}/knowledge/${id}`),
    create: (data) => this.post(`${this.apiURL}/knowledge`, data),
    update: (id, data) => this.put(`${this.apiURL}/knowledge/${id}`, data),
    delete: (id) => this.delete(`${this.apiURL}/knowledge/${id}`),
    search: (query) => this.get(`${this.apiURL}/knowledge/search`, { keyword: query })
};

/**
 * 文件上传API
 */
files = {
    upload: (formData) => this.post(`${this.apiURL}/files/upload`, formData),
    get: (id) => this.get(`${this.apiURL}/files/${id}`),
    download: (id) => this.get(`${this.apiURL}/files/download/${id}`),
    delete: (id) => this.delete(`${this.apiURL}/files/${id}`),
    getByEntity: (entityType, entityId) => this.get(`${this.apiURL}/files/entity/${entityType}/${entityId}`)
};
```

### 2. 知识库管理页面集成

**文件：** `pages/knowledge-management.html`

#### 核心功能模块

##### A. 列表展示模块
```javascript
// 加载知识库列表
async function loadKnowledgeList() {
    try {
        const response = await api.knowledge.list({ pageNo: 1, pageSize: 20 });
        displayKnowledgeList(response.data.records || []);
    } catch (error) {
        console.error('加载知识库列表失败:', error);
        UI.showMessage('加载知识库列表失败', 'danger');
    }
}
```

**功能特性：**
- 分页加载（默认每页20条）
- 列表卡片展示
- 浏览量、发布时间、状态显示
- 公开/私有标识

##### B. 创建/编辑模块
```javascript
// 打开创建模态框
function openCreateModal() {
    currentEditingId = null;
    uploadedFiles = [];
    // 初始化表单字段...
    openModal();
}

// 编辑知识库
async function editKnowledge(id) {
    const response = await api.knowledge.get(id);
    // 填充表单数据...
    openModal();
}
```

**表单字段：**
- 标题（必填）
- 分类（必填）：产品资料、销售技巧、常见问题、政策法规
- 摘要（可选）
- 内容（必填）：使用TinyMCE富文本编辑器
- 标签（可选）：逗号分隔
- 公开范围：公开/私有
- 附件上传：支持多文件拖拽上传

##### C. 富文本编辑器集成
```javascript
// 初始化 TinyMCE 编辑器
function initTinyMCE() {
    tinymce.init({
        selector: '#knowledgeContent',
        height: 400,
        language: 'zh_CN',
        plugins: [
            'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
            'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
            'insertdatetime', 'media', 'table', 'help', 'wordcount'
        ],
        toolbar: 'undo redo | formatselect | ' +
            'bold italic backcolor | alignleft aligncenter ' +
            'alignright alignjustify | bullist numlist outdent indent | ' +
            'removeformat | table | link image media | code preview fullscreen'
    });
}
```

**编辑器特性：**
- 文本格式：粗体、斜体、下标、上标
- 段落样式：标题1-6级、段落、代码块
- 列表：有序列表、无序列表
- 表格：插入/编辑表格
- 媒体：插入图片、链接、视频
- 源码编辑：查看/编辑HTML源代码

##### D. 文件上传模块
```javascript
// 处理文件上传
async function handleFiles(files) {
    for (let file of files) {
        if (file.size > 10 * 1024 * 1024) {
            UI.showMessage('文件大小不能超过10MB', 'warning');
            continue;
        }

        const formData = new FormData();
        formData.append('file', file);
        formData.append('relatedEntityType', 'knowledge');
        formData.append('relatedEntityId', currentEditingId || 0);

        const response = await fetch('http://localhost:8080/api/files/upload', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
            },
            body: formData
        });
        // 处理响应...
    }
}
```

**上传特性：**
- 拖拽上传：支持拖拽文件到指定区域
- 点击上传：点击区域打开文件选择器
- 多文件上传：支持批量选择和上传
- 进度显示：显示上传进度条
- 文件验证：大小限制10MB，格式限制（PDF、文档、图片等）
- 异步上传：不阻塞UI，异步处理上传

##### E. 搜索与筛选模块
```javascript
// 搜索知识库
async function searchKnowledge() {
    const keyword = document.getElementById('searchKeyword').value.trim();
    const category = document.getElementById('filterCategory').value;

    if (keyword) {
        const response = await api.knowledge.search(keyword);
        let items = response.data || response;
        
        if (category) {
            items = items.filter(item => item.categoryId === parseInt(category));
        }
        
        displayKnowledgeList(items);
    }
}
```

**功能特性：**
- 关键词搜索：全文搜索知识库内容
- 分类筛选：按分类筛选结果
- 实时搜索：支持回车或点击搜索按钮

## 🚀 部署指南

### 前置条件

1. **后端环境**
   - Java 8+
   - Spring Boot 2.7.x
   - MySQL 8.0+
   - Redis 6.x（可选缓存）

2. **前端环境**
   - 现代浏览器（Chrome 80+、Safari 13+）
   - Internet连接（CDN加载TinyMCE）

### 部署步骤

#### 1. 数据库初始化
```bash
# 执行初始化脚本
mysql -u root -p < database/scripts/01_init_database.sql
mysql -u root -p < database/scripts/03_knowledge_base_tables.sql
```

#### 2. 后端启动
```bash
# 编译和启动
cd backend
mvn clean install
mvn spring-boot:run
```

**验证后端是否正常运行：**
```bash
curl http://localhost:8080/api/health
```

#### 3. 前端配置
```javascript
// 在 api-client.js 中配置API地址
this.apiURL = 'http://localhost:8080/api'; // 后端API地址

// 或通过环境变量配置
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';
```

#### 4. 访问知识库管理页面
```
http://localhost:8000/pages/knowledge-management.html
```

## 📊 数据库Schema

### knowledge_base 表
```sql
CREATE TABLE knowledge_base (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(200) NOT NULL,
    content LONGTEXT,
    summary TEXT,
    category_id BIGINT,
    tags JSON,
    file_urls JSON,
    cover_image VARCHAR(500),
    view_count INT DEFAULT 0,
    like_count INT DEFAULT 0,
    is_public TINYINT DEFAULT 1,
    is_featured TINYINT DEFAULT 0,
    created_by BIGINT,
    updated_by BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_category (category_id),
    INDEX idx_public (is_public),
    FULLTEXT INDEX ft_content (title, content, summary)
);
```

### knowledge_categories 表
```sql
CREATE TABLE knowledge_categories (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    parent_id BIGINT DEFAULT 0,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    icon VARCHAR(100),
    sort_order INT DEFAULT 0,
    status TINYINT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_parent (parent_id),
    INDEX idx_status (status)
);
```

### file_uploads 表
```sql
CREATE TABLE file_uploads (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    original_file_name VARCHAR(255),
    saved_file_name VARCHAR(255),
    file_url VARCHAR(500),
    file_size BIGINT,
    mime_type VARCHAR(100),
    file_extension VARCHAR(50),
    related_entity_type VARCHAR(50),
    related_entity_id BIGINT,
    uploaded_by BIGINT,
    uploaded_by_name VARCHAR(100),
    status TINYINT DEFAULT 1,
    md5_hash VARCHAR(32),
    download_count INT DEFAULT 0,
    remarks TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_entity (related_entity_type, related_entity_id),
    INDEX idx_uploader (uploaded_by),
    INDEX idx_status (status),
    INDEX idx_md5 (md5_hash)
);
```

## 🔐 安全性考虑

### 1. 认证与授权
- 所有API调用需要JWT Token认证
- 知识库操作需要相应权限（ADMIN、MANAGER、SALES角色）

```javascript
// API请求自动附加认证信息
const token = localStorage.getItem('auth_token');
headers['Authorization'] = `Bearer ${token}`;
```

### 2. 文件安全
- 文件大小限制：10MB
- 文件类型白名单：PDF、Office文档、图片格式
- MD5校验：防止重复上传
- 签名URL：文件下载URL签名

### 3. 数据保护
- SQL注入防护：使用参数化查询
- XSS防护：HTML内容过滤
- CSRF防护：CSRF Token验证

## 🧪 测试用例

### 1. 基本功能测试
```javascript
// 测试用例1：创建知识库
async function testCreateKnowledge() {
    const data = {
        title: '测试知识库',
        categoryId: 1,
        summary: '这是一个测试知识库',
        content: '<p>测试内容</p>',
        tags: ['测试', '示例'],
        isPublic: 1
    };
    const result = await api.knowledge.create(data);
    console.assert(result.data.id, '创建知识库失败');
}

// 测试用例2：查询知识库列表
async function testListKnowledge() {
    const result = await api.knowledge.list({ pageNo: 1, pageSize: 10 });
    console.assert(Array.isArray(result.data.records), '查询列表失败');
}

// 测试用例3：搜索知识库
async function testSearchKnowledge() {
    const result = await api.knowledge.search('测试');
    console.assert(Array.isArray(result.data), '搜索失败');
}

// 测试用例4：文件上传
async function testFileUpload() {
    const file = new File(['test'], 'test.pdf', { type: 'application/pdf' });
    const formData = new FormData();
    formData.append('file', file);
    
    const result = await api.files.upload(formData);
    console.assert(result.data.id, '文件上传失败');
}
```

### 2. 性能测试
```javascript
// 测试大数据量列表加载性能
async function testPerformance() {
    console.time('List Performance');
    const result = await api.knowledge.list({ pageNo: 1, pageSize: 100 });
    console.timeEnd('List Performance');
    // 目标：< 1秒
}
```

### 3. 错误处理测试
```javascript
// 测试各种错误场景
async function testErrorHandling() {
    // 测试未认证
    try {
        localStorage.removeItem('auth_token');
        await api.knowledge.list();
    } catch (error) {
        console.assert(error.status === 401, '未认证错误处理失败');
    }
    
    // 测试权限不足
    // 测试资源不存在
    // 测试无效参数
}
```

## 📈 性能优化

### 1. 缓存策略
- 列表缓存：5分钟
- 详情缓存：10分钟
- 分类缓存：永久（手动更新）

```javascript
// 实现缓存
const cache = new Map();
function getCached(key, ttl = 5 * 60 * 1000) {
    const cached = cache.get(key);
    if (cached && Date.now() - cached.timestamp < ttl) {
        return cached.data;
    }
    return null;
}

function setCache(key, data) {
    cache.set(key, { data, timestamp: Date.now() });
}
```

### 2. 虚拟滚动
- 大列表使用虚拟滚动降低DOM渲染压力
- 只渲染可见区域的列表项

### 3. 图片优化
- 使用CDN加载静态资源
- 图片懒加载
- 缩略图预生成

### 4. 编辑器优化
- 自动保存草稿（间隔5秒）
- 离线支持（IndexedDB存储）

## 🔧 故障排除

### 常见问题

| 问题 | 原因 | 解决方案 |
|------|------|--------|
| 知识库列表加载失败 | API连接失败 | 检查后端服务是否运行、API地址是否正确 |
| 文件上传失败 | 文件大小超限 | 检查文件大小是否超过10MB |
| 富文本编辑器加载失败 | CDN无法访问 | 使用本地TinyMCE或更换CDN源 |
| 搜索结果为空 | 关键词不匹配 | 检查搜索关键词、数据库中是否有相关数据 |

### 调试技巧

```javascript
// 启用API请求日志
api.addRequestInterceptor((config) => {
    console.log('API Request:', config);
    return config;
});

// 启用API响应日志
api.addResponseInterceptor((response) => {
    console.log('API Response:', response);
    return response;
});

// 启用性能监控
window.addEventListener('error', (event) => {
    console.error('错误:', event.error);
});
```

## 📚 参考资源

- [TinyMCE官方文档](https://www.tiny.cloud/docs/)
- [Spring Boot知识库API文档](../backend/src/main/java/com/shoppro/controller/KnowledgeController.java)
- [文件上传API文档](../backend/src/main/java/com/shoppro/controller/FileUploadController.java)
- [MySQL JSON数据类型](https://dev.mysql.com/doc/refman/8.0/en/json.html)

## 📝 更新日志

### v1.0.0 (2024-10-19)
- ✅ 完成知识库管理页面前后端集成
- ✅ 集成TinyMCE富文本编辑器
- ✅ 实现文件上传功能
- ✅ 完成列表、搜索、筛选功能
- ✅ 编写完整的集成文档

## 👥 支持与反馈

遇到问题或有改进建议，请联系项目团队或提交Issue。

---

**文档更新时间：** 2024-10-19  
**维护人员：** ShopPro Team  
**版本：** 1.0.0
