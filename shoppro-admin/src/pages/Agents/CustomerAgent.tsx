import React, { useState, useEffect } from 'react';
import { Button, Tag, Empty, message } from 'antd';
import { Bot, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { agentService } from '@/services/agent';
import { getSalesAgentLabel, getSalesAgentTooltip } from '@/config/salesAgents';

export const CustomerAgentPage: React.FC = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [insights, setInsights] = useState<any[]>([]);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const res: any = await agentService.getTasks({ agentType: 'customer' });
            const data = res?.data || res;
            if (Array.isArray(data)) {
                setInsights(data);
            } else {
                setInsights([]);
            }
        } catch {
            setInsights([]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6 animate-fade-in font-sans">
            <div className="flex items-center gap-3">
                <Bot className="w-10 h-10 text-cyan-600 dark:text-cyan-400 flex-shrink-0" strokeWidth={2.2} />
                <div>
                    <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white" title={getSalesAgentTooltip('customer')}>
                        {getSalesAgentLabel('customer')}
                    </h1>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        全量多源沟通对话分析、隐性需求挖掘与组织决策链路图谱（真实后端数据）
                    </p>
                </div>
            </div>

            <div className="p-6 rounded-3xl bg-white dark:bg-[#111622] border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
                <h3 className="text-base font-black text-slate-900 dark:text-white">CPI 深度画像洞察案例库</h3>
                {insights.length === 0 ? (
                    <Empty description="暂无新的客户画像洞察生成" className="py-12" />
                ) : (
                    <div className="space-y-3">
                        {insights.map((item) => (
                            <div key={item.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 space-y-1.5">
                                <div className="font-bold text-xs text-slate-900 dark:text-white">{item.customerName || item.taskTitle}</div>
                                <div className="text-xs text-slate-500">{item.reason || item.description}</div>
                                <div className="text-xs text-cyan-600 font-medium">建议方案：{item.proposedAction}</div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default CustomerAgentPage;
