import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    Smile,
    CheckSquare,
    Sparkles,
    AlertCircle,
    TrendingUp,
    FileText
} from 'lucide-react';

const AIConversationDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [conv, setConv] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadDetail();
    }, [id]);

    const loadDetail = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('auth_token') || localStorage.getItem('token') || '';
            const res = await fetch(`/api/ai/conversations/${id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const json = await res.json();
            if (json.data) setConv(json.data);
        } catch (e) {
            console.error('Failed to load conversation detail', e);
        } finally {
            setLoading(false);
        }
    };

    if (loading || !conv) {
        return <div className="p-8 text-center text-gray-400">加载会话详情中...</div>;
    }

    const keyTopics: string[] = typeof conv.keyTopics === 'string' ? JSON.parse(conv.keyTopics || '[]') : (conv.keyTopics || []);
    const actionItems: string[] = typeof conv.actionItems === 'string' ? JSON.parse(conv.actionItems || '[]') : (conv.actionItems || []);
    const competitors: string[] = typeof conv.competitorMentions === 'string' ? JSON.parse(conv.competitorMentions || '[]') : (conv.competitorMentions || []);

    return (
        <div className="bg-gray-50 min-h-screen pb-24">
            {/* Header */}
            <div className="bg-white px-4 py-4 border-b border-gray-200 sticky top-0 z-30 flex items-center justify-between">
                <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-gray-100 text-gray-600">
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <h1 className="text-base font-bold text-gray-900">会话智能深度分析</h1>
                <div className="w-8"></div>
            </div>

            <div className="p-4 space-y-4">
                {/* 概览卡片 */}
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-200 space-y-3">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="font-bold text-base text-gray-900">{conv.customerName}</h2>
                            <p className="text-xs text-gray-400 mt-0.5">沟通销售: {conv.salesName} · 通话时长: {Math.floor(conv.durationSeconds / 60)} 分钟</p>
                        </div>
                        <span className="bg-emerald-50 text-emerald-700 text-xs px-3 py-1 rounded-full font-bold border border-emerald-200 flex items-center gap-1">
                            <Smile className="w-3.5 h-3.5 text-emerald-600" />
                            情绪指数 {(conv.sentimentScore * 100).toFixed(0)}分
                        </span>
                    </div>

                    <div className="bg-emerald-50/50 rounded-xl p-3.5 border border-emerald-100/80 text-xs text-gray-800 leading-relaxed">
                        <div className="font-bold text-emerald-800 mb-1 flex items-center gap-1">
                            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                            AI 智能纪要与成单意向
                        </div>
                        {conv.summary}
                    </div>
                </div>

                {/* 关键议题 */}
                <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200 space-y-2.5">
                    <h3 className="font-bold text-xs text-gray-800 uppercase tracking-wider flex items-center gap-1.5">
                        <TrendingUp className="w-4 h-4 text-primary" />
                        本次沟通核心议题 (Key Topics)
                    </h3>
                    <div className="flex flex-wrap gap-2">
                        {keyTopics.map((topic, i) => (
                            <span key={i} className="bg-blue-50 text-blue-700 text-xs px-3 py-1 rounded-lg font-medium border border-blue-100">
                                #{topic}
                            </span>
                        ))}
                    </div>
                </div>

                {/* 承诺事项与待办 */}
                <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200 space-y-2.5">
                    <h3 className="font-bold text-xs text-gray-800 uppercase tracking-wider flex items-center gap-1.5">
                        <CheckSquare className="w-4 h-4 text-emerald-600" />
                        AI 自动提取承诺事项 (Action Items)
                    </h3>
                    <div className="space-y-2">
                        {actionItems.map((item, i) => (
                            <div key={i} className="flex items-start gap-2 text-xs text-gray-700 p-2.5 rounded-xl bg-gray-50 border border-gray-100">
                                <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-[10px] font-bold mt-0.5">
                                    {i + 1}
                                </span>
                                <span className="flex-1 leading-relaxed">{item}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 竞品提及检测 */}
                {competitors.length > 0 && (
                    <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200 space-y-2">
                        <h3 className="font-bold text-xs text-gray-800 flex items-center gap-1.5">
                            <AlertCircle className="w-4 h-4 text-purple-600" />
                            竞品情报提及检测 (Competitors)
                        </h3>
                        <div className="flex gap-2">
                            {competitors.map((comp, i) => (
                                <span key={i} className="bg-purple-50 text-purple-700 text-xs px-2.5 py-1 rounded-lg font-semibold border border-purple-100">
                                    {comp}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* 完整录音转录文本 */}
                <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200 space-y-2">
                    <h3 className="font-bold text-xs text-gray-800 flex items-center gap-1.5">
                        <FileText className="w-4 h-4 text-gray-500" />
                        全量逐字转录文本 (Transcript)
                    </h3>
                    <div className="bg-slate-50 rounded-xl p-3.5 text-xs text-gray-600 leading-relaxed font-mono whitespace-pre-wrap border border-slate-100">
                        {conv.transcript || '暂无完整转录文本'}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AIConversationDetail;
