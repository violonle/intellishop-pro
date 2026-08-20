import React, { useState, useEffect } from 'react';
import { Button, Select, Tag, Empty, Spin } from 'antd';
import { Download, AlertTriangle, Users, FileText, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getSalesFunnelAnalysis } from '@/services/analytics';

export const FunnelAnalysisPage: React.FC = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [funnelStages, setFunnelStages] = useState<any[]>([]);
    const [metrics, setMetrics] = useState({
        totalLeads: 0,
        proposalCount: 0,
        dealCount: 0,
        overallRate: '0.0%'
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const res: any = await getSalesFunnelAnalysis();
            const data = res?.data || res;
            if (data && data.stages) {
                setFunnelStages(data.stages);
                setMetrics({
                    totalLeads: data.totalLeads || 0,
                    proposalCount: data.proposalCount || 0,
                    dealCount: data.dealCount || 0,
                    overallRate: data.overallConversionRate ? `${(Number(data.overallConversionRate) * 100).toFixed(1)}%` : '0.0%'
                });
            } else if (Array.isArray(data)) {
                setFunnelStages(data);
            } else {
                setFunnelStages([]);
            }
        } catch (error) {
            console.error('Failed to load funnel data', error);
            setFunnelStages([]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6 animate-fade-in font-sans">
            {/* 顶栏 */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={() => navigate('/analytics/overview')}
                        className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-blue-600 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                            销售漏斗分析
                        </h1>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            分析每个销售阶段的转化效率与流失原因（真实后端数据）
                        </p>
                    </div>
                </div>
            </div>

            {/* 4 大核心指标 */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-5 rounded-3xl bg-white dark:bg-[#111622] border border-slate-200/80 dark:border-slate-800 shadow-xs">
                    <div className="text-xs text-slate-400">当前线索总量</div>
                    <div className="text-xl font-black text-slate-900 dark:text-white font-mono mt-0.5">{metrics.totalLeads}</div>
                </div>
                <div className="p-5 rounded-3xl bg-white dark:bg-[#111622] border border-slate-200/80 dark:border-slate-800 shadow-xs">
                    <div className="text-xs text-slate-400">进入报价阶段</div>
                    <div className="text-xl font-black text-slate-900 dark:text-white font-mono mt-0.5">{metrics.proposalCount}</div>
                </div>
                <div className="p-5 rounded-3xl bg-white dark:bg-[#111622] border border-slate-200/80 dark:border-slate-800 shadow-xs">
                    <div className="text-xs text-slate-400">最终成交单数</div>
                    <div className="text-xl font-black text-slate-900 dark:text-white font-mono mt-0.5">{metrics.dealCount}</div>
                </div>
                <div className="p-5 rounded-3xl bg-white dark:bg-[#111622] border border-slate-200/80 dark:border-slate-800 shadow-xs">
                    <div className="text-xs text-slate-400">端到端总转化率</div>
                    <div className="text-xl font-black text-blue-600 font-mono mt-0.5">{metrics.overallRate}</div>
                </div>
            </div>

            {/* 漏斗数据表格 */}
            <div className="p-6 rounded-3xl bg-white dark:bg-[#111622] border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
                <h3 className="text-base font-black text-slate-900 dark:text-white">漏斗各阶段流转表现</h3>
                {funnelStages.length === 0 ? (
                    <Empty description="暂无销售漏斗阶段转化数据" className="py-12" />
                ) : (
                    <div className="space-y-3">
                        {funnelStages.map((s, i) => (
                            <div key={i} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 flex items-center justify-between">
                                <div className="font-bold text-xs text-slate-800 dark:text-slate-200">{s.stage || s.name}</div>
                                <div className="text-xs text-blue-600 font-bold">数量: {s.current || s.count || 0}</div>
                                <div className="text-xs text-slate-500">转化率: {s.rate || s.conversionRate || '0%'}</div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default FunnelAnalysisPage;
