import React, { useState, useEffect } from 'react';
import { Button, Tag, Empty, Progress } from 'antd';
import { ArrowLeft, PhoneCall, Video, MessageSquare, Award } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getSalesBehaviorAnalysis } from '@/services/analytics';

export const SalesBehaviorPage: React.FC = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [behaviorRank, setBehaviorRank] = useState<any[]>([]);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const res: any = await getSalesBehaviorAnalysis();
            const data = res?.data || res;
            if (Array.isArray(data)) {
                setBehaviorRank(data);
            } else if (data && data.rankings) {
                setBehaviorRank(data.rankings);
            } else {
                setBehaviorRank([]);
            }
        } catch (error) {
            console.error('Failed to load sales behavior', error);
            setBehaviorRank([]);
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
                        销售行为深度分析
                    </h1>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        量化电话跟进量、拜访会议、微信触达与有效客户互动频率（真实后端数据）
                    </p>
                </div>
            </div>

            <div className="p-6 rounded-3xl bg-white dark:bg-[#111622] border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
                <h3 className="text-base font-black text-slate-900 dark:text-white">团队销售代表跟进活动量</h3>
                {behaviorRank.length === 0 ? (
                    <Empty description="暂无销售人员日常行为跟进统计数据" className="py-12" />
                ) : (
                    <div className="space-y-3">
                        {behaviorRank.map((item, i) => (
                            <div key={i} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 flex items-center justify-between">
                                <div className="font-bold text-xs text-slate-800 dark:text-slate-200">{item.name || item.realName}</div>
                                <div className="text-xs text-slate-500">通话: {item.calls || 0}次 · 会议: {item.meetings || 0}场</div>
                                <div className="text-xs text-blue-600 font-bold">综合活跃度: {item.score || 0}分</div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default SalesBehaviorPage;
