import React, { useState, useEffect } from 'react';
import { Button, Tag, Empty, Progress } from 'antd';
import { ArrowLeft, Users, Trophy, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getSalesPersonRanking } from '@/services/analytics';

export const TeamPerformancePage: React.FC = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [reps, setReps] = useState<any[]>([]);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const res: any = await getSalesPersonRanking({ limit: 20 });
            const data = res?.data || res;
            if (Array.isArray(data)) {
                setReps(data);
            } else {
                setReps([]);
            }
        } catch (error) {
            console.error('Failed to load team performance', error);
            setReps([]);
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
                        团队销售绩效排行
                    </h1>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        全量统计每位销售顾问的成单业绩、赢单率与目标达成进度（真实后端数据）
                    </p>
                </div>
            </div>

            <div className="p-6 rounded-3xl bg-white dark:bg-[#111622] border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
                <h3 className="text-base font-black text-slate-900 dark:text-white">销售代表个人业绩档案</h3>
                {reps.length === 0 ? (
                    <Empty description="暂无销售人员业绩排名数据" className="py-12" />
                ) : (
                    <div className="space-y-3">
                        {reps.map((r, i) => (
                            <div key={i} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 font-bold text-xs flex items-center justify-center">{i + 1}</span>
                                    <div>
                                        <div className="font-bold text-xs text-slate-900 dark:text-white">{r.userName || r.realName || r.name}</div>
                                        <div className="text-[11px] text-slate-400">成交单数：{r.orderCount || r.dealCount || 0} 单</div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-sm font-black text-blue-600 font-mono">{r.salesAmount ? `¥ ${Number(r.salesAmount).toLocaleString()}` : (r.amount || '¥ 0')}</div>
                                    <div className="text-[10px] text-slate-400">达成率：{r.targetRate ? `${r.targetRate}%` : '0%'}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default TeamPerformancePage;
