import React, { useState, useEffect } from 'react';
import { Button, Tag, Empty } from 'antd';
import { Bot, Send } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { agentService } from '@/services/agent';
import { getSalesAgentLabel, getSalesAgentTooltip } from '@/config/salesAgents';

export const MarketingAgentPage: React.FC = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [campaigns, setCampaigns] = useState<any[]>([]);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const res: any = await agentService.getTasks({ agentType: 'marketing' });
            const data = res?.data || res;
            if (Array.isArray(data)) {
                setCampaigns(data);
            } else {
                setCampaigns([]);
            }
        } catch {
            setCampaigns([]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6 animate-fade-in font-sans">
            <div className="flex items-center gap-3">
                <Send className="w-10 h-10 text-amber-600 dark:text-amber-400 flex-shrink-0" strokeWidth={2.2} />
                <div>
                    <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white" title={getSalesAgentTooltip('marketing')}>
                        {getSalesAgentLabel('marketing')}
                    </h1>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        全域自动化内容分发、节假日私域激活与沉默线索复活（真实后端数据）
                    </p>
                </div>
            </div>

            <div className="p-6 rounded-3xl bg-white dark:bg-[#111622] border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
                <h3 className="text-base font-black text-slate-900 dark:text-white">MOA 自动化营销与激活任务</h3>
                {campaigns.length === 0 ? (
                    <Empty description="暂无营销自动化任务待处理" className="py-12" />
                ) : (
                    <div className="space-y-3">
                        {campaigns.map((c) => (
                            <div key={c.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 space-y-1.5">
                                <div className="font-bold text-xs text-slate-900 dark:text-white">{c.taskTitle}</div>
                                <div className="text-xs text-slate-500">{c.reason}</div>
                                <div className="text-xs text-amber-600 font-medium">🎯 营销动作：{c.proposedAction}</div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MarketingAgentPage;
