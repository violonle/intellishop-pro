import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, Check, AlertCircle } from 'lucide-react';
import { leadService } from '../../services/leadService';

const LeadConversion: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [submitting, setSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        product: '',
        type: 'enterprise', // enterprise or personal
        company: '',
        notes: ''
    });

    useEffect(() => {
        if (id) {
            loadLeadInfo(Number(id));
        }
    }, [id]);

    const loadLeadInfo = async (leadId: number) => {
        try {
            const data = await leadService.getLeadDetail(leadId);
            setFormData({
                name: data.title || '',
                phone: '',
                product: data.interestedProducts?.[0] || '',
                type: 'enterprise',
                company: data.title || '',
                notes: data.description || ''
            });
        } catch (error) {
            console.error('Failed to load lead detail', error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            if (!id) throw new Error('缺少线索ID');
            await leadService.convertToCustomer(Number(id), {
                name: formData.name,
                phone: formData.phone || undefined,
                company: formData.company || undefined,
                notes: formData.notes || undefined
            });

            alert('线索已成功转化为正式客户！');
            navigate('/customers');
        } catch (error) {
            console.error('Conversion failed', error);
            alert(error instanceof Error ? error.message : '转化失败，请稍后重试');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-20 font-sans">
            {/* Header */}
            <div className="bg-white px-4 py-4 border-b border-gray-100 shadow-xs sticky top-0 z-10">
                <div className="flex items-center space-x-3">
                    <button onClick={() => navigate(-1)} className="p-2 text-gray-600 hover:text-blue-600 transition-colors rounded-xl">
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <h1 className="text-base font-bold text-gray-900">线索转客户档案</h1>
                </div>
            </div>

            <div className="max-w-2xl mx-auto px-4 py-6">
                <div className="bg-blue-50/80 border border-blue-100 rounded-2xl p-4 mb-6 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div className="text-xs text-blue-900 leading-relaxed">
                        <p className="font-bold mb-1">即将把线索 (ID: {id}) 转为正式客户</p>
                        <p>转化后，该线索将自动标记为已成单并在【客户中心】创建 360 企业画像。请确认并补全以下信息。</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Basic Info Card */}
                    <div className="bg-white rounded-2xl shadow-xs border border-gray-100 overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-50 bg-gray-50/50">
                            <h3 className="font-bold text-xs text-gray-900">客户核心档案</h3>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-1.5">客户名称 / 负责人</label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-4 py-2.5 bg-gray-50 border border-slate-200/80 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all font-medium text-xs text-gray-900"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-1.5">联系电话</label>
                                    <input
                                        type="text"
                                        value={formData.phone}
                                        onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                        className="w-full px-4 py-2.5 bg-gray-50 border border-slate-200/80 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all font-medium text-xs text-gray-900"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1.5">客户主体类型</label>
                                <div className="flex gap-4">
                                    <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-gray-700">
                                        <input
                                            type="radio"
                                            name="type"
                                            value="enterprise"
                                            checked={formData.type === 'enterprise'}
                                            onChange={e => setFormData({ ...formData, type: e.target.value })}
                                            className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                                        />
                                        企业客户 (B2B)
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-gray-700">
                                        <input
                                            type="radio"
                                            name="type"
                                            value="personal"
                                            checked={formData.type === 'personal'}
                                            onChange={e => setFormData({ ...formData, type: e.target.value })}
                                            className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                                        />
                                        个人客户
                                    </label>
                                </div>
                            </div>

                            {formData.type === 'enterprise' && (
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-1.5">企业全称</label>
                                    <input
                                        type="text"
                                        value={formData.company}
                                        onChange={e => setFormData({ ...formData, company: e.target.value })}
                                        placeholder="请输入工商注册全称"
                                        className="w-full px-4 py-2.5 bg-gray-50 border border-slate-200/80 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all font-medium text-xs text-gray-900"
                                    />
                                </div>
                            )}

                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1.5">成交意向产品</label>
                                <input
                                    type="text"
                                    value={formData.product}
                                    onChange={e => setFormData({ ...formData, product: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-gray-50 border border-slate-200/80 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all font-medium text-xs text-gray-900"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1.5">转化备注与跟进要点</label>
                                <textarea
                                    rows={3}
                                    value={formData.notes}
                                    onChange={e => setFormData({ ...formData, notes: e.target.value })}
                                    className="w-full p-3 bg-gray-50 border border-slate-200/80 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all font-normal text-xs text-gray-900 resize-none leading-relaxed"
                                />
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={submitting}
                        className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold text-xs hover:bg-blue-700 active:scale-95 transition-all text-center flex items-center justify-center gap-2 shadow-sm shadow-blue-500/20 disabled:opacity-70 disabled:active:scale-100"
                    >
                        {submitting ? '正在处理转化...' : <><Check className="w-4 h-4" /> 确认转化并建档</>}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default LeadConversion;
