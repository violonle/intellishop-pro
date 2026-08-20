# ShopPro 全局错误处理系统设计指南

**文档版本**: 1.0  
**创建日期**: 2024年1月  
**优先级**: 中  

---

## 一、概述

本文档详细说明了ShopPro项目的全局错误处理系统架构，包括错误分类、处理机制、日志系统和用户提示。

### 系统目标

1. **统一处理**: 所有API错误通过统一的机制处理
2. **用户友好**: 将技术错误转换为用户能理解的消息
3. **可追踪**: 完整的错误日志和追踪机制
4. **可恢复**: 提供自动重试和降级方案
5. **可监控**: 实时错误监控和告警

---

## 二、错误分类体系

### 2.1 按错误类型分类

```
ErrorType
├── NetworkError (网络错误)
│   ├── Timeout (超时)
│   ├── ConnectionRefused (连接被拒)
│   ├── DNSFailed (DNS解析失败)
│   └── Offline (离线)
├── ServerError (服务器错误)
│   ├── 4xx (客户端错误)
│   │   ├── 400 BadRequest
│   │   ├── 401 Unauthorized
│   │   ├── 403 Forbidden
│   │   └── 404 NotFound
│   └── 5xx (服务器错误)
│       ├── 500 InternalError
│       ├── 502 BadGateway
│       ├── 503 ServiceUnavailable
│       └── 504 GatewayTimeout
├── ValidationError (验证错误)
│   ├── RequiredFieldMissing
│   ├── InvalidFormat
│   └── DuplicateData
├── AuthenticationError (认证错误)
│   ├── TokenExpired
│   ├── InvalidToken
│   └── NoPermission
└── ApplicationError (应用错误)
    ├── DataNotFound
    ├── BusinessRuleViolation
    └── InternalError
```

### 2.2 错误严重级别

```javascript
const ErrorSeverity = {
  INFO: 'info',           // 信息提示，不需要特殊处理
  WARNING: 'warning',     // 警告，需要用户注意
  ERROR: 'error',         // 错误，操作失败
  CRITICAL: 'critical'    // 严重错误，系统故障
};
```

---

## 三、ErrorHandler 类设计

### 3.1 类结构

```javascript
class ErrorHandler {
  // 错误处理配置
  static config = {
    maxRetries: 3,
    retryDelay: 1000,
    logEnabled: true,
    reportEnabled: true,
    fallbackEnabled: true
  };

  // 错误缓存（用于去重）
  static errorCache = new Map();

  // 公共方法
  static classify(error);           // 分类错误
  static handle(error, context);    // 处理错误
  static retry(fn, options);        // 重试机制
  static fallback(error, fallbackFn); // 降级处理
  static getErrorMessage(error);    // 获取用户友好的错误信息
  static logError(error, context);  // 记录错误
  static reportError(error, context); // 上报错误
  static showUserNotification(error); // 显示用户提示
  static clearErrorCache();         // 清空错误缓存
}
```

### 3.2 关键方法实现

#### 3.2.1 错误分类

```javascript
static classify(error) {
  // 网络错误
  if (error.message === 'timeout') {
    return { type: 'NetworkError', subtype: 'Timeout', severity: 'warning' };
  }
  if (error.code === 'ECONNREFUSED') {
    return { type: 'NetworkError', subtype: 'ConnectionRefused', severity: 'error' };
  }
  if (error.code === 'ENOTFOUND') {
    return { type: 'NetworkError', subtype: 'DNSFailed', severity: 'error' };
  }

  // HTTP 错误
  if (error.status) {
    const status = error.status;
    if (status === 400) return { type: 'ServerError', subtype: 'BadRequest', severity: 'warning' };
    if (status === 401) return { type: 'AuthenticationError', subtype: 'Unauthorized', severity: 'error' };
    if (status === 403) return { type: 'AuthenticationError', subtype: 'Forbidden', severity: 'error' };
    if (status === 404) return { type: 'ServerError', subtype: 'NotFound', severity: 'info' };
    if (status === 500) return { type: 'ServerError', subtype: 'InternalError', severity: 'critical' };
    if (status === 503) return { type: 'ServerError', subtype: 'ServiceUnavailable', severity: 'critical' };
  }

  // 验证错误
  if (error.name === 'ValidationError') {
    return { type: 'ValidationError', subtype: error.field, severity: 'warning' };
  }

  // 默认应用错误
  return { type: 'ApplicationError', subtype: 'Unknown', severity: 'error' };
}
```

