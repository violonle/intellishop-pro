/**
 * ShopPro 第三方服务集成脚本
 * 提供企业微信、钉钉、SMS、邮件、支付等服务集成
 * @version 1.0.0
 */

// ==================== 企业微信集成 ====================

/**
 * 企业微信集成模块
 */
const wecomIntegration = {
    /**
     * 发送消息
     * @param {Object} params - 参数
     * @returns {Promise}
     */
    sendMessage: async function(params) {
        try {
            const {
                toUser,     // 接收员工ID
                toParty,    // 接收部门ID
                toTag,      // 接收标签ID
                msgType,    // 消息类型 (text, image, video, etc)
                content,    // 消息内容
                title,      // 标题（可选）
                description // 描述（可选）
            } = params;

            console.log('📤 发送企业微信消息...');

            const response = await window.api.integrations.wecom.sendMessage({
                toUser,
                toParty,
                toTag,
                msgType,
                content,
                title,
                description
            });

            console.log('✅ 企业微信消息已发送');
            return response;
        } catch (error) {
            console.error('❌ 发送企业微信消息失败:', error);
            return null;
        }
    },

    /**
     * 同步用户
     * @returns {Promise}
     */
    syncUsers: async function() {
        try {
            console.log('🔄 同步企业微信用户...');
            const response = await window.api.integrations.wecom.syncUsers();
            console.log('✅ 用户同步完成');
            return response;
        } catch (error) {
            console.error('❌ 用户同步失败:', error);
            return null;
        }
    },

    /**
     * 同步部门
     * @returns {Promise}
     */
    syncDepartments: async function() {
        try {
            console.log('🔄 同步企业微信部门...');
            const response = await window.api.integrations.wecom.syncDepartments();
            console.log('✅ 部门同步完成');
            return response;
        } catch (error) {
            console.error('❌ 部门同步失败:', error);
            return null;
        }
    },

    /**
     * 获取配置
     * @returns {Promise}
     */
    getConfig: async function() {
        try {
            return await window.api.integrations.wecom.getConfig();
        } catch (error) {
            console.error('❌ 获取企业微信配置失败:', error);
            return null;
        }
    }
};

// ==================== 钉钉集成 ====================

/**
 * 钉钉集成模块
     */
const dingtalkIntegration = {
    /**
     * 发送消息
     * @param {Object} params - 参数
     * @returns {Promise}
     */
    sendMessage: async function(params) {
        try {
            const {
                toUser,     // 接收用户ID
                toParty,    // 接收部门ID
                msgType,    // 消息类型
                content,    // 消息内容
                title,      // 标题
                link        // 链接（可选）
            } = params;

            console.log('📤 发送钉钉消息...');

            const response = await window.api.integrations.dingtalk.sendMessage({
                toUser,
                toParty,
                msgType,
                content,
                title,
                link
            });

            console.log('✅ 钉钉消息已发送');
            return response;
        } catch (error) {
            console.error('❌ 发送钉钉消息失败:', error);
            return null;
        }
    },

    /**
     * 同步用户
     * @returns {Promise}
     */
    syncUsers: async function() {
        try {
            console.log('🔄 同步钉钉用户...');
            const response = await window.api.integrations.dingtalk.syncUsers();
            console.log('✅ 用户同步完成');
            return response;
        } catch (error) {
            console.error('❌ 用户同步失败:', error);
            return null;
        }
    },

    /**
     * 同步部门
     * @returns {Promise}
     */
    syncDepartments: async function() {
        try {
            console.log('🔄 同步钉钉部门...');
            const response = await window.api.integrations.dingtalk.syncDepartments();
            console.log('✅ 部门同步完成');
            return response;
        } catch (error) {
            console.error('❌ 部门同步失败:', error);
            return null;
        }
    },

    /**
     * 获取配置
     * @returns {Promise}
     */
    getConfig: async function() {
        try {
            return await window.api.integrations.dingtalk.getConfig();
        } catch (error) {
            console.error('❌ 获取钉钉配置失败:', error);
            return null;
        }
    }
};

// ==================== SMS短信集成 ====================

/**
 * SMS短信集成模块
 */
