/**
 * 第三阶段交互式测试仪表板
 * 提供实时测试、性能监控、问题追踪等功能
 * @version 1.0.0
 */

class Phase3TestDashboard {
    constructor() {
        this.tests = [];
        this.results = {
            leads: {},
            product: {},
            customer: {},
            errors: []
        };
        this.performanceMetrics = {};
        this.startTime = performance.now();
    }

    /**
     * 创建测试仪表板UI
     */
    createDashboardUI() {
        const html = `
            <div id="phase3Dashboard" class="fixed bottom-4 right-4 z-40 max-w-sm">
                <!-- 仪表板头部 -->
                <div class="bg-gradient-to-r from-primary to-secondary rounded-t-lg px-4 py-3 shadow-lg cursor-pointer" onclick="toggleDashboardPanel()">
                    <div class="flex items-center justify-between">
                        <div class="flex items-center space-x-2">
                            <span class="text-2xl">🧪</span>
                            <div>
                                <h3 class="text-white font-bold text-sm">Phase 3 测试面板</h3>
                                <p class="text-white/80 text-xs">实时诊断和性能监控</p>
                            </div>
                        </div>
                        <button id="dashboardToggle" class="text-white hover:bg-white/20 rounded p-1 transition-colors">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                            </svg>
                        </button>
                    </div>
                </div>

                <!-- 仪表板内容 -->
                <div id="dashboardContent" class="hidden bg-white rounded-b-lg shadow-lg max-h-96 overflow-y-auto">
                    <div class="p-4 space-y-4">
                        <!-- 快速诊断按钮 -->
                        <button onclick="window.phase3Dashboard.runQuickDiagnostics()" class="w-full px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium">
                            🚀 运行快速诊断
                        </button>

                        <!-- 功能测试选项 -->
                        <div class="border-t pt-3">
                            <h4 class="font-semibold text-gray-900 text-sm mb-2">📋 功能测试</h4>
                            <div class="space-y-2">
                                <label class="flex items-center space-x-2 cursor-pointer">
                                    <input type="checkbox" class="test-checkbox" value="leads" />
                                    <span class="text-sm text-gray-700">线索页面测试</span>
                                </label>
                                <label class="flex items-center space-x-2 cursor-pointer">
                                    <input type="checkbox" class="test-checkbox" value="product" />
                                    <span class="text-sm text-gray-700">产品页面测试</span>
                                </label>
                                <label class="flex items-center space-x-2 cursor-pointer">
                                    <input type="checkbox" class="test-checkbox" value="customer" />
                                    <span class="text-sm text-gray-700">客户页面测试</span>
                                </label>
                            </div>
                        </div>

                        <!-- 性能指标 -->
                        <div class="border-t pt-3">
                            <h4 class="font-semibold text-gray-900 text-sm mb-2">⚡ 性能指标</h4>
                            <div class="bg-gray-50 rounded p-2 text-xs space-y-1">
                                <div class="flex justify-between">
                                    <span>页面加载时间:</span>
                                    <span id="pageLoadTime" class="font-mono font-semibold text-primary">-</span>
                                </div>
                                <div class="flex justify-between">
                                    <span>内存占用:</span>
                                    <span id="memoryUsage" class="font-mono font-semibold text-primary">-</span>
                                </div>
                                <div class="flex justify-between">
                                    <span>网络请求:</span>
                                    <span id="networkRequests" class="font-mono font-semibold text-primary">-</span>
                                </div>
                                <div class="flex justify-between">
                                    <span>脚本执行:</span>
                                    <span id="scriptTime" class="font-mono font-semibold text-primary">-</span>
                                </div>
                            </div>
                        </div>

                        <!-- 错误日志 -->
                        <div class="border-t pt-3">
                            <h4 class="font-semibold text-gray-900 text-sm mb-2">⚠️ 错误日志</h4>
                            <div id="errorLog" class="bg-red-50 rounded p-2 text-xs max-h-24 overflow-y-auto space-y-1">
                                <p class="text-gray-600">暂无错误</p>
                            </div>
                        </div>

                        <!-- 操作按钮 -->
                        <div class="flex space-x-2 border-t pt-3">
                            <button onclick="window.phase3Dashboard.exportResults()" class="flex-1 px-3 py-1.5 bg-blue-50 text-blue-700 rounded text-xs hover:bg-blue-100 transition-colors">
                                📥 导出结果
                            </button>
                            <button onclick="window.phase3Dashboard.clearLogs()" class="flex-1 px-3 py-1.5 bg-gray-50 text-gray-700 rounded text-xs hover:bg-gray-100 transition-colors">
                                🗑️ 清除日志
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', html);
    }

    /**
     * 运行快速诊断
     */
    async runQuickDiagnostics() {
        console.log('🚀 启动快速诊断...');
        
        // 如果诊断脚本可用，运行它
        if (window.phase3Diagnostics && window.phase3Diagnostics.runAll) {
            const results = await window.phase3Diagnostics.runAll();
            this.logResult('诊断完成', results);
        } else {
            this.logError('诊断脚本未加载');
        }

        // 更新性能指标
        this.updatePerformanceMetrics();
    }

    /**
     * 更新性能指标
     */
    updatePerformanceMetrics() {
        // 页面加载时间
        if (window.performance && window.performance.timing) {
            const timing = window.performance.timing;
            const pageLoadTime = timing.loadEventEnd - timing.navigationStart;
            document.getElementById('pageLoadTime').textContent = 
                pageLoadTime > 0 ? `${pageLoadTime}ms` : '计算中...';
        }

        // 内存占用
        if (performance.memory) {
            const memory = performance.memory;
            const usedMB = (memory.usedJSHeapSize / 1048576).toFixed(2);
            document.getElementById('memoryUsage').textContent = `${usedMB}MB`;
        }

        // 网络请求
        const resources = window.performance.getEntriesByType('resource');
        const requests = resources.filter(r => r.name.includes('api') || r.name.includes('/data/')).length;
        document.getElementById('networkRequests').textContent = `${requests}个`;

        // 脚本执行时间
        const scriptsTime = resources
            .filter(r => r.name.includes('.js'))
            .reduce((sum, r) => sum + r.duration, 0);
        document.getElementById('scriptTime').textContent = `${scriptsTime.toFixed(0)}ms`;
    }

    /**
     * 记录测试结果
     */
    logResult(title, data) {
        this.tests.push({
            title,
            data,
            timestamp: new Date().toLocaleString(),
            type: 'success'
        });
        console.log(`✅ ${title}:`, data);
    }

    /**
     * 记录错误
     */
    logError(message, error = null) {
        const errorLog = document.getElementById('errorLog');
        const errorItem = document.createElement('div');
        errorItem.className = 'text-red-600 break-words';
        errorItem.textContent = `❌ ${message}`;
        if (errorLog) errorLog.appendChild(errorItem);
        
        this.results.errors.push({ message, error, timestamp: new Date() });
        console.error(`❌ 错误: ${message}`, error);
    }

    /**
     * 导出测试结果
     */
    exportResults() {
        const report = {
            timestamp: new Date().toISOString(),
            tests: this.tests,
            results: this.results,
            metrics: this.performanceMetrics
        };

        // 生成JSON文件
        const dataStr = JSON.stringify(report, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `phase3-test-report-${Date.now()}.json`;
        link.click();
        URL.revokeObjectURL(url);

        console.log('📥 测试报告已导出');
    }

    /**
     * 清除日志
     */
    clearLogs() {
        const errorLog = document.getElementById('errorLog');
        if (errorLog) {
            errorLog.innerHTML = '<p class="text-gray-600">暂无错误</p>';
        }
        this.results.errors = [];
        console.log('🗑️ 日志已清除');
    }
}

// 全局函数
function toggleDashboardPanel() {
    const content = document.getElementById('dashboardContent');
    const toggle = document.getElementById('dashboardToggle');
    if (content) {
        content.classList.toggle('hidden');
        toggle.style.transform = content.classList.contains('hidden') 
            ? 'rotate(0deg)' 
            : 'rotate(180deg)';
    }
}

// 初始化仪表板
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        if (!window.phase3Dashboard) {
            window.phase3Dashboard = new Phase3TestDashboard();
            window.phase3Dashboard.createDashboardUI();
        }
    });
} else {
    if (!window.phase3Dashboard) {
        window.phase3Dashboard = new Phase3TestDashboard();
        window.phase3Dashboard.createDashboardUI();
    }
}