#### 3.2.2 统一错误处理

```javascript
static handle(error, context = {}) {
  // 1. 分类错误
  const classification = this.classify(error);

  // 2. 检查缓存（去重）
  if (this.isDuplicate(error)) {
    console.log('重复错误，已忽略');
    return;
  }

  // 3. 记录错误
  if (this.config.logEnabled) {
    this.logError(error, { ...context, classification });
  }

  // 4. 上报错误
  if (this.config.reportEnabled) {
    this.reportError(error, { ...context, classification });
  }

  // 5. 获取用户友好的错误信息
  const userMessage = this.getErrorMessage(error);

  // 6. 显示用户提示
  this.showUserNotification({
    message: userMessage,
    severity: classification.severity,
    errorType: classification.type
  });

  // 7. 返回处理结果
  return {
    classified: true,
    type: classification.type,
    message: userMessage,
    originalError: error
  };
}
```

#### 3.2.3 重试机制

```javascript
static async retry(fn, options = {}) {
  const {
    maxRetries = this.config.maxRetries,
    delay = this.config.retryDelay,
    backoff = true,
    onRetry = null
  } = options;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (attempt === maxRetries) throw error;

      // 计算延迟时间（指数退避）
      const waitTime = backoff ? delay * Math.pow(2, attempt - 1) : delay;

      if (onRetry) {
        onRetry(attempt, error, waitTime);
      }

      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }
}
```

#### 3.2.4 获取用户友好的错误信息

```javascript
static getErrorMessage(error) {
  const messages = {
    // 网络错误
    Timeout: '请求超时，请检查网络连接后重试',
    ConnectionRefused: '无法连接到服务器，请稍后重试',
    DNSFailed: '网络连接失败，请检查网络设置',
    Offline: '您已离线，请检查网络连接',

    // 认证错误
    Unauthorized: '您的登录已过期，请重新登录',
    Forbidden: '您没有权限执行此操作',
    NoPermission: '权限不足',

    // 服务器错误
    BadRequest: '请求参数错误，请检查输入内容',
    NotFound: '请求的资源不存在',
    InternalError: '服务器错误，请稍后重试',
    ServiceUnavailable: '服务暂时不可用，请稍后重试',

    // 验证错误
    RequiredFieldMissing: '必填字段未填写',
    InvalidFormat: '输入格式不正确',
    DuplicateData: '数据已存在',

    // 默认
    Unknown: '发生未知错误，请稍后重试'
  };

  const errorSubtype = this.classify(error).subtype;
  return messages[errorSubtype] || messages.Unknown;
}
```

---

## 四、APIClient 集成

### 4.1 请求拦截器

```javascript
class APIClient {
  constructor() {
    this.axiosInstance = axios.create({
      baseURL: '/api',
      timeout: 30000
    });

    // 请求拦截器
    this.axiosInstance.interceptors.request.use(
      config => {
        // 添加认证令牌
        const token = localStorage.getItem('auth_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      error => Promise.reject(error)
    );

    // 响应拦截器
    this.axiosInstance.interceptors.response.use(
      response => response,
      error => this.handleResponseError(error)
    );
  }

  async handleResponseError(error) {
    // 使用ErrorHandler处理错误
    const handledError = ErrorHandler.handle(error, {
      url: error.config?.url,
      method: error.config?.method,
      timestamp: new Date().toISOString()
    });

    // 根据错误类型决定是否自动重试
    if (this.shouldAutoRetry(error)) {
      return this.retryRequest(error.config);
    }

    throw handledError;
  }

  shouldAutoRetry(error) {
    // 只重试网络错误和5xx错误
    if (error.message === 'timeout') return true;
    if (error.code === 'ECONNREFUSED') return true;
    if (error.response?.status >= 500) return true;
    return false;
  }

  async retryRequest(config) {
    return ErrorHandler.retry(
      () => this.axiosInstance.request(config),
      {
        maxRetries: 3,
        backoff: true,
        onRetry: (attempt, error, delay) => {
          console.log(`重试第${attempt}次，延迟${delay}ms`);
        }
      }
    );
  }
}
```

