# ShopPro 权限与第三方服务集成快速指南

## 📦 文件概述

| 文件 | 行数 | 功能 |
|------|------|------|
| `permissions-integration.js` | 509 | RBAC权限系统、路由守卫、UI权限控制 |
| `third-party-integration.js` | 572 | 企业微信、钉钉、SMS、邮件、支付 |

---

## 🔐 权限控制系统

### 快速使用

```javascript
// 检查权限
if (window.permissionsIntegration.hasPermission('user.view')) {
    // 有权限
}

// 检查角色
if (window.permissionsIntegration.hasRole('admin')) {
    // 是管理员
}

// 显示/隐藏元素
window.permissionsIntegration.ui.showIfPermitted('.delete-btn', 'user.delete');

// 禁用/启用按钮
window.permissionsIntegration.ui.enableIfPermitted('.edit-btn', 'user.edit');
```

### 路由守卫

```javascript
// 检查路由权限
if (window.permissionsIntegration.routeGuard.canAccess('/admin', ['admin.access'])) {
    // 允许访问
}

// 检查并重定向
window.permissionsIntegration.routeGuard.checkAndRedirect(
    '/admin',
    ['admin.access'],
    '/no-permission'
);
```

### 异步权限检查

```javascript
// 安全执行函数
await window.permissionsIntegration.withPermissionCheck(
    'user.delete',
    async () => {
        // 删除用户代码
    },
    async () => {
        console.log('权限不足');
    }
);
```

### 权限刷新

```javascript
// 刷新用户权限
await window.permissionsIntegration.refreshPermissions();

// 清除缓存
window.permissionsIntegration.clearCache();
```

---

## 🔗 第三方服务集成

### 企业微信

```javascript
// 发送消息
await window.thirdPartyIntegration.sendWeCom({
    toUser: 'user123',
    msgType: 'text',
    content: '消息内容'
});

// 同步用户
await window.thirdPartyIntegration.wecom.syncUsers();

// 同步部门
await window.thirdPartyIntegration.wecom.syncDepartments();
```

### 钉钉

```javascript
// 发送消息
await window.thirdPartyIntegration.sendDingtalk({
    toUser: 'user123',
    msgType: 'text',
    content: '消息内容',
    title: '标题'
});
```

### 短信(SMS)

```javascript
// 发送短信
await window.thirdPartyIntegration.sendSMS({
    phoneNumbers: ['13800138000', '13900139000'],
    message: '验证码：123456'
});

// 使用模板
await window.thirdPartyIntegration.sendSMS({
    phoneNumbers: ['13800138000'],
    templateId: 'SMS_001',
    variables: { code: '123456' }
});
```

### 邮件

```javascript
// 发送邮件
await window.thirdPartyIntegration.sendEmail({
    to: ['user@example.com'],
    cc: ['admin@example.com'],
    subject: '邮件主题',
    content: '<h1>HTML 内容</h1>',
    isHtml: true
});
```

### 支付

```javascript
// 发起支付
const paymentResult = await window.thirdPartyIntegration.initiatePayment({
    orderId: 'order_123',
    amount: 10000,  // 100元（单位：分）
    paymentMethod: 'wechat',  // alipay, wechat, unionpay
    description: '商品描述',
    notifyUrl: '/api/payment/notify',
    returnUrl: '/order/success'
});

// 验证支付
const verified = await window.thirdPartyIntegration.verifyPayment({
    orderId: 'order_123',
    transactionId: 'trans_123',
    amount: 10000,
    signature: 'signature_value'
});
```

### 多渠道通知

```javascript
// 同时通过多个渠道发送通知
const result = await window.thirdPartyIntegration.sendNotification({
    channels: ['wecom', 'dingtalk', 'sms', 'email'],
    content: '重要通知：系统将于今晚维护',
    recipients: ['user1', 'user2'],
    title: '系统通知'
});

// 结果：
// {
//   wecom: { success: true },
//   dingtalk: { success: true },
//   sms: { success: true },
//   email: { success: true }
// }
```

### 批量发送

```javascript
// 批量发送短信
const results = await window.thirdPartyIntegration.batchSend('sms', [
    { phoneNumbers: ['13800138000'], message: '消息1' },
    { phoneNumbers: ['13900139000'], message: '消息2' }
]);
```

---

## 📋 权限系统API参考

### 权限检查方法

| 方法 | 参数 | 返回 | 说明 |
|------|------|------|------|
| `hasPermission(p)` | 权限代码 | boolean | 检查单个权限 |
| `hasRole(r)` | 角色代码 | boolean | 检查单个角色 |
| `hasAllPermissions(ps)` | 权限数组 | boolean | 检查所有权限 |
| `hasAnyPermission(ps)` | 权限数组 | boolean | 检查任意权限 |
| `hasAllRoles(rs)` | 角色数组 | boolean | 检查所有角色 |
| `hasAnyRole(rs)` | 角色数组 | boolean | 检查任意角色 |

### UI权限控制方法

| 方法 | 参数 | 说明 |
|------|------|------|
| `showIfPermitted(selector, permission, requireAll)` | 选择器、权限 | 根据权限显示/隐藏元素 |
| `enableIfPermitted(selector, permission, requireAll)` | 选择器、权限 | 根据权限启用/禁用按钮 |
| `toggleClassIfPermitted(selector, className, permission)` | 选择器、类名、权限 | 根据权限切换类 |

---

## 🔗 第三方服务API参考

