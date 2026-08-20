import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Maintenance: React.FC = () => {
    const navigate = useNavigate();
    const [showContactModal, setShowContactModal] = useState<'email' | 'phone' | null>(null);
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);

        return () => {
            clearInterval(timer);
        };
    }, []);
    return (
        <div className="bg-gradient-to-br from-blue-50 via-white to-purple-50 min-h-screen flex items-center justify-center px-4 font-sans">
            <div className="max-w-lg w-full text-center">
                {/* Icon */}
                <div className="mb-8 relative inline-block">
                    <div className="w-32 h-32 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center animate-pulse">
                        <div className="animate-spin-slow">
                            <span className="text-5xl">⚙️</span>
                        </div>
                    </div>
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center animate-bounce">
                        <span className="text-white text-sm">!</span>
                    </div>
                </div>

                <h1 className="text-3xl font-bold text-gray-900 mb-4">系统维护中</h1>
                <p className="text-lg text-gray-600 mb-6">我们正在进行系统升级，为您带来更好的体验</p>

                {/* Progress Card */}
                <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 text-left">
                    <div className="mb-6">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-medium text-gray-700">维护进度</span>
                            <span className="text-sm text-gray-500 font-semibold">未提供</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                            <div className="bg-gray-300 h-2 rounded-full" style={{ width: '0%' }}></div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center space-x-3">
                                <span className="text-blue-500">🗄️</span>
                                <span className="text-sm text-gray-700">数据库优化</span>
                            </div>
                            <span className="text-xs text-green-500 font-medium">已完成</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center space-x-3">
                                <span className="text-yellow-500">🖥️</span>
                                <span className="text-sm text-gray-700">服务器升级</span>
                            </div>
                            <span className="text-xs text-yellow-500 font-medium">进行中</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center space-x-3">
                                <span className="text-gray-400">🛡️</span>
                                <span className="text-sm text-gray-700">安全更新</span>
                            </div>
                            <span className="text-xs text-gray-400 font-medium">等待中</span>
                        </div>
                    </div>
                </div>

                {/* Estimated Time */}
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">预计完成时间</h3>
                    <p className="text-sm text-gray-600">预计完成时间尚未由运维系统配置。</p>
                </div>

                {/* Support Buttons */}
                <div className="bg-white rounded-xl p-6 mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">需要帮助？</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <button onClick={() => setShowContactModal('email')} className="flex flex-col items-center p-4 rounded-lg border border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all">
                            <span className="text-2xl mb-2">✉️</span>
                            <span className="text-sm font-medium text-gray-700">邮件支持</span>
                            <span className="text-xs text-gray-500">联系方式未配置</span>
                        </button>
                        <button onClick={() => setShowContactModal('phone')} className="flex flex-col items-center p-4 rounded-lg border border-gray-200 hover:border-purple-500 hover:bg-purple-50 transition-all">
                            <span className="text-2xl mb-2">📞</span>
                            <span className="text-sm font-medium text-gray-700">电话支持</span>
                            <span className="text-xs text-gray-500">联系方式未配置</span>
                        </button>
                    </div>
                </div>

                <div className="space-y-3">
                    <button onClick={() => window.location.reload()} className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-xl font-medium hover:shadow-lg transition-all">
                        刷新状态
                    </button>
                    <button disabled className="w-full bg-white border border-gray-200 text-gray-400 py-3 px-6 rounded-xl font-medium cursor-not-allowed">
                        完成通知未配置
                    </button>
                </div>

                <div className="mt-8 text-center">
                    <p className="text-xs text-gray-500 mb-2">感谢您的耐心等待，我们会尽快完成维护</p>
                    <div className="text-xs text-gray-400">
                        维护标识未配置 • {currentTime.toLocaleTimeString()}
                    </div>
                </div>
            </div>

            {/* Modal */}
            {showContactModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-in fade-in">
                    <div className="bg-white rounded-2xl p-6 max-w-sm w-full relative">
                        <button onClick={() => setShowContactModal(null)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">×</button>
                        <div className="text-center mb-4">
                            <div className="w-16 h-16 mx-auto bg-blue-100 rounded-full flex items-center justify-center mb-3 text-2xl">
                                {showContactModal === 'email' ? '✉️' : '📞'}
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900">
                                {showContactModal === 'email' ? '邮件支持' : '电话支持'}
                            </h3>
                        </div>
                        <div className="space-y-3 mb-6 text-center">
                            <p className="text-sm text-gray-600 mb-2">
                                当前环境尚未配置客服渠道
                            </p>
                            <p className={`font-mono px-3 py-2 rounded-lg ${showContactModal === 'email' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'}`}>
                                暂无可用联系方式
                            </p>
                            <p className="text-xs text-gray-500">
                                请联系部署方配置支持邮箱或电话
                            </p>
                        </div>
                        <button onClick={() => setShowContactModal(null)} className="w-full bg-gray-100 text-gray-700 py-3 px-6 rounded-xl font-medium hover:bg-gray-200 transition-colors">
                            关闭
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Maintenance;