---

## 五、UI 通知组件

### 5.1 Toast 组件

```javascript
class ToastManager {
  static showToast(message, options = {}) {
    const {
      type = 'info',      // success, info, warning, error
      duration = 3000,
      position = 'top-right'
    } = options;

    const toastElement = this.createToastElement(message, type);
    this.addToDOM(toastElement, position);

    setTimeout(() => {
      toastElement.remove();
    }, duration);
  }

  static success(message) {
    this.showToast(message, { type: 'success' });
  }

  static info(message) {
    this.showToast(message, { type: 'info' });
  }

  static warning(message) {
    this.showToast(message, { type: 'warning' });
  }

  static error(message) {
    this.showToast(message, { type: 'error' });
  }

  static createToastElement(message, type) {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
      <div class="toast-content">
        ${this.getIcon(type)}
        <span>${message}</span>
        <button class="toast-close" onclick="this.parentElement.parentElement.remove()">×</button>
      </div>
    `;
    return toast;
  }

  static getIcon(type) {
    const icons = {
      success: '✓',
      info: 'ℹ',
      warning: '⚠',
      error: '✕'
    };
    return `<span class="toast-icon">${icons[type]}</span>`;
  }

  static addToDOM(element, position) {
    let container = document.querySelector(`#toast-container-${position}`);
    if (!container) {
      container = document.createElement('div');
      container.id = `toast-container-${position}`;
      container.className = `toast-container ${position}`;
      document.body.appendChild(container);
    }
    container.appendChild(element);
  }
}
```

### 5.2 Modal 错误对话框

```javascript
class ErrorModal {
  static showErrorModal(error, options = {}) {
    const {
      title = '发生错误',
      showDetails = false,
      onRetry = null,
      onDismiss = null
    } = options;

    const modal = document.createElement('div');
    modal.className = 'modal modal-error';
    modal.innerHTML = `
      <div class="modal-overlay"></div>
      <div class="modal-content">
        <div class="modal-header">
          <h2>${title}</h2>
          <button class="modal-close" onclick="this.closest('.modal').remove()">×</button>
        </div>
        <div class="modal-body">
          <p class="error-message">${ErrorHandler.getErrorMessage(error)}</p>
          ${showDetails ? `<details><summary>详细信息</summary><pre>${error.toString()}</pre></details>` : ''}
        </div>
        <div class="modal-footer">
          ${onRetry ? '<button class="btn btn-primary" onclick="handleRetry()">重试</button>' : ''}
          <button class="btn btn-secondary" onclick="handleDismiss()">关闭</button>
        </div>
      </div>
    `;

    // 绑定事件处理器
    window.handleRetry = () => {
      modal.remove();
      if (onRetry) onRetry();
    };
    window.handleDismiss = () => {
      modal.remove();
      if (onDismiss) onDismiss();
    };

    document.body.appendChild(modal);
  }
}
```

---

## 六、错误日志系统

### 6.1 日志收集

```javascript
class ErrorLogger {
  static logs = [];
  static maxLogs = 100;

  static log(error, context = {}) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      error: {
        message: error.message,
        stack: error.stack,
        name: error.name,
        code: error.code
      },
      context,
      severity: ErrorHandler.classify(error).severity
    };

    // 添加到内存日志
    this.logs.push(logEntry);
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }

    // 记录到浏览器控制台
    console.group(`[${logEntry.severity.toUpperCase()}] ${error.name}`);
    console.error('Message:', error.message);
    console.error('Stack:', error.stack);
    console.error('Context:', context);
    console.groupEnd();

    // 如果是严重错误，立即上报
    if (logEntry.severity === 'critical') {
      this.reportToServer(logEntry);
    }
  }

  static reportToServer(logEntry) {
    // 异步上报，不阻塞主流程
    fetch('/api/errors/report', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(logEntry)
    }).catch(err => console.error('上报错误失败:', err));
  }

  static exportLogs(format = 'json') {
    if (format === 'json') {
      return JSON.stringify(this.logs, null, 2);
    } else if (format === 'csv') {
      // CSV格式导出
      return this.logsToCSV();
    }
  }

  static clearLogs() {
    this.logs = [];
  }
}
```

---

## 七、集成示例

### 7.1 在 API Manager 中集成

```javascript
class CustomerAPIManager {
  async loadCustomers(options = {}) {
    try {
      const response = await this.apiClient.get('/customers/list', { params: options });
      return response.data;
    } catch (error) {
      ErrorHandler.handle(error, {
        operation: 'loadCustomers',
        parameters: options
      });
      throw error;
    }
  }

