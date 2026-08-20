/*!
 * ShopPro UI Components
 * 通用UI组件库，提供加载动画、提示框、表格等组件
 * @version 1.0.0
 * @author ShopPro Team
 */

class UIComponents {
    constructor() {
        this.loadingCount = 0;
        this.init();
    }
    
    init() {
        // 创建全局容器
        this.createGlobalContainers();
        
        // 绑定全局事件
        this.bindGlobalEvents();
        
        // 初始化默认主题
        this.initTheme();
    }
    
    /**
     * 创建全局容器
     */
    createGlobalContainers() {
        // 加载动画容器
        if (!document.getElementById('global-loading')) {
            const loadingHTML = `
                <div id="global-loading" class="loading-overlay" style="display: none;">
                    <div class="loading-spinner">
                        <div class="spinner-ring"></div>
                        <div class="loading-text">加载中...</div>
                    </div>
                </div>
            `;
            document.body.insertAdjacentHTML('beforeend', loadingHTML);
        }
        
        // 消息提示容器
        if (!document.getElementById('message-container')) {
            const messageHTML = `
                <div id="message-container" class="message-container"></div>
            `;
            document.body.insertAdjacentHTML('beforeend', messageHTML);
        }
        
        // 模态框容器
        if (!document.getElementById('modal-container')) {
            const modalHTML = `
                <div id="modal-container" class="modal-container"></div>
            `;
            document.body.insertAdjacentHTML('beforeend', modalHTML);
        }
    }
    
