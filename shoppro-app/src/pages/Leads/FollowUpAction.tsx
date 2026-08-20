import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ChevronLeft, Plus, User, Bot, Phone, MessageSquare, Car, FileText } from 'lucide-react';
import followUpService, { type FollowUpRecord } from '../../services/followUpService';
import type { Lead } from '../../services/leadService';

const FollowUpAction: React.FC = () => {
    const navigate = useNavigate();
    const [showModal, setShowModal] = useState(false);

    const { state } = useLocation();
    const lead = state?.lead as Lead | undefined;
    const [history, setHistory] = useState<FollowUpRecord[]>([]);
    const [error, setError] = useState<string | null>(null);

    // Form state
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [method, setMethod] = useState('call');

    useEffect(() => {
        if (!lead?.id) return;
        followUpService.listByLead(lead.id)
            .then(setHistory)
            .catch((err: Error) => setError(err.message || '跟进记录加载失败'));
    }, [lead?.id]);

    const handleSave = async () => {
        if (!title || !content) {
            alert('请填写完整的记录信息');
            return;
        }
        if (!lead?.id) {
            alert('缺少线索信息，请从线索详情进入跟进');
            return;
        }
        try {
            const created = await followUpService.create({ title, content, type: method, leadId: lead.id });
            setHistory(prev => [created, ...prev]);
            setShowModal(false);
            setTitle('');
            setContent('');
        } catch (err) {
            alert(err instanceof Error ? err.message : '记录保存失败');
        }
    };

    return (
        <div className="bg-gray-50 min-h-screen font-sans">
            {/* Header */}
            <div className="bg-white border-b border-gray-100 sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                            <ChevronLeft className="w-5 h-5 text-gray-600" />
                        </button>
                        <h1 className="text-lg font-semibold text-gray-900">立即跟进</h1>
                    </div>
                    <button onClick={() => setShowModal(true)} className="px-3 py-1.5 bg-[#4640DE] text-white rounded-lg text-sm hover:bg-[#3730A3] transition-colors flex items-center">
                        <Plus className="w-4 h-4 mr-1" /> 添加记录
                    </button>
                </div>
            </div>

            <main className="max-w-7xl mx-auto px-4 py-4 space-y-4">
                {/* Customer Info Card */}
                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                    <div className="flex items-start space-x-3 mb-4">
                        <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center text-xl">
                            <User className="w-6 h-6 text-gray-400" />
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                            <h2 className="text-lg font-semibold text-gray-900">{lead?.title || '未选择线索'}</h2>
                                <span className="px-2 py-1 bg-red-100 text-red-600 text-xs rounded-full">{lead?.priority || '未设置优先级'}</span>
                            </div>
                            <div className="grid grid-cols-2 gap-3 text-sm">
                                <div><span className="text-gray-500">来源:</span> <span className="font-medium text-gray-900 ml-1">{lead?.source || '未填写'}</span></div>
                                <div><span className="text-gray-500">阶段:</span> <span className="font-medium text-gray-900 ml-1">{lead?.stage || lead?.status || '未填写'}</span></div>
                                <div><span className="text-gray-500">预估金额:</span> <span className="font-medium text-gray-900 ml-1">{lead?.estimatedValue ?? '未填写'}</span></div>
                                <div><span className="text-gray-500">成交概率:</span> <span className="font-medium text-[#4640DE] ml-1">{lead?.successProbability ?? '未填写'}{lead?.successProbability === undefined ? '' : '%'}</span></div>
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {lead?.interestedProducts?.map(product => <span key={product} className="px-2 py-1 bg-blue-50 text-blue-600 text-xs rounded-full">{product}</span>)}
                    </div>
                </div>

                {/* AI Advice */}
                <div className="bg-[#4640DE] rounded-xl p-4 text-white shadow-sm">
                    <div className="flex items-center mb-3">
                        <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center mr-3">
                            <Bot className="w-5 h-5 text-white" />
                        </div>
                        <h3 className="font-semibold">AI跟进建议</h3>
                    </div>
                    <div className="space-y-2 text-sm opacity-90 leading-relaxed">
                        <p>• 当前线索：{lead?.title || '未选择线索'}</p>
                        <p>• 请根据线索描述和最近一次跟进结果制定下一步动作</p>
                        <p>• 完成沟通后，务必保存真实跟进记录</p>
                    </div>
                </div>

                {/* Quick Actions */}
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">快速操作</h3>
                    <div className="grid grid-cols-2 gap-3">
                        <button disabled className="bg-gray-50 rounded-xl p-4 border border-gray-100 text-left opacity-60 cursor-not-allowed">
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center text-green-600 group-hover:bg-green-200 transition-colors">
                                    <Phone className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="font-medium text-gray-500">拨打电话</p>
                                    <p className="text-xs text-gray-400">客户电话未配置</p>
                                </div>
                            </div>
                        </button>
                        <button disabled className="bg-gray-50 rounded-xl p-4 border border-gray-100 text-left opacity-60 cursor-not-allowed">
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 group-hover:bg-blue-200 transition-colors">
                                    <MessageSquare className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="font-medium text-gray-500">发送消息</p>
                                    <p className="text-xs text-gray-400">消息渠道未配置</p>
                                </div>
                            </div>
                        </button>
                        <button disabled className="bg-gray-50 rounded-xl p-4 border border-gray-100 text-left opacity-60 cursor-not-allowed">
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center text-yellow-600 group-hover:bg-yellow-200 transition-colors">
                                    <Car className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="font-medium text-gray-500">安排试驾</p>
                                    <p className="text-xs text-gray-400">预约功能未配置</p>
                                </div>
                            </div>
                        </button>
                        <button onClick={() => navigate('/knowledge')} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition-all text-left group">
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center text-purple-600 group-hover:bg-purple-200 transition-colors">
                                    <FileText className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="font-medium text-gray-900">查看车型</p>
                                    <p className="text-xs text-gray-500">产品资料库</p>
                                </div>
                            </div>
                        </button>
                    </div>
                </div>

                {/* History */}
                <div className="pb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">跟进历史</h3>
                    {error && <div className="text-sm text-red-600">{error}</div>}
                    <div className="space-y-3">
                        {history.map(record => <div key={record.id} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                            <div className="flex items-start justify-between mb-2">
                                <div className="flex items-center space-x-2">
                                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                    <span className="font-medium text-gray-900">{record.title}</span>
                                    <span className="px-2 py-0.5 bg-green-50 text-green-600 text-xs rounded-full">{record.type}</span>
                                </div>
                                <span className="text-xs text-gray-500">{record.createdAt || ''}</span>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">{record.content}</p>
                            <div className="text-xs text-gray-400">结果: {record.result || '未填写'}</div>
                        </div>)}
                        {history.length === 0 && !error && <div className="text-sm text-gray-500">暂无跟进记录</div>}
                    </div>
                </div>
            </main>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50">
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px]" onClick={() => setShowModal(false)}></div>
                    <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl animate-slide-up-fast">
                        <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                            <h3 className="text-lg font-semibold text-gray-900">添加跟进记录</h3>
                            <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                                <span className="text-gray-500 text-xl">×</span>
                            </button>
                        </div>
                        <div className="p-4 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">记录标题</label>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="请输入记录标题"
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#4640DE] focus:ring-1 focus:ring-[#4640DE]"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">记录内容</label>
                                <textarea
                                    rows={4}
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                    placeholder="请输入详细的跟进内容..."
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#4640DE] focus:ring-1 focus:ring-[#4640DE] resize-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-3">跟进方式</label>
                                <div className="grid grid-cols-3 gap-3">
                                    {[
                                        { v: 'call', l: '电话' }, { v: 'wechat', l: '微信' }, { v: 'email', l: '邮件' },
                                        { v: 'sms', l: '短信' }, { v: 'visit', l: '拜访' }, { v: 'other', l: '其它' }
                                    ].map(opt => (
                                        <button
                                            key={opt.v}
                                            onClick={() => setMethod(opt.v)}
                                            className={`py-2 text-sm rounded-lg border transition-all ${method === opt.v ? 'border-[#4640DE] bg-[#4640DE]/5 text-[#4640DE] font-medium' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                                        >
                                            {opt.l}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="flex space-x-3 pt-2 pb-4">
                                <button onClick={() => setShowModal(false)} className="flex-1 py-3 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium">
                                    取消
                                </button>
                                <button onClick={handleSave} className="flex-1 py-3 bg-[#4640DE] text-white rounded-lg hover:bg-[#3730A3] transition-colors font-medium shadow-sm">
                                    保存记录
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FollowUpAction;