### 服务列表

| 服务 | 方法 | 说明 |
|------|------|------|
| **企业微信** | `sendWeCom()` | 发送消息 |
| | `syncUsers()` | 同步用户 |
| | `syncDepartments()` | 同步部门 |
| **钉钉** | `sendDingtalk()` | 发送消息 |
| | `syncUsers()` | 同步用户 |
| | `syncDepartments()` | 同步部门 |
| **短信** | `sendSMS()` | 发送短信 |
| **邮件** | `sendEmail()` | 发送邮件 |
| **支付** | `initiatePayment()` | 发起支付 |
| | `verifyPayment()` | 验证支付 |

---

## 💡 常见场景示例

### 场景1：后台管理页面权限控制

```javascript
// 页面加载时检查权限
document.addEventListener('DOMContentLoaded', async () => {
    // 检查管理员权限
    const canAccess = await window.permissionsIntegration.routeGuard.guardAsync(
        '/admin',
        ['admin.access']
    );
    
    if (!canAccess) {
        window.location.href = '/no-permission';
        return;
    }
    
    // 根据权限显示按钮
    window.permissionsIntegration.ui.showIfPermitted('.delete-btn', 'user.delete');
    window.permissionsIntegration.ui.showIfPermitted('.edit-btn', 'user.edit');
});
```

### 场景2：订单支付流程

```javascript
async function processPayment(orderId, amount) {
    try {
        // 发起支付
        const paymentResult = await window.thirdPartyIntegration.initiatePayment({
            orderId,
            amount,
            paymentMethod: 'wechat',
            description: '购买订单'
        });
        
        if (!paymentResult) {
            throw new Error('支付发起失败');
        }
        
        // 重定向到支付页面
        window.location.href = paymentResult.paymentUrl;
        
    } catch (error) {
        console.error('支付错误:', error);
        alert('支付失败，请重试');
    }
}
```

### 场景3：多渠道通知

```javascript
async function notifyUsers(title, content, users) {
    try {
        const result = await window.thirdPartyIntegration.sendNotification({
            channels: ['wecom', 'email', 'sms'],
            content: content,
            recipients: users,
            title: title
        });
        
        // 检查发送结果
        for (const [channel, response] of Object.entries(result)) {
            if (response?.success) {
                console.log(`✅ ${channel} 通知已发送`);
            } else {
                console.warn(`⚠️ ${channel} 通知失败`);
            }
        }
    } catch (error) {
        console.error('通知发送失败:', error);
    }
}
```

### 场景4：列表批量操作

```javascript
async function batchSendSMS(users) {
    const messages = users.map(user => ({
        phoneNumbers: [user.phone],
        message: `尊敬的${user.name}，您的订单已发货`
    }));
    
    const results = await window.thirdPartyIntegration.batchSend('sms', messages);
    
    const successful = results.filter(r => r?.success).length;
    console.log(`成功发送 ${successful}/${results.length} 条短信`);
}
```

---

## 📚 集成步骤

### 1. 在HTML中引入脚本

```html
<script src="/assets/js/api-client.js"></script>
<script src="/assets/js/permissions-integration.js"></script>
<script src="/assets/js/third-party-integration.js"></script>
```

### 2. 权限系统初始化（自动）

```javascript
// 自动在页面加载时初始化
document.addEventListener('DOMContentLoaded', async () => {
    // 权限系统已自动初始化
    const hasPermission = window.permissionsIntegration.hasPermission('user.view');
});
```

### 3. 手动初始化（可选）

```javascript
// 手动初始化权限
await window.permissionsIntegration.init();

// 初始化API拦截器
window.permissionsIntegration.initInterceptors();
```

---

## ⚙️ 配置说明

### 权限系统配置

- **缓存过期时间**: 5分钟（在 `PermissionsManager` 中修改 `cacheExpiry`）
- **自动刷新**: 403错误时自动刷新权限
- **请求头**: 自动添加用户角色和权限到请求头

### 第三方服务配置

各服务的配置（AppID、AppSecret等）应在后端配置，前端通过 API 调用：

```javascript
// 获取服务配置
const config = await window.thirdPartyIntegration.wecom.getConfig();
```

---

## ❌ 错误处理

### 权限错误

```javascript
try {
    await window.permissionsIntegration.withPermissionCheck(
        'user.delete',
        async () => {
            // 操作代码
        }
    );
} catch (error) {
    console.error('权限检查失败:', error);
}
```

### 第三方服务错误

```javascript
const result = await window.thirdPartyIntegration.sendSMS({
    phoneNumbers: ['13800138000'],
    message: '测试'
});

if (!result) {
    console.error('短信发送失败');
}
```

---

## 🔍 调试

### 权限调试

```javascript
// 查看当前用户
console.log(window.permissionsIntegration.getCurrentUser());

// 查看权限列表
console.log(window.permissionsIntegration.getPermissions());

// 查看角色列表
console.log(window.permissionsIntegration.getRoles());
```

### 服务调试

```javascript
// 获取所有服务
console.log(window.thirdPartyIntegration.manager.services);

// 获取特定服务
const smsService = window.thirdPartyIntegration.getService('sms');
```

---

## 📞 支持

- 权限系统问题：查看 `permissions-integration.js` 源代码注释
- 第三方服务问题：查看 `third-party-integration.js` 源代码注释
- API 错误：检查浏览器控制台的错误日志

---

**版本**: 1.0.0  
**最后更新**: 2025年10月20日

