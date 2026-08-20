/**
 * ShopPro 性能优化工具类
 * 提供页面加载优化、图片懒加载、虚拟滚动等功能
 */

class PerformanceOptimizer {
    constructor() {
        this.lazyImages = [];
        this.observers = [];
        this.debounceTimers = new Map();
        this.init();
    }

    // 初始化性能优化功能
    init() {
        this.initLazyLoading();
        this.initIntersectionObserver();
        this.initPerformanceMonitoring();
        this.initResourcePreloading();
        this.initCacheManager();
    }

    /**
     * 图片懒加载
     */
    initLazyLoading() {
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        this.loadImage(img);
                        observer.unobserve(img);
                    }
                });
            });

            // 观察所有懒加载图片
            document.querySelectorAll('img[data-src]').forEach(img => {
                imageObserver.observe(img);
            });

            this.observers.push(imageObserver);
        } else {
            // 兼容旧浏览器
            this.fallbackLazyLoading();
        }
    }

    // 加载图片
    loadImage(img) {
        const src = img.dataset.src;
        if (!src) return;

        // 创建新图片对象预加载
        const imageLoader = new Image();
        imageLoader.onload = () => {
            img.src = src;
            img.classList.add('loaded');
            img.removeAttribute('data-src');
        };
        imageLoader.onerror = () => {
            img.classList.add('error');
        };
        imageLoader.src = src;
    }

    // 兼容性懒加载
    fallbackLazyLoading() {
        const lazyImages = document.querySelectorAll('img[data-src]');
        
        const loadImages = this.throttle(() => {
            lazyImages.forEach(img => {
                if (this.isInViewport(img)) {
                    this.loadImage(img);
                }
            });
        }, 100);

        window.addEventListener('scroll', loadImages);
        window.addEventListener('resize', loadImages);
        loadImages(); // 初始加载
    }

    // 检查元素是否在视口内
    isInViewport(element) {
        const rect = element.getBoundingClientRect();
        const threshold = 100; // 提前100px加载

        return (
            rect.top >= -threshold &&
            rect.left >= -threshold &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) + threshold &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth) + threshold
        );
    }

    /**
     * 交集观察器优化
     */
    initIntersectionObserver() {
        // 观察动画元素
        const animationObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                } else {
                    entry.target.classList.remove('animate-in');
                }
            });
        });

        document.querySelectorAll('[data-animate]').forEach(el => {
            animationObserver.observe(el);
        });

        this.observers.push(animationObserver);
    }

    /**
     * 性能监控
     */
    initPerformanceMonitoring() {
        // 监控页面加载性能
        window.addEventListener('load', () => {
            if ('performance' in window) {
                const perfData = performance.getEntriesByType('navigation')[0];
                
                const metrics = {
                    dns: perfData.domainLookupEnd - perfData.domainLookupStart,
                    connection: perfData.connectEnd - perfData.connectStart,
                    request: perfData.responseStart - perfData.requestStart,
                    response: perfData.responseEnd - perfData.responseStart,
                    dom: perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart,
                    load: perfData.loadEventEnd - perfData.loadEventStart,
                    total: perfData.loadEventEnd - perfData.navigationStart
                };

                console.group('🚀 页面性能指标');
                console.log('DNS查询:', metrics.dns + 'ms');
                console.log('连接建立:', metrics.connection + 'ms');
                console.log('请求发送:', metrics.request + 'ms');
                console.log('响应接收:', metrics.response + 'ms');
                console.log('DOM构建:', metrics.dom + 'ms');
                console.log('页面加载:', metrics.load + 'ms');
                console.log('总耗时:', metrics.total + 'ms');
                console.groupEnd();

                // 性能警告
                if (metrics.total > 3000) {
                    console.warn('⚠️ 页面加载时间超过3秒，建议优化');
                }
            }
        });

        // 监控长任务
        if ('PerformanceObserver' in window) {
            const longTaskObserver = new PerformanceObserver(list => {
                list.getEntries().forEach(entry => {
                    console.warn('🐌 检测到长任务:', entry.duration + 'ms', entry);
                });
            });

            try {
                longTaskObserver.observe({ entryTypes: ['longtask'] });
                this.observers.push(longTaskObserver);
            } catch (e) {
                // 某些浏览器可能不支持
                console.log('长任务监控不支持');
            }
        }
    }

    /**
     * 资源预加载
     */
    initResourcePreloading() {
        // 预加载关键资源
        const preloadResources = [
            { href: '../assets/css/ui-components.css', as: 'style' },
            { href: '../assets/js/api-client.js', as: 'script' },
            { href: '../assets/js/utils.js', as: 'script' }
        ];

        preloadResources.forEach(resource => {
            if (!document.querySelector(`link[href="${resource.href}"]`)) {
                const link = document.createElement('link');
                link.rel = 'preload';
                link.href = resource.href;
                link.as = resource.as;
                document.head.appendChild(link);
            }
        });

        // DNS预连接
        const preconnectDomains = [
            'https://cdn.tailwindcss.com',
            'https://cdnjs.cloudflare.com'
        ];

        preconnectDomains.forEach(domain => {
            const link = document.createElement('link');
            link.rel = 'preconnect';
            link.href = domain;
            document.head.appendChild(link);
        });
    }

    /**
     * 缓存管理
     */
    initCacheManager() {
        this.cache = new Map();
        this.cacheExpiry = new Map();
        
        // 清理过期缓存
        setInterval(() => {
            this.cleanExpiredCache();
        }, 60000); // 每分钟清理一次
    }

    // 设置缓存
    setCache(key, data, expiry = 300000) { // 默认5分钟过期
        this.cache.set(key, data);
        this.cacheExpiry.set(key, Date.now() + expiry);
    }

    // 获取缓存
    getCache(key) {
        if (this.isCacheValid(key)) {
            return this.cache.get(key);
        }
        this.removeCache(key);
        return null;
    }

    // 检查缓存是否有效
    isCacheValid(key) {
        const expiry = this.cacheExpiry.get(key);
        return expiry && Date.now() < expiry;
    }

    // 移除缓存
    removeCache(key) {
        this.cache.delete(key);
        this.cacheExpiry.delete(key);
    }

    // 清理过期缓存
    cleanExpiredCache() {
        this.cacheExpiry.forEach((expiry, key) => {
            if (Date.now() >= expiry) {
                this.removeCache(key);
            }
        });
    }

    /**
     * 虚拟滚动实现
     */
    createVirtualScroll(container, items, itemHeight, renderItem) {
        const containerHeight = container.offsetHeight;
        const visibleCount = Math.ceil(containerHeight / itemHeight);
        const bufferSize = Math.ceil(visibleCount / 2);
        
        let startIndex = 0;
        let endIndex = Math.min(items.length, visibleCount + bufferSize);

        const totalHeight = items.length * itemHeight;
        const viewport = document.createElement('div');
        viewport.style.height = totalHeight + 'px';
        viewport.style.position = 'relative';

        const renderItems = () => {
            viewport.innerHTML = '';
            
            for (let i = startIndex; i < endIndex; i++) {
                if (i >= items.length) break;
                
                const itemElement = renderItem(items[i], i);
                itemElement.style.position = 'absolute';
                itemElement.style.top = (i * itemHeight) + 'px';
                itemElement.style.height = itemHeight + 'px';
                itemElement.style.width = '100%';
                
                viewport.appendChild(itemElement);
            }
        };

        const updateVisibleRange = this.throttle(() => {
            const scrollTop = container.scrollTop;
            const newStartIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - bufferSize);
            const newEndIndex = Math.min(items.length, newStartIndex + visibleCount + 2 * bufferSize);

            if (newStartIndex !== startIndex || newEndIndex !== endIndex) {
                startIndex = newStartIndex;
                endIndex = newEndIndex;
                renderItems();
            }
        }, 16); // 60fps

        container.appendChild(viewport);
        container.addEventListener('scroll', updateVisibleRange);
        
        renderItems();

        return {
            update: (newItems) => {
                items = newItems;
                viewport.style.height = (items.length * itemHeight) + 'px';
                updateVisibleRange();
            },
            destroy: () => {
                container.removeEventListener('scroll', updateVisibleRange);
                container.removeChild(viewport);
            }
        };
    }

    /**
     * 工具函数
     */

    // 节流函数
    throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    // 防抖函数
    debounce(func, delay, key = 'default') {
        return (...args) => {
            if (this.debounceTimers.has(key)) {
                clearTimeout(this.debounceTimers.get(key));
            }
            
            const timer = setTimeout(() => {
                func.apply(this, args);
                this.debounceTimers.delete(key);
            }, delay);
            
            this.debounceTimers.set(key, timer);
        };
    }

    // 页面可见性API
    onVisibilityChange(callback) {
        let hidden, visibilityChange;
        
        if (typeof document.hidden !== 'undefined') {
            hidden = 'hidden';
            visibilityChange = 'visibilitychange';
        } else if (typeof document.msHidden !== 'undefined') {
            hidden = 'msHidden';
            visibilityChange = 'msvisibilitychange';
        } else if (typeof document.webkitHidden !== 'undefined') {
            hidden = 'webkitHidden';
            visibilityChange = 'webkitvisibilitychange';
        }

        if (hidden && visibilityChange) {
            document.addEventListener(visibilityChange, () => {
                callback(document[hidden]);
            });
        }
    }

    // 内存使用监控
    monitorMemoryUsage() {
        if ('performance' in window && 'memory' in performance) {
            const memory = performance.memory;
            return {
                used: Math.round(memory.usedJSHeapSize / 1048576), // MB
                total: Math.round(memory.totalJSHeapSize / 1048576), // MB
                limit: Math.round(memory.jsHeapSizeLimit / 1048576) // MB
            };
        }
        return null;
    }

    // 网络状态检测
    getNetworkInfo() {
        if ('connection' in navigator) {
            const connection = navigator.connection;
            return {
                effectiveType: connection.effectiveType,
                downlink: connection.downlink,
                rtt: connection.rtt,
                saveData: connection.saveData
            };
        }
        return null;
    }

    // 设备性能检测
    getDevicePerformance() {
        const cores = navigator.hardwareConcurrency || 1;
        const memory = navigator.deviceMemory || 0;
        
        // 简单的性能评级
        let performance_level = 'low';
        if (cores >= 4 && memory >= 4) {
            performance_level = 'high';
        } else if (cores >= 2 && memory >= 2) {
            performance_level = 'medium';
        }

        return {
            cores,
            memory,
            performance_level
        };
    }

    // 清理资源
    destroy() {
        // 清理观察器
        this.observers.forEach(observer => {
            if (observer && typeof observer.disconnect === 'function') {
                observer.disconnect();
            }
        });

        // 清理定时器
        this.debounceTimers.forEach(timer => {
            clearTimeout(timer);
        });
        this.debounceTimers.clear();

        // 清理缓存
        this.cache.clear();
        this.cacheExpiry.clear();
    }
}

