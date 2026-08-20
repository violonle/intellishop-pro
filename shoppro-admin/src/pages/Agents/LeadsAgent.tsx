import React, { useState, useEffect } from 'react';
import { Button, Tag, Switch, message, Progress, Empty } from 'antd';
import { Target, Bot, Zap, Clock, TrendingUp, CheckCircle2, Play, Pause, ArrowRight, MessageSquare, Send } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { agentService } from '@/services/agent';
import { getSalesAgentLabel, getSalesAgentTooltip } from '@/config/salesAgents';

export const LeadsAgentPage: React.FC = () => {
    const navigate = useNavigate();
    const [autoMode, setAutoMode] = useState(true);
    const [loading, setLoading] = useState(false);
    const [highIntentLeads, setHighIntentLeads] = useState<any[]>([]);

    useEffect(() => {
        loadAgentData();
    }, []);

    const loadAgentData = async () => {
        setLoading(true);
        try {
            const res: any = await agentService.getTasks({ agentType: 'sdr' });
            const data = res?.data || res;
            if (Array.isArray(data) && data.length > 0) {
                const mapped = data.map((item: any) => ({
                    id: item.id,
                    name: item.customerName || item.targetName || item.taskTitle || item.title || '待处理线索任务',
                    intent: item.confidenceScore != null
                        ? `成单概率 ${item.confidenceScore}%`
                        : (item.status === 'pending' ? '待确认方案' : '已生成方案'),
                    budget: item.reason || item.generatedContent || item.description || '暂无任务说明',
                    signal: item.reason || item.title || item.generatedContent || '暂无行为信号说明',
                    aiAction: item.proposedAction || item.generatedContent || '暂无执行方案'
                }));
                setHighIntentLeads(mapped);
            } else {
                setHighIntentLeads([]);
            }
        } catch (e) {
            console.error('Failed to load SDR agent tasks', e);
            setHighIntentLeads([]);
        } finally {
            setLoading(false);
        }
    };

    const handleRunAnalysis = async () => {
        setLoading(true);
        try {
            await loadAgentData();
            message.success('已刷新 SDR 任务列表');
        } catch {
            message.error('SDR 任务刷新失败');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6 animate-fade-in font-sans">
            {/* 顶栏 */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-3">
                    <Bot className="w-10 h-10 text-blue-600 dark:text-blue-400 flex-shrink-0" strokeWidth={2.2} />
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white" title={getSalesAgentTooltip('sdr')}>
                                {getSalesAgentLabel('sdr')}
                            </h1>
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200/80">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                24/7 运行中
                            </span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            秒级意图识别、首触自动化话术生成与智能线索分级调度（真实后端对接）
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <Button
                        type="primary"
                        icon={<Target className="w-3.5 h-3.5" />}
                        onClick={handleRunAnalysis}
                        loading={loading}
                        className="!rounded-xl !bg-blue-600 hover:!bg-blue-700 !text-xs !h-9 font-bold"
                    >
                        立即运行全网意图扫描
                    </Button>
                </div>
            </div>

            {/* 智能体任务卡片列表 */}
            <div className="p-6 rounded-3xl bg-white dark:bg-[#111622] border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
                <h3 className="text-base font-black text-slate-900 dark:text-white">SDR 识别的高意向商机信号</h3>
                {highIntentLeads.length === 0 ? (
                    <Empty description="暂无新生成的 SDR 高意向推荐，点击右上角【立即运行全网意图扫描】即可触发分析" className="py-12" />
                ) : (
                    <div className="space-y-4">
                        {highIntentLeads.map((item) => (
                            <div key={item.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-2">
                                <div className="flex items-center justify-between">
                                    <div className="font-bold text-xs text-slate-900 dark:text-white">{item.name}</div>
                                    <Tag color="green" className="!rounded-md font-bold">{item.intent}</Tag>
                                </div>
                                <div className="text-xs text-slate-600 dark:text-slate-300">💡 行为信号：{item.signal}</div>
                                <div className="text-xs text-blue-600 font-medium">🤖 AI 建议动作：{item.aiAction}</div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default LeadsAgentPage;
