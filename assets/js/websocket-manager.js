/**
 * ShopPro WebSocket实时通信管理器
 * 提供实时数据同步、通知推送、离线支持等功能
 */

class WebSocketManager {
    constructor(options = {}) {
        this.url = options.url || 'wss://localhost:8080/ws';
        this.reconnectInterval = options.reconnectInterval || 3000;
        this.maxReconnectAttempts = options.maxReconnectAttempts || 10;
        this.heartbeatInterval = options.heartbeatInterval || 30000;
        this.timeout = options.timeout || 5000;
        
        this.ws = null;
        this.isConnected = false;
        this.reconnectAttempts = 0;
        this.listeners = new Map();
        this.messageQueue = [];
        this.heartbeatTimer = null;
        this.reconnectTimer = null;
        this.requestCallbacks = new Map();
        this.requestId = 0;
        
        // 离线消息队列
        this.offlineQueue = [];
        this.isOnline = navigator.onLine;
        
        this.init();
    }

    // 初始化WebSocket连接
    init() {
        this.setupNetworkListeners();
        if (this.isOnline) {
            this.connect();
        }
    }

    // 建立WebSocket连接
    connect() {
        if (this.ws && (this.ws.readyState === WebSocket.CONNECTING || this.ws.readyState === WebSocket.OPEN)) {
            return;
        }

        console.log('🔌 建立WebSocket连接...');
        
        try {
            this.ws = new WebSocket(this.url);
            this.setupWebSocketListeners();
        } catch (error) {
            console.error('WebSocket连接失败:', error);
            this.handleReconnect();
        }
    }