  async createCustomer(data) {
    try {
      const response = await this.apiClient.post('/customers', data);
      ToastManager.success('客户创建成功');
      return response.data;
    } catch (error) {
      ErrorHandler.handle(error, {
        operation: 'createCustomer',
        data: data
      });
      throw error;
    }
  }
}
```

### 7.2 在页面中集成

```javascript
// 页面初始化
async function initPage() {
  try {
    showLoading('加载中...');
    const customers = await customerManager.loadCustomers();
    renderCustomerList(customers);
  } catch (error) {
    // ErrorHandler 已处理并显示了用户提示
    // 这里可以进行额外的页面级处理
    renderEmptyState();
  } finally {
    hideLoading();
  }
}

// 用户操作
async function deleteCustomer(customerId) {
  try {
    const confirmed = await showConfirmDialog('确定删除？');
    if (confirmed) {
      await customerManager.deleteCustomer(customerId);
      ToastManager.success('删除成功');
      loadCustomerData();
    }
  } catch (error) {
    // 错误已被处理
    console.log('删除失败，但用户已收到提示');
  }
}
```

---

## 八、CSS 样式

### 8.1 Toast 样式

```css
.toast-container {
  position: fixed;
  display: flex;
  flex-direction: column;
  gap: 10px;
  pointer-events: none;
  z-index: 9999;
}

.toast-container.top-right {
  top: 20px;
  right: 20px;
}

.toast-container.top-left {
  top: 20px;
  left: 20px;
}

.toast {
  background: white;
  border-radius: 4px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  pointer-events: auto;
  animation: slideIn 0.3s ease-out;
}

.toast-content {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
}

.toast-icon {
  font-weight: bold;
  font-size: 18px;
}

.toast-success { border-left: 4px solid #10b981; }
.toast-info { border-left: 4px solid #3b82f6; }
.toast-warning { border-left: 4px solid #f59e0b; }
.toast-error { border-left: 4px solid #ef4444; }

.toast-close {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  margin-left: 8px;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}
```

---

## 九、测试用例

### 9.1 错误分类测试

```javascript
// 测试各类错误的分类
test('NetworkError - Timeout', () => {
  const error = new Error('timeout');
  const classified = ErrorHandler.classify(error);
  expect(classified.type).toBe('NetworkError');
  expect(classified.subtype).toBe('Timeout');
});

test('ServerError - 500', () => {
  const error = new Error('Internal Server Error');
  error.status = 500;
  const classified = ErrorHandler.classify(error);
  expect(classified.type).toBe('ServerError');
  expect(classified.severity).toBe('critical');
});
```

### 9.2 重试机制测试

```javascript
test('Retry with exponential backoff', async () => {
  let attempts = 0;
  const fn = async () => {
    attempts++;
    if (attempts < 3) throw new Error('Failed');
    return 'Success';
  };

  const result = await ErrorHandler.retry(fn, { maxRetries: 3 });
  expect(attempts).toBe(3);
  expect(result).toBe('Success');
});
```

---

## 十、最佳实践

1. **尽早捕获错误**: 在API调用层和页面级别都进行错误处理
2. **给予上下文**: 记录错误发生的操作和参数
3. **用户友好**: 避免显示技术细节给最终用户
4. **可恢复性**: 提供重试或降级方案
5. **监控告警**: 定期检查错误日志，及时响应严重错误

---

## 十一、后续改进

- [ ] 实现错误聚合和去重算法
- [ ] 添加错误统计和趋势分析
- [ ] 集成第三方错误监控服务（如Sentry）
- [ ] 实现用户反馈机制
- [ ] 构建错误仪表板

---

**文档维护者**: AI Agent  
**最后更新**: 2024年1月  
**版本状态**: 完成 ✅
