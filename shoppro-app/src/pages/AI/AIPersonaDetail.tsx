import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, User, MessageCircle, Phone, Tag, ShoppingBag, Activity } from 'lucide-react';

const AIPersonaDetail: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="bg-gray-50 min-h-screen pb-20">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600">
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <h1 className="text-lg font-bold text-gray-900">客户画像详情</h1>
                    </div>
                    <button className="p-2 text-gray-400 hover:text-gray-600">
                        <MoreHorizontalIcon className="w-6 h-6" />
                    </button>
                </div>
            </div>

            <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
                {/* Profile Header */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 flex flex-col items-center">
                    <div className="w-20 h-20 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center font-bold text-3xl mb-4">
                        王
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-1">王总</h2>
                    <p className="text-gray-500 text-sm mb-6">VIP 客户 · 活跃度高</p>

                    <div className="flex gap-3 w-full max-w-sm">
                        <button className="flex-1 flex items-center justify-center gap-2 bg-green-500 text-white py-2.5 rounded-xl font-bold shadow-sm hover:bg-green-600 transition-colors">
                            <MessageCircle className="w-5 h-5" /> 微信
                        </button>
                        <button className="flex-1 flex items-center justify-center gap-2 bg-blue-500 text-white py-2.5 rounded-xl font-bold shadow-sm hover:bg-blue-600 transition-colors">
                            <Phone className="w-5 h-5" /> 电话
                        </button>
                    </div>
                </div>

                {/* Detailed Info Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
                        <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                            <User className="w-4 h-4 text-blue-500" /> 基础信息
                        </h3>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between"><span className="text-gray-500">家庭</span> <span className="text-gray-900">已婚，二孩</span></div>
                            <div className="flex justify-between"><span className="text-gray-500">职业</span> <span className="text-gray-900">私营企业主</span></div>
                            <div className="flex justify-between"><span className="text-gray-500">年龄</span> <span className="text-gray-900">42岁</span></div>
                        </div>
                    </div>
                    <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
                        <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                            <ShoppingBag className="w-4 h-4 text-orange-500" /> 消费偏好
                        </h3>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between"><span className="text-gray-500">预算</span> <span className="text-gray-900">50-80万</span></div>
                            <div className="flex justify-between"><span className="text-gray-500">关注点</span> <span className="text-gray-900">品牌、服务</span></div>
                            <div className="flex justify-between"><span className="text-gray-500">决策</span> <span className="text-gray-900">快速，果断</span></div>
                        </div>
                    </div>
                </div>

                {/* Tags */}
                <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
                    <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <Tag className="w-4 h-4 text-purple-500" /> 客户标签
                    </h3>
                    <div className="flex flex-wrap gap-2">
                        {['商务接待', '配置要求高', '决策快', '高净值', '注重隐私'].map(tag => (
                            <span key={tag} className="px-3 py-1.5 bg-gray-50 text-gray-700 rounded-lg text-sm font-medium border border-gray-100">
                                {tag}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Activity */}
                <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
                    <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <Activity className="w-4 h-4 text-indigo-500" /> 近期动态
                    </h3>
                    <div className="space-y-4">
                        <div className="flex gap-4 items-start">
                            <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 flex-shrink-0"></div>
                            <div>
                                <p className="text-sm text-gray-900 leading-snug">浏览了“2025款 尊享行政版”详细配置页，停留时间超过15分钟。</p>
                                <span className="text-xs text-gray-400 mt-1 block">2小时前</span>
                            </div>
                        </div>
                        <div className="flex gap-4 items-start">
                            <div className="w-2 h-2 rounded-full bg-gray-300 mt-2 flex-shrink-0"></div>
                            <div>
                                <p className="text-sm text-gray-900 leading-snug">通过微信分享给“张助理”对比链接。</p>
                                <span className="text-xs text-gray-400 mt-1 block">昨天 20:30</span>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

const MoreHorizontalIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="1" /><circle cx="19" cy="12" r="1" /><circle cx="5" cy="12" r="1" /></svg>
)

export default AIPersonaDetail;