    /**
     * 绑定全局事件
     */
    bindGlobalEvents() {
        // ESC键关闭模态框
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeModal();
            }
        });
        
        // 点击模态框背景关闭
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal-overlay')) {
                this.closeModal();
            }
        });
    }
    
    /**
     * 初始化主题
     */
    initTheme() {
        // 从localStorage读取主题设置
        const savedTheme = localStorage.getItem('app-theme') || 'light';
        this.setTheme(savedTheme);
    }
    
    /**
     * 设置主题
     * @param {string} theme - light|dark
     */
    setTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('app-theme', theme);
        
        // 更新主题切换按钮状态
        const themeToggle = document.querySelector('.theme-toggle');
        if (themeToggle) {
            themeToggle.classList.toggle('dark', theme === 'dark');
        }
    }
    
    /**
     * 切换主题
     */
    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        this.setTheme(newTheme);
    }
    
    /**
     * 显示加载动画
     * @param {string} text - 加载文本
     */
    showLoading(text = '加载中...') {
        this.loadingCount++;
        
        const loading = document.getElementById('global-loading');
        const loadingText = loading.querySelector('.loading-text');
        
        if (loadingText) {
            loadingText.textContent = text;
        }
        
        loading.style.display = 'flex';
        document.body.classList.add('loading');
    }
    
    /**
     * 隐藏加载动画
     */
    hideLoading() {
        this.loadingCount = Math.max(0, this.loadingCount - 1);
        
        if (this.loadingCount === 0) {
            const loading = document.getElementById('global-loading');
            loading.style.display = 'none';
            document.body.classList.remove('loading');
        }
    }
    
    /**
     * 显示消息提示
     * @param {string} message - 消息内容
     * @param {string} type - success|error|warning|info
     * @param {number} duration - 持续时间(ms)
     */
    showMessage(message, type = 'info', duration = 4000) {
        const container = document.getElementById('message-container');
        const messageId = 'message-' + Date.now();
        
        // 图标映射
        const icons = {
            success: '✓',
            error: '✕',
            warning: '⚠',
            info: 'ℹ'
        };
        
        const messageHTML = `
            <div id="${messageId}" class="message-item message-${type} message-enter">
                <div class="message-icon">${icons[type]}</div>
                <div class="message-content">${message}</div>
                <button class="message-close" onclick="UI.closeMessage('${messageId}')">×</button>
            </div>
        `;
        
        container.insertAdjacentHTML('beforeend', messageHTML);
        
        // 触发入场动画
        setTimeout(() => {
            const messageEl = document.getElementById(messageId);
            if (messageEl) {
                messageEl.classList.remove('message-enter');
                messageEl.classList.add('message-show');
            }
        }, 10);
        
        // 自动关闭
        if (duration > 0) {
            setTimeout(() => {
                this.closeMessage(messageId);
            }, duration);
        }
        
        return messageId;
    }
    
    /**
     * 关闭消息提示
     * @param {string} messageId 
     */
    closeMessage(messageId) {
        const messageEl = document.getElementById(messageId);
        if (messageEl) {
            messageEl.classList.add('message-exit');
            setTimeout(() => {
                messageEl.remove();
            }, 300);
        }
    }
    
    /**
     * 显示确认对话框
     * @param {string} title - 标题
     * @param {string} content - 内容
     * @param {Object} options - 配置选项
     */
    showConfirm(title, content, options = {}) {
        return new Promise((resolve) => {
            const defaultOptions = {
                confirmText: '确定',
                cancelText: '取消',
                type: 'warning'
            };
            
            const opts = { ...defaultOptions, ...options };
            
            const modalHTML = `
                <div class="modal-overlay">
                    <div class="modal-dialog modal-sm">
                        <div class="modal-header">
                            <h4 class="modal-title">${title}</h4>
                        </div>
                        <div class="modal-body">
                            <div class="confirm-content">
                                <div class="confirm-icon confirm-${opts.type}">
                                    ${opts.type === 'danger' ? '⚠' : '?'}
                                </div>
                                <div class="confirm-text">${content}</div>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button class="btn btn-default" data-action="cancel">${opts.cancelText}</button>
                            <button class="btn btn-${opts.type}" data-action="confirm">${opts.confirmText}</button>
                        </div>
                    </div>
                </div>
            `;
            
            const container = document.getElementById('modal-container');
            container.innerHTML = modalHTML;
            
            // 绑定事件
            container.addEventListener('click', (e) => {
                const action = e.target.dataset.action;
                if (action) {
                    this.closeModal();
                    resolve(action === 'confirm');
                }
            });
            
            // 显示模态框
            setTimeout(() => {
                container.classList.add('show');
            }, 10);
        });
    }
    
    /**
     * 显示模态框
     * @param {string} title - 标题
     * @param {string} content - 内容HTML
     * @param {Object} options - 配置选项
     */
    showModal(title, content, options = {}) {
        const defaultOptions = {
            size: 'md', // sm|md|lg
            closable: true,
            footer: ''
        };
        
        const opts = { ...defaultOptions, ...options };
        
        const modalHTML = `
            <div class="modal-overlay">
                <div class="modal-dialog modal-${opts.size}">
                    <div class="modal-header">
                        <h4 class="modal-title">${title}</h4>
                        ${opts.closable ? '<button class="modal-close" data-action="close">×</button>' : ''}
                    </div>
                    <div class="modal-body">
                        ${content}
                    </div>
                    ${opts.footer ? `<div class="modal-footer">${opts.footer}</div>` : ''}
                </div>
            </div>
        `;
        
        const container = document.getElementById('modal-container');
        container.innerHTML = modalHTML;
        
        // 绑定关闭事件
        container.addEventListener('click', (e) => {
            if (e.target.dataset.action === 'close') {
                this.closeModal();
            }
        });
        
        // 显示模态框
        setTimeout(() => {
            container.classList.add('show');
        }, 10);
    }
    
    /**
     * 关闭模态框
     */
    closeModal() {
        const container = document.getElementById('modal-container');
        container.classList.remove('show');
        
        setTimeout(() => {
            container.innerHTML = '';
        }, 300);
    }
    
    /**
     * 创建数据表格
     * @param {Array} data - 数据数组
     * @param {Array} columns - 列配置
     * @param {Object} options - 表格选项
     */
    createTable(data, columns, options = {}) {
        const defaultOptions = {
            pagination: true,
            pageSize: 10,
            sortable: true,
            searchable: true,
            selectable: false
        };
        
        const opts = { ...defaultOptions, ...options };
        
        // 创建表格容器
        const tableId = 'table-' + Date.now();
        const tableHTML = `
            <div class="data-table-wrapper" id="${tableId}">
                ${opts.searchable ? `
                    <div class="table-toolbar">
                        <div class="table-search">
                            <input type="text" placeholder="搜索..." class="table-search-input">
                            <button class="table-search-btn">🔍</button>
                        </div>
                    </div>
                ` : ''}
                <div class="table-container">
                    <table class="data-table">
                        <thead>
                            <tr>
                                ${opts.selectable ? '<th class="table-checkbox"><input type="checkbox" class="select-all"></th>' : ''}
                                ${columns.map(col => `
                                    <th class="table-header ${col.sortable !== false && opts.sortable ? 'sortable' : ''}" 
                                        data-field="${col.field}">
                                        ${col.title}
                                        ${col.sortable !== false && opts.sortable ? '<span class="sort-icon"></span>' : ''}
                                    </th>
                                `).join('')}
                            </tr>
                        </thead>
                        <tbody class="table-body">
                        </tbody>
                    </table>
                </div>
                ${opts.pagination ? `
                    <div class="table-pagination">
                        <div class="pagination-info"></div>
                        <div class="pagination-controls">
                            <button class="btn btn-sm" data-action="prev">上一页</button>
                            <span class="pagination-numbers"></span>
                            <button class="btn btn-sm" data-action="next">下一页</button>
                        </div>
                    </div>
                ` : ''}
            </div>
        `;
        
        return {
            html: tableHTML,
            tableId: tableId,
            render: (container) => {
                container.innerHTML = tableHTML;
                this.bindTableEvents(tableId, data, columns, opts);
                this.renderTableData(tableId, data, columns, opts);
            }
        };
    }
    
    /**
     * 绑定表格事件
     */
    bindTableEvents(tableId, data, columns, options) {
        const tableEl = document.getElementById(tableId);
        if (!tableEl) return;
        
        // 搜索功能
        if (options.searchable) {
            const searchInput = tableEl.querySelector('.table-search-input');
            const searchBtn = tableEl.querySelector('.table-search-btn');
            
            const performSearch = () => {
                const keyword = searchInput.value.toLowerCase();
                const filteredData = keyword ? 
                    data.filter(item => 
                        columns.some(col => 
                            String(item[col.field] || '').toLowerCase().includes(keyword)
                        )
                    ) : data;
                
                this.renderTableData(tableId, filteredData, columns, options);
            };
            
            searchBtn.addEventListener('click', performSearch);
            searchInput.addEventListener('keyup', (e) => {
                if (e.key === 'Enter') {
                    performSearch();
                }
            });
        }
        
        // 排序功能
        if (options.sortable) {
            tableEl.addEventListener('click', (e) => {
                const header = e.target.closest('.sortable');
                if (!header) return;
                
                const field = header.dataset.field;
                const currentSort = header.dataset.sort;
                
                // 清除其他排序状态
                tableEl.querySelectorAll('.sortable').forEach(el => {
                    el.dataset.sort = '';
                    el.classList.remove('sort-asc', 'sort-desc');
                });
                
                // 设置新排序状态
                let newSort = 'asc';
                if (currentSort === 'asc') {
                    newSort = 'desc';
                }
                
                header.dataset.sort = newSort;
                header.classList.add('sort-' + newSort);
                
                // 排序数据
                const sortedData = [...data].sort((a, b) => {
                    const aVal = a[field] || '';
                    const bVal = b[field] || '';
                    
                    if (newSort === 'asc') {
                        return aVal > bVal ? 1 : -1;
                    } else {
                        return aVal < bVal ? 1 : -1;
                    }
                });
                
                this.renderTableData(tableId, sortedData, columns, options);
            });
        }
    }
    
    /**
     * 渲染表格数据
     */
    renderTableData(tableId, data, columns, options, currentPage = 1) {
        const tableEl = document.getElementById(tableId);
        if (!tableEl) return;
        
        const tbody = tableEl.querySelector('.table-body');
        const pageSize = options.pageSize || 10;
        
        // 分页处理
        let displayData = data;
        let totalPages = 1;
        
        if (options.pagination) {
            totalPages = Math.ceil(data.length / pageSize);
            const startIndex = (currentPage - 1) * pageSize;
            displayData = data.slice(startIndex, startIndex + pageSize);
            
            // 更新分页信息
            this.updatePagination(tableEl, currentPage, totalPages, data.length);
        }
        
        // 渲染表格行
        tbody.innerHTML = displayData.map((item, index) => {
            return `
                <tr class="table-row" data-index="${index}">
                    ${options.selectable ? `<td class="table-checkbox"><input type="checkbox" value="${item.id || index}"></td>` : ''}
                    ${columns.map(col => {
                        let value = item[col.field] || '';
                        
                        // 自定义渲染函数
                        if (col.render && typeof col.render === 'function') {
                            value = col.render(value, item, index);
                        }
                        
                        return `<td class="table-cell">${value}</td>`;
                    }).join('')}
                </tr>
            `;
        }).join('');
        
        // 如果没有数据，显示空状态
        if (displayData.length === 0) {
            tbody.innerHTML = `
                <tr class="table-empty">
                    <td colspan="${columns.length + (options.selectable ? 1 : 0)}" class="text-center">
                        <div class="empty-state">
                            <div class="empty-icon">📋</div>
                            <div class="empty-text">暂无数据</div>
                        </div>
                    </td>
                </tr>
            `;
        }
    }
    
    /**
     * 更新分页控件
     */
    updatePagination(tableEl, currentPage, totalPages, totalCount) {
        const paginationInfo = tableEl.querySelector('.pagination-info');
        const paginationNumbers = tableEl.querySelector('.pagination-numbers');
        const prevBtn = tableEl.querySelector('[data-action="prev"]');
        const nextBtn = tableEl.querySelector('[data-action="next"]');
        
        if (paginationInfo) {
            paginationInfo.textContent = `共 ${totalCount} 条记录，第 ${currentPage}/${totalPages} 页`;
        }
        
        if (prevBtn) {
            prevBtn.disabled = currentPage <= 1;
        }
        
        if (nextBtn) {
            nextBtn.disabled = currentPage >= totalPages;
        }
        
        // 生成页码按钮
        if (paginationNumbers) {
            const pageNumbers = [];
            const maxVisible = 5;
            
            let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
            let end = Math.min(totalPages, start + maxVisible - 1);
            
            if (end - start + 1 < maxVisible) {
                start = Math.max(1, end - maxVisible + 1);
            }
            
            for (let i = start; i <= end; i++) {
                pageNumbers.push(`
                    <button class="btn btn-sm ${i === currentPage ? 'btn-primary' : 'btn-default'}" 
                            data-action="page" data-page="${i}">
                        ${i}
                    </button>
                `);
            }
            
            paginationNumbers.innerHTML = pageNumbers.join('');
        }
    }
}

// 全局UI组件实例
const UI = new UIComponents();

// 导出UI组件
window.UI = UI;