// 骨架屏生成器
class SkeletonGenerator {
    static generate(type, options = {}) {
        const skeleton = document.createElement('div');
        skeleton.className = 'skeleton-container';

        switch (type) {
            case 'card':
                skeleton.innerHTML = this.generateCardSkeleton(options);
                break;
            case 'list':
                skeleton.innerHTML = this.generateListSkeleton(options);
                break;
            case 'table':
                skeleton.innerHTML = this.generateTableSkeleton(options);
                break;
            default:
                skeleton.innerHTML = this.generateDefaultSkeleton(options);
        }

        return skeleton;
    }

    static generateCardSkeleton(options) {
        const { width = '100%', height = '200px' } = options;
        return `
            <div class="skeleton-card" style="width: ${width}; height: ${height};">
                <div class="skeleton skeleton-image" style="height: 60%; margin-bottom: 1rem;"></div>
                <div class="skeleton skeleton-text" style="height: 1rem; margin-bottom: 0.5rem;"></div>
                <div class="skeleton skeleton-text" style="height: 1rem; width: 70%;"></div>
            </div>
        `;
    }

    static generateListSkeleton(options) {
        const { count = 5, itemHeight = '60px' } = options;
        let items = '';
        
        for (let i = 0; i < count; i++) {
            items += `
                <div class="skeleton-list-item" style="height: ${itemHeight}; margin-bottom: 1rem;">
                    <div class="skeleton skeleton-circle" style="width: 40px; height: 40px; margin-right: 1rem;"></div>
                    <div class="skeleton-content" style="flex: 1;">
                        <div class="skeleton skeleton-text" style="height: 1rem; margin-bottom: 0.5rem;"></div>
                        <div class="skeleton skeleton-text" style="height: 0.8rem; width: 60%;"></div>
                    </div>
                </div>
            `;
        }
        
        return items;
    }

