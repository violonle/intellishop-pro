import React, { useState, useEffect } from 'react';
import { Button, Tag, Empty, Progress } from 'antd';
import { Bot, TrendingUp, DollarSign } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { agentService } from '@/services/agent';
import { getSalesAgentLabel, getSalesAgentTooltip } from '@/config/salesAgents';

export const RevenueAgentPage: React.FC = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [revData, setRevData] = useState<any>({
        predictedRevenue: '¥ 0',
        confidenceScore: 0,
        riskDeals: []
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [dashboardResult, riskResult] = await Promise.allSettled([
                agentService.getRevenueDashboard(),
                agentService.getAtRiskDeals()
            ]);
            const data: any = dashboardResult.status === 'fulfilled'
                ? ((dashboardResult.value as any)?.data || dashboardResult.value)
                : null;
            const riskResponse: any = riskResult.status === 'fulfilled' ? riskResult.value : [];
            const riskDeals = Array.isArray(riskResponse)
                ? riskResponse
                : (riskResponse?.data || riskResponse?.records || []);

            if (data || riskDeals.length > 0) {
                const rawConfidence = Number(data?.confidenceScore ?? data?.winRate ?? 0);
                const confidenceScore = rawConfidence > 0 && rawConfidence <= 1
                    ? rawConfidence * 100
                    : rawConfidence;
                const predictedRevenue = data?.predictedRevenue
                    ?? data?.predictedQuarterRevenue
                    ?? data?.pipelineValue
                    ?? 0;
                setRevData({
                    predictedRevenue: `¥ ${Number(predictedRevenue).toLocaleString()}`,
                    confidenceScore,
                    riskDeals
                });
            }
        } catch {
            setRevData({
                predictedRevenue: '¥ 0',
                confidenceScore: 0,
                riskDeals: []
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6 animate-fade-in font-sans">
            <div className="flex items-center gap-3">
                <TrendingUp className="w-10 h-10 text-emerald-600 dark:text-emerald-400 flex-shrink-0" strokeWidth={2.2} />
                <div>
                    <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white" title={getSalesAgentTooltip('revenue')}>
                        {getSalesAgentLabel('revenue')}
                    </h1>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        基于蒙特卡洛算法的季度业绩概率预测与丢单归因分析（真实后端数据）
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 rounded-3xl bg-white dark:bg-[#111622] border border-slate-200/80 dark:border-slate-800 shadow-xs">
                    <div className="text-xs text-slate-400 font-semibold">RFA 本季度预计达成营收</div>
                    <div className="text-3xl font-black text-slate-900 dark:text-white font-mono mt-2">{revData.predictedRevenue}</div>
                    <div className="mt-4">
                        <div className="text-xs text-slate-400 mb-1">模型置信度</div>
                        <Progress percent={revData.confidenceScore} status="active" strokeColor="#10B981" />
                    </div>
                </div>

                <div className="p-6 rounded-3xl bg-white dark:bg-[#111622] border border-slate-200/80 dark:border-slate-800 shadow-xs">
                    <h3 className="text-base font-black text-slate-900 dark:text-white mb-3">
                        RFA 关键成单风险归因（{revData.riskDeals.length}）
                    </h3>
                    {revData.riskDeals.length === 0 ? (
                        <Empty description="暂无关键丢单风险商机" className="py-6" />
                    ) : (
                        <div className="space-y-2">
                            {revData.riskDeals.map((d: any, i: number) => (
                                <div key={i} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 text-xs">
                                    <div className="flex justify-between gap-3">
                                        <span className="font-medium">{d.title || d.name || d.dealName || '风险商机'}</span>
                                        <span className="text-rose-600 font-bold">{d.risk || d.riskLevel || 'MEDIUM'}</span>
                                    </div>
                                    {(d.riskReason || d.stage) && (
                                        <div className="mt-1 text-slate-500">{d.riskReason || `当前阶段：${d.stage}`}</div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default RevenueAgentPage;
