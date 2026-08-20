import React, { useState, useEffect } from 'react';
import { Button, Tag, Empty, message } from 'antd';
import { Bot, GraduationCap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { agentService } from '@/services/agent';
import { getSalesAgentLabel, getSalesAgentTooltip } from '@/config/salesAgents';

export const CoachAgentPage: React.FC = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [coachCases, setCoachCases] = useState<any[]>([]);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const res: any = await agentService.getTasks({ agentType: 'coach' });
            const data = res?.data || res;
            if (Array.isArray(data)) {
                setCoachCases(data);
            } else {
                setCoachCases([]);
            }
        } catch {
            setCoachCases([]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6 animate-fade-in font-sans">
            <div className="flex items-center gap-3">
                <GraduationCap className="w-10 h-10 text-indigo-600 dark:text-indigo-400 flex-shrink-0" strokeWidth={2.2} />
                <div>
                    <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white" title={getSalesAgentTooltip('coach')}>
                        {getSalesAgentLabel('coach')}
                    </h1>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        销冠话术萃取、销售沟通过程质检与停滞商机辅导（真实后端数据）
                    </p>
                </div>
            </div>

            <div className="p-6 rounded-3xl bg-white dark:bg-[#111622] border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
                <h3 className="text-base font-black text-slate-900 dark:text-white">SCA 销售教练实战指导任务</h3>
                {coachCases.length === 0 ? (
                    <Empty description="当前团队销售沟通过程健康，暂无质检辅导待办" className="py-12" />
                ) : (
                    <div className="space-y-3">
                        {coachCases.map((c) => (
                            <div key={c.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 space-y-1.5">
                                <div className="font-bold text-xs text-slate-900 dark:text-white">{c.taskTitle || c.customerName}</div>
                                <div className="text-xs text-slate-500">{c.reason}</div>
                                <div className="text-xs text-indigo-600 font-medium">💡 教练建议：{c.proposedAction}</div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default CoachAgentPage;