    static generateTableSkeleton(options) {
        const { rows = 5, columns = 4 } = options;
        let tableRows = '';
        
        for (let i = 0; i < rows; i++) {
            let tableCols = '';
            for (let j = 0; j < columns; j++) {
                tableCols += '<td><div class="skeleton skeleton-text" style="height: 1rem;"></div></td>';
            }
            tableRows += `<tr>${tableCols}</tr>`;
        }
        
        return `<table class="skeleton-table" style="width: 100%;"><tbody>${tableRows}</tbody></table>`;
    }

    static generateDefaultSkeleton(options) {
        const { lines = 3 } = options;
        let content = '';
        
        for (let i = 0; i < lines; i++) {
            const width = i === lines - 1 ? '60%' : '100%';
            content += `<div class="skeleton skeleton-text" style="height: 1rem; width: ${width}; margin-bottom: 0.5rem;"></div>`;
        }
        
        return content;
    }
}

// 全局实例
const performance_optimizer = new PerformanceOptimizer();

// 暴露到全局
window.PerformanceOptimizer = PerformanceOptimizer;
window.SkeletonGenerator = SkeletonGenerator;
window.performance_optimizer = performance_optimizer;

// 页面卸载时清理资源
window.addEventListener('beforeunload', () => {
    performance_optimizer.destroy();
});