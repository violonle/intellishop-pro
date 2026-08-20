import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Radio,
    ArrowLeft,
    FileText,
    Clock,
    UserCheck,
    Globe,
    CheckCircle2,
    ChevronRight
} from 'lucide-react';

interface SignalItem {
    id: number;
    signalType: string;
    title: string;
    description: string;
    targetType: string;
    targetName: string;
    priority: string;
    recommendedAction: string;
    isHandled: number;
    createdAt: string;
}

const AISignals: React.FC = () => {
    const navigate = useNavigate();
    const [signals, setSignals] = useState<SignalItem[]>([]);
    const [stats, setStats] = useState<any>({});
    const [filterType] = useState('all');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadData();
    }, [filterType]);

    const loadData = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('auth_token') || localStorage.getItem('token') || '';
            const [sigRes, statRes] = await Promise.all([
                fetch(`/api/ai/signals?signalType=${filterType}`, { headers: { 'Authorization': `Bearer ${token}` } }),
                fetch('/api/ai/signals/stats', { headers: { 'Authorization': `Bearer ${token}` } })
            ]);
            const sigJson = await sigRes.json();
            const statJson = await statRes.json();
            if (sigJson.data) setSignals(sigJson.data);
            if (statJson.data) setStats(statJson.data);
        } catch (e) {
            console.error('Failed to load signals', e);
        } finally {
            setLoading(false);
        }
    };

    const handleMarkHandled = async (id: number, e: React.MouseEvent) => {
        e.stopPropagation();
        try {
            const token = localStorage.getItem('auth_token') || localStorage.getItem('token') || '';
            await fetch(`/api/ai/signals/${id}/handle`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            loadData();
        } catch (err) {
            console.error(err);
        }
    };

    const getSignalIcon = (type: string) => {
        switch (type) {
            case 'quote_viewed': return <FileText className="w-4 h-4 text-blue-600" />;
            case 'contact_changed': return <UserCheck className="w-4 h-4 text-emerald-600" />;
            case 'silence_timeout': return <Clock className="w-4 h-4 text-amber-600" />;
            default: return <Globe className="w-4 h-4 text-purple-600" />;
        }
    };

    const getPriorityBadge = (p: string) => {
        switch (p) {
            case 'high': return <span className="bg-red-50 text-red-600 text-[10px] font-bold px-2 py-0.5 rounded-full border border-red-200">高优先级</span>;
            case 'medium': return <span className="bg-amber-50 text-amber-600 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-200">中优先级</span>;
            default: return <span className="bg-blue-50 text-blue-600 text-[10px] font-bold px-2 py-0.5 rounded-full border border-blue-200">低优先级</span>;
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
                    <h1 className="text-lg font-bold">智能信号流中心</h1>
                    <div className="w-8"></div>
                </div>

                {/* 统计横幅 */}
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="bg-white/15 rounded-xl p-2.5 backdrop-blur-sm border border-white/20">
                        <div className="text-blue-100 text-[11px]">捕获信号总量</div>
                        <div className="font-bold text-base text-white mt-0.5">{stats.totalSignals ?? 0}</div>
                    </div>
                    <div className="bg-white/15 rounded-xl p-2.5 backdrop-blur-sm border border-white/20">
                        <div className="text-blue-100 text-[11px]">待处理高优</div>
                        <div className="font-bold text-base text-amber-300 mt-0.5">{stats.highPriorityUnhandled ?? 0}</div>
                    </div>
                    <div className="bg-white/15 rounded-xl p-2.5 backdrop-blur-sm border border-white/20">
                        <div className="text-blue-100 text-[11px]">信号响应时效</div>
                        <div className="font-bold text-base text-green-300 mt-0.5">
                            {stats.averageResponseMinutes == null ? '暂无数据' : `${stats.averageResponseMinutes}分钟`}
                        </div>
                    </div>
                </div>
            </div>

            {/* List */}
            <div className="p-4 space-y-3">
                <div className="flex items-center justify-between text-xs text-gray-500 px-1">
                    <span className="font-bold text-gray-700">实时信号推送动态 ({signals.length})</span>
                    <span>行为驱动 · 自动触发 SOP</span>
                </div>

                {loading ? (
                    <div className="text-center py-12 text-gray-400 text-sm">加载智能信号中...</div>
                ) : signals.length === 0 ? (
                    <div className="bg-white rounded-2xl p-8 text-center border border-gray-100 text-gray-400">
                        <Radio className="w-12 h-12 mx-auto text-gray-300 mb-2" />
                        暂无新的业务行为信号
                    </div>
                ) : (
                    signals.map((sig) => (
                        <div
                            key={sig.id}
                            onClick={() => navigate(`/ai/signals/${sig.id}`)}
                            className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200 hover:border-rose-400/40 transition-all cursor-pointer space-y-2.5"
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-7 h-7 rounded-lg bg-rose-50 flex items-center justify-center">
                                        {getSignalIcon(sig.signalType)}
                                    </div>
                                    <h3 className="font-bold text-sm text-gray-900">{sig.title}</h3>
                                </div>
                                {getPriorityBadge(sig.priority)}
                            </div>

                            <p className="text-xs text-gray-600 leading-relaxed">{sig.description}</p>

                            <div className="bg-rose-50/60 rounded-xl p-2.5 text-xs text-rose-800 flex items-center justify-between border border-rose-100">
                                <span>🎯 <strong>建议行动:</strong> {sig.recommendedAction}</span>
                                {sig.isHandled === 0 ? (
                                    <button
                                        onClick={(e) => handleMarkHandled(sig.id, e)}
                                        className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold whitespace-nowrap shadow-sm ml-2"
                                    >
                                        处理信号
                                    </button>
                                ) : (
                                    <span className="text-green-600 font-bold flex items-center gap-0.5 text-xs ml-2">
                                        <CheckCircle2 className="w-3.5 h-3.5" /> 已跟进
                                    </span>
                                )}
                            </div>

                            <div className="flex items-center justify-between text-[11px] text-gray-400 pt-1">
                                <span>关联客户: <strong className="text-gray-700">{sig.targetName}</strong></span>
                                <span className="flex items-center gap-0.5 text-rose-600 font-semibold">
                                    详情 <ChevronRight className="w-3 h-3" />
                                </span>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default AISignals;