const smsIntegration = {
    /**
     * 发送短信
     * @param {Object} params - 参数
     * @returns {Promise}
     */
    send: async function(params) {
        try {
            const {
                phoneNumbers,  // 手机号数组
                message,       // 短信内容
                templateId,    // 模板ID（可选）
                variables      // 模板变量（可选）
            } = params;

            if (!phoneNumbers || !phoneNumbers.length) {
                throw new Error('手机号不能为空');
            }

            if (!message && !templateId) {
                throw new Error('消息内容或模板ID必须提供');
            }

            console.log(`📱 发送短信到 ${phoneNumbers.length} 个号码...`);

            const response = await window.api.integrations.sms.send({
                phoneNumbers,
                message,
                templateId,
                variables
            });

            console.log('✅ 短信已发送');
            return response;
        } catch (error) {
            console.error('❌ 发送短信失败:', error);
            return null;
        }
    },

    /**
     * 获取配置
     * @returns {Promise}
     */
    getConfig: async function() {
        try {
            return await window.api.integrations.sms.getConfig();
        } catch (error) {
            console.error('❌ 获取短信配置失败:', error);
            return null;
        }
    }
};

// ==================== 邮件集成 ====================

/**
 * 邮件集成模块
 */
const emailIntegration = {
    /**
     * 发送邮件
     * @param {Object} params - 参数
     * @returns {Promise}
     */
    send: async function(params) {
        try {
            const {
                to,         // 收件人数组
                cc,         // 抄送数组（可选）
                bcc,        // 密送数组（可选）
                subject,    // 主题
                content,    // 邮件内容（HTML或纯文本）
                isHtml,     // 是否HTML格式（默认true）
                attachments // 附件数组（可选）
            } = params;

            if (!to || !to.length) {
                throw new Error('收件人不能为空');
            }

            if (!subject || !content) {
                throw new Error('主题和内容不能为空');
            }

            console.log(`📧 发送邮件到 ${to.length} 个收件人...`);

            const response = await window.api.integrations.email.send({
                to,
                cc,
                bcc,
                subject,
                content,
                isHtml: isHtml !== false,
                attachments
            });

            console.log('✅ 邮件已发送');
            return response;
        } catch (error) {
            console.error('❌ 发送邮件失败:', error);
            return null;
        }
    },

    /**
     * 获取配置
     * @returns {Promise}
     */
    getConfig: async function() {
        try {
            return await window.api.integrations.email.getConfig();
        } catch (error) {
            console.error('❌ 获取邮件配置失败:', error);
            return null;
        }
    }
};

// ==================== 支付集成 ====================

/**
 * 支付集成模块
 */
const paymentIntegration = {
    /**
     * 发起支付
     * @param {Object} params - 参数
     * @returns {Promise}
     */
    initiate: async function(params) {
        try {
            const {
                orderId,        // 订单ID
                amount,         // 金额（单位：分）
                currency,       // 货币代码（默认CNY）
                paymentMethod,  // 支付方式（alipay, wechat, unionpay等）
                description,    // 商品描述
                notifyUrl,      // 异步通知URL
                returnUrl       // 同步回调URL
            } = params;

            if (!orderId || !amount) {
                throw new Error('订单ID和金额不能为空');
            }

            console.log(`💳 发起支付：订单 ${orderId}，金额 ${amount}`);

            const response = await window.api.integrations.payment.initiate({
                orderId,
                amount,
                currency: currency || 'CNY',
                paymentMethod: paymentMethod || 'wechat',
                description,
                notifyUrl,
                returnUrl
            });

            console.log('✅ 支付已发起');
            return response;
        } catch (error) {
            console.error('❌ 发起支付失败:', error);
            return null;
        }
    },

    /**
     * 验证支付回调
     * @param {Object} params - 参数
     * @returns {Promise}
     */
    verify: async function(params) {
        try {
            const {
                orderId,    // 订单ID
                transactionId, // 交易ID
                amount,     // 金额
                signature   // 签名
            } = params;

            console.log(`🔐 验证支付回调：订单 ${orderId}`);

            const response = await window.api.integrations.payment.verify({
                orderId,
                transactionId,
                amount,
                signature
            });

            if (response.verified) {
                console.log('✅ 支付验证通过');
            } else {
                console.warn('⚠️ 支付验证失败');
            }

            return response;
        } catch (error) {
            console.error('❌ 验证支付失败:', error);
            return null;
        }
    },

    /**
     * 获取配置
     * @returns {Promise}
     */
    getConfig: async function() {
        try {
            return await window.api.integrations.payment.getConfig();
        } catch (error) {
            console.error('❌ 获取支付配置失败:', error);
            return null;
        }
    }
};