    // 设置WebSocket事件监听
    setupWebSocketListeners() {
        if (!this.ws) return;

        this.ws.onopen = () => {
            console.log('✅ WebSocket连接已建立');
            this.isConnected = true;
            this.reconnectAttempts = 0;
            
            // 发送离线队列中的消息
            this.processOfflineQueue();
            
            // 启动心跳
            this.startHeartbeat();
            
            // 触发连接事件
            this.emit('connected');
        };

        this.ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                this.handleMessage(data);
            } catch (error) {
                console.error('解析WebSocket消息失败:', error, event.data);
            }
        };

        this.ws.onclose = (event) => {
            console.log('🔌 WebSocket连接关闭:', event.code, event.reason);
            this.isConnected = false;
            this.stopHeartbeat();
            
            // 触发断开事件
            this.emit('disconnected', { code: event.code, reason: event.reason });
            
            // 如果不是主动关闭，则尝试重连
            if (event.code !== 1000) {
                this.handleReconnect();
            }
        };

        this.ws.onerror = (error) => {
            console.error('WebSocket错误:', error);
            this.emit('error', error);
        };
    }

    // 处理接收到的消息
    handleMessage(data) {
        const { type, payload, requestId: reqId } = data;

        // 处理请求响应
        if (reqId && this.requestCallbacks.has(reqId)) {
            const callback = this.requestCallbacks.get(reqId);
            this.requestCallbacks.delete(reqId);
            callback(payload);
            return;
        }

        // 处理心跳响应
        if (type === 'pong') {
            return;
        }

        // 触发对应类型的监听器
        this.emit(type, payload);

        // 处理特定消息类型
        switch (type) {
            case 'notification':
                this.handleNotification(payload);
                break;
            case 'data_sync':
                this.handleDataSync(payload);
                break;
            case 'user_activity':
                this.handleUserActivity(payload);
                break;
            case 'system_update':
                this.handleSystemUpdate(payload);
                break;
            default:
                console.log('收到未知类型消息:', type, payload);
        }
    }

    // 发送消息
    send(type, payload, needResponse = false) {
        const message = {
            type,
            payload,
            timestamp: Date.now()
        };

        if (needResponse) {
            const requestId = ++this.requestId;
            message.requestId = requestId;
            
            return new Promise((resolve, reject) => {
                this.requestCallbacks.set(requestId, resolve);
                
                // 设置超时
                setTimeout(() => {
                    if (this.requestCallbacks.has(requestId)) {
                        this.requestCallbacks.delete(requestId);
                        reject(new Error('请求超时'));
                    }
                }, this.timeout);
                
                this.sendMessage(message);
            });
        } else {
            this.sendMessage(message);
        }
    }

    // 实际发送消息
    sendMessage(message) {
        if (this.isConnected && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify(message));
        } else {
            // 如果未连接，则加入离线队列
            this.offlineQueue.push(message);
            console.log('消息已加入离线队列:', message.type);
        }
    }

    // 处理离线队列
    processOfflineQueue() {
        if (this.offlineQueue.length === 0) return;
        
        console.log(`📤 发送 ${this.offlineQueue.length} 条离线消息`);
        
        while (this.offlineQueue.length > 0) {
            const message = this.offlineQueue.shift();
            this.sendMessage(message);
        }
    }

    // 添加事件监听器
    on(type, callback) {
        if (!this.listeners.has(type)) {
            this.listeners.set(type, []);
        }
        this.listeners.get(type).push(callback);
    }

    // 移除事件监听器
    off(type, callback) {
        if (!this.listeners.has(type)) return;
        
        const callbacks = this.listeners.get(type);
        const index = callbacks.indexOf(callback);
        if (index > -1) {
            callbacks.splice(index, 1);
        }
    }

    // 触发事件
    emit(type, data = null) {
        if (!this.listeners.has(type)) return;
        
        this.listeners.get(type).forEach(callback => {
            try {
                callback(data);
            } catch (error) {
                console.error(`事件监听器执行错误 [${type}]:`, error);
            }
        });
    }

    // 启动心跳
    startHeartbeat() {
        this.stopHeartbeat();
        
        this.heartbeatTimer = setInterval(() => {
            if (this.isConnected) {
                this.send('ping');
            }
        }, this.heartbeatInterval);
    }

    // 停止心跳
    stopHeartbeat() {
        if (this.heartbeatTimer) {
            clearInterval(this.heartbeatTimer);
            this.heartbeatTimer = null;
        }
    }

    // 处理重连
    handleReconnect() {
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            console.error('❌ 达到最大重连次数，放弃重连');
            this.emit('reconnect_failed');
            return;
        }

        this.reconnectAttempts++;
        console.log(`🔄 尝试重连... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
        
        this.reconnectTimer = setTimeout(() => {
            if (this.isOnline) {
                this.connect();
            }
        }, this.reconnectInterval * this.reconnectAttempts);
        
        this.emit('reconnecting', this.reconnectAttempts);
    }

    // 设置网络状态监听
    setupNetworkListeners() {
        window.addEventListener('online', () => {
            console.log('📶 网络已连接');
            this.isOnline = true;
            if (!this.isConnected) {
                this.connect();
            }
            this.emit('network_online');
        });

        window.addEventListener('offline', () => {
            console.log('📵 网络已断开');
            this.isOnline = false;
            this.emit('network_offline');
        });
    }

    // 处理通知
    handleNotification(payload) {
        console.log('📨 收到通知:', payload);
        
        // 显示桌面通知
        if (Notification.permission === 'granted') {
            new Notification(payload.title || 'ShopPro', {
                body: payload.message,
                icon: payload.icon || '/favicon.ico',
                tag: payload.id
            });
        }
        
        // 显示页面内通知
        if (window.UI && window.UI.showMessage) {
            window.UI.showMessage(payload.message, payload.type || 'info');
        }
    }

    // 处理数据同步
    handleDataSync(payload) {
        console.log('🔄 数据同步:', payload);
        
        const { entity, action, data } = payload;
        
        // 触发具体的数据同步事件
        this.emit(`sync_${entity}`, { action, data });
        
        // 更新本地缓存
        if (window.performance_optimizer) {
            const cacheKey = `${entity}_${data.id || 'list'}`;
            
            switch (action) {
                case 'create':
                case 'update':
                    window.performance_optimizer.setCache(cacheKey, data);
                    break;
                case 'delete':
                    window.performance_optimizer.removeCache(cacheKey);
                    break;
            }
        }
    }

    // 处理用户活动
    handleUserActivity(payload) {
        console.log('👤 用户活动:', payload);
        this.emit('user_activity', payload);
    }

    // 处理系统更新
    handleSystemUpdate(payload) {
        console.log('🔧 系统更新:', payload);
        
        if (payload.type === 'refresh') {
            // 显示刷新提示
            if (window.UI && window.UI.showMessage) {
                window.UI.showMessage(
                    '系统已更新，请刷新页面获取最新功能',
                    'info',
                    5000,
                    [{
                        text: '刷新',
                        onClick: () => window.location.reload()
                    }]
                );
            }
        }
    }

    // 关闭连接
    close() {
        if (this.reconnectTimer) {
            clearTimeout(this.reconnectTimer);
        }
        
        this.stopHeartbeat();
        
        if (this.ws) {
            this.ws.close(1000, '主动关闭');
        }
        
        this.isConnected = false;
    }

    // 获取连接状态
    getStatus() {
        return {
            connected: this.isConnected,
            online: this.isOnline,
            reconnectAttempts: this.reconnectAttempts,
            offlineQueueSize: this.offlineQueue.length
        };
    }
}

// 实时通知管理器
class NotificationManager {
    constructor() {
        this.permission = Notification.permission;
        this.init();
    }

    // 初始化
    init() {
        this.requestPermission();
        this.setupVisibilityAPI();
    }

    // 请求通知权限
    async requestPermission() {
        if ('Notification' in window && this.permission === 'default') {
            this.permission = await Notification.requestPermission();
        }
    }

    // 显示通知
    show(title, options = {}) {
        if (!('Notification' in window)) {
            console.warn('浏览器不支持桌面通知');
            return null;
        }

        if (this.permission !== 'granted') {
            console.warn('没有通知权限');
            return null;
        }

        const defaultOptions = {
            icon: '/favicon.ico',
            badge: '/favicon.ico',
            lang: 'zh-CN',
            dir: 'auto',
            requireInteraction: false
        };

        const notification = new Notification(title, { ...defaultOptions, ...options });
        
        // 自动关闭（如果没有设置requireInteraction）
        if (!options.requireInteraction) {
            setTimeout(() => {
                notification.close();
            }, options.duration || 5000);
        }

        return notification;
    }

    // 设置页面可见性监听
    setupVisibilityAPI() {
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                console.log('页面已隐藏，启用桌面通知');
            } else {
                console.log('页面已显示，使用页面内通知');
            }
        });
    }
}

// 数据同步管理器
class DataSyncManager {
    constructor(wsManager) {
        this.wsManager = wsManager;
        this.syncQueue = new Map();
        this.syncInProgress = new Set();
        this.lastSyncTime = new Map();
        
        this.init();
    }

    // 初始化
    init() {
        // 监听数据同步事件
        this.wsManager.on('data_sync', (data) => {
            this.handleRemoteSync(data);
        });

        // 定期检查待同步数据
        setInterval(() => {
            this.processSyncQueue();
        }, 5000);
    }

    // 添加待同步数据
    addToSyncQueue(entity, action, data) {
        const key = `${entity}_${data.id || Date.now()}`;
        
        this.syncQueue.set(key, {
            entity,
            action,
            data,
            timestamp: Date.now(),
            retryCount: 0
        });

        console.log('📝 添加到同步队列:', entity, action);
    }

    // 处理同步队列
    async processSyncQueue() {
        if (this.syncQueue.size === 0) return;

        console.log(`🔄 处理同步队列: ${this.syncQueue.size} 项`);

        for (const [key, syncItem] of this.syncQueue) {
            if (this.syncInProgress.has(key)) continue;

            try {
                this.syncInProgress.add(key);
                await this.syncItem(syncItem);
                this.syncQueue.delete(key);
                this.syncInProgress.delete(key);
            } catch (error) {
                this.syncInProgress.delete(key);
                syncItem.retryCount++;
                
                if (syncItem.retryCount >= 3) {
                    console.error('同步失败，已重试3次:', key, error);
                    this.syncQueue.delete(key);
                } else {
                    console.warn(`同步失败，将重试 (${syncItem.retryCount}/3):`, key, error);
                }
            }
        }
    }

    // 同步单个项目
    async syncItem(syncItem) {
        const { entity, action, data } = syncItem;
        
        // 通过WebSocket发送同步请求
        const result = await this.wsManager.send('sync_request', {
            entity,
            action,
            data
        }, true);

        console.log('✅ 同步成功:', entity, action, result);
        
        // 更新最后同步时间
        this.lastSyncTime.set(entity, Date.now());
    }

    // 处理远程同步
    handleRemoteSync(syncData) {
        const { entity, action, data, source } = syncData;
        
        // 忽略自己发起的同步
        if (source === 'self') return;

        console.log('🔄 收到远程同步:', entity, action);

        // 触发页面更新
        this.updatePageData(entity, action, data);
    }

    // 更新页面数据
    updatePageData(entity, action, data) {
        // 根据实体类型更新对应页面
        switch (entity) {
            case 'customer':
                this.updateCustomerData(action, data);
                break;
            case 'lead':
                this.updateLeadData(action, data);
                break;
            case 'product':
                this.updateProductData(action, data);
                break;
            default:
                console.log('未知实体类型:', entity);
        }
    }

    // 更新客户数据
    updateCustomerData(action, data) {
        const event = new CustomEvent('customerDataUpdate', {
            detail: { action, data }
        });
        document.dispatchEvent(event);
    }

    // 更新线索数据
    updateLeadData(action, data) {
        const event = new CustomEvent('leadDataUpdate', {
            detail: { action, data }
        });
        document.dispatchEvent(event);
    }

    // 更新产品数据
    updateProductData(action, data) {
        const event = new CustomEvent('productDataUpdate', {
            detail: { action, data }
        });
        document.dispatchEvent(event);
    }
}

// 全局实例
const wsManager = new WebSocketManager();
const notificationManager = new NotificationManager();
const dataSyncManager = new DataSyncManager(wsManager);

// 暴露到全局
window.WebSocketManager = WebSocketManager;
window.NotificationManager = NotificationManager;
window.DataSyncManager = DataSyncManager;
window.wsManager = wsManager;
window.notificationManager = notificationManager;
window.dataSyncManager = dataSyncManager;

// 页面卸载时清理资源
window.addEventListener('beforeunload', () => {
    wsManager.close();
});