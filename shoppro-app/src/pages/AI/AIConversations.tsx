import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Headphones,
    ArrowLeft,
    PhoneCall,
    Smile,
    Meh,
    Frown,
    Clock,
    ChevronRight,
    Mic
} from 'lucide-react';

interface Conversation {
    id: number;
    customerName: string;
    salesName: string;
    channel: string;
    durationSeconds: number;
    sentiment: string;
    sentimentScore: number;
    summary: string;
    createdAt: string;
}

const AIConversations: React.FC = () => {
    const navigate = useNavigate();
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [filterSentiment, setFilterSentiment] = useState('all');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadData();
    }, [filterSentiment]);

    const loadData = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('auth_token') || localStorage.getItem('token') || '';
            const res = await fetch(`/api/ai/conversations?sentiment=${filterSentiment}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const json = await res.json();
            if (json.data) setConversations(json.data);
        } catch (e) {
            console.error('Failed to load conversations', e);
        } finally {
            setLoading(false);
        }
    };

    const getSentimentBadge = (sentiment: string, score: number) => {
        switch (sentiment) {
            case 'positive':
                return (
                    <span className="flex items-center gap-1 bg-green-50 text-green-700 text-xs px-2.5 py-0.5 rounded-full font-bold border border-green-200">
                        <Smile className="w-3.5 h-3.5 text-green-600" />
                        积极 ({(score * 100).toFixed(0)}分)
                    </span>
                );
            case 'negative':
                return (
                    <span className="flex items-center gap-1 bg-red-50 text-red-700 text-xs px-2.5 py-0.5 rounded-full font-bold border border-red-200">
                        <Frown className="w-3.5 h-3.5 text-red-600" />
                        消极 ({(score * 100).toFixed(0)}分)
                    </span>
                );
            default:
                return (
                    <span className="flex items-center gap-1 bg-amber-50 text-amber-700 text-xs px-2.5 py-0.5 rounded-full font-bold border border-amber-200">
                        <Meh className="w-3.5 h-3.5 text-amber-600" />
                        中立 ({(score * 100).toFixed(0)}分)
                    </span>
                );
        }
    };

    return (
        <div className="bg-gray-50 min-h-screen pb-24">
            {/* Header */}
            <div className="bg-primary text-white px-4 pt-6 pb-6 sticky top-0 z-30 shadow-md">
                <div className="flex items-center justify-between mb-4">
                    <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-white/10 text-white">
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <h1 className="text-lg font-bold">会话智能与沟通洞察</h1>
                    <button 
                        onClick={() => navigate('/ai/coaching')}
                        className="bg-white/20 hover:bg-white/30 text-white text-xs px-2.5 py-1 rounded-full border border-white/30 flex items-center gap-1"
                    >
                        <Mic className="w-3.5 h-3.5" /> 实时辅导
                    </button>
                </div>

                {/* 筛选 Tab */}
                <div className="flex bg-white/15 p-1 rounded-xl border border-white/20 text-xs">
                    <button
                        onClick={() => setFilterSentiment('all')}
                        className={`flex-1 py-1.5 rounded-lg font-medium transition-all ${filterSentiment === 'all' ? 'bg-white text-primary font-bold shadow-sm' : 'text-white/80'}`}
                    >
                        全部会话
                    </button>
                    <button
                        onClick={() => setFilterSentiment('positive')}
                        className={`flex-1 py-1.5 rounded-lg font-medium transition-all ${filterSentiment === 'positive' ? 'bg-white text-primary font-bold shadow-sm' : 'text-white/80'}`}
                    >
                        积极意向
                    </button>
                    <button
                        onClick={() => setFilterSentiment('neutral')}
                        className={`flex-1 py-1.5 rounded-lg font-medium transition-all ${filterSentiment === 'neutral' ? 'bg-white text-primary font-bold shadow-sm' : 'text-white/80'}`}
                    >
                        中立观望
                    </button>
                </div>
            </div>

            {/* List */}
            <div className="p-4 space-y-3">
                <div className="flex items-center justify-between text-xs text-gray-500 px-1">
                    <span>已完成 AI 结构化分析 ({conversations.length})</span>
                    <span>支持电话/会议录音自动转录</span>
                </div>

                {loading ? (
                    <div className="text-center py-12 text-gray-400 text-sm">加载会话智能分析中...</div>
                ) : conversations.length === 0 ? (
                    <div className="bg-white rounded-2xl p-8 text-center border border-gray-100 text-gray-400">
                        <Headphones className="w-12 h-12 mx-auto text-gray-300 mb-2" />
                        暂无沟通会话记录
                    </div>
                ) : (
                    conversations.map((conv) => (
                        <div
                            key={conv.id}
                            onClick={() => navigate(`/ai/conversations/${conv.id}`)}
                            className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200 hover:border-emerald-400/40 transition-all cursor-pointer space-y-2.5"
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center">
                                        <PhoneCall className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-sm text-gray-900">{conv.customerName}</h3>
                                        <span className="text-[11px] text-gray-400">跟进销售: {conv.salesName} · {Math.floor(conv.durationSeconds / 60)} 分钟</span>
                                    </div>
                                </div>
                                {getSentimentBadge(conv.sentiment, conv.sentimentScore)}
                            </div>

                            <div className="bg-gray-50 rounded-xl p-3 text-xs text-gray-700 leading-relaxed border border-gray-100">
                                <span className="font-semibold text-emerald-700 mr-1">AI 沟通摘要:</span>
                                {conv.summary}
                            </div>

                            <div className="flex items-center justify-between text-xs text-gray-400 pt-1">
                                <span className="flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {conv.createdAt ? conv.createdAt.substring(0, 16) : '刚刚'}
                                </span>
                                <span className="text-emerald-700 font-semibold flex items-center gap-0.5 hover:underline">
                                    查看完整转录与情绪曲线 <ChevronRight className="w-3.5 h-3.5" />
                                </span>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default AIConversations;
