import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    Activity,
    AlertTriangle,
    ChevronRight,
    ArrowUpRight
} from 'lucide-react';

const RevenueIntelligence: React.FC = () => {
    const navigate = useNavigate();
    const [dashboard, setDashboard] = useState<any>(null);
    const [pipeline, setPipeline] = useState<any>(null);
    const [atRiskDeals, setAtRiskDeals] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('auth_token') || localStorage.getItem('token') || '';
            const [dashRes, pipeRes, dealsRes] = await Promise.all([
                fetch('/api/ai/revenue/dashboard', { headers: { 'Authorization': `Bearer ${token}` } }),
                fetch('/api/ai/revenue/pipeline', { headers: { 'Authorization': `Bearer ${token}` } }),
                fetch('/api/ai/revenue/deals/at-risk', { headers: { 'Authorization': `Bearer ${token}` } })
            ]);
            const dashJson = await dashRes.json();
            const pipeJson = await pipeRes.json();
            const dealsJson = await dealsRes.json();
            if (dashJson.data) setDashboard(dashJson.data);
            if (pipeJson.data) setPipeline(pipeJson.data);
            if (dealsJson.data) setAtRiskDeals(dealsJson.data);
        } catch (e) {
            console.error('Failed to load revenue data', e);
        } finally {
            setLoading(false);
        }
    };

    if (loading || !dashboard) {
        return <div className="p-8 text-center text-gray-400">加载收入运营引擎中...</div>;
    }

    return (
        <div className="bg-gray-50 min-h-screen pb-24">
            {/* Header */}
            <div className="bg-primary text-white px-4 pt-6 pb-6 sticky top-0 z-30 shadow-md">
                <div className="flex items-center justify-between mb-4">
                    <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-white/10 text-white">
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <h1 className="text-lg font-bold">收入运营引擎 (Revenue Intel)</h1>
                    <div className="w-8"></div>
                </div>

                {/* 核心指标卡 */}
                <div className="grid grid-cols-2 gap-3 text-white">
                    <div className="bg-white/15 rounded-xl p-3 backdrop-blur-sm border border-white/20">
                        <div className="text-blue-100 text-xs">AI 预测本季营收</div>
                        <div className="text-xl font-bold font-mono mt-1">¥{(dashboard.predictedQuarterRevenue / 10000).toFixed(1)}万</div>
                        <div className="text-[10px] text-blue-200 mt-0.5">置信度 92% · 目标达成率 85%</div>
                    </div>
                    <div className="bg-white/15 rounded-xl p-3 backdrop-blur-sm border border-white/20">
                        <div className="text-blue-100 text-xs">动态成交率 (Win Rate)</div>
                        <div className="text-xl font-bold font-mono mt-1">{(dashboard.winRate * 100).toFixed(1)}%</div>
                        <div className="text-[10px] text-green-300 mt-0.5 flex items-center">
                            <ArrowUpRight className="w-3 h-3" /> 环比上涨 {dashboard.winRateTrend}
                        </div>
                    </div>
                </div>
            </div>

            <div className="p-4 space-y-4">
                {/* 销售管道健康度简报 */}
                <div 
                    onClick={() => navigate('/analytics/pipeline')}
                    className="bg-white rounded-2xl p-5 shadow-sm border border-gray-200 hover:border-amber-400/40 transition-all cursor-pointer space-y-3 group"
                >
                    <div className="flex items-center justify-between">
                        <h3 className="font-bold text-sm text-gray-900 flex items-center gap-1.5">
                            <Activity className="w-4 h-4 text-amber-600" />
                            销售管道健康度 (Pipeline Health)
                        </h3>
                        <span className="text-xs text-amber-600 font-semibold flex items-center group-hover:translate-x-0.5 transition-transform">
                            全流程热力分析 <ChevronRight className="w-3.5 h-3.5" />
                        </span>
                    </div>

                    <div className="space-y-2">
                        {pipeline?.stages?.map((s: any, idx: number) => (
                            <div key={idx} className="space-y-1">
                                <div className="flex justify-between text-xs text-gray-600">
                                    <span className="font-medium">{s.stage} ({s.count}单)</span>
                                    <span>转化率 {(s.conversionRate * 100).toFixed(0)}% · 均留 {s.avgStayDays}天</span>
                                </div>
                                <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden flex">
                                    <div 
                                        className={`h-full rounded-full ${s.isStuck ? 'bg-red-500 animate-pulse' : 'bg-amber-500'}`}
                                        style={{ width: `${s.conversionRate * 100}%` }}
                                    ></div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="p-2.5 bg-red-50 rounded-xl text-xs text-red-800 border border-red-100 flex items-start gap-1.5 mt-2">
                        <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                        <span><strong>瓶颈预警：</strong>{pipeline?.bottleneckReason}</span>
                    </div>
                </div>

                {/* 重点关注风险商机 */}
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-200 space-y-3">
                    <div className="flex items-center justify-between">
                        <h3 className="font-bold text-sm text-gray-900 flex items-center gap-1.5">
                            <AlertTriangle className="w-4 h-4 text-red-500" />
                            卡单停滞与风险商机 ({atRiskDeals.length})
                        </h3>
                    </div>

                    <div className="space-y-2.5">
                        {atRiskDeals.map((deal: any) => (
                            <div
                                key={deal.id}
                                onClick={() => navigate(`/analytics/deals/${deal.id}`)}
                                className="p-3.5 rounded-xl bg-gray-50 hover:bg-amber-50/50 border border-gray-100 hover:border-amber-200 transition-all cursor-pointer space-y-1.5"
                            >
                                <div className="flex justify-between items-center">
                                    <h4 className="font-bold text-xs text-gray-900">{deal.dealName}</h4>
                                    <span className="text-xs font-bold text-amber-700 font-mono">¥{(deal.amount / 10000).toFixed(1)}万</span>
                                </div>
                                <p className="text-[11px] text-gray-500">停滞原因: {deal.riskReason}</p>
                                <div className="flex items-center justify-between text-[11px] pt-1">
                                    <span className="text-red-600 font-medium">阶段已停留 {deal.stayDays} 天</span>
                                    <span className="text-primary font-semibold flex items-center gap-0.5">
                                        AI 深度诊断 <ChevronRight className="w-3 h-3" />
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RevenueIntelligence;
