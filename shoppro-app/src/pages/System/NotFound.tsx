import React from 'react';
import { useNavigate } from 'react-router-dom';

const NotFound: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center px-4">
            <div className="max-w-md w-full text-center">
                {/* 404 Icon with Animation */}
                <div className="mb-8 relative">
                    <div className="animate-bounce-slow inline-block">
                        <div className="w-32 h-32 mx-auto bg-gradient-to-br from-[#4640DE]/10 to-[#8B5CF6]/10 rounded-full flex items-center justify-center mb-4">
                            <span className="text-6xl text-[#4640DE]/60">🔍</span>
                        </div>
                    </div>
                    <div className="text-8xl font-bold bg-gradient-to-r from-[#4640DE] to-[#8B5CF6] text-transparent bg-clip-text mb-2 animate-pulse-slow">
                        404
                    </div>
                    <div className="text-xl text-gray-600 mb-2 font-medium">页面未找到</div>
                    <div className="text-sm text-gray-500">抱歉，您访问的页面不存在或已被移动</div>
                </div>

                {/* Suggestions */}
                <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 transform hover:scale-[1.02] transition-transform duration-300">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 text-left">您可以尝试：</h3>
                    <div className="space-y-3 text-left">
                        {[
                            '检查网址是否输入正确',
                            '返回上一页重新尝试',
                            '访问首页重新开始',
                            '联系技术支持获取帮助'
                        ].map((text, i) => (
                            <div key={i} className="flex items-center space-x-3 text-gray-600">
                                <span className="text-[#10B981]">✓</span>
                                <span className="text-sm">{text}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Actions */}
                <div className="space-y-3">
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="w-full bg-gradient-to-r from-[#4640DE] to-[#8B5CF6] text-white py-3 px-6 rounded-xl font-medium hover:shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center justify-center"
                    >
                        <span>🏠 返回首页</span>
                    </button>

                    <div className="grid grid-cols-2 gap-3">
                        <button
                            onClick={() => navigate(-1)}
                            className="bg-white text-gray-700 py-2.5 px-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors flex items-center justify-center space-x-2"
                        >
                            <span>⬅️ 返回上页</span>
                        </button>
                        <button
                            onClick={() => navigate('/knowledge')}
                            className="bg-white text-gray-700 py-2.5 px-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors flex items-center justify-center space-x-2"
                        >
                            <span>❓ 获取帮助</span>
                        </button>
                    </div>
                </div>

                {/* Quick Links */}
                <div className="mt-8 bg-white rounded-xl shadow-sm p-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-3 text-left">常用功能</h4>
                    <div className="grid grid-cols-3 gap-3">
                        {[
                            { icon: '📊', label: '数据看板', path: '/dashboard', color: 'text-[#4640DE]' },
                            { icon: '👥', label: '客户管理', path: '/customers', color: 'text-[#8B5CF6]' },
                            { icon: '🧠', label: 'AI大脑', path: '/ai/brain', color: 'text-[#10B981]' }
                        ].map((item, i) => (
                            <button
                                key={i}
                                onClick={() => navigate(item.path)}
                                className="p-3 rounded-lg hover:bg-gray-50 transition-colors group flex flex-col items-center"
                            >
                                <span className={`${item.color} text-2xl mb-1 group-hover:scale-110 transition-transform`}>{item.icon}</span>
                                <div className="text-xs text-gray-600">{item.label}</div>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NotFound;
