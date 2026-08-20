import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, Clock, DollarSign, Phone, Target } from 'lucide-react';
import { leadService, type Lead } from '../../services/leadService';
import followUpService, { type FollowUpRecord } from '../../services/followUpService';

const AILeadDetail: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const [lead, setLead] = useState<Lead | null>(null);
    const [records, setRecords] = useState<FollowUpRecord[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            if (!id) return;
            try {
                const leadId = Number(id);
                const [leadData, followUps] = await Promise.all([
                    leadService.getLeadDetail(leadId),
                    followUpService.listByLead(leadId)
                ]);
                setLead(leadData);
                setRecords(followUps || []);
            } catch (error) {
                console.error('加载线索失败', error);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [id]);

    if (loading) return <div className="p-8 text-center text-gray-500">加载中...</div>;
    if (!lead) return <div className="p-8 text-center text-gray-500">线索不存在或无权访问</div>;

    return (
        <div className="bg-gray-50 min-h-screen pb-20">
            <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
                <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-3">
                    <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-lg text-gray-600"><ChevronLeft className="w-5 h-5" /></button>
                    <h1 className="text-lg font-bold text-gray-900">线索详情</h1>
                </div>
            </div>
            <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 mb-2">{lead.title}</h2>
                            <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-xs font-medium">{lead.source || '未设置来源'}</span>
                        </div>
                        <div className="text-right"><div className="text-2xl font-bold text-blue-600">{lead.successProbability ?? 0}%</div><div className="text-xs text-gray-500">成交概率</div></div>
                    </div>
                    <div className="grid grid-cols-2 gap-6 mb-6">
                        <div className="flex items-center gap-3 text-sm text-gray-700"><Phone className="w-4 h-4 text-gray-400" />{lead.description || '暂无联系方式'}</div>
                        <div className="flex items-center gap-3 text-sm text-gray-700"><Clock className="w-4 h-4 text-gray-400" />{lead.followUpDate || '暂无下次跟进时间'}</div>
                        <div className="flex items-center gap-3 text-sm text-gray-700"><Target className="w-4 h-4 text-gray-400" />阶段：{lead.stage || lead.status}</div>
                        <div className="flex items-center gap-3 text-sm text-gray-700"><DollarSign className="w-4 h-4 text-gray-400" />预计金额：{lead.estimatedValue ?? '暂无'}</div>
                    </div>
                    <p className="pt-6 border-t border-gray-100 text-sm text-gray-600">意向产品：{lead.interestedProducts?.join('、') || '暂无'}</p>
                </div>
                <div className="bg-indigo-50 rounded-xl p-5 border border-indigo-100">
                    <h3 className="font-bold text-indigo-900 mb-3 flex items-center gap-2"><Target className="w-5 h-5" />AI智能分析</h3>
                    <p className="text-sm text-indigo-800 leading-relaxed">当前页面仅展示后端已返回的线索数据，暂无可用的 AI 分析结果。</p>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <h3 className="font-bold text-gray-900 mb-4">跟进记录</h3>
                    {records.length === 0 ? <p className="text-sm text-gray-400">暂无跟进记录</p> : <div className="space-y-5">{records.map(record => <div key={record.id} className="border-l-2 border-blue-200 pl-4"><div className="flex justify-between"><span className="font-bold text-gray-800 text-sm">{record.title}</span><span className="text-xs text-gray-400">{record.createdAt || ''}</span></div><p className="text-sm text-gray-600 mt-1">{record.content}</p></div>)}</div>}
                </div>
            </div>
        </div>
    );
};

export default AILeadDetail;
