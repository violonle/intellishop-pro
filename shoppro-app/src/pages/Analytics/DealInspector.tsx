import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    Sparkles,
    Zap
} from 'lucide-react';

const DealInspector: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [deal, setDeal] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadDeal();
    }, [id]);

    const loadDeal = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('auth_token') || localStorage.getItem('token') || '';
            const res = await fetch(`/api/ai/revenue/deals/${id || 1}/inspect`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const json = await res.json();
            if (json.data) setDeal(json.data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    if (loading || !deal) {
        return <div className="p-8 text-center text-gray-400">正在生成商机 AI 诊断报告...</div>;
    }

    return (
        <div className="bg-gray-50 min-h-screen pb-24">
            {/* Header */}
            <div className="bg-white px-4 py-4 border-b border-gray-200 sticky top-0 z-30 flex items-center justify-between">
                <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-gray-100 text-gray-600">
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <h1 className="text-base font-bold text-gray-900">商机 AI 深度诊断报告</h1>
                <div className="w-8"></div>
            </div>

            <div className="p-4 space-y-4">
                {/* 诊断概览 */}
                <div className="bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-2xl p-5 shadow-lg space-y-2">
                    <div className="text-xs text-amber-100 font-medium">{deal.dealName}</div>
                    <div className="flex items-baseline justify-between pt-1">
                        <div>
                            <span className="text-3xl font-bold font-mono">{(deal.currentWinRate * 100).toFixed(0)}%</span>
                            <span className="text-xs text-amber-200 ml-1">当前胜率估算</span>
                        </div>
                        <span className="bg-white/20 text-xs px-2.5 py-1 rounded-full border border-white/30">
                            高价值攻坚商机
                        </span>
                    </div>
                </div>

                {/* 优势与卡点归因 */}
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-200 space-y-3">
                    <h3 className="font-bold text-sm text-gray-900 flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-amber-600" />
                        AI 多因子归因分析
                    </h3>

                    <div className="space-y-2 text-xs">
                        <div className="p-3 bg-green-50 text-green-800 rounded-xl border border-green-100">
                            <span className="font-bold">优势因子：</span>
                            {deal.strengths?.join('，')}
                        </div>
                        <div className="p-3 bg-red-50 text-red-800 rounded-xl border border-red-100">
                            <span className="font-bold">主要风险：</span>
                            {deal.weaknesses?.join('，')}
                        </div>
                    </div>
                </div>

                {/* 下一步最佳行动 (Next Best Actions) */}
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-200 space-y-3">
                    <h3 className="font-bold text-sm text-gray-900 flex items-center gap-1.5">
                        <Zap className="w-4 h-4 text-primary" />
                        AI 推荐下一步促成动作 (Next Best Actions)
                    </h3>

                    <div className="space-y-2">
                        {deal.nextBestActions?.map((action: string, i: number) => (
                            <div key={i} className="flex items-start gap-2.5 p-3 rounded-xl bg-gray-50 border border-gray-100 text-xs text-gray-800">
                                <span className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs mt-0.5">
                                    {i + 1}
                                </span>
                                <span className="flex-1 leading-relaxed font-medium">{action}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DealInspector;