// ==================== 第三方服务管理器 ====================

/**
 * 第三方服务管理器
 */
class ThirdPartyManager {
    constructor() {
        this.services = {
            wecom: wecomIntegration,
            dingtalk: dingtalkIntegration,
            sms: smsIntegration,
            email: emailIntegration,
            payment: paymentIntegration
        };
        this.cache = new Map();
    }

    /**
     * 获取服务
     * @param {string} serviceName - 服务名称
     * @returns {Object}
     */
    getService(serviceName) {
        const service = this.services[serviceName];
        if (!service) {
            console.warn(`⚠️ 未知的服务: ${serviceName}`);
            return null;
        }
        return service;
    }

    /**
     * 发送通知（自动选择渠道）
     * @param {Object} params - 参数
     * @returns {Promise}
     */
    async sendNotification(params) {
        try {
            const {
                channels,   // 通知渠道数组 (wecom, dingtalk, sms, email)
                content,    // 通知内容
                recipients, // 收件人
                title       // 标题（可选）
            } = params;

            if (!channels || !channels.length) {
                throw new Error('通知渠道不能为空');
            }

            const results = {};

            for (const channel of channels) {
                try {
                    const service = this.getService(channel);
                    if (!service) {
                        continue;
                    }

                    console.log(`📢 通过 ${channel} 发送通知...`);

                    switch (channel) {
                        case 'wecom':
                            results[channel] = await service.sendMessage({
                                toUser: recipients,
                                msgType: 'text',
                                content
                            });
                            break;
                        case 'dingtalk':
                            results[channel] = await service.sendMessage({
                                toUser: recipients,
                                msgType: 'text',
                                content,
                                title
                            });
                            break;
                        case 'sms':
                            results[channel] = await service.send({
                                phoneNumbers: recipients,
                                message: content
                            });
                            break;
                        case 'email':
                            results[channel] = await service.send({
                                to: recipients,
                                subject: title || '新通知',
                                content: content,
                                isHtml: true
                            });
                            break;
                    }
                } catch (error) {
                    console.error(`❌ ${channel} 通知失败:`, error);
                    results[channel] = null;
                }
            }

            return results;
        } catch (error) {
            console.error('❌ 发送通知失败:', error);
            return null;
        }
    }

    /**
     * 批量发送消息
     * @param {string} service - 服务名称
     * @param {Array} messages - 消息数组
     * @returns {Promise}
     */
    async batchSend(service, messages) {
        try {
            const svc = this.getService(service);
            if (!svc) {
                throw new Error(`未知服务: ${service}`);
            }

            console.log(`📦 批量发送 ${messages.length} 条消息到 ${service}...`);

            const results = [];
            for (const message of messages) {
                try {
                    const result = await svc.send(message);
                    results.push(result);
                } catch (error) {
                    console.error('❌ 单条消息发送失败:', error);
                    results.push(null);
                }
            }

            return results;
        } catch (error) {
            console.error('❌ 批量发送失败:', error);
            return null;
        }
    }
}

// 全局第三方服务管理器实例
const thirdPartyManager = new ThirdPartyManager();

// ==================== 全局导出 ====================

window.thirdPartyIntegration = {
    // 各服务模块
    wecom: wecomIntegration,
    dingtalk: dingtalkIntegration,
    sms: smsIntegration,
    email: emailIntegration,
    payment: paymentIntegration,

    // 管理器
    manager: thirdPartyManager,

    // 快速方法
    getService: (name) => thirdPartyManager.getService(name),
    sendNotification: (params) => thirdPartyManager.sendNotification(params),
    batchSend: (service, messages) => thirdPartyManager.batchSend(service, messages),

    // 快捷方法
    sendWeCom: (params) => wecomIntegration.sendMessage(params),
    sendDingtalk: (params) => dingtalkIntegration.sendMessage(params),
    sendSMS: (params) => smsIntegration.send(params),
    sendEmail: (params) => emailIntegration.send(params),
    initiatePayment: (params) => paymentIntegration.initiate(params),
    verifyPayment: (params) => paymentIntegration.verify(params)
};

console.log('🔗 第三方服务集成已加载');
