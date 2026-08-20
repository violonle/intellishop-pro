import React, { useState, useEffect } from 'react';
import { Button, Tag, Empty, Progress } from 'antd';
import { ArrowLeft, AlertTriangle, ShieldCheck, Activity } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getPipelineHealth } from '@/services/analytics';

export const PipelineHealthPage: React.FC = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [healthScore, setHealthScore] = useState<number>(0);
    const [stages, setStages] = useState<any[]>([]);
    const [alerts, setAlerts] = useState<any[]>([]);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const res: any = await getPipelineHealth();
            const data = res?.data || res;
            if (data) {
                setHealthScore(Number(data.score || data.healthScore || 0));
                setStages(data.stages || []);
                setAlerts(data.alerts || data.bottlenecks || []);
            } else {
                setHealthScore(0);
                setStages([]);
                setAlerts([]);
            }
        } catch (error) {
            console.error('Failed to load pipeline health', error);
            setHealthScore(0);
            setStages([]);
            setAlerts([]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6 animate-fade-in font-sans">
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
                        销售管道健康度分析
                    </h1>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        多维评估商机管道停滞风险、流转速率与成单健康指数（真实后端数据）
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-6 rounded-3xl bg-white dark:bg-[#111622] border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between">
                    <div>
                        <div className="text-xs text-slate-400 font-semibold">综合管道健康评分</div>
                        <div className="text-4xl font-black text-blue-600 font-mono mt-2">{healthScore} <span className="text-base text-slate-400">/ 100</span></div>
                        <p className="text-xs text-slate-500 mt-2">基于成单周期、阶段停滞时长与推进活动量加权计算</p>
                    </div>
                    <div className="pt-4 border-t border-slate-100 dark:border-slate-800 mt-4">
                        <Tag color={healthScore >= 80 ? 'green' : healthScore >= 60 ? 'blue' : 'orange'} className="font-bold !rounded-md">
                            {healthScore >= 80 ? '健康管道' : healthScore >= 60 ? '中度正常' : '需重点关注'}
                        </Tag>
                    </div>
                </div>

                <div className="md:col-span-2 p-6 rounded-3xl bg-white dark:bg-[#111622] border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
                    <h3 className="text-base font-black text-slate-900 dark:text-white">管道瓶颈与风险预警</h3>
                    {alerts.length === 0 ? (
                        <Empty description="管道各阶段流转顺畅，暂无瓶颈阻塞预警" className="py-8" />
                    ) : (
                        <div className="space-y-2">
                            {alerts.map((a, i) => (
                                <div key={i} className="p-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-200 text-xs flex items-center justify-between">
                                    <span>{a.title || a.message || a}</span>
                                    <Tag color="orange" className="!rounded-md">待解决</Tag>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PipelineHealthPage;
